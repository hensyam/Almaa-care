import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  X,
  Wrench,
  Save,
  MapPin,
  Building2,
  Home,
} from 'lucide-react';

const facilityPresets = [
  { label: '💧 Kran Air / Pipa', prefix: 'Kran air patah / pipa bocor' },
  { label: '💡 Lampu / Listrik', prefix: 'Lampu penerangan mati / redup' },
  { label: '🚪 Kunci & Pintu', prefix: 'Kunci pintu rusak / engsel terlepas' },
  { label: '🛏️ Kasur & Ranjang', prefix: 'Ranjang tingkat kendor / kasur rusak' },
  { label: '🪟 Jendela & Kaca', prefix: 'Kaca jendela retak / grendel macet' },
  { label: '🔌 Stop Kontak', prefix: 'Stop kontak konslet / saklar longgar' },
  { label: '🌀 Kipas Angin', prefix: 'Kipas angin mati / berbunyi bising' },
  { label: '🚽 Kloset & WC', prefix: 'Kloset mampet / saluran air tersumbat' },
  { label: '🚰 Wastafel', prefix: 'Wastafel bocor / pembuangan air macet' },
  { label: '🗄️ Loker & Lemari', prefix: 'Pintu lemari santri patah / kunci rusak' },
  { label: '🛠️ Lainnya', prefix: 'Kerusakan sarana prasarana' },
];

const commonPublicAreas = [
  "Masjid Jami' Almaa",
  "Tempat Wudhu & Kamar Mandi Masjid",
  "Dapur & Ruang Makan Asrama",
  "Lapangan Olahraga & Lapangan Utama",
  "Lorong & Selasar Asrama Lt. 1",
  "Lorong & Selasar Asrama Lt. 2",
  "Kamar Mandi Santri (Barat)",
  "Kamar Mandi Santri (Timur)",
  "Perpustakaan & Ruang Belajar",
  "Klinik / Poskestren",
  "Pos Keamanan & Gerbang Utama",
];

