import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  Users,
  Search,
  Filter,
  Award,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Sparkles,
  Plus,
  BedDouble,
  HeartPulse,
  UserPlus,
  Upload,
  Edit2,
} from 'lucide-react';
import { Student, STUDENT_CLASSES } from '../types.js';

export const StudentManagementView: React.FC = () => {
  const {
    students,
    rooms,
    openStudent360,
    openNewViolation,
    openNewCoaching,
    openNewAppreciation,
    openManageStudents,
    openManageBulk,
    habits,
    currentUser,
    refreshAllData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'attention' | 'habits' | 'appreciations'>('all');
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filtered students
  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.nickname.toLowerCase().includes(search.toLowerCase());

    const cleanFilterRoom = filterRoom.replace('Kamar ', '').trim();
    const matchRoom =
      filterRoom === 'ALL' ||
      s.roomNumber === filterRoom ||
      s.roomNumber === cleanFilterRoom ||
      s.roomId === filterRoom;

    const matchClass =
      filterClass === 'ALL' ||
      s.class === filterClass ||
      s.class.toLowerCase().startsWith(filterClass.toLowerCase()) ||
      filterClass.toLowerCase().startsWith(s.class.toLowerCase());

    const matchStatus =
      filterStatus === 'ALL' ||
      s.status === filterStatus ||
      (filterStatus === 'HADIR' && (!s.status || s.status === 'HADIR'));

    if (activeSubTab === 'attention') {
      const isAttention = s.status === 'TERLAMBAT' || s.status === 'SAKIT' || s.status === 'IZIN' || s.status === 'ALPA' || s.violationCount >= 2;
      return isAttention && matchSearch && matchRoom && matchClass && matchStatus;
    }

    return matchSearch && matchRoom && matchClass && matchStatus;
  });

  const handleToggleHabitGrid = async (studentId: string, habitKey: string) => {
    await api.toggleHabit(studentId, habitKey, currentUser.name, currentUser.role);
    refreshAllData();
  };

  const attentionCount = students.filter(
    (s) => s.status === 'TERLAMBAT' || s.status === 'SAKIT' || s.violationCount >= 2
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER & SUB-TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Database Santri
            </span>
            <span className="text-xs text-slate-400">Total: {students.length} Santri Terdata</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
            Manajemen Santri & Karakter 24 Jam
          </h2>
          <p className="text-xs text-slate-400">
            Pemantauan adab, kedisiplinan, kesehatan, dan habit tracker santri
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openManageStudents(null)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow shadow-emerald-950/40"
            title="Input Data Santri Nyata (Super Admin)"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Input Santri Baru</span>
          </button>
          <button
            onClick={() => openManageBulk()}
            className="px-3 py-1.5 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
            title="Impor Masal Nama Santri (Super Admin)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Masal</span>
          </button>
          <button
            onClick={() => openNewAppreciation()}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Award className="w-3.5 h-3.5" />
            Beri Apresiasi
          </button>
          <button
            onClick={() => openNewViolation()}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Catat Pelanggaran
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'all'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          Semua Santri ({students.length})
        </button>

        <button
          onClick={() => setActiveSubTab('attention')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'attention'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Perlu Perhatian</span>
          <span className="bg-amber-950/80 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {attentionCount}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('habits')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'habits'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          Habit Tracker Matrix 24 Jam
        </button>

        <button
          onClick={() => setActiveSubTab('appreciations')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'appreciations'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Leaderboard Apresiasi</span>
        </button>
      </div>

      {/* FILTERS & SEARCH BAR */}
      {(activeSubTab === 'all' || activeSubTab === 'attention') && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama santri, NIS, atau panggilan..."
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs w-full focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Kamar</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.number}>
                  Kamar {r.number}
                </option>
              ))}
            </select>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              {STUDENT_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">Hadir</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
              <option value="ALPA">Alpa</option>
            </select>
          </div>
        </div>
      )}

      {/* VIEW 1 & 2: STUDENT DIRECTORY GRID */}
      {(activeSubTab === 'all' || activeSubTab === 'attention') && (
        <>
          {students.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-serif">
                  Seluruh Data Santri Dummy Telah Dihapus
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Database santri kini bersih dan siap diisi langsung dengan nama-nama santri yang sesungguhnya. Anda dapat memasukkan santri satu per satu atau mengimpor masal sekaligus (copy-paste dari Excel).
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openManageStudents(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Input Santri Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => openManageBulk()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-950/40 transition-all hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  <span>Impor Masal (Copy-Paste Excel)</span>
                </button>
              </div>

              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 text-left text-xs text-slate-300 space-y-1.5 mt-4">
                <p className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                  💡 Panduan Cepat Pengisian:
                </p>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
                  <li>Gunakan tombol <strong>Impor Masal</strong> jika Anda sudah memiliki daftar nama di Excel atau catatan teks.</li>
                  <li>Format per baris cukup: <code className="text-emerald-300">Nama Santri, Nomor Kamar</code> (contoh: <code className="text-emerald-300">Ahmad Fauzan, 01</code>).</li>
                  <li>Kamar asrama yang tersedia: Kamar 01, 02, 03, dan 04.</li>
                </ul>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-300">Tidak ada santri yang sesuai filter</p>
              <p className="text-[11px] text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter kamar/kelas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((st) => (
                <div
                  key={st.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0 font-serif">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-snug">{st.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            {st.roomNumber} • {st.class} • NIS: {st.nis}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          st.status === 'HADIR'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : st.status === 'TERLAMBAT'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : st.status === 'SAKIT'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 my-3 text-center text-xs">
                      <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Pelanggaran</span>
                        <strong className={`font-mono ${st.violationCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {st.violationCount}
                        </strong>
                      </div>
                      <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Pembinaan</span>
                        <strong className={`font-mono ${st.coachingCount > 0 ? 'text-blue-400' : 'text-slate-300'}`}>
                          {st.coachingCount}
                        </strong>
                      </div>
                      <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Apresiasi</span>
                        <strong className="font-mono text-purple-400">
                          {st.appreciationCount}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => openStudent360(st.id)}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold text-center transition-colors"
                    >
                      Profil 360°
                    </button>
                    <button
                      onClick={() => openManageStudents(st)}
                      className="p-1.5 bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700/80 rounded-lg text-xs transition-colors"
                      title="Edit Identitas & Kamar Santri (Super Admin)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openNewCoaching(st.id)}
                      className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs"
                      title="Buka Pembinaan"
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openNewAppreciation(st.id)}
                      className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-xs"
                      title="Beri Apresiasi"
                    >
                      <Award className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VIEW 3: HABIT TRACKER MATRIX */}
      {activeSubTab === 'habits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-bold text-white text-base">Matriks Pembiasaan Karakter 24 Jam</h3>
            <p className="text-xs text-slate-400">
              Klik kotak status untuk mengubah: ✓ (Tuntas/Hijau) → ½ (Sebagian/Kuning) → ✕ (Tidak Tuntas/Merah).
            </p>
          </div>

          {students.length === 0 ? (
            <div className="p-8 text-center bg-slate-850 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-slate-200">Belum Ada Data Santri untuk Habit Tracker</p>
              <p className="text-[11px]">Silakan input data santri nyata terlebih dahulu untuk mulai memantau pembiasaan karakter.</p>
              <button
                type="button"
                onClick={() => openManageStudents(null)}
                className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Input Santri Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Santri</th>
                    <th className="py-2.5 px-3">Kamar</th>
                    <th className="py-2.5 px-2 text-center">Bangun 04.00</th>
                    <th className="py-2.5 px-2 text-center">Subuh Berjamaah</th>
                    <th className="py-2.5 px-2 text-center">Piket Kamar</th>
                    <th className="py-2.5 px-2 text-center">Kamar Rapi</th>
                    <th className="py-2.5 px-2 text-center">KBM Tepat Waktu</th>
                    <th className="py-2.5 px-2 text-center">Adab Santun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((s) => {
                    const log = habits[s.id];
                    const habitMap: Record<string, string> = {};
                    log?.habits?.forEach((h) => {
                      habitMap[h.key] = h.status;
                    });

                    return (
                      <tr key={s.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 font-serif">
                            {s.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[150px]">{s.name}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{s.roomNumber}</td>

                        {['wake_up', 'subuh', 'piket', 'tidy', 'study', 'adab'].map((hKey) => {
                          const st = habitMap[hKey] || 'DONE';
                          return (
                            <td key={hKey} className="py-2 px-2 text-center">
                              <button
                                onClick={() => handleToggleHabitGrid(s.id, hKey)}
                                className={`w-7 h-7 rounded-lg font-bold text-[11px] inline-flex items-center justify-center transition-transform hover:scale-110 ${
                                  st === 'DONE'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : st === 'HALF'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                }`}
                              >
                                {st === 'DONE' ? '✓' : st === 'HALF' ? '½' : '✕'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: APPRECIATION LEADERBOARD */}
      {activeSubTab === 'appreciations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Peringkat Teladan Karakter Santri
            </h3>

            {students.length === 0 ? (
              <div className="p-8 text-center bg-slate-850 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
                <Award className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="font-semibold text-slate-200">Belum Ada Data Santri Terdata</p>
                <p className="text-[11px]">Peringkat teladan dan poin apresiasi akan otomatis terakumulasi setelah Anda menginput data santri.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...students]
                  .sort((a, b) => b.appreciationCount - a.appreciationCount)
                  .map((st, idx) => (
                    <div
                      key={st.id}
                      onClick={() => openStudent360(st.id)}
                      className="p-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 font-serif">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{st.name}</p>
                          <p className="text-[10px] text-slate-400">{st.roomNumber} • {st.class}</p>
                        </div>
                      </div>

                      <span className="font-mono font-bold text-purple-400 text-sm px-3 py-1 bg-purple-950/40 border border-purple-800/50 rounded-xl">
                        ⭐ {st.appreciationCount * 25} Poin
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* POSITIVE REINFORCEMENT PHILOSOPHY */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Filosofi Pengasuhan Almaa
            </h4>
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-300 italic font-serif leading-relaxed">
              "Dipaksa → Terbiasa → Sadar → Menjadi Karakter"
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem Pengasuhan Almaa Care OS tidak semata-mata mencari kesalahan atau menghitung pelanggaran, namun mengutamakan pembiasaan konsisten serta apresiasi atas setiap kebaikan dan adab mulia yang ditunjukkan santri.
            </p>
            <button
              onClick={() => openNewAppreciation()}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
            >
              + Berikan Apresiasi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
