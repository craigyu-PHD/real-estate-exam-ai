import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

// @ts-expect-error - next-pwa typing is not fully aligned with the current Next.js version
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['msedge-tts', 'ws'],
};

export default withPWA(nextConfig);
