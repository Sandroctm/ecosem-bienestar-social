import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShieldAlert, Award, FileText, Landmark, Play, Sparkles } from 'lucide-react';
import { Worker, SCTRPoliza, PrestamoAyuda, ActiveModule } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  sctrs: SCTRPoliza[];
  prestamos: PrestamoAyuda[];
  onNavigate: (module: ActiveModule) => void;
  onSelectWorker?: (worker: Worker) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  workers,
  sctrs,
  prestamos,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time quick search filtering across multiple tables
  const filteredWorkers = workers
    .filter(
      (w) =>
        !w.deletedAt &&
        (w.fullName.toLowerCase().includes(query.toLowerCase()) || w.dni.includes(query))
    )
    .slice(0, 4);

  const filteredSctrs = sctrs
    .filter(
      (s) =>
        !s.deletedAt &&
        (s.workerName.toLowerCase().includes(query.toLowerCase()) || s.nroPoliza.includes(query))
    )
    .slice(0, 3);

  const filteredPrestamos = prestamos
    .filter(
      (p) =>
        !p.deletedAt &&
        (p.workerName.toLowerCase().includes(query.toLowerCase()) || p.tipoSocorro.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 3);

  const handleAction = (module: ActiveModule) => {
    onNavigate(module);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/85 backdrop-blur-sm p-4 md:p-20 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-200">
        
        {/* Search input bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <Search className="w-5 h-5 text-slate-400 shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Escriba para buscar personal, pólizas, préstamos o comandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results scroll area */}
        <div className="flex-1 overflow-y-auto max-h-96 p-2 space-y-4">
          {/* Section: Comandos rápidos */}
          {query === '' && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Navegación y Comandos Rápidos
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5">
                <button
                  onClick={() => handleAction('medical-leaves')}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-left transition group"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Ir a Descansos Médicos</div>
                    <div className="text-[10px] text-slate-500">Gestión de subsidios Essalud</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('loans-assistance')}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-left transition group"
                >
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Ir a Préstamos y Ayudas</div>
                    <div className="text-[10px] text-slate-500">Cuotas e interés social</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('sctr-management')}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-left transition group"
                >
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">Vigilancia Pases SCTR</div>
                    <div className="text-[10px] text-slate-500">Control de ingreso a garita</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('predictive-analytics')}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 text-left transition group"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-purple-400">Análisis Predictivo IA</div>
                    <div className="text-[10px] text-slate-500">Algoritmos de ausentismo</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Section: Trabajadores result */}
          {filteredWorkers.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Trabajadores ({filteredWorkers.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition"
                    onClick={() => handleAction('workers')}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{w.fullName}</div>
                        <div className="text-[10px] text-slate-400">DNI: {w.dni} • {w.role}</div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded text-emerald-400 border border-slate-800">
                      {w.company}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: SCTRs result */}
          {filteredSctrs.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Pólizas SCTR ({filteredSctrs.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredSctrs.map((s) => (
                  <div
                    key={s.idPoliza}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition"
                    onClick={() => handleAction('sctr-management')}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{s.workerName}</div>
                        <div className="text-[10px] text-slate-400">Pol: {s.nroPoliza} • {s.aseguradora}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        s.estadoPaseMina === 'Habilitado'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {s.estadoPaseMina}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Prestamos result */}
          {filteredPrestamos.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Préstamos y Ayudas ({filteredPrestamos.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredPrestamos.map((p) => (
                  <div
                    key={p.idPrestamo}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition"
                    onClick={() => handleAction('loans-assistance')}
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{p.workerName}</div>
                        <div className="text-[10px] text-slate-400">{p.tipoSocorro} • {p.cuotasTotales} cuotas</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      S/. {p.montoSolicitado.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query !== '' &&
            filteredWorkers.length === 0 &&
            filteredSctrs.length === 0 &&
            filteredPrestamos.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron resultados para "{query}"
              </div>
            )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-800 flex items-center justify-between">
          <span>Presione <kbd className="bg-slate-800 text-slate-400 px-1 py-0.5 rounded">↑↓</kbd> para navegar, <kbd className="bg-slate-800 text-slate-400 px-1 py-0.5 rounded">Enter</kbd> para abrir.</span>
          <span>Búsqueda indexada instantánea.</span>
        </div>
      </div>
    </div>
  );
};
