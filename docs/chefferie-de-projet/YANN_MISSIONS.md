# Yann — Compte utilisateur, authentification et confidentialité

## Pourquoi ce domaine

Pathly possède des fonctions financières et un dashboard, mais leur utilisation par plusieurs personnes exige un parcours de compte cohérent. Yann en devient le responsable full stack : session, profil, préférences, accès à ses données, export et suppression. Il construit des fonctionnalités visibles et leur backend, avec les tests associés.

Ce choix repose sur son niveau technique annoncé, sans supposer une spécialisation sécurité. Les décisions sensibles restent relues. Le rôle peut être réévalué après sa première séance selon les résultats et ses préférences.

Ce périmètre libère Victor de la maintenance de la session commune et évite de disperser les fonctionnalités de compte entre les développeurs. Il ne rend pas Yann responsable de toutes les erreurs de sécurité de l’équipe.

## Interfaces et limites

| Avec           | Accord de travail                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arthur         | Priorités, configuration des accès, décisions de fusion et règles commerciales ; Yann réalise les fonctions de compte convenues                                               |
| Victor et Rémy | Yann fournit une identité validée ; chacun filtre et autorise les opérations de ses propres endpoints                                                                         |
| Ishak          | Yann propose les contrats de compte et besoins de stockage ; Yann prépare les changements ciblés et Ishak coordonne/revoit contrats, schéma, migrations et client API partagé |
| Loris          | Yann possède `/connexion`, `/parametres` et leurs composants ; Yann prépare les liens et Loris coordonne leur montage dans le layout/dashboard                                |
| Clément        | Yann teste son domaine ; Clément vérifie le parcours collectif et mesure les performances                                                                                     |
| Mathias        | Mathias rédige les explications publiques ; Yann vérifie leur correspondance avec les options et comportements réellement disponibles                                         |

Zones prévues : `apps/web/src/app/connexion/`, `apps/web/src/app/parametres/`, composants de compte, helpers de session et module utilisateur API. Le guard existant `apps/api/src/common/guards/supabase-auth.guard.ts` passe sous sa responsabilité d’intégration. Les emplacements des nouveaux modules sont confirmés avant leur création ; les chemins prévus ne prouvent pas que ces composants existent déjà.

Les changements d’authentification se livrent dans des PRs ciblées. Pas de modification des calculs de trésorerie, parseurs, migrations ou styles globaux sans coordination avec leur responsable. Utiliser Supabase pour la session ; ne pas recréer un fournisseur d’identité.

## Plan S2 à S11

S1 précède son arrivée. Pour chaque séance : P0 = brique testée et démontrable, raccordement réel vérifié séparément si nécessaire ; P1 = cible après stabilisation ; P2 = extension disponible. Ce plan est une progression proposée, réévaluée à chaque clôture, et non la promesse d’un volume identique malgré des dépendances différentes.

### S2 — Connexion et identité

- **P0** : prendre en main l’existant, livrer connexion/déconnexion et lecture authentifiée des comptes avec un compte fictif V2 ; préciser l’interface d’identité avec Victor et Rémy.
- **P1** : restauration/expiration de session et première page de profil modifiable par son propriétaire.
- **P2** : récupération du mot de passe si les e-mails et URLs de retour sont configurés.
- **Preuve** : connexion valide/invalide, déconnexion puis refus d’accès ; tests des fonctionnalités P1 effectivement livrées. Le [ticket S2](GITHUB_PROJECTS_SEANCE_2.md) donne les critères détaillés. Les [contrats S2](../architecture/CONTRATS_SEANCE_2.md) permettent de développer avec un client d’identité simulé sans attendre les accès réels.

### S3 — Cycle de vie de session et paramètres

- **P0** : terminer les éléments S2 restants, puis fiabiliser expiration, renouvellement et redirections ; livrer les préférences de profil avec validation côté API.
- **P1** : parcours de réinitialisation du mot de passe avec retour explicite pour un lien expiré et une session invalide.
- **P2** : améliorer l’accessibilité et les erreurs des formulaires à partir de la recette.
- **Preuve** : rechargement, session expirée et modification de profil vérifiés ; les redirections refusent une destination externe arbitraire. Un service d’e-mail absent reste un blocage déclaré.

### S4 — Export des données personnelles

- **P0** : livrer un export JSON du périmètre convenu (profil, comptes, transactions), limité à l’utilisateur connecté, avec version et date d’export.
- **P1** : ajouter les actifs patrimoniaux disponibles et une interface de téléchargement dans les paramètres.
- **P2** : format CSV complémentaire pour les transactions, avec traitement des cellules dangereuses à l’ouverture dans un tableur.
- **Preuve** : comparer l’export aux données de référence de deux utilisateurs ; ni données tierces ni tokens bancaires ni secrets ne sont exportés.

### S5 — Suppression du compte

- **P0** : cartographier avec Ishak les données liées, puis livrer un parcours de confirmation et une suppression contrôlée sur des comptes de test ; définir le traitement du compte Supabase et des données applicatives.
- **P1** : gérer les échecs partiels et la reprise sans suppression de données tierces ; ne pas afficher une réussite si une étape échoue.
- **P2** : prévoir la révocation d’une connexion bancaire uniquement si son intégration et les moyens de test sont disponibles.
- **Preuve** : test isolé de suppression, contrôle des relations restantes et refus de supprimer un autre utilisateur. Pas d’exécution sur une base de production. Les limites concernant les sauvegardes sont documentées avec Arthur.

