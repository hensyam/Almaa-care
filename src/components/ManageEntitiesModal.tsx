import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { api } from '../services/api.js';
import { Student, User, UserRole, Room, STUDENT_CLASSES } from '../types.js';
import {
  X,
  UserPlus,
  Users,
  GraduationCap,
  Upload,
  Search,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Phone,
  Home,
  Check,
  Zap,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';

interface ManageEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'STUDENTS' | 'STAFF' | 'BULK';
  initialStudent?: Student | null;
  initialUser?: User | null;
  initialMode?: 'ADD' | 'EDIT' | 'LIST';
}

export const ManageEntitiesModal: React.FC<ManageEntitiesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'STUDENTS',
  initialStudent = null,
  initialUser = null,
  initialMode = 'ADD',
}) => {
  const {
    students,
    setStudents,
    users,
    rooms,
    currentUser,
    refreshAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'STAFF' | 'BULK'>(defaultTab);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [staffSearch, setStaffSearch] = useState('');

  // Editing state for Student
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    name: '',
    nickname: '',
    nis: '',
    class: 'Kelas 7',
    roomId: 'room-1',
    roomNumber: '01',
    group: 'Halaqah 1',
    guardianName: '',
    guardianPhone: '',
    status: 'HADIR',
    notes: '',
  });

  // Editing state for Staff/User
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'PENGASUH',
    roleLabel: 'Pengasuh Asrama (Musyrif)',
    phone: '',
    avatar: '',
    assignedRoomIds: ['room-1'],
  });

  // Bulk Import state
  const [bulkText, setBulkText] = useState('');
  const [bulkTargetRoom, setBulkTargetRoom] = useState('01');
  const [bulkTargetClass, setBulkTargetClass] = useState('Kelas 7');
  const [bulkPreview, setBulkPreview] = useState<Array<Partial<Student>>>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync default tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSuccessMsg('');
      setErrorMsg('');
      setDeleteConfirmId(null);

      if (initialStudent) {
        setStudentForm({ ...initialStudent });
        setIsEditingStudent(true);
        setActiveTab('STUDENTS');
      } else if (defaultTab === 'STUDENTS' && initialMode !== 'LIST') {
        // Open the form directly when adding a new student
        resetStudentForm();
        setIsEditingStudent(true);
        setActiveTab('STUDENTS');
      } else {
        setIsEditingStudent(false);
        resetStudentForm();
      }

      if (initialUser) {
        setStaffForm({ ...initialUser });
        setIsEditingStaff(true);
        setActiveTab('STAFF');
      } else {
        setIsEditingStaff(false);
        resetStaffForm();
      }
    }
  }, [isOpen, defaultTab, initialStudent, initialUser, initialMode]);

  const resetStudentForm = () => {
    const randomNis = `2024${Math.floor(1000 + Math.random() * 9000)}`;
    setStudentForm({
      name: '',
      nickname: '',
      nis: randomNis,
      class: 'Kelas 7',
      roomId: rooms[0]?.id || 'room-1',
      roomNumber: rooms[0]?.number || '01',
      group: 'Halaqah 1',
      guardianName: '',
      guardianPhone: '',
      status: 'HADIR',
      notes: '',
    });
  };

  const resetStaffForm = () => {
    setStaffForm({
      name: '',
      email: '',
      role: 'PENGASUH',
      roleLabel: 'Pengasuh Asrama (Musyrif)',
      phone: '',
      avatar: '',
      assignedRoomIds: [rooms[0]?.id || 'room-1'],
    });
  };

  // Helper for message timeout
  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Parse bulk text whenever it changes
  useEffect(() => {
    if (!bulkText.trim()) {
      setBulkPreview([]);
      return;
    }

    const lines = bulkText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const parsed: Array<Partial<Student>> = [];

    lines.forEach((line, idx) => {
      // Formats supported:
      // 1. "Ahmad Rayhan, 202401, 101, Kelas 7A, Bpk. Subagio, 0812345678"
      // 2. "Ahmad Rayhan, 101"
      // 3. "Ahmad Rayhan"
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      const name = parts[0] || '';
      if (!name) return;

      let nis = `2024${String(1000 + idx + Math.floor(Math.random() * 8000))}`;
      let roomNum = bulkTargetRoom;
      let className = bulkTargetClass;
      let guardianName = 'Wali Santri';
      let guardianPhone = '-';

      if (parts.length >= 2 && parts[1]) {
        // if second part looks like NIS (all digits) or room (101, 102)
        if (/^\d{3}$/.test(parts[1])) {
          roomNum = parts[1];
        } else if (/^\d{4,}$/.test(parts[1])) {
          nis = parts[1];
        } else {
          roomNum = parts[1];
        }
      }

      if (parts.length >= 3 && parts[2]) {
        if (/^\d{3}$/.test(parts[2])) roomNum = parts[2];
        else className = parts[2];
      }

      if (parts.length >= 4 && parts[3]) {
        className = parts[3];
      }
      if (parts.length >= 5 && parts[4]) {
        guardianName = parts[4];
      }
      if (parts.length >= 6 && parts[5]) {
        guardianPhone = parts[5];
      }

      // Normalize className to valid Kelas 7 - Kelas 12
      const cleanedCls = className.trim().toLowerCase();
      let normalizedClass = bulkTargetClass;
      for (let g = 12; g >= 7; g--) {
        if (cleanedCls.includes(String(g))) {
          normalizedClass = `Kelas ${g}`;
          break;
        }
      }

      const matchedRoom = rooms.find((r) => r.number === roomNum) || rooms[0];

      parsed.push({
        name,
        nickname: name.split(' ')[0],
        nis,
        roomNumber: roomNum,
        roomId: matchedRoom?.id || 'room-1',
        class: normalizedClass,
        group: `Halaqah ${((idx % 4) + 1)}`,
        guardianName,
        guardianPhone,
        status: 'HADIR',
        notes: 'Diimpor via Input Masal Super Admin',
      });
    });

    setBulkPreview(parsed);
  }, [bulkText, bulkTargetRoom, bulkTargetClass, rooms]);

  // STUDENT ACTIONS
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name?.trim()) {
      showFeedback('Nama santri wajib diisi!', true);
      return;
    }

    setLoading(true);
    try {
      // Find room id from room number
      const selectedRoom = rooms.find((r) => r.number === studentForm.roomNumber || r.id === studentForm.roomId) || rooms[0];
      const payload: Partial<Student> = {
        ...studentForm,
        name: studentForm.name.trim(),
        roomNumber: selectedRoom?.number || studentForm.roomNumber || '01',
        roomId: selectedRoom?.id || 'room-1',
        nickname: studentForm.nickname?.trim() || studentForm.name.trim().split(' ')[0],
      };

      if (studentForm.id) {
        const res = await api.updateStudent(studentForm.id, payload, currentUser.name, currentUser.role);
        if (res?.student) {
          setStudents((prev) => prev.map((s) => (s.id === studentForm.id ? res.student : s)));
        }
        showFeedback(`Data santri "${payload.name}" berhasil diperbarui.`);
      } else {
        const res = await api.createStudent(payload, currentUser.name, currentUser.role);
        if (res?.student) {
          setStudents((prev) => [res.student, ...prev.filter((s) => s.id !== res.student.id)]);
        }
        showFeedback(`Santri baru "${payload.name}" berhasil didaftarkan dan disimpan!`);
      }

      await refreshAllData();
      setIsEditingStudent(false);
      resetStudentForm();
    } catch (err: any) {
      console.error('Error saving student:', err);
      showFeedback(err?.message || 'Gagal menyimpan data santri. Silakan periksa koneksi.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    setLoading(true);
    try {
      await api.deleteStudent(id, currentUser.name, currentUser.role);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      showFeedback(`Santri "${name}" berhasil dihapus dari database.`);
      setDeleteConfirmId(null);
      await refreshAllData();
    } catch (err: any) {
      console.error('Error deleting student:', err);
      showFeedback(err?.message || 'Gagal menghapus santri.', true);
    } finally {
      setLoading(false);
    }
  };

  // STAFF ACTIONS
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name?.trim()) {
      showFeedback('Nama pengurus wajib diisi', true);
      return;
    }

    setLoading(true);
    try {
      const roleLabels: Record<string, string> = {
        SUPER_ADMIN: 'Super Administrator Sistem',
        KOORDINATOR: 'Koordinator Bagian Pengasuhan',
        PIMPINAN: 'Pimpinan Pondok Pesantren',
        GURU: 'Dewan Asatidz / Guru',
        PENGASUH: 'Pengasuh Asrama (Musyrif)',
      };

      const payload: Partial<User> = {
        ...staffForm,
        roleLabel: roleLabels[staffForm.role || 'PENGASUH'] || 'Pengurus',
      };

      if (staffForm.id) {
        await api.updateUser(staffForm.id, payload, currentUser.name, currentUser.role);
        showFeedback(`Data pengurus "${payload.name}" berhasil diperbarui.`);
      } else {
        await api.createUser(payload, currentUser.name, currentUser.role);
        showFeedback(`Pengurus baru "${payload.name}" berhasil ditambahkan!`);
      }

      await refreshAllData();
      setIsEditingStaff(false);
      resetStaffForm();
    } catch (err) {
      showFeedback('Gagal menyimpan data pengurus.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (id === currentUser.id) {
      showFeedback('Tidak dapat menghapus akun Anda sendiri yang sedang aktif!', true);
      return;
    }

    setLoading(true);
    try {
      await api.deleteUser(id, currentUser.name, currentUser.role);
      showFeedback(`Pengurus "${name}" berhasil dihapus.`);
      setDeleteConfirmId(null);
      await refreshAllData();
    } catch (err) {
      showFeedback('Gagal menghapus pengurus.', true);
    } finally {
      setLoading(false);
    }
  };

  // BULK IMPORT ACTION
  const handleExecuteBulkImport = async () => {
    if (bulkPreview.length === 0) {
      showFeedback('Tidak ada data santri yang valid untuk diimpor.', true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.bulkCreateStudents(bulkPreview, currentUser.name, currentUser.role);
      if (res?.students && Array.isArray(res.students)) {
        setStudents((prev) => [...res.students, ...prev]);
      }
      showFeedback(`Sukses mengimpor ${res.count || bulkPreview.length} santri nyata ke database!`);
      setBulkText('');
      setBulkPreview([]);
      await refreshAllData();
      setActiveTab('STUDENTS');
      setIsEditingStudent(false);
    } catch (err: any) {
      console.error('Error in bulk import:', err);
      showFeedback(err?.message || 'Gagal melakukan impor data masal.', true);
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nis.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nickname.toLowerCase().includes(studentSearch.toLowerCase());
    const matchRoom =
      roomFilter === 'ALL' ||
      s.roomNumber === roomFilter ||
      s.roomNumber === roomFilter.replace('Kamar ', '').trim();
    return matchSearch && matchRoom;
  });

  const filteredStaff = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(staffSearch.toLowerCase())
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Super Admin: Input & Kelola Master Data
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AKSES KHUSUS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pondok Pesantren Almaa Parung — Input santri nyata, atur asrama, dan konfigurasi pengurus/asatidz.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {successMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => {
              setActiveTab('STUDENTS');
              setIsEditingStudent(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'STUDENTS'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Data Santri ({students.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('STAFF');
              setIsEditingStaff(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'STAFF'
                ? 'border-purple-500 text-purple-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengurus & Asatidz ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BULK')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'BULK'
                ? 'border-sky-500 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Impor Masal Santri</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: DATA SANTRI */}
          {activeTab === 'STUDENTS' && (
            <div className="space-y-4">
              {/* If in edit/create student mode */}
              {isEditingStudent ? (
                <div className="p-4 sm:p-5 rounded-xl bg-slate-850 border border-emerald-500/30">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-200">
                        {studentForm.id ? 'Edit Profil Santri' : 'Input Santri Baru (Super Admin)'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsEditingStudent(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Batal & Kembali ke Daftar
                    </button>
                  </div>

                  <form onSubmit={handleSaveStudent} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nama Lengkap Santri <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={studentForm.name || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          placeholder="Contoh: Muhammad Rayhan Al-Habsyi"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nama Panggilan
                        </label>
                        <input
                          type="text"
                          value={studentForm.nickname || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, nickname: e.target.value })}
                          placeholder="Contoh: Rayhan"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nomor Induk Santri (NIS)
                        </label>
                        <input
                          type="text"
                          value={studentForm.nis || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                          placeholder="Contoh: 20240192"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Kamar / Asrama
                        </label>
                        <select
                          value={studentForm.roomNumber || rooms[0]?.number || '01'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const r = rooms.find((rm) => rm.number === val);
                            setStudentForm({
                              ...studentForm,
                              roomNumber: val,
                              roomId: r?.id || 'room-1',
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        >
                          {rooms.map((rm) => (
                            <option key={rm.id} value={rm.number}>
                              Kamar {rm.number} — {rm.name} (Lantai {rm.floor})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Kelas / Tingkat
                        </label>
                        <select
                          value={studentForm.class || 'Kelas 7'}
                          onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        >
                          {STUDENT_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Kelompok Halaqah
                        </label>
                        <input
                          type="text"
                          value={studentForm.group || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, group: e.target.value })}
                          placeholder="Contoh: Halaqah 1 (Ust. Fauzi)"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nama Orang Tua / Wali
                        </label>
                        <input
                          type="text"
                          value={studentForm.guardianName || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                          placeholder="Contoh: H. Ahmad Subandi"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nomor WhatsApp Wali
                        </label>
                        <input
                          type="text"
                          value={studentForm.guardianPhone || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                          placeholder="Contoh: 0812-3456-7890"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Status Presensi Awal
                        </label>
                        <select
                          value={studentForm.status || 'HADIR'}
                          onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="HADIR">HADIR (Aktif di Pondok)</option>
                          <option value="IZIN">IZIN (Izin Pulang/Pesiar)</option>
                          <option value="SAKIT">SAKIT (Di Poskestren)</option>
                          <option value="TERLAMBAT">TERLAMBAT</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Catatan Khusus / Riwayat Medis / Karakter
                      </label>
                      <input
                        type="text"
                        value={studentForm.notes || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                        placeholder="Contoh: Memiliki riwayat asma ringan saat cuaca dingin, target hafalan 5 juz tahun ini."
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsEditingStudent(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-emerald-950/40"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{loading ? 'Menyimpan...' : 'Simpan Data Santri'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Cari nama santri, panggilan, atau NIS..."
                          className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <select
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                        className="bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none"
                      >
                        <option value="ALL">Semua Kamar</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.number}>
                            Kamar {r.number}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        resetStudentForm();
                        setIsEditingStudent(true);
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Input Santri Baru</span>
                    </button>
                  </div>

                  {/* Students Table / Grid */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-850/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                          <tr>
                            <th className="px-3.5 py-2.5">Santri</th>
                            <th className="px-3 py-2.5">NIS</th>
                            <th className="px-3 py-2.5">Kamar</th>
                            <th className="px-3 py-2.5">Kelas</th>
                            <th className="px-3 py-2.5">Wali & Kontak</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3.5 py-2.5 text-right">Aksi Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                                Tidak ada santri yang cocok dengan pencarian.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-3.5 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                                      {s.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-100 leading-snug">{s.name}</p>
                                      <p className="text-[10px] text-slate-400">Panggilan: {s.nickname}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 font-mono text-[11px] text-slate-300">{s.nis}</td>
                                <td className="px-3 py-2.5">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold text-[11px] border border-slate-700">
                                    Kamar {s.roomNumber}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-slate-300">{s.class}</td>
                                <td className="px-3 py-2.5">
                                  <p className="text-slate-200">{s.guardianName || '-'}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{s.guardianPhone || '-'}</p>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      s.status === 'HADIR'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : s.status === 'IZIN'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : s.status === 'SAKIT'
                                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}
                                  >
                                    {s.status}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2.5 text-right">
                                  {deleteConfirmId === s.id ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <span className="text-[10px] text-rose-400 font-medium">Hapus?</span>
                                      <button
                                        onClick={() => handleDeleteStudent(s.id, s.name)}
                                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                                      >
                                        Ya
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px]"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => {
                                          setStudentForm({ ...s });
                                          setIsEditingStudent(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 transition-colors"
                                        title="Edit Data Santri"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(s.id)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 transition-colors"
                                        title="Hapus Santri"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: PENGURUS & ASATIDZ */}
          {activeTab === 'STAFF' && (
            <div className="space-y-4">
              {isEditingStaff ? (
                <div className="p-4 sm:p-5 rounded-xl bg-slate-850 border border-purple-500/30">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-slate-200">
                        {staffForm.id ? 'Edit Profil Pengurus / Asatidz' : 'Input Pengurus Baru (Super Admin)'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsEditingStaff(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Batal & Kembali ke Daftar
                    </button>
                  </div>

                  <form onSubmit={handleSaveStaff} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nama Lengkap & Gelar <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={staffForm.name || ''}
                          onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                          placeholder="Contoh: Ust. Hendra Syam Basri, S.Pd.I"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Alamat Email
                        </label>
                        <input
                          type="email"
                          value={staffForm.email || ''}
                          onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                          placeholder="Contoh: hendrasyambasri@gmail.com"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Peran / Hak Akses (Role)
                        </label>
                        <select
                          value={staffForm.role || 'PENGASUH'}
                          onChange={(e) => {
                            const r = e.target.value as UserRole;
                            setStaffForm({ ...staffForm, role: r });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                        >
                          <option value="SUPER_ADMIN">SUPER ADMIN — Akses Penuh Sistem & Master Data</option>
                          <option value="KOORDINATOR">KOORDINATOR — Supervisi Shift, Case & Izin</option>
                          <option value="PENGASUH">PENGASUH (MUSYRIF) — Harian, Kamar & Presensi</option>
                          <option value="PIMPINAN">PIMPINAN — Eksekutif, Laporan & Audit Trail</option>
                          <option value="GURU">GURU / ASATIDZ — KBM & Monitoring Adab</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nomor WhatsApp Pengurus
                        </label>
                        <input
                          type="text"
                          value={staffForm.phone || ''}
                          onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                          placeholder="Contoh: 0812-3456-7890"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>


                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsEditingStaff(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-purple-950/40"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{loading ? 'Menyimpan...' : 'Simpan Data Pengurus'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Top search & Add Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Cari nama pengurus, role, atau email..."
                        className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        resetStaffForm();
                        setIsEditingStaff(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Input Pengurus Baru</span>
                    </button>
                  </div>

                  {/* Staff Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredStaff.map((u) => (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-xs shrink-0 font-serif">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-100 text-xs">{u.name}</h4>
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                    u.role === 'SUPER_ADMIN'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : u.role === 'KOORDINATOR'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : u.role === 'PIMPINAN'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-slate-700/60 text-slate-300'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-400 mb-3">
                            <p className="truncate">Email: {u.email}</p>
                            <p>No HP: {u.phone || '-'}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            {u.roleLabel}
                          </span>

                          {deleteConfirmId === u.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-rose-400">Yakin?</span>
                              <button
                                onClick={() => handleDeleteStaff(u.id, u.name)}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setStaffForm({ ...u });
                                  setIsEditingStaff(true);
                                }}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                                title="Edit Pengurus"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {u.id !== currentUser.id && (
                                <button
                                  onClick={() => setDeleteConfirmId(u.id)}
                                  className="p-1 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs"
                                  title="Hapus Pengurus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: INPUT MASAL SANTRI (BULK IMPORT) */}
          {activeTab === 'BULK' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200 text-xs leading-relaxed flex items-start gap-3">
                <FileText className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sky-300 mb-1">
                    Petunjuk Input Masal Nama Santri Nyata (Bulk Paste):
                  </p>
                  <p className="text-sky-200/90 mb-2">
                    Anda dapat menyalin (*copy-paste*) daftar santri langsung dari Excel, WhatsApp, atau catatan teks.
                    Setiap baris mewakili 1 santri.
                  </p>
                  <div className="bg-slate-900/90 rounded-lg p-2 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-0.5">
                    <p className="text-emerald-400">Contoh format per baris:</p>
                    <p>Muhammad Rayhan, 01, Kelas 7, H. Subandi, 08123456789</p>
                    <p>Ahmad Zaki Fauzan, 02, Kelas 8</p>
                    <p>Faisal Akbar Maulana, 03</p>
                  </div>
                </div>
              </div>

              {/* Defaults for missing fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kamar Asrama Default (bila di baris tidak ada nomor kamar):
                  </label>
                  <select
                    value={bulkTargetRoom}
                    onChange={(e) => setBulkTargetRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.number}>
                        Kamar {r.number} — {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kelas Default:
                  </label>
                  <select
                    value={bulkTargetClass}
                    onChange={(e) => setBulkTargetClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                  >
                    {STUDENT_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Tempel Daftar Nama Santri di Bawah Ini:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkText(
                        `Muhammad Ziyad Al-Farabi, 01, Kelas 7, Bpk. Farabi, 081299911122\n` +
                        `Ahmad Rizky Pratama, 01, Kelas 7, Ibu Sulastri, 081388822233\n` +
                        `Faris Naufal Ramadhan, 02, Kelas 8, Bpk. Ramadhan, 081577733344\n` +
                        `Bilal Habibi Rusdi, 02, Kelas 9, Bpk. Rusdi, 081266644455\n` +
                        `Syauqi Dzil Ikram, 03, Kelas 10, Bpk. Ikram, 081955566677\n` +
                        `Zaidan Hakim Ar-Razi, 04, Kelas 11, Bpk. Hakim, 081233344455\n` +
                        `Muhammad Faiz Abdillah, 04, Kelas 12, Bpk. Abdillah, 081344455566`
                      );
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 underline"
                  >
                    Gunakan Contoh Format Nyata
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Tempel daftar nama santri di sini..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl p-3 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Live Preview of parsed rows */}
              {bulkPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Pratinjau Hasil Parsing ({bulkPreview.length} Santri Terdeteksi):
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Siap Disimpan
                    </span>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-slate-900/80">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-850 text-[11px] font-bold text-slate-400 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">No</th>
                          <th className="px-3 py-2">Nama Santri</th>
                          <th className="px-3 py-2">NIS</th>
                          <th className="px-3 py-2">Kamar</th>
                          <th className="px-3 py-2">Kelas</th>
                          <th className="px-3 py-2">Wali</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {bulkPreview.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-800/50">
                            <td className="px-3 py-1.5 text-slate-500 font-mono">{i + 1}</td>
                            <td className="px-3 py-1.5 font-semibold text-slate-200">{item.name}</td>
                            <td className="px-3 py-1.5 font-mono text-[11px] text-slate-400">{item.nis}</td>
                            <td className="px-3 py-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">
                                Kamar {item.roomNumber}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-slate-400">{item.class}</td>
                            <td className="px-3 py-1.5 text-slate-400">{item.guardianName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleExecuteBulkImport}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-sky-950/40"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {loading ? 'Mengimpor Data...' : `Simpan Semua ${bulkPreview.length} Santri ke Database`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
