import * as XLSX from 'xlsx';
import { ValuationMatrixRow, MonthlyValuationMatrix, AttendanceRecord, Worker } from '../types';

export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Reporte ECOSEM'
) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar a Excel.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const columnWidths = Object.keys(data[0]).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => (row[key] !== null && row[key] !== undefined ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLength + 3, 12), 50) };
  });

  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, fullFilename);
};

export const exportAttendanceTareoToExcel = (
  attendanceRecords: AttendanceRecord[],
  workers: Worker[] = [],
  filename: string = 'Tareo_Oficial_Asistencia_ECOSEM'
) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('es-PE', { month: 'long' }).toUpperCase();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const aoa: (string | number)[][] = [];

  // Title Block
  aoa.push(['ECOSEM PUCARÁ - MOROCOCHA | UNIDAD MINERA TOROMOCHO']);
  aoa.push([`TAREO OFICIAL Y CONTROL BIOMÉTRICO DE ASISTENCIA - MES DE ${monthName} ${year}`]);
  aoa.push([`FECHA DE EMISIÓN: ${currentDate.toLocaleDateString('es-PE')} ${currentDate.toLocaleTimeString('es-PE')}`]);
  aoa.push([]);

  // Column Headers
  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => `Día ${i + 1}`);
  const headerRow = [
    'N°',
    'DNI',
    'APELLIDOS Y NOMBRES',
    'EMPRESA CONTRATISTA',
    'CAMPAMENTO SEDE',
    'CARGO / FUNCIÓN',
    'HABITACIÓN',
    ...dayColumns,
    'TOTAL ASISTENCIAS',
    '% ASISTENCIA',
    'ESTADO BIOMÉTRICO',
  ];
  aoa.push(headerRow);

  const targetWorkersList: { dni: string; fullName: string; company: string; camp: string; role: string; roomNumber?: string }[] =
    workers.length > 0
      ? workers
      : Array.from(new Set(attendanceRecords.map((r) => r.workerDni))).map((dni) => {
          const first = attendanceRecords.find((r) => r.workerDni === dni);
          return {
            dni,
            fullName: first?.workerName || `Personal DNI ${dni}`,
            company: first?.company || 'ECOSEM Contratista',
            camp: first?.camp || 'Sede Morococha',
            role: 'Operario',
            roomNumber: first?.roomNumber || 'Común',
          };
        });

  if (targetWorkersList.length === 0) {
    alert('No hay trabajadores ni asistencias registradas para exportar el Tareo.');
    return;
  }

  targetWorkersList.forEach((w, idx) => {
    const workerRecs = attendanceRecords.filter((rec) => rec.workerDni === w.dni);

    let totalAttended = 0;
    const dayCells: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const checkinToday = workerRecs.find((rec) => {
        if (!rec.timestamp) return false;
        const ddmmyyyy = rec.timestamp.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
        if (ddmmyyyy) {
          const recDay = parseInt(ddmmyyyy[1], 10);
          const recMonth = parseInt(ddmmyyyy[2], 10);
          const recYear = parseInt(ddmmyyyy[3], 10);
          return recDay === day && recMonth === currentDate.getMonth() + 1 && recYear === year;
        }
        const parsed = new Date(rec.timestamp);
        if (!isNaN(parsed.getTime())) {
          return parsed.getDate() === day && parsed.getMonth() + 1 === currentDate.getMonth() + 1 && parsed.getFullYear() === year;
        }
        return false;
      });

      if (checkinToday) {
        totalAttended += 1;
        dayCells.push('1');
      } else {
        dayCells.push('-');
      }
    }

    const currentDayNum = currentDate.getDate();
    const pctAttendance = `${((totalAttended / Math.max(1, currentDayNum)) * 100).toFixed(0)}%`;
    const biometricStatus = (w as Worker).hasActiveMedicalLeave
      ? 'Descanso Médico'
      : (w as Worker).sctrExpirationDate && new Date((w as Worker).sctrExpirationDate!) < new Date()
      ? 'SCTR Vencido'
      : 'Apto (100% Válido)';

    aoa.push([
      idx + 1,
      w.dni,
      w.fullName,
      w.company,
      w.camp,
      w.role || 'Operario',
      w.roomNumber || 'Común',
      ...dayCells,
      totalAttended,
      pctAttendance,
      biometricStatus,
    ]);
  });

  const tareoSheet = XLSX.utils.aoa_to_sheet(aoa);

  tareoSheet['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    ...Array(daysInMonth).fill({ wch: 5 }),
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, tareoSheet, `Tareo_${monthName}`);

  if (attendanceRecords.length > 0) {
    const detailData = attendanceRecords.map((rec) => ({
      'ID Marcación': rec.id,
      'Fecha y Hora': rec.timestamp,
      'DNI': rec.workerDni,
      'Nombre Trabajador': rec.workerName,
      'Empresa': rec.company,
      'Campamento': rec.camp,
      'Servicio': rec.serviceType,
      'Habitación': rec.roomNumber || 'N/A',
      'Escaneado Por / Dispositivo': rec.scannedBy,
      'Estado': rec.status,
    }));
    const logSheet = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(workbook, logSheet, 'Log_Detallado_Marcaciones');
  }

  const dateStr = currentDate.toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${monthName}_${dateStr}.xlsx`);
};

export const exportValuationMatrixToExcel = (
  matrix: MonthlyValuationMatrix,
  filename: string = 'Valorizacion_Vivienda_Hospedaje_ECOSEM'
) => {
  const aoa: (string | number)[][] = [];

  // Row 1: Title
  aoa.push([`COSTO DE VIVIENDA/HOSPEDAJE - MES ${matrix.monthYear.toUpperCase()}`]);
  // Row 2: Subtitle
  aoa.push([matrix.locationName.toUpperCase()]);
  aoa.push([]); // Empty spacing line

  // Row 4: Column Headers
  const dayInitials = ['V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const dayHeaderRow = ['', '', '', '', '', ...dayInitials, '', '', ''];
  const mainHeaderRow = [
    'NUMERO DE HABITACIONES',
    'APELLIDOS Y NOMBRES',
    'AREA O SERVICIO',
    'CARGO',
    'COSTOS',
    ...Array.from({ length: 31 }, (_, i) => i + 1),
    'N° DE DIAS TOTALES',
    'MONTO DIARIO POR CUARTO PROMEDIO',
    'MONTO MENSUAL',
  ];

  aoa.push(dayHeaderRow);
  aoa.push(mainHeaderRow);

  let grandSubtotal = 0;
  const costCenterMap: Record<string, number> = {};

  matrix.rows.forEach((row) => {
    let daysTotal = 0;
    row.daysMarked.forEach((val) => {
      if (val === '1' || val === 1) daysTotal += 1;
      else if (val === 'D') daysTotal += 0.5;
    });
    const montoMensual = daysTotal * row.dailyRate;
    grandSubtotal += montoMensual;

    if (!costCenterMap[row.costCenter]) {
      costCenterMap[row.costCenter] = 0;
    }
    costCenterMap[row.costCenter] += montoMensual;

    const rowData: (string | number)[] = [
      row.roomNumber,
      row.workerName,
      row.areaOrService,
      row.role,
      row.costCenter,
      ...row.daysMarked,
      daysTotal,
      row.dailyRate,
      montoMensual,
    ];
    aoa.push(rowData);
  });

  const igvTotal = grandSubtotal * 0.18;
  const grandTotal = grandSubtotal + igvTotal;

  // Subtotal, IGV, Total summary rows right aligned
  aoa.push([]);
  const blankDays = Array(31).fill('');
  aoa.push(['', '', '', '', 'TOTAL', ...blankDays, '', 'SUB TOTAL', grandSubtotal]);
  aoa.push(['', '', '', '', '', ...blankDays, '', 'IGV (18%)', igvTotal]);
  aoa.push(['', '', '', '', '', ...blankDays, '', 'TOTAL', grandTotal]);

  aoa.push([]);
  aoa.push([]);
  // Secondary table: CENTRO DE COSTOS summary table
  aoa.push(['CENTRO DE COSTOS', 'MONTO']);
  let ccSubtotal = 0;
  Object.entries(costCenterMap).forEach(([cc, amount]) => {
    aoa.push([cc, amount]);
    ccSubtotal += amount;
  });
  const ccIgv = ccSubtotal * 0.18;
  const ccTotal = ccSubtotal + ccIgv;

  aoa.push(['SUB TOTAL', ccSubtotal]);
  aoa.push(['IGV (18%)', ccIgv]);
  aoa.push(['TOTAL', ccTotal]);

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  worksheet['!cols'] = [
    { wch: 22 }, // HAB.
    { wch: 32 }, // NAMES
    { wch: 22 }, // AREA
    { wch: 22 }, // CARGO
    { wch: 12 }, // CC
    ...Array(31).fill({ wch: 4 }), // DAYS
    { wch: 18 }, // TOTAL DAYS
    { wch: 26 }, // MONTO DIARIO
    { wch: 20 }, // MONTO MENSUAL
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Valorizacion_${matrix.monthYear}`);

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${matrix.monthYear}_${dateStr}.xlsx`);
};

