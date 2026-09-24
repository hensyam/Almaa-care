import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Sparkles,
  Award,
  Calendar,
  Clock,
  User,
} from 'lucide-react';

export const CoachingView: React.FC = () => {
  const {
    violations,
    coachings,
    cases,
    openNewViolation,
    openNewCoaching,
    openStudent360,
    currentUser,
    refreshAllData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'violations' | 'coaching' | 'cases'>('coaching');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const handleResolveCoaching = async (id: string) => {
    await api.resolveCoaching(id, currentUser.name, currentUser.role);
    refreshAllData();
  };

  const filteredViolations = violations.filter(
    (v) => filterCategory === 'ALL' || v.category === filterCategory
  );

  const activeCoachingCount = coachings.filter((c) => c.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Pengasuhan Berkelanjutan
            </span>
            <span className="text-xs text-slate-400">{activeCoachingCount} Kasus Pembinaan Aktif</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
            Pelanggaran, Pembinaan & Pendampingan Santri
          </h2>
          <p className="text-xs text-slate-400">
            Pola pendampingan berjenjang: Ingatkan → Bina → Catat & Monitor → Tindak Lanjut Khusus
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openNewViolation()}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Catat Pelanggaran
          </button>
          <button
            onClick={() => openNewCoaching()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Shield className="w-3.5 h-3.5" />
            Buka Sesi Pembinaan
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('coaching')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'coaching'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Sesi Pembinaan ({coachings.length})</span>
          {activeCoachingCount > 0 && (
            <span className="bg-blue-950 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {activeCoachingCount} Aktif
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('violations')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'violations'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Buku Pelanggaran ({violations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cases')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'cases'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Kasus & Penanganan ({cases.length})</span>
        </button>
      </div>

      {/* TAB 1: COACHING SESSIONS */}
      {activeSubTab === 'coaching' && (
        <div className="space-y-3">
          {coachings.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      c.level === 1
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : c.level === 2
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : c.level === 3
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    Level {c.level}: {c.level === 1 ? 'Diingatkan' : c.level === 2 ? 'Dibina' : c.level === 3 ? 'Dicatat & Dimonitor' : 'Tindak Lanjut Khusus'}
                  </span>

                  <strong className="text-white text-sm cursor-pointer hover:underline" onClick={() => openStudent360(c.studentId)}>
                    {c.studentName}
                  </strong>

                  <span className="text-slate-400">• Pembina: {c.supervisorName} ({c.date})</span>
                </div>

                <p className="text-slate-200 font-medium">
                  Fokus: <span className="text-emerald-300">{c.focusArea}</span>
                </p>

                {(c.discussionPoints || c.agreement) && (
                  <p className="text-slate-400 text-[11px] bg-slate-850 p-2 rounded-lg border border-slate-800 leading-relaxed">
                    {c.agreement || c.discussionPoints}
                  </p>
                )}

                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Target Evaluasi: <strong className="text-slate-300">{c.targetDate || '-'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {c.status === 'RESOLVED' ? 'Tuntas ✓' : 'Dalam Pembinaan'}
                </span>

                {c.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolveCoaching(c.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow"
                  >
                    Tandai Tuntas
                  </button>
                )}

                <button
                  onClick={() => openStudent360(c.studentId)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  Lihat 360°
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: VIOLATIONS LOG */}
      {activeSubTab === 'violations' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Kategori (6 Kategori)</option>
              <option value="DISIPLIN">Disiplin Waktu / Shalat</option>
              <option value="KEBERSIHAN">Kebersihan & Kerapihan</option>
              <option value="KETERTIBAN">Ketertiban Asrama</option>
              <option value="ADAB">Adab & Kesopanan</option>
              <option value="KEAMANAN">Keamanan</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filteredViolations.map((v) => (
              <div
                key={v.id}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.2 rounded bg-amber-950 text-amber-400 font-bold uppercase text-[10px]">
                      {v.category} (Lvl {v.level})
                    </span>
                    <strong
                      className="text-white text-sm cursor-pointer hover:underline"
                      onClick={() => openStudent360(v.studentId)}
                    >
                      {v.studentName}
                    </strong>
                    <span className="text-slate-400">• Lokasi: {v.location}</span>
                  </div>

                  <p className="text-slate-200 font-medium">{v.incidentType}</p>
                  <p className="text-slate-400 text-[11px]">{v.actionTaken}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-amber-400 font-bold block text-sm">
                    Tingkat Lvl {v.level}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {v.date} ({v.time})
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Pencatat: {v.supervisorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLEX CASE MANAGEMENT */}
      {activeSubTab === 'cases' && (
        <div className="space-y-4">
          {cases.map((cs) => (
            <div
              key={cs.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400 font-bold">{cs.code}</span>
                    <h3 className="text-base font-bold text-white font-serif">{cs.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Santri: <strong className="text-white">{cs.studentName}</strong> • Kategori: {cs.category}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold self-start sm:self-auto uppercase ${
                    cs.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  Tahap: {cs.status}
                </span>
              </div>

              {/* TIMELINE MILESTONES */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Rekam Jejak Penanganan:
                </span>
                <div className="space-y-2">
                  {cs.timeline.map((tm, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2.5 bg-slate-850 rounded-xl border border-slate-800 text-xs"
                    >
                      <span className="font-mono text-[11px] text-purple-400 shrink-0 font-bold">
                        {tm.date}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-200">{tm.title}</p>
                        <p className="text-slate-400 text-[11px]">{tm.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Oleh: {tm.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
