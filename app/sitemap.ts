import type { MetadataRoute } from "next";
import { countryOrder } from "./lib/tax-engines";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://salary-after-tax.vercel.app";

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...countryOrder.map((code) => ({
      url: `${base}/${code}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
