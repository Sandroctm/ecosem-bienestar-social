import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Worker } from '../types';
import { Download, ShieldCheck } from 'lucide-react';
import { getQrBaseUrl } from '../App';

interface QRBadgeGeneratorProps {
  worker: Worker;
  onClose?: () => void;
}

export const QRBadgeGenerator: React.FC<QRBadgeGeneratorProps> = ({ worker, onClose }) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-slate-100 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Printable Badge Container (Fotocheck Estándar Minero 85mm x 54mm) */}
      <div 
        ref={badgeRef} 
        className="fotocheck-printable bg-white text-slate-900 rounded-2xl border-4 border-emerald-600 p-4 space-y-3 shadow-2xl relative overflow-hidden mx-auto max-w-[340px]"
      >
        {/* Top Header Bar */}
        <div className="bg-emerald-700 -mx-4 -mt-4 p-3 text-white flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-md shadow-sm">
              <img
                src="/ecosem-logo.png"
                alt="ECOSEM"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-wider leading-tight">ECOSEM PUCARA-MOROCOCHA</div>
              <div className="text-[8px] text-amber-300 font-bold uppercase tracking-widest">PASE OFICIAL DE CAMPAMENTO</div>
            </div>
          </div>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-900 text-amber-300 border border-amber-400">
            {worker.status}
          </span>
        </div>

        {/* Worker Main Card Content */}
        <div className="flex items-center gap-3 pt-1">
          {/* Worker Photo */}
          <div className="w-20 h-24 rounded-xl border-2 border-emerald-600 overflow-hidden shadow-md shrink-0 bg-slate-100">
            <img src={worker.photoUrl} alt={worker.fullName} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-black text-sm text-slate-900 leading-tight uppercase truncate">{worker.fullName}</h3>
            <p className="text-[11px] text-emerald-800 font-extrabold uppercase truncate">{worker.role}</p>
            <p className="text-[10px] text-slate-600 font-bold truncate">{worker.company}</p>
            
            <div className="pt-1 flex flex-wrap gap-1">
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                DNI: <strong>{worker.dni}</strong>
              </span>
              {worker.roomNumber && (
                <span className="text-[9px] font-mono font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-400">
                  CUARTO: {worker.roomNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-300 flex items-center justify-between gap-3">
          <div className="bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm shrink-0">
            <QRCodeSVG value={`${getQrBaseUrl()}/?action=room-checkin&dni=${worker.dni}`} size={110} level="H" includeMargin={false} />
          </div>

          <div className="text-[9px] text-slate-600 font-semibold space-y-1 flex-1 text-right">
            <div className="font-extrabold text-emerald-800 uppercase flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Verificación QR</span>
            </div>
            <p className="leading-tight">Escanea este código con el móvil para registrar asistencia e ingreso a habitación.</p>
            <div className="text-[8px] font-mono font-bold text-slate-500 pt-0.5">{worker.camp}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[8px] text-center font-bold uppercase tracking-wider text-slate-500 border-t border-slate-200 pt-1.5">
          ECOSEM PUCARA-MOROCOCHA • FOTOCHECK OFICIAL PERMANENTE
        </div>
      </div>

      {/* Control buttons */}
      <div className="mt-5 flex gap-2 no-print">
        <button
          onClick={handlePrintBadge}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl gold-button text-xs font-black shadow-md"
        >
          <Download className="w-4 h-4" />
          Imprimir / Guardar Fotocheck (PDF)
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};
