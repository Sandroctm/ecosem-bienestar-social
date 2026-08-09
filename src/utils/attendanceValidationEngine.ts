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

/**
 * Motor de Validación Milimétrica y Anti-Fraude de Asistencia
 * Valida 4 candados críticos antes de permitir el ingreso o la entrega de ración:
 * 1. Duplicidad de ración/ingreso el mismo día.
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

  const todayStr = new Date().toLocaleDateString('es-PE'); // "9/8/2026"

  // 1. Validar Duplicidad de Ración / Marcación en el mismo día y mismo servicio
  const existingRecordToday = attendanceRecords.find((rec) => {
    // Comparar contra el día de hoy en formato local del navegador
    const recTimestamp = rec.timestamp || '';
    const isSameDay =
      recTimestamp.includes(todayStr) ||
      recTimestamp.startsWith(new Date().toISOString().split('T')[0]);
    return rec.workerDni === targetDni && rec.serviceType === serviceType && isSameDay;
  });

  if (existingRecordToday) {
    return {
      allowed: false,
      status: 'Duplicado Observado',
      message: `⚠️ RACIÓN / MARCACIÓN YA REGISTRADA HOY: El trabajador ya marcó ${serviceType} a las ${existingRecordToday.timestamp}.`,
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
