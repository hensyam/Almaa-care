import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { UserRole } from '../types.js';
import {
  Clock,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronDown,
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Zap,
  Settings,
  UserPlus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    currentClock,
    isSimulatedTime,
    setTimeTravel,
    activeActivity,
    isOnline,
    isSyncing,
    notifications,
    incidents,
    refreshAllData,
    openGlobalSearch,
    openEmergencyReport,
    openManageSchedule,
    openManageStudents,
    setActiveTab,
  } = useApp();

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState(currentClock);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unhandledIncidents = (incidents || []).filter(
    (i) => i.status === 'OPEN' || (i.status !== 'RESOLVED' && i.priority === 'CRITICAL')
  );
  const hasActiveEmergency = unhandledIncidents.length > 0;

  const timePresets = [
    { label: '04.00 - Bangun & Tahajjud', time: '04:00' },
    { label: '04.30 - Shalat Subuh', time: '04:30' },
    { label: '05.37 - Kebersihan Pagi (Aktif)', time: '05:37' },
    { label: '06.30 - Sarapan & Persiapan KBM', time: '06:30' },
    { label: '07.30 - KBM & Halaqah Pagi', time: '07:30' },
    { label: '12.00 - Dzuhur & Qailulah', time: '12:00' },
    { label: '15.30 - Ashar & Olahraga', time: '15:30' },
    { label: '18.00 - Maghrib & Dzikir', time: '18:00' },
    { label: '19.30 - Isya & Ta\'lim Malam', time: '19:30' },
    { label: '21.00 - Night Checking & Absensi', time: '21:00' },
    { label: '22.00 - Jam Tidur / Istirahat', time: '22:00' },
  ];

  const roles: { role: UserRole; title: string; desc: string; icon: any }[] = [
    {
      role: 'PENGASUH',
      title: 'Pengasuh (Musyrif)',
      desc: 'Operasional harian, inspeksi kamar, presensi santri',
      icon: UserCheck,
    },
    {
      role: 'KOORDINATOR',
      title: 'Koordinator Pengasuhan',
      desc: 'Supervisi shift, case management, approval izin',
      icon: Shield,
    },
    {
      role: 'PIMPINAN',
      title: 'Pimpinan Pesantren',
      desc: 'Executive analytics, audit trail, ringkasan AI',
      icon: Sparkles,
    },
    {
      role: 'GURU',
      title: 'Guru / Asatidz',
      desc: 'Presensi KBM, monitoring adab santri',
      icon: GraduationCap,
    },
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      desc: 'Konfigurasi master data, SOP, user access',
      icon: Zap,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* BRAND IDENTITY / KEMBALI KE DASHBOARD UTAMA */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-800/80 active:bg-slate-800 transition-all text-left group border border-transparent hover:border-slate-700/60"
          title="Kembali ke Dashboard Utama"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-900/50 shrink-0 group-hover:bg-emerald-500 transition-colors">
            <span className="font-serif text-base sm:text-lg tracking-wider">A</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white truncate font-serif group-hover:text-emerald-300 transition-colors">
                ALMAA CARE OS
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                Dashboard
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden md:block">
              Pondok Pesantren Almaa Parung
            </p>
          </div>
        </button>

        {/* TIME TRAVEL ENGINE BADGE (BOX JAM COMPACT & SLEEK) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isSimulatedTime
                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-750'
            }`}
            title="Klik untuk pengaturan Waktu Sistem & Simulasi 24 Jam"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="font-mono font-bold tracking-wider text-xs sm:text-sm">{currentClock}</span>
            <span className="text-[10px] text-emerald-400/90 font-mono font-semibold hidden xs:inline">WIB</span>
            {isSimulatedTime && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded uppercase font-semibold">
                Sim
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* TIME TRAVEL DROPDOWN WITH BACKDROP */}
          {showTimeDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTimeDropdown(false)}
              />
              <div className="absolute left-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Waktu Sistem 24 Jam
                    </span>
                    {activeActivity && (
                      <span className="text-[10px] text-emerald-400 truncate block max-w-[180px]">
                        SOP: {activeActivity.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeTravel(null);
                      setShowTimeDropdown(false);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
                  >
                    Gunakan Jam Nyata
                  </button>
                </div>

                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {timePresets.map((p) => (
                    <button
                      key={p.time}
                      type="button"
                      onClick={() => {
                        setTimeTravel(p.time);
                        setShowTimeDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentClock === p.time
                          ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate mr-2">{p.label}</span>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">{p.time}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="time"
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded px-2 py-1 w-full font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTimeInput) {
                        setTimeTravel(customTimeInput);
                        setShowTimeDropdown(false);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded font-medium transition-colors shrink-0"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ACTIONS & CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* SEARCH BUTTON */}
          <button
            type="button"
            onClick={openGlobalSearch}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/80 rounded-lg text-xs transition-colors"
            title="Pencarian Global (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline">Cari...</span>
            <kbd className="hidden 2xl:inline-block bg-slate-900 text-slate-400 text-[10px] px-1 py-0.2 rounded border border-slate-700 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* REFRESH STATUS */}
          <button
            type="button"
            onClick={() => refreshAllData()}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-xs transition-colors shrink-0"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          </button>

          {/* INPUT SANTRI & PENGURUS BUTTON (SUPER ADMIN) */}
          <button
            type="button"
            onClick={() => openManageStudents(null)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0"
            title="Input Data Santri & Pengurus (Akses Super Admin)"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Input Data</span>
          </button>

          {/* KELOLA JADWAL & SOP BUTTON */}
          <button
            type="button"
            onClick={() => openManageSchedule(null)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0"
            title="Kelola & Edit Master Jadwal 24 Jam & SOP"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Jadwal</span>
          </button>

          {/* EMERGENCY 🚨 BUTTON */}
          <button
            type="button"
            onClick={openEmergencyReport}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              hasActiveEmergency
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50 animate-pulse ring-1 ring-rose-400/50'
                : 'bg-slate-800/90 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/60'
            }`}
            title={
              hasActiveEmergency
                ? `🚨 ${unhandledIncidents.length} Kejadian Darurat Belum Selesai Ditangani`
                : 'Lapor Kejadian Darurat (Status Saat Ini Kondusif)'
            }
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${hasActiveEmergency ? 'text-white' : 'text-rose-400'}`} />
            <span className="hidden md:inline">{hasActiveEmergency ? 'Darurat Aktif' : 'Darurat'}</span>
            {hasActiveEmergency && (
              <span className="w-4 h-4 bg-white text-rose-700 text-[10px] font-black rounded-full flex items-center justify-center">
                {unhandledIncidents.length}
              </span>
            )}
          </button>

          {/* NOTIFICATION INBOX */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
              title="Notifikasi Sistem"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Notifikasi Pengasuhan
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {notifications.length} item
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-4">Belum ada notifikasi baru.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-lg border text-xs transition-colors ${
                            notif.type === 'ALERT'
                              ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                              : notif.type === 'WARNING'
                              ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                              : notif.type === 'SUCCESS'
                              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[11px]">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ROLE SWITCHER / BOX LOGIN */}
          <div className="relative ml-1.5 sm:ml-3 pl-2 sm:pl-3.5 border-l border-slate-800">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-750 active:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition-all shadow-sm"
              title="Ganti Peran Pengguna / Akun Aktif"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden md:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono hidden sm:inline">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1.5">
                    <p className="text-xs font-bold text-slate-200">{currentUser.name}</p>
                    <p className="text-[11px] text-emerald-400 font-medium">{currentUser.roleLabel}</p>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">
                    Ganti Peran Pengguna (RBAC Preview)
                  </div>

                  <div className="space-y-1">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = currentUser.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[12px]">{r.title}</p>
                            <p className="text-[10px] text-slate-400 leading-tight">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
