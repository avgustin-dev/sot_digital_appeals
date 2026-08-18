import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/reception", destination: "/", permanent: false },
      { source: "/reception/book", destination: "/book", permanent: false },
      {
        source: "/reception/my",
        destination: "/my-appointment",
        permanent: false,
      },
      {
        source: "/reception/feedback",
        destination: "/feedback",
        permanent: false,
      },
      {
        source: "/reception/feedback/:code",
        destination: "/feedback/:code",
        permanent: false,
      },
      { source: "/reception/rules", destination: "/rules", permanent: false },
      { source: "/process", destination: "/", permanent: true },
      { source: "/reception/process", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
