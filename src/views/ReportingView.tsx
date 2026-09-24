import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
} from 'lucide-react';

export const ReportingView: React.FC = () => {
  const {
    stats,
    students,
    rooms,
    violations,
    coachings,
    handovers,
    currentClock,
  } = useApp();

  const [aiReport, setAiReport] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoadingAi(true);
    try {
      const summary = await api.getDailyAISummary();
      setAiReport(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      date: reportDate,
      time: currentClock,
      stats,
      studentsCount: students.length,
      violationsCount: violations.length,
      coachingsCount: coachings.length,
      handoversCount: handovers.length,
      aiExecutiveSummary: aiReport,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Pengasuhan_Almaa_${reportDate}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Laporan & Analitik Pengasuhan
            </span>
            <span className="text-xs text-slate-400">Pondok Pesantren Almaa Parung</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-serif">
            Laporan Harian Pengasuhan 24 Jam
          </h2>
          <p className="text-xs text-slate-400">
            Sintesis data kedisiplinan, kebersihan kamar, kehadiran, dan pembinaan santri
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={generateReport}
            disabled={loadingAi}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {loadingAi ? 'Menyusun AI...' : 'Generate Ulang AI'}
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Ekspor JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block">Indeks Disiplin Santri</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats?.disciplineScore}%
          </p>
          <span className="text-[10px] text-emerald-400/80">Kategori Baik & Tertib</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block">Skor Bersih & Rapi</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats?.cleanScore}/100
          </p>
          <span className="text-[10px] text-slate-400">Rata-rata 4 Kamar Asrama</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block">Pelanggaran Tercatat</span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {violations.length} Kasus
          </p>
          <span className="text-[10px] text-slate-400">Kategori Ringan - Sedang</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block">Kasus Pembinaan</span>
          <p className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {coachings.filter((c) => c.status !== 'RESOLVED').length} Aktif
          </p>
          <span className="text-[10px] text-slate-400">Dalam Proses Bimbingan</span>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY PREVIEW (PRINTABLE REPORT FORMAT) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 print:bg-white print:text-black print:border-none">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base font-serif flex items-center gap-2 print:text-black">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Executive AI Briefing (Ringkasan Pimpinan)
            </h3>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Analisis komprehensif 24 jam berbasis data real-time santri, kamar, dan jadwal jaga
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-850 px-3 py-1 rounded-lg border border-slate-700">
            {reportDate} • {currentClock} WIB
          </span>
        </div>

        <div className="p-5 bg-slate-850/80 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans print:bg-transparent print:border-none print:text-black">
          {loadingAi ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Menghubungkan ke Gemini AI untuk menganalisis laporan 24 jam...
            </div>
          ) : (
            aiReport || 'Laporan ringkasan pengasuhan siap disajikan.'
          )}
        </div>

        {/* BREAKDOWN TABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* SANTRI ATTENTION TABLE */}
          <div className="p-4 bg-slate-850/50 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Santri Dalam Pantauan Khusus:
            </h4>
            <div className="space-y-1.5">
              {students
                .filter((s) => s.status === 'TERLAMBAT' || s.status === 'SAKIT' || s.violationCount > 1)
                .map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60"
                  >
                    <span className="text-slate-200 font-medium">{st.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {st.roomNumber} ({st.status}) • {st.violationCount} Pelanggaran
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* ROOM HEALTH TABLE */}
          <div className="p-4 bg-slate-850/50 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Skor Kamar & Asrama:
            </h4>
            <div className="space-y-1.5">
              {rooms.map((rm) => (
                <div
                  key={rm.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60"
                >
                  <span className="text-slate-200 font-medium">Kamar {rm.number} ({rm.name})</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {rm.averageScore}/100 ({rm.status})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
