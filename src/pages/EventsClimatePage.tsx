import React, { useState } from 'react';
import {
  Gift,
  Plus,
  PenTool,
  CheckCircle,
  Building,
  Award,
  Smile,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { EntregaBeneficio, Worker } from '../types';
import { DigitalSignatureModal } from '../components/DigitalSignatureModal';

interface EventsClimatePageProps {
  entregas: EntregaBeneficio[];
  workers: Worker[];
  onAddEntrega: (entrega: EntregaBeneficio) => void;
  onUpdateEntrega: (entrega: EntregaBeneficio) => void;
  currentTenantName: string;
}

export const EventsClimatePage: React.FC<EventsClimatePageProps> = ({
  entregas,
  workers,
  onAddEntrega,
  onUpdateEntrega,
  currentTenantName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedEntregaForSignature, setSelectedEntregaForSignature] = useState<EntregaBeneficio | null>(null);

  // Form state
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [tipoBeneficio, setTipoBeneficio] = useState<EntregaBeneficio['tipoBeneficio']>('Kit Navideño / Panetón');
  const [observaciones, setObservaciones] = useState('Conforme sin duplicidad.');

  const filtered = entregas.filter(
    (e) =>
      e.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.workerDni.includes(searchTerm) ||
      e.tipoBeneficio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const newEntrega: EntregaBeneficio = {
      idEntrega: `ENT-11-${Math.floor(100 + Math.random() * 900)}`,
      idTrabajador: worker.id,
      workerName: worker.fullName,
      workerDni: worker.dni,
      tipoBeneficio,
      fechaEntrega: new Date().toISOString().replace('T', ' ').substring(0, 16),
      firmaDigitalUrl: '',
      estadoEntrega: 'Pendiente de Recojo',
      observaciones,
      unidadMinera: currentTenantName,
    };

    onAddEntrega(newEntrega);
    setIsModalOpen(false);
  };

  const handleOpenSignatureModal = (entrega: EntregaBeneficio) => {
    setSelectedEntregaForSignature(entrega);
    setIsSignatureModalOpen(true);
  };

  const handleSaveSignature = (dataUrl: string) => {
    if (!selectedEntregaForSignature) return;
    const updated: EntregaBeneficio = {
      ...selectedEntregaForSignature,
      firmaDigitalUrl: dataUrl,
      estadoEntrega: 'Entregado y Firmado',
      fechaEntrega: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    onUpdateEntrega(updated);
    setSelectedEntregaForSignature(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-100">Eventos, Entregas y Clima Laboral</h1>
              <p className="text-xs text-slate-400 font-medium">
                Tabla <span className="font-bold text-purple-400">11_Entregas_Beneficios</span> • Control Anti-Duplicidad y Firma Digitalizada
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
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Registrar Entrega de Beneficio
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Kits y Regalos Registrados</div>
            <div className="text-xl font-bold text-slate-100">{entregas.length}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Firmas Digitales Biométricas</div>
            <div className="text-xl font-bold text-emerald-300">
              {entregas.filter((e) => e.firmaDigitalUrl).length} Firmadas
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Encuestas Clima Laboral</div>
            <div className="text-xl font-bold text-amber-300">94.8% Satisfacción</div>
          </div>
        </div>
      </div>

      {/* Main Table 11 */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/90 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            Evidencia Auditable de Entregas (11_Entregas_Beneficios)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por trabajador, DNI o beneficio..."
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
                <th className="p-3.5">ID Entrega</th>
                <th className="p-3.5">Trabajador (DNI)</th>
                <th className="p-3.5">Tipo Beneficio</th>
                <th className="p-3.5">Fecha y Hora</th>
                <th className="p-3.5">Firma Digital Biometría</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Firma / Recojo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No hay entregas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.idEntrega} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-purple-400">{e.idEntrega}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{e.workerName}</div>
                      <div className="text-[11px] text-slate-400">DNI: {e.workerDni}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-purple-300">{e.tipoBeneficio}</td>
                    <td className="p-3.5 text-[11px] text-slate-300">{e.fechaEntrega}</td>
                    <td className="p-3.5">
                      {e.firmaDigitalUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={e.firmaDigitalUrl}
                            alt="Firma"
                            className="h-7 w-20 object-contain bg-white rounded border border-slate-700 p-0.5"
                          />
                          <span className="text-[10px] text-emerald-400 font-bold">✓ Auditada</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-semibold">Sin firma registrada</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          e.estadoEntrega === 'Entregado y Firmado'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {e.estadoEntrega}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenSignatureModal(e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold rounded-lg border border-purple-500/30 ml-auto"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        {e.firmaDigitalUrl ? 'Re-firmar' : 'Capturar Firma'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Beneficio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" />
                Registrar Entrega de Beneficio sin Duplicidad
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Seleccionar Trabajador Beneficiario:</label>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Beneficio / Evento:</label>
                <select
                  value={tipoBeneficio}
                  onChange={(e) => setTipoBeneficio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-bold text-purple-300"
                >
                  <option value="Kit Navideño / Panetón">Kit Navideño / Panetón</option>
                  <option value="Kit Escolar Hijos">Kit Escolar Hijos</option>
                  <option value="Reconocimiento Quinquenio">Reconocimiento Quinquenio</option>
                  <option value="Integración Familiar">Integración Familiar</option>
                  <option value="EPP Bienestar Especial">EPP Bienestar Especial</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Observaciones Auditoría:</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
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
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg"
                >
                  Guardar y Habilitar Firma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Canvas Firma Digital */}
      <DigitalSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
        title="Firma Digital - Recepción de Beneficio"
        subtitle={
          selectedEntregaForSignature
            ? `Trabajador: ${selectedEntregaForSignature.workerName} • Beneficio: ${selectedEntregaForSignature.tipoBeneficio}`
            : undefined
        }
      />
    </div>
  );
};
