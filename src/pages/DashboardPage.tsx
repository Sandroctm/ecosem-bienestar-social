import React from 'react';
import {
  Users,
  Building2,
  Clock,
  CircleDollarSign,
  TrendingUp,
  Award,
  Smartphone,
  QrCode,
  BedDouble,
  MessageSquareWarning,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ActiveModule, BenefitRequest } from '../types';

interface DashboardPageProps {
  requests: BenefitRequest[];
  onNavigate: (module: ActiveModule) => void;
  onOpenQRScanner: () => void;
  onOpenRoomModal: () => void;
  onOpenWhatsAppModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  requests,
  onNavigate,
  onOpenQRScanner,
  onOpenRoomModal,
  onOpenWhatsAppModal,
}) => {
  // Chart data matching image
  const attendanceChartData = [
    { day: '10 May', Ingresos: 120, Salidas: 80 },
    { day: '12 May', Ingresos: 135, Salidas: 95 },
    { day: '14 May', Ingresos: 110, Salidas: 105 },
    { day: '16 May', Ingresos: 155, Salidas: 110 },
    { day: '17 May', Ingresos: 160, Salidas: 140 },
    { day: '19 May', Ingresos: 180, Salidas: 150 },
  ];

  const categoryCostData = [
    { name: 'Alimentación', value: 35, color: '#D9A700' },
    { name: 'Alojamiento', value: 20, color: '#3B82F6' },
    { name: 'Servicios', value: 20, color: '#10B981' },
    { name: 'Operativos', value: 15, color: '#F59E0B' },
    { name: 'Útiles', value: 10, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Call to Action for Primary User Requirements */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                Solución Integral Minera
              </span>
              <span className="text-xs text-amber-400 font-semibold">ECOSEM Bienestar Social</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-100 mt-2">
              Dashboard de <span className="gold-gradient-text">Bienestar y Operaciones</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Unificación de impacto social, control de asistencia por QR, valorización diaria de campamento, entrega formal de habitaciones y reportes instantáneos vía WhatsApp.
            </p>
          </div>

          {/* Direct Requirement Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            <button
              onClick={onOpenQRScanner}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all group"
            >
              <QrCode className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-amber-400" />
              <span className="text-[11px] font-bold">Asistencia QR</span>
            </button>

            <button
              onClick={() => onNavigate('valuation')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-all group"
            >
              <Calculator className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-blue-400" />
              <span className="text-[11px] font-bold">Valorización S/</span>
            </button>

            <button
              onClick={onOpenRoomModal}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all group"
            >
              <BedDouble className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-emerald-400" />
              <span className="text-[11px] font-bold">Entrega Cuarto</span>
            </button>

            <button
              onClick={onOpenWhatsAppModal}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 transition-all group"
            >
              <MessageSquareWarning className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-emerald-400" />
              <span className="text-[11px] font-bold">WhatsApp Inc.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards grid matching the reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Personas/Familias</span>
            <div className="text-2xl font-black text-slate-100 mt-1">1,245</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" /> +12% este mes
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Campamentos Activos</span>
            <div className="text-2xl font-black text-slate-100 mt-1">6</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Norte, Sur, Central, Base</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Solicitudes Pendientes</span>
            <div className="text-2xl font-black text-slate-100 mt-1">219</div>
            <span className="text-[10px] text-amber-400 font-semibold mt-1 block">Flujos automatizados</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Costos del Mes (S/)</span>
            <div className="text-2xl font-black gold-gradient-text mt-1">S/ 1,845,680</div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Ahorro proyectado -8%</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Charts & Occupancy Grid (Exact design matching image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Asistencia a Campamentos Line Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-100">Asistencia a Campamentos</h3>
              <p className="text-[11px] text-slate-400">Flujo diario de ingresos y salidas con escaneo QR</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Ingresos
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Salidas
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceChartData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#d9a700',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="Ingresos" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Salidas" stroke="#d9a700" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Costos por Categoría Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Costos por Categoría</h3>
            <p className="text-[11px] text-slate-400">Distribución de presupuesto operativo S/ 1.2M</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryCostData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
              <div className="text-lg font-black text-amber-400">S/ 1.2M</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryCostData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 text-[11px]">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Requests & Camp Occupancy & Mobile Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Requests table */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-100">Solicitudes Recientes de Beneficios</h3>
            <button
              onClick={() => onNavigate('benefit-requests')}
              className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Solicitante</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Detalle Familiar</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{req.requesterName}</td>
                    <td className="p-3 text-amber-300 font-medium">{req.category}</td>
                    <td className="p-3 text-slate-400">{req.familyMember}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          req.status === 'Aprobado'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Camp Occupancy Progress Bars */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-100">Ocupación de Campamentos</h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Campamento Norte (Las Bambas)</span>
                <span className="text-emerald-400 font-bold">73%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '73%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Campamento Central</span>
                <span className="text-emerald-400 font-bold">72%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Campamento Sur (Yauri)</span>
                <span className="text-amber-400 font-bold">66%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '66%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-300">Campamento Base</span>
                <span className="text-blue-400 font-bold">45%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
