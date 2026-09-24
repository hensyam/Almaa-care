import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ListFilter,
  Edit3,
} from 'lucide-react';

export const SOPChecklistModal: React.FC = () => {
  const {
    selectedActivityForChecklist,
    closeSOPChecklist,
    openManageSchedule,
    activities,
    currentUser,
    refreshAllData,
    currentClock,
  } = useApp();

  const [activeActivityId, setActiveActivityId] = useState<string>('');
  const [items, setItems] = useState<{ id: string; title: string; checked: boolean }[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync state whenever selectedActivityForChecklist or activeActivityId changes
  useEffect(() => {
    if (!selectedActivityForChecklist) return;

    const targetId = activeActivityId || selectedActivityForChecklist.id;
    const targetActivity =
      activities.find((a) => a.id === targetId) || selectedActivityForChecklist;

    if (targetActivity && targetActivity.sopItems) {
      setItems(
        targetActivity.sopItems.map((s) => ({
          id: s.id,
          title: s.label,
          checked: s.completed,
        }))
      );
    }
  }, [selectedActivityForChecklist, activeActivityId, activities]);

  // When modal is newly opened, set activeActivityId
  useEffect(() => {
    if (selectedActivityForChecklist) {
      setActiveActivityId(selectedActivityForChecklist.id);
      setNotes('');
    }
  }, [selectedActivityForChecklist]);

  // Guard: ONLY return null AFTER all hooks are called
  if (!selectedActivityForChecklist) return null;

  const currentActivity =
    activities.find((a) => a.id === activeActivityId) || selectedActivityForChecklist;

  const handleSelectActivity = (activityId: string) => {
    setActiveActivityId(activityId);
    const chosen = activities.find((a) => a.id === activityId);
    if (chosen && chosen.sopItems) {
      setItems(
        chosen.sopItems.map((s) => ({
          id: s.id,
          title: s.label,
          checked: s.completed,
        }))
      );
      setNotes('');
    }
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const setAllItems = (checked: boolean) => {
    setItems((prev) => prev.map((it) => ({ ...it, checked })));
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const score = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 100;
  const isComplete = score === 100;

  const handleSave = async () => {
    if (!currentActivity) return;
    setSubmitting(true);
    try {
      await api.recordChecklist(
        {
          activityId: currentActivity.id,
          activityName: currentActivity.name,
          date: new Date().toISOString().slice(0, 10),
          time: currentClock,
          inspectorId: currentUser.id,
          inspectorName: currentUser.name,
          status: isComplete ? 'COMPLETE' : 'NEEDS_ATTENTION',
          notes,
          items: items.map((i) => ({
            id: i.id,
            label: i.title,
            title: i.title,
            checked: i.checked,
          })),
        },
        currentUser.name,
        currentUser.role
      );
      await refreshAllData();
      closeSOPChecklist();
    } catch (e) {
      console.error('Error saving checklist:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-base">Checklist SOP Kegiatan</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                  Operasional 24 Jam
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengawasan mutu & eksekusi SOP pengasuhan santri
              </p>
            </div>
          </div>
          <button
            onClick={closeSOPChecklist}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOP SELECTION CONTROL (USER CAN CHOOSE ANY SOP) */}
        <div className="p-3.5 bg-slate-850/90 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="sop-select" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
              Pilih Kegiatan / SOP yang Diperiksa:
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              Waktu Sistem: {currentClock} WIB
            </span>
          </div>

          <select
            id="sop-select"
            value={currentActivity?.id || ''}
            onChange={(e) => handleSelectActivity(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                [{act.timeStart}–{act.timeEnd}] {act.name} — {act.sopTitle || act.category} {act.isCurrent ? '★ (Sedang Berlangsung)' : ''}
              </option>
            ))}
          </select>

          {/* QUICK PRESET CHIPS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] text-slate-400 shrink-0">Cepat:</span>
            {activities.slice(0, 6).map((act) => {
              const isSelected = act.id === currentActivity?.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleSelectActivity(act.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                  }`}
                >
                  {act.timeStart} {act.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE SOP BANNER */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-bold">
                {currentActivity?.timeStart}–{currentActivity?.timeEnd}
              </span>
              <span className="text-white font-semibold">{currentActivity?.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              SOP: {currentActivity?.sopTitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeSOPChecklist();
                openManageSchedule(currentActivity);
              }}
              className="text-[10px] bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors"
              title="Edit jam atau butir SOP kegiatan ini"
            >
              <Edit3 className="w-3 h-3 text-purple-400" />
              <span>Edit Butir SOP</span>
            </button>
            <button
              type="button"
              onClick={() => setAllItems(true)}
              className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2 py-1 rounded border border-slate-700"
            >
              Centang Semua
            </button>
          </div>
        </div>

        {/* PROGRESS METRICS */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Penyelesaian SOP:</span>
            <span className="font-bold text-white font-mono">
              {checkedCount}/{totalCount} Item ({score}%)
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
              isComplete
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isComplete ? 'SOP TUNTAS ✓' : 'PERLU ATENSI ⚠️'}
          </span>
        </div>

        {/* SOP CHECKLIST ITEMS */}
        <div className="p-4 sm:p-5 space-y-2 max-h-64 overflow-y-auto">
          {items.map((it) => (
            <div
              key={it.id}
              onClick={() => toggleItem(it.id)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                it.checked
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={it.checked}
                  onChange={() => toggleItem(it.id)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-700 border-slate-600 cursor-pointer"
                />
                <span className="text-xs font-medium leading-relaxed">{it.title}</span>
              </div>
              {it.checked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          ))}

          {/* NOTES FIELD */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Catatan Lapangan & Temuan Pengasuh:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan jika ada santri terlambat, fasilitas bermasalah, atau catatan musyrif..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Musyrif Pemeriksa: <span className="text-slate-200 font-semibold">{currentUser.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={closeSOPChecklist}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'Menyimpan...' : 'Simpan Checklist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
