import {
  Worker,
  DependentMember,
  DescansoMedico,
  PrestamoAyuda,
  SCTRPoliza,
  AtencionSocial,
  VisitaDomiciliaria,
  BitacoraAuditoria,
  AccidenteTrabajoEnterprise,
  CampamentoHabitacionEnterprise,
  EntregaBeneficioEnterprise,
  SolicitudAprobacionEnterprise,
} from '../types';
import { encryptAES256, generateAuditIntegrityHash } from './securityCrypto';

// 01_Trabajadores Seed
export const MOCK_ENTERPRISE_WORKERS: Worker[] = [
  {
    id: 'W001',
    dni: '45871236',
    fullName: 'Juan Pérez Quispe',
    company: 'ECOSEM PUCARA',
    role: 'Operador de Perforación Socavón',
    camp: 'Campamento Diana - Módulo A',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    phoneWhatsApp: '+51987654321',
    status: 'Activo',
    qrCodeValue: 'ECOSEM-W001-45871236',
    sctrExpirationDate: '2026-12-31',
    hasActiveMedicalLeave: false,
    monthlyAverageSalary: 3800,
    dependents: [
      {
        id: 'FAM-01',
        fullName: 'Carlitos Pérez Mota',
        relationship: 'Hijo/a',
        birthDate: '2008-11-20', // Tiene 17 años y 8 meses (Trigger alerta activo!)
        dni: '78945612',
        hasStudyCertificate: false,
      },
      {
        id: 'FAM-02',
        fullName: 'Juana Quispe de Pérez',
        relationship: 'Cónyuge',
        birthDate: '1985-05-14',
        dni: '41235689',
      },
    ],
  },
  {
    id: 'W002',
    dni: '71234567',
    fullName: 'María Rodríguez Fernández',
    company: 'CONTRATISTAS MINEROS SAC',
    role: 'Ingeniera de Seguridad SSO',
    camp: 'Campamento Diana - Módulo B',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150',
    phoneWhatsApp: '+51912345678',
    status: 'Activo',
    qrCodeValue: 'ECOSEM-W002-71234567',
    sctrExpirationDate: '2026-08-01', // Ya vencido (Trigger bloqueo fotocheck activo!)
    hasActiveMedicalLeave: false,
    monthlyAverageSalary: 4500,
    dependents: [],
  },
  {
    id: 'W003',
    dni: '32569874',
    fullName: 'Carlos Mota Lazo',
    company: 'MINERA CHINALCO',
    role: 'Supervisor de Planta Concentradora',
    camp: 'Campamento Central',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    phoneWhatsApp: '+51956897412',
    status: 'Activo',
    qrCodeValue: 'ECOSEM-W003-32569874',
    sctrExpirationDate: '2026-11-30',
    hasActiveMedicalLeave: true, // Descanso activo (Trigger bloqueo fotocheck activo!)
    medicalLeaveDays: 15,
    monthlyAverageSalary: 5200,
    dependents: [],
  },
  {
    id: 'W004',
    dni: '72544740',
    fullName: 'Rossysela Tovar Artica',
    company: 'ECOSEM PUCARA',
    role: 'Asistente de Bienestar Social',
    camp: 'Campamento Soledad',
    roomNumber: 'HAB. 202',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    phoneWhatsApp: '+51972544740',
    status: 'Activo',
    qrCodeValue: 'ECOSEM-W004-72544740',
    sctrExpirationDate: '2026-12-31',
    hasActiveMedicalLeave: false,
    monthlyAverageSalary: 4200,
    dependents: [],
  },
  {
    id: 'W005',
    dni: '21287446',
    fullName: 'Percy Paul Pucuhuayla Pacheco',
    company: 'CONTRATISTAS MINEROS SAC',
    role: 'Técnico Mecánico Electrónico',
    camp: 'Sede Morococha - Unidad Toromocho',
    roomNumber: 'HAB. 104',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phoneWhatsApp: '+51921287446',
    status: 'Activo',
    qrCodeValue: 'ECOSEM-W005-21287446',
    sctrExpirationDate: '2026-12-31',
    hasActiveMedicalLeave: false,
    monthlyAverageSalary: 4600,
    dependents: [],
  },
];

