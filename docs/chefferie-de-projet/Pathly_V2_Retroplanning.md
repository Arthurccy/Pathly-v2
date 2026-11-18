# Rétroplanning
Pathly V2

Projet Ydays • Année 2026–2027

Campus Ynov Rouen

Pilotage : Arthur Courchay

Document préparé le 16 novembre 2026

Objectif : livrer un démonstrateur de gestion financière permettant de comprendre son budget, suivre son patrimoine et simuler une décision.

## Sommaire
| Partie | Page |
| --- | --- |
| Organisation de l’équipe | 2 |
| Fonctionnement des séances | 3 |
| Analyse marketing et modèle économique | 4 |
| Phases du rétroplanning | 5 |
| Calendrier des séances par rythme | 6 |
| Objectifs et livrables par séance | 7 |
| Validation, dépendances et ajustements | 8 |
| Vision à long terme et références | 9 |

Cadre : neuf membres, onze séances de six heures. Les dates proviennent du calendrier pédagogique fourni ; les objectifs techniques sont issus des Markdown du projet.

# Organisation de l’équipe Pathly V2
L’équipe est organisée par domaines complémentaires. Chaque membre réalise ses développements, vérifie son périmètre et documente le résultat. Arthur coordonne les priorités et l’intégration collective.

| Membre | Rôle et responsabilités |
| --- | --- |
| Arthur COURCHAY | Chef de projet / Product Owner : cadrage, arbitrages, rétroplanning, CI, intégration et préparation de la soutenance. |
| Victor HUBERT | Responsable API et calculs financiers : trésorerie, règles métier, prévisions et simulations. |
| Rémy PORQUET | Responsable imports : fichiers bancaires, normalisation, réimports, catégorisation et qualité des données entrantes. |
| Ishak MESSAOUDI | Responsable données et contrats : modèle, migrations, seed reproductible, interfaces partagées et client API. |
| Loris NEVE | Responsable interfaces applicatives : dashboard, navigation, composants UI et intégration des écrans. |
| Jeremy CHAN-FUNG-TING | Responsable visualisation : graphiques financiers, interactions, lisibilité et solutions sans animation. |
| Clément LAUMOND | Responsable recette et fiabilité : parcours utilisateurs, non-régression et mesures de performance. |
| Mathias BOUCLON | Responsable pages publiques et communication : landing page, SEO, contenus pédagogiques et sources commerciales. |
| Yann DUCLOS | Responsable compte utilisateur : authentification, session, profil, préférences, export et suppression contrôlée. Arrivée prévue en séance 2. |

## Missions transversales
- Sécurité : Yann coordonne la session ; chaque auteur contrôle les autorisations de son domaine. Ishak vérifie l’isolation des données et Clément les parcours transversaux.
- Qualité et documentation : Clément coordonne la recette ; chacun fournit ses preuves et son rapport. Arthur décide des priorités et des fusions.
- Marketing et communication : Mathias prépare les supports et les sources ; Arthur valide le positionnement et les hypothèses commerciales.
# Fonctionnement des séances
Le travail se déroule en alternance, avec une reprise explicite entre les séances. L’assistance par IA accompagne la réalisation ; chaque membre reste responsable de la compréhension, de la relecture et des vérifications de sa contribution.

## Une séance type de six heures
| Étape | Durée proposée | Résultat attendu |
| --- | --- | --- |
| Ouverture et reprise | 20 min | Relire le bilan précédent, vérifier les accès et confirmer une priorité P0 par personne. |
| Production par domaine | 2 h | Développer sur les contrats convenus ; préparer les tests et une première intégration. |
| Point intermédiaire | 15 min | Présenter les blocages, confirmer les interfaces et ajuster les priorités. |
| Production et intégration | 2 h | Raccorder les briques, traiter les erreurs et réaliser les revues croisées. |
| Stabilisation et recette | 45 min | Vérifier le parcours collectif, corriger les anomalies prioritaires et conserver les preuves. |
| Démonstration et bilan | 40 min | Montrer le résultat, finaliser PR et rapports, préparer la reprise. |

