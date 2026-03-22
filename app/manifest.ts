import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Salary After Tax Calculator",
    short_name: "SalaryAfterTax",
    description: "Free salary after tax calculator for the US, UK, and Canada.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#3b82f6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
