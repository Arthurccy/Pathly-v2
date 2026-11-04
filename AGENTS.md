# Instructions pour les agents — Pathly V2

Projet pédagogique de master en alternance, neuf membres, onze séances de six heures, développement assisté par IA. Objectif : démonstrateur financier déployé, cohérent et vérifiable. Ne pas confondre roadmap, code présent et fonctionnalités validées.

Lire `docs/README.md`, `docs/VISION_PRODUIT.md` et `CONTRIBUTING.md`, puis le ticket de la séance et son contrat. Pour S2 : `docs/BRIEFING_SEANCE_POUR_IA.md`, `docs/chefferie-de-projet/GITHUB_PROJECTS_SEANCE_2.md` et `docs/architecture/CONTRATS_SEANCE_2.md`. Pour la suite : roadmap et missions par séance. Lire seulement les rapports pertinents au changement.

- Limiter le changement au ticket et respecter les zones de coordination. Les responsables relisent les fichiers partagés ; ils ne sont pas tenus de préparer chaque changement à la place des autres.
- Commencer avec les contrats, fixtures et interfaces convenus sans attendre une autre branche. Identifier les doublures et conserver une validation d’intégration réelle distincte.
- Utiliser les checkouts existants. Chaque tâche cloud est isolée ; aucun worktree sans demande explicite.
- Utiliser pnpm 9.15.4 et le lockfile figé pour installer. Ne pas ajouter une dépendance sans besoin identifié ; préserver le lockfile et les modifications existantes.
- Ne jamais exposer des secrets, utiliser une base de production pour des tests ni affaiblir un contrôle d’accès. Chaque endpoint métier reste responsable de l’autorisation.
- Vérifier une règle ou un résultat concret. Ne pas inventer un test exécuté, une mesure, une source, une disponibilité de commande ou une connexion distante.
- Examiner les erreurs existantes et les limites d’outillage décrites dans le guide ; ne pas masquer des tests ou du lint pour obtenir du vert.
- Documenter le résultat réel dans le modèle de rapport de séance si la tâche livre une contribution de séance. Ne pas créer de rapports individuels fictifs pour une simple modification de cadrage.
- Ne pas modifier les PDF/DOCX pour prétendre qu’ils sont synchronisés : les Markdown de référence sont indiqués dans l’index.

Les instructions explicites de l’utilisateur définissent le périmètre demandé. Pour une tâche de documentation, ne pas démarrer un développement applicatif au seul motif qu’il figure dans la roadmap.
