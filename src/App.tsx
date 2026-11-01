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
import {
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
  Users,
  Ticket,
  Stethoscope,
  Menu,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Desktop Persistent + Mobile Slide-out Drawer) */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Container with Responsive Padding */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 max-w-[1600px] w-full mx-auto pb-24 lg:pb-8">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto mt-8 sm:mt-12 shadow-sm space-y-4">
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

      {/* Mobile Bottom Quick-Access Action Bar (< lg screens) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around"
      >
        <button
          onClick={() => setActiveModule('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeModule === 'dashboard' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModule === 'dashboard' ? 'bg-sky-100 text-sky-700' : ''}`}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Command</span>
        </button>

        <button
          onClick={() => setActiveModule('patients')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeModule === 'patients' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModule === 'patients' ? 'bg-sky-100 text-sky-700' : ''}`}>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Patients</span>
        </button>

        <button
          onClick={() => setActiveModule('opd_tokens')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeModule === 'opd_tokens' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModule === 'opd_tokens' ? 'bg-sky-100 text-sky-700' : ''}`}>
            <Ticket className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Tokens</span>
        </button>

        <button
          onClick={() => setActiveModule('doctor')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeModule === 'doctor' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeModule === 'doctor' ? 'bg-sky-100 text-sky-700' : ''}`}>
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Doctor</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all"
        >
          <div className="p-1 rounded-lg bg-slate-100 text-slate-700">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">More</span>
        </button>
      </nav>
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
