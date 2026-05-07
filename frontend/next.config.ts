import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://user-management-service-2zr5.onrender.com/api/auth/:path*",
      },
      {
        source: "/api/users/:path*",
        destination: "https://user-management-service-2zr5.onrender.com/api/users/:path*",
      },
      {
        source: "/api/config",
        destination: "https://user-management-service-2zr5.onrender.com/api/config",
      },
      {
        source: "/api/config/:path*",
        destination: "https://user-management-service-2zr5.onrender.com/api/config/:path*",
      },
      {
        source: "/api/startup/profile/:path*",
        destination: "https://user-management-service-2zr5.onrender.com/api/startup/profile/:path*",
      },
      {
        source: "/api/startup/:path*",
        destination: "https://startup-application-service.onrender.com/api/startup/:path*",
      },
      {
        source: "/api/investor/profile/:path*",
        destination: "https://user-management-service-2zr5.onrender.com/api/investor/profile/:path*",
      },
      {
        source: "/api/investor/:path*",
        destination: "https://startup-application-service.onrender.com/api/investor/:path*",
      },
      {
        source: "/api/executions/:path*",
        destination: "https://startup-application-service.onrender.com/api/executions/:path*",
      },
      {
        source: "/api/ai/:path*",
        destination: "https://ai-assessment-service.onrender.com/api/ai/:path*",
      },
      {
        source: "/api/evaluator/profile/:path*",
        destination: "https://user-management-service-2zr5.onrender.com/api/evaluator/profile/:path*",
      },
      {
        source: "/api/evaluator/:path*",
        destination: "https://evaluation-decision-service.onrender.com/api/evaluator/:path*",
      },
      {
        source: "/api/matching/:path*",
        destination: "https://investor-matching-service.onrender.com/api/matching/:path*",
      },
      {
        source: "/api/admin/:path*",
        destination: "https://audit-compliance-service.onrender.com/api/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
