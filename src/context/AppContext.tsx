import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Student,
  Room,
  Area,
  ActivitySchedule,
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
  StudentHabitLog,
} from '../types.js';
import { api } from '../services/api.js';

interface AppContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // TIME ENGINE
  currentClock: string;
  isSimulatedTime: boolean;
  simulatedTimeVal: string | null;
  activeActivity: ActivitySchedule | null;
  nextActivity: ActivitySchedule | null;
  supervisorOnDuty: DutyRoster | null;
  setTimeTravel: (time: string | null) => Promise<void>;

  // DATA
  stats: SystemStats | null;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  rooms: Room[];
  areas: Area[];
  activities: ActivitySchedule[];
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
  habits: Record<string, StudentHabitLog>;

  // STATUS & CONNECTIVITY
  isOnline: boolean;
  isSyncing: boolean;
  refreshAllData: () => Promise<void>;

  // MODALS
  openStudent360: (studentId: string) => void;
  selectedStudentId: string | null;
  closeStudent360: () => void;

  openSOPChecklist: (activity?: ActivitySchedule) => void;
  selectedActivityForChecklist: ActivitySchedule | null;
  closeSOPChecklist: () => void;

  openRoomInspect: (roomId?: string) => void;
  selectedRoomIdForInspect: string | null;
  closeRoomInspect: () => void;

  isManageScheduleOpen: boolean;
  editingActivity: ActivitySchedule | null;
  openManageSchedule: (activity?: ActivitySchedule | null) => void;
  closeManageSchedule: () => void;

  // SUPER ADMIN MASTER DATA (STUDENTS & STAFF)
  isManageEntitiesOpen: boolean;
  manageEntitiesTab: 'STUDENTS' | 'STAFF' | 'BULK';
  manageEntitiesMode: 'ADD' | 'EDIT' | 'LIST';
  editingStudent: Student | null;
  editingStaff: User | null;
  openManageStudents: (student?: Student | null, mode?: 'ADD' | 'EDIT' | 'LIST') => void;
  openManageStaff: (staff?: User | null) => void;
  openManageBulk: () => void;
  closeManageEntities: () => void;

  isNewViolationOpen: boolean;
  openNewViolation: (preselectedStudentId?: string) => void;
  closeNewViolation: () => void;

  isNewCoachingOpen: boolean;
  openNewCoaching: (preselectedStudentId?: string, violationId?: string) => void;
  closeNewCoaching: () => void;

  isNewAppreciationOpen: boolean;
  openNewAppreciation: (preselectedStudentId?: string) => void;
  closeNewAppreciation: () => void;

  isEmergencyReportOpen: boolean;
  openEmergencyReport: () => void;
  closeEmergencyReport: () => void;

  isFacilityReportOpen: boolean;
  preselectedFacilityLocation: string | null;
  openFacilityReport: (areaOrRoom?: string) => void;
  closeFacilityReport: () => void;

  isHandoverOpen: boolean;
  openHandover: () => void;
  closeHandover: () => void;

  isBatchAttendanceOpen: boolean;
  openBatchAttendance: (activityId?: string) => void;
  closeBatchAttendance: () => void;

  isGlobalSearchOpen: boolean;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;

  preselectedStudentId: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u-superadmin',
    name: 'Hendra Syam (Super Admin)',
    email: 'hendrasyambasri@gmail.com',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin / Master Control',
    phone: '0812-3456-7890',
    avatar: '',
    assignedRoomIds: ['room-1', 'room-2', 'room-3', 'room-4'],
  });

  const [activeTab, setActiveTab] = useState<string>('home');

  // TIME ENGINE (Real-Time WIB Asia/Jakarta by Default)
  const getInitialWIB = () => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
    } catch {
      return '14:39';
    }
  };

  const [currentClock, setCurrentClock] = useState<string>(getInitialWIB());
  const [isSimulatedTime, setIsSimulatedTime] = useState<boolean>(false);
  const [simulatedTimeVal, setSimulatedTimeVal] = useState<string | null>(null);
  const [activeActivity, setActiveActivity] = useState<ActivitySchedule | null>(null);
  const [nextActivity, setNextActivity] = useState<ActivitySchedule | null>(null);
  const [supervisorOnDuty, setSupervisorOnDuty] = useState<DutyRoster | null>(null);

  // DATA
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [activities, setActivities] = useState<ActivitySchedule[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [coachings, setCoachings] = useState<Coaching[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [dutyRosters, setDutyRosters] = useState<DutyRoster[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [facilities, setFacilities] = useState<FacilityTicket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [habits, setHabits] = useState<Record<string, StudentHabitLog>>({});

  // ONLINE/SYNC
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // MODAL STATES
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedActivityForChecklist, setSelectedActivityForChecklist] = useState<ActivitySchedule | null>(null);
  const [selectedRoomIdForInspect, setSelectedRoomIdForInspect] = useState<string | null>(null);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | null>(null);

  const [isNewViolationOpen, setIsNewViolationOpen] = useState(false);
  const [isNewCoachingOpen, setIsNewCoachingOpen] = useState(false);
  const [isNewAppreciationOpen, setIsNewAppreciationOpen] = useState(false);
  const [isEmergencyReportOpen, setIsEmergencyReportOpen] = useState(false);
  const [isFacilityReportOpen, setIsFacilityReportOpen] = useState(false);
  const [preselectedFacilityLocation, setPreselectedFacilityLocation] = useState<string | null>(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isBatchAttendanceOpen, setIsBatchAttendanceOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isManageScheduleOpen, setIsManageScheduleOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivitySchedule | null>(null);

  // SUPER ADMIN MASTER DATA MODAL (STUDENTS & STAFF)
  const [isManageEntitiesOpen, setIsManageEntitiesOpen] = useState(false);
  const [manageEntitiesTab, setManageEntitiesTab] = useState<'STUDENTS' | 'STAFF' | 'BULK'>('STUDENTS');
  const [manageEntitiesMode, setManageEntitiesMode] = useState<'ADD' | 'EDIT' | 'LIST'>('ADD');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // FETCH ALL DATA SAFELY WITH PROMISE.ALLSETTLED
  const refreshAllData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const results = await Promise.allSettled([
        api.getTime(),
        api.getStats(),
        api.getUsers(),
        api.getStudents(),
        api.getRooms(),
        api.getAreas(),
        api.getActivities(),
        api.getViolations(),
        api.getCoachings(),
        api.getCases(),
        api.getAppreciations(),
        api.getDutyRosters(),
        api.getHandovers(),
        api.getIncidents(),
        api.getFacilities(),
        api.getNotifications(),
        api.getAuditLogs(),
        api.getHabits(),
      ]);

      const [
        timeRes,
        statsRes,
        usersRes,
        studentsRes,
        roomsRes,
        areasRes,
        activitiesRes,
        violationsRes,
        coachingsRes,
        casesRes,
        appreciationsRes,
        dutyRostersRes,
        handoversRes,
        incidentsRes,
        facilitiesRes,
        notificationsRes,
        auditLogsRes,
        habitsRes,
      ] = results;

      if (timeRes.status === 'fulfilled' && timeRes.value) {
        const timeData = timeRes.value;
        setCurrentClock(timeData.currentClock || '05:37');
        setIsSimulatedTime(Boolean(timeData.isSimulated));
        setSimulatedTimeVal(timeData.simulatedTime);
        setActiveActivity(timeData.activeActivity);
        setNextActivity(timeData.nextActivity);
        setSupervisorOnDuty(timeData.supervisorOnDuty);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value);
      if (usersRes.status === 'fulfilled' && usersRes.value && usersRes.value.length > 0) setUsers(usersRes.value);
      if (studentsRes.status === 'fulfilled' && studentsRes.value) setStudents(studentsRes.value);
      if (roomsRes.status === 'fulfilled' && roomsRes.value) setRooms(roomsRes.value);
      if (areasRes.status === 'fulfilled' && areasRes.value) setAreas(areasRes.value);
      if (activitiesRes.status === 'fulfilled' && activitiesRes.value) setActivities(activitiesRes.value);
      if (violationsRes.status === 'fulfilled' && violationsRes.value) setViolations(violationsRes.value);
      if (coachingsRes.status === 'fulfilled' && coachingsRes.value) setCoachings(coachingsRes.value);
      if (casesRes.status === 'fulfilled' && casesRes.value) setCases(casesRes.value);
      if (appreciationsRes.status === 'fulfilled' && appreciationsRes.value) setAppreciations(appreciationsRes.value);
      if (dutyRostersRes.status === 'fulfilled' && dutyRostersRes.value) setDutyRosters(dutyRostersRes.value);
      if (handoversRes.status === 'fulfilled' && handoversRes.value) setHandovers(handoversRes.value);
      if (incidentsRes.status === 'fulfilled' && incidentsRes.value) setIncidents(incidentsRes.value);
      if (facilitiesRes.status === 'fulfilled' && facilitiesRes.value) setFacilities(facilitiesRes.value);
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value) setNotifications(notificationsRes.value);
      if (auditLogsRes.status === 'fulfilled' && auditLogsRes.value) setAuditLogs(auditLogsRes.value);
      if (habitsRes.status === 'fulfilled' && habitsRes.value) setHabits(habitsRes.value);
    } catch (err) {
      console.warn('Error refreshing data from server:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();

    const handleOnline = () => {
      setIsOnline(true);
      refreshAllData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Keyboard shortcut for Global Search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [refreshAllData]);

  // LIVE CLOCK TICKER (When using real time)
  useEffect(() => {
    if (isSimulatedTime) return;
    const tick = () => {
      try {
        const nowWib = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setCurrentClock(nowWib);
      } catch (e) {
        // fallback
      }
    };
    tick();
    const interval = setInterval(tick, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [isSimulatedTime]);

  // TIME TRAVEL DISPATCHER
  const setTimeTravel = async (time: string | null) => {
    await api.setSimulatedTime(time);
    await refreshAllData();
  };

  // SWITCH USER ROLE
  const switchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role) || {
      id: 'u-temp',
      name: role === 'KOORDINATOR' ? 'Ust. Ridwan Kamiludin, M.Pd.' : role === 'PIMPINAN' ? 'K.H. Abdullah Syafi\'i' : role === 'GURU' ? 'Ustadzah Sarah Aminah' : 'Administrator Almaa',
      email: `${role.toLowerCase()}@almaa.sch.id`,
      role,
      roleLabel: role,
      phone: '0812-3344-5566',
      avatar: '',
      assignedRoomIds: ['room-1', 'room-2', 'room-3', 'room-4'],
    };
    setCurrentUser(target);
  };

  // MODAL HANDLERS
  const openStudent360 = (id: string) => setSelectedStudentId(id);
  const closeStudent360 = () => setSelectedStudentId(null);

  const openSOPChecklist = (activity?: ActivitySchedule) => {
    setSelectedActivityForChecklist(activity || activeActivity || activities[0] || null);
  };
  const closeSOPChecklist = () => setSelectedActivityForChecklist(null);

  const openRoomInspect = (roomId?: string) => {
    setSelectedRoomIdForInspect(roomId || rooms[0]?.id || 'room-1');
  };
  const closeRoomInspect = () => setSelectedRoomIdForInspect(null);

  const openNewViolation = (studentId?: string) => {
    setPreselectedStudentId(studentId || null);
    setIsNewViolationOpen(true);
  };
  const closeNewViolation = () => {
    setIsNewViolationOpen(false);
    setPreselectedStudentId(null);
  };

  const openNewCoaching = (studentId?: string) => {
    setPreselectedStudentId(studentId || null);
    setIsNewCoachingOpen(true);
  };
  const closeNewCoaching = () => {
    setIsNewCoachingOpen(false);
    setPreselectedStudentId(null);
  };

  const openNewAppreciation = (studentId?: string) => {
    setPreselectedStudentId(studentId || null);
    setIsNewAppreciationOpen(true);
  };
  const closeNewAppreciation = () => {
    setIsNewAppreciationOpen(false);
    setPreselectedStudentId(null);
  };

  const openEmergencyReport = () => setIsEmergencyReportOpen(true);
  const closeEmergencyReport = () => setIsEmergencyReportOpen(false);

  const openFacilityReport = (areaOrRoom?: string) => {
    setPreselectedFacilityLocation(areaOrRoom || null);
    setIsFacilityReportOpen(true);
  };
  const closeFacilityReport = () => {
    setIsFacilityReportOpen(false);
    setPreselectedFacilityLocation(null);
  };

  const openHandover = () => setIsHandoverOpen(true);
  const closeHandover = () => setIsHandoverOpen(false);

  const openBatchAttendance = () => setIsBatchAttendanceOpen(true);
  const closeBatchAttendance = () => setIsBatchAttendanceOpen(false);

  const openGlobalSearch = () => setIsGlobalSearchOpen(true);
  const closeGlobalSearch = () => setIsGlobalSearchOpen(false);

  const openManageSchedule = (activity?: ActivitySchedule | null) => {
    setEditingActivity(activity || null);
    setIsManageScheduleOpen(true);
  };
  const closeManageSchedule = () => {
    setIsManageScheduleOpen(false);
    setEditingActivity(null);
  };

  const openManageStudents = (student?: Student | null, mode?: 'ADD' | 'EDIT' | 'LIST') => {
    if (student) {
      setEditingStudent(student);
      setManageEntitiesMode('EDIT');
    } else if (mode === 'LIST') {
      setEditingStudent(null);
      setManageEntitiesMode('LIST');
    } else {
      // Default when passing null/empty is ADD mode!
      setEditingStudent(null);
      setManageEntitiesMode('ADD');
    }
    setManageEntitiesTab('STUDENTS');
    setIsManageEntitiesOpen(true);
  };

  const openManageStaff = (staff?: User | null) => {
    setEditingStaff(staff || null);
    setManageEntitiesTab('STAFF');
    setIsManageEntitiesOpen(true);
  };

  const openManageBulk = () => {
    setManageEntitiesTab('BULK');
    setIsManageEntitiesOpen(true);
  };

  const closeManageEntities = () => {
    setIsManageEntitiesOpen(false);
    setEditingStudent(null);
    setEditingStaff(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchRole,
        activeTab,
        setActiveTab,
        currentClock,
        isSimulatedTime,
        simulatedTimeVal,
        activeActivity,
        nextActivity,
        supervisorOnDuty,
        setTimeTravel,
        stats,
        students,
        setStudents,
        rooms,
        areas,
        activities,
        violations,
        coachings,
        cases,
        appreciations,
        dutyRosters,
        handovers,
        incidents,
        facilities,
        notifications,
        auditLogs,
        habits,
        isOnline,
        isSyncing,
        refreshAllData,
        openStudent360,
        selectedStudentId,
        closeStudent360,
        openSOPChecklist,
        selectedActivityForChecklist,
        closeSOPChecklist,
        openRoomInspect,
        selectedRoomIdForInspect,
        closeRoomInspect,
        isNewViolationOpen,
        openNewViolation,
        closeNewViolation,
        isNewCoachingOpen,
        openNewCoaching,
        closeNewCoaching,
        isNewAppreciationOpen,
        openNewAppreciation,
        closeNewAppreciation,
        isEmergencyReportOpen,
        openEmergencyReport,
        closeEmergencyReport,
        isFacilityReportOpen,
        preselectedFacilityLocation,
        openFacilityReport,
        closeFacilityReport,
        isHandoverOpen,
        openHandover,
        closeHandover,
        isBatchAttendanceOpen,
        openBatchAttendance,
        closeBatchAttendance,
        isGlobalSearchOpen,
        openGlobalSearch,
        closeGlobalSearch,
        isManageScheduleOpen,
        editingActivity,
        openManageSchedule,
        closeManageSchedule,
        isManageEntitiesOpen,
        manageEntitiesTab,
        manageEntitiesMode,
        editingStudent,
        editingStaff,
        openManageStudents,
        openManageStaff,
        openManageBulk,
        closeManageEntities,
        preselectedStudentId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
