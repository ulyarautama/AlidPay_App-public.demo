import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const isProductionDeployment =
  process.env.VERCEL_ENV === "production" ||
  process.env.DEPLOYMENT_ENV === "production";

if (isProductionDeployment && !backendUrl.startsWith("https://")) {
  throw new Error("BACKEND_URL wajib berupa URL HTTPS pada deployment production.");
}

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
