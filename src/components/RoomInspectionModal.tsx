import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  BedDouble,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  ShieldAlert,
  Building2,
} from 'lucide-react';

export const RoomInspectionModal: React.FC = () => {
  const {
    selectedRoomIdForInspect,
    closeRoomInspect,
    rooms,
    currentUser,
    refreshAllData,
    currentClock,
  } = useApp();

  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [scoreClean, setScoreClean] = useState(85);
  const [scoreTidy, setScoreTidy] = useState(85);
  const [scoreOrderly, setScoreOrderly] = useState(90);
  const [scoreSafety, setScoreSafety] = useState(95);
  const [notes, setNotes] = useState('');
  const [hasFacilityIssue, setHasFacilityIssue] = useState(false);
  const [facilityIssueText, setFacilityIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync active room when opened
  useEffect(() => {
    if (selectedRoomIdForInspect) {
      setActiveRoomId(selectedRoomIdForInspect);
    }
  }, [selectedRoomIdForInspect]);

  // Guard: If modal is not opened, do NOT render backdrop
  if (!selectedRoomIdForInspect) return null;

  const room = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  if (!room) return null;

  const overallScore = Math.round((scoreClean + scoreTidy + scoreOrderly + scoreSafety) / 4);
  const isAttention = overallScore < 80;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.inspectRoom(
        {
          roomId: room.id,
          roomNumber: room.number,
          date: new Date().toISOString().slice(0, 10),
          time: currentClock,
          inspectorName: currentUser.name,
          scoreClean,
          scoreTidy,
          scoreOrderly,
          scoreSafety,
          overallScore,
          notes,
          hasFacilityIssue,
          facilityIssueText: hasFacilityIssue ? facilityIssueText : undefined,
        },
        currentUser.name,
        currentUser.role
      );

      // If facility issue was flagged, also create a facility ticket
      if (hasFacilityIssue && facilityIssueText.trim()) {
        await api.addFacilityTicket(
          {
            code: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
            areaOrRoom: `Kamar ${room.number}`,
            issue: facilityIssueText,
            reporterName: currentUser.name,
            reportedBy: currentUser.name,
            reportedAt: currentClock,
            picTechnician: 'Tim Sarpras Pesantren',
            priority: 'MEDIUM',
            status: 'OPEN',
            notes: `Temuan saat inspeksi kamar ${room.number}`,
          } as any,
          currentUser.name,
          currentUser.role
        );
      }

      await refreshAllData();
      closeRoomInspect();
    } catch (err) {
      console.error('Error inspecting room:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Inspeksi Kamar Santri
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                  5K & Adab Asrama
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi kebersihan, kerapihan, ketertiban, dan keamanan kamar
              </p>
            </div>
          </div>
          <button
            onClick={closeRoomInspect}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROOM SELECTOR CONTROL (USER CAN CHOOSE ANY ROOM) */}
        <div className="p-3.5 bg-slate-850/90 border-b border-slate-800 space-y-2">
          <label htmlFor="room-select" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Pilih Kamar yang Diinspeksi:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {rooms.map((r) => {
              const isSelected = r.id === room.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRoomId(r.id)}
                  className={`p-2 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                  }`}
                >
                  <p className="font-bold text-xs">Kamar {r.number}</p>
                  <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {r.name.split(' ')[0]}
                  </p>
                </button>
              );
            })}
          </div>

          <select
            id="room-select"
            value={room.id}
            onChange={(e) => setActiveRoomId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Kamar {r.number} - {r.name} (Kapasitas: {r.occupantCount}/{r.capacity} • Musyrif: {r.supervisorName})
              </option>
            ))}
          </select>
        </div>

        {/* SELECTED ROOM INFO BANNER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-serif">
                Kamar {room.number} — {room.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Penghuni: <strong className="text-slate-200">{room.occupantCount} Santri</strong> • Musyrif: <strong className="text-slate-200">{room.supervisorName}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Skor Evaluasi</span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-xl font-bold font-mono text-white">{overallScore}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* 4 PILLARS SLIDERS */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[50vh] overflow-y-auto">
          {/* 1. KEBERSIHAN */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200">1. Kebersihan (Cleanliness)</span>
              <span className="font-mono font-bold text-emerald-400">{scoreClean}/100</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={scoreClean}
              onChange={(e) => setScoreClean(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Lantai disapu & dipel, kamar mandi bersih, bak air bebas jentik.
            </p>
          </div>

          {/* 2. KERAPIHAN */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200">2. Kerapihan (Tidiness)</span>
              <span className="font-mono font-bold text-emerald-400">{scoreTidy}/100</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={scoreTidy}
              onChange={(e) => setScoreTidy(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Sprei kasur kencang, loker baju tertutup, rak sepatu teratur rapi.
            </p>
          </div>

          {/* 3. KETERTIBAN */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200">3. Ketertiban (Orderliness)</span>
              <span className="font-mono font-bold text-emerald-400">{scoreOrderly}/100</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={scoreOrderly}
              onChange={(e) => setScoreOrderly(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Tidak ada barang terlarang, tugas piket santri berjalan, sampah terbuang.
            </p>
          </div>

          {/* 4. KEAMANAN */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200">4. Keamanan & Keselamatan (Safety)</span>
              <span className="font-mono font-bold text-emerald-400">{scoreSafety}/100</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={scoreSafety}
              onChange={(e) => setScoreSafety(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Colokan listrik aman, ventilasi lancar, jendela & pintu terkunci baik.
            </p>
          </div>

          {/* FACILITY DAMAGE FLAG */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFacilityIssue}
                onChange={(e) => setHasFacilityIssue(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-amber-300">
                Temukan Kerusakan Fasilitas di Kamar {room.number}?
              </span>
            </label>
            {hasFacilityIssue && (
              <input
                type="text"
                value={facilityIssueText}
                onChange={(e) => setFacilityIssueText(e.target.value)}
                placeholder="Misal: Keran kamar mandi bocor, lampu balkon redup/mati..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            )}
          </div>

          {/* NOTES */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Catatan Khusus untuk Santri Kamar {room.number}:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sprei kasur atas nomor 3 belum dipasang rapi. Harap diingatkan oleh ketua kamar..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Pemeriksa: <strong className="text-slate-200">{currentUser.name}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={closeRoomInspect}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'Menyimpan...' : 'Simpan Inspeksi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
