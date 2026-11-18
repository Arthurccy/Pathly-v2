# Références tarifaires, vérification des sources et méthodologie de simulation (Séance 2)

Responsable : **Mathias Bouclon** · Domaine : Pages publiques, SEO et validation des données commerciales · Séance : **S2**  
Destinataires directs : **Victor Hubert** (API & simulations financières), **Arthur Courchay** (arbitrages produit & revue).

---

## 1. Objectif et règle d’or S2

Conformément à la [vision produit](../VISION_PRODUIT.md), aux [tickets S2](../chefferie-de-projet/GITHUB_PROJECTS_SEANCE_2.md) et aux [contrats S2](../architecture/CONTRATS_SEANCE_2.md) :

1. **Aucune promesse d’économie personnalisée ne peut être déduite du seul nom d’un fournisseur** détecté dans un libellé bancaire (ex. `EDF Électricité -74,50 €` ou `Forfait Fibre Freebox -49,99 €`).
2. **Une source incomplète ou non requêtable automatiquement est documentée comme résultat de recherche**, jamais compensée par des offres commerciales inventées.
3. Tout chiffre présenté à l’utilisateur ou en soutenance distingue explicitement trois catégories :
   - **Donnée observée** : montant et libellé issus d’un relevé importé ou d’une saisie utilisateur.
   - **Simulation pédagogique** : calcul déterministe exécuté uniquement lorsque les variables physiques/contractuelles requises sont fournies, avec hypothèses affichées.
   - **Hypothèse commerciale** : positionnement tarifaire envisagé pour Pathly (ex. abonnement à `9,99 €/mois`), distinct d’une métrique mesurée.

---

## 2. Vérification des sources Énergie et Télécom envisagées

| Domaine                                     | Source examinée et URL                                                                                                                                                                                                                                                                                                      | Date de vérification                          | Licence / Conditions de réutilisation                                                                                                                           | Granularité des données                                                                                                                                                                   | Variables requises pour un calcul valide                                                                                                                                                                             | Statut d’exploitation S2 (Transmission à Victor)                                                                                                                                                                                                       |
| :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Énergie (Électricité — Référence TRV)**   | **data.gouv.fr / CRE** — _Tarifs réglementés de vente d’électricité (TRV)_<br>`https://www.data.gouv.fr/fr/datasets/tarifs-reglementes-de-vente-delectricite/`<br>`https://www.cre.fr`                                                                                                                                      | Séance 2 (barème TRV de référence en vigueur) | **Licence Ouverte / Open Licence 2.0 (Etalab)** — Réutilisation libre sous réserve de mentionner la source et la date                                           | Grille officielle par puissance souscrite (`3 kVA` à `36 kVA`) et par option (`Base`, `Heures Pleines / Heures Creuses`) : part fixe d’abonnement (€ TTC/an) et part variable (€ TTC/kWh) | 1. Puissance souscrite (`kVA`)<br>2. Option tarifaire (`BASE` ou `HP_HC`)<br>3. Consommation annuelle (`kWh/an`, ventilée HP/HC si applicable)<br>4. Montant mensuel/annuel actuel payé                              | **Exploitable uniquement en simulation avec saisie utilisateur.**<br>Inexploitable sur simple ligne de transaction bancaire (qui ne contient ni `kVA`, ni `kWh`, ni distinction électricité/gaz).                                                      |
| **Énergie (Offres de marché concurrentes)** | **Médiateur National de l’Énergie** — _Comparateur officiel energie-info_<br>`https://comparateur-offres.energie-info.fr/`                                                                                                                                                                                                  | Séance 2                                      | Service public d’information aux consommateurs ; pas de flux Open Data JSON/CSV libre de droit redistribuable en temps réel pour l’ensemble des contrats privés | Résultats par code postal, puissance et consommation sur l’interface web officielle                                                                                                       | Code postal (GRD Enedis ou ELD), puissance `kVA`, consommation `kWh`, option tarifaire                                                                                                                               | **Non exploitable en appel API automatique en S2.**<br>Ne pas scraper ni inventer de catalogue d’offres privées temps réel. Utiliser le barème TRV officiel + une décote paramétrable explicitement simulée.                                           |
| **Télécoms (Fixe Fibre/ADSL & Mobile)**     | **ARCEP** — _Observatoire des marchés des communications électroniques & Open Data_<br>`https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees.html`<br>`https://www.data.gouv.fr/fr/organizations/autorite-de-regulation-des-communications-electroniques-des-postes-et-de-la-distribution-de-la-presse-arcep/` | Séance 2                                      | **Licence Ouverte 2.0 (Etalab)** pour les jeux statistiques et cartes de couverture                                                                             | Moyennes sectorielles (facture moyenne HT/TTC) et couverture technique ; **aucun flux Open Data des grilles tarifaires commerciales des opérateurs**                                      | 1. Tarif mensuel actuel hors/après promotion<br>2. Tarif mensuel de l’offre cible (après 6/12 mois)<br>3. Frais de résiliation + frais de mise en service<br>4. Durée d’engagement restante et éligibilité technique | **Non exploitable pour recommander un opérateur précis à partir d’un libellé bancaire.**<br>Exploitable uniquement comme **calculateur de seuil de rentabilité** (amortissement des frais de changement sur 12/24 mois à partir de paramètres saisis). |

