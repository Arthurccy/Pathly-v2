# Séance 2 — Tickets et critères d’acceptation

Règles communes : [briefing de séance](../BRIEFING_SEANCE_POUR_IA.md).
P0 : brique vérifiée, testée et documentée ; intégration réelle vérifiée dès que disponible. P1 : cible de journée après stabilisation du P0. P2 : réserve à arbitrer.
Les [contrats et la matrice d’autonomie](../architecture/CONTRATS_SEANCE_2.md) permettent à chacun de commencer sans attendre une autre branche. Les critères décrivent des résultats, pas seulement des fichiers à créer. L’effort est réévalué à 10 h 30 et 14 h 30 selon les résultats réels.

## 1. Arthur — Outillage, décisions et intégration

**Démarrage autonome** : Manifests, commandes et branche de contrôle ; la configuration CI n’attend pas les fonctionnalités métier.

Branche : `chore/scrum-ci-rules`. Relecture initiale : Mathias.

**P0**

- Confirmer les accès de développement et les commandes d’installation/démarrage ; rendre visibles les blocages communs dès le matin.
- Confirmer les contrats de départ, les responsables de fichiers partagés et les exemples avant 10 h ; ne pas imposer l’attente d’une validation pour commencer des tests isolés.
- Mettre en place une CI reproductible sur PR : installation avec lockfile figé, compilation/typecheck et tests pertinents. Configurer les contrôles manquants sans cacher les erreurs existantes ; consigner les écarts hors périmètre.
- Coordonner les ajouts de dépendances, deux intégrations intermédiaires et la recette finale. Répartir les revues plutôt que les concentrer en fin de journée.

**P1** : compléter le lint, documenter les règles de fusion et préparer une synthèse de démonstration à partir des résultats réels. Si les droits GitHub le permettent, configurer les protections de branche convenues.

**P2** : hooks locaux et contrôle automatisé de présence du rapport. Les quotas commerciaux restent une proposition documentée ; leur implémentation n’est pas requise en S2.

**Acceptation** : une PR exécute les contrôles configurés ; une erreur volontaire dans une branche de vérification est détectée puis retirée. Le parcours collectif est décrit comme réussi ou bloqué avec une preuve. Ne pas prétendre que les protections sont actives sans les avoir vérifiées.

## 2. Victor — API et calculs de trésorerie

**Démarrage autonome** : Calcul pur et dépôt simulé selon les exemples S2 ; préparer séparément l’adaptateur Prisma et la consommation de l’identité.

Branche : `feat/back-api-domain-mock`. Relecture : Rémy.
Zone : comptes, transactions et module de calcul ; préparer les changements de schéma/client séparément et les faire relire par Ishak. Yann possède le guard d’authentification commun ; Victor utilise son identité validée et conserve les filtres d’autorisation métier.

**P0**

- Stabiliser les endpoints comptes/transactions : contrats typés, validation des entrées et accès limité à l’utilisateur authentifié.
- Livrer un service Safe-to-Spend et son endpoint. Définir période, charges restantes, réserve d’épargne, arrondis et comportement si une donnée manque.
- Fournir des tests métier et un exemple vérifié à la main : 1 500 € disponibles − 800 € de charges restantes − 200 € de réserve = 500 € disponibles sur la période. Toute déclinaison journalière précise son dénominateur.

**P1** : exposer la synthèse de patrimoine calculée par Ishak ; intégrer une estimation tarifaire uniquement si les données validées par Mathias le permettent. Sinon, livrer un contrat et un exemple explicitement simulé, sans annoncer un comparateur opérationnel.

**P2** : enrichissement des règles de charges récurrentes et benchmark du calcul sur fixtures documentées. Le moteur d’amortissement avancé est reporté à une séance dédiée.

**Acceptation** : résultats attendus sur cas nominal, solde négatif, charges nulles et données incomplètes ; refus d’accès non authentifié et vérification d’isolation entre deux utilisateurs fictifs. Swagger correspond aux réponses réelles. Les temps de calcul sont séparés des temps réseau/BDD.

