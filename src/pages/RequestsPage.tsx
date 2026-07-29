import React, { useState } from 'react';
import { FileCheck2, Download, Plus, Trash2, X, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { BenefitRequest } from '../types';

interface RequestsPageProps {
  requests: BenefitRequest[];
  onAddRequest: (req: BenefitRequest) => void;
  onUpdateStatus: (id: string, status: 'Aprobado' | 'En Revisión' | 'Pendiente') => void;
  onDeleteRequest: (id: string) => void;
  onExportExcel: () => void;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({
  requests,
  onAddRequest,
  onUpdateStatus,
  onDeleteRequest,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requesterName, setRequesterName] = useState('');
  const [category, setCategory] = useState<'Alojamiento Familiar' | 'Beca Educativa' | 'Atención Médica' | 'Retiro de Componente'>('Alojamiento Familiar');
  const [familyMember, setFamilyMember] = useState('');
  const [priorityBadge, setPriorityBadge] = useState<'Baja' | 'Media' | 'Alta'>('Media');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName || !familyMember) {
      alert('Por favor llene los nombres requeridos.');
      return;
    }

    const newReq: BenefitRequest = {
      id: `SOL-${Date.now().toString().slice(-4)}`,
      requesterName,
      category,
      familyMember,
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      priorityBadge,
    };

    onAddRequest(newReq);
    setRequesterName('');
    setFamilyMember('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Gestión de Solicitudes y Beneficios Familiares</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Flujos de aprobación automatizados para visitas familiares, alojamiento, salud y becas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nueva Solicitud de Beneficio
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Solicitudes (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100">Bandeja de Solicitudes y Beneficios</h3>
          <span className="text-xs text-amber-400 font-mono font-bold">Total: {requests.length} registros</span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No hay solicitudes registradas.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
            >
              + Generar primera solicitud
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID Solicitud</th>
                  <th className="p-3">Solicitante</th>
                  <th className="p-3">Categoría de Beneficio</th>
                  <th className="p-3">Familiar / Beneficiario</th>
                  <th className="p-3">Fecha Solicitud</th>
                  <th className="p-3">Prioridad</th>
                  <th className="p-3">Estado Aprobación</th>
                  <th className="p-3 text-center">Acciones Aprobación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{r.id}</td>
                    <td className="p-3 font-semibold text-slate-100">{r.requesterName}</td>
                    <td className="p-3 text-amber-300 font-bold">{r.category}</td>
                    <td className="p-3 text-slate-300">{r.familyMember}</td>
                    <td className="p-3 font-mono text-slate-400">{r.dateSubmitted}</td>
                    <td className="p-3 font-bold text-amber-400">{r.priorityBadge}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          r.status === 'Aprobado'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : r.status === 'En Revisión'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center flex items-center justify-center gap-1">
                      {r.status !== 'Aprobado' && (
                        <button
                          onClick={() => onUpdateStatus(r.id, 'Aprobado')}
                          className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/40"
                          title="Aprobar Solicitud"
                        >
                          Aprobar
                        </button>
                      )}
                      {r.status !== 'En Revisión' && (
                        <button
                          onClick={() => onUpdateStatus(r.id, 'En Revisión')}
                          className="px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-[10px] font-bold rounded border border-amber-500/40"
                          title="Observar Solicitud"
                        >
                          Revisar
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteRequest(r.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 ml-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-100">Nueva Solicitud de Beneficio</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Solicitante:</label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Categoría de Beneficio:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Alojamiento Familiar">Alojamiento Familiar</option>
                  <option value="Beca Educativa">Beca Educativa</option>
                  <option value="Atención Médica">Atención Médica</option>
                  <option value="Retiro de Componente">Retiro de Componente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Familiar / Beneficiario:</label>
                <input
                  type="text"
                  value={familyMember}
                  onChange={(e) => setFamilyMember(e.target.value)}
                  placeholder="Ej: María Pérez (Esposa)"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Prioridad:</label>
                <select
                  value={priorityBadge}
                  onChange={(e) => setPriorityBadge(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button font-black rounded-lg text-xs"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

