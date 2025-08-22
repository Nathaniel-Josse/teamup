import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const withPWAConfig = withPWA({
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
});

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

export default withPWAConfig(nextConfig);