import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, QrCode, Smartphone, Sparkles, UserCheck, Camera, Layers, ShieldAlert, Utensils, BedDouble, LogIn, Coffee, Upload, FileImage, Zap } from 'lucide-react';
import { Worker, AttendanceRecord } from '../types';
import { getQrBaseUrl } from '../App';
import { sanitizeAndValidateQRPayload } from '../utils/qrPayloadSanitizer';

interface QRScannerModalProps {
  workers: Worker[];
  attendanceRecords?: AttendanceRecord[];
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (
    workerDni: string,
    serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno',
    roomNumber?: string
  ) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  workers,
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'virtual' | 'demo'>('camera');
  const [selectedService, setSelectedService] = useState<'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno'>('Ingreso Campamento');
  const [lastScannedWorker, setLastScannedWorker] = useState<Worker | null>(null);
  const [manualDni, setManualDni] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [selectedWorkerForVirtualQR, setSelectedWorkerForVirtualQR] = useState<Worker | null>(null);

  // Debounce Lock y prevención de Memory Leaks
  const lastScanTimestampRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('reader-hidden');
      const decodedText = await html5QrCode.scanFile(file, true);
      let dniScanned = decodedText;
      if (decodedText.includes('?')) {
        const urlParams = new URLSearchParams(decodedText.split('?')[1]);
        const dni = urlParams.get('dni');
        if (dni) dniScanned = dni;
      }
      handleProcessScan(dniScanned);
    } catch (err: any) {
      console.warn('Error decodificando imagen QR:', err);
      setFeedbackMsg('⚠️ No se detectó código QR en la foto cargada. Asegúrese de que la imagen sea clara.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

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
          let dniScanned = decodedText;
          if (decodedText.includes('?')) {
            try {
              const urlParams = new URLSearchParams(decodedText.split('?')[1]);
              const dni = urlParams.get('dni');
              if (dni) {
                dniScanned = dni;
              }
            } catch (e) {
              console.error("Error parsing scanned URL:", e);
            }
          } else {
            const parts = decodedText.split(':');
            dniScanned = parts.length >= 2 ? parts[1] : decodedText;
          }
          handleProcessScan(dniScanned);
        },
        () => {}
      );
    } catch (e) {
      console.warn('Camera scanner initialization error', e);
    }

    return () => {
      // Destrucción explícita para evitar Memory Leaks en dispositivos móviles
      if (scanner) {
        scanner.clear().catch(() => {});
      }

      // Detener cualquier stream de cámara remanente en el navegador
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        }).catch(() => {});
      }
    };
  }, [isOpen, activeTab, selectedService]);

  const playAudioBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  const handleProcessScan = (rawInput: string) => {
    const now = Date.now();
    // Bloqueo Debounce Lock de 2 segundos para erradicar el Double Submit Hazard
    if (isProcessingRef.current || now - lastScanTimestampRef.current < 2000) {
      console.log('[QR Debounce Lock] Lectura consecutiva bloqueada (< 2000ms)');
      return;
    }

    // Sanitización anti-XSS / anti-SQLi
    const sanitized = sanitizeAndValidateQRPayload(rawInput);
    if (!sanitized.isValid) {
      setFeedbackMsg(sanitized.errorMessage || 'QR inválido');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    isProcessingRef.current = true;
    lastScanTimestampRef.current = now;

    // Extraer DNI de 8 dígitos o el valor decodificado limpio
    const cleanStr = sanitized.sanitizedValue;
    const dniMatch = cleanStr.match(/\b\d{8}\b/);
    const targetDni = dniMatch ? dniMatch[0] : (sanitized.workerDni || cleanStr);

    const foundWorker = workers.find(
      (w) => w.dni === targetDni || w.dni === cleanStr || w.qrCodeValue.includes(targetDni) || w.id === targetDni
    );

    playAudioBeep();

    if (foundWorker) {
      setLastScannedWorker(foundWorker);
      onScanSuccess(foundWorker.dni, selectedService, foundWorker.roomNumber);
      setFeedbackMsg(`¡MARCACIÓN EXITOSA! ${foundWorker.fullName} (${foundWorker.company}) - Servicio: ${selectedService}`);
    } else {
      const fallbackWorker: Worker = {
        id: `W-SCAN-${Date.now().toString().slice(-4)}`,
        dni: targetDni,
        fullName: `Trabajador DNI ${targetDni}`,
        company: 'ECOSEM Contratistas',
        role: 'Personal General',
        camp: 'Campamento Central',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        phoneWhatsApp: '51900000000',
        status: 'Activo',
        qrCodeValue: `ECOSEM:${targetDni}:REGISTRADO`,
      };
      setLastScannedWorker(fallbackWorker);
      onScanSuccess(targetDni, selectedService);
      setFeedbackMsg(`¡MARCACIÓN REGISTRADA! DNI ${targetDni} marcado en ${selectedService}.`);
    }

    setTimeout(() => {
      setFeedbackMsg(null);
      isProcessingRef.current = false;
    }, 2000);
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

        {/* Conmutador de 4 Modos de Marcación */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Cámara
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Subir Foto
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'demo'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Demo 1-Clic
          </button>

          <button
            onClick={() => setActiveTab('virtual')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'virtual'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Pases QR
          </button>
        </div>

        {/* Selector Interactivo de Servicio */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block text-center">
            Seleccionar Servicio para Marcación:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[11px] font-extrabold">
            {(
              [
                { id: 'Desayuno', label: '🍳 Desayuno' },
                { id: 'Almuerzo', label: '🍱 Almuerzo' },
                { id: 'Cena', label: '🍲 Cena' },
                { id: 'Ingreso Campamento', label: '🏕️ Garita' },
                { id: 'Alojamiento', label: '🛌 Cuarto' },
              ] as const
            ).map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => setSelectedService(srv.id)}
                className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold text-center transition-all ${
                  selectedService === srv.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {srv.label}
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

        {/* MODO 1: Cámara Web Directa */}
        {activeTab === 'camera' && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
            <div id="reader" className="overflow-hidden rounded-lg min-h-[180px] flex flex-col justify-center"></div>
            <p className="text-[11px] text-slate-400">Apunte el fotocheck o pase QR a la cámara del dispositivo</p>
          </div>
        )}

        {/* MODO 2: Subir Foto / Imagen de Galería */}
        {activeTab === 'upload' && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-4">
            <div id="reader-hidden" className="hidden"></div>
            <div className="p-6 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl bg-slate-900/50 space-y-3 transition">
              <FileImage className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-slate-100 uppercase">Cargar Foto de Fotocheck o Captura QR</h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  Si la cámara no abre en su celular, tome una foto del código QR o elija una captura de su galería.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-lg transition">
                <Upload className="w-4 h-4" />
                <span>Seleccionar Imagen QR</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* MODO 3: Marcación Demo Instantánea de 1-Clic */}
        {activeTab === 'demo' && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase">
                <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Simular Marcación Instantánea (Prueba 1-Clic):</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Haga clic en cualquiera de los siguientes trabajadores para registrar su asistencia de inmediato y probar el flujo sin cámara:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {workers.slice(0, 6).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleProcessScan(w.dni)}
                  className="flex items-center gap-2.5 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition text-left group"
                >
                  <img src={w.photoUrl} alt={w.fullName} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-300">{w.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">DNI: {w.dni}</div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                    Marcar
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: Virtual QR Code generator & direct scanner */}
        {activeTab === 'virtual' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-4">
            {workers.length > 0 ? (
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
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-left space-y-1">
                <p className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  ⚠️ Padrón Vacío
                </p>
                <p className="text-[11px] text-slate-400">
                  No hay personal registrado para generar QRs. Ve al módulo <strong>Gestión de Personal</strong> y añade trabajadores o carga los datos Demo.
                </p>
              </div>
            )}

            {/* Aviso de Localhost */}
            {window.location.hostname === 'localhost' && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-left space-y-1">
                <p className="text-[10px] font-bold text-amber-400">⚠️ Probando en Localhost</p>
                <p className="text-[10px] text-amber-200/70">
                  El QR apunta a "localhost". Si escaneas este QR con tu <strong>celular</strong> no funcionará porque el celular no encontrará la web. Para que el celular lo lea, debes entrar a esta PC usando su IP (ej: <code>http://192.168.1.X:5173</code>) o subir la página a Vercel.
                </p>
              </div>
            )}

            {/* Generated QR Code display */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-xl border-4 border-amber-400">
              <QRCodeSVG
                value={currentVirtualWorker ? `${getQrBaseUrl()}/?action=room-checkin&dni=${currentVirtualWorker.dni}` : `${getQrBaseUrl()}/?action=room-checkin&dni=${manualDni || '45892011'}`}
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
              Escanear Este QR (Ingreso Campamento)
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

