# Rapport de séance — Mathias Bouclon

Séance : S2 · Branche / PR : `feat/seo-metadata-schema-ld` · Ticket : `S02-MATHIAS-landing-seo-sources` · Relecteur : Arthur Courchay

## 1. Résultat et périmètre

- **Livré et validé isolément (P0, P1, P2)** :
  - Page publique responsive `/landing` (`apps/web/src/app/landing/page.tsx`) fidèle à la vision produit, avec métadonnées SEO, JSON-LD (`WebApplication` + `FAQPage`) et CTA vers le mode démo (`/`).
  - Audit documenté des sources Énergie et Télécom dans `docs/sources/SOURCES_TARIFAIRES_SEANCE_2.md` (URL, date, licence Etalab 2.0, granularité, variables requises et verdict d’exploitabilité pour Victor).
  - Module pur de calcul et simulateur pédagogique interactif (`tariff-simulator.ts` et `TariffSimulatorWidget.tsx`) gérant le cas nominal et le blocage explicite en cas d’informations insuffisantes.
  - Fichiers SEO publics `apps/web/src/app/robots.ts` et `apps/web/src/app/sitemap.ts` indexant `/landing` et excluant `/api/`, `/connexion` et `/parametres`.
- **Livré mais pas encore intégré au backend** :
  - Sortie `SubscriptionOptimizationDto` produite par le simulateur pédagogique côté `/landing` ; le raccordement API dépend du module de Victor (P1) et le lien vers `/connexion` dépend de la branche de Yann.
- **Reporté ou bloqué** :
  - Recommandation tarifaire automatique à partir d’une seule ligne de transaction bancaire : **écarté par validation métier** (les libellés CSV/OFX ne contiennent ni puissance `kVA`, ni consommation `kWh`, ni frais de résiliation).

## 2. Fonctionnement à connaître

- **Point d’entrée et fichiers principaux** :
  - Route publique : `apps/web/src/app/landing/page.tsx` (Server Component exposant `metadata` et le JSON-LD).
  - Composant client interactif : `apps/web/src/app/landing/TariffSimulatorWidget.tsx`.
  - Moteur de calcul pur et sources : `apps/web/src/app/landing/tariff-simulator.ts` et tests `apps/web/src/app/landing/tariff-simulator.test.mjs`.
  - SEO et indexation : `apps/web/src/app/robots.ts`, `apps/web/src/app/sitemap.ts`.
  - Référentiel documentaire : `docs/sources/SOURCES_TARIFAIRES_SEANCE_2.md`.
- **Chemin des données** : `TariffSimulatorWidget` recueille la mensualité observée et les variables déclaratives (`kVA`, option `BASE`/`HP_HC`, `kWh/an` ou frais télécom), puis appelle les fonctions pures `simulateElectricityComparison` et `simulateTelecomComparison`. Les calculs s’effectuent en centimes entiers avant conversion en euros et produisent soit un état `INCOMPLETE_DATA` / `INVALID_INPUT`, soit un résultat `SIMULATED` accompagné d’un objet conforme à `SubscriptionOptimizationDto`.
- **Décision importante et raison** : Interdire tout calcul d’économie sur la seule base du nom d’un fournisseur (`EDF`, `Freebox`) et imposer la saisie des variables physiques/contractuelles requises, afin de respecter la règle S2 (« ne jamais transformer une donnée absente en zéro ni promettre un gain non fondé »).
- **Contrat consommé/exposé** : Consomme et produit `SubscriptionOptimizationDto` (`packages/shared-types/src/index.ts`, lignes 210–223) sans modifier les types partagés ni toucher au dashboard `/` de Loris.
- **Validation isolée vs intégration réelle** : Validé isolément avec tests unitaires déterministes et build statique Next.js ; l’intégration avec un éventuel endpoint d’estimation de Victor reste optionnelle en P1.

## 3. Exemple concret vérifié

- **Cas nominal Énergie (oracle calculé à la main)** :
  - _Entrée_ : Mensualité observée `74,50 €/mois` (`894,00 €/an`), compteur `6 kVA`, option `BASE` (abonnement `152,16 €/an`, réf. `0,2516 €/kWh`), consommation `2 400 kWh/an`, remise simulée `10 %` sur le kWh (`0,2264 €/kWh`).
  - _Résultat attendu_ : Coût annuel TRV = $152,16 + (2\,400 \times 0,2516) = 756,00\text{ €/an}$ ; coût cible simulé = $152,16 + (2\,400 \times 0,2264) = 695,52\text{ €/an}$ (`57,96 €/mois`) ; écart annuel vs observé = $894,00 - 695,52 = 198,48\text{ €/an}$ (`16,54 €/mois`).
  - _Résultat observé_ : `695.52 €/an` simulés et `+198.48 €/an` d’écart théorique (vérifié dans `tariff-simulator.test.mjs` et dans l’UI).
