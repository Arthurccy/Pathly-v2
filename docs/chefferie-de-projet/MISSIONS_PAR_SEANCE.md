# Missions individuelles — S3 à S11

## Utilisation

Ce document donne une direction de travail à chaque membre pour les séances restantes. Les [tickets S2](GITHUB_PROJECTS_SEANCE_2.md) restent la référence détaillée de la prochaine séance ; la [roadmap](ROADMAP_GLOBALE_11_SEANCES.md) fixe les jalons collectifs. Le [guide de contribution](../../CONTRIBUTING.md) définit les modalités de développement et de rendu.

Les lignes suivantes sont des bases de tickets : P0 = brique testée et démontrable ; P1 = approfondissement prévu après stabilisation. Avant chaque séance, confirmer le périmètre, le contrat et les critères selon l’état livré. Les vérifications et le rapport font partie du P0. L’intégration réelle est vérifiée séparément au point de raccordement ; une dépendance absente n’empêche pas d’avancer isolément mais reste un blocage visible pour le parcours complet.

Chaque ligne indique un moyen de démarrer sans attendre une autre personne. Une fixture est conforme au contrat convenu, jamais une nouvelle interface inventée pour contourner une difficulté. Les responsables des domaines raccordent leurs briques ensemble ; les coordinateurs relisent les changements partagés. Les propositions de nouvelles fonctions restent conditionnées aux arbitrages produit, notamment sources externes et quotas commerciaux.

**P2 commun** : après P0, revue et P1, enrichir les cas limites de son domaine, améliorer sa documentation de reproduction ou aider une intégration ciblée. Une extension fonctionnelle supplémentaire est décidée avec Arthur. La mission de Yann est approfondie dans son [plan individuel](YANN_MISSIONS.md), sans deuxième suivi à maintenir.

**Rendu pour tous** : branche et PR liées au ticket, preuves réellement obtenues, rapport court `docs/seances/seance-X/RAPPORT_PRENOM.md`, limites et prochaine action. Le statut distingue validation isolée, intégration, blocage et report. Les critères ci-dessous sont des preuves attendues, pas des résultats déjà constatés.

## S3 — Stabilisation et navigation

| Personne | P0                                                                  | P1                                               | Démarrage autonome                          | Preuve attendue                                |
| -------- | ------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------- | ---------------------------------------------- |
| Arthur   | Stabiliser les contrôles CI et ordonner les corrections S2          | Préparer un déploiement de prévisualisation      | Branche de contrôle et scripts existants    | Une régression volontaire est détectée         |
| Victor   | Stabiliser validation et erreurs des endpoints comptes/transactions | Raccorder les paramètres du calcul de trésorerie | Dépôt simulé et scénarios de référence      | Entrée invalide refusée ; résultat stable      |
| Rémy     | Finaliser réimports et erreurs de lignes du profil CSV retenu       | Stabiliser OFX ou un deuxième profil             | Fixtures nominales et corrompues            | Aucune perte silencieuse ; ambiguïtés exposées |
| Ishak    | Fiabiliser seed reproductible et raccordement du client API         | Compléter les personas manquants                 | Schéma et plan de seed fictif               | Deux exécutions sans doublons                  |
| Loris    | Organiser comptes, transactions et navigation en pages cohérentes   | Raccorder les modules S2 validés                 | API simulée, états chargement/vide/erreur   | Parcours clavier et mobile reproductible       |
| Jeremy   | Stabiliser les composants et leurs replis sans animation            | Livrer une visite guidée courte                  | Props fixes et points de montage documentés | Lecture possible sans WebGL ni mouvement       |
| Clément  | Automatiser le parcours stable et vérifier les rollbacks            | Corriger un coût de chargement mesuré            | Promesses simulées et build frontend        | Succès et échec vérifiés ; mesure comparable   |
| Mathias  | Rendre landing, CTA et métadonnées cohérents avec le produit        | Ajouter sitemap/robots pour les pages publiques  | Routes publiques et contenu validé          | Pas d’indexation de pages privées prévue       |
| Yann     | Fiabiliser session, profil et paramètres après S2                   | Réinitialisation du mot de passe                 | Clients d’identité et de profil simulés     | Expiration et propriété du profil vérifiées    |

