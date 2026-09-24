import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Save,
  MapPin,
  Clock,
  PhoneCall,
} from 'lucide-react';

export const EmergencyReportModal: React.FC = () => {
  const {
    isEmergencyReportOpen,
    closeEmergencyReport,
    currentUser,
    currentClock,
    refreshAllData,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'KESEHATAN' | 'KEAMANAN' | 'PERILAKU_BERAT' | 'FASILITAS_KRITIS'>('KESEHATAN');
  const [priority, setPriority] = useState<'HIGH' | 'CRITICAL'>('HIGH');
  const [location, setLocation] = useState('Kamar 01');
  const [chronology, setChronology] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isEmergencyReportOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !chronology) return;

    setSubmitting(true);
    try {
      await api.addIncident(
        {
          code: 'INC-' + Math.floor(1000 + Math.random() * 9000),
          title,
          category,
          incidentType: category,
          priority,
          location,
          chronology,
          initialAction: actionTaken,
          actionTaken,
          picId: currentUser.id,
          picName: currentUser.name,
          reportedBy: currentUser.name,
          reportedAt: currentClock,
          date: new Date().toISOString().slice(0, 10),
          time: currentClock,
          status: 'OPEN',
          studentIds: [],
          studentNames: [],
        } as any,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeEmergencyReport();
    } catch (err) {
      console.error('Error reporting incident:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        <form onSubmit={handleSubmit}>
          {/* HEADER */}
          <div className="p-4 sm:p-5 bg-rose-950/60 border-b border-rose-900/60 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-950">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">🚨 Lapor Kejadian Darurat / Kritis</h3>
                <p className="text-xs text-rose-300">Respon cepat 24 jam Pondok Pesantren Almaa</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeEmergencyReport}
              className="text-rose-300 hover:text-white p-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5 max-h-[60vh] overflow-y-auto text-xs">
            {/* TITLE */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Judul Kejadian:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Santri Asma Kambuh Hebat, Konsleting Listrik Asrama..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-semibold"
              />
            </div>

            {/* CATEGORY & PRIORITY */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Kategori Kejadian:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="KESEHATAN">Medis / Kesehatan Santri</option>
                  <option value="KEAMANAN">Keamanan Lingkungan</option>
                  <option value="PERILAKU_BERAT">Pelanggaran Berat / Adab</option>
                  <option value="FASILITAS_KRITIS">Fasilitas / Listrik / Air</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tingkat Kegentingan:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="HIGH">HIGH (Perlu Respon Segera)</option>
                  <option value="CRITICAL">CRITICAL (Darurat / Evakuasi)</option>
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Lokasi Tepat:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Kamar 01 Asrama Putra, Dapur Umum, Masjid..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* CHRONOLOGY */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Kronologi Kejadian Faktual:</label>
              <textarea
                value={chronology}
                onChange={(e) => setChronology(e.target.value)}
                placeholder="Jelaskan apa yang terjadi, santri yang terlibat, waktu persis, kondisi saat ini..."
                rows={3}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            {/* ACTION TAKEN */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Tindakan Awal yang Sudah Diambil:</label>
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Contoh: Dibawa ke Pos UKS, diberikan oksigen, musyrif mendampingi..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Pelapor: <strong>{currentUser.name}</strong> • {currentClock}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEmergencyReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-colors animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {submitting ? 'Mengirim...' : 'KIRIM LAPORAN DARURAT'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
