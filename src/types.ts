export type UserRole = 'SUPER_ADMIN' | 'KOORDINATOR' | 'PENGASUH' | 'GURU' | 'PIMPINAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  phone: string;
  avatar?: string;
  assignedRoomIds: string[];
}

export const STUDENT_CLASSES = [
  'Kelas 7',
  'Kelas 8',
  'Kelas 9',
  'Kelas 10',
  'Kelas 11',
  'Kelas 12',
] as const;

export type StudentClass = typeof STUDENT_CLASSES[number];

export interface Student {
  id: string;
  nis: string;
  name: string;
  nickname: string;
  photo?: string;
  class: string;
  roomId: string;
  roomNumber: string;
  group: string;
  guardianName: string;
  guardianPhone: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA' | 'TERLAMBAT';
  attendanceRate: number;
  violationCount: number;
  coachingCount: number;
  appreciationCount: number;
  notes: string;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  floor: number;
  capacity: number;
  occupantCount: number;
  supervisorId: string;
  supervisorName: string;
  headStudentId: string;
  headStudentName: string;
  status: 'NORMAL' | 'NEEDS_ATTENTION' | 'CRITICAL';
  lastInspectionDate: string;
  scoreClean: number; // 0 - 100
  scoreTidy: number;
  scoreOrderly: number;
  scoreSafety: number;
  averageScore: number;
  facilities: string[];
}

export interface Area {
  id: string;
  name: string;
  type: string;
  picId: string;
  picName: string;
  inspectionSchedule: string;
  status: 'BERSIH' | 'PERLU_PERHATIAN' | 'KOTOR';
  lastCheckedAt: string;
  notes?: string;
}

export interface SOPItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface ActivitySchedule {
  id: string;
  timeStart: string; // e.g. "04:00"
  timeEnd: string;   // e.g. "04:15"
  name: string;
  category: 'IBADAH' | 'KEBERSIHAN' | 'BELAJAR' | 'ISTIRAHAT' | 'CHECKING' | 'HARIAN';
  sopTitle: string;
  sopItems: SOPItem[];
  isCurrent?: boolean;
  isNext?: boolean;
  isPassed?: boolean;
  hasCheckingDone?: boolean;
}

export interface ChecklistRecord {
  id: string;
  activityId: string;
  activityName: string;
  date: string;
  time: string;
  inspectorId: string;
  inspectorName: string;
  items: { id: string; label: string; checked: boolean }[];
  status: 'COMPLETE' | 'NEEDS_ATTENTION';
  notes: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  activityId: string;
  activityName: string;
  date: string;
  time: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'TERLAMBAT' | 'ALPA';
  notes: string;
}

export type ViolationCategory =
  | 'DISIPLIN'
  | 'KEBERSIHAN'
  | 'KERAPIHAN'
  | 'KETERTIBAN'
  | 'ADAB'
  | 'KEAMANAN';

export interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  date: string;
  time: string;
  location: string;
  category: ViolationCategory;
  incidentType: string;
  chronology: string;
  witness?: string;
  supervisorId: string;
  supervisorName: string;
  level: 1 | 2 | 3 | 4;
  actionTaken: string;
  status: 'OPEN' | 'FOLLOW_UP' | 'RESOLVED';
  caseId?: string;
  createdAt: string;
}

export interface Coaching {
  id: string;
  studentId: string;
  studentName: string;
  violationId?: string;
  level: 1 | 2 | 3 | 4;
  supervisorId: string;
  supervisorName: string;
  date: string;
  focusArea: string;
  discussionPoints: string;
  agreement: string;
  targetDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'MONITORING' | 'RESOLVED';
  followUpNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CaseAction {
  id: string;
  date: string;
  title: string;
  description: string;
  by: string;
}

export interface Case {
  id: string;
  code: string;
  studentId: string;
  studentName: string;
  title: string;
  problem: string;
  category: ViolationCategory;
  status: 'OPEN' | 'MONITORING' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
  timeline: CaseAction[];
}

export interface Appreciation {
  id: string;
  studentId: string;
  studentName: string;
  category: 'KEMANDIRIAN' | 'ADAB' | 'KEBERSIHAN' | 'KERAPIHAN' | 'DISIPLIN' | 'KEPEDULIAN';
  description: string;
  points: number;
  supervisorId: string;
  supervisorName: string;
  date: string;
  time: string;
}

export interface HabitItem {
  key: string;
  label: string;
  status: 'DONE' | 'HALF' | 'MISSED' | 'NONE';
}

export interface StudentHabitLog {
  studentId: string;
  studentName?: string;
  date: string;
  habits: HabitItem[];
}

export interface RoomInspection {
  id: string;
  roomId: string;
  roomNumber: string;
  inspectorId: string;
  inspectorName: string;
  date: string;
  time: string;
  cleanChecks: { id: string; label: string; passed: boolean }[];
  tidyChecks: { id: string; label: string; passed: boolean }[];
  orderlyChecks: { id: string; label: string; passed: boolean }[];
  safetyChecks: { id: string; label: string; passed: boolean }[];
  scoreClean: number;
  scoreTidy: number;
  scoreOrderly: number;
  scoreSafety: number;
  overallScore: number;
  status: 'SOP COMPLETE' | 'NEEDS ATTENTION' | 'CRITICAL';
  notes: string;
  createdAt: string;
}

export interface DutyRoster {
  id: string;
  shift: string; // e.g. "04.00–07.00"
  supervisorId: string;
  supervisorName: string;
  date: string;
  isCurrentShift?: boolean;
}

export interface Handover {
  id: string;
  fromSupervisorId: string;
  fromSupervisorName: string;
  toSupervisorId: string;
  toSupervisorName: string;
  timestamp: string;
  pendingCoachingCount: number;
  pendingFacilityCount: number;
  attentionStudentsCount: number;
  shiftNotes: string;
  acknowledgedAt?: string;
  isAcknowledged: boolean;
}

export interface Incident {
  id: string;
  code: string;
  title: string;
  location: string;
  date?: string;
  time?: string;
  studentIds?: string[];
  studentNames?: string[];
  incidentType?: string;
  category?: string;
  chronology: string;
  initialAction?: string;
  actionTaken?: string;
  picId?: string;
  picName?: string;
  reportedBy?: string;
  reportedAt?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'RESPONDING' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface FacilityTicket {
  id: string;
  code: string;
  areaOrRoom: string;
  issue: string;
  reporterName: string;
  picTechnician: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'PROCESS' | 'DONE';
  createdAt: string;
  resolvedAt?: string;
  notes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'WARNING' | 'SUCCESS' | 'INFO';
  timestamp: string;
  read: boolean;
  actionType?: string;
  targetId?: string;
}

export interface AuditLog {
  id: string;
  who: string;
  role: string;
  what: string;
  when: string;
  where: string;
  before?: string;
  after?: string;
}

export interface SystemStats {
  totalStudents: number;
  presentStudents: number;
  permittedStudents: number;
  sickStudents: number;
  alphaStudents: number;
  disciplineScore: number; // 0-100
  cleanScore: number;
  orderlyScore: number;
  criticalIssuesCount: number;
  needsAttentionCount: number;
  normalConditionCount: number;
  activeCoachingCount: number;
  unresolvedCasesCount: number;
  facilityTicketOpenCount: number;
  uninspectedRoomsCount: number;
}
