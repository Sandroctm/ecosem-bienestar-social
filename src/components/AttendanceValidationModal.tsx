import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, X, User, Building, MapPin, Bed, Calendar, Clock, Lock } from 'lucide-react';
import { Worker } from '../types';
import { AttendanceValidationResult } from '../utils/attendanceValidationEngine';

interface AttendanceValidationModalProps {
  isOpen: boolean;
  validation: AttendanceValidationResult | null;
  serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno';
  onConfirm: (override?: boolean) => void;
  onCancel: () => void;
}

export const AttendanceValidationModal: React.FC<AttendanceValidationModalProps> = ({
  isOpen,
  validation,
  serviceType,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !validation) return null;

  const worker = validation.worker;
  const isSuccess = validation.allowed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative my-auto transition-all ${
          isSuccess
            ? 'border-emerald-500/40 shadow-emerald-950/40'
            : validation.status === 'Duplicado Observado'
            ? 'border-amber-500/40 shadow-amber-950/40'
            : 'border-rose-500/50 shadow-rose-950/50'
        }`}
      >
        {/* Header Status Banner */}
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border ${
            isSuccess
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : validation.status === 'Duplicado Observado'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : validation.status === 'Duplicado Observado'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {isSuccess ? (
                <ShieldCheck className="w-7 h-7 animate-bounce" />
              ) : (
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest block opacity-80">
                Verificación Biométrica • {serviceType}
              </span>
              <h3 className="font-black text-base leading-tight">
                {isSuccess
                  ? '🟢 ACCESO Y MARCACIÓN PERMITIDA'
                  : validation.status === 'Duplicado Observado'
                  ? '⚠️ RACIÓN / MARCACIÓN YA REGISTRADA'
                  : '⛔ ACCESO Y MARCACIÓN RESTRINGIDA'}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Identity Card */}
        {worker ? (
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={worker.photoUrl}
                alt={worker.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-md shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-black text-base text-slate-100 truncate uppercase">{worker.fullName}</h4>
                <p className="text-xs text-amber-400 font-extrabold uppercase truncate">{worker.role}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{worker.company}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">DNI</span>
                <span className="font-mono font-bold text-amber-400">{worker.dni}</span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Habitación</span>
                <span className="font-mono font-bold text-emerald-400">{worker.roomNumber || 'N/A'}</span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Estado SCTR</span>
                <span className={`font-mono font-bold ${validation.sctrExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {validation.sctrExpired ? 'VENCIDO' : 'VIGENTE'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-extrabold text-amber-400">Personal No Padroneado</span>
            <p className="text-slate-400">El DNI escaneado no cuenta con ficha previa en el sistema. Se registrará como observación de garita.</p>
          </div>
        )}

        {/* Validation Message Box */}
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold space-y-1 ${
            isSuccess
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : validation.status === 'Duplicado Observado'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2 font-bold uppercase text-[11px]">
            {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{validation.status}</span>
          </div>
          <p className="text-slate-300 leading-snug">{validation.message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-300 transition"
          >
            Cancelar Marcación
          </button>

          {!isSuccess && (
            <button
              onClick={() => onConfirm(true)}
              className="px-4 py-2.5 bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/50 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              Autorización Excepcional Supervisor
            </button>
          )}

          {isSuccess && (
            <button
              onClick={() => onConfirm(false)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Marcación ({serviceType})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
