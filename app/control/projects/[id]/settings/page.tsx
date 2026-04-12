import React from 'react';
import { ProjectSettingsView } from '@/components/control/projects/project-settings-view';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SettingsPage({ params }: Props) {
  // Lấy ID từ params (Next.js 15)
  const { id } = await params;

  // Gọi component giao diện và truyền ID xuống
  return <ProjectSettingsView projectId={id} />;
}