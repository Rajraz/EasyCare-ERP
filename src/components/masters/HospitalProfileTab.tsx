import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  Save,
  RotateCcw,
  Activity,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Eye,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { HospitalProfile } from '../../types/hospital';

interface HospitalProfileTabProps {
  onShowToast: (msg: string) => void;
}

export const HospitalProfileTab: React.FC<HospitalProfileTabProps> = ({ onShowToast }) => {
  const { hospitalProfile, updateHospitalProfile } = useHospital();

  const [form, setForm] = useState<HospitalProfile>({
    appName: hospitalProfile.appName || 'Easy Care',
    hospitalName: hospitalProfile.hospitalName || 'Easy Care Super-Speciality Hospital',
    tagline: hospitalProfile.tagline || 'Modern Hospital Management & Healthcare ERP • Indian Healthcare Standard',
    shortName: hospitalProfile.shortName || 'Easy Care',
    accreditation: hospitalProfile.accreditation || 'NABH ACCREDITED',
    emergencyContact: hospitalProfile.emergencyContact || 'Casualty / 108 Emergency: Ext 911',
    address: hospitalProfile.address || 'Plot 42, Healthcare City, Bannerghatta Road, Bengaluru, Karnataka 560076',
    email: hospitalProfile.email || 'director@easycare.health',
    phone: hospitalProfile.phone || '+91 80 4992 0000',
    website: hospitalProfile.website || 'https://easycare.health',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.appName.trim()) {
      alert('App Name cannot be empty');
      return;
    }

    updateHospitalProfile(form);
    onShowToast(`App Name & Hospital Profile successfully updated to: ${form.appName}`);
  };

  const handleResetDefaults = () => {
    const defaults: HospitalProfile = {
      appName: 'Easy Care',
      hospitalName: 'Easy Care Super-Speciality Hospital',
      tagline: 'Modern Hospital Management & Healthcare ERP • Indian Healthcare Standard',
      shortName: 'Easy Care',
      accreditation: 'NABH ACCREDITED',
      emergencyContact: 'Casualty / 108 Emergency: Ext 911',
      address: 'Plot 42, Healthcare City, Bannerghatta Road, Bengaluru, Karnataka 560076',
      email: 'director@easycare.health',
      phone: '+91 80 4992 0000',
      website: 'https://easycare.health',
    };
    setForm(defaults);
    updateHospitalProfile(defaults);
    onShowToast('Reset branding to default Easy Care settings.');
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-sky-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm">
              App Name & Hospital Branding Configuration
            </h2>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Update the application name, hospital identity, accreditation badges, and contact details. All updates are applied in real-time across the top navigation bar, sidebar, login portal, and document titles.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors flex items-center gap-1.5 self-start md:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 text-xs">
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Core App Name & Identity */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Primary Application Name & Header Identity
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Application Name * <span className="text-sky-600">(Header / Title)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hosp-ERP"
                    value={form.appName}
                    onChange={(e) => setForm({ ...form, appName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Displayed prominently on Navbar brand, Sidebar, and Login screen.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Accreditation Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NABH ACCREDITED"
                    value={form.accreditation}
                    onChange={(e) => setForm({ ...form, accreditation: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-xs uppercase text-emerald-800 bg-emerald-50/50"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    e.g. NABH ACCREDITED, JCI CERTIFIED, NABL
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Hospital / Healthcare Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hosp-ERP Super-Speciality Hospital"
                  value={form.hospitalName}
                  onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hospital Tagline / System Description
                </label>
                <input
                  type="text"
                  placeholder="Super-Speciality Hospital Management & Healthcare ERP • Indian Healthcare Standard"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Emergency & Contact Details */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Emergency Hotline & Communications
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Casualty & Emergency Hotline Text
                  </label>
                  <input
                    type="text"
                    placeholder="Casualty / 108 Emergency: Ext 911"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Hospital Phone / Board Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 80 4992 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Admin / Helpdesk Email
                  </label>
                  <input
                    type="email"
                    placeholder="director@hosperp.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hospital Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://hosperp.health"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hospital Campus Physical Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Plot 42, Healthcare City, Bannerghatta Road, Bengaluru, Karnataka 560076"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <Save className="w-4 h-4" />
                <span>Save App Name & Hospital Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Mockup / Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Branding Preview
              </span>
              <span className="text-[10px] text-slate-400">Updates Instantly</span>
            </div>

            {/* Preview 1: Top Navigation Bar Header */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                1. Navbar Brand Appearance
              </span>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm tracking-tight text-slate-900">
                      {form.appName || 'Hosp-ERP'}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {form.accreditation || 'NABH ACCREDITED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {form.hospitalName || 'Hosp-ERP Super-Speciality Hospital'}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview 2: Login Screen Hero */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                2. Login Screen Header
              </span>
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-base text-white">{form.appName || 'Hosp-ERP'}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {form.accreditation || 'NABH ACCREDITED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {form.tagline || 'Super-Speciality Hospital Management & Healthcare ERP • Indian Healthcare Standard'}
                </p>
              </div>
            </div>

            {/* Preview 3: Sidebar Footer */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                3. Sidebar Brand Footer
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-200">{form.appName || 'Hosp-ERP'} v2.4</span>
                  <span className="text-emerald-400 font-mono text-[10px]">v18.3-Prod</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  HIPAA & HL7 Standards Compliant
                </p>
              </div>
            </div>

            {/* Preview 4: Casualty hotline */}
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/40 text-[11px] text-rose-300 flex items-center justify-between">
              <span>{form.emergencyContact || 'Casualty: Ext 911'}</span>
              <span className="font-mono text-[10px] text-rose-400">Emergency Desk</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
