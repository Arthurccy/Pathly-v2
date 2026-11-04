# Pathly V2 — Feuille de route des onze séances

Chef de projet : Arthur Courchay. Équipe : neuf personnes assistées par IA.
Chaque séance comprend six heures de travail. Cette feuille de route fixe une direction ; elle ne constitue pas une estimation garantie de chaque fonctionnalité.

## Principes de planification

- Chaque séance a un résultat collectif démontrable et des responsabilités individuelles.
- Le P0 constitue l’engagement de livraison de la brique, tests et documentation compris ; son intégration réelle reste une vérification distincte si une dépendance manque. Le P1 est la cible suivante de la journée ; le P2 est une réserve.
- Les extensions ne commencent pas au détriment des vérifications ou de l’intégration. Une tâche terminée tôt libère du temps pour les revues et l’entraide.
- Les contrats de départ et leurs exemples sont disponibles pour démarrer ; les ajustements sont confirmés en début de séance. Les interfaces fictives permettent d’avancer, mais ne valent pas une intégration réelle.
- Les priorités sont réévaluées à partir des résultats de la séance précédente. Une date de roadmap ne rend pas une dépendance disponible.
- Les mesures de performance ont un protocole. Les promesses commerciales sont séparées des hypothèses et des simulations.

## Progression collective

| Séance                                  | Résultat collectif visé                                                                                      | Condition pour engager la suite                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| S1 — Socle initial                      | Monorepo, architecture et première interface                                                                 | Vérifier effectivement installation et démarrage ; ne pas déduire la disponibilité de l’API de la seule présence des fichiers |
| S2 — Parcours intégré                   | Import de démonstration, transactions et estimation de trésorerie ; premières visualisations et landing page | P0 intégrés, contrôles exécutables et limites connues ; voir les tickets détaillés                                            |
| S3 — Stabilisation et navigation        | Parcours S2 fiabilisé, navigation multi-pages et environnement de prévisualisation                           | Erreurs et authentification traitées ; ne pas ajouter de cache sans besoin observé                                            |
| S4 — Patrimoine et valorisation         | Consultation des actifs et première source de prix vérifiée                                                  | Contrats, devises, droits d’accès et conditions d’utilisation de la source définis                                            |
| S5 — Évolution du patrimoine            | Historique, filtres et calculs de variation explicables                                                      | Cohérence des montants et absence de double comptage vérifiées                                                                |
| S6 — Catégorisation et imports robustes | Règles de catégorisation, correction utilisateur et imports partiels                                         | Cas ambigus et erreurs récupérables explicités                                                                                |
| S7 — Prévisions                         | Projection de trésorerie avec hypothèses, scénarios et historique                                            | Évaluation sur des données de référence ; pas de promesse de prédiction garantie                                              |
| S8 — Simulation de projets              | Un parcours de simulation de crédit ou projet de vie complet                                                 | Formules, hypothèses et limites métier validées avant extension                                                               |
| S9 — Qualité et sécurité                | Recette transversale, isolation des données et mesures de charge                                             | Anomalies prioritaires corrigées ; objectifs de charge définis selon l’usage visé                                             |
| S10 — Livraison                         | Déploiement, migrations contrôlées et procédure de retour arrière                                            | Recette dans l’environnement cible et restauration vérifiée                                                                   |
| S11 — Présentation                      | Démonstration reproductible et bilan technique/commercial                                                    | Résultats mesurés, simulations et prochaines étapes clairement distingués                                                     |

Le [plan individuel S3 à S11](MISSIONS_PAR_SEANCE.md) précise P0, P1, démarrage autonome et preuve attendue pour les neuf membres. Le [guide de contribution](../../CONTRIBUTING.md) normalise les modalités de développement et de rendu.

## Responsabilités dans la durée

| Personne | Responsabilité principale                                       | Coordination nécessaire                                                |
| -------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Arthur   | Priorités, qualité des contrôles, arbitrages et intégration     | Relectures réparties ; décisions et ajouts de dépendances partagées    |
| Victor   | API, règles de trésorerie et simulations financières            | Contrats avec Ishak, entrées normalisées avec Rémy                     |
| Rémy     | Import, normalisation et fiabilité des données                  | Persistance avec Ishak, besoins métier avec Victor                     |
| Ishak    | Modèle de données, contrats, seed et client API                 | Évolutions demandées par les producteurs et consommateurs              |
| Loris    | Parcours applicatifs, composants UI et intégration du dashboard | Points de montage pour Jeremy et Clément                               |
| Jeremy   | Visualisation financière et interactions                        | Données typées, accessibilité et coût du rendu avec Loris/Clément      |
| Clément  | Recette de parcours, mesures et fiabilité des interactions      | Scénarios et corrections ciblées avec les propriétaires des composants |
| Yann     | Compte utilisateur, authentification et confidentialité         | Identité avec Victor/Rémy, contrats avec Ishak, pages avec Loris       |
| Mathias  | Pages publiques, SEO et vérification des arguments commerciaux  | Sources exploitables avec Victor, discours produit avec Arthur         |

Les responsabilités sont stables, les tâches peuvent être redistribuées. Une personne n’est pas tenue d’ajouter une nouvelle technologie chaque séance pour maintenir son activité.

## Intégration de Yann à partir de S2

Yann prend un domaine full stack durable : le compte utilisateur, sa session et ses données personnelles. Le [plan individuel S2 à S11](YANN_MISSIONS.md) détaille ses engagements, cibles et critères de validation. S1 précède son arrivée : aucune tâche passée ne lui est artificiellement attribuée.

Cette responsabilité complète les calculs de Victor, les imports de Rémy, le modèle d’Ishak et le dashboard de Loris. Elle ne transfère pas à Yann la sécurité de tout le produit : chaque auteur reste responsable de ses contrôles d’accès et de ses tests. Clément conserve la recette transversale ; Arthur conserve la CI et la décision de fusion.

## Détail opérationnel de la séance 2

Le [briefing](../BRIEFING_SEANCE_POUR_IA.md) et les [tickets](GITHUB_PROJECTS_SEANCE_2.md) font référence pour le périmètre de S2. Le schéma patrimonial et plusieurs contrats existent déjà : les comparer aux besoins avant de les recréer.

Le comparateur tarifaire dépend d’abord de données comparables vérifiées. Mathias prépare les sources et hypothèses ; Victor intègre un calcul seulement si elles le permettent. L’amortissement avancé, la généralisation à six banques et les cinq formulaires patrimoniaux ne sont pas des obligations de clôture de S2.

## Critères de clôture de chaque séance

1. Démontrer le résultat collectif et indiquer les P0 intégrés ou bloqués.
2. Exécuter les contrôles adaptés : compilation, tests métier, parcours et vérifications d’accès selon les modifications. Distinguer tests réussis, échoués, ignorés et non exécutés.
3. Faire relire les PRs et les fusionner progressivement avec décision finale d’Arthur.
4. Actualiser un rapport court par personne selon le [modèle](TEMPLATE_RAPPORT_SEANCE.md), avec exemple concret et limites. L’auteur relit le code et le rapport, y compris lorsqu’ils ont été générés par IA.
5. Reporter explicitement les travaux restants avec leur responsable et leur dépendance ; ajuster la séance suivante.

Les captures et résultats pour la soutenance sont collectés lorsqu’ils apportent une preuve utile. Aucun quota de tests, chiffre de marge, gain utilisateur ou score de performance ne doit être inventé pour remplir un rapport.
