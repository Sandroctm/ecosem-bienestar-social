import React, { useState } from 'react';
import { X, Send, MessageSquareWarning, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { IncidentReport } from '../types';

interface WhatsAppIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIncident: (incident: IncidentReport) => void;
}

export const WhatsAppIncidentModal: React.FC<WhatsAppIncidentModalProps> = ({
  isOpen,
  onClose,
  onSaveIncident,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<IncidentReport>>({
    incidentType: 'Infraestructura',
    severity: 'Alta',
    campOrCommunity: 'Campamento Norte - Las Bambas',
    description: '',
    reportedBy: 'Juan Pérez Ramírez (Supervisor)',
    targetPhoneWhatsApp: '51987654321',
  });

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      alert('Por favor ingrese la descripción del incidente.');
      return;
    }

    const code = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: IncidentReport = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      code,
      date: new Date().toLocaleString(),
      incidentType: formData.incidentType as any,
      severity: formData.severity as any,
      campOrCommunity: formData.campOrCommunity || 'Campamento Norte',
      description: formData.description || '',
      reportedBy: formData.reportedBy || 'Supervisor ECOSEM',
      targetPhoneWhatsApp: formData.targetPhoneWhatsApp || '51987654321',
      status: 'Pendiente',
    };

    // Build formatted message text for WhatsApp dispatch
    const messageText = `🚨 *REPORTE DE INCIDENTE MINERO - ECOSEM* 🚨
---------------------------------------------
📋 *Código:* ${newIncident.code}
📅 *Fecha:* ${newIncident.date}
📍 *Ubicación:* ${newIncident.campOrCommunity}
🏷️ *Tipo:* ${newIncident.incidentType}
🔥 *Severidad:* ${newIncident.severity}
---------------------------------------------
📝 *Descripción:* 
${newIncident.description}
---------------------------------------------
👤 *Reportado por:* ${newIncident.reportedBy}
🛡️ *Sistema ECOSEM Bienestar Social Minero*`;

    const encodedText = encodeURIComponent(messageText);
    const cleanPhone = newIncident.targetPhoneWhatsApp.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    // Save incident to app state
    onSaveIncident(newIncident);

    // Open WhatsApp in a new window/tab!
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Reporte Directo WhatsApp</h3>
              <p className="text-xs text-slate-400">Despacho de incidentes operativos y comunitarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendWhatsApp} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Incidente:</label>
              <select
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value as any })}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              >
                <option value="Infraestructura">Infraestructura & Habitación</option>
                <option value="Salud">Salud & Emergencia Médica</option>
                <option value="Convivencia">Convivencia en Campamento</option>
                <option value="Seguridad">Seguridad y Medio Ambiente</option>
                <option value="Reclamo">Reclamo / Queja de Servicio</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nivel de Severidad:</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-bold"
              >
                <option value="Baja">Baja - Rutinario</option>
                <option value="Media">Media - Moderado</option>
                <option value="Alta">Alta - Prioridad</option>
                <option value="Crítica">Crítica - Emergencia Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ubicación / Campamento / Comunidad:</label>
            <input
              type="text"
              value={formData.campOrCommunity}
              onChange={(e) => setFormData({ ...formData, campOrCommunity: e.target.value })}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="Ej: Campamento Norte / Comunidad Cotabambas"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Descripción del Incidente:</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="Detalle claramente lo sucedido para acción inmediata..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reportado Por:</label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">N° WhatsApp Receptor (con Código Perú):</label>
              <input
                type="text"
                value={formData.targetPhoneWhatsApp}
                onChange={(e) => setFormData({ ...formData, targetPhoneWhatsApp: e.target.value })}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                placeholder="51987654321"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Al presionar el botón se abrirá WhatsApp con el reporte auto-formateado listo para enviar.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              Enviar Reporte por WhatsApp
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
