import {
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
  SystemStats,
  User,
  StudentHabitLog,
} from '../types.js';

const CACHE_KEY_PREFIX = 'almaa_cache_';

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const api = {
  // TIME ENGINE
  async getTime() {
    try {
      const res = await fetch('/api/time');
      const data = await res.json();
      setLocalCache('time', data);
      return data;
    } catch {
      return getLocalCache('time', {
        currentClock: '05:37',
        simulatedTime: '05:37',
        isSimulated: true,
      });
    }
  },

  async setSimulatedTime(time: string | null) {
    const res = await fetch('/api/time/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time }),
    });
    return res.json();
  },

  // STATS
  async getStats(): Promise<SystemStats> {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setLocalCache('stats', data);
      return data;
    } catch {
      return getLocalCache('stats', {
        totalStudents: 20,
        presentStudents: 18,
        permittedStudents: 1,
        sickStudents: 1,
        alphaStudents: 0,
        disciplineScore: 90,
        cleanScore: 86,
        orderlyScore: 88,
        criticalIssuesCount: 0,
        needsAttentionCount: 3,
        normalConditionCount: 3,
        activeCoachingCount: 2,
        unresolvedCasesCount: 1,
        facilityTicketOpenCount: 1,
        uninspectedRoomsCount: 1,
      });
    }
  },

  // USERS
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setLocalCache('users', data);
      return data;
    } catch {
      return getLocalCache('users', []);
    }
  },

  async createUser(user: Partial<User>, actorName: string, actorRole: string) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, actorName, actorRole }),
    });
    return res.json();
  },

  async updateUser(id: string, user: Partial<User>, actorName: string, actorRole: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, actorName, actorRole }),
    });
    return res.json();
  },

  async deleteUser(id: string, actorName: string, actorRole: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName, actorRole }),
    });
    return res.json();
  },

  // STUDENTS
  async getStudents(params?: { search?: string; roomId?: string; classId?: string; status?: string }): Promise<Student[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/students${query ? `?${query}` : ''}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error('Gagal memuat data santri dari server');
      }
      const data = await res.json();
      setLocalCache('students', data);
      return data;
    } catch {
      return getLocalCache('students', []);
    }
  },

  async createStudent(student: Partial<Student>, actorName: string, actorRole: string) {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, actorName, actorRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan data santri');
    }
    return data;
  },

  async updateStudent(id: string, student: Partial<Student>, actorName: string, actorRole: string) {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, actorName, actorRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memperbarui data santri');
    }
    return data;
  },

  async deleteStudent(id: string, actorName: string, actorRole: string) {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName, actorRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menghapus santri');
    }
    return data;
  },

  async bulkCreateStudents(students: Partial<Student>[], actorName: string, actorRole: string) {
    const res = await fetch('/api/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students, actorName, actorRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengimpor data santri');
    }
    return data;
  },

  async getStudent360(id: string) {
    try {
      const res = await fetch(`/api/students/${id}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateStudentStatus(id: string, status: Student['status'], who: string, role: string) {
    const res = await fetch(`/api/students/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, who, role }),
    });
    return res.json();
  },

  // ROOMS
  async getRooms(): Promise<Room[]> {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setLocalCache('rooms', data);
      return data;
    } catch {
      return getLocalCache('rooms', []);
    }
  },

  async inspectRoom(payload: any, who: string, role: string) {
    const res = await fetch('/api/rooms/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspection: payload, who, role }),
    });
    return res.json();
  },

  // AREAS
  async getAreas(): Promise<Area[]> {
    try {
      const res = await fetch('/api/areas');
      const data = await res.json();
      setLocalCache('areas', data);
      return data;
    } catch {
      return getLocalCache('areas', []);
    }
  },

  // ACTIVITIES & CHECKLISTS
  async getActivities(): Promise<ActivitySchedule[]> {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setLocalCache('activities', data);
      return data;
    } catch {
      return getLocalCache('activities', []);
    }
  },

  async updateActivity(id: string, activity: Partial<ActivitySchedule>, actorName: string, actorRole: string): Promise<{ success: boolean; activity: ActivitySchedule }> {
    const res = await fetch(`/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, actorName, actorRole }),
    });
    return res.json();
  },

  async createActivity(activity: Partial<ActivitySchedule>, actorName: string, actorRole: string): Promise<{ success: boolean; activity: ActivitySchedule }> {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, actorName, actorRole }),
    });
    return res.json();
  },

  async deleteActivity(id: string, actorName: string, actorRole: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/activities/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName, actorRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menghapus kegiatan');
    }
    return data;
  },

  async resetActivitiesDefault(actorName: string, actorRole: string): Promise<{ success: boolean; activities: ActivitySchedule[] }> {
    const res = await fetch('/api/activities/reset-default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName, actorRole }),
    });
    return res.json();
  },

  async recordChecklist(record: any, who: string, role: string): Promise<ChecklistRecord> {
    const res = await fetch('/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record, who, role }),
    });
    return res.json();
  },

  // ATTENDANCE
  async recordBatchAttendance(activityId: string, activityName: string, records: any[], who: string, role: string) {
    const res = await fetch('/api/attendance/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId, activityName, records, who, role }),
    });
    return res.json();
  },

  // VIOLATIONS
  async getViolations(): Promise<Violation[]> {
    try {
      const res = await fetch('/api/violations');
      const data = await res.json();
      setLocalCache('violations', data);
      return data;
    } catch {
      return getLocalCache('violations', []);
    }
  },

  async addViolation(violation: any, who: string, role: string): Promise<Violation> {
    const res = await fetch('/api/violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ violation, who, role }),
    });
    return res.json();
  },

  // COACHINGS
  async getCoachings(): Promise<Coaching[]> {
    try {
      const res = await fetch('/api/coachings');
      const data = await res.json();
      setLocalCache('coachings', data);
      return data;
    } catch {
      return getLocalCache('coachings', []);
    }
  },

  async addCoaching(coaching: any, who: string, role: string): Promise<Coaching> {
    const res = await fetch('/api/coachings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coaching, who, role }),
    });
    return res.json();
  },

  async updateCoaching(id: string, updates: Partial<Coaching>, who: string, role: string): Promise<Coaching> {
    const res = await fetch(`/api/coachings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, who, role }),
    });
    return res.json();
  },

  async resolveCoaching(id: string, who: string, role: string): Promise<Coaching> {
    return this.updateCoaching(id, { status: 'RESOLVED' }, who, role);
  },

  // CASES
  async getCases(): Promise<Case[]> {
    try {
      const res = await fetch('/api/cases');
      const data = await res.json();
      setLocalCache('cases', data);
      return data;
    } catch {
      return getLocalCache('cases', []);
    }
  },

  async addCase(caseData: any, who: string, role: string): Promise<Case> {
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseData, who, role }),
    });
    return res.json();
  },

  async addCaseAction(caseId: string, action: any, who: string, role: string): Promise<Case> {
    const res = await fetch(`/api/cases/${caseId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, who, role }),
    });
    return res.json();
  },

  async updateCaseStatus(caseId: string, status: Case['status'], who: string, role: string): Promise<Case> {
    const res = await fetch(`/api/cases/${caseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, who, role }),
    });
    return res.json();
  },

  // APPRECIATIONS
  async getAppreciations(): Promise<Appreciation[]> {
    try {
      const res = await fetch('/api/appreciations');
      const data = await res.json();
      setLocalCache('appreciations', data);
      return data;
    } catch {
      return getLocalCache('appreciations', []);
    }
  },

  async addAppreciation(appreciation: any, who: string, role: string): Promise<Appreciation> {
    const res = await fetch('/api/appreciations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appreciation, who, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menambahkan apresiasi');
    }
    return data;
  },

  // HABITS
  async getHabits(): Promise<Record<string, StudentHabitLog>> {
    try {
      const res = await fetch('/api/habits');
      const data = await res.json();
      setLocalCache('habits', data);
      return data;
    } catch {
      return getLocalCache('habits', {});
    }
  },

  async toggleHabit(studentId: string, habitKey: string, who: string, role: string) {
    const res = await fetch('/api/habits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, habitKey, who, role }),
    });
    return res.json();
  },

  // DUTY ROSTER & HANDOVERS
  async getDutyRosters(): Promise<DutyRoster[]> {
    try {
      const res = await fetch('/api/duty-rosters');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getHandovers(): Promise<Handover[]> {
    try {
      const res = await fetch('/api/handovers');
      return await res.json();
    } catch {
      return [];
    }
  },

  async recordHandover(handover: any, who: string, role: string): Promise<Handover> {
    const res = await fetch('/api/handovers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handover, who, role }),
    });
    return res.json();
  },

  async acknowledgeHandover(id: string, who: string, role: string): Promise<Handover> {
    const res = await fetch(`/api/handovers/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ who, role }),
    });
    return res.json();
  },

  // EMERGENCY INCIDENTS 🚨
  async getIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch('/api/incidents');
      return await res.json();
    } catch {
      return [];
    }
  },

  async addIncident(incident: any, who: string, role: string): Promise<Incident> {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident, who, role }),
    });
    return res.json();
  },

  async updateIncidentStatus(id: string, status: Incident['status'], who: string, role: string, resolutionNote?: string) {
    const res = await fetch(`/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, who, role, resolutionNote }),
    });
    return res.json();
  },

  // FACILITIES
  async getFacilities(): Promise<FacilityTicket[]> {
    try {
      const res = await fetch('/api/facilities');
      return await res.json();
    } catch {
      return [];
    }
  },

  async addFacilityTicket(ticket: any, who: string, role: string): Promise<FacilityTicket> {
    const res = await fetch('/api/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, who, role }),
    });
    return res.json();
  },

  async updateFacilityStatus(id: string, status: FacilityTicket['status'], who: string, role: string) {
    const res = await fetch(`/api/facilities/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, who, role }),
    });
    return res.json();
  },

  // NOTIFICATIONS
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch('/api/notifications');
      return await res.json();
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' });
  },

  // AUDIT LOGS
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch('/api/audit-logs');
      return await res.json();
    } catch {
      return [];
    }
  },

  // AI GEMINI SERVICES
  async getDailyAISummary(): Promise<string> {
    try {
      const res = await fetch('/api/ai/daily-summary', { method: 'POST' });
      const data = await res.json();
      return data.summary || 'Ringkasan tidak tersedia.';
    } catch (e: any) {
      return 'Gagal memuat ringkasan AI: ' + e.message;
    }
  },

  async getCoachingQuestions(studentName: string, violation: string, category: string): Promise<string[]> {
    try {
      const res = await fetch('/api/ai/coaching-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, violation, category }),
      });
      const data = await res.json();
      return data.questions || [];
    } catch {
      return [
        'Bagaimana kabar antum hari ini?',
        'Apa kendala yang antum hadapi?',
        'Langkah apa yang antum rencanakan untuk perbaikan?',
      ];
    }
  },
};