---

## 3. Ce qui est transmis à Victor pour l’API et le contrat `SubscriptionOptimizationDto`

### 3.1. Pourquoi la détection par libellé bancaire seul doit être bloquée

Dans les fixtures actuelles (`apps/web/src/lib/mock-data.ts`), on observe par exemple :

- `2026-10-08` · `EDF Électricité` · `-74,50 €`
- `2026-10-16` · `Forfait Fibre Freebox` · `-49,99 €`

**Constat métier transmis à Victor** :

- À partir de `-74,50 €` chez `EDF Électricité`, il est impossible de savoir si le foyer consomme peu avec un abonnement mal dimensionné (`9 kVA` ou `12 kVA`), s’il est chauffé à l’électricité, s’il paie une échéance lissée sur 10 ou 12 mois, ou si le contrat inclut du gaz. Annoncer « Économisez 180 €/an chez le fournisseur X » sur cette seule base serait trompeur.
- À partir de `-49,99 €` chez `Freebox`, il est impossible de savoir si le foyer est encore engagé, s’il utilise des services TV/multi-postes inclus ou si le changement entraîne `49 €` de frais de résiliation + `49 €` de frais d’ouverture.

### 3.2. Règle de comportement recommandée pour le moteur de simulation

1. **Cas d’informations insuffisantes (par défaut sur simple transaction)** :
   - Si seuls `providerName` et `currentMonthlyCost` sont connus sans les variables requises (`kVA` + `kWh/an` pour l’énergie ; `targetMonthlyCost` + `switchingFees` pour les télécoms), le simulateur **ne produit aucun montant d’économie** et retourne un statut explicite d’information incomplète (`INSUFFICIENT_DATA`).
2. **Cas de simulation pédagogique (paramètres complets fournis par l’utilisateur)** :
   - Le calcul s’exécute de manière déterministe, affiche la formule retenue et marque le résultat comme `[Simulation pédagogique sur hypothèses déclaratives]`.

---

## 4. Exemples concrets recalculables à la main

### Exemple A — Électricité (Comparaison par rapport au barème de référence 6 kVA Base)

#### 1. Donnée observée

- Mensualité prélevée observée sur le compte courant : `74,50 €/mois`, soit un coût annuel observé de :
  $$\text{Coût annuel observé} = 74,50 \times 12 = 894,00\text{ €/an}$$

#### 2. Hypothèses déclaratives saisies par l’utilisateur pour la simulation

- Puissance souscrite : `6 kVA`
- Option tarifaire : `Base`
- Consommation annuelle estimée : `2 400 kWh/an`
- Barème de référence retenu pour l’exemple vérifiable :
  - Abonnement annuel `6 kVA Base` : `152,16 €/an` (`12,68 €/mois` TTC)
  - Prix unitaire de référence du kWh TTC : `0,2516 €/kWh`
  - Offre cible simulée (hypothèse d’une offre indexée à `-10 %` sur le prix du kWh TTC, soit `0,2264 €/kWh`, même abonnement de `152,16 €/an`)

#### 3. Calcul détaillé et vérification manuelle

1. **Facture annuelle théorique au barème de référence (TRV)** :
   $$152,16 + (2\,400 \times 0,2516) = 152,16 + 603,84 = 756,00\text{ €/an}\quad (63,00\text{ €/mois})$$
   _Note pédagogique : l’écart de `138,00 €/an` (`894,00 € - 756,00 €`) par rapport aux mensualités de `74,50 €` peut provenir d’une surestimation de l’échéancier (régularisation en fin d’année) ou d’une consommation réelle plus élevée (~`2 948 kWh/an`)._
2. **Facture annuelle avec l’offre cible simulée (`0,2264 €/kWh`) pour `2 400 kWh/an`** :
   $$152,16 + (2\,400 \times 0,2264) = 152,16 + 543,36 = 695,52\text{ €/an}\quad (57,96\text{ €/mois})$$
