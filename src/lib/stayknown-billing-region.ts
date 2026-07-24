import type {
  BillingRegionSnapshot,
  BillingRegionSource,
} from "@/lib/stayknown-billing-types";

const COUNTRY_HEADERS: readonly {
  name: string;
  source: BillingRegionSource;
}[] = [
  { name: "x-vercel-ip-country", source: "vercel" },
  { name: "cf-ipcountry", source: "cloudflare" },
  { name: "cloudfront-viewer-country", source: "cloudfront" },
  { name: "fastly-client-country", source: "fastly" },
  { name: "x-country-code", source: "proxy" },
];

function normalizeCountryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase();

  if (!code || !/^[A-Z]{2}$/.test(code)) return null;

  if (
    code === "XX" ||
    code === "ZZ" ||
    code === "T1" ||
    code === "A1" ||
    code === "A2" ||
    code === "AP" ||
    code === "EU"
  ) {
    return null;
  }

  return code;
}

function countryNameFromCode(code: string): string {
  try {
    const displayNames = new Intl.DisplayNames(["en"], {
      type: "region",
    });

    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function snapshotForCountry(
  countryCode: string | null,
  source: BillingRegionSource,
): BillingRegionSnapshot {
  if (countryCode === "NG") {
    return {
      region: "nigeria",
      countryCode: "NG",
      countryName: "Nigeria",
      currencyCode: "NGN",
      provider: "Paystack",
      source,
      resolved: true,
    };
  }

  if (countryCode) {
    return {
      region: "global",
      countryCode,
      countryName: countryNameFromCode(countryCode),
      currencyCode: "USD",
      provider: "Flutterwave",
      source,
      resolved: true,
    };
  }

  return {
    region: "global",
    countryCode: "ZZ",
    countryName: "Global",
    currencyCode: "USD",
    provider: "Flutterwave",
    source: "fallback",
    resolved: false,
  };
}

function stripIpPort(rawValue: string): string {
  const value = rawValue.trim().replace(/^"|"$/g, "");

  if (value.startsWith("[")) {
    const closingBracket = value.indexOf("]");
    return closingBracket > 0 ? value.slice(1, closingBracket) : value;
  }

  const ipv4WithPort = value.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort?.[1]) return ipv4WithPort[1];

  return value;
}

function isUsablePublicIp(value: string): boolean {
  const ip = stripIpPort(value);

  if (!ip || ip.length > 64) return false;

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".").map(Number);

    if (
      parts.length !== 4 ||
      parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
    ) {
      return false;
    }

    const [a, b] = parts;

    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return false;
    }

    return true;
  }

  if (/^[0-9a-f:]+$/i.test(ip) && ip.includes(":")) {
    const normalized = ip.toLowerCase();

    return !(
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return false;
}

function clientIpFromHeaders(headers: Headers): string | null {
  const candidates = [
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const ip = stripIpPort(candidate);
    if (isUsablePublicIp(ip)) return ip;
  }

  return null;
}

async function countryFromIpInfo(headers: Headers): Promise<string | null> {
  const token = process.env.IPINFO_TOKEN?.trim();
  if (!token) return null;

  const ip = clientIpFromHeaders(headers);
  if (!ip) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(
      `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      country?: unknown;
    };

    return normalizeCountryCode(
      typeof payload.country === "string" ? payload.country : null,
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveBillingRegionFromHeaders(
  headers: Headers,
): Promise<BillingRegionSnapshot> {
  for (const candidate of COUNTRY_HEADERS) {
    const countryCode = normalizeCountryCode(headers.get(candidate.name));

    if (countryCode) {
      return snapshotForCountry(countryCode, candidate.source);
    }
  }

  const ipInfoCountry = await countryFromIpInfo(headers);

  if (ipInfoCountry) {
    return snapshotForCountry(ipInfoCountry, "ipinfo");
  }

  return snapshotForCountry(null, "fallback");
}
