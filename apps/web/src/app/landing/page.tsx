import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calculator,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSpreadsheet,
  HelpCircle,
  Layers,
  Lock,
  Scale,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";
import TariffSimulatorWidget from "./TariffSimulatorWidget";
import { VERIFIED_TARIFF_SOURCES } from "./tariff-simulator";

export const metadata: Metadata = {
  title:
    "Pathly V2 — Comprendre sa trésorerie, son patrimoine net et ses décisions financières",
  description:
    "Démonstrateur financier souverain : importez vos relevés CSV/OFX, calculez votre reste-à-dépenser explicable, visualisez votre patrimoine net après dettes et simulez vos décisions avec des hypothèses transparentes.",
  keywords: [
    "Pathly V2",
    "Gestion de trésorerie",
    "Reste à dépenser",
    "Safe to Spend",
    "Patrimoine net",
    "Import CSV OFX bancaire",
    "Simulateur tarifaire énergie télécom",
    "FinTech pédagogique",
  ],
  alternates: {
    canonical: "/landing",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title:
      "Pathly V2 — Trésorerie explicable, patrimoine net et simulations vérifiables",
    description:
      "Répondez à trois questions concrètes : Que puis-je dépenser ? Que possède-je après mes dettes ? Quel est l’effet d’une décision sur mon budget ?",
    url: "https://pathly.app/landing",
    siteName: "Pathly V2",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathly V2 — Trésorerie explicable & Patrimoine net",
    description:
      "Import CSV/OFX souverain, calcul Safe-to-Spend transparent et simulateur pédagogique sur données publiques sourçables.",
  },
};

const FAQ_ITEMS = [
  {
    question:
      "Pathly V2 se connecte-t-il automatiquement à toutes les banques en temps réel ?",
    answer:
      "Non. Le démonstrateur Pathly V2 privilégie l’import contrôlé de fichiers bancaires (formats CSV et OFX testés) et la saisie déclarative, sans demander vos identifiants bancaires ni dépendre d’une API d’agrégation payante.",
  },
  {
    question: "Comment est calculé le reste-à-dépenser (Safe-to-Spend) ?",
    answer:
      "Sur une période donnée, la règle S2 soustrait du solde disponible les charges engagées restantes et la réserve d’épargne (ex. 1 500 € disponibles − 800 € de charges restantes − 200 € de réserve = 500 € disponibles). Si une donnée requise manque, l’état est affiché comme incomplet plutôt que remplacé par zéro.",
  },
  {
    question:
      "Pourquoi Pathly ne promet-il pas une économie automatique dès qu’il détecte « EDF » ou « Freebox » ?",
    answer:
      "Un libellé de transaction bancaire indique uniquement le montant prélevé et le nom du fournisseur. Il ne contient ni la puissance du compteur (kVA), ni la consommation annuelle (kWh), ni l’engagement ou les frais de résiliation. Toute simulation requiert donc la saisie explicite de ces variables.",
  },
];

