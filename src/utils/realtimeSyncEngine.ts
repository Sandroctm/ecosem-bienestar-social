/**
 * Motor en Tiempo Real y Sincronización Inter-Pestañas (BroadcastChannel Engine)
 * Erradica el error de Vistas Obsoletas (Caché Desincronizada) entre usuarios o pestañas.
 * Cuando el Usuario A realiza una mutación (INSERT / UPDATE / DELETE) en cualquier tabla,
 * este motor emite un evento global de invalidación y sincro automática sin presionar F5.
 */

export interface RealtimeSyncEvent {
  id: string;
  tableName: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'INVALIDATE';
  payload?: any;
  senderTabId: string;
  timestamp: number;
}

const CHANNEL_NAME = 'ecosem_enterprise_realtime_bus';
const CURRENT_TAB_ID = `TAB-${Math.random().toString(36).substring(2, 9)}`;

let broadcastChannel: BroadcastChannel | null = null;
const listeners: Array<(event: RealtimeSyncEvent) => void> = [];

// Inicializar el canal BroadcastChannel con fallback seguro
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannel.onmessage = (msgEvent: MessageEvent<RealtimeSyncEvent>) => {
        const data = msgEvent.data;
        // Evitar procesar mensajes emitidos por la misma pestaña
        if (data && data.senderTabId !== CURRENT_TAB_ID) {
          listeners.forEach((listener) => listener(data));
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel no soportado en este entorno:', e);
    }
  }
  return broadcastChannel;
}

/**
 * Emitir una mutación a todas las pestañas activas de la red corporativa.
 */
export function broadcastMutation(
  tableName: string,
  action: RealtimeSyncEvent['action'],
  payload?: any
): void {
  const channel = getChannel();
  const syncEvent: RealtimeSyncEvent = {
    id: `SYNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tableName,
    action,
    payload,
    senderTabId: CURRENT_TAB_ID,
    timestamp: Date.now(),
  };

  if (channel) {
    try {
      channel.postMessage(syncEvent);
    } catch (e) {
      console.error('Error transmitiendo evento en tiempo real:', e);
    }
  }

  // Notificar también localmente a la ventana actual si es necesario
  window.dispatchEvent(new CustomEvent('ecosem_realtime_local_event', { detail: syncEvent }));
}

/**
 * Suscribirse a cambios en tiempo real emitidos por otras sesiones o pestañas.
 */
export function subscribeRealtimeSync(
  callback: (event: RealtimeSyncEvent) => void
): () => void {
  getChannel();
  listeners.push(callback);

  const localHandler = (e: Event) => {
    const customEv = e as CustomEvent<RealtimeSyncEvent>;
    if (customEv.detail && customEv.detail.senderTabId !== CURRENT_TAB_ID) {
      callback(customEv.detail);
    }
  };

  window.addEventListener('ecosem_realtime_local_event', localHandler);

  // Retornar función de limpieza
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
    window.removeEventListener('ecosem_realtime_local_event', localHandler);
  };
}
