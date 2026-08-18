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
    const toAppointment = "/electronic-appointment";
    const toStatus = "/appointment-status";
    const toEvaluation = "/service-evaluation";
    const toRules = "/appointment-rules";
    return [
      { source: "/book", destination: toAppointment, permanent: true },
      { source: "/my-appointment", destination: toStatus, permanent: true },
      { source: "/feedback", destination: toEvaluation, permanent: true },
      {
        source: "/feedback/:code",
        destination: `${toEvaluation}/:code`,
        permanent: true,
      },
      { source: "/rules", destination: toRules, permanent: true },
      { source: "/process", destination: "/", permanent: true },
      { source: "/reception", destination: "/", permanent: false },
      {
        source: "/reception/book",
        destination: toAppointment,
        permanent: false,
      },
      { source: "/reception/my", destination: toStatus, permanent: false },
      {
        source: "/reception/feedback",
        destination: toEvaluation,
        permanent: false,
      },
      {
        source: "/reception/feedback/:code",
        destination: `${toEvaluation}/:code`,
        permanent: false,
      },
      { source: "/reception/rules", destination: toRules, permanent: false },
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
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
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
