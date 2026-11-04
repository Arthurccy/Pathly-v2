# S2 — Contrats de départ et travail autonome

## Statut de ce document

Spécification de départ proposée pour S2. Les types comptes/transactions existent dans `packages/shared-types/src/index.ts` ; les endpoints correspondants existent dans le code, mais leur exécution n’est pas attestée par leur simple présence. Les autres opérations ci-dessous sont à implémenter. Ce document ne crée ni fixtures sur disque ni routes exécutables.

But : chaque développeur peut écrire sa brique, ses exemples et ses tests dès le début de séance. Confirmer les interfaces avant 10 h ; une question non résolue ne bloque pas un test isolé sur les exemples proposés. Marquer l’hypothèse dans la PR et ne pas déclarer le raccordement terminé.

## 1. Conventions

| Sujet          | Convention S2                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Succès API     | Contrat existant `ApiResponse<T>` avec `success: true` et `data`                                                                                                                                                           |
| Erreur API     | Cible : `success: false`, `error.code` et `error.message` ; les erreurs NestJS existantes peuvent différer avant normalisation par une PR ciblée                                                                           |
| Argent         | Contrats existants : nombres en euros avec `currency: "EUR"`. Documenter l’arrondi ; utiliser des centimes entiers ou un type décimal pour les calculs, puis convertir à la frontière. Aucun changement silencieux d’unité |
| Transactions   | Dépense négative, revenu positif ; garder libellé original et identifiant de compte                                                                                                                                        |
| Date métier    | `YYYY-MM-DD` ; mois `YYYY-MM`. Les timestamps techniques ont un fuseau explicite                                                                                                                                           |
| Identité       | L’utilisateur réel provient de la session validée côté API, jamais d’un `userId` arbitraire fourni par le navigateur                                                                                                       |
| Donnée absente | Ne pas transformer silencieusement une erreur en zéro. Afficher indisponible/incomplet selon le contrat                                                                                                                    |
| Démo           | Fixture fictive identifiée et déterministe. Le mode de démonstration n’autorise pas les routes privées sans session                                                                                                        |

## 2. Interfaces à stabiliser

Les chemins proposés sont les valeurs par défaut de planification. S’ils changent, mettre à jour ce tableau et le consommateur dans la même livraison coordonnée. Le préfixe est `/api/v1`.

| Interface                                                                                | Statut initial                      | Producteur / consommateur               | Travail isolable immédiatement                                                |
| ---------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| `GET /accounts` → `ApiResponse<BankAccountDto[]>`                                        | Présent dans le code                | Victor / Loris, Ishak                   | API avec dépôt de données simulé ; UI avec réponse fixe                       |
| `GET /transactions` → `ApiResponse<BankTransactionDto[]>`                                | Présent dans le code                | Victor / Loris                          | Liste/filtres et cas vide/erreur sans BDD                                     |
| `GET /cashflow/summary?month=YYYY-MM`                                                    | Proposé                             | Victor / Loris, Jeremy                  | Calcul pur sur entrées ci-dessous ; widgets avec résultat fixe                |
| Prévisualisation d’import : texte + profil → lignes normalisées + erreurs                | Proposée ; service pur d’abord      | Rémy / Victor, Ishak                    | Parsing et validation sans stockage ni session réelle                         |
| Persistance d’import authentifiée                                                        | À définir après prévisualisation    | Rémy / Ishak                            | Adaptateur de stockage simulé ; schéma et transaction BDD proposés séparément |
| Synthèse patrimoniale → `NetWorthSummaryDto`                                             | Type présent, fonction à livrer     | Ishak / Victor, Jeremy                  | Calcul sans cotations ni appels réseau                                        |
| Fournisseur de session → état + identité + token disponible uniquement pour le transport | Proposé ; guard existant à examiner | Yann / Ishak, Loris                     | États UI et refus d’accès avec client d’identité simulé dans les tests        |
| Profil courant : lecture/modification du nom sous `/me`                                  | Proposé                             | Yann / page paramètres                  | Service de profil avec dépôt simulé ; validation de saisie                    |
| Recommandation tarifaire → `SubscriptionOptimizationDto`                                 | Type présent, données non vérifiées | Mathias (sources), Victor (calcul) / UI | Exemple pédagogique identifié ; aucun gain réel annoncé                       |

Pour les opérations proposées, chaque auteur prépare un fichier de contrat limité à son domaine et un exemple. Ishak coordonne les exports et la cohérence, sans devenir un préalable à l’écriture des modules. Les interfaces temporaires restent dans les tests/adaptateurs locaux ; une seule version canonique est conservée après accord.

## 3. Exemples de référence

### Calcul de trésorerie

Entrée du service pur, sans accès HTTP ni BDD :

```json
{
  "month": "2026-10",
  "asOfDate": "2026-10-15",
  "availableBalance": 1500,
  "remainingCommittedExpenses": 800,
  "savingsReserve": 200,
  "currency": "EUR"
}
```

Sortie métier proposée :