export default function LandingPage(): React.JSX.Element {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Pathly V2",
        url: "https://pathly.app/landing",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: "fr-FR",
        description:
          "Démonstrateur financier permettant de suivre ses comptes par import CSV/OFX, de calculer son reste-à-dépenser explicable, de synthétiser son patrimoine net hors dettes et de simuler des décisions budgétaires.",
        featureList: [
          "Import de relevés bancaires CSV/OFX avec prévisualisation et contrôle des doublons",
          "Calcul explicable du reste-à-dépenser (Safe-to-Spend) sur période",
          "Synthèse patrimoniale nette séparant actifs et dettes sans double comptage",
          "Simulateur pédagogique énergie et télécom fondé sur des hypothèses explicites",
        ],
        offers: [
          {
            "@type": "Offer",
            name: "Mode Démo & Essentiel",
            price: "0",
            priceCurrency: "EUR",
            description:
              "Accès au démonstrateur S2 avec jeu de données fictif et simulateur pédagogique.",
          },
          {
            "@type": "Offer",
            name: "Proposition Pathly Souverain (Hypothèse commerciale d’étude)",
            price: "9.99",
            priceCurrency: "EUR",
            description:
              "Proposition commerciale étudiée pour le suivi multi-personas et les simulations patrimoniales étendues.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Données structurées JSON-LD (P2 — strictement conformes au contenu visible) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ==================== NAVIGATION PUBLIQUE ==================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-[#070b14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Pathly V2
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Démonstrateur S2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Trésorerie explicable · Patrimoine net · Simulations sourcées
              </p>
            </div>
          </div>

          <nav
            aria-label="Navigation principale de la page de présentation"
            className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300"
          >
            <a
              href="#trois-questions"
              className="hover:text-emerald-400 transition"
            >
              Les 3 Questions
            </a>
            <a
              href="#simulateur-tarifaire"
              className="hover:text-emerald-400 transition"
            >
              Simulateur & Sources
            </a>
            <a
              href="#sources-verifiees"
              className="hover:text-emerald-400 transition"
            >
              Sources Open Data
            </a>
            <a
              href="#tarifs-hypothese"
              className="hover:text-emerald-400 transition"
            >
              Modèle & Tarif
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/#demo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <span>Ouvrir le Dashboard Démo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ==================== HERO — PROPOSITION DE VALEUR FIDÈLE AU PRODUIT ==================== */}
        <section className="relative overflow-hidden border-b border-slate-800/80 py-14 sm:py-20 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Souveraineté des données : Import CSV/OFX & saisie contrôlée,
                  sans partager vos accès bancaires
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.12]">
                Comprenez votre argent disponible, votre patrimoine net et
                l’effet réel de vos décisions.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Pathly V2 aide un particulier à piloter ses finances
                personnelles avec des règles de calcul explicites. L’interface
                distingue systématiquement les{" "}
                <strong>données importées</strong>, les{" "}
                <strong>données saisies</strong>, les{" "}
                <strong>estimations</strong> et les{" "}
                <strong>simulations pédagogiques</strong>.
              </p>

              {/* Appels à l'action cohérents avec le mode démo (P0) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-xl shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <span>Explorer le Dashboard en Mode Démo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#simulateur-tarifaire"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Tester le simulateur d’économies sourcé</span>
                </a>
              </div>

              {/* Badges de transparence sur la nature des données */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-emerald-400 block">
                    Importé
                  </span>
                  <span className="text-xs text-slate-300">
                    Relevés CSV / OFX
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-sky-400 block">
                    Saisi
                  </span>
                  <span className="text-xs text-slate-300">
                    Actifs, dettes & kVA
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-amber-400 block">
                    Estimé / Simulé
                  </span>
                  <span className="text-xs text-slate-300">
                    Hypothèses affichées
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-purple-400 block">
                    Mode Démo
                  </span>
                  <span className="text-xs text-slate-300">
                    Fixtures déterministes
                  </span>
                </div>
              </div>
            </div>

            {/* Carte récapitulative des calculs vérifiables du contrat S2 */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Exemples de référence S2
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    Calculs déterministes & vérifiables
                  </h2>
                </div>
                <BadgeCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>

              {/* Exemple 1 : Safe-to-Spend */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    1. Reste-à-dépenser (Safe-to-Spend)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">
                    AVAILABLE
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-300">
                  1 500 € (solde) − 800 € (charges restantes) − 200 € (réserve)
                  ={" "}
                  <strong className="text-emerald-400">
                    500 € disponibles
                  </strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Si une donnée requise manque, le statut passe à{" "}
                  <code>INCOMPLETE</code> (montant <code>null</code>), sans
                  masquer un déficit par un zéro.
                </p>
              </div>

              {/* Exemple 2 : Patrimoine net */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    2. Synthèse patrimoniale nette
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 font-bold">
                    Sans double comptage
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-300">
                  2 000 € (trésorerie) + 5 000 € (invest.) + 10 000 € (biens) −
                  3 000 € (dettes) ={" "}
                  <strong className="text-sky-300">14 000 € nets</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Les dettes sont présentées séparément des actifs pour
                  préserver la lisibilité financière.
                </p>
              </div>

              {/* Exemple 3 : Simulation tarifaire */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    3. Simulation d’écart tarifaire (6 kVA Base)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold">
                    Hypothèses saisies
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-300">
                  Observé 894,00 €/an (74,50 €/mois) vs Simulé 695,52 €/an (2
                  400 kWh) →{" "}
                  <strong className="text-amber-300">
                    +198,48 €/an simulés
                  </strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Aucun gain n’est annoncé tant que la puissance (kVA) et la
                  consommation (kWh) ne sont pas renseignées.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== LES 3 QUESTIONS DU PRODUIT (VISION PRODUIT) ==================== */}
        <section
          id="trois-questions"
          className="py-14 sm:py-16 px-4 sm:px-8 border-b border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Vision Produit Pathly V2
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Trois questions concrètes pour piloter son budget sans boîte
                noire
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Le parcours de référence relie l’import de vos opérations, la
                lecture de vos comptes, l’estimation de trésorerie, la synthèse
                patrimoniale et la simulation de décisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  1. « Que puis-je dépenser ? »
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Au lieu d’afficher uniquement un solde bancaire instantané,
                  Pathly isole les charges engagées restantes sur le mois et
                  votre réserve d’épargne de précaution.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                  <li>
                    • Les charges déjà débitées ne sont pas soustraites deux
                    fois.
                  </li>
                  <li>
                    • Un solde insuffisant affiche un état{" "}
                    <code>SHORTFALL</code> explicite.
                  </li>
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  2. « Que possède-je réellement après mes dettes ? »
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Agrégation de la trésorerie liquide (comptes courants,
                  livrets), des investissements (PEA, CTO, crypto) et des biens
                  physiques, diminuée du capital restant dû des emprunts.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                  <li>
                    • Absence de double comptage des comptes d’investissement.
                  </li>
                  <li>
                    • Séparation visuelle stricte entre actifs et passifs.
                  </li>
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  3. « Quel est l’effet d’une décision sur mon budget ? »
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Qu’il s’agisse d’un virement d’équilibrage depuis un livret ou
                  d’une révision de contrat récurrent (énergie, fibre), chaque
                  simulation expose ses paramètres et ses limites.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                  <li>
                    • Prise en compte des frais de résiliation et de mise en
                    service.
                  </li>
                  <li>
                    • Refus de conclure lorsque les données d’entrée sont
                    incomplètes.
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ==================== SIMULATEUR PÉDAGOGIQUE (P0 / P1) ==================== */}
        <section
          id="simulateur-tarifaire"
          className="py-14 sm:py-16 px-4 sm:px-8 border-b border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Validation des données commerciales & Simulation (S2)
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Simulateur pédagogique d’écart tarifaire (Énergie & Télécom)
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Ce module distingue la <strong>mensualité observée</strong> dans
                vos transactions, les{" "}
                <strong>variables physiques ou contractuelles saisies</strong>{" "}
                et le <strong>résultat de simulation</strong>. Essayez le bouton
                « Cas limite : Ligne bancaire seule » pour vérifier le
                comportement en cas d’information manquante.
              </p>
            </div>

            <TariffSimulatorWidget />
          </div>
        </section>

        {/* ==================== SOURCES TARIFAIRES VÉRIFIÉES (P0) ==================== */}
        <section
          id="sources-verifiees"
          className="py-14 sm:py-16 px-4 sm:px-8 border-b border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Dossier de sources
                  (`docs/sources/SOURCES_TARIFAIRES_SEANCE_2.md`)
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Sources Énergie & Télécom vérifiées et conditions
                  d’exploitation
                </h2>
                <p className="text-sm text-slate-300">
                  Conformément au contrat S2, chaque source envisagée a été
                  auditée sur quatre critères : URL officielle, licence de
                  réutilisation, granularité des données et variables requises
                  pour Victor (API).
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>3 sources auditées · 0 offre inventée</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {VERIFIED_TARIFF_SOURCES.map((source) => (
                <article
                  key={source.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                        {source.domain === "ENERGY" ? "ÉNERGIE" : "TÉLÉCOM"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {source.referenceDate}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug">
                      {source.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {source.publisher}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <p className="text-slate-300">
                        <strong className="text-slate-100">Licence :</strong>{" "}
                        {source.license}
                      </p>
                      <p className="text-slate-300">
                        <strong className="text-slate-100">
                          Granularité :
                        </strong>{" "}
                        {source.granularity}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-300">
                        Variables requises pour un calcul :
                      </p>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {source.requiredVariables.map((reqVar) => (
                          <li key={reqVar}>{reqVar}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{source.verdictForApi}</span>
                    </div>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      <span>Consulter la source officielle</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PRICING PROPOSÉ & HYPOTHÈSE COMMERCIALE (P1 / P2) ==================== */}
        <section
          id="tarifs-hypothese"
          className="py-14 sm:py-16 px-4 sm:px-8 border-b border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Positionnement & Modèle Économique Étudié (P1 / P2)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Distinguer le démonstrateur vérifiable et l’hypothèse
                commerciale
              </h2>
              <p className="text-sm text-slate-300">
                Conformément à la vision produit, un abonnement à 9,99 €/mois
                est présenté ici comme une{" "}
                <strong>proposition commerciale d’étude</strong> pour la
                soutenance, sans prétendre à des métriques de conversion, de
                rétention ou de marge non mesurées.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Offre 1 : Démonstrateur S2 */}
              <div className="rounded-3xl border-2 border-emerald-500/50 bg-slate-900/90 p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Disponible en Séance 2
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Parcours Démo & Import
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Mode Démo & Socle Souverain
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">
                        0 €
                      </span>
                      <span className="text-xs text-slate-400">
                        / démonstrateur pédagogique
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Consultation des comptes et de 5 mois d’historique
                        fictif déterministe
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Import de relevés CSV / OFX documentés et détection des
                        cas ambigus
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Calcul explicable du reste-à-dépenser (Safe-to-Spend) et
                        du patrimoine net
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Simulateur pédagogique énergie/télécom sur hypothèses
                        explicites
                      </span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                >
                  <span>Accéder directement au Dashboard Démo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Offre 2 : Proposition commerciale étudiée */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Hypothèse commerciale d’étude
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Non facturé · Sans paiement en S2
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Proposition « Pathly Souverain »
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-200">
                        9,99 €
                      </span>
                      <span className="text-xs text-slate-400">
                        / mois (hypothèse tarifaire soumise à arbitrage)
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Suivi patrimonial multi-actifs (immobilier, crédits,
                        PEA/CTO) et historique long
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Profils d’import personnalisés et simulations de projets
                        de vie (S7–S8)
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Modèle sans revente de données ni frais d’agrégation
                        bancaire tiers
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-200">
                    Note de transparence (S2) :
                  </strong>{" "}
                  Aucun tunnel de paiement ni quota bloquant n’est activé en
                  Séance 2. La rentabilité de cette offre dépendrait de coûts
                  d’acquisition et de rétention qui ne sont pas mesurés dans le
                  cadre pédagogique.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FAQ VERIFIABLE ==================== */}
        <section id="faq" className="py-14 sm:py-16 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Questions fréquentes & Limites assumées
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Ce que fait Pathly V2 — et ce qu’il ne promet pas
              </h2>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ==================== PIED DE PAGE PUBLIC ==================== */}
      <footer className="border-t border-slate-800 bg-[#050811] py-8 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-slate-200">
              Pathly V2 — Démonstrateur financier (Master 2 Alternance · Séance
              2)
            </p>
            <p>
              Page publique `/landing` et références tarifaires maintenues par
              Mathias Bouclon · Aucune promesse financière personnalisée.
            </p>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/" className="text-emerald-400 hover:underline">
              Dashboard Démo (`/`)
            </Link>
            <a
              href="#simulateur-tarifaire"
              className="text-slate-300 hover:underline"
            >
              Simulateur S2
            </a>
            <a
              href="#sources-verifiees"
              className="text-slate-300 hover:underline"
            >
              Sources Open Data
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
