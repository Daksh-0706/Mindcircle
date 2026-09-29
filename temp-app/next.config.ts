import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Dependencies are hoisted to the parent directory's node_modules, so the
  // workspace root is one level up from this app. Setting it explicitly
  // silences Next's multiple-lockfile root-inference warning.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
