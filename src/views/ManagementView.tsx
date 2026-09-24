import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Repeat,
  History,
  Settings,
  Database,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  UserPlus,
  Edit2,
  GraduationCap,
} from 'lucide-react';
import { Incident } from '../types.js';

export const ManagementView: React.FC = () => {
  const {
    auditLogs,
    handovers,
    users,
    currentUser,
    currentClock,
    incidents,
    dutyRosters,
    openHandover,
    openManageSchedule,
    openManageStaff,
    openManageStudents,
    refreshAllData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'handovers' | 'incidents' | 'users'>('audit');
  const [searchLog, setSearchLog] = useState('');
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [updatingIncidentId, setUpdatingIncidentId] = useState<string | null>(null);

  const handleUpdateIncidentStatus = async (
    id: string,
    status: Incident['status'],
    note?: string
  ) => {
    setUpdatingIncidentId(id);
    try {
      await api.updateIncidentStatus(
        id,
        status,
        currentUser.name,
        currentUser.role,
        note || (status === 'RESOLVED' ? 'Penanganan telah selesai dan kondisi kondusif' : 'Sedang dalam penanganan petugas')
      );
      await refreshAllData();
    } catch (err) {
      console.error('Error updating incident status:', err);
    } finally {
      setUpdatingIncidentId(null);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      !searchLog ||
      log.who.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.what.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.where.toLowerCase().includes(searchLog.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Pusat Manajemen & Tata Kelola
            </span>
            <span className="text-xs text-slate-400">Pondok Pesantren Almaa Parung</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
            Audit Trail, Serah Terima & Insiden Keamanan
          </h2>
          <p className="text-xs text-slate-400">
            Log transparansi akuntabilitas musyrif, rekam jejak serah terima shift, dan investigasi kejadian
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openManageStudents(null)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow shadow-emerald-950/40 transition-colors"
            title="Input Santri & Pengurus Nyata (Super Admin)"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Input Santri & Pengurus
          </button>
          <button
            onClick={() => openManageSchedule(null)}
            className="px-3 py-1.5 bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            Kelola Jadwal & SOP
          </button>
          <button
            onClick={openHandover}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Repeat className="w-3.5 h-3.5" />
            Catat Serah Terima Shift
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'audit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('handovers')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'handovers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Rekam Serah Terima Shift ({handovers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'incidents' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Kejadian Darurat & Insiden ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Musyrif & Akun Pengasuhan ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: AUDIT TRAIL LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Cari aktor, lokasi, rincian audit..."
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Aktor (Pengasuh)</th>
                  <th className="py-2.5 px-3">Aksi</th>
                  <th className="py-2.5 px-3">Entitas</th>
                  <th className="py-2.5 px-3">Rincian Perubahan Faktual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.when}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {log.who}
                      <span className="text-[10px] text-slate-400 block font-normal">{log.role}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-emerald-950 text-emerald-300">
                        AUDIT
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{log.where}</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-md">{log.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SHIFT HANDOVER LOG */}
      {activeSubTab === 'handovers' && (
        <div className="space-y-3">
          {handovers.map((h) => (
            <div
              key={h.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-400">Shift Handover</span>
                  <span className="text-slate-400">• {h.timestamp}</span>
                </div>
                <div className="text-slate-300">
                  Dari: <strong>{h.fromSupervisorName}</strong> ➔ Ke: <strong>{h.toSupervisorName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Pembinaan Belum Tuntas:</span>
                  <p className="font-mono font-bold text-amber-400">{h.pendingCoachingCount} Kasus</p>
                </div>
                <div>
                  <span className="text-slate-400">Santri Perlu Pengawasan:</span>
                  <p className="font-mono font-bold text-rose-400">{h.attentionStudentsCount} Santri</p>
                </div>
              </div>

              <div className="text-slate-300 text-xs leading-relaxed pt-1">
                <span className="font-bold text-slate-400 block mb-0.5">Catatan Handover:</span>
                <p className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">{h.shiftNotes}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: EMERGENCY INCIDENTS */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-4">
          {/* FILTER BAR & SUMMARY */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIncidentFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  incidentFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Semua ({incidents.length})
              </button>
              <button
                type="button"
                onClick={() => setIncidentFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  incidentFilter === 'ACTIVE'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Perlu Penanganan ({incidents.filter((i) => i.status !== 'RESOLVED').length})
              </button>
              <button
                type="button"
                onClick={() => setIncidentFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  incidentFilter === 'RESOLVED'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Selesai Ditangani ({incidents.filter((i) => i.status === 'RESOLVED').length})
              </button>
            </div>
            <div className="text-xs text-slate-400">
              Menampilkan {
                incidents.filter((i) => {
                  if (incidentFilter === 'ACTIVE') return i.status !== 'RESOLVED';
                  if (incidentFilter === 'RESOLVED') return i.status === 'RESOLVED';
                  return true;
                }).length
              } laporan insiden
            </div>
          </div>

          {/* INCIDENT CARDS LIST */}
          <div className="space-y-3">
            {incidents
              .filter((i) => {
                if (incidentFilter === 'ACTIVE') return i.status !== 'RESOLVED';
                if (incidentFilter === 'RESOLVED') return i.status === 'RESOLVED';
                return true;
              })
              .map((inc) => {
                const isResolved = inc.status === 'RESOLVED';
                const isOpen = inc.status === 'OPEN';

                return (
                  <div
                    key={inc.id}
                    className={`p-4 rounded-2xl space-y-3 shadow-lg text-xs border transition-all ${
                      isResolved
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : isOpen
                        ? 'bg-rose-950/20 border-rose-700/80'
                        : 'bg-amber-950/20 border-amber-600/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-rose-400">{inc.code}</span>
                        <h4 className="font-bold text-white text-sm">{inc.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isOpen
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isResolved
                            ? 'SELESAI DITANGANI'
                            : isOpen
                            ? 'MENUNGGU PENANGANAN'
                            : 'SEDANG/SUDAH DITANGANI'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                          Prioritas {inc.priority}
                        </span>
                        <span className="text-[11px] text-slate-400">{inc.createdAt}</span>
                      </div>
                    </div>

                    <p className="text-slate-200 leading-relaxed">{inc.chronology}</p>

                    <div className="bg-slate-850/80 p-3 rounded-xl border border-slate-800 text-slate-300 text-[11px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lokasi:</span>
                        <strong className="text-white">{inc.location}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pelapor / PJ:</span>
                        <strong className="text-white">{inc.reportedBy || inc.picName || 'Musyrif'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tindakan:</span>
                        <strong className="text-white">{inc.actionTaken || inc.initialAction || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status:</span>
                        <strong
                          className={
                            isResolved
                              ? 'text-emerald-400'
                              : isOpen
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }
                        >
                          {inc.status} {isResolved && inc.resolvedBy ? `(oleh ${inc.resolvedBy})` : ''}
                        </strong>
                      </div>
                    </div>

                    {/* ACTION BUTTONS FOR EACH INCIDENT */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60 flex-wrap">
                      {!isResolved ? (
                        <>
                          {isOpen && (
                            <button
                              type="button"
                              onClick={() => handleUpdateIncidentStatus(inc.id, 'RESPONDING')}
                              disabled={updatingIncidentId === inc.id}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Mulai Tangani (RESPONDING)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleUpdateIncidentStatus(inc.id, 'RESOLVED')}
                            disabled={updatingIncidentId === inc.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-transform hover:scale-105"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {updatingIncidentId === inc.id
                              ? 'Menyimpan...'
                              : 'Tandai Selesai Ditangani (RESOLVE)'}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Kasus ditutup pada {inc.resolvedAt || inc.createdAt}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateIncidentStatus(inc.id, 'RESPONDING', 'Kasus dibuka kembali untuk pemantauan lanjutan')}
                            disabled={updatingIncidentId === inc.id}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700"
                          >
                            Buka Kembali Kasus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Daftar Pengurus Asrama & Dewan Asatidz ({users.length} Akun Terdaftar)
              </h3>
              <p className="text-xs text-slate-400">
                Hak akses terbagi menjadi Super Admin, Koordinator, Musyrif, Pimpinan, dan Guru.
              </p>
            </div>
            <button
              onClick={() => openManageStaff(null)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Input Pengurus Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-lg flex flex-col justify-between text-xs transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-sm shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">{u.name}</h4>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {u.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openManageStaff(u)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 transition-colors"
                    title="Edit Profil Pengurus (Super Admin)"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                  <p className="truncate">Email: {u.email}</p>
                  <p>WhatsApp: {u.phone || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