## S4 — Patrimoine et valorisation

| Personne | P0                                                                        | P1                                                       | Démarrage autonome                                   | Preuve attendue                                            |
| -------- | ------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Arthur   | Arbitrer les sources de prix et leurs conditions d’usage                  | Documenter les décisions de valorisation                 | Dossier de sources et scénarios hors ligne           | Périmètre et limites approuvés                             |
| Victor   | Livrer la lecture des actifs et l’adaptateur d’une source de prix retenue | Calculer une synthèse avec valorisation datée            | Réponse fournisseur enregistrée autorisée ou fictive | Erreur, prix absent et prix ancien traités                 |
| Rémy     | Ajouter un profil bancaire à partir d’une fixture documentée              | Isoler les devises et rejeter les cas non pris en charge | Fixtures indépendantes de la BDD                     | Pas de conversion implicite ni de format universel annoncé |
| Ishak    | Préparer persistance et relations des actifs nécessaires                  | Stocker la date/source des valorisations                 | Schéma et données fictives                           | Actifs et comptes non comptés deux fois                    |
| Loris    | Livrer consultation et saisie d’un type d’actif                           | Étendre à une autre catégorie                            | Contrats et API simulée                              | Validation et erreur d’enregistrement visibles             |
| Jeremy   | Visualiser la répartition actifs/dettes sur les contrats convenus         | Ajouter sélection et détail d’une catégorie              | Synthèse patrimoniale fixe                           | Graphique fidèle et accessible                             |
| Clément  | Mesurer les écrans patrimoniaux et tester leur chargement                 | Optimiser le composant le plus coûteux                   | Fixtures volumineuses et build                       | Mesures avant/après dans les mêmes conditions              |
| Mathias  | Sourcer et expliquer les limites de valorisation publiques                | Préparer des métadonnées de partage adaptées             | Documentation des sources et pages publiques         | Aucune cotation prétendue réelle sans source/date          |
| Yann     | Livrer export JSON limité au propriétaire                                 | Inclure les actifs disponibles et le téléchargement      | Dépôt de données fictives de deux utilisateurs       | Aucun secret ni donnée tierce exportés                     |

## S5 — Historique et évolution

| Personne | P0                                                                       | P1                                                   | Démarrage autonome                            | Preuve attendue                                         |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| Arthur   | Fixer règles d’historique et critères de cohérence des totaux            | Réaliser une revue des coûts techniques observés     | Exemples de variation et bilan S4             | Une définition partagée du gain/perte                   |
| Victor   | Calculer les variations à partir de valeurs datées                       | Séparer variation de marché et apports/retraits      | Séries temporelles fictives                   | Exemples recalculés indépendamment                      |
| Rémy     | Identifier les candidats virements internes sans supprimer les originaux | Proposer une confirmation des rapprochements ambigus | Paires de transactions fictives               | Achats distincts conservés ; ambiguïtés signalées       |
| Ishak    | Préparer les snapshots et requêtes d’historique utiles                   | Pagination des séries si le volume le justifie       | Dépôt simulé et schéma proposé                | Dates, propriétaire et ordre stables                    |
| Loris    | Afficher historique et filtres de période                                | Raccorder les détails de variation                   | Séries fixes, vides et incomplètes            | Filtres cohérents avec les totaux affichés              |
| Jeremy   | Créer une visualisation temporelle lisible                               | Animer les transitions sans cacher les valeurs       | Séries de référence                           | Déficits et données manquantes représentés correctement |
| Clément  | Tester filtres et rendu sur historique volumineux                        | Virtualiser une liste si la mesure le justifie       | Générateur déterministe de séries             | Navigation utilisable et mesure documentée              |
| Mathias  | Rédiger les explications publiques des indicateurs                       | Créer une page pédagogique liée au parcours          | Formules et exemples fournis par les contrats | Textes et exemples cohérents avec les calculs           |
| Yann     | Livrer suppression confirmée du compte de test et de ses données prévues | Gérer échecs partiels et reprise                     | Dépôts simulés et inventaire des relations    | Propriété, résultat et données restantes contrôlés      |

