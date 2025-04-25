import type { NextConfig } from "next";
// Use type assertion to avoid TypeScript error
import withPWAModule from "next-pwa";
const withPWA = withPWAModule as unknown as (config: {
  dest: string;
  register: boolean;
  skipWaiting: boolean;
  disable?: boolean;
}) => (nextConfig: NextConfig) => NextConfig;

const nextConfig: NextConfig = {
  /* config options here */
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
