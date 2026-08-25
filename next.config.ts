import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

// @ts-ignore - next-pwa typing issues with Next 15 sometimes
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
