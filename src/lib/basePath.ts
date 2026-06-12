// next/image with `images.unoptimized` (required for static export) does NOT
// prepend basePath to src, so root-relative URLs 404 on GitHub Pages where the
// site lives at /<repo>/. Prefix them explicitly with the build-time base path.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBasePath(src: string): string {
  if (!src.startsWith('/')) return src;
  if (basePath && src.startsWith(`${basePath}/`)) return src;
  return `${basePath}${src}`;
}