## 3. Rémy — Import bancaire et normalisation

**Démarrage autonome** : Fixtures CSV/OFX et prévisualisation sans BDD ; persistance via une interface de dépôt.

Branche : `feat/back-bank-statement-parser`. Relecture : Victor.
Zone : nouveau module d’import, tests et fixtures associés. Persistance et contrat convenus avec Ishak.

**P0**

- Importer un format CSV documenté, avec mapping explicite des colonnes et prévisualisation des transactions normalisées.
- Gérer séparateur, virgule décimale, dates et lignes invalides sans perdre silencieusement des données.
- Livrer une politique de réimport qui distingue autant que possible réimport et transactions identiques légitimes ; exposer les cas ambigus.
- Préparer des fixtures fictives et tester le résultat normalisé ainsi que les erreurs.

**P1** : ajouter le format OFX et un deuxième profil CSV ; normaliser un petit ensemble explicite de commerçants, en conservant le libellé original. L’identification d’un fournisseur ne prouve pas l’existence d’une économie.

**P2** : profils bancaires supplémentaires à partir de fixtures disponibles ; mesure sur 1 000 lignes avec protocole reproductible. Ne pas annoncer six banques supportées sans un exemple testé pour chacune.

**Acceptation** : import nominal, fichier mal formé, réimport et deux opérations légitimes identiques vérifiés. La prévisualisation fonctionne sans persistance ; l’écriture authentifiée est vérifiée séparément. Aucun relevé personnel n’entre dans le dépôt.

## 4. Ishak — Contrats, données et synthèse patrimoniale

**Démarrage autonome** : Schéma existant, contrats par domaine et plan de seed ; tests de calcul indépendants de la BDD.

Branche : `feat/fullstack-prisma-seed-bridge`. Relecture : Clément.
Zone : database, shared-types et client API web. Fournir tôt des exemples aux autres.

**P0**

- Comparer le schéma existant aux besoins : les modèles patrimoniaux sont déjà présents. Compléter uniquement les écarts nécessaires et valider la procédure de migration sur une base de développement dédiée.
- Publier les contrats d’import, trésorerie, compte utilisateur et widgets convenus avec leurs auteurs ; préciser montants, dates et statuts d’erreur.
- Livrer un seed reproductible pour un persona complet, sans doublons au second lancement et sans effacer des données non prévues.
- Compléter le client API pour le parcours retenu, avec authentification et erreurs réseau explicites.

**P1** : implémenter une fonction de synthèse patrimoniale testée, consommée par Victor et les widgets ; étendre le seed aux deux autres personas. Exemple de référence : 2 000 € de trésorerie + 5 000 € d’investissements + 10 000 € de biens − 3 000 € de dettes = 14 000 €. Éviter le double comptage des comptes d’investissement.

**P2** : ERD et jeux de données supplémentaires utiles à la démonstration. Pas de cotations de marché en direct en S2.

**Acceptation** : génération Prisma, seed exécuté deux fois avec résultat cohérent, données accessibles seulement par leur propriétaire et appel du client web vérifié. Si la BDD manque, livrer les contrats et fixtures, mais déclarer la persistance bloquée.

## 5. Loris — Dashboard et parcours utilisateur

**Démarrage autonome** : Réponses API fixes pour états nominal, vide et erreur ; point de montage réservé pour chaque widget.

Branche : `feat/front-shadcn-responsive-layout`. Relecture : Jeremy.
Zone : dashboard, layout, styles globaux, comptes/transactions et institutions. Intégrateur des composants de Jeremy et Clément.

**P0**

- Structurer le dashboard en composants et réserver des emplacements documentés pour la trésorerie, le patrimoine et les visualisations.
- Brancher le parcours comptes/transactions et afficher les états chargement, vide et erreur. Toute donnée de démonstration reste identifiée comme telle.
- Assurer une navigation clavier utilisable et un rendu vérifié sur mobile et desktop.

