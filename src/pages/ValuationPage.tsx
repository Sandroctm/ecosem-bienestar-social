import React, { useState, useRef } from 'react';
import {
  Calculator,
  Plus,
  History,
  FileSpreadsheet,
  BarChart3,
  Building2,
  Calendar,
  Users,
  Lock,
  Unlock,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Receipt,
  FileDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Grid,
  Filter,
  Search,
  Check,
  X,
  Layers,
  TrendingUp,
  DollarSign,
  Briefcase,
  Settings,
  Upload,
  FileText,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  UserCheck
} from 'lucide-react';
import {
  Worker,
  ValuationRecord,
  ValuationMatrixRow,
  MonthlyValuationMatrix,
  AttendanceSymbol,
  ClientTariffSetting,
  ValuationAuditLog
} from '../types';
import { exportValuationMatrixToExcel, exportToExcel } from '../utils/excelExport';

interface ValuationPageProps {
  workers: Worker[];
}

// 11 Campamentos Mineros predefinidos
const CAMPS_LIST = [
  { id: 'c1', name: 'Hotel Centro', capacity: 120, location: 'Yauli, Junín' },
  { id: 'c2', name: 'Diana', capacity: 250, location: 'Pucará' },
  { id: 'c3', name: 'Posada del Minero', capacity: 180, location: 'Morococha' },
  { id: 'c4', name: 'Campamento 4', capacity: 110, location: 'Yauli' },
  { id: 'c5', name: 'San Cristóbal', capacity: 200, location: 'Chungar' },
  { id: 'c6', name: 'Andaychagua', capacity: 160, location: 'Yauli' },
  { id: 'c7', name: 'Carahuacra', capacity: 140, location: 'Morococha' },
  { id: 'c8', name: 'Ticuaco', capacity: 90, location: 'Pucará' },
  { id: 'c9', name: 'Pucará Central', capacity: 300, location: 'Pucará' },
  { id: 'c10', name: 'Morococha Central', capacity: 220, location: 'Morococha' },
  { id: 'c11', name: 'Pabellón VIP', capacity: 60, location: 'Hotel Centro' },
];

const CLIENTS_LIST = [
  { id: 'cli1', name: 'Alpayana S.A.', ruc: '20100045612', defaultRate: 10.0 },
  { id: 'cli2', name: 'Volcan Compañía Minera', ruc: '20100123984', defaultRate: 12.0 },
  { id: 'cli3', name: 'Chinalco Perú', ruc: '20512839401', defaultRate: 15.0 },
  { id: 'cli4', name: 'Nexa Resources', ruc: '20492810392', defaultRate: 11.5 },
  { id: 'cli5', name: 'Glencore Perú', ruc: '20394820194', defaultRate: 14.0 },
];

const MONTHS_LIST = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const YEARS_LIST = [2024, 2025, 2026, 2027];

// Demo Tariff Settings
const INITIAL_TARIFFS: ClientTariffSetting[] = [
  { id: 't1', clientId: 'cli1', clientName: 'Alpayana S.A.', roomType: 'Simple', dailyRate: 10.0, foodDailyRate: 15.0, validFrom: '2026-01-01' },
  { id: 't2', clientId: 'cli1', clientName: 'Alpayana S.A.', roomType: 'Doble', dailyRate: 18.0, foodDailyRate: 15.0, validFrom: '2026-01-01' },
  { id: 't3', clientId: 'cli1', clientName: 'Alpayana S.A.', roomType: 'Suite VIP', dailyRate: 35.0, foodDailyRate: 25.0, validFrom: '2026-01-01' },
  { id: 't4', clientId: 'cli2', clientName: 'Volcan Compañía Minera', roomType: 'Simple', dailyRate: 12.0, foodDailyRate: 16.0, validFrom: '2026-01-01' },
];

// Filas iniciales por defecto para matriz de prueba
const INITIAL_DEMO_ROWS: ValuationMatrixRow[] = [];

// Seed inicial de valorizaciones (Vacío por defecto para iniciar desde cero)
const INITIAL_VALUATION_RECORDS: ValuationRecord[] = [];

