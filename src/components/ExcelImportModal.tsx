import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Users,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Worker } from '../types';
import {
  downloadWorkerExcelTemplate,
  parseWorkersFromExcel,
  ExcelImportResult,
  ParsedWorkerRowPreview,
} from '../utils/excelImport';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingWorkers: Worker[];
  onImportWorkers: (newWorkers: Worker[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingWorkers,
  onImportWorkers,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Check extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileNameLower = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isValidExtension) {
      alert('Por favor seleccione un archivo Excel válido (.xlsx, .xls) o CSV (.csv).');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const result = await parseWorkersFromExcel(file, existingWorkers);
      setParseResult(result);
    } catch (err) {
      console.error('Error procesando archivo Excel:', err);
      alert('Hubo un error al leer el archivo Excel. Asegúrese de que no esté dañado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.parsedWorkers.length === 0) return;

    onImportWorkers(parseResult.parsedWorkers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                Carga Masiva de Personal desde Excel
              </h2>
              <p className="text-xs text-slate-400">
                Sube tu padrón en archivo Excel o CSV para registrar múltiples colaboradores automáticamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadWorkerExcelTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
              title="Descargar plantilla de ejemplo con formato correcto"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Plantilla (.xlsx)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Dropzone */}
          {!parseResult && !isProcessing && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-amber-500/50 bg-slate-950/40 hover:bg-slate-950/80'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="text-sm font-extrabold text-slate-200 mb-1">
                Arrastra tu archivo Excel aquí o haz clic para seleccionar
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Formatos permitidos: <span className="text-amber-300 font-semibold">.XLSX, .XLS, .CSV</span>.
                Columnas requeridas: DNI, Nombres y Apellidos, Empresa, Cargo y Campamento.
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-[11px] text-slate-300 font-medium">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                ¿No tienes la plantilla? Usa el botón "Descargar Plantilla (.xlsx)" en la esquina superior.
              </div>
            </div>
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-amber-400 animate-spin" />
              <p className="text-sm font-bold text-slate-200">Procesando y validando filas del Excel...</p>
              <p className="text-xs text-slate-400">Verificando DNI, duplicados y datos obligatorios.</p>
            </div>
          )}

          {/* Parsed Result & Validation Summary */}
          {parseResult && !isProcessing && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">{selectedFile?.name}</span>
                  <span className="text-slate-500">
                    ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Subir otro archivo
                </button>
              </div>

              {/* Stat Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Registros Válidos</span>
                  </div>
                  <span className="text-lg font-black">{parseResult.validCount}</span>
                </div>

                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>DNI Duplicados (Omitidos)</span>
                  </div>
                  <span className="text-lg font-black">{parseResult.duplicateCount}</span>
                </div>

                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-300">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Filas Incompletas</span>
                  </div>
                  <span className="text-lg font-black">{parseResult.errorCount}</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Vista Previa de Filas ({parseResult.previewRows.length} procesadas)
                </h4>

                <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Fila</th>
                        <th className="p-2.5">DNI</th>
                        <th className="p-2.5">Nombres y Apellidos</th>
                        <th className="p-2.5">Empresa</th>
                        <th className="p-2.5">Cargo</th>
                        <th className="p-2.5">Campamento</th>
                        <th className="p-2.5">Habitación</th>
                        <th className="p-2.5 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {parseResult.previewRows.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className={`transition-colors ${
                            row.status === 'valid'
                              ? 'hover:bg-slate-800/40'
                              : row.status === 'duplicate'
                              ? 'bg-amber-950/20 hover:bg-amber-950/40'
                              : 'bg-rose-950/20 hover:bg-rose-950/40'
                          }`}
                        >
                          <td className="p-2.5 text-slate-500 font-mono">#{row.rowIndex}</td>
                          <td className="p-2.5 font-mono font-bold text-amber-300">{row.dni}</td>
                          <td className="p-2.5 font-semibold text-slate-100">{row.fullName}</td>
                          <td className="p-2.5 text-slate-300">{row.company}</td>
                          <td className="p-2.5 text-slate-300">{row.role}</td>
                          <td className="p-2.5 text-amber-400 font-medium">{row.camp}</td>
                          <td className="p-2.5 text-slate-400">{row.roomNumber}</td>
                          <td className="p-2.5 text-center">
                            {row.status === 'valid' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Válido
                              </span>
                            )}
                            {row.status === 'duplicate' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]"
                                title={row.validationMessage}
                              >
                                <AlertTriangle className="w-3 h-3" /> Duplicado
                              </span>
                            )}
                            {row.status === 'invalid' && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]"
                                title={row.validationMessage}
                              >
                                <XCircle className="w-3 h-3" /> Incompleto
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancelar
          </button>

          {parseResult && (
            <button
              onClick={handleConfirmImport}
              disabled={parseResult.parsedWorkers.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                parseResult.parsedWorkers.length > 0
                  ? 'gold-button shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Confirmar e Importar ({parseResult.parsedWorkers.length}) Colaboradores
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