Cette répartition est une proposition d’organisation totalisant six heures de travail. Les pauses et horaires sont adaptés au cadre de la séance.

## Priorités et suivi
- P0 : brique prioritaire testée et démontrable, avec documentation. P1 : approfondissement après stabilisation. P2 : réserve, aide ou cas limites.
- GitHub Projects, tickets et PR servent de suivi : responsable, séance, priorité, résultat attendu et dépendances.
- Un blocage est signalé avec les essais et le prérequis manquant. Le travail indépendant continue sur un contrat, des données fictives ou une interface compatible.
## Livrable de fin de séance
Chaque membre laisse une PR relue, un rapport court, un exemple reproductible et la prochaine action. Le bilan distingue les briques validées isolément, les fonctions intégrées, les blocages et les reports.

La capacité théorique est de 588 heures-personnes : huit membres sur onze séances, puis Yann sur dix séances. Elle inclut apprentissage, coordination, tests, documentation et préparation des rendus.

# Analyse marketing et modèle économique
## 1. Besoin et positionnement
Pathly V2 vise les particuliers qui souhaitent comprendre leur argent disponible, leurs dépenses à venir et leur patrimoine. Le produit répond à trois questions : « Que puis-je dépenser ? », « Que possède-je après mes dettes ? » et « Quel effet aurait une décision sur mon budget ? ».

Positionnement proposé : un outil visuel et pédagogique reliant budget quotidien, patrimoine et simulation. Les étudiants, alternants et jeunes actifs constituent une cible de travail à confronter à des retours utilisateurs.

## 2. Analyse concurrentielle à conduire
| Famille | Exemples à étudier | Axes de comparaison |
| --- | --- | --- |
| Budget et agrégation | Bankin’, Linxo | Import, lisibilité du budget, catégorisation, transparence des limites. |
| Patrimoine et investissement | Finary | Synthèse actifs/dettes, historique, simulation et pédagogie. |
| Outils généralistes | Excel, Google Sheets, Notion | Saisie, souplesse, effort de mise à jour et compréhension des calculs. |

Ce tableau définit un travail de benchmark ; il ne constitue pas une évaluation vérifiée des offres actuelles. Mathias documente les fonctionnalités et tarifs avec source et date de consultation.

## 3. Modèle économique envisagé
Une offre Freemium peut distinguer un accès de découverte et des fonctions Premium. Le tarif de 9,99 €/mois mentionné dans le cadrage reste une hypothèse commerciale à tester. Les fonctionnalités et limites de chaque offre doivent être arbitrées avant leur mise en œuvre.

La viabilité devra comparer revenus envisagés et coûts réels : hébergement, stockage, fournisseurs de données, connexion bancaire et maintenance. Aucun objectif de conversion, revenu ou rentabilité n’est considéré comme acquis.

## 4. Communication et acquisition
- Priorité : landing page fidèle au démonstrateur, parcours de découverte et contenus pédagogiques sur le budget et les simulations.
- Pistes à tester : visibilité sur le campus, démonstrations auprès d’utilisateurs volontaires, référencement naturel et formats courts éducatifs.
- Soutenance : présenter les retours réellement recueillis et distinguer les pistes d’acquisition des résultats observés.
# Phases du rétroplanning
Le rétroplanning part des oraux de mai 2027 et de la finale nationale du 9 juin 2027. Les livrables sont préparés progressivement pour réserver les dernières séances à la recette, au déploiement et à la démonstration.

## Phase 1 — Cadrage et constitution de l’équipe | mai à novembre 2026
- Appel à projet de mai à septembre ; staffing en octobre ; finalisation des rôles et du rétroplanning en novembre.
- Cadrer le parcours prioritaire, l’architecture, les responsabilités et les critères de réussite. Préparer les contrats et les jeux de données de démonstration.
Livrables visés : équipe constituée, vision produit, backlog priorisé, première interface et plan de travail.

