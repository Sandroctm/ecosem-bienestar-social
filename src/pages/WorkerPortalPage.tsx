import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Send,
  MessageSquareWarning,
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Pickaxe,
  HeartPulse,
  Award,
  ArrowRight,
  Clock,
  AlertTriangle,
  Calendar,
  Building2,
  MapPin,
  Utensils,
  Check,
  Sparkles,
} from 'lucide-react';
import { Worker, AttendanceRecord, IncidentReport } from '../types';
import { WhatsAppIncidentModal } from '../components/WhatsAppIncidentModal';
import { validateAttendanceCheckin, isTodayRecord } from '../utils/attendanceValidationEngine';

interface WorkerPortalPageProps {
  workers: Worker[];
  attendanceRecords?: AttendanceRecord[];
  onSaveIncident: (incident: IncidentReport) => void;
  onAddAttendance?: (
    workerDni: string,
    serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno',
    roomNumber?: string
  ) => void;
}

export const WorkerPortalPage: React.FC<WorkerPortalPageProps> = ({
  workers,
  attendanceRecords = [],
  onSaveIncident,
  onAddAttendance,
}) => {
  const [scannedWorker, setScannedWorker] = useState<Worker | null>(
    workers.length > 0 ? workers[0] : null
  );
  const [inputDni, setInputDni] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<'Ingreso Campamento' | 'Almuerzo' | 'Desayuno' | 'Cena' | 'Alojamiento'>('Ingreso Campamento');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleIdentifyWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputDni.trim();
    if (!clean) return;

    const found = workers.find(
      (w) => w.dni === clean || w.qrCodeValue.includes(clean) || w.id === clean
    );
    if (found) {
      setScannedWorker(found);
      setFeedback(null);
    } else {
      setFeedback({
        type: 'error',
        message: `⚠️ No se encontró al trabajador con DNI o QR: ${clean}`,
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Check if current worker has already marked attendance today
  const workerTodayRecord = scannedWorker
    ? attendanceRecords.find((rec) => rec.workerDni === scannedWorker.dni && isTodayRecord(rec.timestamp))
    : null;

  // Filter ONLY current worker's attendance history
  const workerPersonalHistory = scannedWorker
    ? attendanceRecords.filter((rec) => rec.workerDni === scannedWorker.dni)
    : [];

  const handleMarkAttendanceMobile = () => {
    if (!scannedWorker) return;

    // Validate 1-mark-per-day constraint & SCTR / Medical Leave
    const validation = validateAttendanceCheckin(
      scannedWorker.dni,
      selectedService,
      workers,
      attendanceRecords
    );

    if (!validation.allowed) {
      setFeedback({
        type: 'error',
        message: validation.message,
      });
      return;
    }

    if (onAddAttendance) {
      onAddAttendance(scannedWorker.dni, selectedService, scannedWorker.roomNumber);
      setFeedback({
        type: 'success',
        message: `¡Asistencia de hoy (${selectedService}) registrada exitosamente para ${scannedWorker.fullName}!`,
      });
    }
  };

  const todayDisplayDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Smartphone frame container simulation */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-5 text-slate-100 relative overflow-hidden">
        
        {/* Smartphone top bar simulation */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Pickaxe className="w-4 h-4" />
            <span>ECOSEM Móvil</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
            Portal Personal QR
          </span>
        </div>

        {/* Feedback alert floating banner */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border transition-all animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <p className="text-[11px] leading-tight">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Worker Identification Section */}
        {!scannedWorker ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-400 rounded-2xl mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-base text-slate-100">Ingrese su DNI o Escanee QR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consulte sus asistencias personales, registre su marcado diario único y solicite soporte inmediato.
            </p>

            <form onSubmit={handleIdentifyWorker} className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Ingresar DNI del trabajador (8 dígitos)..."
                value={inputDni}
                onChange={(e) => setInputDni(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-center text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-button text-xs font-black shadow-lg transition active:scale-95"
              >
                Ingresar al Portal Móvil
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 mb-2">O seleccione un perfil de prueba:</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {workers.slice(0, 4).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setScannedWorker(w);
                      setFeedback(null);
                    }}
                    className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-medium"
                  >
                    {w.fullName.split(' ')[0]} ({w.dni})
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Worker Header Profile Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <img
                  src={scannedWorker.photoUrl}
                  alt={scannedWorker.fullName}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow-md"
                />
                <div>
                  <h4 className="font-black text-sm text-slate-100 leading-tight">
                    {scannedWorker.fullName}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      DNI: {scannedWorker.dni}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {scannedWorker.role} • {scannedWorker.company}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setScannedWorker(null);
                  setFeedback(null);
                }}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              >
                Cambiar
              </button>
            </div>

            {/* SECCIÓN PRINCIPAL: MARCADO DE ASISTENCIA DIARIO ÚNICO */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-100 uppercase tracking-wide">
                      Asistencia del Día
                    </h5>
                    <p className="text-[10px] text-slate-400 capitalize">{todayDisplayDate}</p>
                  </div>
                </div>

                {workerTodayRecord ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    REGISTRADA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40">
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                    PENDIENTE
                  </span>
                )}
              </div>

              {/* Status Box & Action Button */}
              {workerTodayRecord ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-200">
                        ¡Asistencia de hoy ya registrada!
                      </p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5">
                        Marcado registrado a las <strong className="font-mono text-emerald-300">{workerTodayRecord.timestamp}</strong> ({workerTodayRecord.serviceType}).
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-300">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Límite: 1 Marcación por Día
                    </span>
                    <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200 font-bold">
                      Completado
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] font-extrabold text-slate-300">Servicio / Tipo:</span>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value as any)}
                      className="flex-1 py-1.5 px-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Ingreso Campamento">🏕️ Ingreso Campamento</option>
                      <option value="Almuerzo">🍱 Almuerzo</option>
                      <option value="Desayuno">🍳 Desayuno</option>
                      <option value="Cena">🍲 Cena</option>
                      <option value="Alojamiento">🛌 Alojamiento</option>
                    </select>
                  </div>

                  <button
                    onClick={handleMarkAttendanceMobile}
                    className="w-full py-3 px-4 rounded-xl gold-button font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    REGISTRAR ASISTENCIA DE HOY (ÚNICA VECES)
                  </button>

                  <p className="text-[10px] text-center text-slate-400 italic">
                    * Solo se permite 1 marcación de asistencia por día por trabajador.
                  </p>
                </div>
              )}
            </div>

            {/* SECCIÓN HISTORIAL EXCLUSIVO DEL PERSONAL */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h5 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                    Mi Historial de Asistencias
                  </h5>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {workerPersonalHistory.length} Registros
                </span>
              </div>

              {workerPersonalHistory.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {workerPersonalHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {rec.serviceType}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-1.5 py-0.5 rounded">
                            {rec.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{rec.timestamp}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 truncate max-w-[200px]">
                          {rec.scannedBy}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Confirmado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-center space-y-1">
                  <User className="w-6 h-6 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Sin asistencias registradas</p>
                  <p className="text-[10px] text-slate-500">
                    Aún no cuentas con registros de asistencia acumulados. Registra tu marcado diario arriba.
                  </p>
                </div>
              )}
            </div>

            {/* REPORTE POR WHATSAPP */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 shadow-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <MessageSquareWarning className="w-4 h-4 shrink-0" />
                <span>Reporte Directo por WhatsApp</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Reporte de inmediato incidencias de habitación, comedor o salud al supervisor.
              </p>

              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                ENVIAR REPORTE POR WHATSAPP
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Validación Biométrica ECOSEM Protegida</span>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Incident Modal */}
      <WhatsAppIncidentModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onSaveIncident={onSaveIncident}
      />
    </div>
  );
};
