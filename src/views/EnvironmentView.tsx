import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  BedDouble,
  MapPin,
  Wrench,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const EnvironmentView: React.FC = () => {
  const {
    rooms,
    areas,
    facilities,
    openRoomInspect,
    openFacilityReport,
    currentUser,
    refreshAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rooms' | 'areas' | 'facilities'>('rooms');

  const handleUpdateFacilityStatus = async (id: string, status: any) => {
    await api.updateFacilityStatus(id, status, currentUser.name, currentUser.role);
    refreshAllData();
  };

  const attentionRooms = rooms.filter((r) => r.status === 'NEEDS_ATTENTION');
  const openFacilities = facilities.filter((f) => f.status !== 'DONE');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Manajemen Lingkungan
            </span>
            <span className="text-xs text-slate-400">4 Kamar Asrama • 10 Area Kampus</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
            Asrama, Kamar & Fasilitas Santri
          </h2>
          <p className="text-xs text-slate-400">
            Inspeksi 4 pilar: Kebersihan, Kerapihan, Ketertiban, dan Keamanan sarana pesantren
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openFacilityReport()}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Wrench className="w-3.5 h-3.5" />
            Lapor Fasilitas Rusak
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'rooms' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5" />
          <span>Kamar Santri ({rooms.length})</span>
          {attentionRooms.length > 0 && (
            <span className="bg-rose-950 text-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {attentionRooms.length} Perlu Atensi
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('areas')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'areas' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Area Kampus ({areas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'facilities' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-850'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Tiket Fasilitas & Maintenance</span>
          {openFacilities.length > 0 && (
            <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {openFacilities.length} Open
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ROOMS GRID */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((rm) => {
            const isAttention = rm.status === 'NEEDS_ATTENTION';
            return (
              <div
                key={rm.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                  isAttention ? 'border-rose-800/80 ring-1 ring-rose-500/20' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white font-serif">
                          Kamar {rm.number}
                        </h3>
                        <span className="text-xs text-slate-400">({rm.name})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kapasitas: <strong className="text-slate-200">{rm.occupantCount}/{rm.capacity} Santri</strong> • Musyrif: {rm.supervisorName}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        isAttention
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isAttention ? 'Perlu Atensi' : 'Kondisi Baik'}
                    </span>
                  </div>

                  {/* 4 PILLARS SCORES */}
                  <div className="grid grid-cols-4 gap-2 my-4 text-center">
                    <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block truncate">Kebersihan</span>
                      <strong className="font-mono text-emerald-400 text-xs">{rm.scoreClean}</strong>
                    </div>
                    <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block truncate">Kerapihan</span>
                      <strong className="font-mono text-emerald-400 text-xs">{rm.scoreTidy}</strong>
                    </div>
                    <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block truncate">Ketertiban</span>
                      <strong className="font-mono text-emerald-400 text-xs">{rm.scoreOrderly}</strong>
                    </div>
                    <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block truncate">Keamanan</span>
                      <strong className="font-mono text-emerald-400 text-xs">{rm.scoreSafety}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                    <span>Rata-rata Skor: <strong className="text-white font-mono text-sm">{rm.averageScore}/100</strong></span>
                    <span>Inspeksi Terakhir: <strong className="text-slate-300">{rm.lastInspectionDate}</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openRoomInspect(rm.id)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <BedDouble className="w-4 h-4" />
                    Inspeksi Kamar Sekarang
                  </button>
                  <button
                    onClick={() => openFacilityReport(`Kamar ${rm.number}`)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Lapor Kerusakan di Kamar Ini"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    Lapor Rusak
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AREAS GRID */}
      {activeTab === 'areas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((ar) => (
            <div
              key={ar.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">{ar.name}</h4>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {ar.inspectionSchedule}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  PIC Penanggung Jawab: <span className="text-slate-200 font-medium">{ar.picName}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Inspeksi Terakhir: {ar.lastCheckedAt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Kondisi Normal
                </span>
                <button
                  onClick={() => openFacilityReport(ar.name)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors"
                >
                  Lapor Kerusakan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: FACILITY TICKETS */}
      {activeTab === 'facilities' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Daftar Tiket Perbaikan Fasilitas</h3>
              <p className="text-xs text-slate-400">Pemeliharaan sarana asrama dan kelas</p>
            </div>
            <button
              onClick={() => openFacilityReport()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Tiket Baru
            </button>
          </div>

          <div className="space-y-2.5">
            {facilities.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">Tidak ada tiket kerusakan fasilitas.</p>
            ) : (
              facilities.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">{ticket.code}</span>
                      <strong className="text-white text-sm">{ticket.areaOrRoom}</strong>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                          ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-300'
                            : ticket.priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Prioritas {ticket.priority}
                      </span>
                    </div>
                    <p className="text-slate-300">{ticket.issue}</p>
                    <p className="text-[11px] text-slate-400">
                      Pelapor: {ticket.reporterName} ({ticket.createdAt})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        ticket.status === 'DONE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : ticket.status === 'PROCESS'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {ticket.status}
                    </span>

                    {ticket.status !== 'DONE' && (
                      <button
                        onClick={() =>
                          handleUpdateFacilityStatus(
                            ticket.id,
                            ticket.status === 'OPEN' ? 'PROCESS' : 'DONE'
                          )
                        }
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {ticket.status === 'OPEN' ? 'Mulai Kerjakan' : 'Tandai Selesai ✓'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
