import React, { useState } from 'react';
import {
  Calculator,
  Download,
  Coins,
  Building2,
  Calendar,
  Users,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Grid,
} from 'lucide-react';
import { MonthlyValuationMatrix, ValuationMatrixRow, ValuationItem } from '../types';
import { exportValuationMatrixToExcel, exportToExcel } from '../utils/excelExport';

interface ValuationPageProps {
  valuations: ValuationItem[];
  onAddValuation: (item: ValuationItem) => void;
  onExportExcel: () => void;
}

// Initial sample rows matching Image 2 exactly for instant user presentation
const DEMO_MATRIX_ROWS: ValuationMatrixRow[] = [
  {
    id: 'ROW-1',
    roomNumber: 'HAB. 502',
    workerName: 'ELISABETH',
    areaOrService: 'RECURSOS HUMANOS',
    role: 'JEFE DE RECURSOS',
    costCenter: 'EPM004',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
  {
    id: 'ROW-2',
    roomNumber: 'HAB. 304',
    workerName: 'VALERIS LAZARO EMERSON MILCAR',
    areaOrService: 'LOGISTICA',
    role: 'JEFE DE LOGISTICA',
    costCenter: 'EPM006',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
  {
    id: 'ROW-3',
    roomNumber: 'HAB. 304',
    workerName: 'ANGELO',
    areaOrService: 'MARKTG',
    role: 'PLANNER',
    costCenter: 'EPM008',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
  {
    id: 'ROW-4',
    roomNumber: 'HAB. 503',
    workerName: 'YORDY PARCO AMAYA',
    areaOrService: 'PLANEAMIENTO',
    role: 'ASISTENTE DE PLANEAMIENTO',
    costCenter: 'EPM007',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
  {
    id: 'ROW-5',
    roomNumber: 'HAB. 503',
    workerName: 'MALDONADO VEGA CRISTHIAM BRYAN',
    areaOrService: 'CONTABILIDAD',
    role: 'ASISTENTE DE CONTABILIDAD',
    costCenter: 'EPM003',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
  {
    id: 'ROW-6',
    roomNumber: 'HAB. 508',
    workerName: 'JORGE MENDOZA',
    areaOrService: 'GERENCIA',
    role: 'GERENTE',
    costCenter: 'EPM002',
    daysMarked: Array(31).fill(1),
    dailyRate: 300.0,
  },
  {
    id: 'ROW-7',
    roomNumber: 'HAB. 500',
    workerName: 'HECTOR PINTO',
    areaOrService: 'GERENCIA',
    role: 'GERENTE',
    costCenter: 'EPM002',
    daysMarked: Array(11).fill(1).concat(Array(20).fill(0)),
    dailyRate: 177.42,
  },
  {
    id: 'ROW-8',
    roomNumber: 'HAB. 205',
    workerName: 'SOTO YANEL',
    areaOrService: 'CONTABILIDAD',
    role: 'JEFA DE CONTABILIDAD',
    costCenter: 'EPM005',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
  {
    id: 'ROW-9',
    roomNumber: 'HAB. 102',
    workerName: 'JOSE RAMOS',
    areaOrService: 'SSOMA',
    role: 'JEFE SSOMA',
    costCenter: 'EPM005',
    daysMarked: Array(31).fill(1),
    dailyRate: 10.0,
  },
];

export const ValuationPage: React.FC<ValuationPageProps> = ({
  valuations,
  onAddValuation,
  onExportExcel,
}) => {
  // Matrix parameters matching Image 2
  const [monthYear, setMonthYear] = useState('MAYO 2026');
  const [locationName, setLocationName] = useState('VIVIENDA SR. HOTEL CENTRO');
  const [matrixRows, setMatrixRows] = useState<ValuationMatrixRow[]>(DEMO_MATRIX_ROWS);
  const [defaultDailyRate, setDefaultDailyRate] = useState<number>(10.0);

  // New row form state
  const [newRoomNumber, setNewRoomNumber] = useState('HAB. ');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newArea, setNewArea] = useState('OPERACIONES');
  const [newRole, setNewRole] = useState('SUPERVISOR');
  const [newCostCenter, setNewCostCenter] = useState('EPM004');
  const [newDailyRate, setNewDailyRate] = useState<number>(10.0);

  // Toggle single day cell (1 <-> 0)
  const handleToggleDay = (rowIndex: number, dayIndex: number) => {
    const updatedRows = [...matrixRows];
    const currentDays = [...updatedRows[rowIndex].daysMarked];
    currentDays[dayIndex] = currentDays[dayIndex] === 1 ? 0 : 1;
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], daysMarked: currentDays };
    setMatrixRows(updatedRows);
  };

  // Set all 31 days to 1 or 0 for a row
  const handleSetAllDays = (rowIndex: number, val: number) => {
    const updatedRows = [...matrixRows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      daysMarked: Array(31).fill(val),
    };
    setMatrixRows(updatedRows);
  };

  // Add new row to matrix
  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) {
      alert('Ingrese el nombre del trabajador.');
      return;
    }

    const newRow: ValuationMatrixRow = {
      id: `ROW-${Date.now().toString().slice(-4)}`,
      roomNumber: newRoomNumber || 'HAB. S/N',
      workerName: newWorkerName,
      areaOrService: newArea,
      role: newRole,
      costCenter: newCostCenter,
      daysMarked: Array(31).fill(1),
      dailyRate: newDailyRate > 0 ? newDailyRate : defaultDailyRate,
    };

    setMatrixRows([...matrixRows, newRow]);
    setNewWorkerName('');
  };

  // Remove row
  const handleDeleteRow = (id: string) => {
    setMatrixRows(matrixRows.filter((r) => r.id !== id));
  };

  // Automated Calculations
  const grandSubtotal = matrixRows.reduce((acc, row) => {
    const totalDays = row.daysMarked.reduce((sum, d) => sum + d, 0);
    return acc + totalDays * row.dailyRate;
  }, 0);

  const igvTotal = grandSubtotal * 0.18;
  const grandTotal = grandSubtotal + igvTotal;

  // Breakdown by Cost Center
  const costCenterMap: Record<string, number> = {};
  matrixRows.forEach((row) => {
    const totalDays = row.daysMarked.reduce((sum, d) => sum + d, 0);
    const monto = totalDays * row.dailyRate;
    if (!costCenterMap[row.costCenter]) {
      costCenterMap[row.costCenter] = 0;
    }
    costCenterMap[row.costCenter] += monto;
  });

  const costCenterList = Object.entries(costCenterMap).map(([cc, amount]) => ({
    costCenter: cc,
    amount,
  }));

  const handleExportMatrixExcel = () => {
    const matrix: MonthlyValuationMatrix = {
      id: `VAL-MAT-${Date.now().toString().slice(-4)}`,
      monthYear,
      locationName,
      rows: matrixRows,
      dailyRateDefault: defaultDailyRate,
    };
    exportValuationMatrixToExcel(matrix);
  };

  const dayInitials = ['V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100 uppercase tracking-wide">
              FORMATO MATRIZ DE VALORIZACIÓN — {monthYear}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control exacto de costo de vivienda/hospedaje por persona/día con desagregado por Centro de Costos e IGV 18%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportMatrixExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 shadow-md"
          >
            <Download className="w-4 h-4" />
            Exportar Matriz Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Sheet Configuration Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          Parámetros de la Planilla de Hospedaje
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Periodo / Mes:</label>
            <input
              type="text"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Ubicación / Hospedaje:</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Tarifa Diaria Predeterminada (S/):</label>
            <input
              type="number"
              step="0.5"
              value={defaultDailyRate}
              onChange={(e) => setDefaultDailyRate(Number(e.target.value))}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Add New Room/Worker to Matrix Form */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 space-y-3">
        <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Agregar Registro de Personal a la Matriz
        </h3>

        <form onSubmit={handleAddRow} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">N° Habitación:</label>
            <input
              type="text"
              placeholder="Ej: HAB. 502"
              value={newRoomNumber}
              onChange={(e) => setNewRoomNumber(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Apellidos y Nombres:</label>
            <input
              type="text"
              placeholder="Ej: PEREZ JUAN"
              value={newWorkerName}
              onChange={(e) => setNewWorkerName(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Área o Servicio:</label>
            <input
              type="text"
              placeholder="Ej: RECURSOS HUMANOS"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Cargo:</label>
            <input
              type="text"
              placeholder="Ej: JEFE DE ÁREA"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Centro de Costos:</label>
            <input
              type="text"
              placeholder="Ej: EPM004"
              value={newCostCenter}
              onChange={(e) => setNewCostCenter(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Monto Diario (S/):</label>
            <input
              type="number"
              step="0.5"
              value={newDailyRate}
              onChange={(e) => setNewDailyRate(Number(e.target.value))}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-bold"
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-6 flex justify-end">
            <button
              type="submit"
              className="py-2 px-4 gold-button rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Agregar a la Matriz
            </button>
          </div>
        </form>
      </div>

      {/* Main 31-Day Excel-like Matrix Spreadsheet Table */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide">
              {locationName} — {monthYear}
            </h3>
            <p className="text-[11px] text-slate-400">
              Haga clic en las celdas numéricas (1 o 0) para activar/desactivar días de hospedaje.
            </p>
          </div>

          <div className="text-xs text-amber-400 font-mono font-bold">
            Total Habitaciones / Personal: {matrixRows.length}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-[11px] text-left border-collapse min-w-[1300px]">
            {/* Header row 1: Days of the week */}
            <thead className="bg-indigo-950/80 text-indigo-200 border-b border-indigo-500/40">
              <tr>
                <th colSpan={5} className="p-2 border-r border-slate-800 text-center font-bold uppercase">
                  DATOS DEL PERSONAL Y CENTRO DE COSTOS
                </th>
                {dayInitials.map((initial, i) => (
                  <th key={i} className="p-1 border-r border-slate-800 text-center font-mono w-7 text-[10px]">
                    {initial}
                  </th>
                ))}
                <th colSpan={4} className="p-2 text-center font-bold uppercase">
                  LIQUIDACIÓN DÍAS Y MONTOS (S/)
                </th>
              </tr>

              {/* Header row 2: Main columns */}
              <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] uppercase font-extrabold">
                <th className="p-2 border-r border-slate-800 w-24">HABITACIÓN</th>
                <th className="p-2 border-r border-slate-800 w-52">APELLIDOS Y NOMBRES</th>
                <th className="p-2 border-r border-slate-800 w-36">ÁREA O SERVICIO</th>
                <th className="p-2 border-r border-slate-800 w-36">CARGO</th>
                <th className="p-2 border-r border-slate-800 w-20 text-center text-amber-300">COSTOS</th>

                {/* Day numbers 1 to 31 */}
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} className="p-1 border-r border-slate-800 text-center w-7 text-[10px]">
                    {i + 1}
                  </th>
                ))}

                <th className="p-2 border-r border-slate-800 text-center w-24">DÍAS TOTALES</th>
                <th className="p-2 border-r border-slate-800 text-center w-32">MONTO DIARIO</th>
                <th className="p-2 text-right w-36 text-amber-300">MONTO MENSUAL</th>
                <th className="p-2 text-center w-10">ACCION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-mono text-[11px]">
              {matrixRows.map((row, rIdx) => {
                const totalDays = row.daysMarked.reduce((sum, d) => sum + d, 0);
                const monthlyTotal = totalDays * row.dailyRate;

                return (
                  <tr key={row.id} className="hover:bg-indigo-950/20 transition-colors">
                    <td className="p-2 border-r border-slate-800 font-bold text-slate-300">{row.roomNumber}</td>
                    <td className="p-2 border-r border-slate-800 font-sans font-bold text-slate-100">{row.workerName}</td>
                    <td className="p-2 border-r border-slate-800 font-sans text-slate-300">{row.areaOrService}</td>
                    <td className="p-2 border-r border-slate-800 font-sans text-slate-400">{row.role}</td>
                    <td className="p-2 border-r border-slate-800 text-center font-bold text-amber-400 bg-amber-500/5">
                      {row.costCenter}
                    </td>

                    {/* 31 Day Cells */}
                    {row.daysMarked.map((marked, dIdx) => (
                      <td
                        key={dIdx}
                        onClick={() => handleToggleDay(rIdx, dIdx)}
                        className={`p-1 border-r border-slate-800/60 text-center cursor-pointer select-none font-extrabold text-[11px] transition-colors ${
                          marked === 1
                            ? 'bg-indigo-900/60 text-amber-300 hover:bg-amber-500/30'
                            : 'text-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {marked}
                      </td>
                    ))}

                    <td className="p-2 border-r border-slate-800 text-center font-black text-slate-100">
                      {totalDays}
                    </td>
                    <td className="p-2 border-r border-slate-800 text-center text-slate-300">
                      S/ {row.dailyRate.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-black text-amber-300">
                      S/ {monthlyTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Matrix Grand Totals Footer matching Image 2 */}
            <tfoot className="bg-slate-900 text-slate-100 font-mono text-xs border-t-2 border-indigo-500/50">
              <tr>
                <td colSpan={36} className="p-3 text-right font-black uppercase text-slate-300">
                  SUB TOTAL:
                </td>
                <td className="p-3 text-right font-black text-emerald-400 text-sm">
                  S/ {grandSubtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={36} className="p-2 text-right font-extrabold uppercase text-slate-400">
                  IGV (18%):
                </td>
                <td className="p-2 text-right font-extrabold text-blue-400">
                  S/ {igvTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
              <tr className="bg-indigo-950">
                <td colSpan={36} className="p-3 text-right font-black uppercase text-amber-400 text-sm">
                  TOTAL GENERAL MES:
                </td>
                <td className="p-3 text-right font-black gold-gradient-text text-base">
                  S/ {grandTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Secondary Summary Table: CENTRO DE COSTOS Breakdown matching Image 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Grid className="w-4 h-4 text-amber-400" />
              DESGLOSE POR CENTRO DE COSTOS
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              AUTOMATIZADO
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">CENTRO DE COSTOS</th>
                  <th className="p-2.5 text-right">MONTO (S/)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                {costCenterList.map((cc) => (
                  <tr key={cc.costCenter} className="hover:bg-slate-900/60">
                    <td className="p-2.5 font-bold text-amber-300">{cc.costCenter}</td>
                    <td className="p-2.5 text-right font-bold text-slate-100">
                      S/ {cc.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-xs font-bold border-t border-slate-800">
                <tr>
                  <td className="p-2.5 text-slate-400">SUB TOTAL</td>
                  <td className="p-2.5 text-right text-emerald-400">
                    S/ {grandSubtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-400">IGV (18%)</td>
                  <td className="p-2 text-right text-blue-400">
                    S/ {igvTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-950 text-amber-400 font-black">
                  <td className="p-2.5">TOTAL</td>
                  <td className="p-2.5 text-right text-base text-amber-300">
                    S/ {grandTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Informational Summary Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Resumen Ejecutivo de Valorización
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Esta planilla consolida las pernoctaciones diarias registradas mediante marcación QR o control manual de habitaciones. Los datos se agrupan por código de Centro de Costos para su facturación o reembolso mensual.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Habitaciones Ocupadas:</span>
              <span className="font-bold text-slate-100">{matrixRows.length} habitaciones</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Centros de Costo Activos:</span>
              <span className="font-bold text-amber-400">{costCenterList.length} CCs</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
              <span className="text-slate-300 font-bold">Monto Total a Liquidar:</span>
              <span className="font-black text-amber-300 text-sm">
                S/ {grandTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

