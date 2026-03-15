import type { MetadataRoute } from "next";
import { countries, countryOrder } from "./lib/tax-engines";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://salaryaftertax.net";

  const salaryPages: MetadataRoute.Sitemap = [];
  for (const code of countryOrder) {
    for (const s of countries[code].popularSalaries) {
      salaryPages.push({
        url: `${base}/${code}/${s}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/compare`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...countryOrder.map((code) => ({
      url: `${base}/${code}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...salaryPages,
  ];
}
