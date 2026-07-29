import React, { useState } from 'react';
import { HeartPulse, Download, Plus, Trash2, X, Stethoscope, Heart } from 'lucide-react';
import { FamilyHealthRecord } from '../types';

interface FamilyHealthPageProps {
  records: FamilyHealthRecord[];
  onAddRecord: (record: FamilyHealthRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportExcel: () => void;
}

export const FamilyHealthPage: React.FC<FamilyHealthPageProps> = ({
  records,
  onAddRecord,
  onDeleteRecord,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [relationship, setRelationship] = useState<'Esposa' | 'Hijo/a' | 'Madre/Padre' | 'Titular'>('Esposa');
  const [dni, setDni] = useState('');
  const [clinicName, setClinicName] = useState('Clínica San José de Yauli');
  const [lastCheckupDate, setLastCheckupDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Al Día' | 'Chequeo Pendiente' | 'En Tratamiento'>('Al Día');
  const [medicalCondition, setMedicalCondition] = useState('Chequeo Odontológico Preventivo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryName || !dni) {
      alert('Por favor complete los datos obligatorios (Nombre y DNI).');
      return;
    }

    const newRecord: FamilyHealthRecord = {
      id: `SAL-${Date.now().toString().slice(-4)}`,
      beneficiaryName,
      relationship,
      dni,
      clinicName,
      lastCheckupDate,
      status,
      medicalCondition,
    };

    onAddRecord(newRecord);
    setBeneficiaryName('');
    setDni('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500 rounded-lg text-slate-950">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Bienestar y Salud Familiar Minero</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de salud preventiva y acceso garantizado a clínicas y puestos comunitarios para familiares de colaboradores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Registrar Familiar / Chequeo
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Salud (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100">Padrón de Beneficiarios de Salud Familiar</h3>
          <span className="text-xs text-amber-400 font-mono font-bold">Total: {records.length} beneficiarios</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <Heart className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No hay atenciones de salud registradas.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
            >
              + Registrar atención médica familiar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Beneficiario</th>
                  <th className="p-3">Parentesco</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Clínica / Puesto Asignado</th>
                  <th className="p-3">Último Chequeo</th>
                  <th className="p-3">Condición / Diagnóstico</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{r.beneficiaryName}</td>
                    <td className="p-3 text-amber-400 font-bold">{r.relationship}</td>
                    <td className="p-3 font-mono text-slate-400">{r.dni}</td>
                    <td className="p-3 text-slate-300">{r.clinicName}</td>
                    <td className="p-3 font-mono text-slate-400">{r.lastCheckupDate}</td>
                    <td className="p-3 text-slate-300">{r.medicalCondition}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteRecord(r.id)}
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

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-100">Registrar Atención de Salud Familiar</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre Completo del Beneficiario:</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Ej: Rosa Flores de Pérez"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Parentesco:</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Esposa">Esposa</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Madre/Padre">Madre/Padre</option>
                    <option value="Titular">Titular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">DNI Beneficiario:</label>
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej: 41239855"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Clínica / Puesto Asignado:</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Condición / Diagnóstico:</label>
                <input
                  type="text"
                  value={medicalCondition}
                  onChange={(e) => setMedicalCondition(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fecha Chequeo:</label>
                  <input
                    type="date"
                    value={lastCheckupDate}
                    onChange={(e) => setLastCheckupDate(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Estado:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Al Día">Al Día</option>
                    <option value="Chequeo Pendiente">Chequeo Pendiente</option>
                    <option value="En Tratamiento">En Tratamiento</option>
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
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

