import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateDailyAISummary, generateCoachingQuestions } from './server/gemini.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API HEALTH
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Almaa Care OS Server',
      timestamp: new Date().toISOString(),
    });
  });

  // PREVENT BROWSER CACHING FOR ALL DYNAMIC API ROUTES
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // TIME ENGINE
  app.get('/api/time', (req, res) => {
    const simulated = db.getSimulatedTime();
    const currentClock = db.getCurrentClockTime();

    // Determine active activity and next activity from current clock
    const [h, m] = currentClock.split(':').map(Number);
    const currentMinutes = h * 60 + m;

    const activities = db.getActivities().map((act) => {
      const [startH, startM] = act.timeStart.split(':').map(Number);
      const [endH, endM] = act.timeEnd.split(':').map(Number);

      let startMin = startH * 60 + startM;
      let endMin = endH * 60 + endM;

      // Handle overnight shift (e.g. 21:30 - 04:00)
      let isCurrent = false;
      let isPassed = false;
      let isNext = false;

      if (endMin < startMin) {
        // spans midnight
        if (currentMinutes >= startMin || currentMinutes < endMin) {
          isCurrent = true;
        } else if (currentMinutes >= endMin && currentMinutes < startMin) {
          isPassed = false;
        }
      } else {
        if (currentMinutes >= startMin && currentMinutes < endMin) {
          isCurrent = true;
        } else if (currentMinutes >= endMin) {
          isPassed = true;
        }
      }

      return {
        ...act,
        isCurrent,
        isPassed,
      };
    });

    // Determine which is current and which is next
    const currentAct = activities.find((a) => a.isCurrent) || activities[0];
    const currentIndex = activities.findIndex((a) => a.id === currentAct.id);
    const nextAct = activities[(currentIndex + 1) % activities.length];

    // Find supervisor currently on duty
    const dutyRosters = db.getDutyRosters();
    const activeDuty = dutyRosters.find((d) => {
      // e.g. "04.00–07.00"
      const parts = d.shift.replace('.', ':').replace('.', ':').split('–');
      if (parts.length === 2) {
        const [sh, sm] = parts[0].trim().split(':').map(Number);
        const [eh, em] = parts[1].trim().split(':').map(Number);
        const sMin = sh * 60 + sm;
        const eMin = eh * 60 + em;
        if (eMin < sMin) {
          return currentMinutes >= sMin || currentMinutes < eMin;
        }
        return currentMinutes >= sMin && currentMinutes < eMin;
      }
      return false;
    }) || dutyRosters[0];

    res.json({
      currentClock,
      simulatedTime: simulated,
      isSimulated: Boolean(simulated),
      activeActivity: currentAct,
      nextActivity: nextAct,
      supervisorOnDuty: activeDuty,
    });
  });

  app.post('/api/time/set', (req, res) => {
    const { time } = req.body;
    db.setSimulatedTime(time || null);
    db.addAuditLog(
      'System',
      'ADMIN',
      time ? `Set Waktu Simulasi: ${time}` : 'Reset Waktu ke Jam Nyata',
      'Time Engine',
      '-',
      time || 'Live Realtime Clock'
    );
    res.json({ success: true, currentClock: db.getCurrentClockTime() });
  });

  // STATS & OVERVIEW
  app.get('/api/stats', (req, res) => {
    const stats = db.getSystemStats();
    res.json(stats);
  });

  // USERS & ROLES
  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  // USERS / PENGURUS CRUD (SUPER ADMIN)
  app.post('/api/users', (req, res) => {
    const { user, actorName, actorRole } = req.body;
    if (!user || !user.name) {
      return res.status(400).json({ error: 'Nama pengurus wajib diisi' });
    }
    const created = db.addUser(user, actorName, actorRole);
    res.json({ success: true, user: created });
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { user, actorName, actorRole } = req.body;
    const updated = db.updateUser(id, user, actorName, actorRole);
    if (!updated) {
      return res.status(404).json({ error: 'Pengurus tidak ditemukan' });
    }
    res.json({ success: true, user: updated });
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { actorName, actorRole } = req.body;
    const deleted = db.deleteUser(id, actorName, actorRole);
    if (!deleted) {
      return res.status(404).json({ error: 'Pengurus tidak ditemukan' });
    }
    res.json({ success: true });
  });

  // STUDENTS
  app.get('/api/students', (req, res) => {
    const { search, roomId, classId, status } = req.query;
    let list = db.getStudents();

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.nickname.toLowerCase().includes(q) ||
          s.roomNumber.toLowerCase().includes(q)
      );
    }

    if (roomId) {
      list = list.filter((s) => s.roomId === roomId || s.roomNumber === roomId);
    }

    if (classId) {
      list = list.filter((s) => s.class === classId);
    }

    if (status) {
      list = list.filter((s) => s.status === status);
    }

    res.json(list);
  });

  // CREATE STUDENT (SUPER ADMIN)
  app.post('/api/students', (req, res) => {
    const { student, actorName, actorRole } = req.body;
    if (!student || !student.name || !student.name.trim()) {
      return res.status(400).json({ error: 'Nama santri wajib diisi' });
    }
    const created = db.addStudent(student, actorName, actorRole);
    res.json({ success: true, student: created });
  });

  // BULK CREATE STUDENTS (SUPER ADMIN)
  app.post('/api/students/bulk', (req, res) => {
    const { students, actorName, actorRole } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Daftar santri tidak boleh kosong' });
    }
    const created = db.bulkAddStudents(students, actorName, actorRole);
    res.json({ success: true, count: created.length, students: created });
  });

  // UPDATE STUDENT (SUPER ADMIN)
  app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const { student, actorName, actorRole } = req.body;
    const updated = db.updateStudent(id, student, actorName, actorRole);
    if (!updated) {
      return res.status(404).json({ error: 'Santri tidak ditemukan' });
    }
    res.json({ success: true, student: updated });
  });

  // DELETE STUDENT (SUPER ADMIN)
  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const { actorName, actorRole } = req.body;
    const deleted = db.deleteStudent(id, actorName, actorRole);
    if (!deleted) {
      return res.status(404).json({ error: 'Santri tidak ditemukan' });
    }
    res.json({ success: true });
  });

  app.get('/api/students/:id', (req, res) => {
    const student = db.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Gather Student 360 data
    const violations = db.getViolations().filter((v) => v.studentId === student.id);
    const coachings = db.getCoachings().filter((c) => c.studentId === student.id);
    const appreciations = db.getAppreciations().filter((a) => a.studentId === student.id);
    const attendance = db.getAttendance().filter((a) => a.studentId === student.id);
    const habit = db.getHabitLogs()[student.id] || null;
    const cases = db.getCases().filter((cs) => cs.studentId === student.id);

    res.json({
      student,
      violations,
      coachings,
      appreciations,
      attendance,
      habit,
      cases,
    });
  });

  app.patch('/api/students/:id/status', (req, res) => {
    const { status, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const updated = db.updateStudentStatus(req.params.id, status, who, role);
    if (!updated) {
      return res.status(404).json({ error: 'Santri tidak ditemukan' });
    }
    res.json(updated);
  });

  // ROOMS
  app.get('/api/rooms', (req, res) => {
    res.json(db.getRooms());
  });

  app.post('/api/rooms/inspect', (req, res) => {
    const { inspection, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    if (!inspection || !inspection.roomId) {
      return res.status(400).json({ error: 'Invalid inspection payload' });
    }
    const record = db.recordRoomInspection(inspection, who, role);
    res.json(record);
  });

  // AREAS
  app.get('/api/areas', (req, res) => {
    res.json(db.getAreas());
  });

  // ACTIVITIES & CHECKLISTS
  app.get('/api/activities', (req, res) => {
    res.json(db.getActivities());
  });

  // UPDATE ACTIVITY (SUPER_ADMIN)
  app.put('/api/activities/:id', (req, res) => {
    const { id } = req.params;
    const { activity, actorName, actorRole } = req.body;

    const updated = db.updateActivity(id, activity);
    if (!updated) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    db.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Mengubah jadwal kegiatan "${updated.name}"`,
      `Jadwal 24 Jam (${updated.timeStart}-${updated.timeEnd})`,
      '',
      `SOP: ${updated.sopTitle}`
    );

    res.json({ success: true, activity: updated });
  });

  // ADD NEW ACTIVITY (SUPER_ADMIN)
  app.post('/api/activities', (req, res) => {
    const { activity, actorName, actorRole } = req.body;
    if (!activity || !activity.name || !activity.timeStart) {
      return res.status(400).json({ error: 'Data kegiatan tidak lengkap' });
    }

    const newActivity = {
      ...activity,
      id: activity.id || `act-${Date.now()}`,
      sopItems: activity.sopItems || [],
    };

    const created = db.addActivity(newActivity);

    db.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Menambahkan jadwal kegiatan baru "${created.name}"`,
      `Jadwal 24 Jam (${created.timeStart}-${created.timeEnd})`,
      '-',
      `Kategori: ${created.category}`
    );

    res.json({ success: true, activity: created });
  });

  // DELETE ACTIVITY (SUPER_ADMIN)
  app.delete('/api/activities/:id', (req, res) => {
    const { id } = req.params;
    const { actorName, actorRole } = req.body || {};

    const existing = db.getActivities().find((a) => a.id === id);
    const deleted = db.deleteActivity(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    db.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      `Menghapus jadwal kegiatan "${existing?.name || id}"`,
      'Jadwal 24 Jam',
      existing?.name || id,
      'DIHAPUS'
    );

    res.json({ success: true });
  });

  // RESET ACTIVITIES TO DEFAULT (SUPER_ADMIN)
  app.post('/api/activities/reset-default', (req, res) => {
    const { actorName, actorRole } = req.body;
    const resetList = db.resetActivitiesToDefault();

    db.addAuditLog(
      actorName || 'Super Admin',
      actorRole || 'SUPER_ADMIN',
      'Reset Jadwal & SOP ke Standar Default Pesantren',
      'Master Database Jadwal',
      'Custom Schedule',
      'Default Pesantren (11 Sesi)'
    );

    res.json({ success: true, activities: resetList });
  });

  app.post('/api/checklists', (req, res) => {
    const { record, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    if (!record || !record.activityId) {
      return res.status(400).json({ error: 'Invalid checklist payload' });
    }
    const saved = db.recordChecklist(record, who, role);
    res.json(saved);
  });

  app.get('/api/checklists', (req, res) => {
    res.json(db.getChecklists());
  });

  // ATTENDANCE BATCH
  app.get('/api/attendance', (req, res) => {
    res.json(db.getAttendance());
  });

  app.post('/api/attendance/batch', (req, res) => {
    const { activityId, activityName, records, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    db.recordBatchAttendance(activityId, activityName, records || [], who, role);
    res.json({ success: true, count: records?.length || 0 });
  });

  // VIOLATIONS
  app.get('/api/violations', (req, res) => {
    res.json(db.getViolations());
  });

  app.post('/api/violations', (req, res) => {
    const { violation, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    if (!violation || !violation.studentId) {
      return res.status(400).json({ error: 'Invalid violation payload' });
    }
    const saved = db.addViolation(violation, who, role);
    res.json(saved);
  });

  // COACHINGS
  app.get('/api/coachings', (req, res) => {
    res.json(db.getCoachings());
  });

  app.post('/api/coachings', (req, res) => {
    const { coaching, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    if (!coaching || !coaching.studentId) {
      return res.status(400).json({ error: 'Invalid coaching payload' });
    }
    const saved = db.addCoaching(coaching, who, role);
    res.json(saved);
  });

  app.patch('/api/coachings/:id', (req, res) => {
    const { updates, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const updated = db.updateCoaching(req.params.id, updates || {}, who, role);
    if (!updated) {
      return res.status(404).json({ error: 'Coaching not found' });
    }
    res.json(updated);
  });

  // CASES
  app.get('/api/cases', (req, res) => {
    res.json(db.getCases());
  });

  app.post('/api/cases', (req, res) => {
    const { caseData, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const saved = db.addCase(caseData, who, role);
    res.json(saved);
  });

  app.post('/api/cases/:id/action', (req, res) => {
    const { action, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const updated = db.addCaseAction(req.params.id, action, who, role);
    if (!updated) return res.status(404).json({ error: 'Case not found' });
    res.json(updated);
  });

  app.patch('/api/cases/:id/status', (req, res) => {
    const { status, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const updated = db.updateCaseStatus(req.params.id, status, who, role);
    if (!updated) return res.status(404).json({ error: 'Case not found' });
    res.json(updated);
  });

  // APPRECIATIONS
  app.get('/api/appreciations', (req, res) => {
    res.json(db.getAppreciations());
  });

  app.post('/api/appreciations', (req, res) => {
    const { appreciation, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    if (!appreciation || !appreciation.studentId) {
      return res.status(400).json({ error: 'Invalid appreciation payload' });
    }
    const saved = db.addAppreciation(appreciation, who, role);
    res.json(saved);
  });

  // HABIT TRACKING
  app.get('/api/habits', (req, res) => {
    res.json(db.getHabitLogs());
  });

  app.post('/api/habits/toggle', (req, res) => {
    const { studentId, habitKey, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const updated = db.toggleHabit(studentId, habitKey, who, role);
    if (!updated) return res.status(404).json({ error: 'Habit log not found' });
    res.json(updated);
  });

  // DUTY ROSTER & HANDOVERS
  app.get('/api/duty-rosters', (req, res) => {
    res.json(db.getDutyRosters());
  });

  app.get('/api/handovers', (req, res) => {
    res.json(db.getHandovers());
  });

  app.post('/api/handovers', (req, res) => {
    const { handover, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const saved = db.recordHandover(handover, who, role);
    res.json(saved);
  });

  app.post('/api/handovers/:id/acknowledge', (req, res) => {
    const { who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const ack = db.acknowledgeHandover(req.params.id, who, role);
    if (!ack) return res.status(404).json({ error: 'Handover not found' });
    res.json(ack);
  });

  // EMERGENCY INCIDENTS 🚨
  app.get('/api/incidents', (req, res) => {
    res.json(db.getIncidents());
  });

  app.post('/api/incidents', (req, res) => {
    const { incident, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const saved = db.addIncident(incident, who, role);
    res.json(saved);
  });

  app.patch('/api/incidents/:id/status', (req, res) => {
    const { status, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH', resolutionNote } = req.body;
    const updated = db.updateIncidentStatus(req.params.id, status, who, role, resolutionNote);
    if (!updated) return res.status(404).json({ error: 'Incident not found' });
    res.json(updated);
  });

  // FACILITIES
  app.get('/api/facilities', (req, res) => {
    res.json(db.getFacilities());
  });

  app.post('/api/facilities', (req, res) => {
    const { ticket, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const saved = db.addFacilityTicket(ticket, who, role);
    res.json(saved);
  });

  app.patch('/api/facilities/:id/status', (req, res) => {
    const { status, who = 'Ust. Ahmad Fauzi', role = 'PENGASUH' } = req.body;
    const updated = db.updateFacilityStatus(req.params.id, status, who, role);
    if (!updated) return res.status(404).json({ error: 'Ticket not found' });
    res.json(updated);
  });

  // NOTIFICATIONS
  app.get('/api/notifications', (req, res) => {
    res.json(db.getNotifications());
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    const notifs = db.getNotifications();
    const item = notifs.find((n) => n.id === req.params.id);
    if (item) item.read = true;
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    const notifs = db.getNotifications();
    notifs.forEach((n) => (n.read = true));
    res.json({ success: true });
  });

  // AUDIT LOGS
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.getAuditLogs());
  });

  // AI ENDPOINTS (GEMINI API SERVER-SIDE)
  app.post('/api/ai/daily-summary', async (req, res) => {
    try {
      const stats = db.getSystemStats();
      const date = new Date().toISOString().slice(0, 10);
      const summary = await generateDailyAISummary({
        date,
        stats,
        activities: db.getActivities(),
        violations: db.getViolations(),
        coachings: db.getCoachings(),
        rooms: db.getRooms(),
        incidents: db.getIncidents(),
      });
      res.json({ summary });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal membuat ringkasan AI' });
    }
  });

  app.post('/api/ai/coaching-questions', async (req, res) => {
    try {
      const { studentName, violation, category } = req.body;
      const questions = await generateCoachingQuestions(studentName || 'Santri', violation || 'Pelanggaran Disiplin', category || 'DISIPLIN');
      res.json({ questions });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal menghasilkan pertanyaan pembinaan' });
    }
  });

  // EXPORT DATA (CSV / JSON)
  app.get('/api/export/report', (req, res) => {
    const stats = db.getSystemStats();
    const students = db.getStudents();
    const violations = db.getViolations();
    const coachings = db.getCoachings();
    const rooms = db.getRooms();

    const data = {
      pesantren: 'Pondok Pesantren Almaa Parung',
      sistem: 'Almaa Care OS',
      generatedAt: new Date().toISOString(),
      stats,
      rooms,
      violations,
      coachings,
      studentsCount: students.length,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="almaa_report.json"');
    res.send(JSON.stringify(data, null, 2));
  });

  // VITE MIDDLEWARE OR STATIC SERVING
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Almaa Care OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
