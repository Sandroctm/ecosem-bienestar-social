import React, { useState } from 'react';
import { BarChart3, Download, Plus, Trash2, X, Award, Target, TrendingUp } from 'lucide-react';
import { SocialImpactMetric } from '../types';

interface SocialImpactPageProps {
  metrics: SocialImpactMetric[];
  onAddMetric: (metric: SocialImpactMetric) => void;
  onDeleteMetric: (id: string) => void;
  onExportExcel: () => void;
}

export const SocialImpactPage: React.FC<SocialImpactPageProps> = ({
  metrics,
  onAddMetric,
  onDeleteMetric,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [indicatorName, setIndicatorName] = useState('');
  const [category, setCategory] = useState<'Educación' | 'Salud' | 'Empleabilidad' | 'Infraestructura'>('Educación');
  const [icbsScore, setIcbsScore] = useState<number>(85);
  const [targetScore, setTargetScore] = useState<number>(90);
  const [status, setStatus] = useState<'Óptimo' | 'En Metas' | 'Requiere Atención'>('En Metas');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicatorName) {
      alert('Ingrese el nombre del indicador.');
      return;
    }

    const newMetric: SocialImpactMetric = {
      id: `ICBS-${Date.now().toString().slice(-4)}`,
      indicatorName,
      category,
      icbsScore,
      targetScore,
      status,
    };

    onAddMetric(newMetric);
    setIndicatorName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Gestión de Impacto Social (ICBS ECOSEM)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Medición continuada de Indicadores Clave de Bienestar Social (ICBS) e impacto comunitario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nuevo Indicador ICBS
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar ICBS (.xlsx)
          </button>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 space-y-3">
          <TrendingUp className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-400">No hay indicadores de impacto registradas.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
          >
            + Crear primer indicador ICBS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.id} className="glass-card p-5 rounded-2xl border border-amber-500/30 space-y-3 relative group">
              <button
                onClick={() => onDeleteMetric(m.id)}
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-start pr-6">
                <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {m.category}
                </span>
                <span className="text-xs font-bold text-emerald-400">{m.status}</span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-100">{m.indicatorName}</h4>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black gold-gradient-text">{m.icbsScore}</span>
                <span className="text-xs text-slate-400">/ 100 Meta ({m.targetScore})</span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(m.icbsScore, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-100">Registrar Indicador de Impacto Social</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Indicador:</label>
                <input
                  type="text"
                  value={indicatorName}
                  onChange={(e) => setIndicatorName(e.target.value)}
                  placeholder="Ej: Empleabilidad Comunal Minera"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Categoría:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Educación">Educación</option>
                  <option value="Salud">Salud</option>
                  <option value="Empleabilidad">Empleabilidad</option>
                  <option value="Infraestructura">Infraestructura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Puntaje Actual (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={icbsScore}
                    onChange={(e) => setIcbsScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Meta Deseada:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Estado del Indicador:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Óptimo">Óptimo</option>
                  <option value="En Metas">En Metas</option>
                  <option value="Requiere Atención">Requiere Atención</option>
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
                  Guardar Indicador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