- **Cas nominal Télécom (avec frais fixes de transition)** :
  - _Entrée_ : Actuel `49,99 €/mois`, cible `29,99 €/mois`, résiliation `49,00 €`, activation `49,00 €` (`98,00 €` de frais fixes).
  - _Résultat attendu et observé_ : Économie brute `240,00 €/an`, gain net 1re année $240,00 - 98,00 = 142,00\text{ €}$, seuil de rentabilité $98 / 20 = 4,9\text{ mois}$.
- **Cas limite / erreur (informations insuffisantes)** :
  - _Entrée_ : Libellé `EDF Électricité` et mensualité `74,50 €` seuls (`powerKva = null`, `tariffOption = null`, `annualConsumptionKwh = null`).
  - _Résultat attendu et observé_ : Retour `status: "INCOMPLETE_DATA"` listant les 3 variables manquantes ; affichage d’une alerte explicite sans aucun montant d’économie affiché.

## 4. Vérifications réellement exécutées

| Commande ou scénario                                                                        | Résultat observé                        | Limite / preuve utile                                                                                                      |
| :------------------------------------------------------------------------------------------ | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                            | **Réussi** (code 0)                     | 480 paquets installés sans modification de `pnpm-lock.yaml`                                                                |
| `pnpm --filter @pathly/shared-types typecheck`                                              | **Réussi** (code 0)                     | `tsc --noEmit` valide la compatibilité avec `SubscriptionOptimizationDto`                                                  |
| `pnpm --filter @pathly/web exec tsc --noEmit`                                               | **Réussi** (code 0)                     | Aucune erreur TypeScript sur `/landing`, `robots.ts` et `sitemap.ts`                                                       |
| `node --experimental-strip-types --test apps/web/src/app/landing/tariff-simulator.test.mjs` | **Réussi** (5/5 tests passés, 0 ignoré) | Vérifie cas nominal Énergie, cas nominal Télécom, `INCOMPLETE_DATA`, `INVALID_INPUT` et SEO `robots`/`sitemap`             |
| `pnpm --filter @pathly/web build`                                                           | **Réussi** (code 0)                     | Build de production Next.js 15 générant `/landing`, `/robots.txt` et `/sitemap.xml` (lint sauté par config Next existante) |

## 5. Limites et transmission

- **Limite connue ou hypothèse** : Les grilles d’offres de marché privées (énergie/télécom) ne disposent pas d’une API Open Data publique temps réel libre de droit ; le simulateur utilise donc le barème TRV de référence documenté et des paramètres saisis par l’utilisateur. L’abonnement Pathly à `9,99 €/mois` est affiché uniquement comme hypothèse commerciale d’étude.
- **Action attendue d’un collègue** :
  - **Victor Hubert** : Peut consommer la règle et l’exemple `SubscriptionOptimizationDto` documentés dans `docs/sources/SOURCES_TARIFAIRES_SEANCE_2.md` pour son P1 (en conservant le marquage de simulation).
  - **Arthur Courchay** : Relecture de la branche `feat/seo-metadata-schema-ld` et arbitrage sur le maintien du simulateur en mode déclaratif pour la suite.
- **Étapes de reproduction** :
  1. Exécuter `node --experimental-strip-types --test apps/web/src/app/landing/tariff-simulator.test.mjs`.
  2. Lancer `pnpm --filter @pathly/web dev` puis ouvrir `http://localhost:3000/landing`, tester les 3 boutons de scénarios du simulateur et vérifier `http://localhost:3000/robots.txt` ainsi que `http://localhost:3000/sitemap.xml`.

## Relecture par l’auteur

- [x] J’ai lu le diff et ce rapport ; ils décrivent le même résultat.
- [x] J’ai vérifié les résultats indiqués et signalé ce qui ne l’est pas.
- [x] Je peux retrouver le point d’entrée, expliquer l’exemple et montrer un cas d’erreur.
