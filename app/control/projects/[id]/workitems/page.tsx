import React from 'react';
import { WorkItemsView } from '@/components/control/projects/workitems/work-items-view';

// Với Next.js 15, params là một Promise
type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkItemsPage({ params }: Props) {
  // Giải nén params (await vì là Promise)
  const { id } = await params;

  // Gọi component View và truyền ID vào
  return <WorkItemsView projectId={id} />;
}