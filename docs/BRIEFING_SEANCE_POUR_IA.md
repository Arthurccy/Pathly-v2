# Séance 2 — Briefing d’équipe

Responsable : Arthur Courchay. Équipe : neuf personnes de deuxième année de master en alternance, assistées par IA.
Horaires : 9 h–11 h 30 et 13 h–16 h 30, soit six heures.

## Références et ordre de lecture

[Vision produit](VISION_PRODUIT.md) → [guide de contribution](../CONTRIBUTING.md) → [tickets S2](chefferie-de-projet/GITHUB_PROJECTS_SEANCE_2.md) → [contrats S2](architecture/CONTRATS_SEANCE_2.md).
La [roadmap](chefferie-de-projet/ROADMAP_GLOBALE_11_SEANCES.md) et les [missions suivantes](chefferie-de-projet/MISSIONS_PAR_SEANCE.md) expliquent la progression. Les règles de développement, d’IA, de validation et de rendu sont centralisées dans le guide de contribution pour éviter plusieurs versions concurrentes.

## 1. Objectif de la séance

Construire les briques du parcours connexion → import fictif → consultation comptes/transactions → estimation de trésorerie, avec synthèse patrimoniale, visualisation et landing page développées en parallèle. Réaliser une première intégration avec les dépendances disponibles et rendre visibles les raccordements restant à vérifier.

L’ambition est soutenue : chacun livre une brique démontrable et approfondit son domaine. L’évaluation porte sur les résultats et leur vérification, pas sur le volume généré par l’IA.

- **P0 — Engagement** : brique fonctionnelle, tests, exemple, adaptateur et rapport. Vérification d’intégration dès que la dépendance réelle est disponible.
- **P1 — Cible de journée** : approfondissement prévu après stabilisation du P0, sans attendre si la tâche est indépendante.
- **P2 — Réserve** : extension arbitrée après revue et aide aux intégrations.

Un P0 validé avec une doublure porte le statut « validé isolément ». Le parcours complet reste bloqué tant que sa dépendance réelle n’est pas vérifiée. Ne pas ralentir tout le monde pour une attente locale, ni masquer l’attente en annonçant une intégration réussie.

## 2. Zones et coordination

| Responsable | Zone principale                                                                                                | Interface à transmettre                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arthur      | `.github/`, outils de contrôle et coordination                                                                 | Commandes de validation et décisions de périmètre             |
| Victor      | API comptes/transactions et nouveau module de calcul de trésorerie                                             | Endpoints, règles de calcul et exemples chiffrés              |
| Rémy        | Nouveau module API d’import et ses fixtures                                                                    | Résultat d’import normalisé, erreurs et politique de réimport |
| Ishak       | `packages/database`, `packages/shared-types`, `apps/web/src/lib/api-client.ts`                                 | Schéma, contrats, seed et accès API typé                      |
| Loris       | Structure du dashboard, composants comptes/transactions, institutions                                          | Emplacements des widgets et callbacks de mise à jour          |
| Jeremy      | Composants de visualisation, animation et visite guidée                                                        | Composants autonomes alimentés par des props typées           |
| Clément     | Mesures, tests de parcours et module isolé de mutation optimiste                                               | Résultats de mesure, état de mutation et rollback             |
| Yann        | Routes `/connexion` et `/parametres`, composants de compte, module API utilisateur et authentification commune | Session, identité validée et préférences utilisateur          |
| Mathias     | Route `/landing`, composants de cette page, SEO public et dossier de sources tarifaires                        | Textes vérifiables, exemples et données sourcées              |

Les coordinateurs relisent et séquencent les raccordements ; chaque auteur peut préparer les modifications nécessaires dans sa branche. Ishak n’a pas à écrire tous les contrats avant que les autres démarrent ; Loris n’a pas à monter tous les widgets avant qu’ils soient testés ; Arthur n’a pas à installer chaque dépendance à la place de son auteur.

Loris coordonne dashboard/layout/styles ; Jeremy et Clément livrent leurs modules isolés et un montage ciblé. Yann coordonne session et guard commun ; Victor et Rémy conservent l’autorisation métier. Mathias utilise `/landing`, sans remplacer `/`. Le schéma et le client API partagés restent coordonnés avec Ishak. Un type TypeScript ne remplace pas un DTO validé à l’exécution.

