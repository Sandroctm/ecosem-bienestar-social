import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Trash2,
} from 'lucide-react';
import { SCTRPoliza, Worker } from '../types';

interface SCTRManagementPageProps {
  sctrs: SCTRPoliza[];
  workers: Worker[];
  onAddSctr: (sctr: SCTRPoliza) => void;
  onUpdateSctr: (sctr: SCTRPoliza) => void;
  onDeleteSctr: (id: string) => void;
  currentTenantName: string;
}

export const SCTRManagementPage: React.FC<SCTRManagementPageProps> = ({
  sctrs,
  workers,
  onAddSctr,
  onUpdateSctr,
  onDeleteSctr,
  currentTenantName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [tipoPoliza, setTipoPoliza] = useState<SCTRPoliza['tipoPoliza']>('SCTR Salud');
  const [nroPoliza, setNroPoliza] = useState('POL-SCTR-999-PACIFICO');
  const [aseguradora, setAseguradora] = useState('Pacífico Seguros');
  const [fechaVigenciaInicio, setFechaVigenciaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaVigenciaFin, setFechaVigenciaFin] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const activeSctrs = sctrs.filter((s) => !s.deletedAt);
  const filtered = activeSctrs.filter(
    (s) =>
      s.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.workerDni.includes(searchTerm) ||
      s.nroPoliza.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isExpired = fechaVigenciaFin < todayStr;

    const newSctr: SCTRPoliza = {
      idPoliza: `POL-05-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      company: worker.company,
      tipoPoliza,
      nroPoliza,
      aseguradora,
      fechaVigenciaInicio,
      fechaVigenciaFin,
      estadoPaseMina: isExpired ? 'Bloqueado SCTR Vencido' : 'Habilitado',
      unidadMinera: currentTenantName,
    };

    onAddSctr(newSctr);
    setIsModalOpen(false);
  };

  const handleTogglePaseMina = (sctr: SCTRPoliza) => {
    const nextStatus = sctr.estadoPaseMina === 'Habilitado' ? 'Bloqueado SCTR Vencido' : 'Habilitado';
    onUpdateSctr({ ...sctr, estadoPaseMina: nextStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Vigilancia Pases SCTR y Pólizas</h1>
            <p className="text-xs text-slate-400 font-medium">
              Tabla <span className="font-bold text-indigo-400">05_SCTR_Polizas</span> • Control de bloqueos en garita de ingreso
            </p>
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
            Vincular Póliza SCTR
          </button>
        </div>
      </div>

      {/* SCTR alerts summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Pases Habilitados</div>
            <div className="text-xl font-bold text-emerald-400">
              {activeSctrs.filter((s) => s.estadoPaseMina === 'Habilitado').length}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Bloqueados SCTR Vencido</div>
            <div className="text-xl font-bold text-rose-400">
              {activeSctrs.filter((s) => s.estadoPaseMina === 'Bloqueado SCTR Vencido').length}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Pólizas Pendiente Renovación</div>
            <div className="text-xl font-bold text-amber-300">
              {activeSctrs.filter((s) => s.estadoPaseMina === 'Pendiente Renovación').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table 05 */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-sm font-bold text-slate-200">
            Control de Vigencia SCTR (POL-XXX)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trabajador, póliza o empresa..."
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
                <th className="p-3.5">Código Póliza</th>
                <th className="p-3.5">Trabajador (DNI) / Empresa</th>
                <th className="p-3.5">Tipo Cobertura</th>
                <th className="p-3.5">Nro Póliza / Aseguradora</th>
                <th className="p-3.5">Fecha Vigencia Fin</th>
                <th className="p-3.5">Acceso Mina</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron pólizas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.idPoliza} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-400">{s.idPoliza}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{s.workerName}</div>
                      <div className="text-[10px] text-slate-400">DNI: {s.workerDni} • {s.company}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-300">{s.tipoPoliza}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{s.nroPoliza}</div>
                      <div className="text-[10px] text-slate-400">{s.aseguradora}</div>
                    </td>
                    <td className="p-3.5 text-[11px] font-bold">
                      <span
                        className={
                          s.fechaVigenciaFin < new Date().toISOString().split('T')[0]
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }
                      >
                        {s.fechaVigenciaFin}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleTogglePaseMina(s)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          s.estadoPaseMina === 'Habilitado'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {s.estadoPaseMina}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteSctr(s.idPoliza)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Vincular SCTR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                Vincular Póliza SCTR
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trabajador:</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                >
                  <option value="">-- Seleccionar Trabajador --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} (DNI: {w.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Póliza:</label>
                <select
                  value={tipoPoliza}
                  onChange={(e) => setTipoPoliza(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                >
                  <option value="SCTR Salud">SCTR Salud</option>
                  <option value="SCTR Pensión">SCTR Pensión</option>
                  <option value="Vida Ley">Vida Ley</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nro Póliza:</label>
                  <input
                    type="text"
                    required
                    value={nroPoliza}
                    onChange={(e) => setNroPoliza(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Aseguradora:</label>
                  <input
                    type="text"
                    required
                    value={aseguradora}
                    onChange={(e) => setAseguradora(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Vigencia Inicio:</label>
                  <input
                    type="date"
                    required
                    value={fechaVigenciaInicio}
                    onChange={(e) => setFechaVigenciaInicio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Vigencia Fin:</label>
                  <input
                    type="date"
                    required
                    value={fechaVigenciaFin}
                    onChange={(e) => setFechaVigenciaFin(e.target.value)}
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
                  Vincular Póliza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
