import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

// Only initialise the Cloudflare adapter when running via `wrangler dev` /
// opennextjs preview — NOT during regular `next dev`. Calling it unconditionally
// routes all requests through the Workers runtime, which breaks Tailwind v4's
// PostCSS pipeline and leaves the page completely unstyled.
//
// Note: next.config.ts is compiled to CJS, so we use require() here instead
// of a top-level await import() which is not supported in that context.
if (process.env.NEXT_PRIVATE_CLOUDFLARE_DEV === "1") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

export default nextConfig;