export const FacilityModal: React.FC = () => {
  const {
    isFacilityReportOpen,
    closeFacilityReport,
    currentUser,
    currentClock,
    rooms,
    areas,
    refreshAllData,
    preselectedFacilityLocation,
  } = useApp();

  // Location selector type: 'ROOM' | 'AREA' | 'CUSTOM'
  const [locationType, setLocationType] = useState<'ROOM' | 'AREA' | 'CUSTOM'>('ROOM');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'room-1');
  const [selectedAreaName, setSelectedAreaName] = useState<string>(
    areas[0]?.name || "Masjid Jami' Almaa"
  );
  const [customLocation, setCustomLocation] = useState('');

  // Facility component selector
  const [selectedComponent, setSelectedComponent] = useState('Kran Air / Pipa');
  const [issueDetail, setIssueDetail] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  // Sync preselected location if provided
  useEffect(() => {
    if (preselectedFacilityLocation) {
      const matchRoom = rooms.find(
        (r) =>
          preselectedFacilityLocation.includes(r.number) ||
          preselectedFacilityLocation.toLowerCase().includes(r.name.toLowerCase())
      );
      if (matchRoom) {
        setLocationType('ROOM');
        setSelectedRoomId(matchRoom.id);
        return;
      }

      const matchArea = commonPublicAreas.find(
        (a) => a.toLowerCase() === preselectedFacilityLocation.toLowerCase()
      );
      if (matchArea) {
        setLocationType('AREA');
        setSelectedAreaName(matchArea);
        return;
      }

      setLocationType('CUSTOM');
      setCustomLocation(preselectedFacilityLocation);
    }
  }, [preselectedFacilityLocation, rooms]);

  if (!isFacilityReportOpen) return null;

  // Resolve final location string
  const getResolvedLocation = () => {
    if (locationType === 'ROOM') {
      const room = rooms.find((r) => r.id === selectedRoomId);
      return room ? `Kamar ${room.number} (${room.name})` : 'Kamar Asrama';
    }
    if (locationType === 'AREA') {
      return selectedAreaName;
    }
    return customLocation || 'Area Pondok';
  };

  const handlePresetSelect = (preset: { label: string; prefix: string }) => {
    setSelectedComponent(preset.label);
    if (!issueDetail) {
      setIssueDetail(preset.prefix + ' di ');
    } else {
      setIssueDetail(preset.prefix + ': ' + issueDetail.replace(/^[a-zA-Z\s\/]+:?\s*/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalLocation = getResolvedLocation();
    const finalIssue = issueDetail.trim()
      ? `${selectedComponent} — ${issueDetail}`
      : `${selectedComponent} mengalami kerusakan`;

    setSubmitting(true);
    try {
      await api.addFacilityTicket(
        {
          code: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
          areaOrRoom: finalLocation,
          issue: finalIssue,
          priority,
          reporterName: currentUser.name,
          reportedBy: currentUser.name,
          reportedAt: currentClock,
          picTechnician: 'Tim Sarpras & Maintenance',
          status: 'OPEN',
          notes: `Dilaporkan melalui Aksi Cepat Pengasuhan oleh ${currentUser.name} (${currentUser.role})`,
        } as any,
        currentUser.name,
        currentUser.role
      );

      await refreshAllData();
      closeFacilityReport();
    } catch (err) {
      console.error('Error reporting facility ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100 my-auto">
        <form onSubmit={handleSubmit}>
          {/* HEADER */}
          <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Lapor Kerusakan Fasilitas</h3>
                <p className="text-xs text-slate-400">
                  Tiket perbaikan sarana & prasarana pondok santri
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeFacilityReport}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
            {/* 1. LOCATION TYPE SELECTOR TABS */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5">
                1. Pilih Kategori Lokasi Fasilitas Rusak:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('ROOM')}
                  className={`p-2 rounded-xl text-center border font-medium transition-all ${
                    locationType === 'ROOM'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1" />
                  <span>Kamar Santri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationType('AREA')}
                  className={`p-2 rounded-xl text-center border font-medium transition-all ${
                    locationType === 'AREA'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Home className="w-4 h-4 mx-auto mb-1" />
                  <span>Area Publik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationType('CUSTOM')}
                  className={`p-2 rounded-xl text-center border font-medium transition-all ${
                    locationType === 'CUSTOM'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <MapPin className="w-4 h-4 mx-auto mb-1" />
                  <span>Lokasi Lain</span>
                </button>
              </div>
            </div>

            {/* 2. SPECIFIC LOCATION PICKER */}
            {locationType === 'ROOM' && (
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="font-semibold text-slate-300 block">
                  Pilih Kamar Asrama Santri:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {rooms.map((r) => {
                    const isSelected = r.id === selectedRoomId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRoomId(r.id)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-amber-600 border-amber-400 text-white font-bold shadow'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <p className="font-bold text-xs">Kamar {r.number}</p>
                        <p className="text-[10px] opacity-80 truncate">{r.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {locationType === 'AREA' && (
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="font-semibold text-slate-300 block">
                  Pilih Area Umum / Fasilitas Pesantren:
                </label>
                <select
                  value={selectedAreaName}
                  onChange={(e) => setSelectedAreaName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {commonPublicAreas.map((areaName) => (
                    <option key={areaName} value={areaName}>
                      {areaName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {locationType === 'CUSTOM' && (
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="font-semibold text-slate-300 block">
                  Ketik Nama Lokasi / Gedung:
                </label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Contoh: Asrama Putri Lt. 2, Gudang Sarpras, Gazebo Belakang..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* 3. FACILITY COMPONENT / PRESET CHIPS */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5">
                2. Pilih Komponen Fasilitas yang Rusak:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {facilityPresets.map((preset) => {
                  const isSelected = selectedComponent === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white font-bold shadow'
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. DAMAGE DETAIL & NOTES */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                3. Rincian Kerusakan / Kendala Lapangan:
              </label>
              <textarea
                value={issueDetail}
                onChange={(e) => setIssueDetail(e.target.value)}
                placeholder="Jelaskan kondisi kerusakan secara rinci (contoh: kran air patah di bagian putaran, air mengalir deras dan tidak bisa ditutup)..."
                rows={3}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* 5. PRIORITY */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                4. Tingkat Prioritas Perbaikan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('LOW')}
                  className={`p-2 rounded-xl text-center border text-[11px] transition-all ${
                    priority === 'LOW'
                      ? 'bg-slate-700 border-slate-500 text-white font-bold'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  🟢 Rendah (Minor)
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('MEDIUM')}
                  className={`p-2 rounded-xl text-center border text-[11px] transition-all ${
                    priority === 'MEDIUM'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  🟡 Sedang (1-2 Hari)
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('HIGH')}
                  className={`p-2 rounded-xl text-center border text-[11px] transition-all ${
                    priority === 'HIGH'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  🔴 Urgent (Mendesak)
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Lokasi: <span className="text-amber-400 font-semibold">{getResolvedLocation()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeFacilityReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {submitting ? 'Mengirim...' : 'Kirim Tiket Perbaikan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
