# Contribuer à Pathly V2

## 1. Cadre commun

Équipe de neuf personnes en deuxième année de master en alternance. Travail en séances de six heures, assisté par IA. Lire l’[index documentaire](docs/README.md), puis le ticket de la séance. Le périmètre legacy est conservé pour consultation ; ne pas le modifier pour une tâche V2 sans besoin explicite.

Chaque personne possède un domaine de développement, les tests de ce domaine et son rapport. La recette collective, la CI et les revues ne retirent pas cette responsabilité à l’auteur.

## 2. Ticket prêt à démarrer

Chaque ticket précise les champs suivants. Les tickets S2 et la matrice des séances suivantes servent de base ; compléter les points inconnus dans la PR en brouillon au démarrage.

| Champ           | Contenu attendu                                                                    |
| --------------- | ---------------------------------------------------------------------------------- |
| Identité        | `Sxx-PRENOM-sujet`, responsable, domaine et séance                                 |
| Résultat        | Comportement utilisateur ou technique démontrable                                  |
| Priorités       | P0 engagement ; P1 cible de journée ; P2 réserve                                   |
| Zone            | Fichiers/modules possédés et points partagés à coordonner                          |
| Entrées/sorties | Contrat, exemple et version ou référence au contrat existant                       |
| Autonomie       | Fixture, doublure ou interface permettant de commencer immédiatement               |
| Intégration     | Dépendance réelle à vérifier, responsable du raccordement et condition de réussite |
| Validation      | Exemple nominal, erreur/cas limite et commandes pertinentes                        |
| Livraison       | Rapport, PR et relecteur                                                           |

Pour chaque tâche : fixer le résultat attendu avant de générer le code. Le nombre de fichiers, lignes ou prompts n’est pas un critère de réussite.

## 3. Développer sans attendre

1. Consommer un contrat déjà défini, avec un exemple nominal, vide et en erreur. Les [contrats S2](docs/architecture/CONTRATS_SEANCE_2.md) fournissent le point de départ.
2. Isoler le calcul ou traitement du transport HTTP et de la BDD lorsque cela permet un test utile. Ne pas créer une architecture générique disproportionnée.
3. Utiliser des fixtures déterministes et des doublures injectées dans les tests ou un mode de démonstration explicite. Une doublure ne doit pas affaiblir l’authentification du mode réel.
4. Préparer l’adaptateur réel dans sa propre branche ; tester son raccordement au point d’intégration. Le développeur consommateur réalise le raccordement avec le producteur.
5. Si un contrat manque, proposer immédiatement une interface minimale et un exemple dans sa PR, puis avancer sur cette base. Signaler le point à valider ; ne pas modifier silencieusement un contrat existant.

Les propriétaires des fichiers partagés coordonnent et relisent, ils ne sont pas les seuls autorisés à préparer un changement. Chacun peut proposer un nouveau fichier de contrat par domaine, une migration ou une dépendance dans sa branche. Éviter les modifications concurrentes de fichiers centraux ; effectuer les raccordements sous forme de petits changements identifiés. Pour un contrat existant, préférer un ajout compatible et reporter un changement cassant jusqu’à l’accord des consommateurs.

Pas d’attente inactive pour une tâche isolable. Après 20 minutes sans nouvelle piste : donner le symptôme, les essais et la dépendance ; continuer les tests, l’adaptateur, l’interface ou une tâche P1 indépendante. Un accès manquant peut toutefois bloquer l’intégration réelle : il doit rester visible.

## 4. Domaines et fichiers partagés

| Zone                                | Coordinateur | Modalité                                                                                                                |
| ----------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Schéma et migrations Prisma         | Ishak        | L’auteur prépare une modification ciblée ; Ishak vérifie les relations, l’ordre des migrations et les impacts           |
| Contrats et client API partagés     | Ishak        | Fichiers par domaine, exemples cohérents et adaptations compatibles ; pas de remplacement global de l’index             |
| Dashboard, layout et styles globaux | Loris        | Développer un composant isolé ; réserver son point de montage et préparer une PR de raccordement ciblée                 |
| Session et helpers Supabase         | Yann         | Un seul mécanisme commun ; les domaines métier conservent leurs filtres d’autorisation                                  |
| Dépendances et lockfile             | Arthur       | L’auteur installe dans son workspace et sa branche ; Arthur séquence les fusions et la résolution cohérente du lockfile |
| CI et configuration de déploiement  | Arthur       | PR dédiée et validation sur la destination concernée                                                                    |
| Pages publiques et sources          | Mathias      | Pas de modification concurrente du dashboard pour la landing page                                                       |

