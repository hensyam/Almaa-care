import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  Search,
  X,
  User,
  BedDouble,
  AlertTriangle,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    closeGlobalSearch,
    students,
    rooms,
    violations,
    coachings,
    activities,
    openStudent360,
    openRoomInspect,
    openSOPChecklist,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedStudents = q
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nickname.toLowerCase().includes(q) ||
          s.roomNumber.toLowerCase().includes(q)
      )
    : [];

  const matchedRooms = q
    ? rooms.filter(
        (r) =>
          r.number.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.supervisorName.toLowerCase().includes(q)
      )
    : [];

  const matchedViolations = q
    ? violations.filter(
        (v) =>
          v.studentName.toLowerCase().includes(q) ||
          v.incidentType.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      )
    : [];

  const matchedActivities = q
    ? activities.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.timeStart.includes(q) ||
          a.sopTitle.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchedStudents.length > 0 ||
    matchedRooms.length > 0 ||
    matchedViolations.length > 0 ||
    matchedActivities.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto pt-16 sm:pt-20">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100">
        {/* SEARCH INPUT BAR */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-850">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari santri, kamar, catatan pelanggaran, SOP kegiatan..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeGlobalSearch}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-md border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* RESULTS AREA */}
        <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {!q && (
            <div className="py-8 text-center text-slate-500">
              <p>Ketik kata kunci untuk mencari data di sistem Almaa Care OS.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Contoh: "Ahmad", "Kamar 02", "Subuh", "Disiplin"
              </p>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-8 text-center text-slate-500">
              <p>Tidak ditemukan data yang cocok dengan "{query}".</p>
            </div>
          )}

          {/* SANTRI RESULTS */}
          {matchedStudents.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Santri ({matchedStudents.length})
              </div>
              <div className="space-y-1.5">
                {matchedStudents.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      closeGlobalSearch();
                      openStudent360(st.id);
                    }}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 font-serif">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{st.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {st.roomNumber} • NIS: {st.nis} • Status: {st.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROOM RESULTS */}
          {matchedRooms.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-blue-400" />
                Kamar Asrama ({matchedRooms.length})
              </div>
              <div className="space-y-1.5">
                {matchedRooms.map((rm) => (
                  <div
                    key={rm.id}
                    onClick={() => {
                      closeGlobalSearch();
                      openRoomInspect(rm.id);
                    }}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">Kamar {rm.number} - {rm.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Skor: {rm.averageScore}/100 • Musyrif: {rm.supervisorName}
                      </p>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                      Periksa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVITY RESULTS */}
          {matchedActivities.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Kegiatan & SOP ({matchedActivities.length})
              </div>
              <div className="space-y-1.5">
                {matchedActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      closeGlobalSearch();
                      openSOPChecklist(act);
                    }}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{act.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Waktu: {act.timeStart}–{act.timeEnd} • SOP: {act.sopTitle}
                      </p>
                    </div>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                      Buka SOP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIOLATIONS */}
          {matchedViolations.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Catatan Pelanggaran ({matchedViolations.length})
              </div>
              <div className="space-y-1.5">
                {matchedViolations.slice(0, 5).map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl"
                  >
                    <p className="font-semibold text-amber-300">{v.incidentType} ({v.studentName})</p>
                    <p className="text-[10px] text-slate-400">
                      {v.category} (Level {v.level}) • Lokasi: {v.location} • {v.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
