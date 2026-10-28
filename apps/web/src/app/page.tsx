export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-4xl w-full space-y-8">
        {/* En-tête */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Pathly V2 • Monorepo Initialisé
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Bienvenue sur Pathly V2
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Plateforme FinTech d'agrégation bancaire Open Banking, intelligence prédictive et optimisation financière.
          </p>
        </div>

        {/* Modules du Monorepo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
            <div className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Frontend Web</div>
            <h2 className="text-xl font-bold">apps/web</h2>
            <p className="text-sm text-slate-400">
              Next.js 15 (App Router), Tailwind CSS, SSR SEO, micro-interactions Framer Motion et 3D Three.js.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
            <div className="text-blue-400 font-bold text-sm tracking-wider uppercase">Backend Bancaire</div>
            <h2 className="text-xl font-bold">apps/api</h2>
            <p className="text-sm text-slate-400">
              NestJS modulaire, ingestion Powens chiffrée AES-256-GCM, validation DTO, Prisma ORM Supabase V2.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
            <div className="text-amber-400 font-bold text-sm tracking-wider uppercase">Code Existant</div>
            <h2 className="text-xl font-bold">apps/legacy</h2>
            <p className="text-sm text-slate-400">
              Ancienne version Vite / React préservée pour référence, consultation des règles et transition d'équipe.
            </p>
          </div>
        </div>

        {/* Sécurité & Architecture */}
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 text-center text-sm text-slate-400">
          <p>
            🔐 <strong>Sécurité FinTech :</strong> Les identifiants Powens et la base de données Supabase V2 sont strictement isolés côté serveur. Aucun secret bancaire n'est exposé au client.
          </p>
        </div>
      </div>
    </main>
  );
}
