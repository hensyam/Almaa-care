import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  Award,
  Sparkles,
  Save,
  Star,
  Heart,
} from 'lucide-react';

export const NewAppreciationModal: React.FC = () => {
  const {
    isNewAppreciationOpen,
    closeNewAppreciation,
    students,
    currentUser,
    refreshAllData,
    preselectedStudentId,
  } = useApp();

  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id || ''));
  const [category, setCategory] = useState('Kedisiplinan & Adab');
  const [points, setPoints] = useState(25);
  const [description, setDescription] = useState('Membantu membersihkan masjid dengan inisiatif sendiri');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isNewAppreciationOpen) {
      if (preselectedStudentId) {
        setStudentId(preselectedStudentId);
      } else if (students.length > 0 && !studentId) {
        setStudentId(students[0].id);
      }
      setErrorMessage('');
    }
  }, [isNewAppreciationOpen, preselectedStudentId, students]);

  if (!isNewAppreciationOpen) return null;

  const selectedStudent = students.find((s) => s.id === studentId) || students[0];

  const presets = [
    { cat: 'Kedisiplinan', points: 20, desc: 'Hadir shalat berjamaah di shaf pertama 7 hari berturut-turut' },
    { cat: 'Kerapihan', points: 15, desc: 'Kamar dan ranjang tertata sangat rapi saat sidak pengasuhan' },
    { cat: 'Kepemimpinan', points: 30, desc: 'Mengkoordinir piket kamar dengan teladan dan bijaksana' },
    { cat: 'Membantu Teman', points: 25, desc: 'Membantu santri junior yang sakit dan membawakan makanan dari kantin' },
    { cat: 'Adab & Akhlaq', points: 30, desc: 'Menjaga sopan santun dan adab mulia saat berinteraksi dengan guru/tamu' },
    { cat: 'Tahfidz Al-Qur\'an', points: 50, desc: 'Menuntaskan target setoran ziyadah hafalan 1 juz lebih awal' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStudentId = studentId || selectedStudent?.id;
    if (!effectiveStudentId) {
      setErrorMessage('Pilih santri terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const studentName = selectedStudent?.name || 'Santri';
      await api.addAppreciation(
        {
          studentId: effectiveStudentId,
          studentName,
          category,
          points: Number(points) || 25,
          description: description.trim() || 'Apresiasi karakter positif santri',
          supervisorId: currentUser.id,
          supervisorName: currentUser.name,
          recordedBy: currentUser.name,
        } as any,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeNewAppreciation();
    } catch (err: any) {
      console.error('Error adding appreciation:', err);
      setErrorMessage(err?.message || 'Gagal menyimpan apresiasi santri');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        <form onSubmit={handleSubmit}>
          {/* HEADER */}
          <div className="p-4 sm:p-5 bg-purple-950/40 border-b border-purple-900/40 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Beri Apresiasi Karakter Santri</h3>
                <p className="text-xs text-purple-300">Penguatan positif (positive reinforcement) untuk santri teladan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeNewAppreciation}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="px-5 py-2.5 bg-rose-950/70 border-b border-rose-800 text-rose-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="p-4 sm:p-5 space-y-3.5 max-h-[60vh] overflow-y-auto text-xs">
            {/* SANTRI SELECT */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Pilih Santri Teladan:</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nis}) - {s.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* QUICK PRESETS */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Pilihan Cepat Apresiasi:</label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((pr) => (
                  <button
                    key={pr.cat}
                    type="button"
                    onClick={() => {
                      setCategory(pr.cat);
                      setPoints(pr.points);
                      setDescription(pr.desc);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      category === pr.cat
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[11px]">
                      <span>{pr.cat}</span>
                      <span className="text-purple-400 font-bold">+{pr.points}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY & POINTS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Kategori Karakter:</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Poin Apresiasi:</label>
                <select
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 font-mono font-bold"
                >
                  <option value={10}>+10 Poin</option>
                  <option value={15}>+15 Poin</option>
                  <option value={20}>+20 Poin</option>
                  <option value={25}>+25 Poin</option>
                  <option value={30}>+30 Poin</option>
                  <option value={50}>+50 Poin (Istimewa)</option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Keterangan Perilaku Baik yang Diapresiasi:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsikan keteladanan yang dilakukan santri..."
                rows={2}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Pemberi: <strong>{currentUser.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeNewAppreciation}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {submitting ? 'Menyimpan...' : 'Beri Apresiasi ⭐'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