Les branches isolent les changements Git, pas les données distantes : utiliser une base de développement dédiée et coordonner les migrations. Ne jamais tester une suppression sur des données réelles. Ne pas réinitialiser les données d’un autre membre.

## 5. Git et dépendances

- Partir de `main` à jour et créer une branche par livraison : `feat/s03-yann-parametres`, `fix/s03-remy-import-dates`, `docs/s03-arthur-bilan` ou `chore/s03-arthur-ci`. Les noms S2 existants restent valides.
- Dans une tâche cloud déjà isolée, utiliser le checkout fourni ; ne pas créer de worktree sauf demande explicite.
- Garder un seul P0 en cours par personne. Ouvrir tôt une PR en brouillon et livrer de petits incréments cohérents, sans imposer une PR par fichier.
- Commits descriptifs : `feat(auth): handle expired sessions`, `docs(team): define session workflow`. Aucun commit direct sur `main`, aucun push forcé sur une branche partagée.
- Avant la fusion, prendre en compte les changements de `main` selon la pratique convenue, résoudre les conflits et relancer les vérifications affectées.
- Utiliser pnpm 9.15.4 déclaré dans `package.json`. Installation : `pnpm install --frozen-lockfile`. Ajout justifié : `pnpm --filter <workspace> add <paquet>` ; outil transversal à la racine seulement si nécessaire.
- Annoncer un ajout de dépendance pour éviter les doublons, sans attendre une installation réalisée par Arthur. Ne jamais régénérer ou supprimer le lockfile pour cacher un conflit.
- Ne pas committer `.env`, secrets, `node_modules`, builds, logs ou relevés personnels. Examiner `git diff` et `git status` avant chaque commit.

## 6. Validation et état initial de l’outillage

Le manifeste racine demande Node >=20. La préparation cloud a utilisé Node 24.22.1, qui a permis le chargement des packages exposant leur source TypeScript. Une compatibilité avec toutes les versions >=20 n’a pas été vérifiée. Ne pas présenter le workflow cloud comme une validation de toutes les machines de l’équipe.

| Vérification    | Commande ou scénario                                              | Limite initiale connue                                                                                              |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Installation    | `pnpm install --frozen-lockfile`                                  | Ne modifie pas le lockfile                                                                                          |
| Types partagés  | `pnpm --filter @pathly/shared-types typecheck`                    | Ne valide pas le runtime                                                                                            |
| Frontend        | `pnpm --filter @pathly/web build`                                 | Le build saute le lint selon la configuration actuelle                                                              |
| Types API       | `pnpm --filter @pathly/api exec tsc --noEmit --incremental false` | Le cache incrémental existant ne doit pas masquer un résultat                                                       |
| Compilation API | `pnpm --filter @pathly/api exec tsc --incremental false`          | À vérifier après génération Prisma ; pas une preuve HTTP                                                            |
| Client Prisma   | `pnpm db:generate`                                                | Téléchargement des moteurs, TLS/checksums conservés ; `binaries.prisma.sh` doit être accessible                     |
| Tests API       | Script `test` du workspace                                        | Jest est mentionné sans runner déclaré à l’état initial : configurer l’outillage avant d’annoncer une suite réussie |
| Lint global     | `pnpm check-all`                                                  | Chaîne non entièrement configurée à l’état initial ; ne pas la déclarer verte sans exécution                        |
| Parcours        | Démarrer les services puis exercer la fonctionnalité              | PID, port ouvert et capture d’écran ne suffisent pas                                                                |

