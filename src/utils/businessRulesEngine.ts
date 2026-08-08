import { Worker } from '../types';

export interface EssaludSubsidyResult {
  sueldoPromedio: number;
  diasIncapacidadTotal: number;
  diasEmpresa: number; // Primeros 20 días
  diasEssalud: number;  // Días a partir del 21
  montoDia: number;
  montoEmpresa: number;
  montoEssalud: number;
  subsidioFormulaText: string;
}

/**
 * Matriz de Cálculo de Subsidios Essalud
 * Formula: Subsidio = (Sueldo Promedio 12 últimos meses / 30) * (Días de descanso - 20)
 */
export function calculateEssaludSubsidy(
  monthlyAverageSalary: number,
  incapacityDays: number
): EssaludSubsidyResult {
  const sueldoPromedio = Math.max(0, monthlyAverageSalary);
  const diasTotal = Math.max(0, incapacityDays);
  const montoDia = sueldoPromedio / 30;

  const diasEmpresa = Math.min(20, diasTotal);
  const diasEssalud = Math.max(0, diasTotal - 20);

  const montoEmpresa = diasEmpresa * montoDia;
  const montoEssalud = diasEssalud * montoDia;

  const formulaText = `(${sueldoPromedio.toFixed(2)} / 30) * (${diasTotal} - 20) = S/. ${montoEssalud.toFixed(2)}`;

  return {
    sueldoPromedio,
    diasIncapacidadTotal: diasTotal,
    diasEmpresa,
    diasEssalud,
    montoDia,
    montoEmpresa,
    montoEssalud,
    subsidioFormulaText: formulaText,
  };
}

export interface AccessPassLockStatus {
  isBlocked: boolean;
  reason?: string;
  badgeStatus: 'PERMITIDO' | 'BLOQUEADO SCTR' | 'BLOQUEADO DESCANSO MÉDICO';
  badgeColor: string;
}

/**
 * Control de Bloqueo por SCTR Vencido o Descanso Médico Activo
 * Bloqueo automático de fotocheck / pase de ingreso a mina.
 */
export function checkWorkerAccessPass(worker: Worker): AccessPassLockStatus {
  const todayStr = new Date().toISOString().split('T')[0];

  if (worker.hasActiveMedicalLeave) {
    return {
      isBlocked: true,
      reason: `Descanso médico activo (${worker.medicalLeaveDays || 0} días registrado). Ingreso prohibido por ley SSO.`,
      badgeStatus: 'BLOQUEADO DESCANSO MÉDICO',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
  }

  if (worker.sctrExpirationDate && worker.sctrExpirationDate < todayStr) {
    return {
      isBlocked: true,
      reason: `SCTR Vencido en fecha ${worker.sctrExpirationDate}. Renovación requerida ante seguro.`,
      badgeStatus: 'BLOQUEADO SCTR',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    };
  }

  return {
    isBlocked: false,
    badgeStatus: 'PERMITIDO',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };
}

export interface DependentAlert {
  dependentId: string;
  dependentName: string;
  workerName: string;
  ageYears: number;
  ageMonths: number;
  requiresCertificateAlert: boolean;
  hasCertificate: boolean;
}

/**
 * Aviso Preventivo de Carga Familiar
 * Alerta automática a los 17 años y 6 meses de edad (210 meses) de los hijos
 * para solicitar constancia de estudios universitarios/técnicos.
 */
export function checkFamilyAllowanceAlerts(worker: Worker): DependentAlert[] {
  if (!worker.dependents || worker.dependents.length === 0) return [];

  const now = new Date();
  const alerts: DependentAlert[] = [];

  for (const dep of worker.dependents) {
    if (dep.relationship !== 'Hijo/a') continue;

    const birth = new Date(dep.birthDate);
    let monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

    const ageYears = Math.floor(monthsDiff / 12);
    const ageMonths = monthsDiff % 12;

    // Trigger alert at 17 years and 6 months (>= 210 months) up to 24 years
    const isAtAlertThreshold = monthsDiff >= 210 && monthsDiff <= 288;
    const hasCert = !!dep.hasStudyCertificate;

    if (isAtAlertThreshold) {
      alerts.push({
        dependentId: dep.id,
        dependentName: dep.fullName,
        workerName: worker.fullName,
        ageYears,
        ageMonths,
        requiresCertificateAlert: !hasCert,
        hasCertificate: hasCert,
      });
    }
  }

  return alerts;
}
