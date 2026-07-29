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
} from 'lucide-react';
import { Worker, IncidentReport } from '../types';
import { WhatsAppIncidentModal } from '../components/WhatsAppIncidentModal';

interface WorkerPortalPageProps {
  workers: Worker[];
  onSaveIncident: (incident: IncidentReport) => void;
}

export const WorkerPortalPage: React.FC<WorkerPortalPageProps> = ({ workers, onSaveIncident }) => {
  const [scannedWorker, setScannedWorker] = useState<Worker | null>(
    workers.length > 0 ? workers[0] : null
  );
  const [inputDni, setInputDni] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const handleIdentifyWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const found = workers.find((w) => w.dni === inputDni.trim() || w.qrCodeValue.includes(inputDni.trim()));
    if (found) {
      setScannedWorker(found);
    } else {
      alert(`⚠️ No se encontró al trabajador con DNI o código QR: ${inputDni}`);
    }
  };

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
            Portal Trabajador QR
          </span>
        </div>

        {/* Worker Identification Section */}
        {!scannedWorker ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-400 rounded-2xl mx-auto flex items-center justify-center text-amber-400">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-base text-slate-100">Escanee su QR o Ingrese DNI</h3>
            <p className="text-xs text-slate-400">
              Acceso directo para reportes de incidentes por WhatsApp y consulta de raciones.
            </p>

            <form onSubmit={handleIdentifyWorker} className="space-y-2">
              <input
                type="text"
                placeholder="Ingresar DNI del trabajador..."
                value={inputDni}
                onChange={(e) => setInputDni(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-center text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
              >
                Validar Acceso QR
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Worker Header Profile Card matching phone mock in reference image */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
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
                  <span className="text-[11px] font-bold text-amber-400 block">
                    {scannedWorker.role}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {scannedWorker.company}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setScannedWorker(null)}
                className="text-[10px] text-slate-400 hover:text-amber-400 underline"
              >
                Cambiar
              </button>
            </div>

            {/* PRIMARY USER REQUIREMENT HIGHLIGHT: ACCESO EXCLUSIVO AL REPORTE POR WHATSAPP */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4 rounded-2xl border-2 border-emerald-500/50 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <MessageSquareWarning className="w-5 h-5 shrink-0" />
                <span>Acceso Directo a Reporte WhatsApp</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Reporte inmediatamente cualquier ocurrencia, falla de habitación, salud o requerimiento al supervisor de turno.
              </p>

              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                ENVIAR REPORTE POR WHATSAPP
              </button>
            </div>

            {/* Worker Menu Buttons (Matching the phone grid in the image) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="font-extrabold text-slate-200">Mi Asistencia</div>
                <div className="text-[9px] text-emerald-400 font-bold">Ración Habilitada</div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
                <HeartPulse className="w-5 h-5 text-rose-400 mx-auto" />
                <div className="font-extrabold text-slate-200">Salud Ocupacional</div>
                <div className="text-[9px] text-slate-400">Controles Al Día</div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 flex items-center justify-center gap-1">
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
