import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  QrCode,
  Calculator,
  BedDouble,
  MessageSquareWarning,
  HeartPulse,
  GraduationCap,
  Building2,
  BarChart3,
  FileCheck2,
  ShoppingBag,
  Coins,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { ActiveModule } from '../types';

interface SidebarProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onNavigate }) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveModule,
      label: 'Dashboard General',
      icon: LayoutDashboard,
      highlight: false,
    },
    {
      id: 'workers' as ActiveModule,
      label: 'Registro de Personal',
      icon: UserPlus,
      highlight: true,
      tag: 'Alta',
    },
    {
      id: 'qr-attendance' as ActiveModule,
      label: 'Asistencia por QR',
      icon: QrCode,
      highlight: true,
      tag: 'Principal',
    },
    {
      id: 'valuation' as ActiveModule,
      label: 'Valorización Precio Diario',
      icon: Calculator,
      highlight: true,
      tag: 'Costo',
    },
    {
      id: 'room-handover' as ActiveModule,
      label: 'Entrega de Cuarto',
      icon: BedDouble,
      highlight: true,
      tag: 'Doc',
    },
    {
      id: 'incidents' as ActiveModule,
      label: 'Incidentes WhatsApp',
      icon: MessageSquareWarning,
      highlight: true,
      tag: 'WA',
    },
    {
      id: 'worker-portal' as ActiveModule,
      label: 'Portal Móvil Trabajador',
      icon: Smartphone,
      highlight: true,
      tag: 'QR Móvil',
    },
    {
      id: 'room-checkin-portal' as ActiveModule,
      label: 'Portal Alojamiento QR',
      icon: Smartphone,
      highlight: true,
      tag: 'Cuartos',
    },
    {
      id: 'family-health' as ActiveModule,
      label: 'Salud y Bienestar Familiar',
      icon: HeartPulse,
      highlight: false,
    },
    {
      id: 'education' as ActiveModule,
      label: 'Educación y Becas',
      icon: GraduationCap,
      highlight: false,
    },
    {
      id: 'infrastructure' as ActiveModule,
      label: 'Infraestructura OXI',
      icon: Building2,
      highlight: false,
    },
    {
      id: 'social-impact' as ActiveModule,
      label: 'Gestión Impacto ICBS',
      icon: BarChart3,
      highlight: false,
    },
    {
      id: 'benefit-requests' as ActiveModule,
      label: 'Solicitudes y Beneficios',
      icon: FileCheck2,
      highlight: false,
    },
    {
      id: 'local-suppliers' as ActiveModule,
      label: 'Proveedores Locales',
      icon: ShoppingBag,
      highlight: false,
    },
    {
      id: 'microcredits' as ActiveModule,
      label: 'Emprendimiento Local',
      icon: Coins,
      highlight: false,
    },
    {
      id: 'audit' as ActiveModule,
      label: 'Cumplimiento y Auditoría',
      icon: ShieldAlert,
      highlight: false,
    },
  ];

  return (
    <aside className="w-full md:w-64 glass-panel border-r border-slate-800 p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-3">
        {/* Official Logo Banner */}
        <div className="bg-white p-2.5 rounded-2xl border-2 border-emerald-500 shadow-md text-center">
          <img
            src="/ecosem-logo.png"
            alt="ECOSEM PUCARA-MOROCOCHA"
            className="w-full h-14 object-contain mx-auto"
          />
        </div>

        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
          Módulos ECOSEM Pucara-Morococha
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner'
                    : item.highlight
                    ? 'text-emerald-100 hover:bg-slate-800/80 hover:text-emerald-300'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : item.highlight ? 'text-emerald-400/80' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/80 px-3 text-center space-y-0.5">
        <div className="text-xs font-black text-emerald-400">ECOSEM PUCARA-MOROCOCHA</div>
        <p className="text-[10px] text-slate-400">Socio Estratégico Minero 2026</p>
      </div>
    </aside>
  );
};
