import React from 'react';
import { ShieldCheck, Download, Smartphone, UserPlus } from 'lucide-react';
import { ActiveModule } from '../types';

interface NavbarProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
  onExportCurrentModule: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeModule, onNavigate, onExportCurrentModule }) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-emerald-500/20 bg-slate-950/95 backdrop-blur-md px-4 py-2.5">
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
                PUCARA-MOROCOCHA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold tracking-tight">
              SOLUCIÓN INTEGRAL PARA EL BIENESTAR SOCIAL MINERO
            </p>
          </div>
        </div>

        {/* Quick Badge */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">ECOSEM Pucara-Morococha</div>
              <div className="font-bold text-emerald-300">100% Adaptado a la Industria Minera</div>
            </div>
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
