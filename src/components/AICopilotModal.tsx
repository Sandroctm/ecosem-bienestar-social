import React, { useState } from 'react';
import { Bot, Sparkles, Send, X, AlertTriangle, Building, BedDouble, CalendarCheck, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Room, Worker, IncidentReport, AttendanceRecord } from '../types';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  workers: Worker[];
  incidents: IncidentReport[];
  attendance: AttendanceRecord[];
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  rooms,
  workers,
  incidents,
  attendance,
}) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: '¡Hola! Soy tu **Asistente de IA ECOSEM**. Puedo responder preguntas sobre ocupación de habitaciones, sábanas pendientes, días hospedados por trabajador o incidentes de campamentos. Pruebas las sugerencias rápidas abajo.',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    '¿Qué habitaciones necesitan cambio de sábanas?',
    '¿Qué trabajadores tienen más de 30 días hospedados?',
    '¿Qué empresa tiene mayor ocupación?',
    'Muéstrame los incidentes del campamento Diana',
    '¿Cuántas habitaciones están libres hoy?',
  ];

  const processAIQuery = (input: string) => {
    const text = input.toLowerCase();
    let response = '';

    // Query 1: Cambio de sábanas
    if (text.includes('sábana') || text.includes('sabanas') || text.includes('limpieza')) {
      const today = new Date();
      const pending = rooms.filter((r) => {
        const lastChange = new Date(r.lastLinenChangeDate);
        const diffDays = Math.floor((today.getTime() - lastChange.getTime()) / (1000 * 3600 * 24));
        return diffDays >= 14 || r.status === 'Limpieza';
      });

      if (pending.length === 0) {
        response = '✅ **Excelente noticia:** Todas las habitaciones están al día con el cambio de sábanas (< 14 días).';
      } else {
        response = `⚠️ **Se encontraron ${pending.length} habitaciones que requieren cambio de sábanas (o están en limpieza):**\n\n` +
          pending.map((r) => {
            const diffDays = Math.floor((today.getTime() - new Date(r.lastLinenChangeDate).getTime()) / (1000 * 3600 * 24));
            return `• **Hab. ${r.roomNumber}** (${r.pabellon}) — Hace **${diffDays} días** sin cambio. ${r.currentOccupantName ? `Ocupante: ${r.currentOccupantName}` : ''}`;
          }).join('\n');
      }
    }
    // Query 2: Trabajadores con > 30 días hospedados
    else if (text.includes('30 días') || text.includes('30 dias') || text.includes('mas de 30') || text.includes('permanencia')) {
      const today = new Date();
      const longStayRooms = rooms.filter((r) => {
        if (!r.checkInDate) return false;
        const checkIn = new Date(r.checkInDate);
        const days = Math.floor((today.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
        return days >= 30;
      });

      if (longStayRooms.length === 0) {
        response = 'ℹ️ No se registraron trabajadores con más de 30 días continuos de estadía actualmente.';
      } else {
        response = `🏨 **Trabajadores con estadía prolongada (>= 30 días):**\n\n` +
          longStayRooms.map((r) => {
            const days = Math.floor((today.getTime() - new Date(r.checkInDate!).getTime()) / (1000 * 3600 * 24));
            return `• **${r.currentOccupantName}** (${r.occupantCompany}) — Hab. **${r.roomNumber}** (${r.pabellon}) — **${days} días hospedado**.`;
          }).join('\n');
      }
    }
    // Query 3: Ocupación por empresa
    else if (text.includes('empresa') || text.includes('contratista') || text.includes('mayor ocupación')) {
      const companyCount: Record<string, number> = {};
      rooms.filter(r => r.status === 'Ocupado' && r.occupantCompany).forEach(r => {
        companyCount[r.occupantCompany!] = (companyCount[r.occupantCompany!] || 0) + 1;
      });

      const sorted = Object.entries(companyCount).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) {
        response = 'ℹ️ No hay ocupación por empresas registrada en este momento.';
      } else {
        response = `📊 **Distribución de Habitaciones Ocupadas por Empresa:**\n\n` +
          sorted.map(([comp, count], i) => `${i + 1}. **${comp}**: ${count} habitación(es) ocupada(s)`).join('\n');
      }
    }
    // Query 4: Incidentes campamento Diana
    else if (text.includes('diana') || text.includes('incidente') || text.includes('reporte')) {
      const dianaIncidents = incidents.filter(i => i.campOrCommunity.toLowerCase().includes('diana') || text.includes(i.campOrCommunity.toLowerCase()));
      if (dianaIncidents.length === 0) {
        response = '🟢 **Sin incidentes:** No hay reportes registrados para el Campamento Diana o la zona seleccionada.';
      } else {
        response = `🚨 **Reporte de Incidentes Encontrados (${dianaIncidents.length}):**\n\n` +
          dianaIncidents.map(i => `• **[${i.severity}]** ${i.description} — *Reportado por ${i.reportedBy} (${i.status})*`).join('\n');
      }
    }
    // Query 5: Habitaciones Libres
    else if (text.includes('libre') || text.includes('disponible') || text.includes('vacante')) {
      const free = rooms.filter(r => r.status === 'Libre');
      response = `🟢 **Habitaciones Disponibles (${free.length}):**\n\n` +
        free.map(r => `• **Hab. ${r.roomNumber}** en ${r.pabellon} (Piso ${r.floor}, Capacidad: ${r.capacity} camas)`).join('\n');
    }
    // Fallback Inteligente
    else {
      const totalOccupied = rooms.filter(r => r.status === 'Ocupado').length;
      const totalFree = rooms.filter(r => r.status === 'Libre').length;
      response = `🤖 **Resumen del Campamento ECOSEM:**\n\n` +
        `• **Total Habitaciones:** ${rooms.length}\n` +
        `• **Habitaciones Ocupadas:** ${totalOccupied} 🔴\n` +
        `• **Habitaciones Libres:** ${totalFree} 🟢\n` +
        `• **Personal Registrado en Padrón:** ${workers.length} colaboradores.\n\n` +
        `Puedes preguntarme por sábanas pendientes, empresas contratistas o incidentes específicos.`;
    }

    setChatHistory((prev) => [
      ...prev,
      { sender: 'user', text: input },
      { sender: 'ai', text: response },
    ]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    processAIQuery(query.trim());
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full h-[600px] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                Asistente de IA ECOSEM <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-emerald-400">Consultas inteligentes sobre cuartos, sábanas y campamento</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message Window */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60 text-xs">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-semibold rounded-br-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-inner'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[10px]">
          <span className="text-slate-400 font-bold shrink-0">Sugerencias:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => processAIQuery(prompt)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Pregunta en lenguaje natural (ej: ¿Qué habitaciones necesitan limpieza?)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            Preguntar
          </button>
        </form>

      </div>
    </div>
  );
};
