/** @type {import('next').NextConfig} */

// In GitHub Actions, GITHUB_REPOSITORY is always set to "owner/repo".
// We extract just the repo name to use as the basePath for GitHub Pages.
// Locally none of these vars exist, so basePath is ''.
const basePath = process.env.GITHUB_ACTIONS
  ? `/${(process.env.GITHUB_REPOSITORY || '').split('/')[1]}`
  : '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
