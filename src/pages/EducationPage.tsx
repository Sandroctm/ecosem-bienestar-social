import React, { useState } from 'react';
import { GraduationCap, Download, Award, BookOpen, Plus, Trash2, X, CheckCircle2 } from 'lucide-react';
import { EducationScholarship } from '../types';

interface EducationPageProps {
  scholarships: EducationScholarship[];
  onAddScholarship: (scholarship: EducationScholarship) => void;
  onDeleteScholarship: (id: string) => void;
  onExportExcel: () => void;
}

export const EducationPage: React.FC<EducationPageProps> = ({
  scholarships,
  onAddScholarship,
  onDeleteScholarship,
  onExportExcel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [relationship, setRelationship] = useState<'Hijo/a' | 'Hermano/a' | 'Trabajador'>('Hijo/a');
  const [programType, setProgramType] = useState<'Beca Escolar' | 'Capacitación Técnica Local' | 'Universidad'>('Beca Escolar');
  const [institution, setInstitution] = useState('');
  const [academicPerformance, setAcademicPerformance] = useState('Ponderado 17.5 / Excelente');
  const [status, setStatus] = useState<'Activo' | 'Postulante' | 'Graduado'>('Activo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !institution) {
      alert('Por favor complete el nombre del estudiante e institución.');
      return;
    }

    const newItem: EducationScholarship = {
      id: `BEC-${Date.now().toString().slice(-4)}`,
      studentName,
      relationship,
      programType,
      institution,
      academicPerformance,
      status,
    };

    onAddScholarship(newItem);
    setStudentName('');
    setInstitution('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500 rounded-lg text-slate-950">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100">Educación y Capacitación Técnica</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Becas escolares, universitarias y programas de capacitación técnica para comunidades del área de influencia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nueva Beca / Inscripción
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            Exportar Becas (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-100">Padrón de Becarios y Estudiantes</h3>
          <span className="text-xs text-amber-400 font-mono font-bold">Total: {scholarships.length} registradas</span>
        </div>

        {scholarships.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No hay becas registradas todavía.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold gold-button rounded-xl"
            >
              + Registrar la primera beca
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[10px] uppercase font-bold bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Parentesco</th>
                  <th className="p-3">Programa</th>
                  <th className="p-3">Institución Educativa</th>
                  <th className="p-3">Rendimiento Académico</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{s.id}</td>
                    <td className="p-3 font-semibold text-slate-100">{s.studentName}</td>
                    <td className="p-3 text-amber-400 font-bold">{s.relationship}</td>
                    <td className="p-3 text-amber-300 font-medium">{s.programType}</td>
                    <td className="p-3 text-slate-300">{s.institution}</td>
                    <td className="p-3 font-semibold text-emerald-400">{s.academicPerformance}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteScholarship(s.id)}
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
              <h3 className="font-black text-sm text-slate-100">Registrar Nueva Beca / Capacitación</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre Completo del Estudiante:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ej: Lucas Quispe Flores"
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
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Hermano/a">Hermano/a</option>
                    <option value="Trabajador">Trabajador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Programa:</label>
                  <select
                    value={programType}
                    onChange={(e) => setProgramType(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  >
                    <option value="Beca Escolar">Beca Escolar</option>
                    <option value="Capacitación Técnica Local">Capacitación Técnica Local</option>
                    <option value="Universidad">Universidad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Institución Educativa:</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Ej: SENATI Morococha / UNSAAC"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Rendimiento / Calificación:</label>
                <input
                  type="text"
                  value={academicPerformance}
                  onChange={(e) => setAcademicPerformance(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Estado de Beca:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                >
                  <option value="Activo">Activo</option>
                  <option value="Postulante">Postulante</option>
                  <option value="Graduado">Graduado</option>
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
                  Guardar Beca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

