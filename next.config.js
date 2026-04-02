/** @type {import('next').NextConfig} */

// GitHub Pages serves the site at /repo-name/. Explicit NEXT_PUBLIC_BASE_PATH wins (see workflow).
let basePath = '';
if (process.env.NEXT_PUBLIC_BASE_PATH) {
  basePath = process.env.NEXT_PUBLIC_BASE_PATH;
} else if (process.env.GITHUB_ACTIONS) {
  basePath = `/${(process.env.GITHUB_REPOSITORY || '').split('/')[1]}`;
}

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  // Exposed so static <img src> and similar can match basePath (next/image usually handles this;
  // explicit URLs are needed for some static-export + GH Pages cases).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
