import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pathly — Agrégation Bancaire & Optimisation Financière',
  description:
    'Pilotez votre patrimoine en temps réel avec Pathly : synchronisation bancaire Open Banking, intelligence prédictive de trésorerie et sécurité de niveau bancaire.',
  keywords: ['FinTech', 'Open Banking', 'Agrégation bancaire', 'Gestion de trésorerie', 'Patrimoine', 'Powens'],
  authors: [{ name: 'Équipe Pathly' }],
  openGraph: {
    title: 'Pathly — Solution FinTech d\'optimisation financière',
    description: 'Refonte technologique Next.js & NestJS avec intégration bancaire sécurisée.',
    url: 'https://pathly.app',
    siteName: 'Pathly',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
