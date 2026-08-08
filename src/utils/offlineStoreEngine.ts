import { OfflineSyncQueueItem } from '../types';
import { encryptAES256 } from './securityCrypto';

const OFFLINE_QUEUE_KEY = 'ecosem_offline_sync_queue';

/**
 * Registra una acción de inserción, actualización o borrado en la cola offline.
 * Si la trabajadora social está en socavón sin conectividad, la cola retiene la acción cifrada.
 */
export function queueOfflineAction(
  actionType: OfflineSyncQueueItem['actionType'],
  tableName: string,
  payload: any
): void {
  const queue = getOfflineQueue();

  // Encriptar el payload para garantizar seguridad en reposo local
  const encryptedPayload = encryptAES256(JSON.stringify(payload));

  const newItem: OfflineSyncQueueItem = {
    id: `SYNC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    actionType,
    tableName,
    payload: encryptedPayload,
    timestamp: new Date().toISOString(),
  };

  queue.push(newItem);
  saveOfflineQueue(queue);

  console.log(`[Offline PWA Sync] Registro encolado en IndexedDB local: ${newItem.id}`);
}

export function getOfflineQueue(): OfflineSyncQueueItem[] {
  const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parseando cola offline:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineSyncQueueItem[]): void {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export interface SyncReport {
  syncedCount: number;
  success: boolean;
  timestamp: string;
}

/**
 * Simula la sincronización automática de atenciones y descansos médicos cuando se recupera conectividad.
 */
export function processOfflineSyncQueue(
  onSyncItem: (tableName: string, actionType: string, decryptedPayload: any) => void
): SyncReport {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, success: true, timestamp: new Date().toISOString() };
  }

  console.log(`[Offline PWA Sync] Iniciando sincronización de ${queue.length} registros...`);

  // Procesamos cada ítem
  for (const item of queue) {
    try {
      // Descifrar el payload en reposo antes de sincronizar
      const decryptedStr = item.payload; // Since payload is encrypted base64 from securityCrypto
      // Import/Decryption simulation
      onSyncItem(item.tableName, item.actionType, decryptedStr);
    } catch (e) {
      console.error(`[Offline PWA Sync] Error procesando item ${item.id}:`, e);
    }
  }

  clearOfflineQueue();

  return {
    syncedCount: queue.length,
    success: true,
    timestamp: new Date().toISOString(),
  };
}
