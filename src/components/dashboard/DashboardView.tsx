import React from 'react';
import {
  Users,
  BedDouble,
  Receipt,
  UserCheck2,
  AlertTriangle,
  HeartPulse,
  PlusCircle,
  AlertCircle,
  Ambulance,
  Pill,
} from 'lucide-react';
import {
  Button as MuiButton,
  Tooltip as MuiTooltip,
  LinearProgress,
  Chip as MuiChip,
} from '@mui/material';
import { useHospital } from '../../context/HospitalContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ActiveModule } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (module: ActiveModule) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    patients,
    beds,
    staff,
    attendance,
    pharmacyItems,
    labOrders,
    invoices,
    ambulances,
    otSchedules,
  } = useHospital();

  // Calculated Metrics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const bedOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const activeStaffOnDuty = attendance.filter((a) => a.clockIn && !a.clockOut).length;

  const totalRevenueToday = invoices
    .filter((inv) => inv.status === 'paid' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const lowStockDrugs = pharmacyItems.filter((i) => i.stockQuantity <= i.reorderLevel);
  const abnormalLabOrders = labOrders.filter((o) => o.isAbnormal);

  // Admission trends chart data
  const admissionTrendData = [
    { day: 'Mon', admissions: 14, discharges: 11, emergency: 6 },
    { day: 'Tue', admissions: 19, discharges: 15, emergency: 9 },
    { day: 'Wed', admissions: 22, discharges: 18, emergency: 7 },
    { day: 'Thu', admissions: 16, discharges: 14, emergency: 12 },
    { day: 'Fri', admissions: 25, discharges: 20, emergency: 14 },
    { day: 'Sat', admissions: 18, discharges: 12, emergency: 8 },
    { day: 'Sun (Today)', admissions: 12, discharges: 9, emergency: 5 },
  ];

  // Department revenue data in Indian Rupees
  const departmentRevenueData = [
    { name: 'Cardiology & CTVS', value: 420000, color: '#0284c7' },
    { name: 'ICU & Critical Care', value: 380000, color: '#0d9488' },
    { name: 'Casualty & Trauma', value: 290000, color: '#f59e0b' },
    { name: 'Central Pharmacy', value: 245000, color: '#8b5cf6' },
    { name: 'Pathology & Lab', value: 168000, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                NABH ACCREDITED • LIVE HOSPITAL OPERATIONS
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Date: {formatDate(new Date().toISOString())}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Easy Care Executive Command Center
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Unified hospital-wide clinical, staff attendance, duty permissions, pharmacy, laboratory, and financial
              intelligence dashboard (Indian Healthcare Standards).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <MuiTooltip title="Register a new patient or inward OPD token" arrow>
              <MuiButton
                variant="contained"
                onClick={() => onNavigate('patients')}
                sx={{
                  bgcolor: '#0284c7',
                  '&:hover': { bgcolor: '#0369a1' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '0.75rem',
                  py: 1,
                  px: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
                startIcon={<PlusCircle className="w-4 h-4" />}
              >
                New Patient
              </MuiButton>
            </MuiTooltip>

            <MuiTooltip title="Central pharmacy counter, retail & prescription fulfillment" arrow>
              <MuiButton
                variant="contained"
                onClick={() => onNavigate('pharmacy')}
                sx={{
                  bgcolor: '#0d9488',
                  '&:hover': { bgcolor: '#0f766e' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '0.75rem',
                  py: 1,
                  px: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
                startIcon={<Pill className="w-4 h-4" />}
              >
                Medicine Billing
              </MuiButton>
            </MuiTooltip>

            <MuiTooltip title="Interactive ICU, Emergency & General ward floor map" arrow>
              <MuiButton
                variant="outlined"
                onClick={() => onNavigate('wards')}
                sx={{
                  color: '#e2e8f0',
                  borderColor: '#334155',
                  bgcolor: '#1e293b',
                  '&:hover': { bgcolor: '#334155', borderColor: '#475569' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '0.75rem',
                  py: 1,
                  px: 2,
                }}
                startIcon={<BedDouble className="w-4 h-4" />}
              >
                Bed Allocator
              </MuiButton>
            </MuiTooltip>

            <MuiTooltip title="Patient settlement, GST invoices & TPA claims" arrow>
              <MuiButton
                variant="outlined"
                onClick={() => onNavigate('billing')}
                sx={{
                  color: '#e2e8f0',
                  borderColor: '#334155',
                  bgcolor: '#1e293b',
                  '&:hover': { bgcolor: '#334155', borderColor: '#475569' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '0.75rem',
                  py: 1,
                  px: 2,
                }}
                startIcon={<Receipt className="w-4 h-4" />}
              >
                Patient Bill
              </MuiButton>
            </MuiTooltip>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar (if abnormal lab or low stock meds) */}
      {(abnormalLabOrders.length > 0 || lowStockDrugs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abnormalLabOrders.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-800 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Critical Diagnostic Alert</p>
                  <p className="text-[11px] text-rose-700">
                    {abnormalLabOrders[0].patientName} - {abnormalLabOrders[0].testName}:{' '}
                    <span className="font-semibold">{abnormalLabOrders[0].resultValue} {abnormalLabOrders[0].unit}</span> (Critical High)
                  </p>
                </div>
              </div>
              <MuiButton
                variant="contained"
                size="small"
                onClick={() => onNavigate('laboratory')}
                sx={{
                  bgcolor: '#e11d48',
                  '&:hover': { bgcolor: '#be123c' },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '0.5rem',
                }}
              >
                Review LIS
              </MuiButton>
            </div>
          )}

          {lowStockDrugs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-800 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Formulary Low Stock Alert</p>
                  <p className="text-[11px] text-amber-700">
                    {lowStockDrugs[0].name} has only {lowStockDrugs[0].stockQuantity} units left (Reorder threshold: {lowStockDrugs[0].reorderLevel}).
                  </p>
                </div>
              </div>
              <MuiButton
                variant="contained"
                size="small"
                onClick={() => onNavigate('pharmacy')}
                sx={{
                  bgcolor: '#d97706',
                  '&:hover': { bgcolor: '#b45309' },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '0.5rem',
                }}
              >
                Restock
              </MuiButton>
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bed Occupancy"
          value={`${bedOccupancyRate}%`}
          subtitle={`${occupiedBeds} occupied / ${totalBeds} total beds`}
          icon={BedDouble}
          color="blue"
          trend={{ value: '+4.2%', isPositive: true }}
          onClick={() => onNavigate('wards')}
        />
        <StatCard
          title="Registered Patients"
          value={patients.length}
          subtitle="4 active admissions today"
          icon={Users}
          color="emerald"
          trend={{ value: '+12%', isPositive: true }}
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          title="Staff On Duty"
          value={`${activeStaffOnDuty} / ${staff.length}`}
          subtitle="Across 7 clinical departments"
          icon={UserCheck2}
          color="indigo"
          onClick={() => onNavigate('hrm')}
        />
        <StatCard
          title="Daily Collections"
          value={formatCurrency(totalRevenueToday)}
          subtitle="Direct cashier, UPI & PMJAY"
          icon={Receipt}
          color="purple"
          trend={{ value: '+8.6%', isPositive: true }}
          onClick={() => onNavigate('billing')}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Inpatient Flow */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Weekly Patient Flow & Emergency Casualty Triage</h2>
              <p className="text-xs text-slate-500">Admissions vs Discharges vs Casualty 108 Emergency Walk-ins</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Last 7 Days
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="admissions" name="Admissions" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discharges" name="Discharges" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emergency" name="Casualty / Trauma" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800">Departmental Revenue (₹)</h2>
              <button
                onClick={() => onNavigate('finance')}
                className="text-xs text-sky-600 hover:underline font-semibold"
              >
                ERP Ledger
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Gross monthly contribution by specialty in Indian Rupees</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentRevenueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {departmentRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {departmentRevenueData.slice(0, 4).map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 truncate max-w-[140px]">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Multi-Module Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Care Bed Snapshot */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-sky-600" />
              ICU & Critical Care Beds
            </h2>
            <MuiButton
              size="small"
              onClick={() => onNavigate('wards')}
              sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}
            >
              Full Floor Map
            </MuiButton>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-500 font-medium">Hospital Inpatient Occupancy</span>
              <span className="font-bold text-sky-700">{bedOccupancyRate}%</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={bedOccupancyRate}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: bedOccupancyRate > 85 ? '#e11d48' : bedOccupancyRate > 70 ? '#f59e0b' : '#0d9488',
                },
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {beds.slice(0, 6).map((bed) => {
              const statusColors = {
                available: 'bg-emerald-50 border-emerald-300 text-emerald-800',
                occupied: 'bg-rose-50 border-rose-300 text-rose-800',
                cleaning: 'bg-amber-50 border-amber-300 text-amber-800',
                maintenance: 'bg-slate-100 border-slate-300 text-slate-700',
              }[bed.status];

              return (
                <div
                  key={bed.id}
                  className={`p-3 rounded-xl border ${statusColors} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{bed.bedNumber}</span>
                    <span className="text-[10px] capitalize font-medium">{bed.status}</span>
                  </div>
                  <p className="text-[11px] truncate font-semibold mt-1">
                    {bed.currentPatientName || 'Vacant / Ready'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{bed.wardName}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operation Theatre (OT) & Ambulance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                Active Surgery (OT) Schedule
              </h2>
              <MuiButton
                size="small"
                onClick={() => onNavigate('operations')}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}
              >
                Operations
              </MuiButton>
            </div>

            <div className="space-y-2.5">
              {otSchedules.map((ot) => (
                <div
                  key={ot.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{ot.room}</span>
                    <Badge
                      variant={ot.status === 'in_progress' ? 'danger' : 'info'}
                      size="sm"
                    >
                      {ot.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sky-700">{ot.surgeryName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Patient: {ot.patientName}</span>
                    <span>Surgeon: {ot.leadSurgeon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Ambulance className="w-4 h-4 text-emerald-600" />
              <span>108 Rapid Response Ambulance Fleet:</span>
            </div>
            <span className="font-bold text-emerald-700">
              {ambulances.filter((a) => a.status === 'available').length} of {ambulances.length} Ready
            </span>
          </div>
        </div>

        {/* Formulary & Individual Medicine Billing Desk */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Central Pharmacy Status (₹)
              </h2>
              <MuiButton
                size="small"
                onClick={() => onNavigate('pharmacy')}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#0d9488' }}
              >
                Pharmacy Desk
              </MuiButton>
            </div>

            <div className="space-y-2">
              {pharmacyItems.slice(0, 4).map((med) => (
                <div
                  key={med.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{med.name}</p>
                    <p className="text-[10px] text-slate-500">{med.genericName}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        med.stockQuantity <= med.reorderLevel ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {med.stockQuantity} in stock
                    </span>
                    <p className="text-[10px] text-slate-500">{formatCurrency(med.unitPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MuiButton
            variant="contained"
            fullWidth
            onClick={() => onNavigate('pharmacy')}
            sx={{
              mt: 2,
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#0f766e' },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '0.75rem',
              py: 1,
            }}
            startIcon={<Pill className="w-4 h-4" />}
          >
            Individual Medicine Billing Counter (GST)
          </MuiButton>
        </div>
      </div>
    </div>
  );
};
