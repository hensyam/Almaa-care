import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  Clock,
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Calendar,
  Users,
  ChevronRight,
  Sparkles,
  Settings,
  Plus,
  Edit3,
} from 'lucide-react';

export const DailyOperationView: React.FC = () => {
  const {
    activities,
    currentClock,
    activeActivity,
    dutyRosters,
    openSOPChecklist,
    openBatchAttendance,
    openHandover,
    openManageSchedule,
    currentUser,
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'timeline' | 'roster'>('timeline');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Operasional Harian
            </span>
            <span className="text-xs text-slate-400">Jam Sistem: <strong className="text-white font-mono">{currentClock} WIB</strong></span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
            Siklus Kehidupan Santri 24 Jam
          </h2>
          <p className="text-xs text-slate-400">
            Rangkaian kegiatan dari bangun tahajjud (04.00) hingga istirahat malam (22.00)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openManageSchedule(null)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition-colors"
            title="Buka Editor Master Jadwal & SOP 24 Jam"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Kelola & Edit Jadwal</span>
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setActiveTabSub('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTabSub === 'timeline'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Timeline 24 Jam
          </button>
          <button
            onClick={() => setActiveTabSub('roster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTabSub === 'roster'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Piket & Shift Jaga
          </button>
        </div>
      </div>

      {activeTabSub === 'timeline' && (
        <div className="space-y-4">
          {/* QUICK ACTION BAR */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-850 rounded-xl border border-slate-800 flex-wrap">
            <span className="text-xs text-slate-300">
              Kegiatan Aktif Saat Ini: <strong className="text-emerald-400">{activeActivity?.name || 'Kegiatan Rutin'}</strong> ({activeActivity?.timeStart}–{activeActivity?.timeEnd})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openSOPChecklist(activeActivity || undefined)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Mulai Checking SOP
              </button>
              <button
                onClick={() => openBatchAttendance()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Presensi Santri
              </button>
              <button
                onClick={() => openManageSchedule(null)}
                className="px-3 py-1.5 bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Kelola & Tambah Jadwal 24 Jam"
              >
                <Settings className="w-3.5 h-3.5 text-purple-400" />
                Kelola Jadwal & SOP
              </button>
            </div>
          </div>

          {/* 24-HOUR TIMELINE CARDS */}
          <div className="space-y-2.5">
            {activities.map((act, index) => {
              const isActive = act.isCurrent;
              const isPast = act.isPassed;

              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-slate-900 border-emerald-500/80 shadow-lg ring-2 ring-emerald-500/20'
                      : isPast
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      {/* TIME BADGE */}
                      <div
                        className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 text-center min-w-[105px] ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : isPast
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {act.timeStart} – {act.timeEnd}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm sm:text-base font-bold font-serif ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {act.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                              Sedang Berlangsung
                            </span>
                          )}
                          {act.hasCheckingDone && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                              ✓ Checked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Kategori: <span className="text-slate-300">{act.category}</span> • SOP: <span className="text-slate-300">{act.sopTitle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => openSOPChecklist(act)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isActive
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>{act.hasCheckingDone ? 'Tinjau SOP' : 'Checklist SOP'}</span>
                      </button>

                      <button
                        onClick={() => openBatchAttendance()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Presensi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openManageSchedule(act)}
                        className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Edit jam dan butir SOP kegiatan ini"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Edit Jadwal</span>
                      </button>
                    </div>
                  </div>

                  {/* SOP ITEMS EXPANDED PREVIEW */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {act.sopItems.map((sop) => (
                      <span
                        key={sop.id}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          sop.completed
                            ? 'bg-emerald-950/20 text-emerald-300 border-emerald-800/40'
                            : 'bg-slate-850 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sop.completed ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        {sop.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTabSub === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-white text-base">Jadwal Shift Jaga Pengasuh (24 Jam)</h3>
              <p className="text-xs text-slate-400">Rotasi piket pengasuhan Pondok Pesantren Almaa</p>
            </div>
            <button
              onClick={openHandover}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Repeat className="w-3.5 h-3.5" />
              Lakukan Handover Shift
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dutyRosters.map((dr) => (
              <div
                key={dr.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-850 text-emerald-400 border border-slate-700">
                    {dr.shift}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                    {dr.date}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">{dr.supervisorName}</h4>
                  <p className="text-xs text-slate-400">Pengasuh Bertugas</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fokus Tugas Shift:
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Memastikan SOP kegiatan terlaksana, patroli santri, dan pemeriksaan berkala.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
