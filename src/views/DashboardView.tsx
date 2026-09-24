import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  Clock,
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Users,
  Repeat,
  HeartPulse,
  Settings,
  UserPlus,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    stats,
    currentClock,
    activeActivity,
    nextActivity,
    students,
    coachings,
    violations,
    incidents,
    openSOPChecklist,
    openStudent360,
    openNewCoaching,
    openHandover,
    openBatchAttendance,
    openManageSchedule,
    openManageStudents,
    refreshAllData,
    setActiveTab,
  } = useApp();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Fetch AI summary for Executive / Coordinator view
  useEffect(() => {
    if (currentUser.role === 'PIMPINAN' || currentUser.role === 'KOORDINATOR') {
      setLoadingAi(true);
      api.getDailyAISummary().then((res) => {
        setAiSummary(res);
        setLoadingAi(false);
      });
    }
  }, [currentUser.role]);

  const attentionStudents = students.filter(
    (s) => s.status === 'TERLAMBAT' || s.status === 'SAKIT' || s.violationCount >= 2
  );

  const unhandledIncidents = incidents.filter((i) => i.status === 'OPEN');
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  const sickStudents = students.filter((s) => s.status === 'SAKIT');
  const permittedStudents = students.filter((s) => s.status === 'IZIN');
  const presentStudents = students.filter((s) => s.status === 'HADIR');
  const lateStudents = students.filter((s) => s.status === 'TERLAMBAT');
  const alphaStudents = students.filter((s) => s.status === 'ALPA');

  // Santri yang sedang sakit atau izin pulang untuk ditampilkan di daftar absensi
  const absentAndPermittedStudents = [...students.filter(
    (s) => s.status === 'SAKIT' || s.status === 'IZIN' || s.status === 'TERLAMBAT' || s.status === 'ALPA'
  )].sort((a, b) => {
    const priority: Record<string, number> = { SAKIT: 1, IZIN: 2, ALPA: 3, TERLAMBAT: 4, HADIR: 5 };
    return (priority[a.status] || 5) - (priority[b.status] || 5);
  });

  const [resolvingIncidentId, setResolvingIncidentId] = useState<string | null>(null);

  const handleResolveIncident = async (incId: string) => {
    setResolvingIncidentId(incId);
    try {
      await api.updateIncidentStatus(
        incId,
        'RESOLVED',
        currentUser.name,
        currentUser.role,
        'Sudah ditangani dan dipastikan aman kondusif'
      );
      await refreshAllData();
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    } finally {
      setResolvingIncidentId(null);
    }
  };

  const handleStartResponding = async (incId: string) => {
    setResolvingIncidentId(incId);
    try {
      await api.updateIncidentStatus(
        incId,
        'RESPONDING',
        currentUser.name,
        currentUser.role,
        'Petugas sedang menangani di lokasi'
      );
      await refreshAllData();
    } catch (err) {
      console.error('Failed to update incident:', err);
    } finally {
      setResolvingIncidentId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. GREETING & CONTEXT BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-600/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pondok Pesantren Almaa Parung
              </span>
              <span className="text-xs text-slate-400">• {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
              Assalamu'alaikum, {currentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {currentUser.role === 'PENGASUH' && 'Siklus pengasuhan santri 24 jam sedang berjalan. Awasi, periksa, catat, dan bina dengan penuh ketulusan.'}
              {currentUser.role === 'KOORDINATOR' && 'Command Center Pengasuhan: Seluruh dinamika kamar, shift jaga, dan pembinaan santri terpantau real-time.'}
              {currentUser.role === 'PIMPINAN' && 'Executive Overview: Ringkasan kedisiplinan santri, pola karakter, dan stabilitas asrama pesantren.'}
              {currentUser.role === 'GURU' && 'Portal Asatidz: Pemantauan kehadiran kegiatan belajar dan halaqah santri.'}
              {currentUser.role === 'SUPER_ADMIN' && 'Master Control: Pengaturan data pesantren, SOP 24 jam, dan audit trail sistem.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openManageSchedule(null)}
              className="px-3.5 py-2 bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40"
              title="Kelola & Edit Master Jadwal 24 Jam & SOP"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              Kelola Jadwal & SOP
            </button>
            {currentUser.role === 'PENGASUH' && (
              <button
                onClick={openHandover}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Repeat className="w-4 h-4 text-blue-400" />
                Handover Shift
              </button>
            )}
            <button
              onClick={() => openSOPChecklist()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform hover:scale-105"
            >
              <ClipboardCheck className="w-4 h-4" />
              Mulai Checking SOP
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 INCIDENT ALERT BANNER (ONLY PULSES IF UNHANDLED, CALM IF RESPONDING/HANDLED) */}
      {activeIncidents.length > 0 && (
        <div
          className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            unhandledIncidents.length > 0
              ? 'bg-rose-950/40 border border-rose-800/80 animate-pulse'
              : 'bg-slate-900 border border-amber-600/50 shadow-lg'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                unhandledIncidents.length > 0
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {unhandledIncidents.length > 0 ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={`text-sm font-bold ${
                    unhandledIncidents.length > 0 ? 'text-rose-200' : 'text-amber-200'
                  }`}
                >
                  {unhandledIncidents.length > 0
                    ? `🚨 Kejadian Darurat Membutuhkan Penanganan: ${activeIncidents[0].title}`
                    : `📋 Kejadian Sedang / Sudah Ditangani: ${activeIncidents[0].title}`}
                </h4>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    unhandledIncidents.length > 0
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {activeIncidents[0].status === 'OPEN'
                    ? 'BELUM DITANGANI'
                    : 'SEDANG/SUDAH DITANGANI'}
                </span>
              </div>
              <p className="text-xs text-slate-300/90 mt-1">
                Lokasi: <span className="font-semibold text-slate-100">{activeIncidents[0].location}</span> • 
                {activeIncidents[0].actionTaken || activeIncidents[0].initialAction
                  ? ` Tindakan: "${activeIncidents[0].actionTaken || activeIncidents[0].initialAction}"`
                  : ` Petugas: ${activeIncidents[0].picName || activeIncidents[0].reportedBy || 'Musyrif'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
            {activeIncidents[0].status === 'OPEN' && (
              <button
                type="button"
                onClick={() => handleStartResponding(activeIncidents[0].id)}
                disabled={resolvingIncidentId === activeIncidents[0].id}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow transition-colors"
              >
                Mulai Tangani
              </button>
            )}
            <button
              type="button"
              onClick={() => handleResolveIncident(activeIncidents[0].id)}
              disabled={resolvingIncidentId === activeIncidents[0].id}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow flex items-center gap-1.5 transition-transform hover:scale-105"
              title="Tandai kejadian ini telah selesai ditangani dan kondisi sudah aman"
            >
              <CheckCircle2 className="w-4 h-4" />
              {resolvingIncidentId === activeIncidents[0].id
                ? 'Menyimpan...'
                : 'Tandai Selesai Ditangani'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('management')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
            >
              Detail Kasus
            </button>
          </div>
        </div>
      )}

      {/* 2. CORE DAILY LOOP HERO ("SEKARANG & BERIKUTNYA") */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ACTIVE ACTIVITY ("SEKARANG") */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  SEKARANG ({currentClock} WIB)
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                Sedang Berlangsung
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">
                {activeActivity?.name || 'Kebersihan Pagi & Rapikan Kamar'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Waktu Pelaksanaan: <span className="font-mono font-semibold text-emerald-300">{activeActivity?.timeStart} – {activeActivity?.timeEnd} WIB</span> • SOP: {activeActivity?.sopTitle || 'Kebersihan & Ketertiban'}
              </p>
            </div>

            {/* SOP PREVIEW ITEMS */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Item Pemeriksaan SOP:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeActivity?.sopItems.slice(0, 4).map((sop) => (
                  <div key={sop.id} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-850 p-2 rounded-lg border border-slate-800">
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${sop.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {sop.completed ? '✓' : '○'}
                    </div>
                    <span className="truncate">{sop.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => openSOPChecklist(activeActivity || undefined)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                Buka Checklist SOP
              </button>
              <button
                onClick={() => openBatchAttendance()}
                className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Presensi Santri
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Pengasuh Bertugas: <strong className="text-slate-200">{currentUser.name}</strong>
            </span>
          </div>
        </div>

        {/* UPCOMING ACTIVITY ("BERIKUTNYA") & QUICK METRICS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              AGENDA BERIKUTNYA
            </span>
            <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-amber-400">
                  {nextActivity?.timeStart} – {nextActivity?.timeEnd} WIB
                </span>
                <span className="text-[10px] text-slate-400">Segera</span>
              </div>
              <h4 className="font-bold text-white text-sm">{nextActivity?.name}</h4>
              <p className="text-xs text-slate-400 mt-1">SOP: {nextActivity?.sopTitle}</p>
            </div>

            {/* QUICK HEALTH METRICS */}
            <div className="mt-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Kondisi Pesantren Saat Ini:
              </span>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-slate-300">Kedisiplinan Santri</span>
                <span className="font-mono font-bold text-emerald-400">{stats?.disciplineScore}%</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-slate-300">Santri Sakit & Izin Pulang</span>
                <span className="font-mono font-bold text-xs flex items-center gap-1.5">
                  <span className="text-rose-400">{sickStudents.length} Sakit</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-sky-400">{permittedStudents.length} Izin</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-slate-300">Kebersihan Asrama</span>
                <span className="font-mono font-bold text-emerald-400">{stats?.cleanScore}/100</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-slate-300">Kerapihan Ranjang</span>
                <span className="font-mono font-bold text-emerald-400">{stats?.orderlyScore}/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => setActiveTab('daily')}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Jadwal 24 Jam</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openManageSchedule(null)}
              className="py-2 px-3 bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Jadwal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIORITY ACTION LIST: "APA YANG HARUS DILAKUKAN SEKARANG?" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SANTRI PERLU PERHATIAN */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Santri Perlu Perhatian</h4>
                  <p className="text-[11px] text-slate-400">Terlambat, sakit, atau perlu konseling</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-mono">
                {attentionStudents.length}
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {students.length === 0 ? (
                <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-300 font-semibold">Data Santri Masih Kosong</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Seluruh dummy telah dihapus. Siap diisi dengan nama santri sesungguhnya.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('students');
                      openManageStudents(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/40"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Input Santri Sekarang
                  </button>
                </div>
              ) : attentionStudents.length === 0 ? (
                <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                  <p className="text-emerald-400 font-semibold mb-0.5">Alhamdulillah Nihil Perhatian</p>
                  <p className="text-[11px]">Semua santri dalam kondisi hadir dan tertib.</p>
                </div>
              ) : (
                attentionStudents.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => openStudent360(st.id)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 font-serif">
                        {st.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{st.name}</p>
                        <p className="text-[10px] text-slate-400">{st.roomNumber} • Status: {st.status}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium shrink-0">
                      Bina
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('students')}
            className="w-full mt-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold text-center"
          >
            Lihat Semua Santri Perhatian →
          </button>
        </div>

        {/* KONDISI ABSENSI SANTRI (MENGGANTIKAN INSPEKSI & KAMAR SANTRI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Absensi Santri</h4>
                  <p className="text-[11px] text-slate-400">Kondisi kehadiran, sakit & izin pulang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openBatchAttendance()}
                className="text-[11px] font-bold px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg flex items-center gap-1 transition-colors"
                title="Buka form presensi masal santri"
              >
                <span>Presensi</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* RINGKASAN KONDISI KEHADIRAN (STAT COUNTERS) */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <div className="bg-rose-950/25 border border-rose-800/40 p-2 rounded-xl text-center">
                <span className="text-[10px] text-rose-300 font-medium block">Sakit</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <HeartPulse className="w-3 h-3 text-rose-400" />
                  <span className="text-base font-mono font-bold text-rose-400">
                    {sickStudents.length}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block">santri di UKS</span>
              </div>

              <div className="bg-sky-950/25 border border-sky-800/40 p-2 rounded-xl text-center">
                <span className="text-[10px] text-sky-300 font-medium block">Izin Pulang</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Repeat className="w-3 h-3 text-sky-400" />
                  <span className="text-base font-mono font-bold text-sky-400">
                    {permittedStudents.length}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block">pesiar / izin</span>
              </div>

              <div className="bg-emerald-950/25 border border-emerald-800/40 p-2 rounded-xl text-center">
                <span className="text-[10px] text-emerald-300 font-medium block">Hadir</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-base font-mono font-bold text-emerald-400">
                    {presentStudents.length}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block">santri di pondok</span>
              </div>
            </div>

            {/* DAFTAR SANTRI SAKIT, IZIN PULANG, ATAU TERLAMBAT */}
            <div className="space-y-2 mt-2">
              {students.length === 0 ? (
                <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Data Santri Belum Ada</p>
                  <p className="text-[11px] text-slate-400">
                    Data santri belum diisi. Tambahkan data santri untuk mulai memantau absensi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('students');
                      openManageStudents(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Input Data Santri
                  </button>
                </div>
              ) : absentAndPermittedStudents.length === 0 ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/40 text-center space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-bold text-emerald-400">
                      Alhamdulillah, Seluruh Santri Hadir ({students.length} Santri)
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Nihil santri sakit di UKS dan tidak ada yang izin pulang.
                    </p>
                  </div>

                  {/* PREVIEW OF REGISTERED SANTRI */}
                  <div className="space-y-1.5 pt-0.5">
                    {students.slice(0, 3).map((st) => (
                      <div
                        key={st.id}
                        onClick={() => openStudent360(st.id)}
                        className="p-2 bg-slate-850/80 hover:bg-slate-800 border border-slate-800/80 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                        title="Klik untuk melihat profil 360 santri"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 font-serif">
                            {st.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">{st.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">Kamar {st.roomNumber} • {st.class}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                          Hadir
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                absentAndPermittedStudents.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => openStudent360(st.id)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 font-serif ${
                          st.status === 'SAKIT'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : st.status === 'IZIN'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : st.status === 'TERLAMBAT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {st.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{st.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {st.roomNumber} • {st.class} {st.notes ? `• "${st.notes}"` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        st.status === 'SAKIT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : st.status === 'IZIN'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : st.status === 'TERLAMBAT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {st.status === 'SAKIT'
                        ? 'Sakit'
                        : st.status === 'IZIN'
                        ? 'Izin Pulang'
                        : st.status === 'TERLAMBAT'
                        ? 'Terlambat'
                        : 'Alpa'}
                    </span>
                  </div>
                ))
              )}

              {absentAndPermittedStudents.length > 3 && (
                <p className="text-[10px] text-slate-400 text-center pt-0.5">
                  + {absentAndPermittedStudents.length - 3} santri sakit/izin lainnya
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => openBatchAttendance()}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Update Presensi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              <span>Rekap Santri ({students.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PEMBINAAN & APRESIASI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pembinaan & Apresiasi</h4>
                  <p className="text-[11px] text-slate-400">Keseimbangan disiplin & apresiasi</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-mono">
                {coachings.filter((c) => c.status !== 'RESOLVED').length} Aktif
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {coachings.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveTab('coaching')}
                  className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{c.studentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Level {c.level}: {c.focusArea}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                      c.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('coaching')}
            className="w-full mt-3 py-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold text-center"
          >
            Lihat Semua Kasus Pembinaan →
          </button>
        </div>
      </div>

      {/* 4. AI DAILY EXECUTIVE SUMMARY (GROUNDED IN REAL DATA) */}
      {(currentUser.role === 'PIMPINAN' || currentUser.role === 'KOORDINATOR') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Ringkasan Pengasuhan Hari Ini (AI Executive Summary)
                </h3>
                <p className="text-xs text-slate-400">
                  Sintesis otomatis berbasis data faktual 24 jam Pondok Pesantren Almaa
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                setLoadingAi(true);
                const res = await api.getDailyAISummary();
                setAiSummary(res);
                setLoadingAi(false);
              }}
              disabled={loadingAi}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {loadingAi ? 'Menyusun...' : 'Perbarui Ringkasan'}
            </button>
          </div>

          <div className="p-4 bg-slate-850/80 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
            {loadingAi ? (
              <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Menganalisis data kegiatan, kehadiran, dan pembinaan 24 jam...
              </div>
            ) : (
              aiSummary || 'Memuat ringkasan harian...'
            )}
          </div>
        </div>
      )}
    </div>
  );
};
