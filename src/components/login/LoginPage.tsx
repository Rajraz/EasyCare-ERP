import React, { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Activity,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { useNotification } from '../../context/NotificationContext';

interface BannerPreset {
  id: string;
  name: string;
  url: string;
}

const BANNER_PRESETS: BannerPreset[] = [
  {
    id: 'modern-clinic',
    name: 'Modern Clinic',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=2400&q=80',
  },
  {
    id: 'hospital-pavilion',
    name: 'Hospital Pavilion',
    url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=2400&q=80',
  },
  {
    id: 'care-team',
    name: 'Care Team',
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2400&q=80',
  },
  {
    id: 'clinical-suite',
    name: 'Clinical Suite',
    url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=2400&q=80',
  },
];

export const LoginPage: React.FC = () => {
  const { login, sessionError, clearSessionError } = useAuth();
  const { hospitalProfile } = useHospital();
  const { showNotification } = useNotification();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const currentBanner = BANNER_PRESETS[activeBannerIndex] || BANNER_PRESETS[0];

  const demoRoles = [
    { label: 'Super Admin', user: 'admin', pass: 'admin123' },
    { label: 'Doctor', user: 'doctor', pass: 'doctor123' },
    { label: 'Pharmacist', user: 'pharmacist', pass: 'pharm123' },
    { label: 'Lab Tech', user: 'lab_tech', pass: 'lab123' },
    { label: 'Receptionist', user: 'receptionist', pass: 'recep123' },
  ];

  const handleSelectRole = (user: string, pass: string, roleName: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage(null);
    showNotification(`Autofilled credentials for ${roleName}`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearSessionError();

    if (!username.trim()) {
      setErrorMessage('Please enter your username or hospital email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Authentication failed. Please verify your credentials.');
      } else {
        showNotification(`Welcome back to ${hospitalProfile.appName || 'Easy Care'}!`, 'success');
      }
    }, 350);
  };

  const displayError = errorMessage || sessionError;
  const appDisplayName = hospitalProfile.appName || 'Easy Care';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative text-slate-800 font-sans overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-700"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.62) 0%, rgba(240, 253, 244, 0.70) 50%, rgba(255, 255, 255, 0.65) 100%), url('${currentBanner.url}')`,
      }}
    >
      {/* Background Soft Emerald Atmospheric Shadows & Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-emerald-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-teal-400/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-emerald-400/25 rounded-full blur-[110px] pointer-events-none" />

      {/* Pure Centered White Sign-In Card with Glowing Green Shadow */}
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl border border-emerald-200/80 rounded-3xl p-5 sm:p-9 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/20 relative z-10 font-medium">
        
        {/* Brand Logo & Header - Easy Care only shown, subtitle removed */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-emerald-600/30">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {appDisplayName}
          </h1>
        </div>

        {/* Error Notification Banner */}
        {displayError && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900">Access Denied</p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed font-normal">{displayError}</p>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Username / Hospital Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your username or email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-emerald-600 hover:text-emerald-700 cursor-pointer font-normal">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
                <IconButton
                  type="button"
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </IconButton>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 font-normal">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500/20"
              />
              <span>Remember workstation session</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
            sx={{
              py: 1.4,
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #10b981 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
              mt: 1.5,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #047857 0%, #0f766e 50%, #059669 100%)',
              },
            }}
            endIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>

          {/* Quick Demo Access Pills */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Fast Demo 1-Click Role Fill
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {demoRoles.map((role) => (
                <Tooltip key={role.user} title={`Click to load ${role.user} credentials`} arrow>
                  <Chip
                    label={role.label}
                    size="small"
                    onClick={() => handleSelectRole(role.user, role.pass, role.label)}
                    clickable
                    variant={username === role.user ? 'filled' : 'outlined'}
                    color={username === role.user ? 'primary' : 'default'}
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(13, 148, 136, 0.08)',
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Discreet Banner Selector */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-200/80 shadow-lg text-[11px] text-slate-600">
        <span className="font-semibold text-emerald-800 mr-1 flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          Banner:
        </span>
        {BANNER_PRESETS.map((preset, idx) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setActiveBannerIndex(idx)}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
              activeBannerIndex === idx
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-emerald-100 text-slate-700'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};