## Phase 2 — Validation et préparation de la production | novembre à janvier
- Préparer l’oral intermédiaire de décembre : problème, cible, périmètre, architecture, organisation et démonstration de ce qui est effectivement disponible.
- Viser le socle session → import → comptes/transactions → trésorerie ; stabiliser les erreurs et la navigation selon la capacité disponible.
- Aux ateliers de janvier : ajuster les priorités et les dépendances à partir du bilan de validation.
Livrables visés : dossier de validation, premiers résultats vérifiables et backlog ajusté.

## Phase 3 — Production | janvier à mai 2027 selon le rythme
- Sprint 1 : patrimoine et valorisation. Sprint 2 : historique et variations. Sprint 3 : catégorisation et robustesse des imports.
- Sprint 4 : prévisions de trésorerie. Sprint 5 : un parcours complet de simulation et recette transversale prioritaire.
- Tout au long des sprints : compte utilisateur, export, suppression, confidentialité, intégration UI, tests et contenus publics.
Livrables visés : incréments intégrés avec calculs expliqués, données persistées et accès isolés.

## Phase 4 — Recette, livraison et soutenance | mai à juin 2027
- Avant la recette : traiter les anomalies critiques et préparer déploiement, migrations et retour arrière. En S10 : vérifier le parcours dans l’environnement cible et répéter le pitch.
- En S11 : présenter une démonstration reproductible, le bilan, les limites et les perspectives. Préparer la finale du 9 juin si le projet y participe.
Les travaux techniques en amont de la production sont des objectifs proposés, à ajuster au temps disponible. Les jalons pédagogiques du calendrier restent les échéances de référence.

# Calendrier des séances par rythme
Calendrier pédagogique 2026–2027, retranscrit depuis le tableau fourni. Les trois rythmes sont conservés : aucun rythme n’est attribué à l’équipe dans les documents consultés.

| Séance | Intitulé | Sem. A | Sem. B | Sem. C |
| --- | --- | --- | --- | --- |
| AaP | Appel à projet | Mai–sept.<br>2026 | — | — |
| 1 | Staffing des équipes · JobDating | 21/10/26 | 28/10/26 | 14/10/26 |
| 2 | Finalisation des équipes · rétroplanning | 12/11/26 | 18/11/26 | 25/11/26 |
| 3 | Oral de validation · oral intermédiaire | 02/12/26 | 09/12/26 | 16/12/26 |
| 4 | Production · ateliers Project Management | 06/01/27 | 13/01/27 | 20/01/27 |
| 5 | Production · sprint 1 | 07/01/27 | 14/01/27 | 21/01/27 |
| 6 | Production · sprint 2 | 27/01/27 | 03/02/27 | 03/03/27 |
| 7 | Production · sprint 3 | 10/03/27 | 24/02/27 | 24/03/27 |
| 8 | Production · sprint 4 | 31/03/27 | 17/03/27 | 14/04/27 |
| 9 | Production · sprint 5 | 21/04/27 | 07/04/27 | 05/05/27 |
| 10 | Recette / préparation orale | 12/05/27 | 19/05/27 | 26/05/27 |
| 11 | Oral final · pitch et démo devant jury | 13/05/27 | 20/05/27 | 27/05/27 |

YDAYS EVENT — Finale nationale : mercredi 9 juin 2027.

Dates susceptibles d’ajustements : se référer au fichier de cadrage pédagogique, onglet « Timeline ». Le rythme retenu devra être confirmé pour disposer d’une seule suite de dates opérationnelles.

