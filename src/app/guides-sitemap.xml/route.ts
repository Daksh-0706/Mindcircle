import { SITE_URL } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";

/**
 * A second, guides-only sitemap.
 *
 * Search Console had no way to force a re-read of `/sitemap.xml`, and the
 * page count it showed was stale (it still reflected the seven routes that
 * existed before the guides launched). A brand new path is always treated as
 * a new sitemap and gets processed on submission, so submitting this file is
 * what actually gets the articles crawled.
 *
 * `/sitemap.xml` remains the canonical sitemap for everything else.
 */
export const revalidate = 86400;

// `lastmod` used to be `new Date()` on every request, so the sitemap claimed
// "everything changed an hour ago" forever. Google reacts to that by coming
// back over and over and eventually ignoring the file. A day's granularity
// is honest — these articles are not rewritten hourly — and it stops the
// crawl churn.
const lastModified = new Date().toISOString().slice(0, 10);

export function GET() {
  const urls = ["/blog", ...GUIDES.map((guide) => `/blog/${guide.slug}`)]
    .map((path) => {
      const loc = `${SITE_URL}${path}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
