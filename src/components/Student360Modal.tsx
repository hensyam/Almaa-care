import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  User,
  Shield,
  Award,
  AlertTriangle,
  HeartPulse,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const Student360Modal: React.FC = () => {
  const {
    selectedStudentId,
    closeStudent360,
    students,
    openNewViolation,
    openNewCoaching,
    openNewAppreciation,
    currentUser,
    refreshAllData,
  } = useApp();

  const [tab, setTab] = useState<'overview' | 'habits' | 'violations' | 'coaching' | 'guardian'>('overview');
  const [data360, setData360] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const student = students.find((s) => s.id === selectedStudentId);

  useEffect(() => {
    if (selectedStudentId) {
      setLoading(true);
      api.getStudent360(selectedStudentId).then((res) => {
        setData360(res);
        setLoading(false);
      });
    }
  }, [selectedStudentId]);

  if (!selectedStudentId || !student) return null;

  const handleToggleHabit = async (habitKey: string) => {
    await api.toggleHabit(student.id, habitKey, currentUser.name, currentUser.role);
    const updated = await api.getStudent360(student.id);
    setData360(updated);
    refreshAllData();
  };

  const handleUpdateStatus = async (status: any) => {
    await api.updateStudentStatus(student.id, status, currentUser.name, currentUser.role);
    refreshAllData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-slate-850 border-b border-slate-800 relative">
          <button
            onClick={closeStudent360}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600/20 border-2 border-emerald-500/40 shadow-md flex items-center justify-center font-bold text-2xl sm:text-3xl text-emerald-300 shrink-0 font-serif">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white font-serif">{student.name}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {student.nis}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    student.status === 'HADIR'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : student.status === 'TERLAMBAT'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : student.status === 'SAKIT'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Panggilan: <span className="text-slate-200 font-medium">{student.nickname}</span> • {student.class.startsWith('Kelas') ? student.class : `Kelas ${student.class}`} • {student.roomNumber} • Kelompok: {student.group}
              </p>

              {/* QUICK COUNTERS */}
              <div className="flex items-center gap-2 sm:gap-4 mt-3 text-xs">
                <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>{student.appreciationCount} Apresiasi</span>
                </div>
                <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{student.violationCount} Pelanggaran</span>
                </div>
                <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>{student.coachingCount} Pembinaan</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-800 pb-1 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                tab === 'overview' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ringkasan & Timeline
            </button>
            <button
              onClick={() => setTab('habits')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                tab === 'habits' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Habit Tracker 24 Jam
            </button>
            <button
              onClick={() => setTab('violations')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                tab === 'violations' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pelanggaran ({data360?.violations?.length || student.violationCount})
            </button>
            <button
              onClick={() => setTab('coaching')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                tab === 'coaching' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pembinaan ({data360?.coachings?.length || student.coachingCount})
            </button>
            <button
              onClick={() => setTab('guardian')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                tab === 'guardian' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Data Wali & Medis
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              {/* CURRENT PRESENCE QUICK TOGGLE */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
                <span className="text-xs font-bold text-slate-300 block mb-2">Ubah Status Kehadiran Cepat:</span>
                <div className="grid grid-cols-5 gap-2">
                  {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        student.status === st
                          ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* BEHAVIOR SUMMARY & PATTERN */}
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Karakter & Dinamika Santri
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Santri menunjukkan komitmen tinggi dalam kegiatan tahfidz dan ibadah berjamaah.
                  {student.violationCount > 0
                    ? ` Tercatat catatan terkait ${student.violationCount > 1 ? 'beberapa keterlambatan pada apel pagi dan piket kamar' : 'kedisiplinan waktu pagi'}. Pembinaan persuasif terus berjalan.`
                    : ' Belum ada catatan pelanggaran disiplin.'}
                </p>
              </div>

              {/* RECENT APPRECIATIONS */}
              {data360?.appreciations && data360.appreciations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    Apresiasi Karakter Terbaru
                  </h4>
                  <div className="space-y-2">
                    {data360.appreciations.map((app: any) => (
                      <div key={app.id} className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-purple-200">{app.category}: {app.description}</p>
                          <p className="text-[11px] text-slate-400">Dicatat oleh {app.supervisorName || app.recordedBy || 'Pengasuh'} • {app.date}</p>
                        </div>
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                          +{app.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'habits' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Siklus pembiasaan karakter 24 jam. Klik item untuk menandai: <strong>DONE (Hijau)</strong> → <strong>HALF (Kuning)</strong> → <strong>MISSED (Merah)</strong>.
              </p>

              <div className="space-y-2">
                {data360?.habit?.habits?.map((h: any) => (
                  <div
                    key={h.key}
                    onClick={() => handleToggleHabit(h.key)}
                    className="p-3 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          h.status === 'DONE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : h.status === 'HALF'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {h.status === 'DONE' ? '✓' : h.status === 'HALF' ? '½' : '✕'}
                      </div>
                      <span className="text-xs font-medium text-slate-200">{h.label}</span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        h.status === 'DONE'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : h.status === 'HALF'
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-rose-900/60 text-rose-300'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                )) || <p className="text-xs text-slate-400">Belum ada habit log.</p>}
              </div>
            </div>
          )}

          {tab === 'violations' && (
            <div className="space-y-2">
              {data360?.violations && data360.violations.length > 0 ? (
                data360.violations.map((v: any) => (
                  <div key={v.id} className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-300">{v.incidentType}</span>
                      <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800">
                        Level {v.level} • {v.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{v.chronology || v.notes || 'Tidak ada catatan tambahan.'}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Lokasi: {v.location}</span>
                      <span>{v.date} {v.time} • Pelapor: {v.supervisorName || v.reporter || 'Pengasuh'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Alhamdulillah, tidak ada catatan pelanggaran untuk santri ini.
                </div>
              )}
            </div>
          )}

          {tab === 'coaching' && (
            <div className="space-y-2">
              {data360?.coachings && data360.coachings.length > 0 ? (
                data360.coachings.map((c: any) => (
                  <div key={c.id} className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-300">Level {c.level}: {c.focusArea}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{c.agreement || c.discussionPoints || c.notes}</p>
                    <p className="text-[10px] text-slate-400">Pembina: {c.supervisorName || c.coachName || 'Musyrif'} • Tanggal: {c.date}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Belum ada sesi pembinaan aktif.
                </div>
              )}
            </div>
          )}

          {tab === 'guardian' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  Identitas Wali Santri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <p>Nama Ayah/Ibu: <strong className="text-white">{student.guardianName}</strong></p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Telepon / WA: <strong className="text-white">{student.guardianPhone}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  Catatan Medis & Khusus
                </h4>
                <p className="text-slate-300">
                  Kondisi Kesehatan: <strong className="text-white">{student.notes || 'Sehat / Tidak ada riwayat penyakit berat.'}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS ("NO DEAD END") */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeStudent360();
                openNewCoaching(student.id);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Bina Santri
            </button>
            <button
              onClick={() => {
                closeStudent360();
                openNewAppreciation(student.id);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              Beri Apresiasi
            </button>
            <button
              onClick={() => {
                closeStudent360();
                openNewViolation(student.id);
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Catat Pelanggaran
            </button>
          </div>

          <button
            onClick={closeStudent360}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
