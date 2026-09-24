import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  LayoutDashboard,
  Clock,
  Users,
  Home,
  ShieldAlert,
  BarChart3,
  Sliders,
  MoreHorizontal,
  X,
  ChevronRight,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, stats, violations, coachings, rooms } = useApp();
  const [showMobileMore, setShowMobileMore] = useState(false);

  const attentionCount = stats?.needsAttentionCount || 0;
  const coachingCount = coachings.filter((c) => c.status !== 'RESOLVED').length;
  const roomAttentionCount = rooms.filter((r) => r.status === 'NEEDS_ATTENTION').length;

  const navItems = [
    {
      id: 'home',
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Command Center & Status Real-time',
    },
    {
      id: 'daily',
      label: 'Operasional 24 Jam',
      shortLabel: 'Operasional',
      icon: Clock,
      badge: 'SOP',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      desc: 'Jadwal, Checklist SOP & Presensi',
    },
    {
      id: 'students',
      label: 'Santri & Habit',
      shortLabel: 'Santri',
      icon: Users,
      badge: attentionCount > 0 ? `${attentionCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      desc: 'Database 360°, Mutabaah & Habit',
    },
    {
      id: 'environment',
      label: 'Kamar & Lingkungan',
      shortLabel: 'Kamar',
      icon: Home,
      badge: roomAttentionCount > 0 ? `${roomAttentionCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      desc: 'Inspeksi Kamar, 5K & Sarpras',
    },
    {
      id: 'coaching',
      label: 'Pembinaan & Kasus',
      shortLabel: 'Pembinaan',
      icon: ShieldAlert,
      badge: coachingCount > 0 ? `${coachingCount}` : null,
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      desc: 'Buku Pelanggaran & Konseling 4 Level',
    },
    {
      id: 'reporting',
      label: 'Laporan & AI',
      shortLabel: 'Laporan AI',
      icon: BarChart3,
      badge: 'AI',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      desc: 'Executive Briefing & Analisis Data',
    },
    {
      id: 'management',
      label: 'Manajemen & Audit',
      shortLabel: 'Manajemen',
      icon: Sliders,
      badge: null,
      desc: 'Log Aktivitas, Shift & Pengaturan',
    },
  ];

  // Secondary items in the "Lainnya" menu for mobile
  const moreItems = navItems.slice(4);
  const isMoreActive = moreItems.some((item) => item.id === activeTab);
  const activeMoreItem = moreItems.find((item) => item.id === activeTab);

  return (
    <>
      {/* TOP HORIZONTAL NAVIGATION BAR - PROMINENT, FULL WIDTH, ALWAYS VISIBLE */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-[57px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2 py-2 overflow-x-auto no-scrollbar scroll-smooth">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'dashboard');
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMobileMore(false);
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/50'
                      : 'text-slate-300 hover:text-white bg-slate-850/60 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-emerald-800 text-emerald-100'
                          : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR 1-HAND ACCESS */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe shadow-2xl">
        <div className="grid grid-cols-5 gap-1 px-1 py-1.5">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'dashboard');
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMobileMore(false);
                }}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium transition-all ${
                  isActive ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 bg-emerald-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-[64px]">{item.shortLabel}</span>
              </button>
            );
          })}

          {/* 5th SLOT: MORE MENU POPUP FOR MOBILE */}
          <button
            id="mobile-nav-more"
            onClick={() => setShowMobileMore(!showMobileMore)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium transition-all ${
              isMoreActive ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              {coachingCount > 0 && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </div>
            <span className="truncate max-w-[64px]">
              {isMoreActive && activeMoreItem ? activeMoreItem.shortLabel : 'Lainnya'}
            </span>
          </button>
        </div>
      </nav>

      {/* MOBILE "LAINNYA" MODAL / DRAWER */}
      {showMobileMore && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center p-3">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-serif font-bold text-sm text-white">Menu Pengasuhan Lainnya</h3>
              <button
                onClick={() => setShowMobileMore(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'dashboard');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileMore(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-emerald-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
