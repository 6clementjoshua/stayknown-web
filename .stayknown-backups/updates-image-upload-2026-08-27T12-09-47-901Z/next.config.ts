/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "stay-known.com",
          },
        ],
        destination: "https://www.stay-known.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob: https://api.mapbox.com https://*.tiles.mapbox.com https://*.mapbox.com https://api.tomtom.com https://*.api.tomtom.com https://*.tomtom.com",
      "font-src 'self' data: https://api.mapbox.com https://api.tomtom.com https://*.tomtom.com",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://api.tomtom.com https://*.tomtom.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://api.mapbox.com https://events.mapbox.com https://api.tomtom.com https://*.tomtom.com",
      "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://*.mapbox.com https://api.tomtom.com https://*.api.tomtom.com https://*.tomtom.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
