import React, { useState } from 'react';
import {
  Home,
  Bed,
  Plus,
  Building,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Shirt,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { CampamentoHabitacion, Worker } from '../types';

interface CampHousingManagementPageProps {
  campamentos: CampamentoHabitacion[];
  workers: Worker[];
  onAddAsignacion: (asignacion: CampamentoHabitacion) => void;
  onUpdateAsignacion: (asignacion: CampamentoHabitacion) => void;
  currentTenantName: string;
}

export const CampHousingManagementPage: React.FC<CampHousingManagementPageProps> = ({
  campamentos,
  workers,
  onAddAsignacion,
  onUpdateAsignacion,
  currentTenantName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [moduloHabitacion, setModuloHabitacion] = useState('Módulo C1 - Pabellón Minero 02');
  const [camaAsignada, setCamaAsignada] = useState('Cama A-202');
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
  const [fechaSalida, setFechaSalida] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [estadoHabitacion, setEstadoHabitacion] = useState<CampamentoHabitacion['estadoHabitacion']>('Limpia / Asignada');

  const filtered = campamentos.filter(
    (c) =>
      c.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.workerDni.includes(searchTerm) ||
      c.moduloHabitacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const newAsignacion: CampamentoHabitacion = {
      idAsignacion: `CAM-10-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      company: worker.company,
      moduloHabitacion,
      camaAsignada,
      fechaIngreso,
      fechaSalida,
      estadoHabitacion,
      registroLavandería: `${new Date().toISOString().split('T')[0]} (Insumos sanitizados)`,
      pagoHigieneEstado: 'Conforme',
      unidadMinera: currentTenantName,
    };

    onAddAsignacion(newAsignacion);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (
    asig: CampamentoHabitacion,
    newStatus: CampamentoHabitacion['estadoHabitacion']
  ) => {
    onUpdateAsignacion({ ...asig, estadoHabitacion: newStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-100">Gestión de Vivienda y Campamentos Mineros</h1>
              <p className="text-xs text-slate-400 font-medium">
                Tabla <span className="font-bold text-indigo-400">10_Campamento_Habitaciones</span> • Asignación de Camas, Lavandería y Convivencia
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>{currentTenantName}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Asignar Cama en Campamento
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Camas Asignadas Activas</div>
            <div className="text-xl font-bold text-slate-100">{campamentos.length}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Control Lavandería Al Día</div>
            <div className="text-xl font-bold text-indigo-300">100% Sanitizado</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Estándar Convivencia Minera</div>
            <div className="text-xl font-bold text-amber-300">Conforme SSO</div>
          </div>
        </div>
      </div>

      {/* Filter and Table 10 */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Bed className="w-4 h-4 text-indigo-400" />
            Asignaciones Logísticas de Pernocte (10_Campamento_Habitaciones)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trabajador, DNI o módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5">ID Asignación</th>
                <th className="p-3.5">Trabajador / Empresa</th>
                <th className="p-3.5">Módulo y Cama</th>
                <th className="p-3.5">Período Pernocte</th>
                <th className="p-3.5">Control Lavandería</th>
                <th className="p-3.5">Estado Habitación</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron asignaciones de campamento.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.idAsignacion} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-400">{c.idAsignacion}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{c.workerName}</div>
                      <div className="text-[11px] text-slate-400">DNI: {c.workerDni} • {c.company}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-indigo-300">{c.moduloHabitacion}</div>
                      <div className="text-[11px] text-slate-400 font-bold">{c.camaAsignada}</div>
                    </td>
                    <td className="p-3.5 text-[11px]">
                      <div>Del: <span className="font-bold text-slate-200">{c.fechaIngreso}</span></div>
                      <div>Al: <span className="font-bold text-slate-200">{c.fechaSalida}</span></div>
                    </td>
                    <td className="p-3.5 text-[11px]">
                      <div className="text-slate-300">{c.registroLavandería}</div>
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Higiene Conforme</span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={c.estadoHabitacion}
                        onChange={(e) =>
                          handleUpdateStatus(c, e.target.value as CampamentoHabitacion['estadoHabitacion'])
                        }
                        className="bg-slate-950 border border-slate-700 text-[11px] font-bold text-indigo-300 rounded-lg p-1 outline-none"
                      >
                        <option value="Limpia / Asignada">Limpia / Asignada</option>
                        <option value="Revisión Lavandería">Revisión Lavandería</option>
                        <option value="Desinfección Pendiente">Desinfección Pendiente</option>
                        <option value="Inspeccionada Convivencia">Inspeccionada Convivencia</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleUpdateStatus(c, 'Inspeccionada Convivencia')}
                        className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg border border-indigo-500/30"
                      >
                        Aprobar Inspección
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Asignar Cama */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Bed className="w-5 h-5 text-indigo-400" />
                Asignar Cama en Campamento Minero
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Seleccionar Trabajador:</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                >
                  <option value="">-- Seleccionar Trabajador --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} (DNI: {w.dni}) - {w.camp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Módulo de Vivienda:</label>
                <input
                  type="text"
                  required
                  value={moduloHabitacion}
                  onChange={(e) => setModuloHabitacion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cama Asignada:</label>
                <input
                  type="text"
                  required
                  value={camaAsignada}
                  onChange={(e) => setCamaAsignada(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-indigo-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fecha Ingreso:</label>
                  <input
                    type="date"
                    required
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fecha Salida:</label>
                  <input
                    type="date"
                    required
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg"
                >
                  Registrar Asignación Cama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
