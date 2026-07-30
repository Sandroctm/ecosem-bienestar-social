export type ActiveModule =
  | 'dashboard'
  | 'workers'
  | 'qr-attendance'
  | 'valuation'
  | 'room-handover'
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
  | 'room-checkin-portal';

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

export interface ValuationMatrixRow {
  id: string;
  roomNumber: string;
  workerName: string;
  areaOrService: string;
  role: string;
  costCenter: string;
  daysMarked: number[]; // Array of 31 days (1 for occupied, 0 for empty)
  dailyRate: number;
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

