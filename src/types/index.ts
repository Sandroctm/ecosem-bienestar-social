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
  | 'resilience-backup';

export interface DependentMember {
  id: string;
  fullName: string;
  relationship: 'Hijo/a' | 'Cónyuge' | 'Padre/Madre';
  birthDate: string; // YYYY-MM-DD
  dni: string;
  hasStudyCertificate?: boolean;
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

