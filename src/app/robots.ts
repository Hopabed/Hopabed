import { MetadataRoute } from "next";
import { CANONICAL_DOMAIN } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/favorites/",
          "/history/",
          "/parents/private/",
          "/account/",
          "/login/",
          "/signup/",
        ],
      },
    ],
    sitemap: `${CANONICAL_DOMAIN}/sitemap.xml`,
  };
}
