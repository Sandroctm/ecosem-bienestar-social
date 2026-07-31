import * as XLSX from 'xlsx';
import { ValuationMatrixRow, MonthlyValuationMatrix } from '../types';

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

