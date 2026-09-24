import fs from 'fs';
import path from 'path';
import {
  User,
  Student,
  Room,
  Area,
  ActivitySchedule,
  ChecklistRecord,
  AttendanceRecord,
  Violation,
  Coaching,
  Case,
  Appreciation,
  DutyRoster,
  Handover,
  Incident,
  FacilityTicket,
  NotificationItem,
  AuditLog,
  RoomInspection,
  StudentHabitLog,
} from '../src/types.js';
import {
  initialUsers,
  initialRooms,
  initialStudents,
  initialAreas,
  initialActivities,
  initialViolations,
  initialCoachings,
  initialCases,
  initialAppreciations,
  initialDutyRoster,
  initialHandovers,
  initialIncidents,
  initialFacilities,
  initialNotifications,
  initialAuditLogs,
} from './seedData.js';

interface DatabaseSchema {
  users: User[];
  students: Student[];
  rooms: Room[];
  areas: Area[];
  activities: ActivitySchedule[];
  checklists: ChecklistRecord[];
  attendance: AttendanceRecord[];
  violations: Violation[];
  coachings: Coaching[];
  cases: Case[];
  appreciations: Appreciation[];
  dutyRosters: DutyRoster[];
  handovers: Handover[];
  incidents: Incident[];
  facilities: FacilityTicket[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  roomInspections: RoomInspection[];
  habitLogs: Record<string, StudentHabitLog>;
  simulatedTime: string | null; // e.g., "05:37" or null for live clock
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'almaa_db.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing from seed data.', e);
    }
    return this.getInitialState();
  }

  private getInitialState(): DatabaseSchema {
    // Generate initial habit logs for students
    const habitLogs: Record<string, StudentHabitLog> = {};
    const habitKeys = [
      { key: 'wake_up', label: 'Bangun Tepat Waktu (04.00)' },
      { key: 'subuh', label: 'Subuh Berjamaah di Shaf Pertama/Awal' },
      { key: 'piket', label: 'Piket Kebersihan Kamar' },
      { key: 'tidy', label: 'Kamar Rapi & Ranjang Tertata' },
      { key: 'study', label: 'Hadir KBM & Ta\'lim Tepat Waktu' },
      { key: 'adab', label: 'Adab Berbicara & Sopan Santun' },
    ];

    initialStudents.forEach((st) => {
      habitLogs[st.id] = {
        studentId: st.id,
        date: '2026-09-17',
        habits: habitKeys.map((h) => ({
          key: h.key,
          label: h.label,
          status: st.status === 'TERLAMBAT' && h.key === 'wake_up' ? 'MISSED' : 'DONE',
        })),
      };
    });

    return {
      users: initialUsers,
      students: initialStudents,
      rooms: initialRooms,
      areas: initialAreas,
      activities: initialActivities,
      checklists: [],
      attendance: [],
      violations: initialViolations,
      coachings: initialCoachings,
      cases: initialCases,
      appreciations: initialAppreciations,
      dutyRosters: initialDutyRoster,
      handovers: initialHandovers,
      incidents: initialIncidents,
      facilities: initialFacilities,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      roomInspections: [],
      habitLogs,
      simulatedTime: null, // Default to live real time (Asia/Jakarta WIB)
    };
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database to disk:', e);
    }
  }

  // AUDIT TRAIL LOGGING
  public addAuditLog(who: string, role: string, what: string, where: string, before = '', after = '') {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      who,
      role,
      what,
      when: new Date().toISOString().replace('T', ' ').slice(0, 19),
      where,
      before,
      after,
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return newLog;
  }

  // NOTIFICATION GENERATOR
  public addNotification(title: string, message: string, type: 'ALERT' | 'WARNING' | 'SUCCESS' | 'INFO', actionType?: string, targetId?: string) {
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: this.getCurrentClockTime(),
      read: false,
      actionType,
      targetId,
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  // TIME ENGINE
  public setSimulatedTime(time: string | null) {
    this.data.simulatedTime = time;
    this.save();
  }

  public getSimulatedTime() {
    return this.data.simulatedTime;
  }

  public getCurrentClockTime(): string {
    if (this.data.simulatedTime) {
      return this.data.simulatedTime;
    }
    const d = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(d);
  }

  // GETTERS
  public getUsers() { return this.data.users; }
  public getStudents() { return this.data.students; }

  // STUDENTS CRUD (SUPER ADMIN)
  public addStudent(studentData: Partial<Student>, actorName: string, actorRole: string) {
    const id = studentData.id || `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newStudent: Student = {
      id,
      nis: studentData.nis || `2024${Math.floor(1000 + Math.random() * 9000)}`,
      name: studentData.name || 'Nama Santri',
      nickname: studentData.nickname || (studentData.name ? studentData.name.split(' ')[0] : 'Santri'),
      photo: studentData.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      class: studentData.class || 'Kelas 7',
      roomId: studentData.roomId || 'room-1',
      roomNumber: studentData.roomNumber || '01',
      group: studentData.group || 'Halaqah 1',
      guardianName: studentData.guardianName || 'Wali Santri',
      guardianPhone: studentData.guardianPhone || '081234567890',
      status: studentData.status || 'HADIR',
      attendanceRate: 100,
      violationCount: 0,
      coachingCount: 0,
      appreciationCount: 0,
      notes: studentData.notes || 'Santri baru terdaftar',
    };
    this.data.students.push(newStudent);

    // Initialize habit log for new student
    this.data.habitLogs[id] = {
      studentId: id,
      studentName: newStudent.name,
      date: new Date().toISOString().slice(0, 10),
      habits: [
        { key: 'wake_up', label: 'Bangun 04.00 Tepat Waktu', status: 'DONE' },
        { key: 'tahajjud', label: 'Shalat Tahajjud & Witir', status: 'DONE' },
        { key: 'subuh_jamaah', label: 'Shalat Subuh Berjamaah di Shaf Depan', status: 'DONE' },
        { key: 'al_matsurat', label: 'Dzikir Pagi Al-Ma’tsurat', status: 'DONE' },
        { key: 'bed_neat', label: 'Ranjang Rapi & Seprai Kencang', status: 'DONE' },
        { key: 'shower_ready', label: 'Mandi & Siap KBM sebelum 06.30', status: 'DONE' },
        { key: 'tahfidz_morning', label: 'Ziyadah / Murajaah 1 Juz', status: 'DONE' },
      ],
    };

    // Update room occupant count
    const room = this.data.rooms.find((r) => r.id === newStudent.roomId || r.number === newStudent.roomNumber);
    if (room) {
      room.occupantCount = this.data.students.filter((s) => s.roomId === room.id || s.roomNumber === room.number).length;
    }

    this.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Menambahkan Santri Baru: ${newStudent.name} (NIS: ${newStudent.nis})`,
      `Kamar ${newStudent.roomNumber} (${newStudent.class})`,
      '-',
      'Terdaftar Resmi'
    );

    this.save();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>, actorName: string, actorRole: string) {
    const idx = this.data.students.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.students[idx] };
    this.data.students[idx] = {
      ...this.data.students[idx],
      ...updates,
    };
    const updated = this.data.students[idx];

    // Sync habit log name if changed
    if (this.data.habitLogs[id]) {
      this.data.habitLogs[id].studentName = updated.name;
    }

    // Update room occupant count if room changed
    if (updates.roomNumber || updates.roomId) {
      this.data.rooms.forEach((r) => {
        r.occupantCount = this.data.students.filter((s) => s.roomId === r.id || s.roomNumber === r.number).length;
      });
    }

    this.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Mengubah Data Santri: ${updated.name}`,
      `Kamar ${updated.roomNumber}`,
      `Nama: ${old.name}, Kamar: ${old.roomNumber}`,
      `Nama: ${updated.name}, Kamar: ${updated.roomNumber}`
    );

    this.save();
    return updated;
  }

  public deleteStudent(id: string, actorName: string, actorRole: string) {
    const student = this.data.students.find((s) => s.id === id);
    if (!student) return false;
    this.data.students = this.data.students.filter((s) => s.id !== id);
    delete this.data.habitLogs[id];

    // Update room occupant count
    const room = this.data.rooms.find((r) => r.id === student.roomId || r.number === student.roomNumber);
    if (room) {
      room.occupantCount = this.data.students.filter((s) => s.roomId === room.id || s.roomNumber === room.number).length;
    }

    this.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Menghapus Data Santri: ${student.name}`,
      `Kamar ${student.roomNumber}`,
      student.nis,
      'DIHAPUS'
    );

    this.save();
    return true;
  }

  public bulkAddStudents(studentsList: Partial<Student>[], actorName: string, actorRole: string) {
    const created: Student[] = [];
    for (const item of studentsList) {
      if (item.name && item.name.trim()) {
        const s = this.addStudent(item, actorName, actorRole);
        created.push(s);
      }
    }
    return created;
  }

  // USERS / PENGURUS CRUD (SUPER ADMIN)
  public addUser(userData: Partial<User>, actorName: string, actorRole: string) {
    const id = userData.id || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const role = userData.role || 'PENGASUH';
    const roleLabels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrator Sistem',
      KOORDINATOR: 'Koordinator Bagian Pengasuhan',
      PIMPINAN: 'Pimpinan Pondok Pesantren',
      GURU: 'Dewan Asatidz / Guru',
      PENGASUH: 'Pengasuh Asrama (Musyrif)',
    };

    const newUser: User = {
      id,
      name: userData.name || 'Nama Pengurus',
      email: userData.email || `pengurus${Date.now()}@almaa.sch.id`,
      role,
      roleLabel: userData.roleLabel || roleLabels[role] || 'Pengurus',
      phone: userData.phone || '081234567890',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      assignedRoomIds: userData.assignedRoomIds || ['room-1'],
    };

    this.data.users.push(newUser);

    this.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Menambahkan Pengurus Baru: ${newUser.name} (${newUser.role})`,
      'Struktur Pengasuhan',
      '-',
      `Role: ${newUser.roleLabel}`
    );

    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>, actorName: string, actorRole: string) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.users[idx] };
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
    };
    const updated = this.data.users[idx];

    this.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Mengubah Data Pengurus: ${updated.name}`,
      'Struktur Pengasuhan',
      `Nama: ${old.name}, Role: ${old.role}`,
      `Nama: ${updated.name}, Role: ${updated.role}`
    );

    this.save();
    return updated;
  }

  public deleteUser(id: string, actorName: string, actorRole: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return false;
    this.data.users = this.data.users.filter((u) => u.id !== id);

    this.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Menghapus Pengurus: ${user.name}`,
      'Struktur Pengasuhan',
      user.email,
      'DIHAPUS'
    );

    this.save();
    return true;
  }
  public getRooms() { return this.data.rooms; }
  public getAreas() { return this.data.areas; }
  public getActivities() { return this.data.activities; }

  public updateActivity(id: string, updated: Partial<ActivitySchedule>) {
    const idx = this.data.activities.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.data.activities[idx] = {
        ...this.data.activities[idx],
        ...updated,
      };
      this.data.activities.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
      this.save();
      return this.data.activities[idx];
    }
    return null;
  }

  public addActivity(activity: ActivitySchedule) {
    this.data.activities.push(activity);
    this.data.activities.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
    this.save();
    return activity;
  }

  public deleteActivity(id: string) {
    const initialLen = this.data.activities.length;
    this.data.activities = this.data.activities.filter((a) => a.id !== id);
    const deleted = this.data.activities.length < initialLen;
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  public resetActivitiesToDefault() {
    this.data.activities = JSON.parse(JSON.stringify(initialActivities));
    this.save();
    return this.data.activities;
  }
  public getChecklists() { return this.data.checklists; }
  public getAttendance() { return this.data.attendance; }
  public getViolations() { return this.data.violations; }
  public getCoachings() { return this.data.coachings; }
  public getCases() { return this.data.cases; }
  public getAppreciations() { return this.data.appreciations; }
  public getDutyRosters() { return this.data.dutyRosters; }
  public getHandovers() { return this.data.handovers; }
  public getIncidents() { return this.data.incidents; }
  public getFacilities() { return this.data.facilities; }
  public getNotifications() { return this.data.notifications; }
  public getAuditLogs() { return this.data.auditLogs; }
  public getRoomInspections() { return this.data.roomInspections; }
  public getHabitLogs() { return this.data.habitLogs; }

  // STUDENT MANAGEMENT
  public getStudentById(id: string) {
    return this.data.students.find((s) => s.id === id || s.nis === id);
  }

  public updateStudentStatus(id: string, status: Student['status'], who: string, role: string) {
    const student = this.data.students.find((s) => s.id === id);
    if (!student) return null;
    const old = student.status;
    student.status = status;
    this.addAuditLog(who, role, `Ubah status kehadiran santri ${student.name}`, `Santri: ${student.nis}`, `Status: ${old}`, `Status: ${status}`);

    // Automation: if status = late -> trigger behavior alert
    if (status === 'TERLAMBAT') {
      this.addNotification(
        `Santri Terlambat: ${student.name}`,
        `${student.name} (${student.roomNumber}) tercatat terlambat pada kegiatan aktif.`,
        'WARNING',
        'student',
        student.id
      );
    }
    this.save();
    return student;
  }

  // CHECKLIST / SOP EXECUTION
  public recordChecklist(record: Omit<ChecklistRecord, 'id' | 'createdAt'>, who: string, role: string) {
    const newRecord: ChecklistRecord = {
      ...record,
      id: 'chk-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.data.checklists.unshift(newRecord);

    // Mark activity SOP items as updated if matching
    const activity = this.data.activities.find((a) => a.id === record.activityId);
    if (activity) {
      activity.hasCheckingDone = true;
      record.items.forEach((item) => {
        const sopItem = activity.sopItems.find((s) => s.id === item.id);
        if (sopItem) {
          sopItem.completed = item.checked;
        }
      });
    }

    this.addAuditLog(
      who,
      role,
      `Melakukan checklist SOP: ${record.activityName}`,
      `Aktivitas: ${record.activityName}`,
      'Status: PENDING',
      `Status: ${record.status}`
    );

    if (record.status === 'COMPLETE') {
      this.addNotification(
        `SOP Selesai: ${record.activityName}`,
        `Checking kegiatan ${record.activityName} telah diselesaikan oleh ${record.inspectorName}.`,
        'SUCCESS',
        'checklist'
      );
    } else {
      this.addNotification(
        `SOP Perlu Perhatian: ${record.activityName}`,
        `Terdapat catatan item yang belum tuntas pada ${record.activityName}.`,
        'WARNING',
        'checklist'
      );
    }

    this.save();
    return newRecord;
  }

  // ROOM INSPECTION
  public recordRoomInspection(inspection: Omit<RoomInspection, 'id' | 'createdAt'>, who: string, role: string) {
    const newInsp: RoomInspection = {
      ...inspection,
      id: 'rinsp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.data.roomInspections.unshift(newInsp);

    // Update Room metrics
    const room = this.data.rooms.find((r) => r.id === inspection.roomId);
    if (room) {
      const oldScore = room.averageScore;
      room.scoreClean = inspection.scoreClean;
      room.scoreTidy = inspection.scoreTidy;
      room.scoreOrderly = inspection.scoreOrderly;
      room.scoreSafety = inspection.scoreSafety;
      room.averageScore = inspection.overallScore;
      room.lastInspectionDate = `${inspection.date} ${inspection.time}`;
      room.status = inspection.overallScore < 80 ? 'NEEDS_ATTENTION' : 'NORMAL';

      this.addAuditLog(
        who,
        role,
        `Inspeksi Kamar ${room.number} (${room.name})`,
        `Kamar ${room.number}`,
        `Skor Sebelumnya: ${oldScore}`,
        `Skor Baru: ${inspection.overallScore} (${room.status})`
      );

      if (room.status === 'NEEDS_ATTENTION') {
        this.addNotification(
          `Kamar ${room.number} Perlu Perhatian`,
          `Skor inspeksi Kamar ${room.number} adalah ${inspection.overallScore}/100. Perlu tindak lanjut pengasuh.`,
          'ALERT',
          'room',
          room.id
        );
      }
    }

    this.save();
    return newInsp;
  }

  // VIOLATION & AUTOMATION
  public addViolation(violation: Omit<Violation, 'id' | 'createdAt'>, who: string, role: string) {
    const newViolation: Violation = {
      ...violation,
      id: 'v-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.data.violations.unshift(newViolation);

    // Increment student violation count
    const student = this.data.students.find((s) => s.id === violation.studentId);
    if (student) {
      student.violationCount += 1;
    }

    this.addAuditLog(
      who,
      role,
      `Mencatat Pelanggaran: ${violation.incidentType} (${violation.studentName})`,
      violation.location,
      '-',
      `Kategori: ${violation.category} (Level ${violation.level})`
    );

    // AUTOMATION: If student has 3 or more violations, flag alert or prompt for Case
    if (student && student.violationCount >= 3) {
      this.addNotification(
        `Peringatan: Pola Pelanggaran Berulang`,
        `Santri ${student.name} telah memiliki ${student.violationCount} catatan pelanggaran. Disarankan pembinaan intensif atau Case Review.`,
        'ALERT',
        'student',
        student.id
      );
    } else {
      this.addNotification(
        `Pelanggaran Baru: ${violation.category}`,
        `${violation.studentName} tercatat melakukan pelanggaran: ${violation.incidentType}.`,
        'WARNING',
        'violation',
        newViolation.id
      );
    }

    this.save();
    return newViolation;
  }

  // COACHING MANAGEMENT (NO DEAD END)
  public addCoaching(coaching: Omit<Coaching, 'id' | 'createdAt'>, who: string, role: string) {
    const newCoaching: Coaching = {
      ...coaching,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.data.coachings.unshift(newCoaching);

    const student = this.data.students.find((s) => s.id === coaching.studentId);
    if (student) {
      student.coachingCount += 1;
    }

    this.addAuditLog(
      who,
      role,
      `Membuat Sesi Pembinaan: ${coaching.focusArea} (${coaching.studentName})`,
      'Ruang Pengasuhan',
      '-',
      `Level ${coaching.level} - Status: ${coaching.status}`
    );

    this.addNotification(
      `Sesi Pembinaan Dibuka`,
      `Pembinaan Level ${coaching.level} untuk ${coaching.studentName}: ${coaching.focusArea}.`,
      'INFO',
      'coaching',
      newCoaching.id
    );

    this.save();
    return newCoaching;
  }

  public updateCoaching(id: string, updates: Partial<Coaching>, who: string, role: string) {
    const c = this.data.coachings.find((item) => item.id === id);
    if (!c) return null;
    const oldStatus = c.status;
    Object.assign(c, updates, { updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) });

    this.addAuditLog(
      who,
      role,
      `Update Status Pembinaan (${c.studentName})`,
      'Ruang Pengasuhan',
      `Status: ${oldStatus}`,
      `Status: ${c.status}`
    );

    if (updates.status === 'RESOLVED') {
      this.addNotification(
        `Pembinaan Selesai`,
        `Pembinaan ${c.studentName} (${c.focusArea}) berhasil diselesaikan dengan hasil positif.`,
        'SUCCESS',
        'coaching',
        c.id
      );
    }

    this.save();
    return c;
  }

  // CASE MANAGEMENT
  public addCase(newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>, who: string, role: string) {
    const c: Case = {
      ...newCase,
      id: 'case-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.data.cases.unshift(c);
    this.addAuditLog(who, role, `Membuka Case Baru: ${c.code} - ${c.title}`, 'Kantor Pengasuhan', '-', `Status: ${c.status}`);
    this.save();
    return c;
  }

  public addCaseAction(caseId: string, action: { title: string; description: string; by: string }, who: string, role: string) {
    const c = this.data.cases.find((item) => item.id === caseId);
    if (!c) return null;
    const newAction = {
      id: 'ca-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      title: action.title,
      description: action.description,
      by: action.by,
    };
    c.timeline.push(newAction);
    c.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    this.addAuditLog(who, role, `Menambah Tindakan pada ${c.code}`, 'Case Review', '-', action.title);
    this.save();
    return c;
  }

  public updateCaseStatus(caseId: string, status: Case['status'], who: string, role: string) {
    const c = this.data.cases.find((item) => item.id === caseId);
    if (!c) return null;
    const old = c.status;
    c.status = status;
    c.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    this.addAuditLog(who, role, `Mengubah Status Case ${c.code}`, 'Kantor Pengasuhan', `Status: ${old}`, `Status: ${status}`);
    this.save();
    return c;
  }

  // APPRECIATION / POSITIVE BALANCE ENGINE
  public addAppreciation(app: Omit<Appreciation, 'id' | 'date' | 'time'>, who: string, role: string) {
    const newApp: Appreciation = {
      ...app,
      id: 'app-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      time: this.getCurrentClockTime(),
    };
    this.data.appreciations.unshift(newApp);

    const student = this.data.students.find((s) => s.id === app.studentId);
    if (student) {
      student.appreciationCount += 1;
    }

    this.addAuditLog(
      who,
      role,
      `Memberikan Apresiasi Karakter: ${app.category} (+${app.points} poin) kepada ${app.studentName}`,
      'Area Asrama / Masjid',
      '-',
      app.description
    );

    this.addNotification(
      `⭐ Apresiasi Karakter: ${app.studentName}`,
      `${app.studentName} mendapat apresiasi atas karakter ${app.category}: "${app.description}"`,
      'SUCCESS',
      'student',
      app.studentId
    );

    this.save();
    return newApp;
  }

  // HABIT TRACKER LOG
  public toggleHabit(studentId: string, habitKey: string, who: string, role: string) {
    const log = this.data.habitLogs[studentId];
    if (!log) return null;
    const item = log.habits.find((h) => h.key === habitKey);
    if (!item) return null;

    const cycle: ('DONE' | 'HALF' | 'MISSED' | 'NONE')[] = ['DONE', 'HALF', 'MISSED', 'NONE'];
    const nextIdx = (cycle.indexOf(item.status) + 1) % cycle.length;
    item.status = cycle[nextIdx];

    this.save();
    return log;
  }

  // FACILITY REPORTING
  public addFacilityTicket(ticket: Omit<FacilityTicket, 'id' | 'createdAt'>, who: string, role: string) {
    const newTicket: FacilityTicket = {
      ...ticket,
      id: 'fac-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.data.facilities.unshift(newTicket);
    this.addAuditLog(who, role, `Melaporkan Kerusakan Fasilitas: ${ticket.issue}`, ticket.areaOrRoom, '-', `Status: OPEN (Prioritas: ${ticket.priority})`);
    this.addNotification(
      `Laporan Kerusakan: ${ticket.areaOrRoom}`,
      ticket.issue,
      'WARNING',
      'facility',
      newTicket.id
    );
    this.save();
    return newTicket;
  }

  public updateFacilityStatus(id: string, status: FacilityTicket['status'], who: string, role: string) {
    const ticket = this.data.facilities.find((t) => t.id === id);
    if (!ticket) return null;
    const old = ticket.status;
    ticket.status = status;
    if (status === 'DONE') {
      ticket.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    this.addAuditLog(who, role, `Update Tiket Fasilitas ${ticket.code}`, ticket.areaOrRoom, `Status: ${old}`, `Status: ${status}`);
    this.save();
    return ticket;
  }

  // EMERGENCY REPORT 🚨
  public addIncident(incident: Omit<Incident, 'id' | 'createdAt'>, who: string, role: string) {
    const newIncident: Incident = {
      ...incident,
      id: 'inc-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    this.data.incidents.unshift(newIncident);
    this.addAuditLog(who, role, `🚨 LAPOR KEJADIAN DARURAT: ${incident.title}`, incident.location, '-', `Prioritas: ${incident.priority}`);
    this.addNotification(
      `🚨 KEJADIAN DARURAT: ${incident.title}`,
      `Lokasi: ${incident.location}. ${incident.chronology}`,
      'ALERT',
      'incident',
      newIncident.id
    );
    this.save();
    return newIncident;
  }

  public updateIncidentStatus(id: string, status: Incident['status'], who: string, role: string, resolutionNote?: string) {
    const inc = this.data.incidents.find((i) => i.id === id);
    if (!inc) return null;
    const old = inc.status;
    inc.status = status;
    if (status === 'RESOLVED') {
      inc.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      inc.resolvedBy = who;
      if (resolutionNote) {
        inc.actionTaken = (inc.actionTaken ? inc.actionTaken + ' | ' : '') + resolutionNote;
      }
      this.addNotification(
        `✅ Kejadian Selesai Ditangani: ${inc.title}`,
        `Kejadian ${inc.code} telah selesai ditangani oleh ${who}. Situasi kembali kondusif.`,
        'INFO',
        'incident',
        inc.id
      );
      // Mark existing incident alert notifications as read
      this.data.notifications.forEach((n) => {
        if (n.targetId === inc.id && n.type === 'ALERT') {
          n.read = true;
        }
      });
    }
    this.addAuditLog(who, role, `Update Status Kejadian ${inc.code}`, inc.location, `Status: ${old}`, `Status: ${status}`);
    this.save();
    return inc;
  }

  // HANDOVER ENGINE
  public recordHandover(handover: Omit<Handover, 'id' | 'timestamp' | 'isAcknowledged'>, who: string, role: string) {
    const newHandover: Handover = {
      ...handover,
      id: 'ho-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isAcknowledged: false,
    };
    this.data.handovers.unshift(newHandover);
    this.addAuditLog(who, role, `Membuat Catatan Handover Shift`, 'Pos Pengasuhan', '-', `Menuju: ${handover.toSupervisorName}`);
    this.addNotification(
      `Handover Shift Pengasuhan`,
      `${handover.fromSupervisorName} menyerahkan shift kepada ${handover.toSupervisorName}. Terdapat ${handover.pendingCoachingCount} pembinaan dan ${handover.attentionStudentsCount} santri perlu perhatian.`,
      'INFO',
      'handover',
      newHandover.id
    );
    this.save();
    return newHandover;
  }

  public acknowledgeHandover(id: string, who: string, role: string) {
    const ho = this.data.handovers.find((h) => h.id === id);
    if (!ho) return null;
    ho.isAcknowledged = true;
    ho.acknowledgedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    this.addAuditLog(who, role, `Acknowledge Handover Shift`, 'Pos Pengasuhan', 'Belum Diakui', 'Diakui Resmi');
    this.save();
    return ho;
  }

  // BATCH ATTENDANCE FOR AN ACTIVITY
  public recordBatchAttendance(activityId: string, activityName: string, records: { studentId: string; status: Student['status']; notes?: string }[], who: string, role: string) {
    const today = new Date().toISOString().slice(0, 10);
    const time = this.getCurrentClockTime();

    records.forEach((rec) => {
      const student = this.data.students.find((s) => s.id === rec.studentId);
      if (student) {
        student.status = rec.status;
        this.data.attendance.unshift({
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: rec.studentId,
          studentName: student.name,
          activityId,
          activityName,
          date: today,
          time,
          status: rec.status,
          notes: rec.notes || '',
        });
      }
    });

    this.addAuditLog(who, role, `Perekaman Presensi Masal: ${activityName} (${records.length} santri)`, 'Absensi Kegiatan', '-', `Sukses dicatat pada ${time}`);
    this.save();
    return true;
  }

  // SYSTEM STATS CALCULATOR
  public getSystemStats() {
    const students = this.data.students;
    const totalStudents = students.length;
    const presentStudents = students.filter((s) => s.status === 'HADIR').length;
    const permittedStudents = students.filter((s) => s.status === 'IZIN').length;
    const sickStudents = students.filter((s) => s.status === 'SAKIT').length;
    const alphaStudents = students.filter((s) => s.status === 'ALPA').length;

    const criticalIssuesCount = this.data.incidents.filter((i) => i.status !== 'RESOLVED' && i.priority === 'CRITICAL').length;
    const needsAttentionCount =
      this.data.students.filter((s) => s.status === 'TERLAMBAT' || s.violationCount >= 2).length +
      this.data.rooms.filter((r) => r.status === 'NEEDS_ATTENTION').length;
    const normalConditionCount = this.data.rooms.filter((r) => r.status === 'NORMAL').length;

    const activeCoachingCount = this.data.coachings.filter((c) => c.status !== 'RESOLVED').length;
    const unresolvedCasesCount = this.data.cases.filter((c) => c.status !== 'RESOLVED').length;
    const facilityTicketOpenCount = this.data.facilities.filter((f) => f.status !== 'DONE').length;
    const uninspectedRoomsCount = this.data.rooms.filter((r) => r.status === 'NEEDS_ATTENTION').length;

    // Averages
    const avgClean = Math.round(this.data.rooms.reduce((acc, r) => acc + r.scoreClean, 0) / (this.data.rooms.length || 1));
    const avgTidy = Math.round(this.data.rooms.reduce((acc, r) => acc + r.scoreTidy, 0) / (this.data.rooms.length || 1));
    const avgDiscipline = Math.round((presentStudents / (totalStudents || 1)) * 100);

    return {
      totalStudents,
      presentStudents,
      permittedStudents,
      sickStudents,
      alphaStudents,
      disciplineScore: avgDiscipline,
      cleanScore: avgClean,
      orderlyScore: avgTidy,
      criticalIssuesCount,
      needsAttentionCount,
      normalConditionCount,
      activeCoachingCount,
      unresolvedCasesCount,
      facilityTicketOpenCount,
      uninspectedRoomsCount,
    };
  }
}

export const db = new DatabaseStore();