## Lecture du calendrier
- Le numéro de séance renvoie ici au jalon pédagogique officiel. Le tableau de la page suivante propose le rattachement des objectifs techniques de la roadmap à ces onze séances.
- La recette et l’oral final sont consécutifs pour les trois rythmes. Le déploiement, les données de démonstration et le support oral doivent donc être préparés avant S10.
- La finale constitue une échéance distincte de l’oral final. Sa préparation dépend de la participation du projet ; aucune séance supplémentaire de six heures n’est présumée.
# Objectifs et livrables par séance
Proposition d’alignement entre les jalons pédagogiques et la roadmap technique. Le contenu de S4 à S9 est réparti pour tenir compte des ateliers et des cinq sprints. Chaque résultat reste à confirmer par des preuves de fonctionnement.

| Séance / jalon | Objectif technique et livrable visé | Responsables principaux |
| --- | --- | --- |
| S1 · Staffing | Rôles, vision produit, architecture, monorepo et première interface. Préparer les contrats et le backlog. | Arthur + équipe<br>(hors Yann) |
| S2 · Rétroplanning | Rétroplanning et tickets. Viser une première intégration session, import, transactions, trésorerie et dashboard. | Arthur ; Victor, Rémy, Ishak, Loris, Yann |
| S3 · Validation | Dossier et oral intermédiaire. Stabiliser le socle et la navigation ; montrer les résultats disponibles et les blocages. | Arthur + équipe |
| S4 · Ateliers PM | Revoir le backlog et les dépendances. Préparer contrats, données patrimoniales et règles de valorisation. | Arthur, Ishak, Victor |
| S5 · Sprint 1 | Patrimoine : consultation/saisie d’un type d’actif, synthèse actifs/dettes, source datée si disponible et export du compte. | Victor, Ishak, Loris, Jeremy, Yann |
| S6 · Sprint 2 | Historique et variations cohérentes ; filtres, rapprochements ambigus et suppression contrôlée du compte de test. | Victor, Rémy, Ishak, Loris, Jeremy, Yann |
| S7 · Sprint 3 | Catégorisation explicable, correction persistée, imports partiels et confidentialité. Bilan des lignes acceptées/refusées. | Rémy, Victor, Ishak, Loris, Yann |
| S8 · Sprint 4 | Prévision de trésorerie : hypothèses visibles, échéances, réserve/horizon et courbe lisible. | Victor, Rémy, Ishak, Loris, Jeremy, Yann |
| S9 · Sprint 5 | Un scénario de simulation complet ; recette transversale, droits et corrections prioritaires. Préparer la livraison. | Équipe ; coordination Arthur et Clément |
| S10 · Recette | Déployer et vérifier dans la cible : parcours, session, export, migrations et retour arrière. Répéter la démonstration. | Arthur, Ishak, Clément + équipe |
| S11 · Oral final | Pitch, démonstration reproductible, bilan technique et commercial, limites et transmission. | Arthur + les neuf membres |

À chaque étape, Clément coordonne la recette ; Mathias prépare les contenus publics et le discours produit. Chaque auteur assure les tests et la documentation de son domaine. Les responsables principaux ci-dessus ne sont pas les seuls contributeurs.

Les missions individuelles détaillées restent dans les Markdown. Les reports sont arbitrés collectivement : une séance arrivée à échéance ne signifie pas que ses objectifs sont réalisés.

