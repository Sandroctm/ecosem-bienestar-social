import React, { useState } from 'react';
import {
  Server,
  Database,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Activity,
  CloudUpload,
  Lock,
} from 'lucide-react';
import { ResilienceMetrics } from '../types';

interface ResilienceBackupPageProps {
  metrics: ResilienceMetrics;
  onTriggerBackup: () => void;
  onToggleFailover: () => void;
  onSimulateRTO: () => void;
}

export const ResilienceBackupPage: React.FC<ResilienceBackupPageProps> = ({
  metrics,
  onTriggerBackup,
  onToggleFailover,
  onSimulateRTO,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  const handleRunRestore = () => {
    setIsRestoring(true);
    setRestoreMessage('Iniciando script de restauración RTO < 10 min...');
    setTimeout(() => {
      setRestoreMessage('Verificando firmas de integridad AES-256 en Supabase Storage...');
    }, 1500);
    setTimeout(() => {
      setRestoreMessage('Restauración de base de datos completada en 4 minutos y 12 segundos (Cumple RTO).');
      setIsRestoring(false);
      onSimulateRTO();
    }, 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Arquitectura de Recuperación y Resiliencia Total</h1>
            <p className="text-xs text-slate-400 font-medium">
              Estrategia RPO / RTO • Failover de Conexión sin Interrupción • Copias Delta en AWS S3 / Supabase
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onTriggerBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
          >
            <CloudUpload className="w-4 h-4" />
            Ejecutar Backup Delta Ahora
          </button>
        </div>
      </div>

      {/* RPO / RTO Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>RPO (Point in Time Recovery)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.rpoMinutes} Minutos</div>
          <p className="text-[11px] text-slate-400">Copias delta automáticas cada 15 min en almacenamiento cifrado S3.</p>
          <div className="text-[10px] text-slate-500 font-mono">Última copia: {metrics.lastBackupTimestamp}</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>RTO (Recovery Time Objective)</span>
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">&lt; {metrics.rtoMinutes} Minutos</div>
          <p className="text-[11px] text-slate-400">Restauración total garantizada ante fallos catastróficos del servidor.</p>
          <button
            onClick={handleRunRestore}
            disabled={isRestoring}
            className="w-full mt-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-[11px] rounded-lg border border-indigo-500/30"
          >
            {isRestoring ? 'Restaurando...' : 'Simular Restauración RTO'}
          </button>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Estado Nodo Réplica (Failover)</span>
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300 truncate">{metrics.nodeStatus}</div>
          <p className="text-[11px] text-slate-400">
            Conmutación automática de conexión ante caídas de planta/mina.
          </p>
          <button
            onClick={onToggleFailover}
            className={`w-full py-1.5 font-bold text-[11px] rounded-lg border transition ${
              metrics.isFailoverActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {metrics.isFailoverActive ? '✓ FAILOVER ACTIVO (NODO RÉPLICA)' : 'Conmutar a Nodo Réplica'}
          </button>
        </div>
      </div>

      {restoreMessage && (
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 text-indigo-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
          <RefreshCw className={`w-5 h-5 text-indigo-400 ${isRestoring ? 'animate-spin' : ''}`} />
          <span>{restoreMessage}</span>
        </div>
      )}

      {/* Storage and Security Specs */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Especificación de Cifrado y Réplica de Datos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Destino de Almacenamiento Cifrado:
            </div>
            <div className="font-mono text-emerald-300 font-bold bg-slate-900 p-2 rounded border border-slate-800">
              {metrics.encryptedS3Bucket}
            </div>
            <p className="text-[11px] text-slate-400">
              Cifrado en reposo con AES-256 y firma HMAC para prevenir manipulaciones.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Garantía de Continuidad Operativa:
            </div>
            <p className="text-slate-300">
              Ante una interrupción imprevista de conexión en mina, los registros locales guardan en caché y sincronizan mediante conmutación transparente de la API.
            </p>
            <div className="text-[10px] text-emerald-400 font-bold">
              ✓ Tiempo estimado de falla: 0.00 segundos sin pérdida de información (Zero Data Loss).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