## S6 — Catégorisation et fiabilité des imports

| Personne | P0                                                                  | P1                                                     | Démarrage autonome                             | Preuve attendue                                          |
| -------- | ------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------- |
| Arthur   | Prioriser les erreurs de données et définir la stratégie de reprise | Raccorder le suivi d’erreurs sans données sensibles    | Erreurs reproduites dans les fixtures          | Un incident permet de trouver sa cause sans secret       |
| Victor   | Appliquer des règles de catégorisation explicables                  | Recalculer les agrégats après correction               | Transactions et règles fictives                | Priorité des règles et absence de correspondance testées |
| Rémy     | Livrer traitement explicite des imports partiels et corrompus       | Améliorer la normalisation selon les erreurs observées | Fichiers tronqués et lignes invalides          | Bilan lignes acceptées/refusées reproductible            |
| Ishak    | Persister les corrections et règles propres à l’utilisateur         | Préparer une reprise transactionnelle des imports      | Schéma et dépôt simulé                         | Correction conservée au rechargement                     |
| Loris    | Livrer l’écran de correction d’une catégorie                        | Ajouter une règle utilisateur depuis une opération     | API simulée et exemples de conflits            | Changement visible, confirmé ou annulé en erreur         |
| Jeremy   | Rendre les changements de catégorie lisibles                        | Visualiser la répartition par catégorie                | Données fixes et transitions déterministes     | Aucune information portée seulement par la couleur       |
| Clément  | Tester la cohérence après correction et import partiel              | Corriger une régression de rendu mesurée               | Scénarios de mutation et gros fichier fictif   | Rollback et totaux cohérents                             |
| Mathias  | Expliquer les limites de la catégorisation et l’origine des données | Contrôler contenu SEO et liens existants               | Règles documentées et crawl de pages publiques | Pas de promesse d’IA auto-apprenante non livrée          |
| Yann     | Livrer les paramètres de confidentialité réellement applicables     | Appliquer les choix de télémétrie si elle existe       | Faux collecteur et préférences fictives        | Option désactivée effectivement respectée                |

## S7 — Prévisions de trésorerie

| Personne | P0                                                                     | P1                                                       | Démarrage autonome                             | Preuve attendue                                          |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| Arthur   | Fixer scénario, horizon et critères d’évaluation de la prévision       | Arbitrer les cas non couverts avant extension            | Jeux de référence et hypothèses documentées    | Prévision et garantie financière distinguées             |
| Victor   | Livrer une projection déterministe à partir des flux connus            | Ajouter un scénario de variation explicitement paramétré | Échéances et soldes fictifs                    | Projection attendue vérifiée jour par jour sur petit cas |
| Rémy     | Proposer des récurrences candidates avec niveau de confiance explicite | Gérer un changement de montant ou de date                | Séries de transactions fictives                | Cas irréguliers non présentés comme certains             |
| Ishak    | Préparer stockage et lecture des échéances nécessaires                 | Historiser les paramètres utiles aux comparaisons        | Schéma proposé et dépôts simulés               | Version des données et propriétaire conservés            |
| Loris    | Afficher prévision et hypothèses avec états incomplets                 | Permettre de comparer deux scénarios                     | Projection fixe et état sans données           | Utilisateur distingue observé et prévisionnel            |
| Jeremy   | Visualiser la courbe et les zones de tension                           | Ajouter une interaction sur date/scénario                | Série datée fictive                            | Axes, unités et déficits lisibles                        |
| Clément  | Tester les changements de scénario et mesurer le rendu                 | Réduire les recalculs inutiles constatés                 | Projection fixe volumineuse                    | Même entrée donne même affichage ; mesures documentées   |
| Mathias  | Publier une explication fidèle des prévisions                          | Préparer une page pédagogique avec exemple               | Hypothèses du contrat, sans moteur réel requis | Aucune promesse de prédiction certaine                   |
| Yann     | Saisir et persister réserve/horizon convenus avec Victor               | Raccorder la réinitialisation et l’aide contextuelle     | Contrat de préférences et dépôt fictif         | Valeurs invalides refusées ; effet attendu vérifié       |

