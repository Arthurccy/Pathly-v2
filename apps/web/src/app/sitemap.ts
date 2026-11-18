import type { MetadataRoute } from "next";

/**
 * Sitemap public Pathly V2 (Séance 2 — Mathias Bouclon).
 * Référence uniquement les routes publiques destinées à l'acquisition (`/landing`),
 * sans exposer les routes privées ou de session (`/connexion`, `/parametres`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pathly.app";

  return [
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date("2026-10-15T09:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
