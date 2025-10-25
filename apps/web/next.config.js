import path from 'path';
import { fileURLToPath } from 'url';

const outputFileTracingRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot,
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  transpilePackages: ['@nexus/domain', '@nexus/testing', '@repo/ui', '@repo/usage', '@repo/auth', '@repo/billing'],
};

export default nextConfig;
