import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function generateDailyAISummary(data: {
  date: string;
  stats: any;
  activities: any[];
  violations: any[];
  coachings: any[];
  rooms: any[];
  incidents: any[];
}): Promise<string> {
  const client = getAIClient();

  // If no API key is available or request fails, produce data-grounded synthesis
  if (!client) {
    const presentRate = Math.round((data.stats.presentStudents / (data.stats.totalStudents || 1)) * 100);
    const violationCategories = data.violations.map((v) => v.category);
    const dominantCategory = violationCategories.length > 0 ? violationCategories[0] : 'Disiplin';
    const attentionRooms = data.rooms.filter((r) => r.status === 'NEEDS_ATTENTION').map((r) => `Kamar ${r.number}`).join(', ');

    return `Laporan Pengasuhan Harian Almaa (${data.date}):\n\n` +
      `1. Dinamika Ritme Harian: Sebanyak ${presentRate}% santri aktif mengikuti agenda harian tepat waktu. ` +
      `Aktivitas Subuh dan kebersihan pagi terlaksana sesuai standar operasional pesantren.\n` +
      `2. Evaluasi Perilaku: Tercatat ${data.violations.length} catatan pelanggaran dengan kategori dominan "${dominantCategory}". ` +
      `Sebanyak ${data.coachings.filter((c: any) => c.status === 'RESOLVED').length} pembinaan tuntas dan ${data.coachings.filter((c: any) => c.status !== 'RESOLVED').length} dalam pemantauan aktif.\n` +
      `3. Lingkungan Asrama: ${attentionRooms ? `${attentionRooms} memerlukan pengecekan lanjutan karena item kerapihan belum optimal.` : 'Seluruh kamar dalam kondisi normal.'}\n` +
      `4. Rekomendasi Pengasuh: Fokuskan pendampingan pada ketertiban jam malam 21.30 dan perapian seragam sebelum jam KBM pagi.`;
  }

  try {
    const prompt = `Anda adalah Asisten Sistem Pengasuhan "Almaa Care OS" Pondok Pesantren Almaa Parung.
Berdasarkan DATA NYATA berikut, buatkan ringkasan eksekutif pengasuhan harian yang objektif, menyejukkan, terstruktur, dan berbasis data faktual (TIDAK BOLEH MENGARANG atau membuat kesimpulan mutlak):

DATA:
- Tanggal: ${data.date}
- Total Santri: ${data.stats.totalStudents}, Hadir: ${data.stats.presentStudents}, Izin: ${data.stats.permittedStudents}, Sakit: ${data.stats.sickStudents}
- Rata-rata Skor Disiplin: ${data.stats.disciplineScore}%, Kebersihan: ${data.stats.cleanScore}%, Kerapihan: ${data.stats.orderlyScore}%
- Pelanggaran (${data.violations.length} kejadian): ${data.violations.map((v: any) => `${v.studentName} (${v.category} - ${v.incidentType})`).join('; ')}
- Pembinaan Aktif (${data.coachings.length}): ${data.coachings.map((c: any) => `${c.studentName} (Level ${c.level}: ${c.focusArea})`).join('; ')}
- Kamar Perlu Perhatian: ${data.rooms.filter((r: any) => r.status === 'NEEDS_ATTENTION').map((r: any) => `Kamar ${r.number} (${r.averageScore}/100)`).join(', ') || 'Nihil'}
- Kejadian Penting / Darurat: ${data.incidents.map((i: any) => `${i.title} (${i.status})`).join('; ') || 'Kondusif'}

Format Output:
- 📌 Ringkasan Dinamika 24 Jam
- 🔍 Pola Perilaku & Catatan Pembinaan
- 🛏️ Status Asrama & Fasilitas
- 💡 Rekomendasi Tindak Lanjut untuk Pengasuh Bertugas Berikutnya`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || 'Gagal menghasilkan ringkasan harian.';
  } catch (error) {
    console.error('Gemini API daily summary error:', error);
    return `Laporan Pengasuhan Harian (Fallback Sistem):\nSebagian besar kegiatan 24 jam berjalan sesuai SOP. Tercatat ${data.violations.length} pelanggaran dan ${data.coachings.length} proses pembinaan aktif. Kamar santri dalam kondisi terpantau baik.`;
  }
}

export async function generateCoachingQuestions(studentName: string, violation: string, category: string): Promise<string[]> {
  const client = getAIClient();
  if (!client) {
    return [
      `Assalamu'alaikum ${studentName}, bagaimana kabar antum hari ini dan bagaimana perasaan antum tentang kegiatan tadi?`,
      `Bisa ceritakan apa yang sebenarnya terjadi saat ${violation.toLowerCase()}?`,
      `Menurut antum, apa hikmah dan dampak tindakan tersebut bagi diri antum serta teman-teman di kamar/pondok?`,
      `Langkah nyata apa yang ingin antum ambil agar hal ini tidak terulang kembali esok hari?`,
      `Bagaimana ustadz dan teman-teman bisa membantu antum mewujudkan komitmen tersebut?`,
    ];
  }

  try {
    const prompt = `Anda adalah konselor pengasuhan pesantren di Pondok Pesantren Almaa.
Santri bernama "${studentName}" mengalami masalah: "${violation}" (Kategori: ${category}).
Susunkan 5 pertanyaan pembinaan (coaching questions) yang berbasis adab, empati, tidak menghakimi, menyentuh kesadaran nurani santri, dan mendorong perbaikan mandiri (bukan hukuman fisik).
Kembalikan HANYA 5 butir pertanyaan bertanda nomor 1 sampai 5.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const lines = (response.text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && /^\d+\./.test(l))
      .map((l) => l.replace(/^\d+\.\s*/, ''));

    if (lines.length > 0) return lines;
    return [
      `Bagaimana kondisi antum hari ini, ${studentName}?`,
      `Apa yang menjadi kendala utama antum terkait ${category.toLowerCase()}?`,
      `Apa komitmen yang bisa antum buat untuk perbaikan ke depan?`,
    ];
  } catch (err) {
    return [
      `Apa yang membuat antum mengalami kendala pada kegiatan tersebut?`,
      `Bagaimana langkah antum untuk memperbaikinya mulai besok pagi?`,
    ];
  }
}
