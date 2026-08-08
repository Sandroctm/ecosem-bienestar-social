import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle, FileText, Pickaxe, Upload, Camera, Plus, Trash2 } from 'lucide-react';
import { RoomHandover, Worker, CustomRoomItem } from '../types';

interface RoomDeliveryDocumentModalProps {
  handover: RoomHandover | null;
  workers: Worker[];
  isOpen: boolean;
  onClose: () => void;
  onSaveHandover: (handover: RoomHandover) => void;
}

export const RoomDeliveryDocumentModal: React.FC<RoomDeliveryDocumentModalProps> = ({
  handover: initialHandover,
  workers,
  isOpen,
  onClose,
  onSaveHandover,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<RoomHandover>(
    initialHandover || {
      id: `RH-${Date.now().toString().slice(-4)}`,
      handoverNumber: `ACTA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      workerDni: workers[0]?.dni || '45892011',
      workerName: workers[0]?.fullName || 'Juan Pérez Ramírez',
      company: workers[0]?.company || 'Consorcio Minero Arequipa',
      camp: workers[0]?.camp || 'Campamento Norte - Las Bambas',
      roomNumber: 'A-204',

      // Quantitative items
      bedsCount: 1,
      mattressesCount: 1,
      linensCount: 2,
      pillowsCount: 1,
      keyCardsCount: 1,
      remotesCount: 1,
      customItems: [
        { name: 'Mueble Escritorio & Silla', quantity: 1 },
        { name: 'Toallas de Baño', quantity: 2 },
      ],

      // Room Photo from Device
      roomPhotoUrl: '',

      bedState: 'Conforme',
      mattressState: 'Conforme',
      linenState: 'Conforme',
      keyCardState: 'Entregado',
      acHeaterState: 'Operativo',
      physicalRoomState: 'Excelente',
      observations: 'Habitación entregada limpia con inventario verificado en fotografía adjunta.',
      supervisorName: 'Ing. Carlos Mendoza (Jefe de Residencia)',
      status: 'Entregado',
    }
  );

  // New Custom Item inputs
  const [newCustomItemName, setNewCustomItemName] = useState('');
  const [newCustomItemQty, setNewCustomItemQty] = useState<number>(1);

  // Handle uploading room photo from device
  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, roomPhotoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomItem = () => {
    if (!newCustomItemName.trim()) return;
    const newItem: CustomRoomItem = {
      name: newCustomItemName.trim(),
      quantity: newCustomItemQty,
    };
    setFormData({
      ...formData,
      customItems: [...(formData.customItems || []), newItem],
    });
    setNewCustomItemName('');
    setNewCustomItemQty(1);
  };

  const handleRemoveCustomItem = (index: number) => {
    const updated = [...(formData.customItems || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, customItems: updated });
  };

  const handleWorkerChange = (dni: string) => {
    const w = workers.find((item) => item.dni === dni);
    if (w) {
      setFormData({
        ...formData,
        workerDni: w.dni,
        workerName: w.fullName,
        company: w.company,
        camp: w.camp,
      });
    }
  };

  const handlePrint = () => {
    onSaveHandover(formData);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8">
        
        {/* Modal Toolbar (hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Acta de Entrega de Cuarto</h3>
              <p className="text-xs text-slate-400">Inventario cuantitativo de bienes y fotografía del cuarto entregado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold gold-button rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- FORM SECTION IN MODAL (hidden on print) --- */}
        <div className="space-y-4 no-print">
          
          {/* Worker & Camp Form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Trabajador Receptor:</label>
              <select
                value={formData.workerDni}
                onChange={(e) => handleWorkerChange(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.dni}>
                    {w.fullName} ({w.dni})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Número de Cuarto / Habitación *:</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold"
              />
            </div>

            {/* MANUAL CAMP ENTRY REQUIREMENT */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nombre del Campamento (Manual) *:</label>
              <input
                type="text"
                value={formData.camp}
                onChange={(e) => setFormData({ ...formData, camp: e.target.value })}
                placeholder="Ej: Campamento Las Bambas..."
                className="w-full p-2 bg-slate-900 border border-amber-500/40 rounded-lg text-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Supervisor de Entrega:</label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              />
            </div>
          </div>

          {/* QUANTITATIVE ITEM COUNTS REQUIREMENT */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>Inventario Cuantitativo de Cosas / Bienes Entregados:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">Camas / Camarotes:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedsCount}
                  onChange={(e) => setFormData({ ...formData, bedsCount: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded font-bold text-amber-300 text-center"
                />
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">Colchones:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.mattressesCount}
                  onChange={(e) => setFormData({ ...formData, mattressesCount: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded font-bold text-amber-300 text-center"
                />
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">Ropa de Cama / Frazadas:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.linensCount}
                  onChange={(e) => setFormData({ ...formData, linensCount: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded font-bold text-amber-300 text-center"
                />
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">Almohadas:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pillowsCount}
                  onChange={(e) => setFormData({ ...formData, pillowsCount: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded font-bold text-amber-300 text-center"
                />
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">Llaves / Tarjetas:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.keyCardsCount}
                  onChange={(e) => setFormData({ ...formData, keyCardsCount: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded font-bold text-amber-300 text-center"
                />
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <label className="block text-slate-400 font-medium mb-1">Controles Remotos:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.remotesCount}
                  onChange={(e) => setFormData({ ...formData, remotesCount: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded font-bold text-amber-300 text-center"
                />
              </div>
            </div>

            {/* Custom Extra Items Form */}
            <div className="pt-2">
              <label className="block text-slate-400 font-semibold mb-1 text-xs">Agregar Otros Bienes / Cosas Entregadas:</label>
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nombre de enser (Ej: Mueble Escritorio / Frigobar / Toallas...)"
                  value={newCustomItemName}
                  onChange={(e) => setNewCustomItemName(e.target.value)}
                  className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
                <input
                  type="number"
                  min="1"
                  value={newCustomItemQty}
                  onChange={(e) => setNewCustomItemQty(Number(e.target.value))}
                  className="w-20 p-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold text-center"
                />
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Item
                </button>
              </div>

              {formData.customItems && formData.customItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.customItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2"
                    >
                      <span>{item.name}: <strong className="text-amber-400">{item.quantity} ud(s)</strong></span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem(idx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ROOM PHOTO FROM DEVICE REQUIREMENT */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <label className="block text-amber-400 font-extrabold uppercase tracking-wider">
              Fotografía de Estado de Habitación (Subir desde Dispositivo):
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-xl cursor-pointer font-bold transition-all">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{formData.roomPhotoUrl ? 'Cambiar Foto del Cuarto' : 'Seleccionar Foto del Cuarto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRoomPhotoUpload}
                  className="hidden"
                />
              </label>

              {formData.roomPhotoUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={formData.roomPhotoUrl}
                    alt="Foto del Cuarto"
                    className="w-24 h-16 rounded-lg object-cover border-2 border-amber-400 shadow-md"
                  />
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Fotografía cargada correctamente
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- OFFICIAL PRINTABLE DOCUMENT FORMAT --- */}
        <div className="bg-white text-slate-900 p-6 print:p-0 rounded-xl border border-slate-300 shadow-xl space-y-3.5 print:space-y-2 text-xs print:text-[10.5px] font-sans print-only">
          
          {/* Header Document */}
          <div className="flex justify-between items-center border-b-2 border-amber-600 pb-2.5 print:pb-1.5 avoid-page-break">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 print:p-1 bg-amber-500 rounded-lg text-slate-950 font-black">
                <Pickaxe className="w-6 h-6 print:w-5 print:h-5" />
              </div>
              <div>
                <div className="text-lg print:text-base font-black tracking-wider text-slate-900">ECOSEM BIENESTAR SOCIAL</div>
                <div className="text-[10px] print:text-[9px] uppercase font-extrabold text-amber-700">ACTA REGISTRO DE CAMPAMENTOS Y ALOJAMIENTO</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs print:text-[10px] font-mono font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-300">
                {formData.handoverNumber}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fecha: <strong>{formData.date}</strong></div>
            </div>
          </div>

          <div className="text-center bg-slate-100 py-1.5 print:py-1 rounded font-bold uppercase tracking-wider text-slate-800 text-xs print:text-[10px] border border-slate-200 avoid-page-break">
            ACTA DE ENTREGA DE HABITACIÓN E INVENTARIO FOTOGRÁFICO DE ENSERES
          </div>

          {/* Summary KPIs Banner (Impresión Oficial) */}
          <div className="grid grid-cols-4 gap-1.5 text-[9px] print:text-[8.5px] text-center bg-emerald-50 p-2 print:p-1 rounded border border-emerald-300 font-mono avoid-page-break">
            <div>
              <span className="text-slate-500 font-bold block uppercase">TRABAJADORES HOSPEDADOS</span>
              <strong className="text-emerald-950 text-[11px] print:text-[10px]">8 Colaboradores</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase">CAMAS OCUPADAS</span>
              <strong className="text-rose-900 text-[11px] print:text-[10px]">12 Camas</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase">CAMAS DISPONIBLES</span>
              <strong className="text-emerald-900 text-[11px] print:text-[10px]">6 Camas Libres</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block uppercase">HABITACIONES LIBRES</span>
              <strong className="text-blue-900 text-[11px] print:text-[10px]">3 Habitaciones 🟢</strong>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 print:gap-2 text-xs print:text-[10px] bg-slate-50 p-3 print:p-2 rounded border border-slate-200 avoid-page-break">
            <div>
              <p><span className="font-bold text-slate-700">Trabajador Receptor:</span> {formData.workerName}</p>
              <p><span className="font-bold text-slate-700">DNI:</span> {formData.workerDni}</p>
              <p><span className="font-bold text-slate-700">Empresa Contratista:</span> {formData.company}</p>
            </div>
            <div>
              <p><span className="font-bold text-slate-700">Campamento Minero:</span> <strong className="text-slate-900">{formData.camp}</strong></p>
              <p><span className="font-bold text-slate-700">N° Habitación:</span> <span className="font-black text-amber-800 text-xs print:text-[11px]">{formData.roomNumber}</span></p>
              <p><span className="font-bold text-slate-700">Supervisor Responsable:</span> {formData.supervisorName}</p>
            </div>
          </div>

          {/* Inventory Quantitative Table */}
          <div className="avoid-page-break">
            <h4 className="font-bold text-xs print:text-[10px] uppercase tracking-wider text-slate-700 mb-1.5 avoid-break-after">
              Detalle Cuantitativo de Bienes y Cosas Entregadas:
            </h4>
            <table className="w-full text-xs print:text-[9.5px] text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-1.5 print:py-0.5 print:px-1.5 border-r border-slate-300">Bien / Enser Entregado</th>
                  <th className="p-1.5 print:py-0.5 print:px-1.5 border-r border-slate-300 text-center">Cantidad Recibida</th>
                  <th className="p-1.5 print:py-0.5 print:px-1.5 border-r border-slate-300">Estado Declarado</th>
                  <th className="p-1.5 print:py-0.5 print:px-1.5">Conformidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">Camas / Camarotes Mineros</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{formData.bedsCount} ud(s)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">{formData.bedState}</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                </tr>
                <tr>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">Colchones Ergonómicos</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{formData.mattressesCount} ud(s)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">{formData.mattressState}</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                </tr>
                <tr>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">Juegos de Ropa de Cama & Frazadas</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{formData.linensCount} ud(s)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">{formData.linenState}</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                </tr>
                <tr>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">Almohadas Antialérgicas</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{formData.pillowsCount} ud(s)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">Conforme</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                </tr>
                <tr>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">Llave / Tarjeta Magnética de Acceso</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{formData.keyCardsCount} ud(s)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">{formData.keyCardState}</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                </tr>
                <tr>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">Controles Remotos (TV / Clima)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{formData.remotesCount} ud(s)</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">{formData.acHeaterState}</td>
                  <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                </tr>
                {formData.customItems && formData.customItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-1.5 print:py-0.5 print:px-1.5 font-medium border-r border-slate-300">{item.name}</td>
                    <td className="p-1.5 print:py-0.5 print:px-1.5 font-black text-center border-r border-slate-300">{item.quantity} ud(s)</td>
                    <td className="p-1.5 print:py-0.5 print:px-1.5 font-bold text-emerald-700 border-r border-slate-300">Conforme</td>
                    <td className="p-1.5 print:py-0.5 print:px-1.5">☑ Conforme</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ROOM PHOTO EMBEDDED IN OFFICIAL DOCUMENT REQUIREMENT */}
          {formData.roomPhotoUrl && (
            <div className="avoid-page-break">
              <h4 className="font-bold text-xs print:text-[10px] uppercase tracking-wider text-slate-700 mb-1 avoid-break-after">
                Fotografía Registrada del Estado de la Habitación:
              </h4>
              <div className="p-1.5 print:p-1 bg-slate-100 border border-slate-300 rounded text-center">
                <img
                  src={formData.roomPhotoUrl}
                  alt="Fotografía de Entrega de Cuarto"
                  className="max-h-36 print:max-h-24 mx-auto rounded border border-slate-400 object-contain shadow-sm"
                />
                <p className="text-[9px] print:text-[8px] text-slate-500 mt-0.5 font-mono">
                  Evidencia fotográfica adjunta al acta de entrega en habitación {formData.roomNumber}
                </p>
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="avoid-page-break">
            <h4 className="font-bold text-xs print:text-[10px] uppercase tracking-wider text-slate-700 mb-0.5 avoid-break-after">Observaciones:</h4>
            <div className="p-2 print:p-1.5 bg-slate-50 border border-slate-200 rounded text-xs print:text-[9.5px] italic text-slate-700 min-h-[30px] print:min-h-[20px]">
              "{formData.observations}"
            </div>
          </div>

          {/* Signatures Area */}
          <div className="pt-6 print:pt-4 grid grid-cols-2 gap-8 print:gap-6 text-center text-xs print:text-[10px] avoid-page-break">
            <div className="border-t-2 border-slate-800 pt-1.5">
              <p className="font-bold text-slate-900">{formData.workerName}</p>
              <p className="text-slate-500">Firma del Trabajador (DNI: {formData.workerDni})</p>
            </div>
            <div className="border-t-2 border-slate-800 pt-1.5">
              <p className="font-bold text-slate-900">{formData.supervisorName}</p>
              <p className="text-slate-500">Firma Supervisor Residencia ECOSEM</p>
            </div>
          </div>

        </div>

        {/* Save button (hidden on print) */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800 no-print">
          <button
            onClick={() => {
              onSaveHandover(formData);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-button text-xs font-bold shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            Guardar y Confirmar Entrega
          </button>
        </div>

      </div>
    </div>
  );
};
