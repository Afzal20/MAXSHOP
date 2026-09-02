const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Normalize a media URL from the Django backend into one the browser can load.
 *
 * DRF sometimes returns relative paths (e.g. "/media/item_images/x.webp")
 * which would otherwise resolve against the Next.js origin and 404. This helper
 * prefixes relative paths with the API base URL; absolute URLs pass through.
 */
export function toAbsoluteUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${API_URL}${src.startsWith("/") ? src : `/${src}`}`;
}
