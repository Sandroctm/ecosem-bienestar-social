import React, { useState } from 'react';
import { ShieldAlert, Download, Lock, CheckCircle2, KeyRound, Plus, X, Search } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditCompliancePageProps {
  logs: AuditLog[];
  onAddLog?: (log: AuditLog) => void;
  onExportExcel: () => void;
}

export const AuditCompliancePage: React.FC<AuditCompliancePageProps> = ({
  logs,
  onAddLog,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moduleName, setModuleName] = useState('Valorización');
  const [actionText, setActionText] = useState('');
  const [userText, setUserText] = useState('Auditor ECOSEM');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText) return;

    if (onAddLog) {
      const newLog: AuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('es-PE'),
        module: moduleName,
        action: actionText,
        user: userText,
        hashSignature: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      };
      onAddLog(newLog);
    }
    setActionText('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Cumplimiento Normativo y Registros Inmutables</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditorías comunitarias y registro inalterable de asistencia, asignación de habitaciones y costos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Registrar Evento Auditoría
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Auditoría (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-100">Bitácora de Auditoría en Tiempo Real</h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en bitácora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">ID Registro</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Acción Registrada</th>
                <th className="p-3">Usuario / Dispositivo</th>
                <th className="p-3">Firma Digital Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 text-slate-400">{l.id}</td>
                  <td className="p-3 text-slate-400">{l.timestamp}</td>
                  <td className="p-3 font-bold text-amber-300 font-sans">{l.module}</td>
                  <td className="p-3 text-slate-200 font-sans">{l.action}</td>
                  <td className="p-3 text-slate-400 font-sans">{l.user}</td>
                  <td className="p-3 text-[10px] text-emerald-400">{l.hashSignature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-100">Registrar Evento de Auditoría</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Módulo:</label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Acción Realizada:</label>
                <textarea
                  rows={3}
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Ej: Validación y verificación de fotochecks..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Usuario Auditor:</label>
                <input
                  type="text"
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
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
                  Registrar Firma Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