// 03_Descansos_Medicos Seed
export const MOCK_ENTERPRISE_DESCANSOS: DescansoMedico[] = [
  {
    idDescanso: 'DESC-03-001',
    idTrabajador: 'W003',
    workerName: 'Carlos Mota Lazo',
    workerDni: '32569874',
    company: 'MINERA CHINALCO',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-08-15',
    diasDescanso: 15,
    tipoDescanso: 'Descanso Común',
    diasEmpresa: 15,
    diasEssalud: 0,
    montoSubsidioEstimado: 0,
    estadoSubsidio: 'Pendiente Planilla',
    cie10Codigo: 'M54.5 - Lumbago no especificado',
    cie10DiagnosticoEncrypted: encryptAES256('M54.5 - Lumbago agudo por sobreesfuerzo en tolva concentradora'),
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 04_Prestamos_y_Ayudas Seed
export const MOCK_ENTERPRISE_PRESTAMOS: PrestamoAyuda[] = [
  {
    idPrestamo: 'PRES-04-001',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    tipoSocorro: 'Préstamo Emergencia',
    montoSolicitado: 1200,
    tasaInteresSocial: 0,
    cuotasTotales: 4,
    cronogramaCuotas: [
      { nroCuota: 1, fechaVencimiento: '2026-08-30', montoCuota: 300, estado: 'Pendiente' },
      { nroCuota: 2, fechaVencimiento: '2026-09-30', montoCuota: 300, estado: 'Pendiente' },
      { nroCuota: 3, fechaVencimiento: '2026-10-30', montoCuota: 300, estado: 'Pendiente' },
      { nroCuota: 4, fechaVencimiento: '2026-11-30', montoCuota: 300, estado: 'Pendiente' },
    ],
    estadoPrestamo: 'Vigente en Planilla',
    motivoSolicitud: 'Gastos de salud de cónyuge por tratamiento oftalmológico urgente.',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 05_SCTR_Polizas Seed
export const MOCK_ENTERPRISE_SCTR: SCTRPoliza[] = [
  {
    idPoliza: 'POL-05-001',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    company: 'ECOSEM PUCARA',
    tipoPoliza: 'SCTR Salud',
    nroPoliza: 'POL-SCTR-895412-PACIFICO',
    aseguradora: 'Pacífico Seguros',
    fechaVigenciaInicio: '2026-01-01',
    fechaVigenciaFin: '2026-12-31',
    estadoPaseMina: 'Habilitado',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
  {
    idPoliza: 'POL-05-002',
    idTrabajador: 'W002',
    workerName: 'María Rodríguez Fernández',
    workerDni: '71234567',
    company: 'CONTRATISTAS MINEROS SAC',
    tipoPoliza: 'SCTR Salud',
    nroPoliza: 'POL-SCTR-774125-RIMAC',
    aseguradora: 'Rímac Seguros',
    fechaVigenciaInicio: '2025-08-01',
    fechaVigenciaFin: '2026-08-01', // Vencido
    estadoPaseMina: 'Bloqueado SCTR Vencido',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 06_Atenciones_Sociales Seed
export const MOCK_ENTERPRISE_ATENCIONES: AtencionSocial[] = [
  {
    idAtencion: 'ATEN-06-001',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    asistenteSocial: 'Lic. Ana Paredes (Trabajadora Social Principal)',
    fechaAtencion: '2026-08-05 14:30',
    motivoConsulta: 'Apoyo Económico',
    informePsicopericialCifrado: encryptAES256('Evaluación socioeconómica: Trabajador sustenta gastos elevados debido a enfermedad crónica de cónyuge. Se aprueba préstamo interés social del fondo comunal.'),
    diagnosticoOcupacional: 'Familia con carga de salud crónica que requiere asistencia financiera.',
    planAccionSocial: 'Monitorear reembolso de cuotas e integrar a cónyuge al consultorio médico móvil de la comunidad.',
    estadoCaso: 'En Seguimiento',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 07_Visitas_Domiciliarias Seed
export const MOCK_ENTERPRISE_VISITAS: VisitaDomiciliaria[] = [
  {
    idVisita: 'VIS-07-001',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    fechaVisita: '2026-08-02',
    asistenteSocial: 'Lic. Ana Paredes',
    puntajeHabitabilidad: 78,
    ingresoFamiliarMensual: 4600,
    situacionSocioeconomica: 'Vulnerable',
    observacionesSoporte: 'Vivienda de material noble en Pucará. Cuenta con servicios básicos; se sugiere apoyo con kit escolar para sus hijos en la campaña comunal.',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 08_Bitacora_Auditoria Seed
export const MOCK_ENTERPRISE_AUDITORIA: BitacoraAuditoria[] = [
  {
    id: 'LOG-08-001',
    idLog: 'LOG-08-001',
    timestamp: '2026-08-08 11:15:30',
    module: 'Cifrado de Atenciones Médicas',
    action: 'AES-256 ENCRYPT',
    user: 'Piero Admin',
    ipAddress: '192.168.10.154',
    hashSignature: generateAuditIntegrityHash({ doc: 'ATEN-06-001' }),
    details: 'Cifrado de diagnóstico médico CIE-10 para el trabajador Juan Pérez Quispe conforme a Ley N° 29733.',
  },
];

// 09_Accidentes_Trabajo Seed
export const MOCK_ENTERPRISE_ACCIDENTES: AccidenteTrabajoEnterprise[] = [
  {
    idAccidente: 'ACC-09-001',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    fechaSiniestro: '2026-07-15 10:30',
    lugarAccidente: 'Socavón Nivel 420 - Mina Subterránea',
    gravedad: 'Incapacitante Temporal',
    tipoAccidente: 'Trabajo Directo',
    numFormularioST7: 'ST7-2026-89541',
    diasIncapacidad: 35,
    sueldoPromedio12Meses: 3600,
    subsidioEmpresaDias: 20,
    subsidioEmpresaMonto: 2400,
    subsidioEssaludDias: 15,
    subsidioEssaludMonto: 1800,
    estadoViva: 'En Tramitación VIVA',
    cie10Codigo: 'S82.1 - Fractura de tibia proximal',
    cie10DiagnosticoEncrypted: encryptAES256('S82.1 - Fractura de tibia proximal durante maniobra de acople'),
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 10_Campamentos_Habitaciones Seed
export const MOCK_ENTERPRISE_CAMPAMENTOS: CampamentoHabitacionEnterprise[] = [
  {
    idAsignacion: 'CAMP-10-101',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    company: 'ECOSEM PUCARA',
    moduloHabitacion: 'Módulo A - Pabellón Minero 01',
    camaAsignada: 'Cama A-101',
    fechaIngreso: '2026-08-01',
    fechaSalida: '2026-08-15',
    estadoHabitacion: 'Limpia / Asignada',
    registroLavandería: '2026-08-05 (Sábanas sanitizadas)',
    pagoHigieneEstado: 'Conforme',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 11_Entregas_y_Beneficios Seed
export const MOCK_ENTERPRISE_ENTREGAS: EntregaBeneficioEnterprise[] = [
  {
    idEntrega: 'BEN-11-501',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    tipoBeneficio: 'Kit Navideño / Panetón',
    fechaEntrega: '2026-08-02 14:00',
    firmaDigitalUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    estadoEntrega: 'Entregado y Firmado',
    observaciones: 'Conforme. Entregado en Almacén Central de Bienestar Social.',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// 12_Workflow_Aprobaciones Seed
export const MOCK_ENTERPRISE_SOLICITUDES: SolicitudAprobacionEnterprise[] = [
  {
    idSolicitud: 'SOL-12-001',
    idTrabajador: 'W001',
    workerName: 'Juan Pérez Quispe',
    workerDni: '45871236',
    tipoSolicitud: 'Auxilio por Defunción',
    monto: 3500,
    nivelAprobacion1: 'Aprobado RRHH',
    aprobador1User: 'Jefe RRHH - Lic. Carlos Mota',
    fechaAprobacion1: '2026-08-04 11:00',
    nivelAprobacion2: 'Aprobado Gerencia',
    aprobador2User: 'Gerencia General ECOSEM',
    fechaAprobacion2: '2026-08-04 16:30',
    estadoWorkflow: 'Aprobado and Desembolsado',
    documentoRespaldoUrl: 'acta_defuncion_validada.pdf',
    unidadMinera: 'Sede Morococha - Unidad Toromocho',
  },
];

// Seed de Marcaciones de Asistencia en Tiempo Real (Módulos Asistencia y Comedores)
// Los registros de ejemplo son de AYER para no bloquear nuevas marcaciones de hoy
const yesterday = new Date(Date.now() - 86400000);
const yesterdayBase = yesterday.toLocaleDateString('es-PE');

export const MOCK_ENTERPRISE_ATTENDANCE: any[] = [
  {
    id: 'ATT-2026-001',
    timestamp: `${yesterdayBase}, 12:30:15`,
    workerDni: '45871236',
    workerName: 'Juan Pérez Quispe',
    company: 'ECOSEM PUCARA',
    camp: 'Sede Morococha - Unidad Toromocho',
    serviceType: 'Almuerzo',
    status: 'Válido',
    scannedBy: 'Escáner Garita N° 01 (Móvil QR)',
    roomNumber: 'A-101',
  },
  {
    id: 'ATT-2026-002',
    timestamp: `${yesterdayBase}, 12:25:40`,
    workerDni: '71234567',
    workerName: 'María Rodríguez Fernández',
    company: 'CONTRATISTAS MINEROS SAC',
    camp: 'Sede Morococha - Unidad Toromocho',
    serviceType: 'Almuerzo',
    status: 'Válido',
    scannedBy: 'Escáner Comedor Central',
    roomNumber: 'B-205',
  },
  {
    id: 'ATT-2026-003',
    timestamp: `${yesterdayBase}, 08:15:10`,
    workerDni: '32569874',
    workerName: 'Carlos Mota Lazo',
    company: 'MINERA CHINALCO',
    camp: 'Campamento Central',
    serviceType: 'Ingreso Campamento',
    status: 'Válido',
    scannedBy: 'Escáner Control Biométrico Garita',
    roomNumber: 'HAB. 304',
  },
  {
    id: 'ATT-2026-004',
    timestamp: `${yesterdayBase}, 07:45:00`,
    workerDni: '45871236',
    workerName: 'Juan Pérez Quispe',
    company: 'ECOSEM PUCARA',
    camp: 'Sede Morococha - Unidad Toromocho',
    serviceType: 'Desayuno',
    status: 'Válido',
    scannedBy: 'Escáner Comedor Central',
    roomNumber: 'A-101',
  },
  {
    id: 'ATT-2026-005',
    timestamp: `${yesterdayBase}, 07:30:22`,
    workerDni: '71234567',
    workerName: 'María Rodríguez Fernández',
    company: 'CONTRATISTAS MINEROS SAC',
    camp: 'Sede Morococha - Unidad Toromocho',
    serviceType: 'Desayuno',
    status: 'Válido',
    scannedBy: 'Escáner Comedor Central',
    roomNumber: 'B-205',
  },
  {
    id: 'ATT-2026-006',
    timestamp: `${yesterdayBase}, 06:50:00`,
    workerDni: '32569874',
    workerName: 'Carlos Mota Lazo',
    company: 'MINERA CHINALCO',
    camp: 'Campamento Central',
    serviceType: 'Alojamiento',
    status: 'Válido',
    scannedBy: 'Auto-Registro Habitación HAB. 304',
    roomNumber: 'HAB. 304',
  },
];
