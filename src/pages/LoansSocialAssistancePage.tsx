import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  BookOpen,
  Calendar,
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  FileText,
  UserCheck,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';
import { PrestamoAyuda, AtencionSocial, VisitaDomiciliaria, Worker } from '../types';
import { encryptAES256, decryptAES256 } from '../utils/securityCrypto';

interface LoansSocialAssistancePageProps {
  prestamos: PrestamoAyuda[];
  atenciones: AtencionSocial[];
  visitas: VisitaDomiciliaria[];
  workers: Worker[];
  onAddPrestamo: (prestamo: PrestamoAyuda) => void;
  onUpdatePrestamo: (prestamo: PrestamoAyuda) => void;
  onDeletePrestamo: (id: string) => void;
  onAddAtencion: (atencion: AtencionSocial) => void;
  onDeleteAtencion: (id: string) => void;
  currentTenantName: string;
}

export const LoansSocialAssistancePage: React.FC<LoansSocialAssistancePageProps> = ({
  prestamos,
  atenciones,
  visitas,
  workers,
  onAddPrestamo,
  onUpdatePrestamo,
  onDeletePrestamo,
  onAddAtencion,
  onDeleteAtencion,
  currentTenantName,
}) => {
  const [activeTab, setActiveTab] = useState<'prestamos' | 'atenciones' | 'visitas'>('prestamos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isAtencionModalOpen, setIsAtencionModalOpen] = useState(false);
  const [decryptedAtencionId, setDecryptedAtencionId] = useState<string | null>(null);

  // Prestamo Form state
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [tipoSocorro, setTipoSocorro] = useState<PrestamoAyuda['tipoSocorro']>('Préstamo Emergencia');
  const [montoSolicitado, setMontoSolicitado] = useState(1500);
  const [cuotasTotales, setCuotasTotales] = useState(4);
  const [motivoSolicitud, setMotivoSolicitud] = useState('Préstamo de salud familiar.');

  // Atencion Form state
  const [socialReason, setSocialReason] = useState<AtencionSocial['motivoConsulta']>('Problema Familiar');
  const [informeConfidencial, setInformeConfidencial] = useState('Informe de evaluación socio familiar.');
  const [diagnosticoOcupacional, setDiagnosticoOcupacional] = useState('Estrés familiar secundario a carga económica.');
  const [planAccion, setPlanAccion] = useState('Se canaliza apoyo y seguimiento trimestral.');

  const activeLoans = prestamos.filter((p) => !p.deletedAt);
  const activeAtenciones = atenciones.filter((a) => !a.deletedAt);
  const activeVisitas = visitas.filter((v) => !v.deletedAt);

  const filteredLoans = activeLoans.filter((l) =>
    l.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || l.workerDni.includes(searchTerm)
  );

  const filteredAtenciones = activeAtenciones.filter((a) =>
    a.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || a.workerDni.includes(searchTerm)
  );

  const filteredVisitas = activeVisitas.filter((v) =>
    v.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || v.workerDni.includes(searchTerm)
  );

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const cronograma = Array.from({ length: cuotasTotales }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      return {
        nroCuota: i + 1,
        fechaVencimiento: date.toISOString().split('T')[0],
        montoCuota: montoSolicitado / cuotasTotales,
        estado: 'Pendiente' as const,
      };
    });

    const newLoan: PrestamoAyuda = {
      idPrestamo: `PRES-04-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      tipoSocorro,
      montoSolicitado,
      tasaInteresSocial: 0,
      cuotasTotales,
      cronogramaCuotas: cronograma,
      estadoPrestamo: 'Pendiente Aprobación',
      motivoSolicitud,
      unidadMinera: currentTenantName,
    };

    onAddPrestamo(newLoan);
    setIsLoanModalOpen(false);
  };

  const handleCreateAtencion = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const newAtencion: AtencionSocial = {
      idAtencion: `ATEN-06-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      asistenteSocial: 'Lic. Ana Paredes',
      fechaAtencion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      motivoConsulta: socialReason,
      informePsicopericialCifrado: encryptAES256(informeConfidencial),
      diagnosticoOcupacional,
      planAccionSocial: planAccion,
      estadoCaso: 'Abierto',
      unidadMinera: currentTenantName,
    };

    onAddAtencion(newAtencion);
    setIsAtencionModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Préstamos, Asistencias y Visitas Sociales</h1>
            <p className="text-xs text-slate-400 font-medium">
              Tablas <span className="font-bold text-amber-400">04_Prestamos</span>, <span className="font-bold text-indigo-400">06_Atenciones</span> y <span className="font-bold text-purple-400">07_Visitas</span> con soporte corporativo
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === 'prestamos' && (
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Solicitar Préstamo Tasa 0%
            </button>
          )}
          {activeTab === 'atenciones' && (
            <button
              onClick={() => setIsAtencionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Registrar Caso Social ATEN-06
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('prestamos')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'prestamos' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          💳 Tabla 04: Préstamos Sociales ({filteredLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('atenciones')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'atenciones' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📂 Tabla 06: Casos y Atenciones ({filteredAtenciones.length})
        </button>
        <button
          onClick={() => setActiveTab('visitas')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'visitas' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🏡 Tabla 07: Visitas Domiciliarias ({filteredVisitas.length})
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por trabajador o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
          />
        </div>
      </div>

      {/* Content Render based on Active Tab */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        {activeTab === 'prestamos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Código Pres.</th>
                  <th className="p-3.5">Trabajador (DNI)</th>
                  <th className="p-3.5">Tipo Auxilio / Motivo</th>
                  <th className="p-3.5">Monto Solicitado</th>
                  <th className="p-3.5">Cuotas / Cronograma</th>
                  <th className="p-3.5">Estado Planilla</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No hay préstamos registrados.</td>
                  </tr>
                ) : (
                  filteredLoans.map((l) => (
                    <tr key={l.idPrestamo} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-amber-400">{l.idPrestamo}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{l.workerName}</div>
                        <div className="text-[10px] text-slate-400">DNI: {l.workerDni}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{l.tipoSocorro}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{l.motivoSolicitud}</div>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">
                        S/. {l.montoSolicitado.toLocaleString()}
                        <div className="text-[9px] text-slate-400 font-normal">Tasa: {l.tasaInteresSocial}%</div>
                      </td>
                      <td className="p-3.5 text-[10px]">
                        <div>Cuotas: {l.cuotasTotales}</div>
                        <div className="text-[9px] text-amber-300 font-semibold">
                          Cronograma: {l.cronogramaCuotas.filter(c => c.estado === 'Pendiente').length} pendientes
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {l.estadoPrestamo}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onDeletePrestamo(l.idPrestamo)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20"
                          title="Borrado Lógico"
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
        )}

        {activeTab === 'atenciones' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Código Aten.</th>
                  <th className="p-3.5">Trabajador (DNI)</th>
                  <th className="p-3.5">Asistente / Fecha</th>
                  <th className="p-3.5">Motivo / Diagnóstico</th>
                  <th className="p-3.5">Informe Psicopericial (AES-256)</th>
                  <th className="p-3.5">Plan de Acción</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAtenciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No hay atenciones sociales registradas.</td>
                  </tr>
                ) : (
                  filteredAtenciones.map((a) => {
                    const isDecrypted = decryptedAtencionId === a.idAtencion;
                    const decReport = decryptAES256(a.informePsicopericialCifrado);

                    return (
                      <tr key={a.idAtencion} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono font-bold text-indigo-400">{a.idAtencion}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-100">{a.workerName}</div>
                          <div className="text-[10px] text-slate-400">DNI: {a.workerDni}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">{a.asistenteSocial}</div>
                          <div className="text-[10px] text-slate-400">{a.fechaAtencion}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-300">{a.motivoConsulta}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{a.diagnosticoOcupacional}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setDecryptedAtencionId(isDecrypted ? null : a.idAtencion)}
                              className="p-1 bg-slate-950 rounded border border-slate-800 text-slate-400 hover:text-amber-400"
                            >
                              {isDecrypted ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                            <div className="truncate text-[10px] font-mono">
                              {isDecrypted ? decReport : a.informePsicopericialCifrado.substring(0, 15) + '...'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300 truncate max-w-[150px]">{a.planAccionSocial}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => onDeleteAtencion(a.idAtencion)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'visitas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Código Visita</th>
                  <th className="p-3.5">Trabajador (DNI)</th>
                  <th className="p-3.5">Fecha / Asistente</th>
                  <th className="p-3.5">Puntaje Habitabilidad</th>
                  <th className="p-3.5">Ingreso Familiar Mensual</th>
                  <th className="p-3.5">Socioeconómico</th>
                  <th className="p-3.5">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredVisitas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No hay visitas domiciliarias registradas.</td>
                  </tr>
                ) : (
                  filteredVisitas.map((v) => (
                    <tr key={v.idVisita} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-purple-400">{v.idVisita}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{v.workerName}</div>
                        <div className="text-[10px] text-slate-400">DNI: {v.workerDni}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{v.fechaVisita}</div>
                        <div className="text-[10px] text-slate-400">{v.asistenteSocial}</div>
                      </td>
                      <td className="p-3.5 font-bold text-indigo-300">
                        {v.puntajeHabitabilidad} / 100
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">
                        S/. {v.ingresoFamiliarMensual.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-semibold text-purple-300">
                        {v.situacionSocioeconomica}
                      </td>
                      <td className="p-3.5 text-slate-300 truncate max-w-xs">{v.observacionesSoporte}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loan Request Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                Solicitar Préstamo Tasa 0%
              </h3>
              <button onClick={() => setIsLoanModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trabajador Beneficiario:</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Monto Solicitado (S/.):</label>
                  <input
                    type="number"
                    min={100}
                    value={montoSolicitado}
                    onChange={(e) => setMontoSolicitado(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cuotas Mensuales:</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={cuotasTotales}
                    onChange={(e) => setCuotasTotales(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Motivo del Préstamo:</label>
                <textarea
                  rows={2}
                  value={motivoSolicitud}
                  onChange={(e) => setMotivoSolicitud(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg"
                >
                  Registrar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Social Modal */}
      {isAtencionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Registrar Atendimiento Social ATEN-06
              </h3>
              <button onClick={() => setIsAtencionModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAtencion} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trabajador Beneficiario:</label>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Motivo Consulta:</label>
                <select
                  value={socialReason}
                  onChange={(e) => setSocialReason(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                >
                  <option value="Problema Familiar">Problema Familiar</option>
                  <option value="Salud Crónica">Salud Crónica</option>
                  <option value="Apoyo Económico">Apoyo Económico</option>
                  <option value="Clima Laboral">Clima Laboral</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Informe Psicopericial Confidencial (Se cifrará con AES-256 en reposo):
                </label>
                <textarea
                  rows={2}
                  value={informeConfidencial}
                  onChange={(e) => setInformeConfidencial(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Diagnóstico Ocupacional:</label>
                <input
                  type="text"
                  required
                  value={diagnosticoOcupacional}
                  onChange={(e) => setDiagnosticoOcupacional(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Plan de Acción:</label>
                <input
                  type="text"
                  required
                  value={planAccion}
                  onChange={(e) => setPlanAccion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAtencionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg"
                >
                  Guardar Caso Social
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
