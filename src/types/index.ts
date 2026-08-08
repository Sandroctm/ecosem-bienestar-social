export type ActiveModule =
  | 'dashboard'
  | 'workers'
  | 'qr-attendance'
  | 'valuation'
  | 'room-handover'
  | 'room-management'
  | 'incidents'
  | 'family-health'
  | 'education'
  | 'infrastructure'
  | 'social-impact'
  | 'benefit-requests'
  | 'local-suppliers'
  | 'microcredits'
  | 'audit'
  | 'worker-portal'
  | 'room-checkin-portal'
  | 'accidents-subsidies'
  | 'camp-housing'
  | 'events-climate'
  | 'bereavement-workflow'
  | 'resilience-backup'
  | 'medical-leaves'
  | 'loans-assistance'
  | 'sctr-management'
  | 'predictive-analytics';

export interface DependentMember {
  id: string;
  fullName: string;
  relationship: 'Hijo/a' | 'Cónyuge' | 'Padre/Madre';
  birthDate: string; // YYYY-MM-DD
  dni: string;
  hasStudyCertificate?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Worker {
  id: string;
  dni: string;
  fullName: string;
  company: string;
  role: string;
  camp: string;
  roomNumber?: string;
  photoUrl: string; // Base64 or Image URL
  phoneWhatsApp: string;
  status: 'Activo' | 'Inactivo';
  qrCodeValue: string;

  // Campos extendidos para control de acceso y cargas familiares
  sctrExpirationDate?: string; // YYYY-MM-DD
  hasActiveMedicalLeave?: boolean;
  medicalLeaveDays?: number;
  monthlyAverageSalary?: number; // Para cálculo de subsidios
  dependents?: DependentMember[];
  deletedAt?: string;
  deletedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  timestamp: string;
  workerDni: string;
  workerName: string;
  company: string;
  camp: string;
  serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno';
  status: 'Válido' | 'Observado' | 'Duplicado';
  scannedBy: string;
  roomNumber?: string;
}

export interface ValuationItem {
  id: string;
  date: string;
  camp: string;
  contractor: string;
  workersCount: number;
  daysOccupied: number;
  totalAlojamiento: number;
  totalAlimentacion: number;
  totalServicios: number;
  totalValuation: number;
}

export interface CustomRoomItem {
  name: string;
  quantity: number;
}

export interface RoomHandover {
  id: string;
  handoverNumber: string;
  date: string;
  workerDni: string;
  workerName: string;
  company: string;
  camp: string;
  roomNumber: string;
  
  // Quantitative item counts
  bedsCount: number;
  mattressesCount: number;
  linensCount: number;
  pillowsCount: number;
  keyCardsCount: number;
  remotesCount: number;
  customItems: CustomRoomItem[];

  // Photo of the delivered room uploaded from device
  roomPhotoUrl?: string;

  // States
  bedState: 'Conforme' | 'Con Falla' | 'Faltante';
  mattressState: 'Conforme' | 'Manchado' | 'Dañado';
  linenState: 'Conforme' | 'Incompleto' | 'N/A';
  keyCardState: 'Entregado' | 'Extraviado' | 'N/A';
  acHeaterState: 'Operativo' | 'Inoperativo' | 'N/A';
  physicalRoomState: 'Excelente' | 'Bueno' | 'Observado';
  
