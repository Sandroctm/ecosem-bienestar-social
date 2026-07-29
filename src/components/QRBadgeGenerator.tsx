import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Worker } from '../types';
import { Download, ShieldCheck } from 'lucide-react';

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
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-slate-100 max-w-sm mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Printable Badge Container */}
      <div ref={badgeRef} className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border-2 border-emerald-500/50 text-center space-y-4 shadow-inner">
        
        {/* Badge Header with Official Logo */}
        <div className="bg-white p-2 rounded-xl border border-emerald-500 shadow-md">
          <img
            src="/ecosem-logo.png"
            alt="ECOSEM PUCARA-MOROCOCHA"
            className="h-12 w-auto mx-auto object-contain"
          />
        </div>

        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
            PASE DIGITAL DE CAMPAMENTO
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {worker.status}
          </span>
        </div>

        {/* Worker Photo & Details */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-xl border-2 border-emerald-400 overflow-hidden shadow-md mb-2 p-1 bg-slate-800">
            <img src={worker.photoUrl} alt={worker.fullName} className="w-full h-full object-cover rounded-lg" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100 leading-tight">{worker.fullName}</h3>
          <p className="text-xs text-emerald-400 font-bold">{worker.role}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{worker.company}</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-xl inline-block shadow-lg border-2 border-emerald-500 my-1">
          <QRCodeSVG value={worker.qrCodeValue} size={140} level="H" includeMargin={false} />
        </div>

        <div className="text-[11px] font-mono text-slate-300 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800">
          DNI: <span className="font-bold text-emerald-400">{worker.dni}</span> | {worker.camp}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verificado por ECOSEM PUCARA-MOROCOCHA</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="mt-5 flex gap-2 no-print">
        <button
          onClick={handlePrintBadge}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-xs font-bold shadow-md hover:from-emerald-500 hover:to-emerald-700"
        >
          <Download className="w-4 h-4" />
          Imprimir / Guardar Fotocheck
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
