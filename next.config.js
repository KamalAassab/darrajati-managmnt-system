const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb',
        },
        instrumentationHook: false,
    },
};

module.exports = withBundleAnalyzer(nextConfig);
