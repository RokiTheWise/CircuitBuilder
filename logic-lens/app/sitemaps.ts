import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://logisketch.djenriquez.dev/",
      lastModified: new Date(),
      changeFrequency: "monthly", 
      priority: 1, 
    },
  ];
}