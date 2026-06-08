import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // standalone: ออก server แบบ minimal (.next/standalone/server.js) → Docker image เล็ก ไม่ต้องลง node_modules ทั้งก้อน
  output: "standalone",
  reactCompiler: true,
  // ระบุ root ให้ชัด (มี yarn.lock ใน home dir ทำให้ Next เดา root ผิด)
  turbopack: {
    root: path.resolve(__dirname),
  },
  // จำกัด file tracing ของ standalone ให้อยู่ใน project (กัน Next เดิน root ขึ้นไปเก็บไฟล์เกิน)
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
