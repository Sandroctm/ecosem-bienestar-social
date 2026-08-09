import { AttendanceRecord } from '../types';

/**
 * Cloud Sync Relay Engine (Sincronización Transparente Real Celular -> PC)
 * Utiliza un relé global en tiempo real mediante SSE (Server-Sent Events) y HTTP POST REST
 * para que cuando CUALQUIER celular en el campo o garita escanee un código QR,
 * la marcación aparezca INMEDIATAMENTE en las pantallas de las PCs de administración y garitas.
 */

const CLOUD_SYNC_TOPIC_URL = 'https://ntfy.sh/ecosem_pucara_attendance_sync_2026';
const LOCAL_BUFFER_KEY = 'ecosem_cloud_live_attendance_records_global';

/**
 * Publica una marcación capturada en celular hacia la nube central en tiempo real.
 */
export async function pushAttendanceRecordToCloud(record: AttendanceRecord): Promise<boolean> {
  try {
    // 1. Guardar buffer local de respaldo
    try {
      const existingRaw = localStorage.getItem(LOCAL_BUFFER_KEY);
      const currentRecords: AttendanceRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [record, ...currentRecords.filter((r) => r.id !== record.id)].slice(0, 500);
      localStorage.setItem(LOCAL_BUFFER_KEY, JSON.stringify(updated));
    } catch (e) {}

    // 2. Disparar evento local (para pestañas en la misma PC)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ecosem_cloud_attendance_event', { detail: record })
      );
    }

    // 3. Transmitir a la NUBE GLOBAL mediante HTTP POST REST (para celulares -> PCs en cualquier red)
    const response = await fetch(CLOUD_SYNC_TOPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    if (response.ok) {
      console.log(`[Cloud Sync Relay] Marcación ${record.workerDni} publicada en la nube global.`);
      return true;
    }
    return false;
  } catch (e) {
    console.error('[Cloud Sync Relay] Error enviando marcación a la nube:', e);
    return false;
  }
}

/**
 * Inicia la suscripción en tiempo real (Server-Sent Events / SSE) y polling inicial
 * para escuchar nuevas marcaciones que entren desde celulares.
 */
export function startRealtimeCloudStream(onRecordReceived: (record: AttendanceRecord) => void): () => void {
  const processedRecordIds = new Set<string>();

  // 1. Polling Inicial para recuperar marcaciones recientes acumuladas en la nube
  fetch(`${CLOUD_SYNC_TOPIC_URL}/json?poll=1`)
    .then((res) => res.text())
    .then((text) => {
      if (!text) return;
      const lines = text.trim().split('\n');
      lines.forEach((line) => {
        try {
          const parsed = JSON.parse(line);
          if (parsed.event === 'message' && parsed.message) {
            const record: AttendanceRecord = JSON.parse(parsed.message);
            if (record && record.id && !processedRecordIds.has(record.id)) {
              processedRecordIds.add(record.id);
              onRecordReceived(record);
            }
          }
        } catch (e) {}
      });
    })
    .catch((err) => console.warn('[Cloud Sync Relay] Polling inicial de nube:', err));

  // 2. Transmisión SSE en tiempo real (Server-Sent Events) para celular -> PC en milisegundos
  let eventSource: EventSource | null = null;
  try {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource(`${CLOUD_SYNC_TOPIC_URL}/sse`);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'message' && parsed.message) {
            const record: AttendanceRecord = JSON.parse(parsed.message);
            if (record && record.id && !processedRecordIds.has(record.id)) {
              processedRecordIds.add(record.id);
              onRecordReceived(record);
            }
          }
        } catch (e) {
          console.error('[Cloud Sync Relay] Error parseando mensaje SSE:', e);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('[Cloud Sync Relay] Reconectando stream de nube...', err);
      };
    }
  } catch (e) {
    console.warn('[Cloud Sync Relay] SSE no soportado:', e);
  }

  // Retornar función de limpieza
  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}

/**
 * Obtiene todas las marcaciones globales acumuladas en la nube (Fallback).
 */
export async function fetchLiveCloudAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const res = await fetch(`${CLOUD_SYNC_TOPIC_URL}/json?poll=1`);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];

    const records: AttendanceRecord[] = [];
    const lines = text.trim().split('\n');
    lines.forEach((line) => {
      try {
        const parsed = JSON.parse(line);
        if (parsed.event === 'message' && parsed.message) {
          const record: AttendanceRecord = JSON.parse(parsed.message);
          if (record && record.id) {
            records.push(record);
          }
        }
      } catch (e) {}
    });

    return records.reverse(); // Más recientes primero
  } catch (e) {
    console.error('Error obteniendo marcaciones de la nube:', e);
    return [];
  }
}
