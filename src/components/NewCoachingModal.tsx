import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  Shield,
  Sparkles,
  Save,
  MessageSquare,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const NewCoachingModal: React.FC = () => {
  const {
    isNewCoachingOpen,
    closeNewCoaching,
    students,
    currentUser,
    refreshAllData,
    preselectedStudentId,
  } = useApp();

  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id || ''));
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [focusArea, setFocusArea] = useState('Kedisiplinan Bangun Pagi & Shalat Subuh');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState('2026-09-20');
  const [submitting, setSubmitting] = useState(false);

  // AI QUESTIONS GENERATION
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!isNewCoachingOpen) return null;

  const selectedStudent = students.find((s) => s.id === studentId) || students[0];

  const handleFetchAiQuestions = async () => {
    setLoadingAi(true);
    try {
      const qList = await api.getCoachingQuestions(
        selectedStudent.name,
        focusArea,
        level === 1 ? 'DISIPLIN' : 'ADAB'
      );
      setAiQuestions(qList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setSubmitting(true);
    try {
      await api.addCoaching(
        {
          studentId,
          studentName: selectedStudent.name,
          level,
          focusArea,
          notes,
          discussionPoints: notes,
          agreement: notes,
          date: new Date().toISOString().slice(0, 10),
          supervisorId: currentUser.id,
          supervisorName: currentUser.name,
          coachName: currentUser.name,
          status: 'IN_PROGRESS',
          targetDate,
        } as any,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeNewCoaching();
    } catch (err) {
      console.error('Error adding coaching:', err);
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
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Buka Sesi Pembinaan Santri</h3>
                <p className="text-xs text-slate-400">Proses perbaikan adab berbasis dialog santun</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeNewCoaching}
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nis}) - {s.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* LEVEL & TARGET DATE */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tingkat Pembinaan:</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value) as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>Level 1: Diingatkan (Nasehat)</option>
                  <option value={2}>Level 2: Dibina (Tugas Karakter)</option>
                  <option value={3}>Level 3: Dicatat & Dimonitor</option>
                  <option value={4}>Level 4: Ditindaklanjuti Khusus</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Evaluasi:</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* FOCUS AREA */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Fokus Pembinaan:</label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Misal: Disiplin waktu bangun subuh, kerapihan lemari..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* AI COACHING QUESTIONS GENERATOR */}
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Saran Pertanyaan Dialog (AI):
                </span>
                <button
                  type="button"
                  onClick={handleFetchAiQuestions}
                  disabled={loadingAi}
                  className="text-[11px] bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-lg transition-colors font-medium"
                >
                  {loadingAi ? 'Menyusun...' : 'Buat Saran Pertanyaan'}
                </button>
              </div>

              {aiQuestions.length > 0 ? (
                <div className="space-y-1.5">
                  {aiQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNotes((prev) => (prev ? `${prev}\n• ${q}` : `• ${q}`))}
                      className="p-2 bg-slate-800/90 hover:bg-slate-750 border border-slate-750 rounded-lg text-slate-300 text-[11px] cursor-pointer transition-colors"
                      title="Klik untuk menyalin ke catatan pembinaan"
                    >
                      {idx + 1}. {q}
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    *Klik pertanyaan di atas untuk memasukkannya ke catatan sesi.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Gunakan AI untuk menyusun pertanyaan empatik dan tidak menghakimi sesuai fokus pembinaan santri.
                </p>
              )}
            </div>

            {/* NOTES & COMMITMENT */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Catatan Hasil Dialog & Komitmen Santri:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catat hasil kesepakatan, komitmen perbaikan dari santri..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Pembina: <strong>{currentUser.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeNewCoaching}
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
                {submitting ? 'Menyimpan...' : 'Simpan Pembinaan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
