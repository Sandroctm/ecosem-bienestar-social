import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getOfflineQueue, processOfflineSyncQueue } from '../utils/offlineStoreEngine';
import { OfflineSyncQueueItem } from '../types';

interface OfflineSyncStatusBadgeProps {
  isOnline: boolean;
  onToggleOnlineOffline: () => void;
  onSyncItem: (tableName: string, actionType: string, decryptedPayload: any) => void;
}

export const OfflineSyncStatusBadge: React.FC<OfflineSyncStatusBadgeProps> = ({
  isOnline,
  onToggleOnlineOffline,
  onSyncItem,
}) => {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check local offline queue items periodically
    const interval = setInterval(() => {
      const queue = getOfflineQueue();
      setQueueCount(queue.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = () => {
    if (!isOnline || queueCount === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      processOfflineSyncQueue(onSyncItem);
      setIsSyncing(false);
      setQueueCount(0);
    }, 1500);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Network toggle switch button */}
      <button
        onClick={onToggleOnlineOffline}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition shadow ${
          isOnline
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
        }`}
        title={isOnline ? 'Simular desconexión (Modo Socavón)' : 'Simular conexión (Modo Oficina)'}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span>ONLINE (Oficina)</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 animate-bounce" />
            <span>OFFLINE (Socavón)</span>
          </>
        )}
      </button>

      {/* Sync trigger button if queue items exist */}
      {queueCount > 0 && (
        <button
          onClick={handleSyncNow}
          disabled={!isOnline || isSyncing}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition ${
            isOnline
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
          title={isOnline ? 'Sincronizar cambios locales ahora' : 'Sincronización deshabilitada sin señal'}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sincronizar ({queueCount})</span>
        </button>
      )}
    </div>
  );
};
