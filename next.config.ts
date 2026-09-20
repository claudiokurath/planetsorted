import type { NextConfig } from "next";

// Who may frame /embed/*. Restricted rather than open: the tools can write to
// Supabase as a signed-in member, so arbitrary framing would invite
// clickjacking. Add a domain here if the Gamma is published to a custom one.
const EMBED_FRAME_ANCESTORS = [
  "'self'",
  "https://gamma.app",
  "https://*.gamma.app",
  "https://gamma.site",
  "https://*.gamma.site",
].join(" ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Required by Dockerfile multi-stage standalone runner
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wyxvbzbqbznqjftbgcxc.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // X-Frame-Options has no "allow this origin" form and takes precedence in
    // browsers that support it, so /embed/* must not receive it at all. Those
    // routes are excluded from the blanket rule and given frame-ancestors
    // instead, which is the CSP equivalent that can name an allowed embedder.
    // Everything else on the site — including the gated standalone pages —
    // keeps X-Frame-Options: DENY.
    return [
      {
        source: "/((?!embed/).*)",
        headers: securityHeaders,
      },
      {
        source: "/embed/:path*",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "X-Frame-Options"),
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${EMBED_FRAME_ANCESTORS};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
