import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
        destination: "https://usermanagement-microservice.onrender.com/api/auth/:path*",
      },
      {
        source: "/api/users/:path*",
        destination: "https://usermanagement-microservice.onrender.com/api/users/:path*",
      },
      {
        source: "/api/config",
        destination: "https://usermanagement-microservice.onrender.com/api/config",
      },
      {
        source: "/api/config/:path*",
        destination: "https://usermanagement-microservice.onrender.com/api/config/:path*",
      },
      {
        source: "/api/startup/profile/:path*",
        destination: "https://usermanagement-microservice.onrender.com/api/startup/profile/:path*",
      },
      {
        source: "/api/startup/:path*",
        destination: "https://startupapplicationservice.onrender.com/api/startup/:path*",
      },
      {
        source: "/api/investor/profile/:path*",
        destination: "https://usermanagement-microservice.onrender.com/api/investor/profile/:path*",
      },
      {
        source: "/api/investor/:path*",
        destination: "https://startupapplicationservice.onrender.com/api/investor/:path*",
      },
      {
        source: "/api/executions/:path*",
        destination: "https://startupapplicationservice.onrender.com/api/executions/:path*",
      },
      {
        source: "/api/ai/:path*",
        destination: "https://aiassessmentengine-service.onrender.com/api/ai/:path*",
      },
      {
        source: "/api/evaluator/profile/:path*",
        destination: "https://usermanagement-microservice.onrender.com/api/evaluator/profile/:path*",
      },
      {
        source: "/api/evaluator/:path*",
        destination: "https://evaluation-and-decision-service.onrender.com/api/evaluator/:path*",
      },
      {
        source: "/api/matching/:path*",
        destination: "https://investor-matching-and-presentation.onrender.com/api/matching/:path*",
      },
      {
        source: "/api/admin/:path*",
        destination: "https://audit-and-compliance-service.onrender.com/api/admin/:path*",
      },
      {
  source: "/api/users",
  destination: "https://usermanagement-microservice.onrender.com/api/users",
},
{
  source: "/api/notifications/:path*",
  destination: "https://reporting-and-notification-service.onrender.com/api/notifications/:path*",
},
{
  source: "/api/conversation/:path*",
  destination: "https://aiassessmentengine-service.onrender.com/api/conversation/:path*",
},
{
  source: "/api/assessment/:path*",
  destination: "https://aiassessmentengine-service.onrender.com/api/assessment/:path*",
},
    ];
  },
};

export default withNextIntl(nextConfig);
