import React from 'react';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UserCheck2,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  Landmark,
  Ambulance as AmbulanceIcon,
  ChevronRight,
  Layers,
  LogOut,
  Ticket,
  X,
  Activity,
} from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { cn } from '../../lib/utils';

export type ActiveModule =
  | 'dashboard'
  | 'patients'
  | 'opd_tokens'
  | 'wards'
  | 'hrm'
  | 'doctor'
  | 'pharmacy'
  | 'laboratory'
  | 'billing'
  | 'finance'
  | 'operations'
  | 'masters';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { hasAccess, logout, currentUser } = useAuth();
  const { patients, beds, pharmacyItems, labOrders, leaves, hospitalProfile, opdTokens } = useHospital();

  const occupiedBedsCount = beds.filter((b) => b.status === 'occupied').length;
  const lowStockMedsCount = pharmacyItems.filter((m) => m.stockQuantity <= m.reorderLevel).length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;
  const pendingLabCount = labOrders.filter((o) => o.status === 'pending_sample' || o.status === 'processing').length;
  const waitingTokensCount = opdTokens.filter((t) => t.status === 'waiting' || t.status === 'in_consultation').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveModule,
      label: 'Command Center',
      icon: LayoutDashboard,
      desc: 'Hospital KPIs & Overview',
    },
    {
      id: 'patients' as ActiveModule,
      label: 'Patients & EMR',
      icon: Users,
      badge: patients.length.toString(),
      desc: 'Records, Vitals & History',
    },
    {
      id: 'opd_tokens' as ActiveModule,
      label: 'OPD Token Desk',
      icon: Ticket,
      badge: waitingTokensCount > 0 ? `${waitingTokensCount} active` : undefined,
      badgeColor: 'sky',
      desc: 'Daily Token & Inward Queue',
    },
    {
      id: 'wards' as ActiveModule,
      label: 'Wards & Bed Map',
      icon: BedDouble,
      badge: `${occupiedBedsCount}/${beds.length}`,
      badgeColor: 'amber',
      desc: 'ICU & Floor Bed Status',
    },
    {
      id: 'hrm' as ActiveModule,
      label: 'HRM & Attendance',
      icon: UserCheck2,
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} leaves` : undefined,
      badgeColor: 'rose',
      desc: 'Staff, Shifts & Payroll',
    },
    {
      id: 'doctor' as ActiveModule,
      label: 'Doctor Desk (OPD)',
      icon: Stethoscope,
      desc: 'Queue & Consultations',
    },
    {
      id: 'pharmacy' as ActiveModule,
      label: 'Pharmacy & POS',
      icon: Pill,
      badge: lowStockMedsCount > 0 ? `${lowStockMedsCount} low` : undefined,
      badgeColor: 'rose',
      desc: 'Inventory & Dispensing',
    },
    {
      id: 'laboratory' as ActiveModule,
      label: 'Laboratory (LIS)',
      icon: FlaskConical,
      badge: pendingLabCount > 0 ? `${pendingLabCount} req` : undefined,
      badgeColor: 'sky',
      desc: 'Tests, Samples & Reports',
    },
    {
      id: 'billing' as ActiveModule,
      label: 'Billing & Insurance',
      icon: Receipt,
      desc: 'Invoices, Claims & Cashier',
    },
    {
      id: 'finance' as ActiveModule,
      label: 'Finance & Accounts',
      icon: Landmark,
      desc: 'PO, GRN, BRS, P&L & Balance Sheet',
    },
    {
      id: 'operations' as ActiveModule,
      label: 'Operations & Fleet',
      icon: AmbulanceIcon,
      desc: 'Ambulance, OT & Facilities',
    },
    {
      id: 'masters' as ActiveModule,
      label: 'Hospital Masters',
      icon: Layers,
      badge: 'Admin',
      badgeColor: 'sky',
      desc: 'Staff, Wards, Formulary & Tests',
    },
  ];

  const handleItemClick = (id: ActiveModule) => {
    onSelectModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          {isMobile && (
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
          )}
          <span>{isMobile ? hospitalProfile.appName : 'Clinical & ERP Modules'}</span>
        </div>
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Mobile Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isAllowed = hasAccess(item.id);
          const isActive = activeModule === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group',
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                !isAllowed && 'opacity-40 hover:opacity-75'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.label}</p>
                  <p
                    className={cn(
                      'text-[10px] truncate',
                      isActive ? 'text-sky-100' : 'text-slate-500'
                    )}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor === 'rose'
                      ? 'bg-rose-500/20 text-rose-300'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 text-slate-400 text-xs bg-slate-950/40 space-y-3 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-200">{hospitalProfile.appName} v2.4</span>
          <span className="text-emerald-400 font-mono">v18.3-Prod</span>
        </div>
        <p className="text-[10px] text-slate-500">
          NABH & Indian Healthcare Standards
        </p>

        {/* User Quick Info & Sign Out */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-[11px] font-bold text-slate-300 truncate">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider truncate">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            title="Sign Out of Workstation"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700/60 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Only on large screens: lg+) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
        {renderNavContent(false)}
      </aside>

      {/* Mobile / Tablet Responsive Drawer (Slide-out menu for < lg screens) */}
      <Drawer
        anchor="left"
        open={isOpenMobile || false}
        onClose={onCloseMobile}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            maxWidth: '85vw',
            bgcolor: '#0f172a',
            color: '#cbd5e1',
            borderRight: '1px solid #1e293b',
          },
        }}
      >
        <div className="h-full bg-slate-900 text-slate-300">
          {renderNavContent(true)}
        </div>
      </Drawer>
    </>
  );
};
