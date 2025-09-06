import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const withPWAConfig = withPWA({
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
    output: "standalone",
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
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/:path*`,
            },
        ];
    },
};

export default withPWAConfig(nextConfig);