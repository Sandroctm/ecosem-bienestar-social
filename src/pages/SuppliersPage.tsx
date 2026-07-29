import React, { useState } from 'react';
import { ShoppingBag, Download, Plus, Trash2, X, Store, CheckCircle2 } from 'lucide-react';
import { SupplierOrder } from '../types';

interface SuppliersPageProps {
  suppliers: SupplierOrder[];
  onAddSupplier: (order: SupplierOrder) => void;
  onDeleteSupplier: (id: string) => void;
  onExportExcel: () => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({
  suppliers,
  onAddSupplier,
  onDeleteSupplier,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [category, setCategory] = useState<'Alimentación Local' | 'Lavandería' | 'Mantenimiento' | 'Insumos Comunitarios'>('Alimentación Local');
  const [community, setCommunity] = useState('Comunidad Pucará');
  const [orderValueSoles, setOrderValueSoles] = useState<number>(4500);
  const [status, setStatus] = useState<'Entregado' | 'En Proceso' | 'Orden Emitida'>('Orden Emitida');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName) {
      alert('Ingrese el nombre del proveedor.');
      return;
    }

    const newOrder: SupplierOrder = {
      id: `OC-${Date.now().toString().slice(-4)}`,
      supplierName,
      category,
      community,
      orderValueSoles,
      status,
    };

    onAddSupplier(newOrder);
    setSupplierName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Compras y Proveedores Locales (ECUSEM)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Catálogo de proveedores comunitarios, dinamización de economía local y ordenamiento de compras mineras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nueva Orden de Compra
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Proveedores (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100">Órdenes a Proveedores Comunitarios</h3>
          <span className="text-xs text-amber-400 font-mono font-bold">Total: {suppliers.length} órdenes</span>
        </div>

        {suppliers.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <Store className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No hay órdenes a proveedores registradas.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
            >
              + Generar primera orden
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID Orden</th>
                  <th className="p-3">Proveedor Comunitario</th>
                  <th className="p-3">Rubro / Servicio</th>
                  <th className="p-3">Comunidad de Origen</th>
                  <th className="p-3">Monto Orden (S/)</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{s.id}</td>
                    <td className="p-3 font-semibold text-slate-100">{s.supplierName}</td>
                    <td className="p-3 text-amber-300 font-bold">{s.category}</td>
                    <td className="p-3 text-slate-300">{s.community}</td>
                    <td className="p-3 font-mono font-black text-amber-400 text-sm">
                      S/ {s.orderValueSoles.toLocaleString('es-PE')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteSupplier(s.id)}
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
              <h3 className="font-black text-sm text-slate-100">Nueva Orden de Compra Local</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Proveedor / Empresa Comunal:</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ej: Asociación de Lavanderías Pucará"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rubro / Servicio:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Alimentación Local">Alimentación Local</option>
                    <option value="Lavandería">Lavandería</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Insumos Comunitarios">Insumos Comunitarios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Comunidad Origen:</label>
                  <input
                    type="text"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Monto Orden Soles (S/):</label>
                  <input
                    type="number"
                    value={orderValueSoles}
                    onChange={(e) => setOrderValueSoles(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Estado Orden:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Orden Emitida">Orden Emitida</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
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
                  Emitir Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

