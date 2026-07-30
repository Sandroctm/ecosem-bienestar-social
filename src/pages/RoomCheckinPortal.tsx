import React, { useState, useEffect } from 'react';
import { 
  Building, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Settings, 
  Database, 
  Copy, 
  ExternalLink,
  Smartphone,
  Info,
  Clock,
  LogOut,
  FolderSync
} from 'lucide-react';
import { Worker, AttendanceRecord } from '../types';
import { getGoogleSheetsWebhookUrl, setGoogleSheetsWebhookUrl } from '../utils/googleSheets';

interface RoomCheckinPortalProps {
  workers: Worker[];
  onAddAttendance: (workerDni: string, serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno', roomNumber?: string) => void;
  attendanceRecords: AttendanceRecord[];
  onBackToDashboard: () => void;
}

export const RoomCheckinPortal: React.FC<RoomCheckinPortalProps> = ({
  workers,
  onAddAttendance,
  attendanceRecords,
  onBackToDashboard,
}) => {
  const [dniInput, setDniInput] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scannedWorker, setScannedWorker] = useState<Worker | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(getGoogleSheetsWebhookUrl());
  const [showCopiedMsg, setShowCopiedMsg] = useState(false);

  // Play a retro-style audio feedback beep on success
  const playSound = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(147, audioCtx.currentTime + 0.1); // D3
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.45);
      }
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  // Run automatically on mount if query params exist in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dni = params.get('dni');
    const room = params.get('room') || params.get('cuarto') || '';

    if (room) {
      setRoomInput(room);
    }

    if (dni) {
      setDniInput(dni);
      handleProcessCheckin(dni, room);
    }
  }, []);

  const handleProcessCheckin = (dni: string, room: string) => {
    const cleanDni = dni.trim();
    if (!cleanDni) return;

    const found = workers.find((w) => w.dni === cleanDni);
    
    if (found) {
      setScannedWorker(found);
      onAddAttendance(found.dni, 'Alojamiento', room);
      playSound('success');
      setStatusMsg({
        type: 'success',
        text: `¡ENTRADA REGISTRADA! Bienvenido(a) ${found.fullName}.`,
      });
      // Clear status after 5s
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      setScannedWorker(null);
      // Even if not in DB, allow check-in and log as Observed
      onAddAttendance(cleanDni, 'Alojamiento', room);
      playSound('success');
      setStatusMsg({
        type: 'success',
        text: `¡REGISTRADO! DNI ${cleanDni} marcado en Alojamiento (No listado en padrón).`,
      });
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniInput.trim()) {
      playSound('error');
      setStatusMsg({ type: 'error', text: 'Debe ingresar un DNI válido.' });
      return;
    }
    handleProcessCheckin(dniInput, roomInput);
    setDniInput('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleSheetsWebhookUrl(webhookUrl);
    setShowSettings(false);
    alert('Configuración de Google Sheets guardada.');
  };

  // Google Apps Script code template
  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Agrega los datos al final de la hoja
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.workerDni || "",
      data.workerName || "",
      data.company || "",
      data.camp || "",
      data.serviceType || "",
      data.roomNumber || "N/A",
      data.status || "Válido",
      data.scannedBy || "Auto-Registro"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setShowCopiedMsg(true);
    setTimeout(() => setShowCopiedMsg(false), 2000);
  };

  // Filter local logs of Alojamiento
  const lodgingLogs = attendanceRecords.filter((rec) => rec.serviceType === 'Alojamiento');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Top Bar / Header */}
      <div className="w-full max-w-2xl flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard Principal
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Configuración de Google Sheets"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            VIVO
          </div>
        </div>
      </div>

      {/* Main Check-In Form */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden my-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Branding header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 bg-amber-500 rounded-2xl text-slate-950 shadow-lg">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-100 tracking-wide">
            ECOSEM PUCARA-MOROCOCHA
          </h2>
          <p className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wider">
            Control de Alojamiento / Entrada a Cuartos
          </p>
        </div>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 animate-pulse border ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Manual entry / Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Número de Habitación / Cuarto (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: A-204"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-bold placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Ingrese DNI del Trabajador:
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="DNI de 8 dígitos"
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-950 border-2 border-slate-800 rounded-xl text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold text-center placeholder-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider gold-button shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4.5 h-4.5" />
            Marcar Entrada / Guardar Llegada
          </button>
        </form>

        {/* Scanned worker preview */}
        {scannedWorker && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <img
              src={scannedWorker.photoUrl}
              alt={scannedWorker.fullName}
              className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 shrink-0"
            />
            <div className="text-xs min-w-0 flex-1">
              <div className="font-extrabold text-slate-100 truncate">{scannedWorker.fullName}</div>
              <div className="text-[10px] text-slate-400 truncate">{scannedWorker.company}</div>
              <div className="text-[10px] text-amber-300 font-bold">{scannedWorker.camp}</div>
            </div>
          </div>
        )}

        {/* Small Scan Helper Tip */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            Al escanear un fotocheck de personal con el teléfono, este abrirá automáticamente este portal y registrará el ingreso sin necesidad de pulsar botones.
          </p>
        </div>
      </div>

      {/* Recent Check-Ins Table */}
      <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Llegadas Recientes a Cuartos (Hoy)
            </h3>
          </div>
          <span className="text-[10px] font-bold bg-slate-850 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
            Total: {lodgingLogs.length} marcaciones
          </span>
        </div>

        {lodgingLogs.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-xs">
            No se han registrado entradas a cuartos todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase font-bold">
                  <th className="py-2">Hora</th>
                  <th className="py-2">Habitación</th>
                  <th className="py-2">DNI</th>
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Empresa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {lodgingLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/30">
                    <td className="py-2 font-mono text-slate-400">
                      {log.timestamp.split(', ')[1] || log.timestamp}
                    </td>
                    <td className="py-2 font-bold text-amber-400">
                      {log.roomNumber || 'Común'}
                    </td>
                    <td className="py-2 font-mono">{log.workerDni}</td>
                    <td className="py-2 font-semibold text-slate-200">{log.workerName}</td>
                    <td className="py-2 text-slate-400 truncate max-w-[120px]">{log.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Google Sheets Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">
                    Integración Automática Google Sheets
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Sincroniza cada llegada a los cuartos en tiempo real
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                Cerrar
              </button>
            </div>

            {/* Config Webhook Form */}
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">
                  Dirección URL del Web App de Google (Apps Script Webhook):
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Si dejas este campo en blanco, las marcaciones solo se guardarán localmente.
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    Código de Apps Script para Google Sheets:
                  </span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 font-bold transition-all text-[10px] text-slate-300"
                  >
                    {showCopiedMsg ? '¡Copiado!' : 'Copiar Código'}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1. Crea una hoja de cálculo de Google. <br />
                  2. Ve a <strong>Extensiones ➔ Apps Script</strong>. <br />
                  3. Pega el código de abajo, haz clic en <strong>Implementar ➔ Nueva implementación</strong>. <br />
                  4. Selecciona tipo <strong>Aplicación web</strong>, ejecuta como <strong>"Yo"</strong> y permite acceso a <strong>"Cualquiera"</strong>. <br />
                  5. Copia la URL entregada y pégala arriba.
                </p>

                <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[9px] overflow-x-auto max-h-40 border border-slate-800">
                  {appsScriptCode}
                </pre>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md text-xs"
              >
                Guardar Configuración
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simple Footer info */}
      <div className="w-full max-w-2xl text-center text-[10px] text-slate-500 pt-4 border-t border-slate-900">
        © 2026 ECOSEM Pucará-Morococha • Sistema de Control Interno y Bienestar Social
      </div>
      
    </div>
  );
};
