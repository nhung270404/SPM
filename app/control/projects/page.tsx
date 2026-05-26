import React from 'react';
import { ProjectListView } from '@/components/control/projects/project-list-view';
import { getProjects } from '@/lib/services/project.service';

export default async function ProjectsPage() {
  const projects = await getProjects();
  
  return <ProjectListView initialData={projects} />;
}