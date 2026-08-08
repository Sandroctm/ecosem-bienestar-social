/**
 * Sanitizador y Validador Estricto de Payloads QR
 * Erradica ataques de inyección XSS (Cross-Site Scripting) y SQL Injection (SQLi)
 * al decodificar un código QR físico o digital en garita o escáner móvil.
 */

export interface SanitizedQRResult {
  isValid: boolean;
  sanitizedValue: string;
  workerDni?: string;
  errorMessage?: string;
}

export function sanitizeAndValidateQRPayload(rawPayload: string): SanitizedQRResult {
  if (!rawPayload || typeof rawPayload !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      errorMessage: 'Código QR vacío o inválido.',
    };
  }

  const trimmed = rawPayload.trim();

  // Detectar intento de XSS (<script>, javascript:, onload=, etc.)
  const xssPattern = /<[^>]*script|javascript:|on\w+\s*=|data:text\/html/i;
  if (xssPattern.test(trimmed)) {
    console.error('[Seguridad QR] Intento de Inyección XSS detectado y bloqueado:', trimmed);
    return {
      isValid: false,
      sanitizedValue: '',
      errorMessage: 'Alerta de Seguridad: El código QR contiene scripts no autorizados (XSS).',
    };
  }

  // Detectar intento de SQL Injection (' OR 1=1, UNION SELECT, DROP TABLE, etc.)
  const sqliPattern = /('|"--|;|\b(select|union|insert|update|delete|drop|alter|exec|truncate)\b)/i;
  if (sqliPattern.test(trimmed)) {
    console.error('[Seguridad QR] Intento de Inyección SQL detectado y bloqueado:', trimmed);
    return {
      isValid: false,
      sanitizedValue: '',
      errorMessage: 'Alerta de Seguridad: El código QR contiene comandos SQL maliciosos.',
    };
  }

  // Eliminar cualquier etiqueta HTML de seguridad adicional
  const cleanValue = trimmed.replace(/<[^>]*>?/gm, '');

  // Extraer DNI de 8 dígitos si está presente (formatos estándar: "ECOSEM-W001-45871236" o "45871236")
  const dniMatch = cleanValue.match(/\b\d{8}\b/);
  const workerDni = dniMatch ? dniMatch[0] : undefined;

  return {
    isValid: true,
    sanitizedValue: cleanValue,
    workerDni,
  };
}
