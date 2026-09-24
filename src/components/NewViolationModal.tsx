import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  AlertTriangle,
  Save,
  MapPin,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { ViolationCategory } from '../types.js';

export const NewViolationModal: React.FC = () => {
  const {
    isNewViolationOpen,
    closeNewViolation,
    students,
    currentUser,
    currentClock,
    refreshAllData,
    preselectedStudentId,
  } = useApp();

  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id || ''));
  const [category, setCategory] = useState<ViolationCategory>('DISIPLIN');
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [incidentType, setIncidentType] = useState('Terlambat bangun shalat subuh');
  const [location, setLocation] = useState('Asrama Putra Lantai 1');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isNewViolationOpen) return null;

  const violationExamples: Record<ViolationCategory, string[]> = {
    DISIPLIN: [
      'Terlambat bangun shalat subuh',
      'Terlambat masuk halaqah / KBM',
      'Tidak mengikuti apel pagi',
      'Keluar area pondok tanpa izin tertulis',
    ],
    KEBERSIHAN: [
      'Tidak melaksanakan piket kamar',
      'Membuang sampah tidak pada tempatnya',
      'Kamar mandi tidak disiram bersih',
      'Meninggalkan piring kotor di area makan',
    ],
    KERAPIHAN: [
      'Pakaian / seragam tidak rapi / tidak dimasukkan',
      'Rambut tidak sesuai standar pondok',
      'Sprei kasur tidak dipasang',
      'Sandal / sepatu tidak ditaruh di rak',
    ],
    KETERTIBAN: [
      'Begadang / gaduh setelah jam malam 22.00',
      'Membawa barang terlarang (alat elektronik/HP)',
      'Meminjam barang teman tanpa izin',
    ],
    ADAB: [
      'Berbicara kasar atau bernada tinggi',
      'Tidak mengucap salam saat berpapasan',
      'Bercanda berlebihan saat waktu ibadah',
    ],
    KEAMANAN: [
      'Membakar sampah di dekat asrama',
      'Memanjat pagar pesantren',
      'Mengutak-atik saklar/panel listrik',
    ],
  };

  const selectedStudent = students.find((s) => s.id === studentId) || students[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setSubmitting(true);
    try {
      await api.addViolation(
        {
          studentId,
          studentName: selectedStudent.name,
          roomId: selectedStudent.roomId || selectedStudent.roomNumber || 'Kamar 01',
          category,
          level,
          incidentType,
          location,
          date: new Date().toISOString().slice(0, 10),
          time: currentClock,
          supervisorId: currentUser.id,
          supervisorName: currentUser.name,
          reporter: currentUser.name,
          status: 'OPEN',
          chronology: notes,
          actionTaken: 'Dicatat dan dibina secara persuasif oleh musyrif',
          notes,
        } as any,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeNewViolation();
    } catch (err) {
      console.error('Error adding violation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        <form onSubmit={handleSubmit}>
          {/* HEADER */}
          <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Catat Pelanggaran Santri</h3>
                <p className="text-xs text-slate-400">Pencatatan faktual tanpa penghakiman emosional</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeNewViolation}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5 max-h-[60vh] overflow-y-auto text-xs">
            {/* SANTRI SELECT */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Pilih Santri:</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nis}) - {s.roomNumber} [{s.class.startsWith('Kelas') ? s.class : `Kelas ${s.class}`}]
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY & LEVEL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Kategori:</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const c = e.target.value as ViolationCategory;
                    setCategory(c);
                    setIncidentType(violationExamples[c][0]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="DISIPLIN">Disiplin Waktu / Ibadah</option>
                  <option value="KEBERSIHAN">Kebersihan Lingkungan</option>
                  <option value="KERAPIHAN">Kerapihan Diri / Kamar</option>
                  <option value="KETERTIBAN">Ketertiban Jam Malam</option>
                  <option value="ADAB">Adab & Sopan Santun</option>
                  <option value="KEAMANAN">Keamanan & Fasilitas</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tingkat / Level:</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value) as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>Level 1 (Teguran Lisan / Ringan)</option>
                  <option value={2}>Level 2 (Pembinaan Mandiri)</option>
                  <option value={3}>Level 3 (Konseling & Wali)</option>
                  <option value={4}>Level 4 (Kasus Berat / Komisi)</option>
                </select>
              </div>
            </div>

            {/* QUICK INCIDENT TEMPLATE */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Jenis Pelanggaran:</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {violationExamples[category]?.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setIncidentType(ex)}
                    className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                      incidentType === ex
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 font-medium'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                placeholder="Rincian jenis pelanggaran..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* LOCATION */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Lokasi Kejadian:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Kamar 02, Masjid Lt. 1, Ruang Makan..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* NOTES */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Keterangan / Kronologi Singkat:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan fakta kejadian, kondisi saat ditegur..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
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
                onClick={closeNewViolation}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {submitting ? 'Menyimpan...' : 'Simpan Pelanggaran'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