**P1** : intégrer les mises à jour optimistes avec Clément et le composant financier de Jeremy ; ajouter une saisie de bien physique avec validation et un sélecteur de personas lorsque leurs données sont disponibles.

**P2** : étendre la saisie à d’autres catégories, compléter les logos et le thème. Ne pas créer cinq formulaires superficiels pour satisfaire une liste ; chaque formulaire livré a un comportement d’enregistrement et d’erreur défini.

**Acceptation** : un utilisateur retrouve ses comptes et transactions ; erreurs et absence de données restent compréhensibles. Captures aux deux tailles d’écran et vérification clavier. Pas de modification de `/landing`.

## 6. Jeremy — Visualisation financière et interactions

**Démarrage autonome** : Props financières fixes et composant isolé ; préparer son montage sans modifier le dashboard en parallèle.

Branche : `feat/front-r3f-canvas-motion`. Relecture : Loris.
Zone : composants autonomes dans un répertoire de visualisation dédié, convenu avec Loris.

**P0**

- Livrer une visualisation de santé financière et une répartition patrimoniale alimentées par les contrats convenus, avec exemples sain, tendu et données absentes.
- Fournir une version statique accessible : information lisible sans animation, respect de la réduction des mouvements et présentation des dettes distincte des actifs.
- Documenter les props et faire intégrer le composant avec Loris avant la fin de séance.

**P1** : ajouter le rendu 3D chargé à la demande, son chargement et un repli si WebGL n’est pas disponible. Mesurer son coût avec Clément sur une configuration indiquée.

**P2** : visite guidée courte des éléments déjà intégrés, puis enrichissement visuel si les mesures le permettent. Pas de particules ou gyroscope imposés pour valider le P0.

**Acceptation** : changements des données reflétés dans le rendu, absence de données gérée, version sans mouvement utilisable et absence d’erreur de rendu serveur. Un chiffre de FPS n’est publié qu’avec son protocole de mesure.

## 7. Clément — Fiabilité du parcours et performance

**Démarrage autonome** : Scénario de recette, build frontend et promesses de mutation simulées ; raccordement à une écriture réelle traité séparément.

Branche : `feat/perf-streaming-bundle-benchmarks`. Relecture : Yann.
Zone : instrumentation, tests de parcours et module de mutation isolé ; modifications du dashboard intégrées avec Loris.

**P0**

- Définir et exécuter une recette du parcours commun : import, consultation, calcul, états d’erreur. Mettre en place un test de parcours reproductible et automatiser les étapes stables avec l’outillage convenu.
- Établir une mesure initiale du frontend en build de production, sur un appareil/profil réseau et un jeu de données documentés.
- Livrer un mécanisme isolé de mutation optimiste avec confirmation et rollback ; vérifier réussite, refus serveur et erreur réseau, sans inventer une écriture persistante inexistante.

**P1** : intégrer cette mutation avec Loris sur une action dont l’API existe ; analyser le bundle et corriger un problème mesuré. Comparer avant/après dans les mêmes conditions.

**P2** : découpage ou chargement différé supplémentaire justifié par les mesures ; seconde configuration mobile. Suspense et streaming sont utilisés si le flux de données le justifie, pas comme une obligation de réécriture.

**Acceptation** : recette avec résultats réels, reproduction documentée d’un échec, rollback conservant l’état cohérent, mesures datées et conditions explicites. Aucun score Lighthouse garanti sur tout appareil.

## 8. Mathias — Landing page et validation des données commerciales

**Démarrage autonome** : Route `/landing` indépendante et sources publiques ; simulation pédagogique si les données tarifaires manquent.

Branche : `feat/seo-metadata-schema-ld`. Relecture : Arthur.
Zone : `/landing`, ses composants, SEO public et `docs/sources/` pour les références tarifaires.

**P0**

