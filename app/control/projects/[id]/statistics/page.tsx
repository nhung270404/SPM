import React from 'react';
import { StatisticsView } from '@/components/control/projects/statistics-view';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StatisticsPage({ params }: Props) {
  // Next.js 15: params là Promise
  const { id } = await params;

  return <StatisticsView projectId={id} />;
}