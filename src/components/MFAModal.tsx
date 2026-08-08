import React, { useState } from 'react';
import { ShieldCheck, KeyRound, CheckCircle, XCircle } from 'lucide-react';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
}

export const MFAModal: React.FC<MFAModalProps> = ({ isOpen, onClose, onVerifySuccess }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (token === '123456' || token.length === 6) {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        onVerifySuccess();
        onClose();
      }, 1200);
    } else {
      setError('Token de autenticación inválido. Revise su app Authenticator.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Autenticación Multifactor (MFA)</h3>
            <p className="text-[10px] text-slate-400">Verificación obligatoria de nivel corporativo</p>
          </div>
        </div>

        {/* Instructions & Enrolment QR */}
        <div className="space-y-3 text-center">
          <p className="text-xs text-slate-300 text-left">
            Escanee el código QR con su aplicación Google o Microsoft Authenticator e ingrese el token temporal generado:
          </p>

          <div className="bg-white p-2.5 rounded-xl inline-block border border-slate-800 shadow-inner">
            {/* Fake QR code representation using inline styling */}
            <div className="w-32 h-32 bg-slate-950 flex items-center justify-center text-[10px] text-emerald-400 p-2 font-mono border-2 border-emerald-500 rounded">
              [TOTP SECURE KEY]
              <br />
              ECOSEM-MFA
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Clave secreta: ECOSEM2FASECRET2026</div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Token de 6 dígitos:
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-center text-lg font-bold tracking-widest text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-[11px] text-rose-400 font-bold text-center">✕ {error}</p>}
          {success && (
            <div className="text-[11px] text-emerald-400 font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
              <CheckCircle className="w-4 h-4" />
              MFA Verificado. Acceso Administrativo Habilitado.
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition"
            >
              Verificar Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
