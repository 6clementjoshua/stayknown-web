export type BillingRegionKind = "nigeria" | "global";

export type BillingCurrencyCode = "NGN" | "USD";

export type BillingProviderName = "Paystack" | "Flutterwave";

export type BillingRegionSource =
  | "vercel"
  | "cloudflare"
  | "cloudfront"
  | "fastly"
  | "proxy"
  | "ipinfo"
  | "fallback";

export type BillingRegionSnapshot = {
  region: BillingRegionKind;
  countryCode: string;
  countryName: string;
  currencyCode: BillingCurrencyCode;
  provider: BillingProviderName;
  source: BillingRegionSource;
  resolved: boolean;
};
