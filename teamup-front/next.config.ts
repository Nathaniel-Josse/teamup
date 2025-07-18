import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: process.env.NEXT_PUBLIC_UPLOADS_HOST || "localhost",
                port: process.env.NEXT_PUBLIC_UPLOADS_PORT || "3002",
                pathname: "/uploads/**",
            },
        ],
    },
};

export default nextConfig;