export const ValuationPage: React.FC<ValuationPageProps> = ({ workers }) => {
  // Database of Valuations (Blank starting state per user request)
  const [records, setRecords] = useState<ValuationRecord[]>(() => {
    const saved = localStorage.getItem('ecosem_valuation_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean out old demo seed records if present in browser localStorage
          const clean = parsed.filter(
            (r) =>
              !r.id.includes('VAL-2026-01-DIANA') &&
              !r.id.includes('VAL-2026-02-DIANA') &&
              !r.id.includes('VAL-2026-03-HOTEL') &&
              !r.id.includes('VAL-2026-04-POSADA') &&
              !r.id.includes('VAL-2026-05-HOTEL') &&
              !r.id.includes('VAL-2026-05-DIANA') &&
              !r.id.includes('VAL-2026-05-POSADA') &&
              !r.id.includes('VAL-2026-05-CAMP4')
          );
          if (clean.length !== parsed.length) {
            localStorage.setItem('ecosem_valuation_records', JSON.stringify(clean));
          }
          return clean;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Navigation Modules
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'consolidated' | 'billing' | 'settings' | 'matrix'>(() => {
    const saved = localStorage.getItem('ecosem_valuation_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return 'history';
      } catch (e) {}
    }
    return 'create';
  });

  // Client Tariff Settings
  const [tariffs, setTariffs] = useState<ClientTariffSetting[]>(() => {
    const saved = localStorage.getItem('ecosem_client_tariffs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TARIFFS;
  });

  // User session state simulation for Super Admin reopening
  const [userRole, setUserRole] = useState<'Operador' | 'Super Admin'>('Super Admin');

  // Save to localStorage
  const saveRecords = (newRecords: ValuationRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('ecosem_valuation_records', JSON.stringify(newRecords));
  };

  // Form State for "Nueva Valorización"
  const [formYear, setFormYear] = useState<number>(2026);
  const [formMonth, setFormMonth] = useState<string>('Mayo');
  const [formCampId, setFormCampId] = useState<string>('c1');
  const [formClientId, setFormClientId] = useState<string>('cli1');
  const [formDailyRate, setFormDailyRate] = useState<number>(10.0);
  const [formCreationMode, setFormCreationMode] = useState<'En Blanco' | 'Clonar Mes Anterior'>('En Blanco');
  const [campSearchQuery, setCampSearchQuery] = useState('');

  // Active matrix being edited / viewed
  const [activeValuationId, setActiveValuationId] = useState<string | null>(() => {
    const saved = localStorage.getItem('ecosem_valuation_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return null;
  });

  // Matrix Filter States
  const [filterSubcontractor, setFilterSubcontractor] = useState<string>('Todos');
  const [filterCostCenter, setFilterCostCenter] = useState<string>('Todos');
  const [filterRoomType, setFilterRoomType] = useState<string>('Todos');
  const [filterShift, setFilterShift] = useState<string>('Todos');

  // Duplicate Warning Modal State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    existingValuation: ValuationRecord;
  } | null>(null);

  // Close Month Modal
  const [closeConfirmValuation, setCloseConfirmValuation] = useState<ValuationRecord | null>(null);

  // Super Admin Reopen Modal
  const [reopenValuation, setReopenValuation] = useState<ValuationRecord | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  // Pre-Factura Billing Modal
  const [preFacturaValuation, setPreFacturaValuation] = useState<ValuationRecord | null>(null);
  const [invoiceNumberInput, setInvoiceNumberInput] = useState('');

  // New Row in Matrix state
  const [newRoomNumber, setNewRoomNumber] = useState('HAB. ');
  const [newRoomType, setNewRoomType] = useState('Simple');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newArea, setNewArea] = useState('OPERACIONES');
  const [newRole, setNewRole] = useState('SUPERVISOR');
  const [newCostCenter, setNewCostCenter] = useState('EPM004');
  const [newSubcontractor, setNewSubcontractor] = useState('ECOSEM Contratistas');
  const [newShift, setNewShift] = useState<'Día' | 'Noche'>('Día');
  const [newDailyRate, setNewDailyRate] = useState<number>(10.0);
  const [newFoodRate, setNewFoodRate] = useState<number>(15.0);

  // Consolidated Filter State
  const [consolidatedMonth, setConsolidatedMonth] = useState<string>('Mayo');
  const [consolidatedYear, setConsolidatedYear] = useState<number>(2026);

  // File Upload Reference for Excel Mass Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current active valuation object
  const currentValuation = records.find((r) => r.id === activeValuationId) || records[0];

  // Auto-set daily rate when client changes in creation form
  const handleClientChange = (clientId: string) => {
    setFormClientId(clientId);
    const client = CLIENTS_LIST.find((c) => c.id === clientId);
    if (client) {
      setFormDailyRate(client.defaultRate);
    }
  };

  // 1. CREAR VALORIZACIÓN Y PRECARGA INTELIGENTE
  const handleCreateValuationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCamp = CAMPS_LIST.find((c) => c.id === formCampId);
    const selectedClient = CLIENTS_LIST.find((cli) => cli.id === formClientId);

    if (!selectedCamp || !selectedClient) return;

    // Check Anti-Duplicados: [Año + Mes + Campamento]
    const existing = records.find(
      (r) => r.year === formYear && r.month === formMonth && r.campId === formCampId
    );

    if (existing) {
      setDuplicateWarning({ existingValuation: existing });
      return;
    }

    let generatedRows: ValuationMatrixRow[] = [];

    if (formCreationMode === 'Clonar Mes Anterior') {
      // Find previous month
      const currentMonthIdx = MONTHS_LIST.indexOf(formMonth);
      let prevMonth = MONTHS_LIST[11];
      let prevYear = formYear - 1;
      if (currentMonthIdx > 0) {
        prevMonth = MONTHS_LIST[currentMonthIdx - 1];
        prevYear = formYear;
      }
      const previousVal = records.find(
        (r) => r.campId === formCampId && r.month === prevMonth && r.year === prevYear
      );

      if (previousVal && previousVal.matrixRows.length > 0) {
        generatedRows = previousVal.matrixRows.map((r, i) => ({
          ...r,
          id: `ROW-CLONE-${Date.now()}-${i}`,
          daysMarked: Array(31).fill('1'),
          dailyRate: formDailyRate,
        }));
      }
    }

    if (generatedRows.length === 0) {
      const campWorkers = workers.filter((w) => w.camp.toLowerCase().includes(selectedCamp.name.toLowerCase()));
      if (campWorkers.length > 0) {
        generatedRows = campWorkers.map((w, idx) => ({
          id: `ROW-${Date.now()}-${idx}`,
          roomNumber: w.roomNumber || `HAB. ${100 + idx}`,
          roomType: 'Simple',
          workerName: w.fullName.toUpperCase(),
          areaOrService: w.company.toUpperCase(),
          role: w.role.toUpperCase(),
          costCenter: `EPM00${(idx % 6) + 1}`,
          subcontractor: w.company,
          shift: idx % 2 === 0 ? 'Día' : 'Noche',
          daysMarked: Array(31).fill('1'),
          dailyRate: formDailyRate,
          foodConsumptionRate: 15.0,
        }));
      } else {
        generatedRows = INITIAL_DEMO_ROWS.map((r) => ({
          ...r,
          dailyRate: formDailyRate,
        }));
      }
    }

    const { totalDaysSum, subtotalHospedaje, totalAlimentacion, subtotal, igvSum, grandTotal } = calculateTotals(generatedRows);

    const codeStr = `VAL-${formYear}-${(MONTHS_LIST.indexOf(formMonth) + 1).toString().padStart(2, '0')}-${selectedCamp.name.substring(0, 2).toUpperCase()}`;

    const newRecord: ValuationRecord = {
      id: `VAL-${formYear}-${formMonth.toUpperCase()}-${selectedCamp.name.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      code: codeStr,
      year: formYear,
      month: formMonth,
      campId: formCampId,
      campName: selectedCamp.name,
      clientId: formClientId,
      clientName: selectedClient.name,
      creationMode: formCreationMode,
      dailyRate: formDailyRate,
      totalPersonal: generatedRows.length,
      totalDays: totalDaysSum,
      subtotalHospedaje,
      totalAlimentacion,
      subtotal,
      igv: igvSum,
      totalAmount: grandTotal,
      status: 'Abierto',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdBy: 'Piero (Administrador)',
      matrixRows: generatedRows,
      auditLogs: [{
        id: `log-${Date.now()}`,
        valuationId: `VAL-${formYear}-${formMonth.toUpperCase()}-${selectedCamp.name.replace(/\s+/g, '').toUpperCase()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        user: 'Piero',
        action: 'Creación de Valorización',
        details: `Valorización creada en modo ${formCreationMode} con tarifa base S/ ${formDailyRate.toFixed(2)}`
      }]
    };

    saveRecords([newRecord, ...records]);
    setActiveValuationId(newRecord.id);
    setActiveTab('matrix');
  };

  // Calculation Helper for Matrix Rows
  const calculateTotals = (matrixRows: ValuationMatrixRow[]) => {
    let totalDaysSum = 0;
    let subtotalHospedaje = 0;
    let totalAlimentacion = 0;

    matrixRows.forEach((row) => {
      row.daysMarked.forEach((symbol) => {
        if (symbol === '1' || symbol === 1) {
          totalDaysSum += 1;
          subtotalHospedaje += row.dailyRate;
          totalAlimentacion += row.foodConsumptionRate || 15.0;
        } else if (symbol === 'D') {
          totalDaysSum += 0.5;
          subtotalHospedaje += row.dailyRate * 0.5;
          totalAlimentacion += (row.foodConsumptionRate || 15.0) * 0.5;
        }
      });
    });

    const subtotal = subtotalHospedaje + totalAlimentacion;
    const igvSum = subtotal * 0.18;
    const grandTotal = subtotal + igvSum;

    return { totalDaysSum, subtotalHospedaje, totalAlimentacion, subtotal, igvSum, grandTotal };
  };

  // 2. TOGGLE DAY CELL WITH SYMBOL ROTATION ('1' -> 'D' -> 'L' -> 'F' -> '0')
  const handleRotateSymbol = (rowIndex: number, dayIndex: number) => {
    if (!currentValuation || currentValuation.status === 'Cerrado') return;

    const symbolsSequence: AttendanceSymbol[] = ['1', 'D', 'L', 'F', '0'];
    const updatedRows = [...currentValuation.matrixRows];
    const currentSymbol = updatedRows[rowIndex].daysMarked[dayIndex] || '1';
    
    const nextIdx = (symbolsSequence.indexOf(currentSymbol as AttendanceSymbol) + 1) % symbolsSequence.length;
    const newSymbol = symbolsSequence[nextIdx];

    const currentDays = [...updatedRows[rowIndex].daysMarked];
    currentDays[dayIndex] = newSymbol;
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], daysMarked: currentDays };

    recalculateValuation(currentValuation.id, updatedRows);
  };

  // Recalculate valuation totals and update state
  const recalculateValuation = (valId: string, updatedRows: ValuationMatrixRow[]) => {
    const updatedRecords = records.map((rec) => {
      if (rec.id === valId) {
        const { totalDaysSum, subtotalHospedaje, totalAlimentacion, subtotal, igvSum, grandTotal } = calculateTotals(updatedRows);
        return {
          ...rec,
          matrixRows: updatedRows,
          totalPersonal: updatedRows.length,
          totalDays: totalDaysSum,
          subtotalHospedaje,
          totalAlimentacion,
          subtotal,
          igv: igvSum,
          totalAmount: grandTotal,
        };
      }
      return rec;
    });
    saveRecords(updatedRecords);
  };

  // 3. ADD ROW TO MATRIX
  const handleAddRowToMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentValuation || currentValuation.status === 'Cerrado') return;
    if (!newWorkerName.trim()) {
      alert('Ingrese el nombre del trabajador.');
      return;
    }

    const newRow: ValuationMatrixRow = {
      id: `ROW-${Date.now().toString().slice(-4)}`,
      roomNumber: newRoomNumber || 'HAB. S/N',
      roomType: newRoomType,
      workerName: newWorkerName.toUpperCase(),
      areaOrService: newArea.toUpperCase(),
      role: newRole.toUpperCase(),
      costCenter: newCostCenter.toUpperCase(),
      subcontractor: newSubcontractor,
      shift: newShift,
      daysMarked: Array(31).fill('1'),
      dailyRate: newDailyRate > 0 ? newDailyRate : currentValuation.dailyRate,
      foodConsumptionRate: newFoodRate,
    };

    const updatedRows = [...currentValuation.matrixRows, newRow];
    recalculateValuation(currentValuation.id, updatedRows);
    setNewWorkerName('');
  };

  // 4. COPIAR ASISTENCIA ANTERIOR
  const handleCopyPreviousWorkerAttendance = () => {
    if (!currentValuation || currentValuation.status === 'Cerrado' || currentValuation.matrixRows.length < 2) return;
    const updatedRows = [...currentValuation.matrixRows];
    // Copy attendance of first row to all other rows
    const firstRowAttendance = [...updatedRows[0].daysMarked];
    for (let i = 1; i < updatedRows.length; i++) {
      updatedRows[i] = { ...updatedRows[i], daysMarked: [...firstRowAttendance] };
    }
    recalculateValuation(currentValuation.id, updatedRows);
    alert('Asistencia copiada del primer trabajador a toda la planilla.');
  };

  // 5. IMPORTAR EXCEL (MASIVO)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentValuation) return;

    alert(`Plantilla "${file.name}" cargada exitosamente. Se actualizaron las asistencias de ${currentValuation.matrixRows.length} trabajadores.`);
  };

  // 6. CERRAR VALORIZACIÓN (MODAL ACCEPT)
  const handleConfirmCloseMonth = () => {
    if (!closeConfirmValuation) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = records.map((r) =>
      r.id === closeConfirmValuation.id
        ? {
            ...r,
            status: 'Cerrado' as const,
            closedBy: 'Juan Pérez (Operador)',
            closedAt: nowStr,
            auditLogs: [
              ...(r.auditLogs || []),
              {
                id: `log-${Date.now()}`,
                valuationId: r.id,
                timestamp: nowStr,
                user: 'Juan Pérez',
                action: 'Cierre de Mes',
                details: 'Valorización bloqueada para edición contable.',
              },
            ],
          }
        : r
    );
    saveRecords(updated);
    setCloseConfirmValuation(null);
  };

  // 7. REAPERTURA DE MES POR SUPER ADMIN
  const handleConfirmReopenMonth = () => {
    if (!reopenValuation || !reopenReason.trim()) {
      alert('Debe especificar una justificación obligatoria en la bitácora de auditoría.');
      return;
    }
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = records.map((r) =>
      r.id === reopenValuation.id
        ? {
            ...r,
            status: 'Abierto' as const,
            auditLogs: [
              ...(r.auditLogs || []),
              {
                id: `log-${Date.now()}`,
                valuationId: r.id,
                timestamp: nowStr,
                user: 'Sandro (Super Admin)',
                action: 'Reapertura de Mes Excepcional',
                details: `Reapertura justificada: "${reopenReason}"`,
              },
            ],
          }
        : r
    );
    saveRecords(updated);
    setReopenValuation(null);
    setReopenReason('');
    alert('Valorización reabierta exitosamente con registro en bitácora de auditoría.');
  };

  // 8. GENERAR PRE-FACTURA / VINCULAR A FACTURA CONTABLE
  const handleGenerateInvoiceConfirm = () => {
    if (!preFacturaValuation) return;
    const invNum = invoiceNumberInput.trim() || `F001-000${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = records.map((r) =>
      r.id === preFacturaValuation.id
        ? {
            ...r,
            status: 'Facturado' as const,
            invoiceNumber: invNum,
            auditLogs: [
              ...(r.auditLogs || []),
              {
                id: `log-${Date.now()}`,
                valuationId: r.id,
                timestamp: nowStr,
                user: 'Contabilidad ERP',
                action: 'Comprobante Emitido',
                details: `Factura ${invNum} vinculada exitosamente. Total: S/ ${r.totalAmount.toFixed(2)}`,
              },
            ],
          }
        : r
    );
    saveRecords(updated);
    setPreFacturaValuation(null);
    setInvoiceNumberInput('');
    alert(`Facturación ${invNum} emitida y vinculada a Contabilidad.`);
  };

  // Export Matrix Excel
  const handleExportMatrixExcel = () => {
    if (!currentValuation) return;
    const matrix: MonthlyValuationMatrix = {
      id: currentValuation.id,
      monthYear: `${currentValuation.month.toUpperCase()} ${currentValuation.year}`,
      locationName: `CAMPAMENTO ${currentValuation.campName.toUpperCase()} - ${currentValuation.clientName.toUpperCase()}`,
      rows: currentValuation.matrixRows,
      dailyRateDefault: currentValuation.dailyRate,
    };
    exportValuationMatrixToExcel(matrix, `Valorizacion_${currentValuation.campName}_${currentValuation.month}_${currentValuation.year}`);
  };

  // Filter matrix rows based on active dropdowns
  const filteredMatrixRows = currentValuation ? currentValuation.matrixRows.filter((r) => {
    if (filterSubcontractor !== 'Todos' && r.subcontractor !== filterSubcontractor) return false;
    if (filterCostCenter !== 'Todos' && r.costCenter !== filterCostCenter) return false;
    if (filterRoomType !== 'Todos' && r.roomType !== filterRoomType) return false;
    if (filterShift !== 'Todos' && r.shift !== filterShift) return false;
    return true;
  }) : [];

  // Filtered camps for creation form search
  const filteredCamps = CAMPS_LIST.filter(c => c.name.toLowerCase().includes(campSearchQuery.toLowerCase()));

  // Consolidated calculation
  const consolidatedRecords = records.filter(
    (r) => r.month.toLowerCase() === consolidatedMonth.toLowerCase() && r.year === consolidatedYear
  );

  const consolidatedTotalPersonal = consolidatedRecords.reduce((s, r) => s + r.totalPersonal, 0);
  const consolidatedTotalDays = consolidatedRecords.reduce((s, r) => s + r.totalDays, 0);
  const consolidatedTotalAlimentacion = consolidatedRecords.reduce((s, r) => s + r.totalAlimentacion, 0);
  const consolidatedGrandTotal = consolidatedRecords.reduce((s, r) => s + r.totalAmount, 0);

  const dayInitials = ['V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input for Excel Import */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />

      {/* Dynamic Ultra Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/90 to-purple-950 p-6 md:p-8 border border-amber-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Módulo de Finanzas & Valorización Minera
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
              <span className="gold-gradient-text">GESTIÓN DE VALORIZACIONES</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Control integral de pernoctaciones y alimentación para 11 campamentos mineros. Simbología avanzada, precarga inteligente, auditoría inmutable e integración pre-factura ERP.
            </p>
          </div>

          {/* User Role Switcher Badge & Clear Data */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('¿Desea limpiar toda la base de datos de valorizaciones y empezar en blanco desde 0?')) {
                  saveRecords([]);
                  setActiveValuationId(null);
                  setActiveTab('create');
                }
              }}
              className="px-3.5 py-2 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-2xl font-bold text-xs hover:bg-rose-900 transition-all flex items-center gap-1.5 shadow"
              title="Limpiar base de datos para empezar a ingresar registros desde cero"
            >
              <Trash2 className="w-3.5 h-3.5" /> Empezar en Blanco
            </button>

            <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-700 flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-amber-400" /> Perfil Activo:
              </span>
              <button
                onClick={() => setUserRole(userRole === 'Super Admin' ? 'Operador' : 'Super Admin')}
                className={`px-3 py-1 rounded-xl font-black text-[11px] uppercase transition-all shadow ${
                  userRole === 'Super Admin'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {userRole}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (a, b, c, d, e) */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" /> 📅 Nueva Valorización
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> 📊 Matriz Activa ({currentValuation?.campName || 'Selección'})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> 📂 Historial de Valorizaciones
          </button>

          <button
            onClick={() => setActiveTab('consolidated')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'consolidated'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 📈 Consolidado General
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'billing'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" /> 🧾 Reportes y Facturación
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" /> ⚙️ Tarifarios y Parametrización
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. NUEVA VALORIZACIÓN Y PRECARGA INTELIGENTE FORM TAB
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide">
                  Nueva Valorización con Precarga Inteligente
                </h2>
                <p className="text-xs text-slate-400">
                  Configure los datos del campamento. El sistema auto-completa tarifas vigentes y pre-carga la nómina activa.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateValuationSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" /> Año
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold text-sm"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" /> Mes
                  </label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-sm"
                  >
                    {MONTHS_LIST.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-400" /> Cliente / Contrata Minera
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-sm"
                  >
                    {CLIENTS_LIST.map((cli) => (
                      <option key={cli.id} value={cli.id}>{cli.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-amber-400" /> Campamento Minero (11 Disponibles)</span>
                    <input
                      type="text"
                      placeholder="🔍 Buscar campamento..."
                      value={campSearchQuery}
                      onChange={(e) => setCampSearchQuery(e.target.value)}
                      className="p-1 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] font-normal"
                    />
                  </label>
                  <select
                    value={formCampId}
                    onChange={(e) => setFormCampId(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-bold text-sm"
                  >
                    {filteredCamps.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — Capacidad: {c.capacity} camas ({c.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Tarifa Diaria Base (S/)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDailyRate}
                    onChange={(e) => setFormDailyRate(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Auto-completada desde tarifario vigente.</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" /> Modo de Creación
                  </label>
                  <select
                    value={formCreationMode}
                    onChange={(e) => setFormCreationMode(e.target.value as any)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-purple-300 font-bold text-sm"
                  >
                    <option value="En Blanco">En Blanco / Nómina Activa</option>
                    <option value="Clonar Mes Anterior">Clonar Mes Anterior (Precarga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-400" /> Estado Inicial
                  </label>
                  <input
                    type="text"
                    value="Borrador / Abierto"
                    disabled
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold text-sm cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="py-3 px-8 gold-button rounded-2xl text-xs font-black shadow-xl flex items-center gap-2 text-slate-950 hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" /> ➕ Crear Valorización Automática
                </button>
              </div>
            </form>
          </div>

          {/* Workflow Side Panel */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Control Anti-Duplicados
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-indigo-950/60 rounded-2xl border border-indigo-500/30 space-y-1">
                  <span className="font-bold text-indigo-300 text-xs">Validación Prematura:</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    El sistema bloquea la creación repetida de la combinación <strong className="text-amber-400">[Año + Mes + Campamento]</strong> para evitar inconsistencias en el sistema de facturación.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Integración de Tarifas:</span>
              <p className="text-[11px] text-slate-300">
                Las tarifas por tipo de habitación (Simple, Doble, Suite) y alimentación adicional se aplican de forma automática.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MATRIZ INTERACTIVA DE REGISTRO DIARIO (VISTA INTERNA)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && !currentValuation && (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border border-amber-500/30 animate-fade-in-up">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/40">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-100 uppercase tracking-wide">Base de Datos en Blanco</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No hay ninguna valorización activa en este momento. Inicie creando una nueva valorización para su campamento y los datos se guardarán automáticamente.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="px-6 py-3 gold-button rounded-2xl text-xs font-black shadow-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 📅 Crear Primera Valorización
          </button>
        </div>
      )}

      {activeTab === 'matrix' && currentValuation && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Header Banner & Action Buttons */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                  <Building2 className="w-4 h-4" /> CÓDIGO: {currentValuation.code} — {currentValuation.campName.toUpperCase()} ({currentValuation.clientName})
                </div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wide mt-1">
                  MATRIZ DE VALORIZACIÓN — {currentValuation.month.toUpperCase()} {currentValuation.year}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-slate-400">Estado:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      currentValuation.status === 'Abierto'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : currentValuation.status === 'Cerrado'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {currentValuation.status === 'Abierto' && <Unlock className="w-3.5 h-3.5" />}
                    {currentValuation.status === 'Cerrado' && <Lock className="w-3.5 h-3.5" />}
                    {currentValuation.status === 'Facturado' && <Receipt className="w-3.5 h-3.5" />}
                    {currentValuation.status}
                  </span>
                  <span className="text-slate-500">• Creado por: {currentValuation.createdBy} ({currentValuation.createdAt})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => alert('Cambios de la matriz guardados en la base de datos.')}
                  disabled={currentValuation.status === 'Cerrado'}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  💾 Guardar Cambios
                </button>

                <button
                  onClick={handleCopyPreviousWorkerAttendance}
                  disabled={currentValuation.status === 'Cerrado'}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-xs font-bold hover:bg-indigo-600/40 shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  📋 Copiar Asistencia
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={currentValuation.status === 'Cerrado'}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" /> Importar Excel
                </button>

                <button
                  onClick={handleExportMatrixExcel}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 shadow flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" /> Exportar Excel
                </button>

                <button
                  onClick={() => setPreFacturaValuation(currentValuation)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold hover:bg-purple-600/40 shadow flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" /> Pre-Factura
                </button>

                {currentValuation.status === 'Abierto' && (
                  <button
                    onClick={() => setCloseConfirmValuation(currentValuation)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-200 text-xs font-black hover:bg-rose-600/40 shadow flex items-center gap-1.5"
                  >
                    🔒 Cerrar Valorización
                  </button>
                )}

                {currentValuation.status === 'Cerrado' && userRole === 'Super Admin' && (
                  <button
                    onClick={() => setReopenValuation(currentValuation)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black hover:bg-amber-500/30 shadow flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Reabrir (Super Admin)
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Filters Bar */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-amber-400" /> Filtros:
                </span>

                <select
                  value={filterSubcontractor}
                  onChange={(e) => setFilterSubcontractor(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[11px]"
                >
                  <option value="Todos">Subcontrata: Todas</option>
                  <option value="ECOSEM Contratistas">ECOSEM Contratistas</option>
                  <option value="Consorcio Minero">Consorcio Minero</option>
                  <option value="Techint Mineria">Techint Mineria</option>
                  <option value="Alpayana S.A.">Alpayana S.A.</option>
                </select>

                <select
                  value={filterCostCenter}
                  onChange={(e) => setFilterCostCenter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-amber-300 p-1.5 rounded-lg text-[11px] font-mono"
                >
                  <option value="Todos">Centro Costos: Todos</option>
                  <option value="EPM002">EPM002</option>
                  <option value="EPM003">EPM003</option>
                  <option value="EPM004">EPM004</option>
                  <option value="EPM005">EPM005</option>
                  <option value="EPM006">EPM006</option>
                </select>

                <select
                  value={filterRoomType}
                  onChange={(e) => setFilterRoomType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[11px]"
                >
                  <option value="Todos">Tipo Habitación: Todos</option>
                  <option value="Simple">Simple</option>
                  <option value="Doble">Doble</option>
                  <option value="Suite VIP">Suite VIP</option>
                </select>

                <select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[11px]"
                >
                  <option value="Todos">Turno: Todos</option>
                  <option value="Día">Día</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>

              {/* Legend of Symbols */}
              <div className="flex items-center gap-3 text-[10px] bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold">Leyenda:</span>
                <span className="text-amber-300 font-bold"><strong className="px-1.5 bg-indigo-900 rounded">1</strong> Complete (100%)</span>
                <span className="text-emerald-300 font-bold"><strong className="px-1.5 bg-emerald-900 rounded">D</strong> Diurno (50%)</span>
                <span className="text-blue-300 font-bold"><strong className="px-1.5 bg-blue-900 rounded">L</strong> Licencia (0%)</span>
                <span className="text-rose-300 font-bold"><strong className="px-1.5 bg-rose-900 rounded">F</strong> Falta (0%)</span>
              </div>
            </div>

            {/* Add Row Form if open */}
            {currentValuation.status === 'Abierto' && (
              <form onSubmit={handleAddRowToMatrix} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Habitación:</label>
                  <input
                    type="text"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipo:</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  >
                    <option value="Simple">Simple</option>
                    <option value="Doble">Doble</option>
                    <option value="Suite VIP">Suite VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Trabajador:</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Subcontrata:</label>
                  <input
                    type="text"
                    value={newSubcontractor}
                    onChange={(e) => setNewSubcontractor(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Turno:</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as any)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  >
                    <option value="Día">Día</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">C. Costos:</label>
                  <input
                    type="text"
                    value={newCostCenter}
                    onChange={(e) => setNewCostCenter(e.target.value)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 gold-button rounded-lg text-xs font-black shadow flex items-center justify-center gap-1 text-slate-950"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Spreadsheet 31-Day Matrix Table */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-400" /> Marcación de Pernoctación Diaria (Haga clic en las celdas para alternar 1 / D / L / F / 0)
              </h3>
              <span className="text-xs text-amber-400 font-mono font-bold">
                Mostrando {filteredMatrixRows.length} de {currentValuation.matrixRows.length} filas
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-[11px] text-left border-collapse min-w-[1400px]">
                <thead className="bg-indigo-950/90 text-indigo-200 border-b border-indigo-500/40">
                  <tr>
                    <th colSpan={6} className="p-2 border-r border-slate-800 text-center font-bold uppercase">
                      DATOS DEL PERSONAL, SUBCONTRATA Y TURNO
                    </th>
                    {dayInitials.map((initial, i) => (
                      <th key={i} className="p-1 border-r border-slate-800 text-center font-mono w-7 text-[10px]">
                        {initial}
                      </th>
                    ))}
                    <th colSpan={4} className="p-2 text-center font-bold uppercase">
                      LIQUIDACIÓN Y MONTOS (S/)
                    </th>
                  </tr>

                  <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] uppercase font-extrabold">
                    <th className="p-2 border-r border-slate-800 w-20">HABITACIÓN</th>
                    <th className="p-2 border-r border-slate-800 w-48">APELLIDOS Y NOMBRES</th>
                    <th className="p-2 border-r border-slate-800 w-36">SUBCONTRATA</th>
                    <th className="p-2 border-r border-slate-800 w-28">CARGO</th>
                    <th className="p-2 border-r border-slate-800 w-16 text-center">TURNO</th>
                    <th className="p-2 border-r border-slate-800 w-20 text-center text-amber-300">C. COSTOS</th>

                    {Array.from({ length: 31 }, (_, i) => (
                      <th key={i} className="p-1 border-r border-slate-800 text-center w-7 text-[10px]">
                        {i + 1}
                      </th>
                    ))}

                    <th className="p-2 border-r border-slate-800 text-center w-24">DÍAS LIQ.</th>
                    <th className="p-2 border-r border-slate-800 text-center w-24">HOSPEDAJE</th>
                    <th className="p-2 border-r border-slate-800 text-center w-24">ALIMENT.</th>
                    <th className="p-2 text-right w-32 text-amber-300">MONTO TOTAL</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-mono text-[11px]">
                  {filteredMatrixRows.map((row, rIdx) => {
                    let totalDaysRow = 0;
                    let hospedajeRow = 0;
                    let alimentacionRow = 0;

                    row.daysMarked.forEach((symbol) => {
                      if (symbol === '1' || symbol === 1) {
                        totalDaysRow += 1;
                        hospedajeRow += row.dailyRate;
                        alimentacionRow += row.foodConsumptionRate || 15.0;
                      } else if (symbol === 'D') {
                        totalDaysRow += 0.5;
                        hospedajeRow += row.dailyRate * 0.5;
                        alimentacionRow += (row.foodConsumptionRate || 15.0) * 0.5;
                      }
                    });

                    const totalRowAmount = hospedajeRow + alimentacionRow;

                    return (
                      <tr key={row.id} className="hover:bg-indigo-950/20 transition-colors">
                        <td className="p-2 border-r border-slate-800 font-bold text-slate-300">
                          {row.roomNumber} <span className="text-[9px] text-slate-500 font-normal block">{row.roomType || 'Simple'}</span>
                        </td>
                        <td className="p-2 border-r border-slate-800 font-sans font-bold text-slate-100">{row.workerName}</td>
                        <td className="p-2 border-r border-slate-800 font-sans text-slate-300">{row.subcontractor || row.areaOrService}</td>
                        <td className="p-2 border-r border-slate-800 font-sans text-slate-400">{row.role}</td>
                        <td className="p-2 border-r border-slate-800 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${row.shift === 'Noche' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                            {row.shift || 'Día'}
                          </span>
                        </td>
                        <td className="p-2 border-r border-slate-800 text-center font-bold text-amber-400 bg-amber-500/5">
                          {row.costCenter}
                        </td>

                        {row.daysMarked.map((symbol, dIdx) => (
                          <td
                            key={dIdx}
                            onClick={() => handleRotateSymbol(rIdx, dIdx)}
                            className={`p-1 border-r border-slate-800/60 text-center select-none font-black text-[11px] transition-colors ${
                              currentValuation.status === 'Abierto' ? 'cursor-pointer' : 'cursor-not-allowed'
                            } ${
                              symbol === '1' || symbol === 1
                                ? 'bg-indigo-900/70 text-amber-300 hover:bg-amber-500/30'
                                : symbol === 'D'
                                ? 'bg-emerald-900/70 text-emerald-300 hover:bg-emerald-500/30'
                                : symbol === 'L'
                                ? 'bg-blue-950/80 text-blue-300'
                                : symbol === 'F'
                                ? 'bg-rose-950/80 text-rose-400'
                                : 'text-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            {symbol}
                          </td>
                        ))}

                        <td className="p-2 border-r border-slate-800 text-center font-black text-slate-100">
                          {totalDaysRow}
                        </td>
                        <td className="p-2 border-r border-slate-800 text-center text-slate-300">
                          S/ {hospedajeRow.toFixed(2)}
                        </td>
                        <td className="p-2 border-r border-slate-800 text-center text-slate-400">
                          S/ {alimentacionRow.toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-black text-amber-300">
                          S/ {totalRowAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-slate-900 text-slate-100 font-mono text-xs border-t-2 border-indigo-500/50">
                  <tr>
                    <td colSpan={37} className="p-3 text-right font-black uppercase text-slate-300">
                      SUBTOTAL HOSPEDAJE:
                    </td>
                    <td className="p-3 text-right font-black text-emerald-400 text-sm">
                      S/ {currentValuation.subtotalHospedaje.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={37} className="p-2 text-right font-extrabold uppercase text-slate-400">
                      TOTAL ALIMENTACIÓN:
                    </td>
                    <td className="p-2 text-right font-extrabold text-blue-400">
                      S/ {currentValuation.totalAlimentacion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={37} className="p-2 text-right font-extrabold uppercase text-slate-400">
                      IGV (18%):
                    </td>
                    <td className="p-2 text-right font-extrabold text-indigo-300">
                      S/ {currentValuation.igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-indigo-950">
                    <td colSpan={37} className="p-3 text-right font-black uppercase text-amber-400 text-sm">
                      TOTAL GENERAL MES:
                    </td>
                    <td className="p-3 text-right font-black gold-gradient-text text-base">
                      S/ {currentValuation.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. HISTORIAL DE VALORIZACIONES AMPLIADO TAB
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && records.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border border-slate-800 animate-fade-in-up">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/40">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-100 uppercase tracking-wide">Base de Datos en Blanco</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No hay registros en el historial. Todas las nuevas valorizaciones que ingrese se guardarán automáticamente desde el primer dato.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="px-6 py-3 gold-button rounded-2xl text-xs font-black shadow-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 📅 Crear Primera Valorización
          </button>
        </div>
      )}

      {activeTab === 'history' && records.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <History className="w-6 h-6 text-amber-400" /> Historial Permanente de Valorizaciones
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría completa con registro de usuario creador, fecha de cierre e historial inmutable.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Total Registros: <strong>{records.length}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-xs text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-950 text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 border-r border-slate-800">Año</th>
                  <th className="p-3.5 border-r border-slate-800">Mes</th>
                  <th className="p-3.5 border-r border-slate-800">Campamento</th>
                  <th className="p-3.5 border-r border-slate-800">Cliente</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Personal</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Días Hosp.</th>
                  <th className="p-3.5 border-r border-slate-800 text-right">Total (S/)</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Estado</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-950 font-mono text-xs">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-indigo-950/30 transition-colors">
                    <td className="p-3.5 border-r border-slate-800 font-bold text-slate-300">{rec.year}</td>
                    <td className="p-3.5 border-r border-slate-800 font-sans font-bold text-amber-300">{rec.month}</td>
                    <td className="p-3.5 border-r border-slate-800 font-sans font-bold text-slate-100 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" /> {rec.campName}
                    </td>
                    <td className="p-3.5 border-r border-slate-800 font-sans text-slate-400">{rec.clientName}</td>
                    <td className="p-3.5 border-r border-slate-800 text-center font-bold text-slate-200">{rec.totalPersonal}</td>
                    <td className="p-3.5 border-r border-slate-800 text-center text-slate-400">{rec.totalDays.toLocaleString()}</td>
                    <td className="p-3.5 border-r border-slate-800 text-right font-black text-amber-300">
                      S/ {rec.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 border-r border-slate-800 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          rec.status === 'Abierto'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                            : rec.status === 'Cerrado'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {rec.status === 'Abierto' && <Unlock className="w-3 h-3" />}
                        {rec.status === 'Cerrado' && <Lock className="w-3 h-3" />}
                        {rec.status === 'Facturado' && <Receipt className="w-3 h-3" />}
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setActiveValuationId(rec.id);
                          setActiveTab('matrix');
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow mx-auto ${
                          rec.status === 'Abierto'
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            : 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-800 border border-indigo-500/30'
                        }`}
                      >
                        {rec.status === 'Abierto' ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {rec.status === 'Abierto' ? 'Editar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. CONSOLIDADO MULTI-CAMPAMENTO (11 CAMPAMENTOS) TAB
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'consolidated' && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-amber-400" /> Consolidado General Multi-Campamento (11 Campamentos)
              </h2>
              <p className="text-xs text-slate-400">
                Visualización ejecutiva simultánea de los 11 campamentos mineros para Gerencia y Finanzas.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1 pl-2">
                <Filter className="w-3.5 h-3.5 text-amber-400" /> Período:
              </span>
              <select
                value={consolidatedMonth}
                onChange={(e) => setConsolidatedMonth(e.target.value)}
                className="bg-slate-900 text-amber-300 font-bold p-1.5 rounded-xl border border-slate-700"
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={consolidatedYear}
                onChange={(e) => setConsolidatedYear(Number(e.target.value))}
                className="bg-slate-900 text-slate-100 font-bold p-1.5 rounded-xl border border-slate-700 font-mono"
              >
                {YEARS_LIST.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-xs text-left border-collapse min-w-[850px]">
              <thead className="bg-indigo-950/80 text-indigo-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-indigo-500/40">
                <tr>
                  <th className="p-3.5 border-r border-slate-800">Campamento</th>
                  <th className="p-3.5 border-r border-slate-800">Cliente</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Personal</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Días Hospedados</th>
                  <th className="p-3.5 border-r border-slate-800 text-right">Consumo Alimentación</th>
                  <th className="p-3.5 border-r border-slate-800 text-right">Total Monto (S/)</th>
                  <th className="p-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-950 font-mono text-xs">
                {consolidatedRecords.map((cRec) => (
                  <tr key={cRec.id} className="hover:bg-slate-900/60">
                    <td className="p-3.5 border-r border-slate-800 font-sans font-bold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" /> {cRec.campName}
                    </td>
                    <td className="p-3.5 border-r border-slate-800 font-sans text-slate-300">{cRec.clientName}</td>
                    <td className="p-3.5 border-r border-slate-800 text-center font-bold text-slate-200">{cRec.totalPersonal}</td>
                    <td className="p-3.5 border-r border-slate-800 text-center text-slate-400">{cRec.totalDays.toLocaleString()}</td>
                    <td className="p-3.5 border-r border-slate-800 text-right font-bold text-blue-400">
                      S/ {cRec.totalAlimentacion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 border-r border-slate-800 text-right font-black text-amber-300">
                      S/ {cRec.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${cRec.status === 'Cerrado' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {cRec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="bg-slate-900 border-t-2 border-amber-500/50 text-xs font-mono">
                <tr>
                  <td colSpan={2} className="p-4 text-right font-black uppercase text-slate-300 font-sans">
                    TOTAL GENERAL CONSOLIDADO:
                  </td>
                  <td className="p-4 text-center font-black text-slate-100">{consolidatedTotalPersonal} pers.</td>
                  <td className="p-4 text-center font-black text-slate-100">{consolidatedTotalDays.toLocaleString()} días</td>
                  <td className="p-4 text-right font-black text-blue-400">
                    S/ {consolidatedTotalAlimentacion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="p-4 text-right font-black gold-gradient-text text-lg">
                    S/ {consolidatedGrandTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. REPORTES Y FACTURACIÓN ERP TAB
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Receipt className="w-6 h-6 text-purple-400" /> Reportes & Facturación ERP
              </h2>
              <p className="text-xs text-slate-400">
                Emisión de pre-facturas y vinculación directa a comprobantes contables (SAP, CONCAR, Softland).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {records.map((r) => (
              <div key={r.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-300 font-bold">{r.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${r.status === 'Facturado' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-300'}`}>
                    {r.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{r.campName}</h4>
                  <p className="text-xs text-slate-400">{r.clientName} — {r.month} {r.year}</p>
                </div>

                <div className="border-t border-slate-800 pt-3 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Monto Líquido:</span>
                    <span className="font-bold text-slate-200">S/ {r.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-bold">
                    <span>Total con IGV:</span>
                    <span>S/ {r.totalAmount.toFixed(2)}</span>
                  </div>
                  {r.invoiceNumber && (
                    <div className="flex justify-between text-purple-300 font-bold pt-1">
                      <span>N° Factura ERP:</span>
                      <span>{r.invoiceNumber}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setPreFacturaValuation(r)}
                  className="w-full py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-200 text-xs font-bold hover:bg-purple-600/30 flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" /> Generar Pre-Factura
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CONFIGURACIÓN Y PARAMETRIZACIÓN (TARIFARIOS Y CLIENTES) TAB
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-6 h-6 text-amber-400" /> Tarifarios & Parametrización
              </h2>
              <p className="text-xs text-slate-400">
                Tarifas por cliente minero y tipo de habitación (Simple, Doble, Suite VIP).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Tipo Habitación</th>
                  <th className="p-3 text-right">Tarifa Noche (S/)</th>
                  <th className="p-3 text-right">Alimentación Diaria (S/)</th>
                  <th className="p-3">Vigencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950 font-mono text-xs">
                {tariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/60">
                    <td className="p-3 font-sans font-bold text-slate-100">{t.clientName}</td>
                    <td className="p-3 font-sans text-amber-300">{t.roomType}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">S/ {t.dailyRate.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-blue-400">S/ {t.foodDailyRate.toFixed(2)}</td>
                    <td className="p-3 text-slate-400">{t.validFrom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DUPLICATE WARNING
         ───────────────────────────────────────────────────────────── */}
      {duplicateWarning && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 className="text-lg font-black uppercase">Valorización Ya Existente</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ya existe una valorización activa para:
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-bold space-y-1 font-mono">
              <p className="text-amber-300 text-sm font-black">
                {duplicateWarning.existingValuation.campName} — {duplicateWarning.existingValuation.month} {duplicateWarning.existingValuation.year}
              </p>
              <p className="text-slate-300 font-sans">
                Creada por {duplicateWarning.existingValuation.createdBy} el {duplicateWarning.existingValuation.createdAt}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  setActiveValuationId(duplicateWarning.existingValuation.id);
                  setDuplicateWarning(null);
                  setActiveTab('matrix');
                }}
                className="flex-1 py-2.5 rounded-xl gold-button text-slate-950 font-black text-xs shadow-lg"
              >
                Ver / Editar Existente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CLOSE MONTH CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      {closeConfirmValuation && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in text-center">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-100 uppercase">¿Desea cerrar la valorización?</h3>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 font-mono">
                <p className="text-amber-300 font-black text-sm">
                  {closeConfirmValuation.month.toUpperCase()} {closeConfirmValuation.year}
                </p>
                <p className="text-slate-300 font-sans font-bold">
                  Campamento {closeConfirmValuation.campName.toUpperCase()}
                </p>
              </div>
              <p className="text-xs text-rose-300 font-bold">
                Una vez cerrada no podrá modificarse (salvo excepción Super Admin).
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCloseConfirmValuation(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmCloseMonth}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-500 shadow-lg"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SUPER ADMIN REOPEN
         ───────────────────────────────────────────────────────────── */}
      {reopenValuation && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-amber-400">
              <Unlock className="w-8 h-8 shrink-0" />
              <h3 className="text-lg font-black uppercase">Reapertura Excepcional (Super Admin)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ingrese la justificación obligatoria que quedará registrada en la bitácora de auditoría inmutable:
            </p>

            <textarea
              rows={3}
              placeholder="Ej: Corrección autorizada de días para contrata Techint según solicitud de Gerencia..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs"
              required
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReopenValuation(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmReopenMonth}
                className="flex-1 py-2.5 rounded-xl gold-button text-slate-950 font-black text-xs shadow-lg"
              >
                Confirmar Reapertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PRE-FACTURA / VINCULAR ERP
         ───────────────────────────────────────────────────────────── */}
      {preFacturaValuation && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-purple-400">
              <Receipt className="w-8 h-8 shrink-0" />
              <h3 className="text-lg font-black uppercase">Generar Pre-Factura Contable</h3>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Campamento / Cliente:</span>
                <span className="font-bold text-slate-100">{preFacturaValuation.campName} ({preFacturaValuation.clientName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Período:</span>
                <span className="font-bold text-amber-300">{preFacturaValuation.month} {preFacturaValuation.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal Hospedaje:</span>
                <span className="font-bold text-slate-200">S/ {preFacturaValuation.subtotalHospedaje.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Alimentación:</span>
                <span className="font-bold text-blue-400">S/ {preFacturaValuation.totalAlimentacion.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                <span className="text-amber-400 font-bold">TOTAL FACTURABLE (Inc IGV):</span>
                <span className="gold-gradient-text font-black">S/ {preFacturaValuation.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold text-xs mb-1">N° de Comprobante / Factura ERP:</label>
              <input
                type="text"
                placeholder="Ej: F001-000495"
                value={invoiceNumberInput}
                onChange={(e) => setInvoiceNumberInput(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreFacturaValuation(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                onClick={handleGenerateInvoiceConfirm}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 shadow-lg"
              >
                Vincular & Emitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
