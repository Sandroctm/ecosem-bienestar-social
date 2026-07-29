import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Utensils,
  BedDouble,
  UserCheck,
  Plus,
} from 'lucide-react';
import { AttendanceRecord, Worker } from '../types';
import { QRBadgeGenerator } from '../components/QRBadgeGenerator';
import { exportToExcel } from '../utils/excelExport';

interface QRAttendancePageProps {
  attendanceRecords: AttendanceRecord[];
  workers: Worker[];
  onOpenScanner: () => void;
  onExportExcel: () => void;
}

export const QRAttendancePage: React.FC<QRAttendancePageProps> = ({
  attendanceRecords,
  workers,
  onOpenScanner,
  onExportExcel,
}) => {
  const [selectedWorkerForBadge, setSelectedWorkerForBadge] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('Todos');

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchesSearch =
      rec.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.workerDni.includes(searchTerm) ||
      rec.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'Todos' || rec.serviceType === serviceFilter;
    return matchesSearch && matchesService;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <QrCode className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Control y Registro de Asistencia por QR</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validación biométrica y de raciones de comedores / alojamiento con sincronización en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-lg"
          >
            <Smartphone className="w-4 h-4" />
            Escanear Asistencia QR
          </button>
          
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Asistencia (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats raciones bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Marcaciones Hoy</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{attendanceRecords.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-blue-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Almuerzos Servidos</span>
          <div className="text-xl font-extrabold text-blue-400 mt-1">
            {attendanceRecords.filter((r) => r.serviceType === 'Almuerzo').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ingresos a Campamento</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {attendanceRecords.filter((r) => r.serviceType === 'Alojamiento' || r.serviceType === 'Ingreso Campamento').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Efectividad Biológica</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1">100% Válido</div>
        </div>
      </div>

      {/* Workers Fotocheck Showcase */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Fotochecks QR Registrados</h3>
            <p className="text-[11px] text-slate-400">Haga clic en cualquier trabajador para ver e imprimir su Fotocheck QR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {workers.map((w) => (
            <div
              key={w.id}
              onClick={() => setSelectedWorkerForBadge(w)}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-1 group text-center"
            >
              <img
                src={w.photoUrl}
                alt={w.fullName}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-amber-500/40 group-hover:border-amber-400 mb-2"
              />
              <div className="font-bold text-xs text-slate-100 truncate">{w.fullName}</div>
              <div className="text-[10px] text-slate-400 truncate">{w.company}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <QrCode className="w-3 h-3" /> Ver Pass QR
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-100">Historial de Marcaciones de Asistencia</h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por DNI o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
            >
              <option value="Todos">Todos los Servicios</option>
              <option value="Desayuno">Desayuno</option>
              <option value="Almuerzo">Almuerzo</option>
              <option value="Cena">Cena</option>
              <option value="Alojamiento">Alojamiento</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">DNI</th>
                <th className="p-3">Trabajador</th>
                <th className="p-3">Empresa Contratista</th>
                <th className="p-3">Campamento</th>
                <th className="p-3">Servicio / Marcación</th>
                <th className="p-3">Dispositivo / Garita</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{rec.timestamp}</td>
                  <td className="p-3 font-bold text-amber-400">{rec.workerDni}</td>
                  <td className="p-3 font-semibold text-slate-100">{rec.workerName}</td>
                  <td className="p-3 text-slate-400">{rec.company}</td>
                  <td className="p-3 text-slate-300">{rec.camp}</td>
                  <td className="p-3 font-bold text-amber-300">{rec.serviceType}</td>
                  <td className="p-3 text-slate-400">{rec.scannedBy}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Badge Modal */}
      {selectedWorkerForBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative">
            <QRBadgeGenerator
              worker={selectedWorkerForBadge}
              onClose={() => setSelectedWorkerForBadge(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
