import React from 'react';

// Next.js 15: params là Promise
type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ProjectLayout({ children }: Props) {
  // Layout này giờ chỉ đóng vai trò giữ full chiều cao, không render Header nữa
  return (
    <div className="h-full w-full bg-[#020617]">
      {children}
    </div>
  );
}