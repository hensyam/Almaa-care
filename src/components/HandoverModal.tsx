import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  Repeat,
  Save,
  UserCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const HandoverModal: React.FC = () => {
  const {
    isHandoverOpen,
    closeHandover,
    currentUser,
    users,
    coachings,
    students,
    refreshAllData,
  } = useApp();

  const [toSupervisorName, setToSupervisorName] = useState('Ust. Ridwan Kamiludin');
  const [shiftName, setShiftName] = useState('Shift Siang (12.00–17.00)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isHandoverOpen) return null;

  const pendingCoachingCount = coachings.filter((c) => c.status !== 'RESOLVED').length;
  const attentionStudentsCount = students.filter((s) => s.status === 'TERLAMBAT' || s.status === 'SAKIT').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.recordHandover(
        {
          fromSupervisorId: currentUser.id,
          fromSupervisorName: currentUser.name,
          toSupervisorId: 'usr-2',
          toSupervisorName,
          shiftName,
          shiftNotes: notes,
          notes,
          pendingCoachingCount,
          pendingFacilityCount: 0,
          attentionStudentsCount,
        } as any,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeHandover();
    } catch (err) {
      console.error('Error recording handover:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Serah Terima Shift Pengasuhan</h3>
                <p className="text-xs text-slate-400">Handover catatan dinas kepada musyrif piket berikutnya</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeHandover}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5 text-xs">
            {/* STATS SUMMARY */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
              <div>
                <span className="text-[11px] text-slate-400">Pembinaan Belum Tuntas:</span>
                <p className="text-base font-bold text-amber-400 font-mono">{pendingCoachingCount} Kasus</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Santri Perlu Pengawasan:</span>
                <p className="text-base font-bold text-rose-400 font-mono">{attentionStudentsCount} Santri</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pengasuh Penyerah:</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pengasuh Penerima:</label>
                <select
                  value={toSupervisorName}
                  onChange={(e) => setToSupervisorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Ust. Ridwan Kamiludin">Ust. Ridwan Kamiludin</option>
                  <option value="Ust. Salman Al-Farisi">Ust. Salman Al-Farisi</option>
                  <option value="Ust. Hamzah Asadullah">Ust. Hamzah Asadullah</option>
                  <option value="Ust. Ahmad Fauzi">Ust. Ahmad Fauzi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Shift Berikutnya:</label>
              <select
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Shift Pagi (04.00–07.00)">Shift Pagi (04.00–07.00)</option>
                <option value="Shift Siang (12.00–17.00)">Shift Siang (12.00–17.00)</option>
                <option value="Shift Sore & Maghrib (17.00–20.00)">Shift Sore & Maghrib (17.00–20.00)</option>
                <option value="Shift Malam & Subuh (20.00–04.00)">Shift Malam & Subuh (20.00–04.00)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Catatan Khusus Handover:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Muhammad Farhan di UKS demam ringan, kamar 02 sudah ditegur untuk perapian sandal, santri izin pulang ada 1 orang..."
                rows={3}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={closeHandover}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'Menyimpan...' : 'Kirim Catatan Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
