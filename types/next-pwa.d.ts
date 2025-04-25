import { NextConfig } from "next";

declare module "next-pwa" {
  type WithPWAOptions = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        networkTimeoutSeconds?: number;
        cacheableResponse?: {
          statuses: number[];
          headers: Record<string, string>;
        };
      };
    }>;
  };

  export default function withPWA(
    options?: WithPWAOptions
  ): (nextConfig: NextConfig) => NextConfig;
}
