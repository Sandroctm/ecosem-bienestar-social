import React, { useState } from 'react';
import {
  BedDouble,
  FileText,
  Printer,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { RoomHandover, Worker } from '../types';
import { RoomDeliveryDocumentModal } from '../components/RoomDeliveryDocumentModal';

interface RoomDeliveryPageProps {
  handovers: RoomHandover[];
  workers: Worker[];
  onSaveHandover: (handover: RoomHandover) => void;
  onExportExcel: () => void;
}

export const RoomDeliveryPage: React.FC<RoomDeliveryPageProps> = ({
  handovers,
  workers,
  onSaveHandover,
  onExportExcel,
}) => {
  const [selectedHandover, setSelectedHandover] = useState<RoomHandover | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHandovers = handovers.filter(
    (h) =>
      h.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.handoverNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.camp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewDocument = () => {
    setSelectedHandover(null);
    setIsModalOpen(true);
  };

  const handleOpenExistingDocument = (handover: RoomHandover) => {
    setSelectedHandover(handover);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg text-slate-950">
              <BedDouble className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Entrega y Recepción de Cuartos / Habitaciones</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro de cantidad de cosas entregadas, fotografía de la habitación desde el dispositivo y campamentos manuales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNewDocument}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Nueva Acta de Entrega
          </button>
          
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Actas (.xlsx)
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Habitaciones Entregadas</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{handovers.length} Actas Registradas</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Inventario Fotográfico</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">Adjunto por Acta</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-blue-500/20">
          <span className="text-[10px] uppercase font-bold text-slate-400">Formatos Documento Emisor</span>
          <div className="text-xl font-extrabold text-blue-400 mt-1">ECOSEM Certificado</div>
        </div>
      </div>

      {/* Handover List Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-100">Registro General de Actas de Entrega</h3>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por N° Acta, trabajador o cuarto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {filteredHandovers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
            <BedDouble className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold">No hay actas de entrega registradas.</p>
            <p className="text-xs text-slate-500">Haga clic en "Nueva Acta de Entrega" para ingresar cantidad de cosas y foto del cuarto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Foto Cuarto</th>
                  <th className="p-3">N° Acta Documento</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Trabajador (DNI)</th>
                  <th className="p-3">Campamento (Manual)</th>
                  <th className="p-3">N° Cuarto</th>
                  <th className="p-3">Cosas Entregadas</th>
                  <th className="p-3 text-center">Acciones Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHandovers.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3">
                      {h.roomPhotoUrl ? (
                        <img
                          src={h.roomPhotoUrl}
                          alt="Foto Cuarto"
                          className="w-12 h-9 rounded object-cover border border-amber-500/40"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">{h.handoverNumber}</td>
                    <td className="p-3 font-mono text-slate-400">{h.date}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-100">{h.workerName}</div>
                      <div className="text-[10px] text-slate-400">DNI: {h.workerDni}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-200">{h.camp}</td>
                    <td className="p-3 font-bold text-amber-300 text-sm">{h.roomNumber}</td>
                    <td className="p-3">
                      <div className="text-[11px] font-bold text-slate-200">
                        {h.bedsCount || 1} Cama(s), {h.mattressesCount || 1} Colchón(es), {h.linensCount || 2} Ropa de Cama
                      </div>
                      {h.customItems && h.customItems.length > 0 && (
                        <div className="text-[10px] text-amber-400">
                          +{h.customItems.length} bienes extra
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenExistingDocument(h)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver Documento / Imprimir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Printable Modal */}
      <RoomDeliveryDocumentModal
        handover={selectedHandover}
        workers={workers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveHandover={onSaveHandover}
      />

    </div>
  );
};
