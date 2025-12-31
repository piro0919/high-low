import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Using `git rev-parse HEAD` to determine revision
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() ?? crypto.randomUUID();

const serwistRoute = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.ts",
  nextConfig: {},
});

// These must be static values for Turbopack
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams() {
  return [{ path: ["sw.js"] }];
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
export const GET = serwistRoute.GET as any;
