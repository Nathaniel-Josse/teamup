import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: env.NEXT_PUBLIC_UPLOADS_HOST || "localhost",
                port: env.NEXT_PUBLIC_UPLOADS_PORT || "3002",
                pathname: "/uploads/**",
            },
        ],
    },
};

export default nextConfig;
