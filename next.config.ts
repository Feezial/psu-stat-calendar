import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // ระบุ root ให้ชัด (มี yarn.lock ใน home dir ทำให้ Next เดา root ผิด)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
