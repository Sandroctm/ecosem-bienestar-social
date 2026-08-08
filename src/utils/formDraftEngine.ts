import { useEffect } from 'react';

/**
 * Hook para Auto-Guardado en Borrador y Prevención de Cierre Accidental (beforeunload)
 * Guarda automáticamente el estado del formulario en localStorage mientras el usuario escribe.
 * Si intenta cerrar o refrescar la pestaña con cambios sin guardar, dispara la advertencia del navegador.
 */
export function useFormDraft<T>(
  draftKey: string,
  formData: T,
  setFormData: (data: T) => void,
  isDirty: boolean
): void {
  // 1. Cargar borrador al montar el componente
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_${draftKey}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        console.log(`[Form Draft Engine] Borrador recuperado para ${draftKey}`);
      } catch (e) {
        console.error(`Error parseando borrador ${draftKey}:`, e);
      }
    }
  }, [draftKey]);

  // 2. Guardar borrador en localStorage en cada modificación
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem(`draft_${draftKey}`, JSON.stringify(formData));
    }
  }, [draftKey, formData, isDirty]);

  // 3. Advertencia beforeunload del navegador ante cierre accidental
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Tiene cambios sin guardar en la ficha social. ¿Desea salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}

/**
 * Limpia el borrador guardado en localStorage una vez que el formulario se guardó exitosamente.
 */
export function clearFormDraft(draftKey: string): void {
  localStorage.removeItem(`draft_${draftKey}`);
}
