import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";

// The sitemap used to be cached for a full day, which meant a freshly
// published guide could sit undiscovered for up to 24 hours. An hour is
// cheap for a file this small and keeps Search Console fresh.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articles = GUIDES.map((guide) => ({
    url: `${SITE_URL}/blog/${guide.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...routes, ...articles];
}