# Validation, dépendances et ajustements
## Critères de livraison
- Parcours de référence : ouvrir une session → importer des opérations → consulter les comptes → comprendre le reste-à-dépenser → consulter le patrimoine → simuler une décision.
- Pour chaque fonction présentée : entrées, traitement, persistance attendue, affichage, droits d’accès et erreur sont vérifiés sur un exemple reproductible.
- Les données importées, saisies, estimées et fictives sont identifiables. Les formules, unités et hypothèses sont expliquées ; les totaux évitent le double comptage.
- Les PR sont relues et les résultats consignés. Une validation sur données simulées reste distincte d’une intégration avec les dépendances réelles.
## Dépendances et solutions de repli
| Dépendance / risque | Réponse prévue | Coordination |
| --- | --- | --- |
| Accès d’authentification ou base indisponible | Avancer avec contrats et données fictives ; conserver le blocage d’intégration jusqu’au test réel. | Yann, Ishak, Arthur |
| Connexion bancaire ou fournisseur de prix non validé | Démontrer les imports documentés ; utiliser une valorisation saisie ou fictive, datée et identifiée. | Rémy, Victor, Mathias |
| Écart entre API, modèle et interface | Définir les contrats avant raccordement, tester ensemble et intégrer progressivement. | Ishak + responsables concernés |
| Retard ou absence | Réduire formats, variantes et scénarios ; redistribuer les tâches et consigner les reports. | Arthur + équipe |
| Défaut de calcul ou d’accès | Corriger avant livraison du parcours concerné ; préserver exactitude et isolation des utilisateurs. | Auteur du domaine, Clément |
| Échec de déploiement ou de démonstration | Préparer retour arrière, données fictives reproductibles et support de secours clairement identifié. | Arthur, Ishak, Clément |

## Points de contrôle en remontant depuis l’oral
S11 : démonstration déjà répétée. S10 : recette dans la cible et correction des derniers écarts. Fin S9 : périmètre figé pour la soutenance, anomalies prioritaires traitées et procédure de livraison préparée. Dès les premiers sprints : conserver les scénarios de référence et les preuves utiles.

En cas de retard, Arthur réduit les extensions avant d’entamer les contrôles d’accès, l’exactitude des calculs ou le temps de recette. Les tâches reportées gardent un responsable et une prochaine action.

# Vision à long terme et références
## Évolutions envisagées après le démonstrateur
- Connexion bancaire : explorer une intégration Powens ou Bridge après validation des accès, conditions d’usage, coûts et contrôles nécessaires.
- Patrimoine et simulation : élargir les types d’actifs, formats et scénarios en fonction des besoins observés et de sources de données exploitables.
- Offre commerciale : confronter l’hypothèse Freemium/Premium aux retours utilisateurs et aux coûts réels avant un éventuel paiement.
- Pédagogie financière : enrichir les explications et contenus pour rendre les décisions et leurs hypothèses compréhensibles.
Ces évolutions appartiennent à la vision à long terme. Le périmètre des onze séances reste un démonstrateur cohérent et vérifiable ; les extensions font l’objet d’arbitrages.

## Conclusion
Pathly V2 mobilise neuf membres autour d’un parcours financier continu, du budget quotidien à la simulation de projet. Le rétroplanning répartit le travail jusqu’aux oraux de mai 2027 et prévoit la finale du 9 juin comme échéance distincte. Chaque séance doit laisser un résultat compréhensible, des vérifications et une base de reprise pour l’équipe.

## Références utilisées
Les Markdown ci-dessous constituent les références opérationnelles. Ce document synthétise leurs objectifs ; il n’atteste pas de la réalisation des fonctionnalités.

- README.md : équipe et responsabilités.
- docs/README.md et CONTRIBUTING.md : organisation, priorités, revues, validation et rendu.
- docs/VISION_PRODUIT.md : utilisateurs, ambition, périmètre et hypothèses commerciales.
- docs/chefferie-de-projet/ROADMAP_GLOBALE_11_SEANCES.md : progression collective.
- docs/chefferie-de-projet/MISSIONS_PAR_SEANCE.md : missions individuelles S3 à S11.
- docs/chefferie-de-projet/YANN_MISSIONS.md : domaine compte utilisateur et arrivée en S2.
- Calendrier pédagogique transmis dans le chat : dates par rythme et finale nationale.
La pièce jointe de rétroplanning a servi de référence de structure et de présentation. Les statistiques de marché et projections financières non vérifiées n’ont pas été reprises.

À confirmer pour le suivi opérationnel : le rythme A, B ou C de l’équipe. Les dates restent celles du calendrier fourni, sous réserve des ajustements de l’établissement.
