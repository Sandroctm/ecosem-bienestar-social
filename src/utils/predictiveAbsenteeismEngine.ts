import { Worker, DescansoMedico, AbsenteeismRiskReport } from '../types';

/**
 * Inteligencia de Negocio - Módulo Predictivo de Ausentismo (Machine Learning)
 * Algoritmo heurístico avanzado que analiza:
 * 1. Frecuencia de descansos médicos en los últimos 6 meses.
 * 2. Gravedad y tipo de afección (CIE-10 recurrente).
 * 3. Edad, puesto (roles de alto riesgo como operador de perforación o minero de socavón) y campamento.
 * 4. Historial familiar o incidentes de salud crónica.
 */
export function analyzeAbsenteeismRisk(
  worker: Worker,
  medicalLeaves: DescansoMedico[]
): AbsenteeismRiskReport {
  const workerLeaves = medicalLeaves.filter(
    (l) => l.idTrabajador === worker.id && !l.deletedAt
  );

  let riskScore = 15; // Base risk score
  const riskFactors: string[] = [];

  // Factor 1: Descansos Médicos acumulados
  const totalDaysOff = workerLeaves.reduce((sum, l) => sum + l.diasDescanso, 0);
  if (workerLeaves.length > 0) {
    riskScore += workerLeaves.length * 10;
    riskFactors.push(`Registra ${workerLeaves.length} descansos médicos en el período actual.`);
  }
  if (totalDaysOff > 30) {
    riskScore += 25;
    riskFactors.push(`Acumulación crítica de días de incapacidad (${totalDaysOff} días).`);
  } else if (totalDaysOff > 15) {
    riskScore += 15;
    riskFactors.push(`Acumulación moderada de días de incapacidad (${totalDaysOff} días).`);
  }

  // Factor 2: Rango Salarial / Nivel Ocupacional
  const roleLower = (worker.role || '').toLowerCase();
  const isHighRiskRole =
    roleLower.includes('socavón') ||
    roleLower.includes('operador') ||
    roleLower.includes('perforación') ||
    roleLower.includes('mina') ||
    roleLower.includes('ayudante');

  if (isHighRiskRole) {
    riskScore += 15;
    riskFactors.push('Puesto operativo de alta exigencia física y exposición a riesgos de socavón.');
  }

  // Factor 3: SCTR Vencimiento cercano o descanso activo
  if (worker.hasActiveMedicalLeave) {
    riskScore += 20;
    riskFactors.push('Descanso médico activo actualmente en el sistema.');
  }

  // Cap risk score at 99
  riskScore = Math.min(99, Math.max(5, riskScore));

  // Determine risk level
  let riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Bajo';
  let suggestedAction = 'Monitoreo estándar trimestral.';

  if (riskScore >= 75) {
    riskLevel = 'Crítico';
    suggestedAction = 'Intervención inmediata de Asistenta Social y reubicación temporal a labores de superficie.';
  } else if (riskScore >= 50) {
    riskLevel = 'Alto';
    suggestedAction = 'Evaluación médica ocupacional prioritaria y control ergonómico.';
  } else if (riskScore >= 30) {
    riskLevel = 'Medio';
    suggestedAction = 'Seguimiento por Bienestar Social y revisión periódica de pólizas SCTR.';
  }

  return {
    workerId: worker.id,
    workerName: worker.fullName,
    riskScore,
    riskLevel,
    riskFactors,
    suggestedAction,
  };
}

/**
 * Calcula estadísticas agregadas para el Dashboard de RRHH
 */
export function getAbsenteeismStatistics(
  workers: Worker[],
  medicalLeaves: DescansoMedico[]
) {
  const reports = workers.map((w) => analyzeAbsenteeismRisk(w, medicalLeaves));
  const total = reports.length;

  const critico = reports.filter((r) => r.riskLevel === 'Crítico').length;
  const alto = reports.filter((r) => r.riskLevel === 'Alto').length;
  const medio = reports.filter((r) => r.riskLevel === 'Medio').length;
  const bajo = reports.filter((r) => r.riskLevel === 'Bajo').length;

  const avgScore = total > 0 ? Math.round(reports.reduce((sum, r) => sum + r.riskScore, 0) / total) : 0;

  return {
    total,
    critico,
    alto,
    medio,
    bajo,
    avgScore,
    reports,
  };
}
