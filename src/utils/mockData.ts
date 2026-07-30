import {
  Worker,
  AttendanceRecord,
  ValuationItem,
  RoomHandover,
  IncidentReport,
  FamilyHealthRecord,
  EducationScholarship,
  InfrastructureProject,
  SocialImpactMetric,
  BenefitRequest,
  SupplierOrder,
  Microcredit,
  AuditLog,
} from '../types';

// Clean initial data arrays (Empty by default per user request)
export const INITIAL_WORKERS: Worker[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_VALUATIONS: ValuationItem[] = [];
export const INITIAL_ROOM_HANDOVERS: RoomHandover[] = [];
export const INITIAL_INCIDENTS: IncidentReport[] = [];
export const INITIAL_FAMILY_HEALTH: FamilyHealthRecord[] = [];
export const INITIAL_SCHOLARSHIPS: EducationScholarship[] = [];
export const INITIAL_INFRASTRUCTURE: InfrastructureProject[] = [];
export const INITIAL_SOCIAL_IMPACT: SocialImpactMetric[] = [];
export const INITIAL_BENEFIT_REQUESTS: BenefitRequest[] = [];
export const INITIAL_SUPPLIERS: SupplierOrder[] = [];
export const INITIAL_MICROCREDITS: Microcredit[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// ═══════════════════════════════════════════════════════════════
// Demo Seed Data — 8 trabajadores realistas del sector minero peruano
// ═══════════════════════════════════════════════════════════════
export const DEMO_WORKERS: Worker[] = [
  {
    id: 'W-001',
    dni: '45892011',
    fullName: 'Juan Pérez Ramírez',
    company: 'Consorcio Minero Arequipa',
    role: 'Supervisor de Operaciones',
    camp: 'Campamento Norte - Las Bambas',
    roomNumber: 'A-204',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654321',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:45892011:JUAN_PEREZ',
  },
  {
    id: 'W-002',
    dni: '71239844',
    fullName: 'María Flores Quispe',
    company: 'Servicios Logísticos del Sur',
    role: 'Técnica de Salud Ocupacional',
    camp: 'Campamento Central',
    roomNumber: 'HAB. 502',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654322',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:71239844:MARIA_FLORES',
  },
  {
    id: 'W-003',
    dni: '10982377',
    fullName: 'Carlos Mamani Choque',
    company: 'Techint Minería',
    role: 'Operador de Maquinaria Pesada',
    camp: 'Campamento Sur - Yauri',
    roomNumber: 'HAB. 304',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654323',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:10982377:CARLOS_MAMANI',
  },
  {
    id: 'W-004',
    dni: '20456789',
    fullName: 'Rosa Huamán Villanueva',
    company: 'ECOSEM Contratistas',
    role: 'Coordinadora de Bienestar Social',
    camp: 'Campamento Central',
    roomNumber: 'HAB. 102',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654324',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:20456789:ROSA_HUAMAN',
  },
  {
    id: 'W-005',
    dni: '30567891',
    fullName: 'Pedro Condori Ticona',
    company: 'Minera Las Bambas S.A.',
    role: 'Ingeniero de Minas',
    camp: 'Campamento Norte - Las Bambas',
    roomNumber: 'HAB. 503',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654325',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:30567891:PEDRO_CONDORI',
  },
  {
    id: 'W-006',
    dni: '40678912',
    fullName: 'Luis Quispe Apaza',
    company: 'Techint Minería',
    role: 'Electricista Industrial',
    camp: 'Campamento Sur - Yauri',
    roomNumber: 'HAB. 205',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654326',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:40678912:LUIS_QUISPE',
  },
  {
    id: 'W-007',
    dni: '50789123',
    fullName: 'Ana Ccapa Mendoza',
    company: 'Servicios Logísticos del Sur',
    role: 'Nutricionista de Campamento',
    camp: 'Campamento Base',
    roomNumber: 'HAB. 508',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654327',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:50789123:ANA_CCAPA',
  },
  {
    id: 'W-008',
    dni: '60891234',
    fullName: 'Miguel Torres Salazar',
    company: 'Consorcio Minero Arequipa',
    role: 'Jefe de Seguridad',
    camp: 'Campamento Central',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654328',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:60891234:MIGUEL_TORRES',
  },
];

// Demo attendance records for instant testing
export const DEMO_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-D001',
    timestamp: new Date().toLocaleString(),
    workerDni: '45892011',
    workerName: 'Juan Pérez Ramírez',
    company: 'Consorcio Minero Arequipa',
    camp: 'Campamento Norte - Las Bambas',
    serviceType: 'Almuerzo',
    status: 'Válido',
    scannedBy: 'Escáner Garita ECOSEM',
  },
  {
    id: 'ATT-D002',
    timestamp: new Date().toLocaleString(),
    workerDni: '71239844',
    workerName: 'María Flores Quispe',
    company: 'Servicios Logísticos del Sur',
    camp: 'Campamento Central',
    serviceType: 'Alojamiento',
    status: 'Válido',
    scannedBy: 'Auto-Registro Habitación A-204',
    roomNumber: 'A-204',
  },
  {
    id: 'ATT-D003',
    timestamp: new Date().toLocaleString(),
    workerDni: '10982377',
    workerName: 'Carlos Mamani Choque',
    company: 'Techint Minería',
    camp: 'Campamento Sur - Yauri',
    serviceType: 'Ingreso Campamento',
    status: 'Válido',
    scannedBy: 'Escáner Garita ECOSEM',
  },
  {
    id: 'ATT-D004',
    timestamp: new Date().toLocaleString(),
    workerDni: '20456789',
    workerName: 'Rosa Huamán Villanueva',
    company: 'ECOSEM Contratistas',
    camp: 'Campamento Central',
    serviceType: 'Cena',
    status: 'Válido',
    scannedBy: 'Escáner Comedor Central',
  },
  {
    id: 'ATT-D005',
    timestamp: new Date().toLocaleString(),
    workerDni: '30567891',
    workerName: 'Pedro Condori Ticona',
    company: 'Minera Las Bambas S.A.',
    camp: 'Campamento Norte - Las Bambas',
    serviceType: 'Desayuno',
    status: 'Válido',
    scannedBy: 'Escáner Comedor Norte',
  },
];

// Demo benefit requests
export const DEMO_BENEFIT_REQUESTS: BenefitRequest[] = [
  {
    id: 'REQ-D001',
    requesterName: 'Juan Pérez Ramírez',
    category: 'Alojamiento Familiar',
    familyMember: 'Esposa e hijo (3 años)',
    dateSubmitted: '2026-07-28',
    status: 'Aprobado',
    priorityBadge: 'Alta',
  },
  {
    id: 'REQ-D002',
    requesterName: 'María Flores Quispe',
    category: 'Beca Educativa',
    familyMember: 'Hijo (17 años) - UNSA Arequipa',
    dateSubmitted: '2026-07-25',
    status: 'En Revisión',
    priorityBadge: 'Media',
  },
  {
    id: 'REQ-D003',
    requesterName: 'Carlos Mamani Choque',
    category: 'Atención Médica',
    familyMember: 'Madre (67 años) - Hospital Yauri',
    dateSubmitted: '2026-07-29',
    status: 'Pendiente',
    priorityBadge: 'Alta',
  },
  {
    id: 'REQ-D004',
    requesterName: 'Rosa Huamán Villanueva',
    category: 'Retiro de Componente',
    familyMember: 'Titular',
    dateSubmitted: '2026-07-30',
    status: 'Aprobado',
    priorityBadge: 'Baja',
  },
];
