'use client';

import React from 'react';
import { TrendingUp, Clock, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatsCards } from './stats-cards';
import { MemberLeaderboard } from './member-leaderboard';
import { StatusPieChart } from './status-pie-chart';
import { DeadlineRiskPanel } from './deadline-risk-panel';

export function StatisticsView() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('all');
  const [projectSearch, setProjectSearch] = React.useState('');
  const [showProjectList, setShowProjectList] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowProjectList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async (projectId?: string) => {
    try {
      setLoading(true);
      const url = projectId && projectId !== 'all' 
        ? `/api/statistics?projectId=${projectId}` 
        : '/api/statistics';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setProjectSearch('');
    setShowProjectList(false);
    fetchData(projectId);
  };

  const filteredProjects = React.useMemo(() => {
    if (!data?.projects) return [];
    return data.projects.filter((p: any) => 
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) || 
      p.key.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [data?.projects, projectSearch]);

  const selectedProjectName = React.useMemo(() => {
    if (selectedProjectId === 'all') return 'Tất cả dự án';
    const p = data?.projects?.find((item: any) => item._id === selectedProjectId);
    return p ? `${p.key} - ${p.title}` : 'Tất cả dự án';
  }, [selectedProjectId, data?.projects]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tổng hợp dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-2 bg-slate-50 dark:bg-[#020617] min-h-full">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Thống kê tiến độ
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Theo dõi tiến độ hoàn thành và hiệu suất công việc theo từng dự án.</p>
        </div>

        {/* SEARCHABLE PROJECT SELECTOR */}
        <div className="relative z-50" ref={containerRef}>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 pl-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-w-[300px]">
             <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap">Dự án:</span>
             <button 
              onClick={() => setShowProjectList(!showProjectList)}
              className="flex-1 text-left text-xs font-bold text-cyan-600 truncate hover:text-cyan-500 transition-colors"
             >
                {selectedProjectName}
             </button>
             <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800" />
             <Search className="h-3.5 w-3.5 text-slate-400 mr-2" />
          </div>

          {showProjectList && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-3 border-b border-slate-50 dark:border-slate-800">
                  <input 
                    autoFocus
                    placeholder="Tìm tên dự án hoặc mã..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-medium p-2.5 focus:ring-1 focus:ring-cyan-500"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
               </div>
               <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                  <button 
                    onClick={() => handleProjectSelect('all')}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                      selectedProjectId === 'all' ? "bg-cyan-50 text-cyan-600" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    Tất cả dự án
                  </button>
                  {filteredProjects.map((p: any) => (
                    <button 
                      key={p._id}
                      onClick={() => handleProjectSelect(p._id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex flex-col gap-0.5",
                        selectedProjectId === p._id ? "bg-cyan-50 text-cyan-600" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="text-[10px] opacity-60 font-medium uppercase">{p.key}</span>
                    </button>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="p-8 text-center text-xs font-medium text-slate-400">
                      Không tìm thấy dự án nào
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] opacity-50">
           <div className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 1. TOP STATS CARDS */}
          <StatsCards summary={data.summary} />

          {/* 2. MAIN CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MEMBER PROGRESS (TIẾN ĐỘ THÀNH VIÊN) */}
            <div className="lg:col-span-1">
              <MemberLeaderboard members={data.memberLeaderboard} />
            </div>

            {/* STATUS DISTRIBUTION (TỶ LỆ TRẠNG THÁI) */}
            <div className="lg:col-span-1">
              <StatusPieChart distribution={data.statusDistribution} />
            </div>
          </div>

          {/* 3. DEADLINE RISK PANEL */}
          <DeadlineRiskPanel metrics={data.summary.riskMetrics} />
        </>
      )}
    </div>
  );
}