## 3. Démarrer sans attendre

Les [contrats S2](architecture/CONTRATS_SEANCE_2.md) fournissent exemples, conventions et matrice d’autonomie pour les neuf membres. Début de séance : lire son contrat, ouvrir sa PR en brouillon, préparer une fixture et son cas d’erreur, puis réaliser sa brique. Confirmer les interfaces avant 10 h ; une hypothèse restante est écrite dans la PR.

En l’absence de BDD, d’API ou de Supabase : avancer avec fonction pure, dépôt simulé, réponse API fixe ou client d’identité de test selon le domaine. Préparer le raccordement réel et indiquer ce qu’il exige. Les faux utilisateurs ne désactivent jamais la protection des endpoints réels.

## 4. Cadence

| Heure        | Point de passage     | Résultat                                                           |
| ------------ | -------------------- | ------------------------------------------------------------------ |
| 9 h–9 h 20   | Reprise et priorités | Accès vérifiés, P0 confirmés, contrats lus                         |
| 9 h 20–10 h  | Interfaces           | Exemples de référence utilisables ; propositions ciblées signalées |
| 10 h 30      | Point court          | Résultat isolé, blocage et prochaine action de chacun              |
| 11 h–11 h 30 | Intégration 1        | Petites PRs et premier raccordement possible                       |
| 13 h–14 h 30 | Développement        | P0 stabilisés, P1 et revues continues                              |
| 14 h 30      | Intégration 2        | Scénario collectif, erreurs et reports identifiés                  |
| 15 h 30      | Stabilisation        | Corrections, preuves et rapports ; pas de nouvelle extension       |
| 16 h–16 h 30 | Démonstration        | Distinguer isolé, intégré, bloqué et reporté                       |

Après 20 minutes sans nouvelle piste, signaler le blocage et avancer sur la tâche isolable suivante. Une personne qui finit passe à sa revue, une aide d’intégration, puis son P1/P2.

## 5. Relectures et rendu

Victor relit Rémy, Rémy relit Victor ; Ishak relit Yann, Yann relit Clément, Clément relit Ishak ; Loris et Jeremy se relisent ; Arthur et Mathias se relisent. Un second avis spécialisé est possible. Arthur garde la décision de fusion sans concentrer toutes les premières lectures.

Chaque personne fournit une PR avec preuves et un rapport court selon le [modèle](chefferie-de-projet/TEMPLATE_RAPPORT_SEANCE.md). L’IA peut rédiger, l’auteur relit code et rapport. Montrer un cas nominal et un cas limite/erreur ; ne pas remplacer les résultats par des affirmations.

## 6. Points de vigilance S2

- Le schéma patrimonial et plusieurs types existent : vérifier et compléter, ne pas recréer.
- La suite de tests API et le lint sont à mettre en état ; les commandes et limites initiales sont documentées dans le guide. Aucun contrôle non exécuté ne vaut validation.
- Pour les imports, deux opérations légitimes identiques ne sont pas forcément un doublon. Conserver les données originales et documenter les ambiguïtés.
- Le calcul de trésorerie dépend d’hypothèses et ne garantit pas l’absence de découvert. Préciser période, charges, réserve et arrondis.
- Les données tarifaires doivent être vérifiées par Mathias avant une recommandation réelle ; Victor peut développer une simulation identifiée sans attendre.
- Les performances se mesurent avec un protocole, sans obligation absolue « 0 ms », « 60 FPS constants » ou « score parfait ».
- Secrets et données personnelles sont exclus des fixtures, rapports et prompts. Utiliser une base V2 dédiée ; jamais la production V1.

## Bloc de démarrage pour l’IA

```text
Lis AGENTS.md et docs/README.md, puis la vision, le guide de contribution,
mon ticket de séance et son contrat. Mon rôle est [prénom], mon ticket [id].
Propose un plan limité à mon domaine et identifie ce que je peux réaliser
sans attendre une autre branche : fixture, fonction pure, composant ou adaptateur.
Préserve les contrôles d’accès et les contrats existants. Prépare de petits
changements vérifiables. N’invente ni test exécuté, ni métrique, ni source.
Distingue validation isolée et intégration réelle. Prépare le rapport court
avec un exemple concret, les résultats observés et les limites.
Je relirai le diff et le rapport avant livraison.
```
