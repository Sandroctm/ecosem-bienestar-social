import React, { useState } from 'react';
import {
  UserPlus,
  QrCode,
  Download,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  PhoneCall,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Worker } from '../types';
import { QRBadgeGenerator } from '../components/QRBadgeGenerator';
import { exportToExcel } from '../utils/excelExport';

interface WorkersManagementPageProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => void;
  onLoadDemoData: () => void;
}

export const WorkersManagementPage: React.FC<WorkersManagementPageProps> = ({
  workers,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker,
  onLoadDemoData,
}) => {
  const [selectedWorkerForBadge, setSelectedWorkerForBadge] = useState<Worker | null>(null);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [dni, setDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [camp, setCamp] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('51987654321');
  const [photoBase64, setPhotoBase64] = useState<string>('');

  // Handle local file upload from device
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEditWorker = (w: Worker) => {
    setEditingWorkerId(w.id);
    setDni(w.dni);
    setFullName(w.fullName);
    setCompany(w.company);
    setRole(w.role);
    setCamp(w.camp);
    setRoomNumber(w.roomNumber || '');
    setPhoneWhatsApp(w.phoneWhatsApp || '51987654321');
    setPhotoBase64(w.photoUrl || '');
    // Scroll form into view
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingWorkerId(null);
    setDni('');
    setFullName('');
    setCompany('');
    setRole('');
    setCamp('');
    setRoomNumber('');
    setPhoneWhatsApp('51987654321');
    setPhotoBase64('');
  };

  const handleSubmitNewWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || !fullName || !company || !role || !camp) {
      alert('Por favor complete los campos obligatorios (DNI, Nombres, Empresa, Cargo y Campamento).');
      return;
    }

    const cleanDni = dni.trim();
    const qrCodeValue = `ECOSEM:${cleanDni}:${fullName.toUpperCase().replace(/\s+/g, '_')}`;

    // Default fallback photo if no device photo uploaded
    const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

    if (editingWorkerId) {
      const updatedWorker: Worker = {
        id: editingWorkerId,
        dni: cleanDni,
        fullName: fullName.trim(),
        company: company.trim(),
        role: role.trim(),
        camp: camp.trim(),
        roomNumber: roomNumber.trim() || undefined,
        photoUrl: photoBase64 || defaultPhoto,
        phoneWhatsApp: phoneWhatsApp.trim(),
        status: 'Activo',
        qrCodeValue,
      };
      onUpdateWorker(updatedWorker);
      setEditingWorkerId(null);
    } else {
      const newWorker: Worker = {
        id: `W-${Date.now().toString().slice(-4)}`,
        dni: cleanDni,
        fullName: fullName.trim(),
        company: company.trim(),
        role: role.trim(),
        camp: camp.trim(),
        roomNumber: roomNumber.trim() || undefined,
        photoUrl: photoBase64 || defaultPhoto,
        phoneWhatsApp: phoneWhatsApp.trim(),
        status: 'Activo',
        qrCodeValue,
      };
      onAddWorker(newWorker);
    }

    // Reset Form
    setDni('');
    setFullName('');
    setCompany('');
    setRole('');
    setCamp('');
    setRoomNumber('');
    setPhoneWhatsApp('51987654321');
    setPhotoBase64('');
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.dni.includes(searchTerm) ||
      w.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.camp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    exportToExcel(workers, 'Padron_Personal_ECOSEM', 'Personal Registrado');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Gestión y Registro de Personal Minero</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alta de colaboradores, carga de foto directamente desde el dispositivo y registro manual de campamentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {workers.length === 0 && (
            <button
              onClick={onLoadDemoData}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
            >
              ⚡ Cargar Personal de Ejemplo
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Padrón (.xlsx)
          </button>
        </div>
      </div>

      {/* Form: Register New Worker */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-amber-400" />
          Ingresar Datos de Nuevo Personal
        </h3>

        <form onSubmit={handleSubmitNewWorker} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">DNI del Trabajador *:</label>
              <input
                type="text"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej: 45892011"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nombres y Apellidos *:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez Ramírez"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Empresa Contratista *:</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej: Consorcio Minero Arequipa"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cargo / Rol *:</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ej: Supervisor de Operaciones"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            
            {/* MANUAL CAMP ENTRY REQUIREMENT */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Campamento Minero *:
              </label>
              <select
                value={[
                  'Hotel Centro', 'Diana', 'Posada del Minero', 'Campamento 4', 'San Cristóbal',
                  'Andaychagua', 'Carahuacra', 'Ticuaco', 'Pucará Central', 'Morococha Central', 'Pabellón VIP'
                ].includes(camp) ? camp : (camp === '' ? '' : 'Otro')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Otro') {
                    setCamp('Nuevo Campamento');
                  } else {
                    setCamp(val);
                  }
                }}
                className="w-full p-2.5 bg-slate-950 border border-amber-500/40 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 font-bold"
                required
              >
                <option value="">-- Seleccionar --</option>
                <option value="Hotel Centro">Hotel Centro</option>
                <option value="Diana">Diana</option>
                <option value="Posada del Minero">Posada del Minero</option>
                <option value="Campamento 4">Campamento 4</option>
                <option value="San Cristóbal">San Cristóbal</option>
                <option value="Andaychagua">Andaychagua</option>
                <option value="Carahuacra">Carahuacra</option>
                <option value="Ticuaco">Ticuaco</option>
                <option value="Pucará Central">Pucará Central</option>
                <option value="Morococha Central">Morococha Central</option>
                <option value="Pabellón VIP">Pabellón VIP</option>
                <option value="Otro">Otro (Ingreso manual)...</option>
              </select>
              
              {!['Hotel Centro', 'Diana', 'Posada del Minero', 'Campamento 4', 'San Cristóbal', 'Andaychagua', 'Carahuacra', 'Ticuaco', 'Pucará Central', 'Morococha Central', 'Pabellón VIP'].includes(camp) && camp !== '' && (
                <input
                  type="text"
                  value={camp === 'Nuevo Campamento' ? '' : camp}
                  onChange={(e) => setCamp(e.target.value)}
                  placeholder="Ej: Campamento Norte / Central"
                  className="w-full mt-2 p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 font-bold"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">N° Habitación / Cuarto (Asignar):</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Ej: HAB. 502 / A-204"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-bold focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">N° WhatsApp de Contacto:</label>
              <input
                type="text"
                value={phoneWhatsApp}
                onChange={(e) => setPhoneWhatsApp(e.target.value)}
                placeholder="51987654321"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
              />
            </div>

            {/* DEVICE LOCAL IMAGE UPLOAD REQUIREMENT */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Subir Foto desde el Dispositivo:
              </label>
              
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-950 border border-amber-500/40 hover:border-amber-400 rounded-lg text-amber-300 cursor-pointer font-bold transition-all text-xs">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{photoBase64 ? 'Cambiar Foto' : 'Seleccionar Archivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoBase64 && (
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-amber-400 shrink-0">
                    <img src={photoBase64} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingWorkerId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancelar Edición
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gold-button text-xs font-black shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              {editingWorkerId ? 'Guardar Cambios del Personal' : 'Registrar Personal y Generar Fotocheck QR'}
            </button>
          </div>
        </form>
      </div>

      {/* Registered Workers Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Padrón de Personal Registrado</h3>
            <p className="text-[11px] text-slate-400">Total: {workers.length} colaboradores dados de alta</p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
            <Users className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold">No hay personal registrado en el padrón.</p>
            <p className="text-xs text-slate-500">Ingrese los datos en el formulario superior indicando la foto de su dispositivo y campamento manual.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Foto</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Nombres y Apellidos</th>
                  <th className="p-3">Empresa Contratista</th>
                  <th className="p-3">Cargo / Rol</th>
                  <th className="p-3">Campamento</th>
                  <th className="p-3">N° Cuarto</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3 text-center">Fotocheck QR</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWorkers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3">
                      <img
                        src={w.photoUrl}
                        alt={w.fullName}
                        className="w-10 h-10 rounded-lg object-cover border border-amber-500/40 shadow-sm"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">{w.dni}</td>
                    <td className="p-3 font-semibold text-slate-100">{w.fullName}</td>
                    <td className="p-3 text-slate-300">{w.company}</td>
                    <td className="p-3 text-amber-300 font-medium">{w.role}</td>
                    <td className="p-3 text-slate-400 font-bold">{w.camp}</td>
                    <td className="p-3 font-bold text-amber-400">{w.roomNumber || '—'}</td>
                    <td className="p-3 font-mono text-slate-400">{w.phoneWhatsApp}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedWorkerForBadge(w)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all text-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Ver QR Pass
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStartEditWorker(w)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors font-bold text-xs flex items-center gap-1"
                          title="Editar datos de este trabajador"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => onDeleteWorker(w.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Badge Modal */}
      {selectedWorkerForBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative">
            <QRBadgeGenerator
              worker={selectedWorkerForBadge}
              onClose={() => setSelectedWorkerForBadge(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