## S8 — Simulation de projets

| Personne | P0                                                               | P1                                                       | Démarrage autonome                           | Preuve attendue                                          |
| -------- | ---------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| Arthur   | Choisir un parcours complet et fixer son périmètre métier        | Valider les règles commerciales à implémenter            | Scénario chiffré et décisions documentées    | Une seule simulation prioritaire clairement définie      |
| Victor   | Livrer le calcul de crédit ou projet retenu                      | Comparer deux hypothèses de remboursement/épargne        | Entrées et résultats calculés indépendamment | Bornes, arrondis et cas invalides vérifiés               |
| Rémy     | Extraire les dépenses/frais utiles au scénario sans les inventer | Qualifier une seconde catégorie de frais                 | Transactions fictives et règles explicites   | Absence de preuve distincte d’un montant nul             |
| Ishak    | Préparer la persistance du projet et de ses paramètres           | Conserver une version de scénario                        | Dépôt simulé et contrat projet               | Rechargement cohérent et données isolées                 |
| Loris    | Livrer le formulaire et les résultats du parcours retenu         | Comparer visuellement deux scénarios                     | Moteur simulé conforme au contrat            | Erreurs, bornes et retour au formulaire utilisables      |
| Jeremy   | Créer la visualisation du projet et de son échéance              | Ajouter une transition liée aux paramètres               | Résultats fixes et props convenues           | Valeurs cohérentes sans animation obligatoire            |
| Clément  | Tester saisie, changement de scénario et erreurs réseau          | Optimiser le temps de réponse perçu mesuré               | Fonction simulée et jeux de cas limites      | Erreur ne conserve pas un résultat devenu faux           |
| Mathias  | Rédiger les explications et limites du simulateur                | Préparer une page publique de découverte                 | Formules et exemples du contrat              | Pas de décision de crédit garantie                       |
| Yann     | Appliquer les droits Free/Premium effectivement retenus          | Afficher limites et erreurs de droit dans les paramètres | Matrice de droits simulée                    | API non contournable ; abonnement identifié comme simulé |

## S9 — Qualité et sécurité

| Personne | P0                                                                             | P1                                                                | Démarrage autonome                        | Preuve attendue                                            |
| -------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| Arthur   | Trier les anomalies, assigner les corrections et fermer les priorités          | Documenter les risques résiduels et critères de livraison         | Recette et rapports précédents            | Chaque anomalie critique a un résultat vérifié             |
| Victor   | Corriger et tester les défauts des API/calculs                                 | Mesurer la charge API sur une cible utile                         | Dépôt de référence et scénarios d’accès   | Erreurs, autorisations et résultats stables                |
| Rémy     | Vérifier les limites de taille et entrées hostiles des imports                 | Enrichir le corpus de non-régression                              | Fixtures synthétiques autorisées          | Rejet explicite sans exécution de contenu importé          |
| Ishak    | Vérifier isolation, requêtes et cohérence des migrations                       | Optimiser une requête lente identifiée                            | Plan de requêtes et données fictives      | Aucun accès inter-utilisateur ni perte de cohérence        |
| Loris    | Corriger les défauts responsive et clavier prioritaires                        | Traiter les incohérences d’états d’erreur                         | Composants et fixtures existants          | Recette aux tailles retenues et au clavier                 |
| Jeremy   | Corriger fuites et dégradations du rendu graphique                             | Réduire le coût sur configuration modeste                         | Scène autonome et mesures reproductibles  | Repli et réduction des mouvements vérifiés                 |
| Clément  | Exécuter la recette transversale et publier les mesures                        | Automatiser les régressions prioritaires                          | Scénarios déterministes et build          | Tests exécutés/ignorés/échoués distingués                  |
| Mathias  | Auditer pages publiques, métadonnées et affirmations                           | Corriger les liens et données structurées retenues                | Pages locales et sources conservées       | Contenu exact et aucune page privée exposée par le sitemap |
| Yann     | Vérifier profil, export, suppression et préférences contre les accès interdits | Contrôler protections des mutations selon le transport de session | Deux identités fictives et tests négatifs | Refus effectifs et absence de fuite de données             |

