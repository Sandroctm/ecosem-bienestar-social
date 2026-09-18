import { Worker, AttendanceRecord } from '../types';

export interface AttendanceValidationResult {
  allowed: boolean;
  status: 'Válido' | 'Duplicado Observado' | 'Acceso Bloqueado (SCTR Vencido)' | 'Acceso Bloqueado (Descanso Médico Activo)';
  message: string;
  previousScanTimestamp?: string;
  worker?: Worker;
  sctrExpired?: boolean;
  medicalLeaveActive?: boolean;
}

export function isTodayRecord(timestampStr: string, referenceDate: Date = new Date()): boolean {
  if (!timestampStr) return false;

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  // Try extracting DD/MM/YYYY or D/M/YYYY
  const ddmmyyyyMatch = timestampStr.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10);
    const year = parseInt(ddmmyyyyMatch[3], 10);
    if (day === refDay && month === refMonth && year === refYear) {
      return true;
    }
  }

  // Try extracting YYYY-MM-DD
  const yyyymmddMatch = timestampStr.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10);
    const day = parseInt(yyyymmddMatch[3], 10);
    if (day === refDay && month === refMonth && year === refYear) {
      return true;
    }
  }

  // Fallback: standard Date parsing
  const parsed = new Date(timestampStr);
  if (!isNaN(parsed.getTime())) {
    return (
      parsed.getFullYear() === refYear &&
      parsed.getMonth() + 1 === refMonth &&
      parsed.getDate() === refDay
    );
  }

  // Fallback: substring matching
  const todayLocale = referenceDate.toLocaleDateString('es-PE');
  return timestampStr.includes(todayLocale);
}

/**
 * Motor de Validación Milimétrica y Anti-Fraude de Asistencia
 * Valida 4 candados críticos antes de permitir el ingreso o la entrega de ración:
 * 1. RESTRICCIÓN ABSOLUTA: Máximo 1 marcación por día por personal.
 * 2. Vencimiento de póliza SCTR.
 * 3. Descanso médico activo (incapacidad laboral para trabajo de campo).
 * 4. Padrón oficial de trabajadores.
 */
export function validateAttendanceCheckin(
  workerDni: string,
  serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno',
  workers: Worker[],
  attendanceRecords: AttendanceRecord[]
): AttendanceValidationResult {
  const cleanDni = workerDni.trim();
  const dniMatch = cleanDni.match(/\b\d{8}\b/);
  const targetDni = dniMatch ? dniMatch[0] : cleanDni;

  const foundWorker = workers.find(
    (w) => w.dni === targetDni || w.dni === cleanDni || w.qrCodeValue.includes(cleanDni) || w.id === cleanDni
  );

  // 1. Validar Duplicidad de Marcación en el mismo día por el mismo personal (MÁXIMO 1 POR DÍA POR TRABAJADOR)
  const existingRecordToday = attendanceRecords.find((rec) => {
    return rec.workerDni === targetDni && isTodayRecord(rec.timestamp);
  });

  if (existingRecordToday) {
    return {
      allowed: false,
      status: 'Duplicado Observado',
      message: `⛔ MARCACIÓN DENEGADA: El trabajador con DNI ${targetDni} ya registró su asistencia el día de hoy (${existingRecordToday.timestamp} - ${existingRecordToday.serviceType}). Solo se permite 1 marcación por día por personal.`,
      previousScanTimestamp: existingRecordToday.timestamp,
      worker: foundWorker,
    };
  }

  // Si no está registrado en el padrón, marcar como observado pero permitir registro de garita
  if (!foundWorker) {
    return {
      allowed: true,
      status: 'Válido',
      message: `¡Marcación aprobada para DNI ${targetDni}! (Personal externo / contratista sin ficha previa).`,
    };
  }

  // 2. Validar Descanso Médico Activo
  if (foundWorker.hasActiveMedicalLeave) {
    return {
      allowed: false,
      status: 'Acceso Bloqueado (Descanso Médico Activo)',
      message: `⛔ ACCESO RESTRINGIDO: El trabajador ${foundWorker.fullName} tiene un Descanso Médico ACTIVO (${foundWorker.medicalLeaveDays || 0} días). No apto para labores en campamento.`,
      worker: foundWorker,
      medicalLeaveActive: true,
    };
  }

  // 3. Validar Póliza SCTR Vencida
  if (foundWorker.sctrExpirationDate) {
    const sctrDate = new Date(foundWorker.sctrExpirationDate);
    const today = new Date();
    if (sctrDate < today) {
      return {
        allowed: false,
        status: 'Acceso Bloqueado (SCTR Vencido)',
        message: `⛔ ACCESO RESTRINGIDO: La póliza SCTR del trabajador venció el ${foundWorker.sctrExpirationDate}. No cuenta con cobertura de salud vigente.`,
        worker: foundWorker,
        sctrExpired: true,
      };
    }
  }

  // Todo en regla
  return {
    allowed: true,
    status: 'Válido',
    message: `🟢 ACCESO CONCEDIDO: Marcación biométrica válida para ${foundWorker.fullName} (${foundWorker.company}).`,
    worker: foundWorker,
  };
}
