import React, { useState } from 'react';
import { Building2, Download, Plus, Trash2, X, Wrench } from 'lucide-react';
import { InfrastructureProject } from '../types';

interface InfrastructurePageProps {
  projects: InfrastructureProject[];
  onAddProject: (project: InfrastructureProject) => void;
  onDeleteProject: (id: string) => void;
  onExportExcel: () => void;
}

export const InfrastructurePage: React.FC<InfrastructurePageProps> = ({
  projects,
  onAddProject,
  onDeleteProject,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [type, setType] = useState<'Agua y Sanamiento' | 'Electrificación' | 'Salud Pública' | 'Vía de Acceso (OXI)'>('Agua y Sanamiento');
  const [location, setLocation] = useState('Comunidad Campesina de Yauli');
  const [progressPercent, setProgressPercent] = useState<number>(45);
  const [budgetSoles, setBudgetSoles] = useState<number>(250000);
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(1200);
  const [status, setStatus] = useState<'En Ejecución' | 'En Licitación' | 'Concluido'>('En Ejecución');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      alert('Ingrese el nombre del proyecto.');
      return;
    }

    const newProject: InfrastructureProject = {
      id: `INF-${Date.now().toString().slice(-4)}`,
      projectName,
      type,
      location,
      progressPercent,
      budgetSoles,
      beneficiariesCount,
      status,
    };

    onAddProject(newProject);
    setProjectName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Infraestructura Local y Servicios (OXI)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seguimiento de obras de agua, desagüe, electrificación y desarrollo social bajo mecanismo Obras por Impuestos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto OXI
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Obras (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100">Proyectos de Infraestructura Comunal</h3>
          <span className="text-xs text-amber-400 font-mono font-bold">Total: {projects.length} proyectos</span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No hay proyectos de infraestructura registrados.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
            >
              + Registrar primer proyecto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Nombre del Proyecto</th>
                  <th className="p-3">Tipo de Obra</th>
                  <th className="p-3">Comunidad / Ubicación</th>
                  <th className="p-3">Presupuesto (S/)</th>
                  <th className="p-3">Avance Físico</th>
                  <th className="p-3">Beneficiarios</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{p.projectName}</td>
                    <td className="p-3 text-amber-400 font-bold">{p.type}</td>
                    <td className="p-3 text-slate-300">{p.location}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">
                      S/ {p.budgetSoles.toLocaleString('es-PE')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${p.progressPercent}%` }} />
                        </div>
                        <span className="font-bold text-slate-200">{p.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-300">{p.beneficiariesCount} hab.</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteProject(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
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

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-100">Registrar Proyecto de Infraestructura</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Proyecto:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ej: Sistema de Agua Potable Pucará"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipo de Obra:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Agua y Sanamiento">Agua y Sanamiento</option>
                    <option value="Electrificación">Electrificación</option>
                    <option value="Salud Pública">Salud Pública</option>
                    <option value="Vía de Acceso (OXI)">Vía de Acceso (OXI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Comunidad / Ubicación:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Presupuesto Soles (S/):</label>
                  <input
                    type="number"
                    value={budgetSoles}
                    onChange={(e) => setBudgetSoles(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Avance Físico (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">N° Beneficiarios:</label>
                  <input
                    type="number"
                    value={beneficiariesCount}
                    onChange={(e) => setBeneficiariesCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Estado:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="En Ejecución">En Ejecución</option>
                    <option value="En Licitación">En Licitación</option>
                    <option value="Concluido">Concluido</option>
                  </select>
                </div>
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
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

