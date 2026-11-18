import type { MetadataRoute } from "next";

/**
 * Configuration robots.txt cohérente avec les routes publiques (Séance 2 — Mathias Bouclon).
 * Seule la page publique `/landing` a vocation à être indexée ; les routes applicatives/privées
 * (`/connexion`, `/parametres`, `/api/`) sont explicitement exclues de l'indexation.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pathly.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/landing"],
        disallow: ["/api/", "/connexion", "/parametres"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
