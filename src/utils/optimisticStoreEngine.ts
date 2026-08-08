import { broadcastMutation } from './realtimeSyncEngine';

export interface OptimisticMutationOptions<T> {
  entityName: string;
  previousState: T[];
  updatedItem: T;
  getItemKey: (item: T) => string | number;
  getItemVersion?: (item: T) => number | undefined;
  onSuccessState: (newState: T[]) => void;
  onRollbackState: (previousState: T[], errorMsg: string) => void;
  asyncPersistTask: (item: T) => Promise<boolean>;
}

/**
 * Motor de Actualizaciones Optimistas (Optimistic UI) con Rollback Automático y Bloqueo Optimista (version_id).
 * 1. Refleja de inmediato el cambio en la interfaz (Cero Latencia Percibida).
 * 2. Valida la versión (Dirty Reads / Bloqueo Optimista).
 * 3. Ejecuta la persistencia asíncrona. Si la API falla, ejecuta un Rollback automático y muestra alerta.
 */
export async function executeOptimisticMutation<T>(
  options: OptimisticMutationOptions<T>
): Promise<boolean> {
  const {
    entityName,
    previousState,
    updatedItem,
    getItemKey,
    getItemVersion,
    onSuccessState,
    onRollbackState,
    asyncPersistTask,
  } = options;

  const keyToUpdate = getItemKey(updatedItem);
  const currentItemInState = previousState.find((item) => getItemKey(item) === keyToUpdate);

  // 1. Bloqueo Optimista (dirty read check)
  if (currentItemInState && getItemVersion) {
    const currentVersion = getItemVersion(currentItemInState) || 1;
    const incomingVersion = getItemVersion(updatedItem) || 1;

    if (incomingVersion < currentVersion) {
      const conflictMsg = `[Bloqueo Optimista DB] Conflicto de Concurrencia en ${entityName}: El registro fue modificado simultáneamente por otro usuario (v${currentVersion} vs v${incomingVersion}).`;
      console.warn(conflictMsg);
      onRollbackState(previousState, conflictMsg);
      return false;
    }
  }

  // Incrementar la versión para la mutación optimista
  const nextVersion = currentItemInState && getItemVersion ? (getItemVersion(currentItemInState) || 1) + 1 : 1;
  const itemWithNewVersion = { ...updatedItem, version_id: nextVersion };

  // 2. Aplicar cambio optimista inmediato en la UI
  const optimisticState = previousState.map((item) =>
    getItemKey(item) === keyToUpdate ? itemWithNewVersion : item
  );

  // Si no existía previa coincidencia, lo agregamos arriba
  const exists = previousState.some((item) => getItemKey(item) === keyToUpdate);
  const nextState = exists ? optimisticState : [itemWithNewVersion, ...previousState];

  onSuccessState(nextState);
  broadcastMutation(entityName, exists ? 'UPDATE' : 'INSERT', itemWithNewVersion);

  // 3. Persistencia asíncrona real
  try {
    const isSuccess = await asyncPersistTask(itemWithNewVersion);
    if (!isSuccess) {
      throw new Error('Servidor retornó error de persistencia.');
    }
    return true;
  } catch (error: any) {
    console.error(`[Optimistic Rollback] Fallo al guardar en ${entityName}:`, error);
    onRollbackState(previousState, `Error en ${entityName}: Se revirtió el cambio optimista debido a falla de red.`);
    return false;
  }
}
