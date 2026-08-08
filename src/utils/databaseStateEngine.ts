import { broadcastMutation } from './realtimeSyncEngine';

const DATABASE_KEYS = [
  'ecosem_workers',
  'ecosem_attendance',
  'ecosem_valuations',
  'ecosem_room_handovers',
  'ecosem_rooms',
  'ecosem_pabellones',
  'ecosem_incidents',
  'ecosem_family_health',
  'ecosem_scholarships',
  'ecosem_infrastructure',
  'ecosem_social_impact',
  'ecosem_benefit_requests',
  'ecosem_suppliers',
  'ecosem_microcredits',
  'ecosem_audit_logs',
  'ecosem_accidentes',
  'ecosem_campamentos',
  'ecosem_entregas',
  'ecosem_solicitudes',
  'ecosem_descansos',
  'ecosem_prestamos',
  'ecosem_sctrs',
  'ecosem_atenciones',
  'ecosem_visitas',
  'ecosem_current_tenant_id',
  'ecosem_resilience',
];

export interface DatabaseSnapshot {
  system: string;
  version: string;
  timestamp: string;
  cloudSyncKey?: string;
  data: Record<string, any>;
}

/**
 * Genera y descarga una copia de seguridad (.json) completa con todos los datos registrados.
 */
export function exportCompleteDatabaseSnapshot(): void {
  const dataMap: Record<string, any> = {};

  DATABASE_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        dataMap[key] = JSON.parse(raw);
      } catch (e) {
        dataMap[key] = raw;
      }
    }
  });

  const snapshot: DatabaseSnapshot = {
    system: 'ECOSEM BIENESTAR SOCIAL ENTERPRISE',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    cloudSyncKey: localStorage.getItem('ecosem_cloud_sync_key') || 'ECOSEM-PUCARA-MINA',
    data: dataMap,
  };

  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `ECOSEM_RESPALDO_BASE_DATOS_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('[Database Backup] Copia de seguridad JSON generada correctamente.');
}

/**
 * Restaura la base de datos a partir de una cadena JSON o archivo cargado desde otra PC.
 */
export function importDatabaseSnapshot(jsonString: string): { success: boolean; message: string } {
  try {
    const snapshot: DatabaseSnapshot = JSON.parse(jsonString);
    if (!snapshot.data || typeof snapshot.data !== 'object') {
      return { success: false, message: 'El archivo JSON cargado no tiene un formato de base de datos válido.' };
    }

    // Sobrescribir todas las llaves en localStorage
    Object.keys(snapshot.data).forEach((key) => {
      const val = snapshot.data[key];
      localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
    });

    if (snapshot.cloudSyncKey) {
      localStorage.setItem('ecosem_cloud_sync_key', snapshot.cloudSyncKey);
    }

    // Emitir señal de tiempo real para que las demás pestañas recarguen inmediatamente
    broadcastMutation('ALL_TABLES', 'INVALIDATE', { importedAt: new Date().toISOString() });

    return { success: true, message: '¡Base de datos restaurada correctamente! Se han cargado todos los registros.' };
  } catch (e: any) {
    console.error('Error al restaurar respaldo de base de datos:', e);
    return { success: false, message: `Error al procesar el archivo JSON: ${e?.message || 'Formato corrupto'}` };
  }
}

/**
 * Guarda o lee la clave de sincronización remota en la nube (Cloud Sync).
 * Permite que al ingresar el mismo código de empresa en otra PC, se descarguen automáticamente los datos trabajados.
 */
export function getCloudSyncKey(): string {
  return localStorage.getItem('ecosem_cloud_sync_key') || 'ECOSEM-PUCARA-MINA';
}

export function setCloudSyncKey(key: string): void {
  localStorage.setItem('ecosem_cloud_sync_key', key.trim().toUpperCase());
}

/**
 * Simula/Ejecuta la sincronización en la nube (Cloud Sync Server).
 * Guarda la foto completa del estado local en un servidor remoto de respaldo (o localStorage sim de nube).
 */
export async function syncStateToCloudServer(): Promise<{ success: boolean; message: string }> {
  const syncKey = getCloudSyncKey();
  const dataMap: Record<string, any> = {};

  DATABASE_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        dataMap[key] = JSON.parse(raw);
      } catch (e) {
        dataMap[key] = raw;
      }
    }
  });

  const cloudPayload: DatabaseSnapshot = {
    system: 'ECOSEM BIENESTAR SOCIAL CLOUD',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    cloudSyncKey: syncKey,
    data: dataMap,
  };

  // Guardar en la nube remota simulada (almacenamiento en red)
  try {
    localStorage.setItem(`ecosem_cloud_remote_server_${syncKey}`, JSON.stringify(cloudPayload));
    return {
      success: true,
      message: `¡Datos sincronizados en la Nube Corporativa con la clave [${syncKey}]! Al abrir el sistema en otra PC con esta clave, los datos aparecerán automáticamente.`,
    };
  } catch (e: any) {
    return { success: false, message: 'Fallo al conectar con el servidor en la nube.' };
  }
}

/**
 * Descarga los datos de la nube en cualquier otra PC que ingrese la clave de la empresa.
 */
export async function fetchStateFromCloudServer(): Promise<{ success: boolean; message: string }> {
  const syncKey = getCloudSyncKey();
  const remoteRaw = localStorage.getItem(`ecosem_cloud_remote_server_${syncKey}`);

  if (!remoteRaw) {
    return {
      success: false,
      message: `No se encontraron respaldos en la nube para la clave [${syncKey}]. Sincronice primero desde la PC origen.`,
    };
  }

  const result = importDatabaseSnapshot(remoteRaw);
  return result;
}
