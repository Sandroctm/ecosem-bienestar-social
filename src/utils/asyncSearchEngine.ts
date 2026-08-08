/**
 * Motor de Cancelación de Peticiones y Prevención de Condición de Carrera (Race Conditions)
 * Cancela automáticamente la petición HTTP/asíncrona anterior en curso mediante AbortController.
 * Garantiza que sólo la respuesta más reciente se renderice en pantalla.
 */

class AsyncSearchManager {
  private activeControllers: Map<string, AbortController> = new Map();

  /**
   * Obtiene un AbortSignal para una clave de búsqueda dada (ej. 'workers_dni_search')
   * y aborta la petición previa si aún no había finalizado.
   */
  public getSignal(searchKey: string): AbortSignal {
    // Si ya hay una búsqueda en curso para esta clave, cancelarla inmediatamente
    if (this.activeControllers.has(searchKey)) {
      const oldController = this.activeControllers.get(searchKey);
      oldController?.abort('Nueva búsqueda iniciada por el usuario (Race Condition Prevented)');
    }

    const newController = new AbortController();
    this.activeControllers.set(searchKey, newController);
    return newController.signal;
  }

  /**
   * Notifica que la búsqueda terminó limpiando el controlador activo.
   */
  public completeSearch(searchKey: string): void {
    this.activeControllers.delete(searchKey);
  }
}

export const asyncSearchManager = new AsyncSearchManager();

/**
 * Función helper genérica para ejecutar búsquedas asíncronas con AbortController integrado.
 */
export async function executeCancelableSearch<T>(
  searchKey: string,
  searchTask: (signal: AbortSignal) => Promise<T>
): Promise<T | null> {
  const signal = asyncSearchManager.getSignal(searchKey);
  try {
    const result = await searchTask(signal);
    asyncSearchManager.completeSearch(searchKey);
    return result;
  } catch (error: any) {
    if (error?.name === 'AbortError' || signal.aborted) {
      console.log(`[Race Condition Prevented] Petición obsoleta abortada para: ${searchKey}`);
      return null;
    }
    asyncSearchManager.completeSearch(searchKey);
    throw error;
  }
}
