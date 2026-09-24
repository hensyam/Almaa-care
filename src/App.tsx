/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Header } from './components/Header.js';
import { Navigation } from './components/Navigation.js';
import { QuickActionFAB } from './components/QuickActionFAB.js';

// Feature Modals
import { Student360Modal } from './components/Student360Modal.js';
import { SOPChecklistModal } from './components/SOPChecklistModal.js';
import { RoomInspectionModal } from './components/RoomInspectionModal.js';
import { NewViolationModal } from './components/NewViolationModal.js';
import { NewCoachingModal } from './components/NewCoachingModal.js';
import { NewAppreciationModal } from './components/NewAppreciationModal.js';
import { EmergencyReportModal } from './components/EmergencyReportModal.js';
import { FacilityModal } from './components/FacilityModal.js';
import { HandoverModal } from './components/HandoverModal.js';
import { BatchAttendanceModal } from './components/BatchAttendanceModal.js';
import { GlobalSearchModal } from './components/GlobalSearchModal.js';
import { ManageScheduleModal } from './components/ManageScheduleModal.js';
import { ManageEntitiesModal } from './components/ManageEntitiesModal.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';

// Views
import { DashboardView } from './views/DashboardView.js';
import { DailyOperationView } from './views/DailyOperationView.js';
import { StudentManagementView } from './views/StudentManagementView.js';
import { EnvironmentView } from './views/EnvironmentView.js';
import { CoachingView } from './views/CoachingView.js';
import { ReportingView } from './views/ReportingView.js';
import { ManagementView } from './views/ManagementView.js';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    isManageEntitiesOpen,
    manageEntitiesTab,
    manageEntitiesMode,
    editingStudent,
    editingStaff,
    closeManageEntities,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* GLOBAL HEADER */}
      <Header />

      {/* TOP NAVIGATION BAR (FULL WIDTH, PROMINENT, NOT AT THE SIDE) */}
      <Navigation />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 mb-20 md:mb-10">
        <main className="w-full">
          {(activeTab === 'home' || activeTab === 'dashboard') && <DashboardView />}
          {activeTab === 'daily' && <DailyOperationView />}
          {activeTab === 'students' && <StudentManagementView />}
          {activeTab === 'environment' && <EnvironmentView />}
          {activeTab === 'coaching' && <CoachingView />}
          {activeTab === 'reporting' && <ReportingView />}
          {activeTab === 'management' && <ManagementView />}
        </main>
      </div>

      {/* QUICK ACTION FAB FOR 1-HAND OPERATION */}
      <QuickActionFAB />

      {/* ALL FEATURE MODALS */}
      <Student360Modal />
      <SOPChecklistModal />
      <RoomInspectionModal />
      <NewViolationModal />
      <NewCoachingModal />
      <NewAppreciationModal />
      <EmergencyReportModal />
      <FacilityModal />
      <HandoverModal />
      <BatchAttendanceModal />
      <GlobalSearchModal />
      <ManageScheduleModal />
      <ManageEntitiesModal
        isOpen={isManageEntitiesOpen}
        onClose={closeManageEntities}
        defaultTab={manageEntitiesTab}
        initialStudent={editingStudent}
        initialUser={editingStaff}
        initialMode={manageEntitiesMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
