import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  Plus,
  X,
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  Award,
  BedDouble,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

export const QuickActionFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    openSOPChecklist,
    openBatchAttendance,
    openNewViolation,
    openNewAppreciation,
    openRoomInspect,
    openEmergencyReport,
    openFacilityReport,
  } = useApp();

  const handleAction = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* EXPANDED MENU */}
      {isOpen && (
        <div className="mb-3 space-y-2 flex flex-col items-end animate-in fade-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => handleAction(openEmergencyReport)}
            className="flex items-center gap-2.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>🚨 Lapor Kejadian Darurat</span>
            <div className="w-8 h-8 rounded-full bg-rose-700/80 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction(() => openSOPChecklist())}
            className="flex items-center gap-2.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>📋 Mulai Checking SOP</span>
            <div className="w-8 h-8 rounded-full bg-emerald-700/80 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction(openBatchAttendance)}
            className="flex items-center gap-2.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>👤 Presensi Cepat Santri</span>
            <div className="w-8 h-8 rounded-full bg-blue-700/80 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction(() => openNewViolation())}
            className="flex items-center gap-2.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>⚠️ Catat Pelanggaran</span>
            <div className="w-8 h-8 rounded-full bg-amber-700/80 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction(() => openNewAppreciation())}
            className="flex items-center gap-2.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>⭐ Apresiasi Karakter</span>
            <div className="w-8 h-8 rounded-full bg-purple-700/80 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => handleAction(() => openRoomInspect())}
            className="flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>🛏️ Inspeksi Kamar</span>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <BedDouble className="w-4 h-4 text-emerald-400" />
            </div>
          </button>

          <button
            onClick={() => handleAction(() => openFacilityReport())}
            className="flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-full shadow-lg text-xs font-semibold tracking-wide transition-transform hover:scale-105"
          >
            <span>🔧 Lapor Fasilitas Rusak</span>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
          </button>
        </div>
      )}

      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isOpen
            ? 'bg-slate-700 text-white rotate-90 scale-95'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 ring-4 ring-emerald-500/30'
        }`}
        title="Menu Aksi Cepat Pengasuhan"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
      </button>
    </div>
  );
};
