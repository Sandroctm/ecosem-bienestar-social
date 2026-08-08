import React, { useState } from 'react';
import { Cloud, Download, Upload, RefreshCw, Key, CheckCircle2, AlertCircle, X, HardDrive, Laptop } from 'lucide-react';
import {
  exportCompleteDatabaseSnapshot,
  importDatabaseSnapshot,
  getCloudSyncKey,
  setCloudSyncKey,
  syncStateToCloudServer,
  fetchStateFromCloudServer,
} from '../utils/databaseStateEngine';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [cloudKey, setCloudKeyInput] = useState<string>(() => getCloudSyncKey());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportCompleteDatabaseSnapshot();
    setFeedback({
      type: 'success',
      message: 'Copia de seguridad descargada en formato .json. Puede llevar este archivo a cualquier otra PC.',
    });
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDatabaseSnapshot(content);
        if (result.success) {
          setFeedback({ type: 'success', message: result.message });
          onDataRestored();
        } else {
          setFeedback({ type: 'error', message: result.message });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveKey = () => {
    setCloudSyncKey(cloudKey);
    setFeedback({
      type: 'success',
      message: `Clave corporativa guardada: [${cloudKey.toUpperCase()}].`,
    });
  };

  const handleCloudUpload = async () => {
    setIsSyncing(true);
    setFeedback(null);
    setCloudSyncKey(cloudKey);
    const res = await syncStateToCloudServer();
    setIsSyncing(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCloudDownload = async () => {
    setIsSyncing(true);
    setFeedback(null);
    setCloudSyncKey(cloudKey);
    const res = await fetchStateFromCloudServer();
    setIsSyncing(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      onDataRestored();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 text-slate-100 relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Sincronización y Respaldo Multi-PC</h3>
              <p className="text-xs text-slate-400">Guarde su progreso o impórtelo en cualquier otra laptop o PC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* OPCION 1: Sincronización en la Nube por Clave Compartida */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>1. Sincronización Automática en la Nube (Multi-PC):</span>
            </h4>
          </div>

          <p className="text-[11px] text-slate-400">
            Ingrese una clave compartida para su empresa o unidad minera. Al presionar <strong>"Sincronizar a la Nube"</strong>, los datos de esta PC quedan listos para abrirse en cualquier otra computadora.
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Clave Empresa (Ej: ECOSEM-PUCARA-MINA)"
                value={cloudKey}
                onChange={(e) => setCloudKeyInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold font-mono text-emerald-300 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSaveKey}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 border border-slate-700"
            >
              Guardar Clave
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCloudUpload}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Upload className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar a la Nube
            </button>

            <button
              onClick={handleCloudDownload}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Download className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Cargar Datos de la Nube
            </button>
          </div>
        </div>

        {/* OPCION 2: Respaldo Manual mediante Archivo JSON */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>2. Copia de Seguridad Física (Archivo .JSON):</span>
          </h4>

          <p className="text-[11px] text-slate-400">
            Exporta o importa el 100% de la base de datos en un archivo portable para enviarlo por correo, WhatsApp o USB.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/40 font-bold text-xs rounded-xl transition"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Descargar Backup (.json)
            </button>

            <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer transition">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Cargar / Restaurar Backup (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 text-center border-t border-slate-800 pt-3">
          Al restaurar o sincronizar, se cargarán instantáneamente todos los trabajadores, descansos médicos, pases SCTR, atenciones y habitaciones en esta computadora.
        </div>
      </div>
    </div>
  );
};
