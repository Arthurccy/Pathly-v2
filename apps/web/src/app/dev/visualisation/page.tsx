import type { Metadata } from 'next';
import React from 'react';
import { VisualisationGallery } from '@/components/visualisation/dev/VisualisationGallery';

export const metadata: Metadata = {
  title: 'Dev — Visualisations | Pathly',
  robots: { index: false, follow: false },
};

export default function VisualisationDevPage(): React.JSX.Element {
  return <VisualisationGallery />;
}
