import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, QrCode, Smartphone, Sparkles, UserCheck, Camera, Layers } from 'lucide-react';
import { Worker } from '../types';

interface QRScannerModalProps {
  workers: Worker[];
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (workerDni: string, serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno') => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  workers,
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'virtual'>('camera');
  const [selectedService, setSelectedService] = useState<'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno'>('Almuerzo');
  const [lastScannedWorker, setLastScannedWorker] = useState<Worker | null>(null);
  const [manualDni, setManualDni] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [selectedWorkerForVirtualQR, setSelectedWorkerForVirtualQR] = useState<Worker | null>(null);

  useEffect(() => {
    if (workers.length > 0 && !selectedWorkerForVirtualQR) {
      setSelectedWorkerForVirtualQR(workers[0]);
    }
  }, [workers]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') return;

    // Initialize scanner if camera tab is active
    let scanner: Html5QrcodeScanner | null = null;

    try {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 220, height: 220 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          const parts = decodedText.split(':');
          const dniScanned = parts.length >= 2 ? parts[1] : decodedText;
          handleProcessScan(dniScanned);
        },
        () => {}
      );
    } catch (e) {
      console.warn('Camera scanner initialization error', e);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isOpen, activeTab, selectedService]);

  const handleProcessScan = (dni: string) => {
    const foundWorker = workers.find((w) => w.dni === dni || w.qrCodeValue.includes(dni));
    if (foundWorker) {
      setLastScannedWorker(foundWorker);
      onScanSuccess(foundWorker.dni, selectedService);
      setFeedbackMsg(`¡Asistencia de ${selectedService} REGISTRADA CON ÉXITO!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      // Allow registering even if worker is entered by DNI
      const fallbackWorker: Worker = {
        id: `W-SCAN-${Date.now().toString().slice(-4)}`,
        dni: dni,
        fullName: `Trabajador DNI ${dni}`,
        company: 'ECOSEM Contratistas',
        role: 'Personal General',
        camp: 'Campamento Central',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        phoneWhatsApp: '51900000000',
        status: 'Activo',
        qrCodeValue: `ECOSEM:${dni}:REGISTRADO`,
      };
      setLastScannedWorker(fallbackWorker);
      onScanSuccess(dni, selectedService);
      setFeedbackMsg(`¡Asistencia de ${selectedService} REGISTRADA CON ÉXITO para DNI ${dni}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDni.trim()) return;
    handleProcessScan(manualDni.trim());
    setManualDni('');
  };

  if (!isOpen) return null;

  const currentVirtualWorker = selectedWorkerForVirtualQR || workers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Escáner de Asistencia QR</h3>
              <p className="text-xs text-slate-400">Control biológico y de raciones ECOSEM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Camera vs Virtual QR */}
        <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Cámara Web Directa
          </button>
          <button
            onClick={() => setActiveTab('virtual')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'virtual'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Generador / Pase QR Visible
          </button>
        </div>

        {/* Service Type Selector */}
        <div>
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
            Seleccionar Tipo de Servicio / Marcación:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {(['Desayuno', 'Almuerzo', 'Cena', 'Alojamiento', 'Ingreso Campamento'] as const).map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => setSelectedService(service)}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all text-center ${
                  selectedService === service
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce ${
              feedbackMsg.includes('ÉXITO')
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* MODE 1: Camera scanner */}
        {activeTab === 'camera' && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
            <div id="reader" className="overflow-hidden rounded-lg min-h-[160px] flex flex-col justify-center"></div>
            <p className="text-[11px] text-slate-400">Apunte el fotocheck o pase QR a la cámara</p>
          </div>
        )}

        {/* MODE 2: Virtual QR Code generator & direct scanner */}
        {activeTab === 'virtual' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-4">
            {workers.length > 0 && (
              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1">
                  Seleccionar Trabajador para mostrar su QR:
                </label>
                <select
                  value={currentVirtualWorker?.id || ''}
                  onChange={(e) => {
                    const w = workers.find((item) => item.id === e.target.value);
                    if (w) setSelectedWorkerForVirtualQR(w);
                  }}
                  className="w-full p-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-semibold"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} — DNI: {w.dni} ({w.company})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Generated QR Code display */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-xl border-4 border-amber-400">
              <QRCodeSVG
                value={currentVirtualWorker ? currentVirtualWorker.qrCodeValue : `ECOSEM:${manualDni || '45892011'}:DEMO`}
                size={180}
                level="H"
              />
            </div>

            {currentVirtualWorker && (
              <div className="text-xs">
                <p className="font-extrabold text-slate-100">{currentVirtualWorker.fullName}</p>
                <p className="text-emerald-400 font-mono font-bold">DNI: {currentVirtualWorker.dni}</p>
                <p className="text-[11px] text-slate-400">{currentVirtualWorker.company} • {currentVirtualWorker.camp}</p>
              </div>
            )}

            <button
              onClick={() => handleProcessScan(currentVirtualWorker ? currentVirtualWorker.dni : manualDni || '45892011')}
              className="w-full py-2.5 px-4 gold-button text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Escanear Este QR ({selectedService})
            </button>
          </div>
        )}

        {/* Quick Simulator & Manual DNI input */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300">
            Escaneo Rápido (Ingresar DNI manualmente):
          </label>
          
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Ingresar DNI (ej: 45892011)"
              value={manualDni}
              onChange={(e) => setManualDni(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold gold-button rounded-lg shadow-sm"
            >
              Registrar Marcación
            </button>
          </form>

          {/* Quick click worker badges for instant demo */}
          {workers.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                Simular marcación instantánea de personal registrado:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {workers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleProcessScan(w.dni)}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 rounded-md text-slate-300 flex items-center gap-1 transition-all"
                  >
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    {w.fullName.split(' ')[0]} ({w.dni})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Last scanned preview card */}
        {lastScannedWorker && (
          <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3 shadow-inner">
            <img
              src={lastScannedWorker.photoUrl}
              alt={lastScannedWorker.fullName}
              className="w-12 h-12 rounded-lg object-cover border border-emerald-400 shrink-0"
            />
            <div className="flex-1 text-xs min-w-0">
              <div className="font-extrabold text-slate-100 truncate">{lastScannedWorker.fullName}</div>
              <div className="text-slate-400 text-[11px] truncate">{lastScannedWorker.company}</div>
              <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Marcado: {selectedService} • {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

