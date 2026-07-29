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

// Optional Demo Seed Data for instant testing if requested by user
export const DEMO_WORKERS: Worker[] = [
  {
    id: 'W-001',
    dni: '45892011',
    fullName: 'Juan Pérez Ramírez',
    company: 'Consorcio Minero Arequipa',
    role: 'Supervisor de Operaciones',
    camp: 'Campamento Norte - Las Bambas',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
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
    role: 'Operador de Maquinaria',
    camp: 'Campamento Sur - Yauri',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    phoneWhatsApp: '51987654323',
    status: 'Activo',
    qrCodeValue: 'ECOSEM:10982377:CARLOS_MAMANI',
  },
];
