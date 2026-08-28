import * as XLSX from 'xlsx';
import { Worker } from '../types';

export interface ParsedWorkerRowPreview {
  rowIndex: number;
  dni: string;
  fullName: string;
  company: string;
  role: string;
  camp: string;
  roomNumber?: string;
  phoneWhatsApp?: string;
  status: 'valid' | 'duplicate' | 'invalid';
  validationMessage: string;
}

export interface ExcelImportResult {
  parsedWorkers: Worker[];
  previewRows: ParsedWorkerRowPreview[];
  validCount: number;
  errorCount: number;
  duplicateCount: number;
}

/**
 * Genera y descarga una plantilla modelo en Excel (.xlsx) para el registro masivo de personal.
 */
export const downloadWorkerExcelTemplate = () => {
  const templateData = [
    {
      'DNI (Obligatorio)': '45892011',
      'Nombres y Apellidos (Obligatorio)': 'Juan Pérez Ramírez',
      'Empresa Contratista (Obligatorio)': 'Consorcio Minero Arequipa',
      'Cargo / Rol (Obligatorio)': 'Supervisor de Operaciones',
      'Campamento Minero (Obligatorio)': 'Campamento Miriam',
      'N° Habitación (Opcional)': 'HAB-102',
      'WhatsApp Contacto (Opcional)': '51987654321',
    },
    {
      'DNI (Obligatorio)': '72104932',
      'Nombres y Apellidos (Obligatorio)': 'María Gómez Torres',
      'Empresa Contratista (Obligatorio)': 'San Martín Contratistas',
      'Cargo / Rol (Obligatorio)': 'Ingeniera de Seguridad',
      'Campamento Minero (Obligatorio)': 'Campamento René',
      'N° Habitación (Opcional)': 'HAB-205',
      'WhatsApp Contacto (Opcional)': '51912345678',
    },
    {
      'DNI (Obligatorio)': '10482910',
      'Nombres y Apellidos (Obligatorio)': 'Carlos Mendoza Quispe',
      'Empresa Contratista (Obligatorio)': 'ECOSEM Pasco',
      'Cargo / Rol (Obligatorio)': 'Técnico Electricista',
      'Campamento Minero (Obligatorio)': 'Campamento Puris',
      'N° Habitación (Opcional)': 'HAB-301',
      'WhatsApp Contacto (Opcional)': '51998877665',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for better visual presentation
  worksheet['!cols'] = [
    { wch: 18 }, // DNI
    { wch: 32 }, // Nombres
    { wch: 28 }, // Empresa
    { wch: 26 }, // Cargo
    { wch: 22 }, // Campamento
    { wch: 22 }, // Habitación
    { wch: 24 }, // WhatsApp
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Registro Personal');

  XLSX.writeFile(workbook, 'Plantilla_Registro_Personal_ECOSEM.xlsx');
};

/**
 * Normaliza nombres de encabezados para soportar variaciones frecuentes en archivos Excel subidos por usuarios.
 */
const normalizeKey = (key: string): string => {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-z0-9]/g, ''); // Elimina espacios y caracteres especiales
};

/**
 * Procesa y valida un archivo Excel (.xlsx, .xls, .csv) subido por el usuario.
 */
export const parseWorkersFromExcel = (
  file: File,
  existingWorkers: Worker[]
): Promise<ExcelImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          return resolve({
            parsedWorkers: [],
            previewRows: [],
            validCount: 0,
            errorCount: 0,
            duplicateCount: 0,
          });
        }

        const existingDniSet = new Set(existingWorkers.map((w) => w.dni.trim()));
        const processedDnisInFile = new Set<string>();

        const parsedWorkers: Worker[] = [];
        const previewRows: ParsedWorkerRowPreview[] = [];

        let validCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;

        const defaultPhoto =
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

        rawRows.forEach((row, index) => {
          // Map raw keys using normalized key matcher
          let dni = '';
          let fullName = '';
          let company = '';
          let role = '';
          let camp = '';
          let roomNumber = '';
          let phoneWhatsApp = '';

          Object.keys(row).forEach((key) => {
            const normKey = normalizeKey(key);
            const val = String(row[key]).trim();

            if (normKey.includes('dni') || normKey.includes('documento') || normKey.includes('identidad')) {
              dni = val;
            } else if (
              normKey.includes('nombre') ||
              normKey.includes('apellido') ||
              normKey.includes('trabajador') ||
              normKey.includes('personal')
            ) {
              fullName = val;
            } else if (normKey.includes('empresa') || normKey.includes('contratista') || normKey.includes('razon')) {
              company = val;
            } else if (normKey.includes('cargo') || normKey.includes('rol') || normKey.includes('puesto')) {
              role = val;
            } else if (normKey.includes('campamento') || normKey.includes('sede') || normKey.includes('unidad')) {
              camp = val;
            } else if (normKey.includes('habitacion') || normKey.includes('cuarto') || normKey.includes('hab')) {
              roomNumber = val;
            } else if (
              normKey.includes('whatsapp') ||
              normKey.includes('telefono') ||
              normKey.includes('celular') ||
              normKey.includes('contacto')
            ) {
              phoneWhatsApp = val;
            }
          });

          // Clean DNI format
          const cleanDni = dni.replace(/\D/g, '');
          const missingFields: string[] = [];

          if (!cleanDni || cleanDni.length < 7) missingFields.push('DNI válido');
          if (!fullName) missingFields.push('Nombres y Apellidos');
          if (!company) missingFields.push('Empresa Contratista');
          if (!role) missingFields.push('Cargo / Rol');
          if (!camp) missingFields.push('Campamento');

          let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
          let validationMessage = 'Listo para registrar';

          if (missingFields.length > 0) {
            status = 'invalid';
            validationMessage = `Faltan campos obligatorios: ${missingFields.join(', ')}`;
            errorCount++;
          } else if (existingDniSet.has(cleanDni) || processedDnisInFile.has(cleanDni)) {
            status = 'duplicate';
            validationMessage = `El DNI ${cleanDni} ya existe en el padrón o en el archivo.`;
            duplicateCount++;
          } else {
            validCount++;
            processedDnisInFile.add(cleanDni);

            const qrCodeValue = `ECOSEM:${cleanDni}:${fullName.toUpperCase().replace(/\s+/g, '_')}`;

            const newWorker: Worker = {
              id: `W-${Date.now().toString().slice(-4)}-${index + 1}`,
              dni: cleanDni,
              fullName,
              company,
              role,
              camp,
              roomNumber: roomNumber || undefined,
              photoUrl: defaultPhoto,
              phoneWhatsApp: phoneWhatsApp || '51987654321',
              status: 'Activo',
              qrCodeValue,
            };

            parsedWorkers.push(newWorker);
          }

          previewRows.push({
            rowIndex: index + 2, // Excel row index accounting for header
            dni: cleanDni || dni || '—',
            fullName: fullName || '—',
            company: company || '—',
            role: role || '—',
            camp: camp || '—',
            roomNumber: roomNumber || '—',
            phoneWhatsApp: phoneWhatsApp || '—',
            status,
            validationMessage,
          });
        });

        resolve({
          parsedWorkers,
          previewRows,
          validCount,
          errorCount,
          duplicateCount,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
