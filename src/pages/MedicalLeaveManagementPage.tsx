import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Lock,
  Unlock,
  Trash2,
  Building,
  ShieldAlert,
  ArrowDownToLine,
  RefreshCw,
  Search,
} from 'lucide-react';
import { DescansoMedico, Worker } from '../types';
import { calculateEssaludSubsidy } from '../utils/businessRulesEngine';
import { encryptAES256, decryptAES256 } from '../utils/securityCrypto';

interface MedicalLeaveManagementPageProps {
  descansos: DescansoMedico[];
  workers: Worker[];
  onAddDescanso: (descanso: DescansoMedico) => void;
  onUpdateDescanso: (descanso: DescansoMedico) => void;
  onDeleteDescanso: (idDescanso: string) => void;
  currentTenantName: string;
}

export const MedicalLeaveManagementPage: React.FC<MedicalLeaveManagementPageProps> = ({
  descansos,
  workers,
  onAddDescanso,
  onUpdateDescanso,
  onDeleteDescanso,
  currentTenantName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decryptedId, setDecryptedId] = useState<string | null>(null);

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [diasDescanso, setDiasDescanso] = useState(10);
  const [tipoDescanso, setTipoDescanso] = useState<DescansoMedico['tipoDescanso']>('Descanso Común');
  const [cie10Codigo, setCie10Codigo] = useState('M54.5 - Lumbago agudo');
  const [sueldoPromedio, setSueldoPromedio] = useState(3000);

  const activeLeaves = descansos.filter((d) => !d.deletedAt);
  const filtered = activeLeaves.filter(
    (d) =>
      d.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.workerDni.includes(searchTerm) ||
      d.cie10Codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calc = calculateEssaludSubsidy(sueldoPromedio, diasDescanso);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const newLeave: DescansoMedico = {
      idDescanso: `DESC-03-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      company: worker.company,
      fechaInicio,
      fechaFin,
      diasDescanso,
      tipoDescanso,
      diasEmpresa: calc.diasEmpresa,
      diasEssalud: calc.diasEssalud,
      montoSubsidioEstimado: calc.montoEssalud,
      estadoSubsidio: calc.diasEssalud > 0 ? 'Declarado VIVA' : 'Pendiente Planilla',
      cie10Codigo,
      cie10DiagnosticoEncrypted: encryptAES256(cie10Codigo),
      unidadMinera: currentTenantName,
    };

    onAddDescanso(newLeave);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (leave: DescansoMedico, newStatus: DescansoMedico['estadoSubsidio']) => {
    onUpdateDescanso({ ...leave, estadoSubsidio: newStatus });
  };

  const handleExportVivaZip = (leave: DescansoMedico) => {
    alert(
      `Generando Expediente de Reembolso oficial VIVA Essalud para el caso ${leave.idDescanso}.\n` +
      `Fórmula Aplicada: (${leave.diasEssalud} días Essalud) x S/. ${(leave.montoSubsidioEstimado / (leave.diasEssalud || 1)).toFixed(2)}/día.\n` +
      `Monto Reembolso: S/. ${leave.montoSubsidioEstimado.toFixed(2)}\n\n` +
      `[Archivos Generados]: st7_formulario.pdf, copia_dni_siniestrado.pdf, boletas_12_meses.pdf, firma_digital_representante.png`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Control de Descansos Médicos y Subsidios</h1>
            <p className="text-xs text-slate-400 font-medium">
              Tabla <span className="font-bold text-emerald-400">03_Descansos_Medicos</span> • 20 días cargo empresa vs 21+ días reembolso Essalud VIVA
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
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Registrar Descanso Médico
          </button>
        </div>
      </div>

      {/* Main Table 03 */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-sm font-bold text-slate-200">
            Registros Activos de Incapacidad Temporal (DESC-XXX)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trabajador, DNI o CIE-10..."
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
                <th className="p-3.5">Código / Período</th>
                <th className="p-3.5">Trabajador (DNI)</th>
                <th className="p-3.5">Tipo Descanso / Días</th>
                <th className="p-3.5">Subsidio Empresa / Essalud</th>
                <th className="p-3.5">Diagnóstico CIE-10</th>
                <th className="p-3.5">Estado Trámite</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron descansos médicos registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const isDecrypted = decryptedId === d.idDescanso;
                  const decryptedText = decryptAES256(d.cie10DiagnosticoEncrypted);

                  return (
                    <tr key={d.idDescanso} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-emerald-400">{d.idDescanso}</div>
                        <div className="text-[10px] text-slate-400">
                          {d.fechaInicio} a {d.fechaFin}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{d.workerName}</div>
                        <div className="text-[10px] text-slate-400">DNI: {d.workerDni}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold">{d.tipoDescanso}</span>
                        <div className="text-[11px] text-emerald-400 font-bold">{d.diasDescanso} días tot.</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-[10px] text-slate-400">Empresa: {d.diasEmpresa} días</div>
                        <div className="text-[10px] text-emerald-300 font-bold">
                          Essalud: {d.diasEssalud} días (S/. {d.montoSubsidioEstimado.toFixed(2)})
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDecryptedId(isDecrypted ? null : d.idDescanso)}
                            className="p-1 text-slate-400 hover:text-amber-400 bg-slate-950 rounded border border-slate-800"
                            title="Descifrar CIE-10"
                          >
                            {isDecrypted ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <div className="truncate text-[10px] font-mono">
                            {isDecrypted ? decryptedText : d.cie10DiagnosticoEncrypted.substring(0, 20) + '...'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={d.estadoSubsidio}
                          onChange={(e) => handleUpdateStatus(d, e.target.value as any)}
                          className="bg-slate-950 border border-slate-700 text-[10px] font-bold text-emerald-300 rounded-lg p-1"
                        >
                          <option value="Pendiente Planilla">Pendiente Planilla</option>
                          <option value="Declarado VIVA">Declarado VIVA</option>
                          <option value="Reembolsado">Reembolsado</option>
                          <option value="Observado">Observado</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {d.diasEssalud > 0 && (
                          <button
                            onClick={() => handleExportVivaZip(d)}
                            className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded border border-indigo-500/30"
                            title="Generar Expediente ZIP VIVA"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteDescanso(d.idDescanso)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20"
                          title="Eliminación Lógica"
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
      </div>

      {/* Modal Agregar Descanso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Registrar Descanso Médico y Subsidio
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trabajador Ocupante:</label>
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
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Incapacidad:</label>
                  <select
                    value={tipoDescanso}
                    onChange={(e) => setTipoDescanso(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  >
                    <option value="Descanso Común">Descanso Común</option>
                    <option value="Accidente de Trabajo">Accidente de Trabajo</option>
                    <option value="Maternidad">Maternidad</option>
                    <option value="Enfermedad Profesional">Enfermedad Profesional</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Diagnóstico CIE-10:</label>
                  <input
                    type="text"
                    required
                    value={cie10Codigo}
                    onChange={(e) => setCie10Codigo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Días Descanso:</label>
                  <input
                    type="number"
                    min={1}
                    value={diasDescanso}
                    onChange={(e) => setDiasDescanso(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sueldo Base (S/.):</label>
                  <input
                    type="number"
                    min={1000}
                    value={sueldoPromedio}
                    onChange={(e) => setSueldoPromedio(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fórmula Essalud:</label>
                  <div className="text-[10px] text-slate-400 font-mono pt-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    S/. {calc.montoEssalud.toFixed(2)} ({calc.diasEssalud}d)
                  </div>
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
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg"
                >
                  Guardar Descanso Médico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
