import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Lock,
  Unlock,
  Calculator,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Building,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { AccidenteTrabajo, Worker } from '../types';
import { calculateEssaludSubsidy, checkWorkerAccessPass } from '../utils/businessRulesEngine';
import { encryptAES256, decryptAES256 } from '../utils/securityCrypto';

interface AccidentsSubsidiesPageProps {
  accidentes: AccidenteTrabajo[];
  workers: Worker[];
  onAddAccident: (accident: AccidenteTrabajo) => void;
  onUpdateAccident: (accident: AccidenteTrabajo) => void;
  currentTenantName: string;
}

export const AccidentsSubsidiesPage: React.FC<AccidentsSubsidiesPageProps> = ({
  accidentes,
  workers,
  onAddAccident,
  onUpdateAccident,
  currentTenantName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decryptedId, setDecryptedId] = useState<string | null>(null);

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [fechaSiniestro, setFechaSiniestro] = useState(new Date().toISOString().substring(0, 16));
  const [lugarAccidente, setLugarAccidente] = useState('Socavón Subterráneo Nivel 400');
  const [gravedad, setGravedad] = useState<'Leve' | 'Incapacitante Temporal' | 'Incapacitante Permanente' | 'Mortal'>('Incapacitante Temporal');
  const [tipoAccidente, setTipoAccidente] = useState<'Trabajo Directo' | 'Accidente de Trayecto' | 'Enfermedad Ocupacional'>('Trabajo Directo');
  const [numST7, setNumST7] = useState(`ST7-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
  const [diasIncapacidad, setDiasIncapacidad] = useState(30);
  const [sueldoPromedio, setSueldoPromedio] = useState(3500);
  const [cie10Codigo, setCie10Codigo] = useState('S82.1 - Fractura de tibia');

  // Real-time calculation preview
  const subsidyCalc = calculateEssaludSubsidy(sueldoPromedio, diasIncapacidad);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const newAccident: AccidenteTrabajo = {
      idAccidente: `ACC-09-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      fechaSiniestro,
      lugarAccidente,
      gravedad,
      tipoAccidente,
      numFormularioST7: numST7,
      diasIncapacidad,
      sueldoPromedio12Meses: sueldoPromedio,
      subsidioEmpresaDias: subsidyCalc.diasEmpresa,
      subsidioEmpresaMonto: subsidyCalc.montoEmpresa,
      subsidioEssaludDias: subsidyCalc.diasEssalud,
      subsidioEssaludMonto: subsidyCalc.montoEssalud,
      estadoViva: subsidyCalc.diasEssalud > 0 ? 'Generado' : 'Cobrado / Reembolsado',
      cie10Codigo,
      cie10DiagnosticoEncrypted: encryptAES256(cie10Codigo),
      unidadMinera: currentTenantName,
    };

    onAddAccident(newAccident);
    setIsModalOpen(false);
  };

  const toggleDecrypt = (idAccidente: string) => {
    setDecryptedId(decryptedId === idAccidente ? null : idAccidente);
  };

  const handleUpdateVivaStatus = (acc: AccidenteTrabajo, newStatus: AccidenteTrabajo['estadoViva']) => {
    onUpdateAccident({ ...acc, estadoViva: newStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-100">Accidentabilidad y Subsidios Essalud</h1>
              <p className="text-xs text-slate-400 font-medium">
                Tabla <span className="font-bold text-rose-400">09_Accidentes_Trabajo</span> • Formulario ST-7, VIVA Essalud y Cifrado AES-256 Ley N° 29733
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
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Registrar Accidente ST-7
          </button>
        </div>
      </div>

      {/* Essalud Business Rule Highlight Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Fórmula de Subsidio Essalud</span>
            <Calculator className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-mono font-bold text-emerald-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
            Subsidio = (Sueldo/30) × (Días - 20)
          </p>
          <p className="text-[11px] text-slate-400">Días 1-20: Cargo Empresa (100%) • Día 21+: Reembolso VIVA Essalud</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Seguridad Médica Cifrada</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300">Cifrado AES-256 Activo</div>
          <p className="text-[11px] text-slate-400">Diagnósticos CIE-10 cifrados en base de datos para privacidad de salud ocupacional.</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Triggers de Seguridad Activos</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-sm font-bold text-rose-300">Bloqueo Fotocheck SCTR</div>
          <p className="text-[11px] text-slate-400">Trabajadores con descanso médico activo quedan bloqueados en garita de mina.</p>
        </div>
      </div>

      {/* Main Table 09_Accidentes_Trabajo */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            Registros de Accidentes de Trabajo y Reembolsos (09_Accidentes_Trabajo)
          </h3>
          <span className="text-xs text-slate-400">Total: {accidentes.length} siniestros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Código / Fecha</th>
                <th className="p-3.5">Trabajador (DNI)</th>
                <th className="p-3.5">Gravedad / Tipo</th>
                <th className="p-3.5">ST-7 / Días</th>
                <th className="p-3.5">Cálculo Subsidio</th>
                <th className="p-3.5">CIE-10 (AES-256)</th>
                <th className="p-3.5">Estado VIVA</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {accidentes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No hay accidentes de trabajo registrados.
                  </td>
                </tr>
              ) : (
                accidentes.map((acc) => {
                  const isDecrypted = decryptedId === acc.idAccidente;
                  const decryptedText = decryptAES256(acc.cie10DiagnosticoEncrypted);

                  return (
                    <tr key={acc.idAccidente} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-rose-400">{acc.idAccidente}</div>
                        <div className="text-[11px] text-slate-400">{acc.fechaSiniestro}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{acc.workerName}</div>
                        <div className="text-[11px] text-slate-400">DNI: {acc.workerDni}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {acc.gravedad}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">{acc.tipoAccidente}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{acc.numFormularioST7}</div>
                        <div className="text-[11px] text-emerald-400 font-bold">{acc.diasIncapacidad} días inc.</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-[11px] text-slate-300">
                          Empresa (20d): <span className="font-bold text-slate-100">S/. {acc.subsidioEmpresaMonto.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400">
                          Essalud ({acc.subsidioEssaludDias}d): <span className="font-bold">S/. {acc.subsidioEssaludMonto.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleDecrypt(acc.idAccidente)}
                            className="p-1 text-slate-400 hover:text-amber-400 bg-slate-950 rounded border border-slate-800"
                            title={isDecrypted ? 'Ocultar Cifrado' : 'Descifrar Diagnóstico CIE-10'}
                          >
                            {isDecrypted ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <div className="truncate text-[11px]">
                            {isDecrypted ? (
                              <span className="text-amber-300 font-mono">{decryptedText}</span>
                            ) : (
                              <span className="text-slate-500 font-mono tracking-tighter truncate block max-w-[140px]">
                                {acc.cie10DiagnosticoEncrypted}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={acc.estadoViva}
                          onChange={(e) => handleUpdateVivaStatus(acc, e.target.value as AccidenteTrabajo['estadoViva'])}
                          className="bg-slate-950 border border-slate-700 text-[11px] font-bold text-emerald-300 rounded-lg p-1 outline-none"
                        >
                          <option value="Generado">Generado</option>
                          <option value="En Tramitación VIVA">En Tramitación VIVA</option>
                          <option value="Cobrado / Reembolsado">Cobrado / Reembolsado</option>
                          <option value="Observado Essalud">Observado Essalud</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => toggleDecrypt(acc.idAccidente)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                        >
                          {isDecrypted ? 'Ocultar' : 'Ver CIE-10'}
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

      {/* Modal para Registrar Accidente ST-7 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-400" />
                Registrar Accidente ST-7 y Calcular Subsidio
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Seleccionar Trabajador Siniestrado:</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                >
                  <option value="">-- Seleccionar Trabajador --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} (DNI: {w.dni}) - {w.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Formulario ST-7 Essalud:</label>
                  <input
                    type="text"
                    required
                    value={numST7}
                    onChange={(e) => setNumST7(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Siniestro:</label>
                  <select
                    value={tipoAccidente}
                    onChange={(e) => setTipoAccidente(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                  >
                    <option value="Trabajo Directo">Trabajo Directo</option>
                    <option value="Accidente de Trayecto">Accidente de Trayecto</option>
                    <option value="Enfermedad Ocupacional">Enfermedad Ocupacional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sueldo Promedio 12 Meses (S/.):</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={sueldoPromedio}
                    onChange={(e) => setSueldoPromedio(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Días de Descanso Médico:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={diasIncapacidad}
                    onChange={(e) => setDiasIncapacidad(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Código / Diagnóstico CIE-10 (Se cifrará en AES-256):</label>
                <input
                  type="text"
                  required
                  value={cie10Codigo}
                  onChange={(e) => setCie10Codigo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  placeholder="Ej: S82.1 - Fractura de tibia"
                />
              </div>

              {/* Real time mathematical calculation preview */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1.5 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> Cálculo Automático Matriz Essalud:
                </div>
                <div className="text-slate-300">
                  • 20 Días Empresa: <span className="font-bold text-slate-100">S/. {subsidyCalc.montoEmpresa.toFixed(2)}</span>
                </div>
                <div className="text-emerald-300 font-bold">
                  • {subsidyCalc.diasEssalud} Días Reembolso Essalud: <span>S/. {subsidyCalc.montoEssalud.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Fórmula: {subsidyCalc.subsidioFormulaText}</p>
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
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg"
                >
                  Guardar y Generar Expediente VIVA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
