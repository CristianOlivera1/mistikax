import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const supabaseOrigin = (() => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) return "https://*.supabase.co";

  try {
    return new URL(value).origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' blob:${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin}${isProduction ? "" : " ws: wss:"}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
]
  .join("; ")
  .concat(isProduction ? "; upgrade-insecure-requests" : "");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/pages/nosotros",
        destination: "/pages/about",
        permanent: true,
      },
      {
        source: "/pages/envios",
        destination: "/shipping",
        permanent: true,
      },
      {
        source: "/pages/cambios",
        destination: "/pages/returns",
        permanent: true,
      },
      {
        source: "/pages/contacto",
        destination: "/pages/contact",
        permanent: true,
      },
      {
        source: "/pages/privacidad",
        destination: "/pages/privacy",
        permanent: true,
      },
      {
        source: "/pages/terminos-y-condiciones",
        destination: "/pages/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/pages/terminos-del-servicio",
        destination: "/pages/terms-and-conditions",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
