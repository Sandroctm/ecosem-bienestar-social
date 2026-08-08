import React from 'react';
import { ShieldCheck, Download, Smartphone, UserPlus, Building, Lock, Server, Key, Eye, HelpCircle, Laptop } from 'lucide-react';
import { ActiveModule, UnitTenant } from '../types';

interface NavbarProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
  onExportCurrentModule: () => void;
  tenants?: UnitTenant[];
  currentTenantId?: string;
  onTenantChange?: (tenantId: string) => void;

  // Parámetros de Módulos Enterprise
  isOnline?: boolean;
  onToggleOnline?: () => void;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
  onOpenCommandPalette?: () => void;
  isMfaVerified?: boolean;
  onOpenMfaModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onNavigate,
  onExportCurrentModule,
  tenants = [],
  currentTenantId,
  onTenantChange,
  isOnline = true,
  onToggleOnline,
  isHighContrast = false,
  onToggleHighContrast,
  onOpenCommandPalette,
  isMfaVerified = false,
  onOpenMfaModal,
}) => {
  return (
    <header className={`sticky top-0 z-30 w-full border-b px-4 py-2.5 transition-colors ${
      isHighContrast
        ? 'bg-black text-white border-white'
        : 'glass-panel border-emerald-500/20 bg-slate-950/95 backdrop-blur-md text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand logo image & tagline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="bg-white p-1.5 rounded-xl border-2 border-emerald-500 shadow-md shadow-emerald-950/40 flex items-center justify-center">
            <img
              src="/ecosem-logo.png"
              alt="ECOSEM PUCARA-MOROCOCHA"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-emerald-400">
                ECOSEM
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30">
                ENTERPRISE ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold tracking-tight">
              SOLUCIÓN INTEGRAL PARA EL BIENESTAR SOCIAL MINERO
            </p>
          </div>
        </div>

        {/* Multitenant Unit Selector & Security Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {tenants.length > 0 && onTenantChange && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-inner">
              <Building className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={currentTenantId}
                onChange={(e) => onTenantChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                    🏢 {t.name} ({t.activeWorkersCount} trab.)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
            title="Abrir buscador Ctrl+K"
          >
            <span>Buscar</span>
            <kbd className="px-1 py-0.5 bg-slate-800 text-[9px] rounded font-mono border border-slate-700">Ctrl+K</kbd>
          </button>

          {/* High Contrast Theme Switch */}
          <button
            onClick={onToggleHighContrast}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
              isHighContrast
                ? 'bg-white text-black border-white'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Activar Alto Contraste para mina"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Alto Contraste</span>
          </button>

          {/* Multi-Factor Authentication Lock State */}
          <button
            onClick={onOpenMfaModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
              isMfaVerified
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
            }`}
            title={isMfaVerified ? 'MFA Verificado' : 'Requiere Verificación MFA'}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isMfaVerified ? 'MFA Activo' : 'Habilitar MFA'}</span>
          </button>

          {/* Quick AES-256 Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256 Ley N° 29733</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('workers')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
            title="Ingresar datos de personal"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ingresar Personal</span>
          </button>

          <button
            onClick={() => onNavigate('worker-portal')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
            title="Portal de escaneo QR para trabajadores"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Portal QR Móvil</span>
          </button>

          <button
            onClick={onExportCurrentModule}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-500 hover:to-emerald-700 shadow-md shadow-emerald-950/40"
            title="Exportar la lista o reporte actual a Excel (.xlsx)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="Piero Administrador"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">Piero</div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase">ADMINISTRADOR ECOSEM</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