  observations: string;
  supervisorName: string;
  status: 'Entregado' | 'Recibido' | 'Con Observación';
}

export type AttendanceSymbol = '1' | 'D' | 'L' | 'F' | '0';

export interface ValuationMatrixRow {
  id: string;
  roomNumber: string;
  roomType?: string; // Ej: Simple, Doble, Suite
  workerName: string;
  areaOrService: string;
  role: string;
  costCenter: string;
  subcontractor?: string;
  shift?: 'Día' | 'Noche';
  daysMarked: (number | AttendanceSymbol)[]; // Array of 31 days ('1' = Pernoctación 100%, 'D' = Diurno 50%, 'L' = Licencia 0%, 'F' = Falta 0%)
  dailyRate: number;
  foodConsumptionRate?: number; // Ej: 15.00
}

export interface ValuationAuditLog {
  id: string;
  valuationId: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ClientTariffSetting {
  id: string;
  clientId: string;
  clientName: string;
  roomType: 'Simple' | 'Doble' | 'Matrimonial' | 'Suite VIP';
  dailyRate: number;
  foodDailyRate: number;
  validFrom: string;
}

export interface ValuationRecord {
  id: string;
  code: string; // Ej: VAL-2026-05-HC
  year: number;
  month: string; // ej: "Mayo", "Enero"
  campId: string;
  campName: string; // ej: "Hotel Centro", "Diana", "Posada del Minero"
  clientId: string;
  clientName: string; // ej: "Alpayana", "Volcan", "Chinalco"
  creationMode: 'En Blanco' | 'Clonar Mes Anterior';
  dailyRate: number; // ej: 10.00
  totalPersonal: number;
  totalDays: number;
  subtotalHospedaje: number;
  totalAlimentacion: number;
  subtotal: number;
  igv: number;
  totalAmount: number; // Subtotal + IGV
  status: 'Abierto' | 'Cerrado' | 'Facturado';
  createdAt: string; // YYYY-MM-DD HH:mm
  createdBy: string; // ej: "Juan Pérez", "Sandro Admin"
  closedBy?: string;
  closedAt?: string;
  invoiceNumber?: string;
  matrixRows: ValuationMatrixRow[];
  auditLogs?: ValuationAuditLog[];
}

export interface MonthlyValuationMatrix {
  id: string;
  monthYear: string;
  locationName: string;
  rows: ValuationMatrixRow[];
  dailyRateDefault: number;
}

export interface IncidentReport {
  id: string;
  code: string;
  date: string;
  incidentType: 'Infraestructura' | 'Salud' | 'Convivencia' | 'Seguridad' | 'Reclamo';
  severity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  campOrCommunity: string;
  description: string;
  reportedBy: string;
  targetPhoneWhatsApp: string;
  status: 'Pendiente' | 'En Proceso' | 'Resuelto';
}

export interface FamilyHealthRecord {
  id: string;
  beneficiaryName: string;
  relationship: 'Esposa' | 'Hijo/a' | 'Madre/Padre' | 'Titular';
  dni: string;
  clinicName: string;
  lastCheckupDate: string;
  status: 'Al Día' | 'Chequeo Pendiente' | 'En Tratamiento';
  medicalCondition: string;
}

export interface EducationScholarship {
  id: string;
  studentName: string;
  relationship: 'Hijo/a' | 'Hermano/a' | 'Trabajador';
  programType: 'Beca Escolar' | 'Capacitación Técnica Local' | 'Universidad';
  institution: string;
  academicPerformance: string;
  status: 'Activo' | 'Postulante' | 'Graduado';
}

export interface InfrastructureProject {
  id: string;
  projectName: string;
  type: 'Agua y Sanamiento' | 'Electrificación' | 'Salud Pública' | 'Vía de Acceso (OXI)';
  location: string;
  progressPercent: number;
  budgetSoles: number;
  beneficiariesCount: number;
  status: 'En Ejecución' | 'En Licitación' | 'Concluido';
}

export interface SocialImpactMetric {
  id: string;
  indicatorName: string;
  icbsScore: number;
  targetScore: number;
  category: 'Educación' | 'Salud' | 'Empleabilidad' | 'Infraestructura';
  status: 'Óptimo' | 'En Metas' | 'Requiere Atención';
}

export interface BenefitRequest {
  id: string;
  requesterName: string;
  category: 'Alojamiento Familiar' | 'Beca Educativa' | 'Atención Médica' | 'Retiro de Componente';
  familyMember: string;
  dateSubmitted: string;
  status: 'Aprobado' | 'En Revisión' | 'Pendiente';
  priorityBadge: 'Baja' | 'Media' | 'Alta';
}

export interface SupplierOrder {
  id: string;
  supplierName: string;
  category: 'Alimentación Local' | 'Lavandería' | 'Mantenimiento' | 'Insumos Comunitarios';
  community: string;
  orderValueSoles: number;
  status: 'Entregado' | 'En Proceso' | 'Orden Emitida';
}

export interface Microcredit {
  id: string;
  entrepreneurName: string;
  businessName: string;
  location: string;
  creditAmountSoles: number;
  repaymentStatus: 'Al Día' | 'En Cuotas' | 'Completado';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  user: string;
  hashSignature: string;
  ipAddress?: string;
  details?: string;
}

// 08_Bitacora_Auditoria (LOG-XXX) - Registro forense inmutable
export interface BitacoraAuditoria extends AuditLog {
  idLog: string; // LOG-08-xxx
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  module: string;
  action: string;
  user: string;
  ipAddress: string;
  hashSignature: string; // Firma hash inmutable
  details: string;
  deletedAt?: string; // Por diseño corporativo global
  deletedBy?: string;
}

export type RoomStatus = 'Libre' | 'Ocupado' | 'Limpieza' | 'Reservado' | 'Mantenimiento';

export interface Room {
  id: string;
  roomNumber: string; // ej: "101", "HAB. 502"
  pabellon: string;   // ej: "Pabellón A", "Pabellón B", "Pabellón Diana"
  floor: number;      // 1, 2, 3
  capacity: number;   // cantidad de camas
  status: RoomStatus;
  currentOccupantDni?: string;
  currentOccupantName?: string;
  occupantCompany?: string;
  checkInDate?: string;
  lastLinenChangeDate: string; // YYYY-MM-DD
}

export interface Pabellon {
  id: string;
  name: string; // "Pabellón A", "Pabellón B", etc.
  description: string;
  floorsCount: number;
}

export interface BedSheetAlert {
  roomId: string;
  roomNumber: string;
  pabellon: string;
  daysSinceLastChange: number;
  isRedAlert: boolean; // >= 14 días
}

export interface ValuationRecord {
  id: string;
  year: number;
  month: string; // ej: "Mayo", "Enero"
  campId: string;
  campName: string; // ej: "Hotel Centro", "Diana", "Posada del Minero"
  clientId: string;
  clientName: string; // ej: "Alpayana", "Volcan", "Chinalco"
  dailyRate: number; // ej: 10.00
  totalPersonal: number;
  totalDays: number;
  totalAmount: number; // Subtotal + IGV
  subtotal: number;
  igv: number;
  status: 'Abierto' | 'Cerrado' | 'Facturado';
  createdAt: string; // YYYY-MM-DD HH:mm
  createdBy: string; // ej: "Administrador", "Sandro"
  matrixRows: ValuationMatrixRow[];
}

export interface ValuationHistoryRecord {
  id: string;
  monthYear: string; // ej: "MAYO 2026", "JUNIO 2026"
  savedDate: string;
  locationName: string;
  totalSubtotal: number;
  totalIgv: number;
  grandTotal: number;
  totalWorkersCount: number;
  matrixData: MonthlyValuationMatrix;
}

// ==========================================
// NUEVAS TABLAS Y ENTIDADES (09 a 12 + MULTITENANT & RESILIENCE)
// ==========================================

export interface AccidenteTrabajo {
  idAccidente: string;
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  fechaSiniestro: string;
  lugarAccidente: string;
  gravedad: 'Leve' | 'Incapacitante Temporal' | 'Incapacitante Permanente' | 'Mortal';
  tipoAccidente: 'Trabajo Directo' | 'Accidente de Trayecto' | 'Enfermedad Ocupacional';
  numFormularioST7: string;
  diasIncapacidad: number;
  sueldoPromedio12Meses: number;
  subsidioEmpresaDias: number;
  subsidioEmpresaMonto: number;
  subsidioEssaludDias: number;
  subsidioEssaludMonto: number;
  estadoViva: 'Generado' | 'En Tramitación VIVA' | 'Cobrado / Reembolsado' | 'Observado Essalud';
  cie10DiagnosticoEncrypted: string;
  cie10Codigo: string;
  unidadMinera: string;
}

export interface CampamentoHabitacion {
  idAsignacion: string;
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  company: string;
  moduloHabitacion: string;
  camaAsignada: string;
  fechaIngreso: string;
  fechaSalida: string;
  estadoHabitacion: 'Limpia / Asignada' | 'Revisión Lavandería' | 'Desinfección Pendiente' | 'Inspeccionada Convivencia';
  registroLavandería: string;
  pagoHigieneEstado: 'Conforme' | 'Observado';
  unidadMinera: string;
}

export interface EntregaBeneficio {
  idEntrega: string;
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  tipoBeneficio: 'Kit Navideño / Panetón' | 'Kit Escolar Hijos' | 'Reconocimiento Quinquenio' | 'Integración Familiar' | 'EPP Bienestar Especial';
  fechaEntrega: string;
  firmaDigitalUrl: string;
  estadoEntrega: 'Entregado y Firmado' | 'Pendiente de Recojo' | 'Observado';
  observaciones: string;
  unidadMinera: string;
}

export interface SolicitudAprobacion {
  idSolicitud: string;
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  tipoSolicitud: 'Auxilio por Defunción' | 'Activación Seguro Vida Ley' | 'Préstamo de Emergencia' | 'Gasto de Sepelio Inmediato';
  monto: number;
  nivelAprobacion1: 'Pendiente' | 'Aprobado RRHH' | 'Rechazado';
  aprobador1User?: string;
  fechaAprobacion1?: string;
  nivelAprobacion2: 'Pendiente' | 'Aprobado Gerencia' | 'Rechazado';
  aprobador2User?: string;
  fechaAprobacion2?: string;
  estadoWorkflow: 'En Revisión RRHH' | 'En Revisión Gerencia' | 'Aprobado y Desembolsado' | 'Rechazado';
  documentoRespaldoUrl?: string;
  unidadMinera: string;
}

export interface UnitTenant {
  id: string;
  name: string;
  code: string;
  location: string;
  activeWorkersCount: number;
}

export interface ResilienceMetrics {
  rpoMinutes: number;
  rtoMinutes: number;
  lastBackupTimestamp: string;
  nodeStatus: 'Primary (Morococha Node 01)' | 'Failover Replica (AWS-SA-EAST-1)';
  isFailoverActive: boolean;
  encryptedS3Bucket: string;
}

// ==========================================
// MATRIZ COMPLETA DE BASE DE DATOS ENTERPRISE (12 TABLAS CON SOFT DELETE)
// ==========================================

// 01_Trabajadores (Reusado con soft delete)
// En la interface Worker original se agregará: deletedAt?: string; deletedBy?: string;

// 02_Derechohabientes (Reusado con soft delete)
// En la interface DependentMember original se agregará: deletedAt?: string; deletedBy?: string;

// 03_Descansos_Medicos (DESC-XXX)
export interface DescansoMedico {
  idDescanso: string; // DESC-03-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  company: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  diasDescanso: number;
  tipoDescanso: 'Descanso Común' | 'Accidente de Trabajo' | 'Maternidad' | 'Enfermedad Profesional';
  diasEmpresa: number; // Primeros 20 días
  diasEssalud: number;  // A partir del día 21
  montoSubsidioEstimado: number;
  estadoSubsidio: 'Pendiente Planilla' | 'Declarado VIVA' | 'Reembolsado' | 'Observado';
  cie10Codigo: string; // Diagnóstico CIE-10
  cie10DiagnosticoEncrypted: string; // Diagnóstico médico cifrado AES-256
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 04_Prestamos_y_Ayudas (PRES-XXX)
export interface CronogramaCuota {
  nroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estado: 'Pendiente' | 'Pagado' | 'Vencido';
}

export interface PrestamoAyuda {
  idPrestamo: string; // PRES-04-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  tipoSocorro: 'Préstamo Emergencia' | 'Ayuda Social No Retornable' | 'Adelanto Sueldo';
  montoSolicitado: number;
  tasaInteresSocial: number; // 0% o interés social
  cuotasTotales: number;
  cronogramaCuotas: CronogramaCuota[];
  estadoPrestamo: 'Pendiente Aprobación' | 'Vigente en Planilla' | 'Cancelado' | 'Observado';
  motivoSolicitud: string;
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 05_SCTR_Polizas (POL-XXX)
export interface SCTRPoliza {
  idPoliza: string; // POL-05-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  company: string;
  tipoPoliza: 'SCTR Salud' | 'SCTR Pensión' | 'Vida Ley';
  nroPoliza: string;
  aseguradora: string;
  fechaVigenciaInicio: string; // YYYY-MM-DD
  fechaVigenciaFin: string; // YYYY-MM-DD
  estadoPaseMina: 'Habilitado' | 'Bloqueado SCTR Vencido' | 'Pendiente Renovación';
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 06_Atenciones_Sociales (ATEN-XXX)
export interface AtencionSocial {
  idAtencion: string; // ATEN-06-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  asistenteSocial: string;
  fechaAtencion: string; // YYYY-MM-DD HH:mm
  motivoConsulta: 'Problema Familiar' | 'Salud Crónica' | 'Apoyo Económico' | 'Clima Laboral';
  informePsicopericialCifrado: string; // Informe confidencial cifrado con AES-256
  diagnosticoOcupacional: string;
  planAccionSocial: string;
  estadoCaso: 'Abierto' | 'En Seguimiento' | 'Cerrado';
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 07_Visitas_Domiciliarias (VIS-XXX)
export interface VisitaDomiciliaria {
  idVisita: string; // VIS-07-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  fechaVisita: string; // YYYY-MM-DD
  asistenteSocial: string;
  puntajeHabitabilidad: number; // 0-100
  ingresoFamiliarMensual: number;
  situacionSocioeconomica: 'Pobreza Extrema' | 'Pobreza' | 'Medio' | 'Vulnerable';
  observacionesSoporte: string;
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 08_Bitacora_Auditoria (LOG-XXX) - Registro forense inmutable
export interface BitacoraAuditoria {
  idLog: string; // LOG-08-xxx
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  module: string;
  action: string;
  user: string;
  ipAddress: string;
  hashSignature: string; // Firma hash inmutable
  details: string;
  deletedAt?: string; // Por diseño corporativo global
  deletedBy?: string;
}

// 09_Accidentes_Trabajo (ACC-XXX) - Modificado para incluir soft delete y código
// Redefinimos con deletedAt, deletedBy y id PK compatible
export interface AccidenteTrabajoEnterprise {
  idAccidente: string; // ACC-09-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  fechaSiniestro: string;
  lugarAccidente: string;
  gravedad: 'Leve' | 'Incapacitante Temporal' | 'Incapacitante Permanente' | 'Mortal';
  tipoAccidente: 'Trabajo Directo' | 'Accidente de Trayecto' | 'Enfermedad Ocupacional';
  numFormularioST7: string;
  diasIncapacidad: number;
  sueldoPromedio12Meses: number;
  subsidioEmpresaDias: number;
  subsidioEmpresaMonto: number;
  subsidioEssaludDias: number;
  subsidioEssaludMonto: number;
  estadoViva: 'Generado' | 'En Tramitación VIVA' | 'Cobrado / Reembolsado' | 'Observado Essalud';
  cie10DiagnosticoEncrypted: string;
  cie10Codigo: string;
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 10_Campamientos_Habitaciones (CAMP-XXX)
export interface CampamentoHabitacionEnterprise {
  idAsignacion: string; // CAMP-10-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  company: string;
  moduloHabitacion: string;
  camaAsignada: string;
  fechaIngreso: string;
  fechaSalida: string;
  estadoHabitacion: 'Limpia / Asignada' | 'Revisión Lavandería' | 'Desinfección Pendiente' | 'Inspeccionada Convivencia';
  registroLavandería: string;
  pagoHigieneEstado: 'Conforme' | 'Observado';
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 11_Entregas_y_Beneficios (BEN-XXX)
export interface EntregaBeneficioEnterprise {
  idEntrega: string; // BEN-11-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  tipoBeneficio: 'Kit Navideño / Panetón' | 'Kit Escolar Hijos' | 'Reconocimiento Quinquenio' | 'Integración Familiar' | 'EPP Bienestar Especial';
  fechaEntrega: string;
  firmaDigitalUrl: string;
  estadoEntrega: 'Entregado y Firmado' | 'Pendiente de Recojo' | 'Observado';
  observaciones: string;
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// 12_Workflow_Aprobaciones (SOL-XXX)
export interface SolicitudAprobacionEnterprise {
  idSolicitud: string; // SOL-12-xxx
  idTrabajador: string;
  workerName: string;
  workerDni: string;
  tipoSolicitud: 'Auxilio por Defunción' | 'Activación Seguro Vida Ley' | 'Préstamo de Emergencia' | 'Gasto de Sepelio Inmediato';
  monto: number;
  nivelAprobacion1: 'Pendiente' | 'Aprobado RRHH' | 'Rechazado';
  aprobador1User?: string;
  fechaAprobacion1?: string;
  nivelAprobacion2: 'Pendiente' | 'Aprobado Gerencia' | 'Rechazado';
  aprobador2User?: string;
  fechaAprobacion2?: string;
  estadoWorkflow: 'En Revisión RRHH' | 'En Revisión Gerencia' | 'Aprobado and Desembolsado' | 'Rechazado';
  documentoRespaldoUrl?: string;
  deletedAt?: string;
  deletedBy?: string;
  unidadMinera: string;
}

// Estructuras de IA, Sincronización y Notificaciones
export interface AbsenteeismRiskReport {
  workerId: string;
  workerName: string;
  riskScore: number; // 0-100
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  riskFactors: string[];
  suggestedAction: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  actionType: 'INSERT' | 'UPDATE' | 'DELETE';
  tableName: string;
  payload: any;
  timestamp: string;
}


