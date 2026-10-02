import type { NextConfig } from "next";

/**
 * Baseline security headers.
 *
 * The app handles mental-health journal content and chat messages, so a
 * successful injection would be genuinely harmful — these headers limit what
 * an injected script can reach and stop the site being framed or sniffed.
 */
const securityHeaders = [
  // Don't let any site embed MindCircle in an iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME-type guessing turning a text response into script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (which may carry ids) to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down what the page may ask the browser to do.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Enable HSTS so browsers stop accepting plaintext for this origin.
  // Only meaningful once served over HTTPS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content-Security-Policy.
  // 'unsafe-inline' is required for style-src: Tailwind and Next.js both emit
  // inline styles, and Next injects inline bootstrap scripts.
  //
  // 'unsafe-eval' is allowed in development ONLY — React's dev build uses
  // eval() to reconstruct call stacks, and Next's dev overlay needs it. The
  // production build never evaluates strings, so it stays locked down there.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Supabase auth (Google OAuth) and the webm/media assets we serve.
      `script-src 'self' 'unsafe-inline' https://accounts.google.com${
        process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
      }`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide the Next.js dev tools badge in the corner.
  devIndicators: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;