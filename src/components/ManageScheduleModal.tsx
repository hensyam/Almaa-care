import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { ActivitySchedule, SOPItem } from '../types.js';
import {
  X,
  Clock,
  Settings,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ListPlus,
  ShieldCheck,
  Edit2,
  Check,
  Search,
} from 'lucide-react';

export const ManageScheduleModal: React.FC = () => {
  const {
    isManageScheduleOpen,
    closeManageSchedule,
    editingActivity,
    activities,
    currentUser,
    refreshAllData,
  } = useApp();

  const [selectedId, setSelectedId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [timeStart, setTimeStart] = useState('04:00');
  const [timeEnd, setTimeEnd] = useState('04:45');
  const [category, setCategory] = useState<ActivitySchedule['category']>('IBADAH');
  const [sopTitle, setSopTitle] = useState('');
  const [sopItems, setSopItems] = useState<SOPItem[]>([]);
  const [newSopLabel, setNewSopLabel] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteConfirmAct, setDeleteConfirmAct] = useState<ActivitySchedule | null>(null);

  // Initialize or synchronize selected activity
  useEffect(() => {
    if (!isManageScheduleOpen) return;

    if (editingActivity) {
      loadActivityData(editingActivity);
      setIsCreatingNew(false);
      setSelectedId(editingActivity.id);
    } else if (activities.length > 0 && !isCreatingNew && !selectedId) {
      loadActivityData(activities[0]);
      setSelectedId(activities[0].id);
    }
  }, [isManageScheduleOpen, editingActivity, activities]);

  const loadActivityData = (act: ActivitySchedule) => {
    setSelectedId(act.id);
    setIsCreatingNew(false);
    setName(act.name);
    setTimeStart(act.timeStart);
    setTimeEnd(act.timeEnd);
    setCategory(act.category);
    setSopTitle(act.sopTitle || '');
    setSopItems(act.sopItems ? JSON.parse(JSON.stringify(act.sopItems)) : []);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const startNewActivity = () => {
    setIsCreatingNew(true);
    setSelectedId('');
    setName('');
    setTimeStart('07:00');
    setTimeEnd('08:00');
    setCategory('HARIAN');
    setSopTitle('');
    setSopItems([
      { id: `sop-${Date.now()}-1`, label: 'Musyrif standby dan mengecek kehadiran santri', completed: false },
      { id: `sop-${Date.now()}-2`, label: 'Memastikan ketertiban dan adab santri terjaga', completed: false },
    ]);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleAddSopItem = () => {
    if (!newSopLabel.trim()) return;
    const newItem: SOPItem = {
      id: `sop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: newSopLabel.trim(),
      completed: false,
    };
    setSopItems([...sopItems, newItem]);
    setNewSopLabel('');
  };

  const handleRemoveSopItem = (id: string) => {
    setSopItems(sopItems.filter((item) => item.id !== id));
  };

  const handleUpdateSopItemLabel = (id: string, newLabel: string) => {
    setSopItems(
      sopItems.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kegiatan wajib diisi');
      return;
    }
    if (!timeStart.trim() || !timeEnd.trim()) {
      setErrorMsg('Jam mulai dan jam selesai wajib diisi');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload: Partial<ActivitySchedule> = {
        name: name.trim(),
        timeStart: timeStart.trim(),
        timeEnd: timeEnd.trim(),
        category,
        sopTitle: sopTitle.trim() || `SOP ${name.trim()}`,
        sopItems: sopItems.map((s) => ({ ...s, completed: false })),
      };

      if (isCreatingNew) {
        const newActData: ActivitySchedule = {
          id: `act-${Date.now()}`,
          name: payload.name!,
          timeStart: payload.timeStart!,
          timeEnd: payload.timeEnd!,
          category: payload.category!,
          sopTitle: payload.sopTitle!,
          sopItems: payload.sopItems!,
        };
        const res = await api.createActivity(
          newActData,
          currentUser.name || 'Super Admin',
          currentUser.role || 'SUPER_ADMIN'
        );
        if (res.success) {
          setSuccessMsg(`Kegiatan "${payload.name}" berhasil ditambahkan!`);
          await refreshAllData();
          setIsCreatingNew(false);
          setSelectedId(res.activity.id);
        }
      } else {
        const res = await api.updateActivity(
          selectedId,
          payload,
          currentUser.name || 'Super Admin',
          currentUser.role || 'SUPER_ADMIN'
        );
        if (res.success) {
          setSuccessMsg(`Jadwal & SOP "${payload.name}" berhasil diperbarui!`);
          await refreshAllData();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan perubahan jadwal');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async (idToDelete: string, nameToDelete: string) => {
    if (!idToDelete) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.deleteActivity(
        idToDelete,
        currentUser.name || 'Super Admin',
        currentUser.role || 'SUPER_ADMIN'
      );
      if (res.success) {
        setSuccessMsg(`Kegiatan "${nameToDelete}" berhasil dihapus.`);
        setDeleteConfirmAct(null);
        await refreshAllData();
        const remaining = activities.filter((a) => a.id !== idToDelete);
        if (remaining.length > 0) {
          loadActivityData(remaining[0]);
        } else {
          startNewActivity();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menghapus jadwal kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefault = async () => {
    setLoading(true);
    try {
      const res = await api.resetActivitiesDefault(
        currentUser.name || 'Super Admin',
        currentUser.role || 'SUPER_ADMIN'
      );
      if (res.success) {
        setSuccessMsg('Jadwal & SOP telah dikembalikan ke standar default pesantren!');
        setConfirmReset(false);
        await refreshAllData();
        if (res.activities && res.activities.length > 0) {
          loadActivityData(res.activities[0]);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mereset jadwal ke default');
    } finally {
      setLoading(false);
    }
  };

  if (!isManageScheduleOpen) return null;

  const filteredActivities = activities.filter(
    (act) =>
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.sopTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.timeStart.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Super Admin Console
                </span>
                <span className="text-xs text-slate-400">Master Siklus 24 Jam</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                Kelola & Edit Jadwal serta Butir SOP Santri
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeManageSchedule}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {successMsg && (
          <div className="px-5 py-2.5 bg-emerald-950/50 border-b border-emerald-800/60 flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:underline">
              Tutup
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="px-5 py-2.5 bg-rose-950/50 border-b border-rose-800/60 flex items-center justify-between text-rose-300 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:underline">
              Tutup
            </button>
          </div>
        )}

        {/* BODY: SPLIT VIEW */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT COLUMN: ACTIVITY LIST */}
          <div className="w-full md:w-80 bg-slate-950/60 border-r border-slate-800 flex flex-col shrink-0 max-h-[35vh] md:max-h-none">
            <div className="p-3 border-b border-slate-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Daftar Kegiatan ({activities.length})
                </span>
                <button
                  type="button"
                  onClick={startNewActivity}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baru</span>
                </button>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari jam / nama kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredActivities.map((act) => {
                const isSelected = selectedId === act.id && !isCreatingNew;
                return (
                  <div
                    key={act.id}
                    onClick={() => loadActivityData(act)}
                    className={`group w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500/70 text-white ring-1 ring-purple-500/30'
                        : 'bg-slate-900/70 border-slate-850 text-slate-300 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-purple-300 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                          {act.timeStart}–{act.timeEnd}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          {act.category}
                        </span>
                      </div>
                      <div className="font-semibold text-xs truncate text-white">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {act.sopItems?.length || 0} butir checklist
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmAct(act);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors shrink-0"
                      title={`Hapus kegiatan "${act.name}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {filteredActivities.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  Tidak ditemukan kegiatan yang cocok.
                </div>
              )}
            </div>

            {/* RESET BUTTON IN FOOTER */}
            <div className="p-3 border-t border-slate-850 bg-slate-900/40">
              {confirmReset ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-rose-300 font-semibold">
                    Kembalikan seluruh jadwal ke default pesantren?
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetDefault}
                      disabled={loading}
                      className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
                    >
                      Ya, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ke Standar Default</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: EDITOR FORM */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/90 flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-5">
              {/* FORM HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {isCreatingNew ? (
                      <>
                        <Plus className="w-4 h-4 text-purple-400" />
                        <span>Tambah Kegiatan Baru</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 text-purple-400" />
                        <span>Edit Kegiatan: {name || 'Tanpa Judul'}</span>
                      </>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Atur nama kegiatan, rentang waktu operasional, dan butir checklist SOP
                  </p>
                </div>

                {!isCreatingNew && selectedId && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = activities.find((a) => a.id === selectedId) || {
                        id: selectedId,
                        name: name || 'Kegiatan',
                        timeStart,
                        timeEnd,
                        category,
                        sopTitle,
                        sopItems,
                      };
                      setDeleteConfirmAct(found as ActivitySchedule);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Kegiatan</span>
                  </button>
                )}
              </div>

              {/* ROW 1: NAMA & KATEGORI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Nama Kegiatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Sholat Tahajjud & Witir Berjamaah"
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Kategori *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="IBADAH">IBADAH</option>
                    <option value="BELAJAR">BELAJAR / AKADEMIK</option>
                    <option value="KEBERSIHAN">KEBERSIHAN & 5K</option>
                    <option value="ISTIRAHAT">ISTIRAHAT / TIDUR</option>
                    <option value="CHECKING">CHECKING MUSYRIF</option>
                    <option value="HARIAN">HARIAN / RUTINITAS</option>
                  </select>
                </div>
              </div>

              {/* ROW 2: JAM MULAI & JAM SELESAI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Jam Mulai (Format HH:mm) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="04:00"
                    pattern="[0-2][0-9]:[0-5][0-9]"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Gunakan format 24 jam, misal: 04:00, 12:30, 18:00
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Jam Selesai (Format HH:mm) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="04:45"
                    pattern="[0-2][0-9]:[0-5][0-9]"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Waktu berakhirnya kegiatan untuk pergantian otomatis
                  </span>
                </div>
              </div>

              {/* ROW 3: JUDUL SOP */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Judul Standar Operasional Prosedur (SOP)
                </label>
                <input
                  type="text"
                  value={sopTitle}
                  onChange={(e) => setSopTitle(e.target.value)}
                  placeholder="Contoh: SOP Bangun Tidur & Sholat Tahajjud"
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* ROW 4: BUTIR-BUTIR CHECKLIST SOP */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ListPlus className="w-4 h-4 text-purple-400" />
                    Butir-Butir Checklist SOP ({sopItems.length} butir)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Diverifikasi oleh Musyrif setiap sesi kegiatan
                  </span>
                </div>

                {/* ADD NEW SOP ITEM INPUT */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSopLabel}
                    onChange={(e) => setNewSopLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSopItem();
                      }
                    }}
                    placeholder="Tambah butir SOP baru, tekan Enter atau klik Tambah..."
                    className="flex-1 px-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSopItem}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Butir</span>
                  </button>
                </div>

                {/* LIST OF SOP ITEMS */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {sopItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2 bg-slate-850/80 border border-slate-750 rounded-xl flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border border-purple-800/40">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateSopItemLabel(item.id, e.target.value)}
                        className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none focus:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSopItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                        title="Hapus butir SOP ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {sopItems.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      Belum ada butir SOP. Tambahkan checklist di atas agar musyrif dapat memverifikasinya.
                    </div>
                  )}
                </div>
              </div>

              {/* SAVE BUTTONS */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Perubahan akan langsung tercatat di <strong>Audit Log</strong> dan sinkron ke seluruh layar.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeManageSchedule}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Menyimpan...' : isCreatingNew ? 'Simpan Kegiatan Baru' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* IN-APP CONFIRMATION MODAL TO PREVENT IFRAME WINDOW.CONFIRM BLOCKING */}
      {deleteConfirmAct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">Konfirmasi Hapus Kegiatan</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Apakah Anda yakin ingin menghapus kegiatan <strong className="text-white font-semibold">"{deleteConfirmAct.name}"</strong> ({deleteConfirmAct.timeStart}–{deleteConfirmAct.timeEnd})?
                </p>
                <p className="text-[11px] text-rose-300/80 mt-1.5">
                  Jadwal dan SOP kegiatan ini akan dihapus dari siklus pengasuhan 24 jam.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmAct(null)}
                disabled={loading}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDelete(deleteConfirmAct.id, deleteConfirmAct.name)}
                disabled={loading}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Menghapus...' : 'Ya, Hapus Kegiatan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
