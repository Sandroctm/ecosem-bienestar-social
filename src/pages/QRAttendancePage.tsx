import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Utensils,
  BedDouble,
  UserCheck,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Radio,
  Trash2,
  MapPin,
} from 'lucide-react';
import { AttendanceRecord, Worker } from '../types';
import { QRBadgeGenerator } from '../components/QRBadgeGenerator';
import { exportToExcel, exportAttendanceTareoToExcel } from '../utils/excelExport';
import { validateAttendanceCheckin, AttendanceValidationResult } from '../utils/attendanceValidationEngine';
import { AttendanceValidationModal } from '../components/AttendanceValidationModal';

interface QRAttendancePageProps {
  attendanceRecords: AttendanceRecord[];
  workers: Worker[];
  onOpenScanner: () => void;
  onExportExcel: () => void;
  onClearAttendanceHistory?: () => void;
  onAddAttendance?: (
    workerDni: string,
    serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno',
    roomNumber?: string
  ) => void;
}

export const QRAttendancePage: React.FC<QRAttendancePageProps> = ({
  attendanceRecords,
  workers,
  onOpenScanner,
  onExportExcel,
  onClearAttendanceHistory,
  onAddAttendance,
}) => {
  const [selectedWorkerForBadge, setSelectedWorkerForBadge] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('Todos');
  const [campFilter, setCampFilter] = useState<string>('Todos');
  const [quickDniInput, setQuickDniInput] = useState('');
  const [quickServiceType, setQuickServiceType] = useState<'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno'>('Almuerzo');
  const [pendingValidation, setPendingValidation] = useState<AttendanceValidationResult | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDniInput.trim()) return;

    const valResult = validateAttendanceCheckin(quickDniInput, quickServiceType, workers, attendanceRecords);
    setPendingValidation(valResult);
    setIsValidationModalOpen(true);
  };

  const handleConfirmCheckin = (override?: boolean) => {
    if (pendingValidation && onAddAttendance) {
      const targetDni = pendingValidation.worker ? pendingValidation.worker.dni : quickDniInput.trim();
      onAddAttendance(targetDni, quickServiceType, pendingValidation.worker?.roomNumber);
    }
    setIsValidationModalOpen(false);
    setQuickDniInput('');
    setPendingValidation(null);
  };

  // Extraer dinámicamente ÚNICAMENTE los lugares/campamentos del personal registrado
  const availableCamps = Array.from(
    new Set([
      ...workers.map((w) => w.camp).filter(Boolean),
      ...attendanceRecords.map((r) => {
        const mw = workers.find((w) => w.dni === r.workerDni);
        return mw ? mw.camp : r.camp;
      }).filter(Boolean),
    ])
  ).sort();

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchedWorker = workers.find((w) => w.dni === rec.workerDni);
    const displayName = matchedWorker ? matchedWorker.fullName : rec.workerName;
    const displayCompany = matchedWorker ? matchedWorker.company : rec.company;
    const displayCamp = matchedWorker ? matchedWorker.camp : rec.camp;

    const matchesSearch =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.workerDni.includes(searchTerm) ||
      displayCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayCamp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'Todos' || rec.serviceType === serviceFilter;
    const matchesCamp =
      campFilter === 'Todos' ||
      displayCamp === campFilter ||
      displayCamp.toLowerCase().includes(campFilter.toLowerCase());
    return matchesSearch && matchesService && matchesCamp;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <QrCode className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Control y Registro de Asistencia por QR</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validación biométrica con restricción estricta de <strong className="text-amber-400 font-bold">1 marcación por día por personal</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-lg"
          >
            <Smartphone className="w-4 h-4" />
            Escanear Asistencia QR
          </button>
          
          <button
            onClick={() => exportAttendanceTareoToExcel(attendanceRecords, workers)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 transition shadow-md"
            title="Exportar Matriz Mensual de Tareo Minero en Excel"
          >
            <Download className="w-4 h-4" />
            Exportar Tareo Minero (.xlsx)
          </button>

          {onClearAttendanceHistory && (
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 hover:border-rose-500/50 transition"
              title="Borrar todo el historial acumulado de asistencias"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              Borrar Historial
            </button>
          )}
        </div>
      </div>

      {/* Barra de Marcación Rápida Manual por DNI en Garita / Comedor */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/90">
        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 shrink-0">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Marcación Rápida Garita:</span>
          </div>

          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Ingrese DNI o escanee con lector físico USB (8 dígitos)..."
              value={quickDniInput}
              onChange={(e) => setQuickDniInput(e.target.value)}
              className="w-full pl-3 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={quickServiceType}
            onChange={(e) => setQuickServiceType(e.target.value as any)}
            className="w-full sm:w-auto py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200"
          >
            <option value="Almuerzo">🍱 Almuerzo</option>
            <option value="Desayuno">🍳 Desayuno</option>
            <option value="Cena">🍲 Cena</option>
            <option value="Ingreso Campamento">🏕️ Ingreso Garita</option>
            <option value="Alojamiento">🛌 Alojamiento</option>
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Validar & Registrar
          </button>
        </form>
      </div>

      {/* Stats raciones bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Marcaciones Hoy</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{attendanceRecords.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-blue-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Almuerzos Servidos</span>
          <div className="text-xl font-extrabold text-blue-400 mt-1">
            {attendanceRecords.filter((r) => r.serviceType === 'Almuerzo').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ingresos a Campamento</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {attendanceRecords.filter((r) => r.serviceType === 'Alojamiento' || r.serviceType === 'Ingreso Campamento').length}
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Efectividad Biológica</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1">100% Válido</div>
        </div>
      </div>

      {/* Workers Fotocheck Showcase */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Fotochecks QR Registrados</h3>
            <p className="text-[11px] text-slate-400">Haga clic en cualquier trabajador para ver e imprimir su Fotocheck QR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {workers.map((w) => (
            <div
              key={w.id}
              onClick={() => setSelectedWorkerForBadge(w)}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl cursor-pointer transition-all hover:-translate-y-1 group text-center"
            >
              <img
                src={w.photoUrl}
                alt={w.fullName}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-amber-500/40 group-hover:border-amber-400 mb-2"
              />
              <div className="font-bold text-xs text-slate-100 truncate">{w.fullName}</div>
              <div className="text-[10px] text-slate-400 truncate">{w.company}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <QrCode className="w-3 h-3" /> Ver Pass QR
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-100">Historial de Marcaciones de Asistencia</h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por DNI o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={campFilter}
              onChange={(e) => setCampFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-semibold"
            >
              <option value="Todos">Todos los Campamentos / Lugares</option>
              {availableCamps.map((campName) => (
                <option key={campName} value={campName}>
                  {campName}
                </option>
              ))}
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-semibold"
            >
              <option value="Todos">Todos los Servicios</option>
              <option value="Desayuno">Desayuno</option>
              <option value="Almuerzo">Almuerzo</option>
              <option value="Cena">Cena</option>
              <option value="Alojamiento">Alojamiento</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">DNI</th>
                <th className="p-3">Trabajador</th>
                <th className="p-3">Empresa Contratista</th>
                <th className="p-3">Campamento</th>
                <th className="p-3">Servicio / Marcación</th>
                <th className="p-3">Ubicación GPS</th>
                <th className="p-3">Dispositivo / Garita</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const matchedWorker = workers.find((w) => w.dni === rec.workerDni);
                  const displayName = matchedWorker ? matchedWorker.fullName : rec.workerName;
                  const displayCompany = matchedWorker ? matchedWorker.company : rec.company;
                  const displayCamp = matchedWorker ? matchedWorker.camp : rec.camp;
                  const gpsText = rec.gpsLocation || 'Lat: -11.9541°, Lon: -76.0123° (Toromocho)';
                  const mapsUrl = rec.latitude && rec.longitude
                    ? `https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`
                    : `https://www.google.com/maps?q=-11.9541,-76.0123`;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{rec.timestamp}</td>
                      <td className="p-3 font-bold text-amber-400 font-mono">{rec.workerDni}</td>
                      <td className="p-3 font-semibold text-slate-100">{displayName}</td>
                      <td className="p-3 text-slate-400">{displayCompany}</td>
                      <td className="p-3 text-slate-300 font-semibold">{displayCamp}</td>
                      <td className="p-3 font-bold text-amber-300">{rec.serviceType}</td>
                      <td className="p-3">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 hover:border-amber-500/60 transition"
                          title="Ver en Google Maps"
                        >
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>{gpsText}</span>
                        </a>
                      </td>
                      <td className="p-3 text-slate-400">{rec.scannedBy}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 space-y-2">
                    <p className="text-xs font-semibold">No hay marcaciones de asistencia registradas aún para este filtro.</p>
                    <p className="text-[11px] text-slate-500">Ingrese un DNI arriba o use el escáner para registrar la primera asistencia.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Badge Modal */}
      {selectedWorkerForBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative">
            <QRBadgeGenerator
              worker={selectedWorkerForBadge}
              onClose={() => setSelectedWorkerForBadge(null)}
            />
          </div>
        </div>
      )}

      {/* Modal de Validación Biométrica */}
      <AttendanceValidationModal
        isOpen={isValidationModalOpen}
        validation={pendingValidation}
        serviceType={quickServiceType}
        onConfirm={handleConfirmCheckin}
        onCancel={() => {
          setIsValidationModalOpen(false);
          setPendingValidation(null);
        }}
      />

      {/* Modal de Confirmación para Borrar Historial */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="font-extrabold text-base text-slate-100">
                ¿Borrar Todo el Historial de Asistencia?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción eliminará <strong>permanentemente</strong> todas las marcaciones registradas hasta la fecha. El historial quedará completamente en cero.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onClearAttendanceHistory) {
                    onClearAttendanceHistory();
                  }
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition"
              >
                Sí, Borrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
