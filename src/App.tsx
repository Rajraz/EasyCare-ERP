import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme } from './theme/muiTheme';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';
import { LoginPage } from './components/login/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveModule } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView } from './components/patients/PatientsView';
import { OpdTokensView } from './components/tokens/OpdTokensView';
import { WardsView } from './components/wards/WardsView';
import { HrmView } from './components/hrm/HrmView';
import { DoctorView } from './components/doctor/DoctorView';
import { PharmacyView } from './components/pharmacy/PharmacyView';
import { LaboratoryView } from './components/laboratory/LaboratoryView';
import { BillingView } from './components/billing/BillingView';
import { FinanceView } from './components/finance/FinanceView';
import { OperationsView } from './components/operations/OperationsView';
import { MastersView } from './components/masters/MastersView';
import { ShieldAlert, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const { isAuthenticated, hasAccess, currentRole, switchRole } = useAuth();

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isAllowed = hasAccess(activeModule);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Navigation */}
      <Navbar
        onNavigateEmergency={() => setActiveModule('operations')}
        onNavigateMasters={() => setActiveModule('masters')}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeModule={activeModule} onSelectModule={setActiveModule} />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {isAllowed ? (
            <>
              {activeModule === 'dashboard' && <DashboardView onNavigate={setActiveModule} />}
              {activeModule === 'patients' && <PatientsView />}
              {activeModule === 'opd_tokens' && <OpdTokensView />}
              {activeModule === 'wards' && <WardsView />}
              {activeModule === 'hrm' && <HrmView />}
              {activeModule === 'doctor' && <DoctorView />}
              {activeModule === 'pharmacy' && <PharmacyView />}
              {activeModule === 'laboratory' && <LaboratoryView />}
              {activeModule === 'billing' && <BillingView />}
              {activeModule === 'finance' && <FinanceView />}
              {activeModule === 'operations' && <OperationsView />}
              {activeModule === 'masters' && <MastersView />}
            </>
          ) : (
            /* RBAC Access Restricted Guard */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-12 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Module Access Restricted by RBAC</h2>
              <p className="text-xs text-slate-500">
                Your currently active role (<strong className="capitalize">{currentRole.replace('_', ' ')}</strong>) does not have authorization to view the <strong className="capitalize">{activeModule}</strong> module.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => switchRole('super_admin')}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Switch to Super Admin to View Module
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <NotificationProvider>
        <HospitalProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </HospitalProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