### S6 — Paramètres de confidentialité

- **P0** : rendre visibles les données conservées, les commandes d’export/suppression et les préférences réellement prises en charge ; faire correspondre les explications aux comportements du produit.
- **P1** : ajouter les choix de télémétrie facultative si un suivi est effectivement installé ; vérifier leur application avec Arthur et Clément.
- **P2** : conserver une trace minimale des changements de préférence lorsque cela répond à un besoin défini.
- **Preuve** : une option désactivée arrête effectivement le traitement facultatif concerné. Pas d’écran de consentement fictif ni de déclaration de conformité juridique automatique.

### S7 — Préférences pour les prévisions

- **P0** : livrer la saisie et la persistance des paramètres utilisateur convenus avec Victor (par exemple réserve d’épargne et horizon), avec unités, bornes et valeurs par défaut explicites.
- **P1** : transmettre ces paramètres au moteur existant et permettre leur réinitialisation ; Victor conserve les formules de calcul.
- **P2** : ajouter une aide contextuelle expliquant leur effet sur un scénario de référence.
- **Preuve** : modifier une préférence affecte le bon utilisateur et produit le changement attendu sur un exemple validé avec Victor ; une valeur invalide est refusée côté serveur.

### S8 — Droits d’accès aux fonctionnalités

- **P0** : implémenter les règles Free/Premium effectivement retenues par Arthur dans un module d’autorisation dédié ; couvrir une lecture et une mutation pertinentes côté serveur.
- **P1** : afficher l’accès disponible et les limites dans les paramètres et fournir des erreurs métier cohérentes au frontend.
- **P2** : étendre les règles aux autres fonctionnalités stabilisées, avec leurs responsables.
- **Preuve** : un appel direct à l’API ne contourne pas une limite affichée dans l’interface. Les offres sont simulées tant qu’aucun paiement n’est intégré ; pas de tunnel de paiement ajouté par défaut. Si la monétisation est différée, renforcer export/suppression et les contrôles de compte plutôt qu’inventer des quotas.

### S9 — Vérification des accès du domaine compte

- **P0** : automatiser les scénarios négatifs sur profil, export, suppression et préférences : absence de session, session invalide et tentative d’accès à un autre utilisateur ; corriger les défauts de ce domaine.
- **P1** : vérifier la protection adaptée aux mutations selon le transport de session retenu et les limites d’abus sur les routes sensibles avec Arthur.
- **P2** : assister les responsables métier sur un défaut d’accès identifié, dans une PR coordonnée.
- **Preuve** : résultats reproductibles avec deux comptes fictifs et limites documentées. Cette vérification interne ne vaut pas certification de sécurité de l’application.

### S10 — Recette dans l’environnement cible

- **P0** : vérifier connexion, déconnexion, session, paramètres et export sur le déploiement cible ; contrôler les URLs de retour et l’absence de secrets dans les réponses publiques.
- **P1** : répéter la suppression sur un compte de test dédié avec les autorisations requises, puis documenter le diagnostic des incidents de compte sans journaliser les tokens.
- **P2** : corriger les écarts de configuration avec Arthur et préparer une fiche de support courte.
- **Preuve** : checklist exécutée avec environnement et résultats indiqués ; aucune opération destructive sur un compte réel. Arthur conserve le déploiement et les migrations restent coordonnées avec Ishak.

### S11 — Démonstration et transmission

- **P0** : préparer puis exécuter un scénario reproductible connexion → préférences → export sur données fictives ; expliquer le contrôle d’accès à partir d’un exemple concret.
- **P1** : présenter la suppression sur un compte jetable si elle est validée ; remettre les procédures de reproduction et limites connues.
- **P2** : contribuer à la démonstration collective ou corriger une anomalie prioritaire ; pas de nouvelle fonctionnalité majeure avant présentation.
- **Preuve** : démonstration répétée avant la soutenance, comptes fictifs disponibles et solution de secours identifiée comme enregistrée ou simulée si nécessaire.

## Dépendances et solution de repli

La connexion réelle exige la configuration Supabase V2 et des comptes de développement. Vérifier ce qui existe avant de demander de nouveaux accès. Ne jamais demander des secrets dans un rapport ou une conversation publique.

Sans ces accès, avancer sur formulaires, validation, interfaces de session et tests isolés avec des doublures clairement identifiées. Préparer les données d’entrée avec Ishak. Ces travaux sont utiles, mais le P0 d’intégration reste bloqué jusqu’à un test réel ; aucune désactivation d’authentification ne remplace celui-ci.

Si une dépendance bloque une séance ultérieure, Yann peut stabiliser une fonction précédente, ajouter ses cas limites ou prendre une tâche autonome après arbitrage. L’export et la suppression ne doivent pas être développés en supposant un schéma qui n’existe pas encore.

## Rapport et relecture

Utiliser le [modèle commun](TEMPLATE_RAPPORT_SEANCE.md) : `docs/seances/seance-X/RAPPORT_YANN.md`. Inclure un exemple d’entrée/action, le résultat attendu et observé, un refus d’accès et les limites. L’IA peut préparer le document ; Yann relit le diff et le rapport.

En S2 : Ishak relit Yann, Yann relit Clément et Clément relit Ishak. Pour les séances suivantes, Arthur confirme le relecteur selon le sujet ; les opérations de compte sensibles nécessitent une lecture du backend et de leur effet sur les données.
