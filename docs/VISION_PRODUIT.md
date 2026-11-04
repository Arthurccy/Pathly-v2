# Pathly V2 — Vision produit et ambition

## Utilisateur et problème

Pathly aide un particulier à comprendre son argent disponible, ses dépenses à venir et son patrimoine. Le produit doit répondre à trois questions : « Que puis-je dépenser ? », « Que possède-je réellement après mes dettes ? » et « Quel est l’effet d’une décision sur mon budget ou mon projet ? ».

Le parcours de référence est : ouvrir sa session → importer des opérations → consulter ses comptes → comprendre son reste-à-dépenser → consulter son patrimoine → simuler une décision. L’interface distingue les données importées, saisies, estimées et fictives.

## Niveau d’ambition

L’objectif des onze séances est un démonstrateur déployé, cohérent et techniquement défendable : données persistées pour le parcours retenu, accès utilisateurs isolés, calculs expliqués, erreurs gérées et démonstration reproductible. L’expérience visuelle et la fluidité font partie du produit ; elles accompagnent des fonctions vérifiées.

Une séance représente six heures par personne, soit 66 heures théoriques sur onze séances pour un membre présent dès S1. Ces heures incluent développement, apprentissage, échanges, tests et rendus. L’arrivée de Yann en S2 représente dix séances prévues. L’alternance impose de pouvoir reprendre le travail après une interruption : chaque PR doit laisser une procédure et un état compréhensibles.

Les IA servent à accélérer exploration, réalisation et vérification. Leur utilisation ne justifie ni un facteur de vitesse garanti ni une multiplication automatique du périmètre. Les priorités sont ajustées selon la vitesse réellement observée, les dépendances et la qualité des résultats.

## Périmètre

| Catégorie                  | Résultat recherché                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Socle prioritaire          | Session, import documenté, comptes/transactions, calcul de trésorerie explicable et dashboard |
| Patrimoine                 | Actifs, dettes, synthèse sans double comptage et historique pertinent                         |
| Aide à la décision         | Prévisions fondées sur des hypothèses et un parcours de simulation complet                    |
| Expérience                 | Responsive, clavier, états de chargement/erreur, visualisation lisible et effets mesurés      |
| Compte et données          | Paramètres, export, suppression contrôlée et isolation entre utilisateurs                     |
| Présentation               | Landing page fidèle au produit, démonstration et bilan des résultats                          |
| Exploration conditionnelle | Comparateur tarifaire, cotations et quotas commerciaux selon données disponibles et priorités |

La prise en charge bancaire est définie par les formats et fixtures réellement testés. Une intégration Powens/Bridge présente dans le code ne constitue pas une connexion bancaire validée. Le projet peut démontrer son parcours avec des imports et des données fictives sans promettre une synchronisation bancaire opérationnelle.

## Hors engagement des onze séances

Pas d’engagement de commercialisation, de certification de sécurité, de conseil financier personnalisé ou de couverture universelle des banques. Le paiement, l’affiliation, les cotations temps réel multi-fournisseurs et la prédiction par apprentissage automatique ne sont pas requis par défaut. Ils nécessiteraient un arbitrage explicite et une réduction correspondante du périmètre ailleurs.

Les chiffres de marge, d’économies, de rétention ou de performance doivent être mesurés, sourcés ou identifiés comme hypothèses. Un abonnement à 9,99 €/mois est une proposition commerciale, pas la preuve d’un modèle rentable. Un prix moyen de marché ne suffit pas à garantir une économie individuelle.

## Jalons et arbitrages

- S2 : chaque domaine fonctionne isolément ; première intégration du parcours prioritaire avec les dépendances disponibles.
- S3 : stabiliser les écarts S2 avant d’étendre la navigation et les parcours.
- S4 à S8 : approfondir patrimoine, données et simulation, en livrant des incréments utilisables.
- S9 : traiter les anomalies transversales, contrôler les accès et mesurer la charge utile.
- S10 : déployer et vérifier dans l’environnement cible.
- S11 : démontrer ce qui fonctionne, expliquer les choix et présenter les limites.

Une fonction n’est pas « prête » parce que son écran existe. Pour le parcours visé, on vérifie données d’entrée, calcul ou traitement, persistance si attendue, affichage, droits et erreur. Une brique validée isolément reste un résultat utile, avec un statut distinct de l’intégration.

Si le temps manque, réduire d’abord le nombre de formats, de variantes visuelles, de fournisseurs ou de scénarios. Préserver les contrôles d’accès, l’exactitude des calculs livrés et les preuves de fonctionnement.