## S10 — Déploiement et recette cible

| Personne | P0                                                                  | P1                                                 | Démarrage autonome                         | Preuve attendue                                     |
| -------- | ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| Arthur   | Déployer avec procédure de retour arrière et configuration vérifiée | Formaliser le diagnostic et la surveillance utiles | Scripts et checklist hors production       | Déploiement testé et procédure de retour documentée |
| Victor   | Vérifier calculs et API sur l’environnement cible                   | Corriger les écarts de transport/configuration     | Scénarios de référence hors ligne          | Même résultat métier et contrôles d’accès conservés |
| Rémy     | Exécuter les imports de référence dans la cible de test             | Vérifier la reprise après interruption             | Corpus autorisé et procédure locale        | Bilan d’import identique au résultat attendu        |
| Ishak    | Tester migrations et restauration sur données de test               | Vérifier la configuration de sauvegarde prévue     | Base jetable et procédure reproductible    | Restauration exécutée ; aucune base réelle écrasée  |
| Loris    | Exécuter la recette UI dans la cible                                | Corriger les écarts mobile et réseau               | Checklist et navigateurs retenus           | Parcours principal complet et erreurs lisibles      |
| Jeremy   | Vérifier assets, WebGL et replis dans la cible                      | Réduire un coût constaté au déploiement            | Build et scène locale                      | Pas d’asset manquant ni de blocage sans WebGL       |
| Clément  | Comparer parcours et mesures local/cible                            | Automatiser le smoke test du déploiement           | Script de recette et données fictives      | Mesures et écarts expliqués                         |
| Mathias  | Vérifier routes, indexation autorisée, CTA et partage               | Préparer le support public de présentation         | Checklist SEO locale                       | Contenu et environnement cohérents                  |
| Yann     | Vérifier session, paramètres et export dans la cible                | Tester suppression sur un compte jetable autorisé  | Scénarios de compte exécutables localement | URLs de retour valides ; aucun secret public        |

## S11 — Soutenance et transmission

| Personne | P0                                                                | P1                                                                | Démarrage autonome                          | Preuve attendue                                          |
| -------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| Arthur   | Piloter une démonstration répétée et présenter le bilan collectif | Présenter la suite priorisée et les hypothèses commerciales       | Résultats réels et rapports                 | Chaque affirmation renvoie à une preuve ou une hypothèse |
| Victor   | Montrer un calcul financier et expliquer ses hypothèses           | Présenter un cas limite traité                                    | Scénario chiffré autonome                   | Entrée, règle et sortie expliquées                       |
| Rémy     | Démontrer un import puis un réimport                              | Présenter un fichier invalide et son diagnostic                   | Fixtures fictives disponibles hors ligne    | Aucun doublon ou rejet annoncé sans résultat observé     |
| Ishak    | Expliquer le modèle, le seed et l’isolation des données           | Présenter la restauration de test vérifiée                        | Diagramme et données de référence           | Relations et absence de double comptage démontrées       |
| Loris    | Démontrer le parcours utilisateur principal                       | Présenter responsive et clavier                                   | Données fictives et chemin de démonstration | Navigation reproductible sans préparation cachée         |
| Jeremy   | Présenter les visualisations et leur utilité                      | Montrer le repli accessible et les mesures utiles                 | Scène à props et exemples fixes             | Effet graphique relié à une donnée compréhensible        |
| Clément  | Présenter recette, défauts corrigés et mesures contextualisées    | Montrer un test de non-régression                                 | Rapports d’exécution réels                  | Aucun score ou gain sans protocole                       |
| Mathias  | Présenter acquisition envisagée et discours produit vérifiable    | Distinguer modèle économique et résultats observés                | Sources et hypothèses identifiées           | Aucun chiffre de rétention ou revenu inventé             |
| Yann     | Démontrer connexion, préférences et export                        | Montrer suppression sur compte jetable et transmettre les limites | Comptes fictifs et scénario préparé         | Contrôle d’accès expliqué à partir d’un exemple          |
