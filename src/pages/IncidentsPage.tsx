import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Send,
  Download,
  Plus,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import { IncidentReport } from '../types';

interface IncidentsPageProps {
  incidents: IncidentReport[];
  onOpenWhatsAppModal: () => void;
  onExportExcel: () => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onOpenWhatsAppModal,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.campOrCommunity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Todos' || inc.incidentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleResendWhatsApp = (inc: IncidentReport) => {
    const messageText = `🚨 *REPORTE DE INCIDENTE MINERO - ECOSEM* 🚨
---------------------------------------------
📋 *Código:* ${inc.code}
📅 *Fecha:* ${inc.date}
📍 *Ubicación:* ${inc.campOrCommunity}
🏷️ *Tipo:* ${inc.incidentType}
🔥 *Severidad:* ${inc.severity}
---------------------------------------------
📝 *Descripción:* 
${inc.description}
---------------------------------------------
👤 *Reportado por:* ${inc.reportedBy}
🛡️ *Sistema ECOSEM Bienestar Social Minero*`;

    const encodedText = encodeURIComponent(messageText);
    const cleanPhone = inc.targetPhoneWhatsApp.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg text-slate-950">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Gestión y Despacho de Incidentes vía WhatsApp</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro inmediato de incidentes de infraestructura, salud y seguridad con despacho automatizado a supervisores en WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWhatsAppModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
            Reportar Incidente por WhatsApp
          </button>
          
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Incidentes (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Incidentes Registrados</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{incidents.length} Reportes</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Despachos vía WhatsApp</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">100% Enviados Directo</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-blue-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tiempo Respuesta Promedio</span>
          <div className="text-xl font-extrabold text-blue-400 mt-1">&lt; 15 Minutos</div>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-100">Bitácora de Incidentes Registrados</h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar incidentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
            >
              <option value="Todos">Todos los Tipos</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Salud">Salud</option>
              <option value="Convivencia">Convivencia</option>
              <option value="Seguridad">Seguridad</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Tipo Incidente</th>
                <th className="p-3">Severidad</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Reportado Por</th>
                <th className="p-3 text-center">Acción WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400">{inc.code}</td>
                  <td className="p-3 font-mono text-slate-400">{inc.date}</td>
                  <td className="p-3 font-semibold text-slate-200">{inc.campOrCommunity}</td>
                  <td className="p-3 font-bold text-amber-300">{inc.incidentType}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        inc.severity === 'Alta' || inc.severity === 'Crítica'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">{inc.description}</td>
                  <td className="p-3 text-slate-400">{inc.reportedBy}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleResendWhatsApp(inc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
