import React, { useState } from 'react';
import { Coins, Download, Plus, Trash2, X, TrendingUp, DollarSign } from 'lucide-react';
import { Microcredit } from '../types';

interface MicrocreditPageProps {
  credits: Microcredit[];
  onAddCredit: (credit: Microcredit) => void;
  onDeleteCredit: (id: string) => void;
  onExportExcel: () => void;
}

export const MicrocreditPage: React.FC<MicrocreditPageProps> = ({
  credits,
  onAddCredit,
  onDeleteCredit,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entrepreneurName, setEntrepreneurName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('Morococha');
  const [creditAmountSoles, setCreditAmountSoles] = useState<number>(5000);
  const [repaymentStatus, setRepaymentStatus] = useState<'Al Día' | 'En Cuotas' | 'Completado'>('Al Día');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entrepreneurName || !businessName) {
      alert('Complete el nombre del emprendedor y negocio.');
      return;
    }

    const newCredit: Microcredit = {
      id: `MIC-${Date.now().toString().slice(-4)}`,
      entrepreneurName,
      businessName,
      location,
      creditAmountSoles,
      repaymentStatus,
    };

    onAddCredit(newCredit);
    setEntrepreneurName('');
    setBusinessName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <Coins className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Emprendimiento Local y Microcréditos</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fondo de microcréditos y asesoría para emprendimientos comunales sostenibles en el área de influencia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nuevo Microcrédito
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Microcréditos (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100">Fondo de Emprendedores Comunales</h3>
          <span className="text-xs text-amber-400 font-mono font-bold">Total: {credits.length} créditos</span>
        </div>

        {credits.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <Coins className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No hay microcréditos otorgados.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
            >
              + Otorgar primer microcrédito
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID Crédito</th>
                  <th className="p-3">Emprendedor(a)</th>
                  <th className="p-3">Negocio / Proyecto</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">Monto Financiamiento (S/)</th>
                  <th className="p-3">Estado Devolución</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {credits.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{c.id}</td>
                    <td className="p-3 font-semibold text-slate-100">{c.entrepreneurName}</td>
                    <td className="p-3 text-amber-300 font-bold">{c.businessName}</td>
                    <td className="p-3 text-slate-300">{c.location}</td>
                    <td className="p-3 font-mono font-black text-amber-400 text-sm">
                      S/ {c.creditAmountSoles.toLocaleString('es-PE')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {c.repaymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteCredit(c.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-100">Registrar Microcrédito Emprendedor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Emprendedor(a):</label>
                <input
                  type="text"
                  value={entrepreneurName}
                  onChange={(e) => setEntrepreneurName(e.target.value)}
                  placeholder="Ej: Juana Hinojosa"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Negocio / Proyecto:</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: Panadería Comunal El Sol"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ubicación / Comunidad:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Monto Financiamiento (S/):</label>
                  <input
                    type="number"
                    value={creditAmountSoles}
                    onChange={(e) => setCreditAmountSoles(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Estado de Devolución:</label>
                <select
                  value={repaymentStatus}
                  onChange={(e) => setRepaymentStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Al Día">Al Día</option>
                  <option value="En Cuotas">En Cuotas</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-button font-black rounded-lg text-xs"
                >
                  Guardar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

