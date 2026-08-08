import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  CheckCircle2,
  XCircle,
  Building,
  ShieldAlert,
  Clock,
  ArrowRight,
  FileCheck,
  Search,
  DollarSign,
} from 'lucide-react';
import { SolicitudAprobacion, Worker } from '../types';

interface BereavementWorkflowPageProps {
  solicitudes: SolicitudAprobacion[];
  workers: Worker[];
  onAddSolicitud: (solicitud: SolicitudAprobacion) => void;
  onUpdateSolicitud: (solicitud: SolicitudAprobacion) => void;
  currentTenantName: string;
}

export const BereavementWorkflowPage: React.FC<BereavementWorkflowPageProps> = ({
  solicitudes,
  workers,
  onAddSolicitud,
  onUpdateSolicitud,
  currentTenantName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [tipoSolicitud, setTipoSolicitud] = useState<SolicitudAprobacion['tipoSolicitud']>('Auxilio por Defunción');
  const [monto, setMonto] = useState(3500);
  const [documentoRespaldoUrl, setDocumentoRespaldoUrl] = useState('acta_defuncion_ingresada.pdf');

  const filtered = solicitudes.filter(
    (s) =>
      s.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.workerDni.includes(searchTerm) ||
      s.tipoSolicitud.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const newSolicitud: SolicitudAprobacion = {
      idSolicitud: `SOL-12-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      tipoSolicitud,
      monto,
      nivelAprobacion1: 'Aprobado RRHH',
      aprobador1User: 'Jefe RRHH Lic. Carlos Mota',
      fechaAprobacion1: new Date().toISOString().replace('T', ' ').substring(0, 16),
      nivelAprobacion2: 'Pendiente',
      estadoWorkflow: 'En Revisión Gerencia',
      documentoRespaldoUrl,
      unidadMinera: currentTenantName,
    };

    onAddSolicitud(newSolicitud);
    setIsModalOpen(false);
  };

  const handleApproveLevel2 = (sol: SolicitudAprobacion) => {
    const updated: SolicitudAprobacion = {
      ...sol,
      nivelAprobacion2: 'Aprobado Gerencia',
      aprobador2User: 'Gerencia General ECOSEM',
      fechaAprobacion2: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estadoWorkflow: 'Aprobado y Desembolsado',
    };
    onUpdateSolicitud(updated);
  };

  const handleReject = (sol: SolicitudAprobacion) => {
    const updated: SolicitudAprobacion = {
      ...sol,
      nivelAprobacion2: 'Rechazado',
      estadoWorkflow: 'Rechazado',
    };
    onUpdateSolicitud(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-100">Workflow Express: Sepelio, Auxilios y Vida Ley</h1>
              <p className="text-xs text-slate-400 font-medium">
                Tabla <span className="font-bold text-amber-400">12_Solicitudes_Aprobaciones</span> • Aprobación Jerárquica RRHH ➔ Gerencia
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
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Solicitud Contingencia
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Solicitudes Contingencia</div>
            <div className="text-xl font-bold text-slate-100">{solicitudes.length}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Monto Aprobado y Desembolsado</div>
            <div className="text-xl font-bold text-emerald-300">
              S/.{' '}
              {solicitudes
                .filter((s) => s.estadoWorkflow === 'Aprobado y Desembolsado')
                .reduce((acc, curr) => acc + curr.monto, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tiempo de Respuesta Express</div>
            <div className="text-xl font-bold text-indigo-300">&lt; 2 Horas</div>
          </div>
        </div>
      </div>

      {/* Main Table 12 */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            Flujo de Aprobaciones Jerárquicas (12_Solicitudes_Aprobaciones)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trabajador o tipo de auxilio..."
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
                <th className="p-3.5">ID Solicitud</th>
                <th className="p-3.5">Trabajador (DNI)</th>
                <th className="p-3.5">Tipo y Monto</th>
                <th className="p-3.5">Nivel 1: Jefatura RRHH</th>
                <th className="p-3.5">Nivel 2: Gerencia General</th>
                <th className="p-3.5">Estado Workflow</th>
                <th className="p-3.5 text-right">Aprobación Gerencial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No hay solicitudes registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.idSolicitud} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-amber-400">{s.idSolicitud}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{s.workerName}</div>
                      <div className="text-[11px] text-slate-400">DNI: {s.workerDni}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-amber-300">{s.tipoSolicitud}</div>
                      <div className="text-xs font-bold text-emerald-400">S/. {s.monto.toLocaleString()}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {s.nivelAprobacion1}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.aprobador1User}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.nivelAprobacion2 === 'Aprobado Gerencia'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : s.nivelAprobacion2 === 'Rechazado'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {s.nivelAprobacion2}
                      </span>
                      {s.aprobador2User && <div className="text-[10px] text-slate-400 mt-0.5">{s.aprobador2User}</div>}
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">
                      {s.estadoWorkflow === 'Aprobado y Desembolsado' ? (
                        <span className="text-emerald-400">✓ Aprobado y Desembolsado</span>
                      ) : (
                        <span className="text-amber-400">{s.estadoWorkflow}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {s.nivelAprobacion2 === 'Pendiente' ? (
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleApproveLevel2(s)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow"
                          >
                            Autorizar
                          </button>
                          <button
                            onClick={() => handleReject(s)}
                            className="px-2 py-1 text-[11px] font-bold bg-slate-800 hover:bg-rose-600/30 text-rose-400 rounded-lg border border-slate-700 transition"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Concluido</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Solicitud */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                Registrar Solicitud Express de Sepelio / Auxilio
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trabajador / Derechohabiente:</label>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Solicitud de Contingencia:</label>
                <select
                  value={tipoSolicitud}
                  onChange={(e) => setTipoSolicitud(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-amber-300"
                >
                  <option value="Auxilio por Defunción">Auxilio por Defunción</option>
                  <option value="Activación Seguro Vida Ley">Activación Seguro Vida Ley</option>
                  <option value="Préstamo de Emergencia">Préstamo de Emergencia</option>
                  <option value="Gasto de Sepelio Inmediato">Gasto de Sepelio Inmediato</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Monto Solicitado (S/.):</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-emerald-400"
                />
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
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg"
                >
                  Generar y Enviar a Gerencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