```json
{
  "month": "2026-10",
  "asOfDate": "2026-10-15",
  "safeToSpendPeriod": 500,
  "status": "AVAILABLE",
  "currency": "EUR"
}
```

Règle S2 : solde − charges restantes − réserve. Les charges déjà débitées ne sont pas soustraites deux fois. `AVAILABLE` signifie estimation non négative, `SHORTFALL` estimation négative ; une donnée requise manquante donne `INCOMPLETE` et un montant `null`. Ne pas masquer le déficit en le ramenant à zéro. Aucun équivalent journalier tant que le nombre de jours et les règles de période ne sont pas convenus. Cet exemple définit une simulation ; l’extraction des charges récurrentes est un travail supplémentaire.

### Comptes, liste et erreurs

Construire les fixtures complètes à partir des types existants : compte fictif A, `currentBalance: 1500`, `currency: "EUR"` ; transaction A1, `accountId` A, `amount: -42.5`, date `2026-10-12`. Utiliser des identifiants cohérents et tous les champs requis par les types. Scénarios attendus : deux résultats, tableau vide et erreur explicite. Les montants du calcul de trésorerie restent un jeu de test indépendant tant que la règle de rapprochement n’est pas implémentée.

Pour le refus d’accès, tester le statut HTTP 401 sans session ; pour une ressource tierce, choisir et documenter 403 ou 404 sans divulguer son contenu. Ne pas exiger la forme cible des erreurs avant l’adaptateur correspondant ; vérifier le comportement réel et signaler l’écart.

### Import CSV initial

Profil de référence fictif, sans prétendre supporter une banque réelle :

```csv
date;libelle;montant
2026-10-12;CB MONOPRIX PARIS;-42,50
2026-10-13;SALAIRE;2100,00
```

Résultat attendu : deux opérations avec montants −42,50 € et +2 100,00 €, libellés originaux conservés. Les fixtures ajoutent une date invalide, un montant invalide, un second import du même fichier et deux lignes légitimes identiques. Définir si une ligne invalide rejette tout le fichier ou produit une erreur de ligne ; renvoyer au minimum sa position et sa cause. Ne jamais abandonner silencieusement une ligne.

### Patrimoine et composants

2 000 € de trésorerie + 5 000 € d’investissements + 10 000 € de biens − 3 000 € de dettes = 14 000 € nets. Jeremy peut développer avec cette synthèse sans attendre le seed. Les dettes sont présentées séparément et ne deviennent pas une part négative d’un graphique circulaire d’actifs.

Les composants reçoivent des props typées ; ils ne possèdent pas leur propre appel Supabase. Prévoir une fixture nominale, vide/incomplète et en erreur. Loris raccorde les sources de données ; le développeur du composant prépare le changement de montage ciblé avec lui.

### Session et mutation optimiste

Yann fournit dans ses tests un client d’identité aux états déconnecté, connecté et expiré. Ces doubles ne sont pas un bypass du guard réel. Clément teste une mutation contre une fonction simulée résolvant ou rejetant une promesse : réussite, refus serveur, erreur réseau. Le raccordement utilise ensuite la vraie mutation disponible ; aucun endpoint d’écriture ne doit être inventé dans l’UI puis présenté comme fonctionnel.

## 4. Matrice d’autonomie

| Personne | Peut commencer avec                                                  | Raccordement réel à vérifier                              |
| -------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Arthur   | Manifests, commandes et branche de contrôle                          | Exécution CI GitHub et intégration du parcours            |
| Victor   | Fonctions pures, exemples chiffrés, dépôt simulé et identité de test | Dépôt Prisma et session Yann                              |
| Rémy     | CSV/OFX fictifs et sortie normalisée                                 | Persistance, propriété des comptes et refus d’accès       |
| Ishak    | Schéma existant, contrats proposés et seed fictif                    | Base V2 disponible et appels réels du client              |
| Loris    | Réponses API fixes et composants à props                             | API réelle, erreurs et montage des widgets                |
| Jeremy   | Props santé financière/patrimoine et page de développement isolée    | Montage dashboard et données réelles                      |
| Clément  | Scénario de recette et promesses simulées pour la mutation           | Vraie écriture et rollback sur réponse réelle             |
| Mathias  | Route indépendante, textes et sources publiques                      | CTA vers parcours réel et données de simulation vérifiées |
| Yann     | Client d’identité et dépôt de profil simulés dans les tests          | Supabase V2 et contrôle d’accès API réel                  |

## 5. Passage à l’intégration

À 11 h et 14 h 30 : identifier la version des contrats consommés, remplacer les doubles disponibles par les adaptateurs réels, exécuter le scénario nominal et une erreur, puis consigner le résultat dans la PR. Si un accès manque, garder la brique isolée livrable et signaler la fonctionnalité intégrée comme bloquée.

La création de contrats n’exige pas une réunion permanente. Une proposition courte, un exemple et une notification aux consommateurs suffisent pour avancer ; un changement cassant exige leur accord avant de remplacer l’interface existante.