- Livrer `/landing` responsive avec proposition de valeur fidèle au produit, métadonnées et appel à l’action cohérent avec le mode démo.
- Vérifier les sources énergie/télécom envisagées : URL, date, licence ou conditions de réutilisation, granularité et variables requises. Transmettre rapidement à Victor ce qui est exploitable et ce qui ne l’est pas.
- Préparer un exemple de calcul d’économies avec hypothèses explicites ; distinguer données observées, simulation et hypothèse commerciale.

**P1** : créer un simulateur pédagogique utilisant les seules données validées, avec message d’insuffisance des informations ; ajouter pricing proposé, sitemap et robots cohérents avec les routes publiques.

**P2** : données structurées correspondant au contenu réel et synthèse commerciale pour la soutenance. Aucune projection LTV/CAC ou marge présentée comme mesurée sans données.

**Acceptation** : page et CTA testés, sources consultables, exemple recalculable et aucune promesse de gain personnalisée à partir du seul nom d’un fournisseur. Une source inutilisable constitue un résultat de recherche à documenter, pas une invitation à inventer des offres.

## 9. Yann — Compte utilisateur et authentification

**Démarrage autonome** : Client d’identité et dépôt de profil simulés dans les tests ; parcours Supabase réel vérifié séparément.

Branche : `feat/auth-user-account`. Relecture : Ishak.
Zone : routes `/connexion` et `/parametres`, composants de compte, helpers de session Supabase, module API utilisateur et guard commun existant. Contrats/migrations intégrés par Ishak ; liens du dashboard intégrés par Loris.

**P0**

- Prendre en main le parcours web/API et examiner le guard existant avant de le modifier. Confirmer avec Ishak la liaison entre l’utilisateur Supabase et son profil applicatif.
- Livrer connexion/déconnexion sur Supabase V2 de développement, avec validation du formulaire, message d’échec et état de session explicite.
- Définir avec Victor et Rémy comment l’identité validée est transmise aux endpoints. La présence d’un utilisateur dans l’interface ou d’un identifiant envoyé par le navigateur ne suffit pas à autoriser une requête.
- Vérifier le parcours complet d’un compte fictif : connexion → lecture authentifiée de ses comptes → déconnexion → accès refusé. Aucun secret serveur ne passe au frontend.

**P1** : restaurer une session après rechargement, traiter son expiration et livrer `/parametres` avec affichage du profil et modification du nom via une route limitée au propriétaire. Tests de deux utilisateurs avec Ishak/Victor.

**P2** : améliorer les états de formulaire et la réinitialisation du mot de passe via les mécanismes Supabase, si l’envoi d’e-mails et les URLs de retour sont configurés. Pas de système d’authentification maison ni d’OAuth supplémentaire en S2.

**Acceptation** : connexion valide et invalide, déconnexion et requête sans session exécutées ; nom du propriétaire affiché sans fuite de token. Les cas P1 livrés sont aussi vérifiés : rechargement, expiration, refus de modifier un autre profil. Si les accès Supabase manquent, développer les composants et tests isolés avec des doublures identifiées, puis déclarer l’intégration bloquée ; ne pas affaiblir le guard pour réussir la démonstration.

Le [plan des séances suivantes](YANN_MISSIONS.md) lui attribue les paramètres, l’export, la suppression et la confidentialité du compte. Il reste responsable des vérifications de son domaine ; Clément conserve la recette collective et Arthur les contrôles CI.

## Rééquilibrage pendant la séance

Le plan tient compte des dépendances, sans supposer une vitesse identique pour tous. La comparaison du schéma existant remplace sa recréation ; le comparateur n’est plus entièrement porté par Victor ; la recette collective est portée par Clément ; Yann prend en charge la session commune et les fonctionnalités de compte ; les revues sont réparties.

À chaque point de passage, chacun indique : résultat démontré, blocage et prochaine tâche. Arthur peut transférer une tâche autonome avec son critère d’acceptation et son propriétaire de fichiers. Si une personne finit tôt, la priorité est la relecture, puis l’intégration, puis son P1/P2. Les réalisations sont reportées dans le rapport individuel, sans créer un second suivi concurrent.