Les limites ci-dessus sont un état initial à réévaluer lorsque l’outillage évolue. Le README décrit les commandes de démarrage prévues ; leurs échecs restent à diagnostiquer, pas à masquer.

Le seed et les scripts d’analyse sont des travaux planifiés tant qu’ils ne sont pas déclarés dans les manifests. Ne pas annoncer `pnpm db:seed` ou une commande `analyze` disponible sans l’avoir ajoutée et exécutée.

Pour le périmètre modifié : tester un comportement nominal et les cas limites utiles. Pour les données privées : vérifier aussi le refus d’accès et l’isolation. Pour une interface : chargement, vide, erreur et navigation clavier. Pour une mesure : documenter volume, appareil, réseau et conditions. Un test doit pouvoir détecter une erreur du comportement attendu ; ne pas copier la formule du code dans le test comme unique oracle.

## 7. Usage de l’IA et responsabilité

L’IA peut planifier, écrire, tester, diagnostiquer et préparer la documentation. L’auteur lit le diff complet et le rapport. Il vérifie un exemple dont le résultat attendu vient d’une règle explicite ou d’un calcul indépendant, et doit pouvoir retrouver le point d’entrée et montrer un cas d’erreur.

Ne pas inventer une exécution, une métrique, une source tarifaire ou une intégration. Ne pas désactiver un test ou une protection pour obtenir une validation. Ne pas imposer de correction manuelle artificielle lorsque le résultat généré est correct. Demander des changements limités au ticket ; une refonte générale nécessite un périmètre séparé.

## 8. Rendu, revue et fusion

Une livraison comprend : code utile, tests/fixtures nécessaires, PR et rapport court `docs/seances/seance-X/RAPPORT_PRENOM.md` selon le [modèle](docs/chefferie-de-projet/TEMPLATE_RAPPORT_SEANCE.md). Un seul rapport par personne et séance, actualisé au fil des PRs. Viser 10 à 15 minutes de synthèse à partir des preuves déjà collectées ; pas de présentation commerciale obligatoire pour chaque changement.

Description de PR :

```text
Ticket et résultat :
P0 livré / P1-P2 réalisés :
Contrats et fichiers partagés touchés :
Validation exécutée et résultats :
Mode réel ou doublure ; intégration restant à faire :
Limites / reports :
Lien du rapport et relecteur :
```

Le relecteur examine le diff et reproduit un comportement ou consulte une preuve d’exécution pertinente ; il vérifie aussi un cas d’erreur. Un résumé IA et la présence du Markdown ne remplacent pas cette lecture. Les retours distinguent bloquant, amélioration et suggestion. Arthur tranche les conflits de priorité et garde la décision de fusion.

Une brique testée avec des doublures peut être fusionnée si elle reste isolée, compatible et clairement désactivée ou identifiée dans le parcours réel. Son statut reste « validé isolément ». Elle n’est pas affichée comme une fonctionnalité intégrée à l’utilisateur.

Avant de fusionner : critères du périmètre livré vérifiés, aucune régression connue non arbitrée, diff relu, preuves et limites disponibles, secrets absents. Les objectifs reportés restent ouverts dans le suivi. Après raccordement, lancer le scénario réel et seulement alors passer la fonctionnalité au statut « intégré ».

## 9. Cadence et reprise entre séances

Démarrage : lire l’état laissé par la séance précédente, vérifier les accès et confirmer son P0. Points courts à 10 h 30 et 14 h 30 ; intégration vers 11 h et 14 h 30 ; stabilisation à 15 h 30 ; démonstration et bilan de 16 h à 16 h 30.

Avant de partir : pousser sa branche, actualiser sa PR et son rapport, noter la commande ou les étapes de reproduction et la prochaine action. Décrire l’état réel si le travail n’est pas terminé. Les processus, sessions et accès de développement ne sont pas supposés survivre jusqu’à la séance suivante.

Une personne qui termine prend d’abord sa revue, puis aide à une intégration ou un blocage, puis son P1/P2. Le plan est réévalué sur les résultats observés ; il n’existe pas d’obligation de remplir la journée avec une nouvelle technologie.
