import { Room, Pabellon } from '../types';

export const INITIAL_PABELLONES: Pabellon[] = [
  { id: 'PAB-A', name: 'Pabellón A', description: 'Módulo Principal - Personal de Operaciones', floorsCount: 2 },
  { id: 'PAB-B', name: 'Pabellón B', description: 'Módulo Técnico y Supervisión', floorsCount: 2 },
  { id: 'PAB-DIANA', name: 'Campamento Diana', description: 'Residencia de Residencia Especializada', floorsCount: 1 },
];

export const INITIAL_ROOMS: Room[] = [
  // Pabellón A
  {
    id: 'R-101',
    roomNumber: '101',
    pabellon: 'Pabellón A',
    floor: 1,
    capacity: 2,
    status: 'Ocupado',
    currentOccupantDni: '45892011',
    currentOccupantName: 'JUAN PÉREZ RAMÍREZ',
    occupantCompany: 'Consorcio Minero Arequipa',
    checkInDate: '2026-07-01',
    lastLinenChangeDate: '2026-07-12', // > 14 días => ALERTA ROJA!
  },
  {
    id: 'R-102',
    roomNumber: '102',
    pabellon: 'Pabellón A',
    floor: 1,
    capacity: 2,
    status: 'Ocupado',
    currentOccupantDni: '71239844',
    currentOccupantName: 'MARÍA FLORES QUISPE',
    occupantCompany: 'Servicios Logísticos del Sur',
    checkInDate: '2026-07-15',
    lastLinenChangeDate: '2026-07-28', // Al día (2 días)
  },
  {
    id: 'R-103',
    roomNumber: '103',
    pabellon: 'Pabellón A',
    floor: 1,
    capacity: 2,
    status: 'Libre',
    lastLinenChangeDate: '2026-07-29',
  },
  {
    id: 'R-201',
    roomNumber: '201',
    pabellon: 'Pabellón A',
    floor: 2,
    capacity: 2,
    status: 'Limpieza',
    lastLinenChangeDate: '2026-07-10', // ALERTA ROJA!
  },
  {
    id: 'R-202',
    roomNumber: '202',
    pabellon: 'Pabellón A',
    floor: 2,
    capacity: 2,
    status: 'Reservado',
    lastLinenChangeDate: '2026-07-25',
  },

  // Pabellón B
  {
    id: 'R-203',
    roomNumber: '203',
    pabellon: 'Pabellón B',
    floor: 1,
    capacity: 2,
    status: 'Ocupado',
    currentOccupantDni: '10982377',
    currentOccupantName: 'CARLOS MAMANI CHOQUE',
    occupantCompany: 'Techint Minería',
    checkInDate: '2026-06-25', // > 30 días!
    lastLinenChangeDate: '2026-07-14', // 16 días => ALERTA ROJA!
  },
  {
    id: 'R-204',
    roomNumber: 'A-204',
    pabellon: 'Pabellón B',
    floor: 1,
    capacity: 2,
    status: 'Ocupado',
    currentOccupantDni: '20456789',
    currentOccupantName: 'ROSA HUAMÁN VILLANUEVA',
    occupantCompany: 'ECOSEM Contratistas',
    checkInDate: '2026-07-10',
    lastLinenChangeDate: '2026-07-27',
  },
  {
    id: 'R-205',
    roomNumber: '205',
    pabellon: 'Pabellón B',
    floor: 2,
    capacity: 2,
    status: 'Mantenimiento',
    lastLinenChangeDate: '2026-07-05',
  },
  {
    id: 'R-502',
    roomNumber: 'HAB. 502',
    pabellon: 'Campamento Diana',
    floor: 1,
    capacity: 1,
    status: 'Ocupado',
    currentOccupantDni: '30567891',
    currentOccupantName: 'PEDRO CONDORI TICONA',
    occupantCompany: 'Minera Las Bambas S.A.',
    checkInDate: '2026-07-02',
    lastLinenChangeDate: '2026-07-20',
  },
  {
    id: 'R-503',
    roomNumber: 'HAB. 503',
    pabellon: 'Campamento Diana',
    floor: 1,
    capacity: 1,
    status: 'Libre',
    lastLinenChangeDate: '2026-07-28',
  },
];
