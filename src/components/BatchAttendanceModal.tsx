import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  UserCheck,
  CheckCircle2,
  Save,
  Users,
  CheckCheck,
} from 'lucide-react';
import { Student } from '../types.js';

export const BatchAttendanceModal: React.FC = () => {
  const {
    isBatchAttendanceOpen,
    closeBatchAttendance,
    students,
    activeActivity,
    currentUser,
    refreshAllData,
  } = useApp();

  const [studentStates, setStudentStates] = useState<Record<string, Student['status']>>({});

  useEffect(() => {
    if (isBatchAttendanceOpen) {
      const init: Record<string, Student['status']> = {};
      students.forEach((s) => {
        init[s.id] = s.status;
      });
      setStudentStates(init);
    }
  }, [isBatchAttendanceOpen, students]);

  const [filterRoom, setFilterRoom] = useState<string>('ALL');
  const [submitting, setSubmitting] = useState(false);

  if (!isBatchAttendanceOpen) return null;

  const activityName = activeActivity?.name || 'Kegiatan Pengasuhan';

  const setStatus = (id: string, status: Student['status']) => {
    setStudentStates((prev) => ({ ...prev, [id]: status }));
  };

  const handleMarkAllPresent = () => {
    const next: Record<string, Student['status']> = {};
    students.forEach((s) => {
      if (filterRoom === 'ALL' || s.roomNumber === filterRoom) {
        next[s.id] = 'HADIR';
      } else {
        next[s.id] = studentStates[s.id] || s.status;
      }
    });
    setStudentStates((prev) => ({ ...prev, ...next }));
  };

  const filteredStudents = students.filter(
    (s) => filterRoom === 'ALL' || s.roomNumber === filterRoom
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const records = filteredStudents.map((s) => ({
        studentId: s.id,
        status: studentStates[s.id] || 'HADIR',
      }));

      await api.recordBatchAttendance(
        activeActivity?.id || 'act-active',
        activityName,
        records,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeBatchAttendance();
    } catch (err) {
      console.error('Error saving batch attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(studentStates).filter((st) => st === 'HADIR').length;
  const lateCount = Object.values(studentStates).filter((st) => st === 'TERLAMBAT').length;
  const permitCount = Object.values(studentStates).filter((st) => st === 'IZIN').length;
  const sickCount = Object.values(studentStates).filter((st) => st === 'SAKIT').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Presensi Cepat Santri</h3>
              <p className="text-xs text-slate-400">Kegiatan: {activityName}</p>
            </div>
          </div>
          <button
            onClick={closeBatchAttendance}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS & STATS */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Kamar:</span>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="ALL">Semua Kamar (4 Kamar)</option>
              <option value="Kamar 01">Kamar 01</option>
              <option value="Kamar 02">Kamar 02</option>
              <option value="Kamar 03">Kamar 03</option>
              <option value="Kamar 04">Kamar 04</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai Semua Hadir
            </button>
          </div>
        </div>

        {/* SUMMARY COUNTERS */}
        <div className="px-4 py-2 bg-slate-850/50 border-b border-slate-800 flex items-center justify-around text-[11px] text-slate-300">
          <span>Hadir: <strong className="text-emerald-400">{presentCount}</strong></span>
          <span>Terlambat: <strong className="text-amber-400">{lateCount}</strong></span>
          <span>Izin: <strong className="text-blue-400">{permitCount}</strong></span>
          <span>Sakit: <strong className="text-purple-400">{sickCount}</strong></span>
        </div>

        {/* LIST OF STUDENTS */}
        <div className="p-3 sm:p-5 max-h-[55vh] overflow-y-auto space-y-2">
          {filteredStudents.map((st) => {
            const currentStatus = studentStates[st.id] || st.status;
            return (
              <div
                key={st.id}
                className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 font-serif">
                    {st.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{st.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {st.roomNumber} • NIS: {st.nis}
                    </p>
                  </div>
                </div>

                {/* STATUS TOGGLE BUTTONS */}
                <div className="flex items-center gap-1 shrink-0">
                  {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as const).map((statusVal) => {
                    const isSelected = currentStatus === statusVal;
                    const colors = {
                      HADIR: isSelected ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200',
                      TERLAMBAT: isSelected ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200',
                      IZIN: isSelected ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200',
                      SAKIT: isSelected ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200',
                      ALPA: isSelected ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200',
                    };
                    const shortLabels = {
                      HADIR: 'H',
                      TERLAMBAT: 'T',
                      IZIN: 'I',
                      SAKIT: 'S',
                      ALPA: 'A',
                    };

                    return (
                      <button
                        key={statusVal}
                        type="button"
                        onClick={() => setStatus(st.id, statusVal)}
                        className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-all ${
                          isSelected
                            ? colors[statusVal]
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                        }`}
                        title={statusVal}
                      >
                        {shortLabels[statusVal]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Total {filteredStudents.length} santri ditinjau
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={closeBatchAttendance}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'Menyimpan...' : 'Simpan Presensi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