3. **Écart annuel simulé** :
   - Par rapport aux mensualités observées (`894,00 €/an`) :
     $$894,00 - 695,52 = 198,48\text{ €/an}\quad (16,54\text{ €/mois})$$
   - Par rapport au barème TRV à consommation identique (`756,00 €/an`) :
     $$756,00 - 695,52 = 60,48\text{ €/an}\quad (5,04\text{ €/mois})$$

---

### Exemple B — Télécom Fibre (Calcul avec amortissement des frais de changement)

#### 1. Donnée observée

- Prélèvement mensuel observé : `49,99 €/mois` (`599,88 €/an`) — Libellé : `Forfait Fibre Freebox`.

#### 2. Hypothèses déclaratives saisies par l’utilisateur

- Offre fibre cible (sans options TV superflues, tarif fixe hors promo temporaire) : `29,99 €/mois` (`359,88 €/an`)
- Frais de résiliation de l’opérateur actuel : `49,00 €`
- Frais de mise en service du nouvel opérateur : `49,00 €`
- Total des frais fixes de transition : $49,00 + 49,00 = 98,00\text{ €}$

#### 3. Calcul détaillé et vérification manuelle

1. **Économie brute mensuelle sur l’abonnement** :
   $$49,99 - 29,99 = 20,00\text{ €/mois}\quad (240,00\text{ €/an})$$
2. **Économie nette sur les 12 premiers mois (frais de transition déduits)** :
   $$240,00 - 98,00 = 142,00\text{ €/an}\quad (\text{soit } 11,83\text{ €/mois lissés sur l’année 1})$$
3. **Seuil de rentabilité (délai d’amortissement des frais de changement)** :
   $$\frac{98,00}{20,00} = 4,9\text{ mois}\quad (\text{rentable à partir du } 5^{\text{e}}\text{ mois complet})$$

#### 4. Exemple conforme au contrat `SubscriptionOptimizationDto` (`packages/shared-types/src/index.ts`)

```json
{
  "id": "sim-telecom-fibre-01",
  "category": "TELECOM",
  "detectedSubscriptionName": "Forfait Fibre (mensualité observée 49,99 €)",
  "currentMonthlyCost": 49.99,
  "recommendedProvider": "Simulation Offre Fibre Essentielle (sans TV)",
  "recommendedPlanName": "Simulation à 29,99 €/mois (frais de transition de 98 € inclus sur 12 mois)",
  "recommendedMonthlyCost": 29.99,
  "annualSavings": 142.0,
  "switchDifficulty": "MODERATE",
  "savingsBadgeText": "Simulation : +142,00 € nets la 1re année (après 98 € de frais)",
  "comparisonSource": "Simulation pédagogique sur hypothèses saisies (méthodologie ARCEP / frais réels déduits)"
}
```

---

## 5. Synthèse commerciale et positionnement pour la soutenance (P1 / P2)

### 5.1. Positionnement produit vérifiable

- **Problème adressé** : Permettre à un particulier de répondre à trois questions concrètes (_« Que puis-je dépenser ? »_, _« Que possède-je réellement après mes dettes ? »_, _« Quel est l’effet d’une décision sur mon budget ou mon projet ? »_) sans céder ses identifiants bancaires.
- **Choix technique et économique assumé** : Les agrégateurs bancaires DSP2 payants représentent un coût unitaire récurrent incompatible avec un démonstrateur gratuit ou indépendant. Pathly V2 privilégie l’**import contrôlé de fichiers CSV/OFX** et la **saisie déclarative explicite**, garantissant zéro coût d’API bancaire par utilisateur actif.

### 5.2. Grille tarifaire proposée (Hypothèse commerciale d’étude)

| Offre                              | Tarif affiché                               | Périmètre fonctionnel                                                                                                                                   | Statut des données                                                                                                      |
| :--------------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **Mode Démo & Essentiel**          | **0 € / mois**                              | Import CSV/OFX, consultation des comptes et transactions, calcul explicable du reste-à-dépenser (`Safe-to-Spend`), simulateur pédagogique de charges    | Démonstrateur vérifiable en S2                                                                                          |
| **Pathly Souverain (Proposition)** | **9,99 € / mois** _(hypothèse commerciale)_ | Multi-personas / foyer, suivi patrimonial complet (actifs physiques, emprunts, investissements), scénarios de projets de vie et historique multi-années | **Proposition commerciale non mesurée** (aucune prétention de taux de conversion, de rétention, de CAC ou de LTV en S2) |

> **Avertissement méthodologique pour la soutenance** : Conformément à `docs/VISION_PRODUIT.md`, le tarif de `9,99 €/mois` constitue une hypothèse de positionnement commercial. Aucun chiffre de marge nette, de ratio LTV/CAC ou d’économie moyenne garantie par foyer n’est avancé sans étude empirique mesurée.
