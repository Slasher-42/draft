import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8081/api/auth/:path*",
      },
      {
        source: "/api/users/:path*",
        destination: "http://localhost:8081/api/users/:path*",
      },
      {
        source: "/api/config",
        destination: "http://localhost:8081/api/config",
      },
      {
        source: "/api/startup/:path*",
        destination: "http://localhost:8082/api/startup/:path*",
      },
      {
        source: "/api/investor/:path*",
        destination: "http://localhost:8082/api/investor/:path*",
      },
      {
        source: "/api/executions/:path*",
        destination: "http://localhost:8082/api/executions/:path*",
      },
      {
        source: "/api/ai/:path*",
        destination: "http://localhost:8083/api/ai/:path*",
      },
      {
        source: "/api/evaluator/:path*",
        destination: "http://localhost:8084/api/evaluator/:path*",
      },
      {
        source: "/api/matching/:path*",
        destination: "http://localhost:8085/api/matching/:path*",
      },
    ];
  },
};

export default nextConfig;