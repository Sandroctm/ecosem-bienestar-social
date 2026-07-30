import React, { useState } from 'react';
import {
  BedDouble,
  Building,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Search,
  Filter,
  RefreshCw,
  Bot,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  Building2,
} from 'lucide-react';
import { Room, RoomStatus, Pabellon, Worker, BedSheetAlert } from '../types';
import { AICopilotModal } from '../components/AICopilotModal';
import { exportToExcel } from '../utils/excelExport';

interface RoomManagementPageProps {
  rooms: Room[];
  pabellones: Pabellon[];
  workers: Worker[];
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onUpdateLinenChange: (roomId: string) => void;
  onOpenAICopilot: () => void;
}

export const RoomManagementPage: React.FC<RoomManagementPageProps> = ({
  rooms,
  pabellones,
  workers,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onUpdateLinenChange,
  onOpenAICopilot,
}) => {
  const [selectedPabellonFilter, setSelectedPabellonFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New Room Form state
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [pabellonInput, setPabellonInput] = useState(pabellones[0]?.name || 'Pabellón A');
  const [floorInput, setFloorInput] = useState<number>(1);
  const [capacityInput, setCapacityInput] = useState<number>(2);
  const [statusInput, setStatusInput] = useState<RoomStatus>('Libre');
  const [occupantDniInput, setOccupantDniInput] = useState('');

  // Auto calculations for statistics & KPIs
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedRooms = rooms.filter((r) => r.status === 'Ocupado');
  const occupiedBeds = occupiedRooms.reduce((acc, r) => acc + r.capacity, 0);
  const freeRooms = rooms.filter((r) => r.status === 'Libre');
  const freeBeds = totalBeds - occupiedBeds;
  const totalHospedados = occupiedRooms.length;

  // Bed sheets alerts logic (>= 14 days)
  const today = new Date();
  const bedSheetAlerts: BedSheetAlert[] = rooms.map((r) => {
    const lastChange = new Date(r.lastLinenChangeDate);
    const diffDays = Math.floor((today.getTime() - lastChange.getTime()) / (1000 * 3600 * 24));
    return {
      roomId: r.id,
      roomNumber: r.roomNumber,
      pabellon: r.pabellon,
      daysSinceLastChange: diffDays,
      isRedAlert: diffDays >= 14 || r.status === 'Limpieza',
    };
  });

  const redAlertsCount = bedSheetAlerts.filter((a) => a.isRedAlert).length;

  // Filtered rooms for grid & table
  const filteredRooms = rooms.filter((r) => {
    const matchesPabellon = selectedPabellonFilter === 'Todos' || r.pabellon === selectedPabellonFilter;
    const matchesStatus = statusFilter === 'Todos' || r.status === statusFilter;
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pabellon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.currentOccupantName && r.currentOccupantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.occupantCompany && r.occupantCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesPabellon && matchesStatus && matchesSearch;
  });

  const handleStartEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumberInput(room.roomNumber);
    setPabellonInput(room.pabellon);
    setFloorInput(room.floor);
    setCapacityInput(room.capacity);
    setStatusInput(room.status);
    setOccupantDniInput(room.currentOccupantDni || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumberInput.trim()) return;

    let occupantName = undefined;
    let occupantCompany = undefined;

    if (occupantDniInput) {
      const foundWorker = workers.find((w) => w.dni === occupantDniInput.trim());
      if (foundWorker) {
        occupantName = foundWorker.fullName;
        occupantCompany = foundWorker.company;
      }
    }

    if (editingRoom) {
      const updated: Room = {
        ...editingRoom,
        roomNumber: roomNumberInput.trim(),
        pabellon: pabellonInput,
        floor: floorInput,
        capacity: capacityInput,
        status: statusInput,
        currentOccupantDni: occupantDniInput.trim() || undefined,
        currentOccupantName: occupantName || editingRoom.currentOccupantName,
        occupantCompany: occupantCompany || editingRoom.occupantCompany,
      };
      onUpdateRoom(updated);
    } else {
      const newRoom: Room = {
        id: `R-${Date.now().toString().slice(-4)}`,
        roomNumber: roomNumberInput.trim(),
        pabellon: pabellonInput,
        floor: floorInput,
        capacity: capacityInput,
        status: statusInput,
        currentOccupantDni: occupantDniInput.trim() || undefined,
        currentOccupantName: occupantName,
        occupantCompany: occupantCompany,
        lastLinenChangeDate: new Date().toISOString().split('T')[0],
      };
      onAddRoom(newRoom);
    }

    // Reset Form
    setIsFormOpen(false);
    setEditingRoom(null);
    setRoomNumberInput('');
    setOccupantDniInput('');
    setStatusInput('Libre');
  };

  // Color mapping helper for Room Status
  const getStatusColorBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Libre':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          icon: '🟢',
        };
      case 'Ocupado':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          icon: '🔴',
        };
      case 'Limpieza':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          icon: '🟡',
        };
      case 'Reservado':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
          icon: '🔵',
        };
      case 'Mantenimiento':
        return {
          bg: 'bg-slate-700/50 text-slate-300 border-slate-600',
          dot: 'bg-slate-400',
          icon: '⚫',
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & IA Copilot trigger */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
              Gestión Integral de Alojamiento
            </span>
            <span className="text-xs text-emerald-400 font-semibold">ECOSEM Bienestar Social</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 mt-2">
            Plano de Campamento y <span className="gold-gradient-text">Control de Habitaciones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Visualización gráfica por pabellones, control biológico de capacidad de camas, alertas de sábanas a 14 días y asistente de Inteligencia Artificial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAICopilot}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gold-button text-xs font-black shadow-lg animate-pulse-glow"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            Preguntar a la IA Copilot
          </button>

          <button
            onClick={() => exportToExcel(rooms, 'Control_Habitaciones_ECOSEM', 'Habitaciones')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30"
          >
            Exportar Cuartos (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border border-emerald-500/30">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Hospedados</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalHospedados} Pers.</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">En {occupiedRooms.length} habitaciones</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-blue-500/30">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Camas Ocupadas / Libres</span>
          <div className="text-2xl font-black text-slate-100 mt-1">
            <span className="text-rose-400">{occupiedBeds}</span> / <span className="text-emerald-400">{freeBeds}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Capacidad total: {totalBeds} camas</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-emerald-500/30">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Cuartos Libres</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{freeRooms.length} Cuartos</div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block">Disponibilidad inmediata 🟢</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-rose-500/30">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Alertas de Sábanas (14D)</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{redAlertsCount} Alertas</div>
          <span className="text-[10px] text-rose-300 mt-0.5 block">Requiere cambio urgente 🔴</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-500/30 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Promedio Ocupación</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {rooms.length > 0 ? Math.round((occupiedRooms.length / rooms.length) * 100) : 0}%
          </div>
          <span className="text-[10px] text-amber-300 mt-0.5 block">Eficiencia de campamento</span>
        </div>
      </div>

      {/* Bed Sheets Alert Section (Cambio de Sábanas Bienestar Social) */}
      {redAlertsCount > 0 && (
        <div className="bg-rose-500/10 border-2 border-rose-500/40 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <span>ALERTA DE BIENESTAR SOCIAL: {redAlertsCount} HABITACIONES REQUIEREN CAMBIO DE SÁBANAS (&gt;= 14 DÍAS)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {bedSheetAlerts.filter(a => a.isRedAlert).map((alert) => (
              <div key={alert.roomId} className="bg-slate-900 border border-rose-500/40 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-100 text-sm">Habitación {alert.roomNumber}</div>
                  <div className="text-[10px] text-slate-400">{alert.pabellon}</div>
                  <div className="text-rose-400 font-bold text-xs mt-1">Hace {alert.daysSinceLastChange} días</div>
                </div>
                <button
                  onClick={() => onUpdateLinenChange(alert.roomId)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[10px] shadow hover:bg-emerald-400 transition-all"
                >
                  Marcar Cambio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Camp Floor Plan (Plano del Campamento) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              Plano de Pabellones y Habitaciones del Campamento
            </h3>
            <p className="text-xs text-slate-400">Haga clic en cualquier habitación para cambiar su estado o ver detalles del trabajador</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPabellonFilter}
              onChange={(e) => setSelectedPabellonFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
            >
              <option value="Todos">Todos los Pabellones</option>
              {pabellones.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Libre">🟢 Libre</option>
              <option value="Ocupado">🔴 Ocupado</option>
              <option value="Limpieza">🟡 Limpieza</option>
              <option value="Reservado">🔵 Reservado</option>
              <option value="Mantenimiento">⚫ Mantenimiento</option>
            </select>

            <button
              onClick={() => {
                setEditingRoom(null);
                setIsFormOpen(!isFormOpen);
              }}
              className="px-3.5 py-1.5 rounded-xl gold-button text-xs font-black shadow-md flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Crear Habitación
            </button>
          </div>
        </div>

        {/* Legend color status bar */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400">🟢 Libre</span>
          <span className="flex items-center gap-1.5 text-rose-400">🔴 Ocupado</span>
          <span className="flex items-center gap-1.5 text-amber-400">🟡 Limpieza</span>
          <span className="flex items-center gap-1.5 text-blue-400">🔵 Reservado</span>
          <span className="flex items-center gap-1.5 text-slate-400">⚫ Mantenimiento</span>
        </div>

        {/* Pabellones Grid */}
        <div className="space-y-6">
          {pabellones.map((pab) => {
            const roomsInPab = filteredRooms.filter((r) => r.pabellon === pab.name);
            if (selectedPabellonFilter !== 'Todos' && selectedPabellonFilter !== pab.name) return null;

            return (
              <div key={pab.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> {pab.name} — <span className="text-slate-400 font-normal text-xs">{pab.description}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono">{roomsInPab.length} Cuartos</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {roomsInPab.map((r) => {
                    const statusBadge = getStatusColorBadge(r.status);
                    const lastChangeDate = new Date(r.lastLinenChangeDate);
                    const daysLinen = Math.floor((today.getTime() - lastChangeDate.getTime()) / (1000 * 3600 * 24));
                    const isLinenAlert = daysLinen >= 14;

                    return (
                      <div
                        key={r.id}
                        onClick={() => handleStartEdit(r)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 relative ${statusBadge.bg} shadow-md`}
                      >
                        {isLinenAlert && (
                          <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-white animate-pulse">
                            SÁBANAS ⚠️
                          </span>
                        )}

                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-sm text-slate-100">Hab. {r.roomNumber}</span>
                          <span className="text-xs">{statusBadge.icon}</span>
                        </div>

                        <div className="text-[10px] font-semibold text-slate-300">
                          Piso {r.floor} • Cap: {r.capacity} camas
                        </div>

                        {r.status === 'Ocupado' && r.currentOccupantName ? (
                          <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
                            <div className="font-bold text-slate-100 truncate">{r.currentOccupantName}</div>
                            <div className="text-[9px] text-slate-400 truncate">{r.occupantCompany}</div>
                          </div>
                        ) : (
                          <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] font-bold text-emerald-300">
                            {r.status}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRUD Add/Edit Room Modal Form */}
      {isFormOpen && (
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-amber-400" />
              {editingRoom ? `Editar Habitación ${editingRoom.roomNumber}` : 'Crear Nueva Habitación'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-xs text-slate-400 hover:text-white font-bold">
              Cerrar ×
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">N° Habitación / Cuarto *:</label>
              <input
                type="text"
                placeholder="Ej: 101 / HAB. 502"
                value={roomNumberInput}
                onChange={(e) => setRoomNumberInput(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Pabellón *:</label>
              <select
                value={pabellonInput}
                onChange={(e) => setPabellonInput(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold"
              >
                {pabellones.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Piso *:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={floorInput}
                onChange={(e) => setFloorInput(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Capacidad Camas *:</label>
              <input
                type="number"
                min="1"
                max="6"
                value={capacityInput}
                onChange={(e) => setCapacityInput(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Estado de Habitación *:</label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value as RoomStatus)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-bold"
              >
                <option value="Libre">🟢 Libre</option>
                <option value="Ocupado">🔴 Ocupado</option>
                <option value="Limpieza">🟡 Limpieza</option>
                <option value="Reservado">🔵 Reservado</option>
                <option value="Mantenimiento">⚫ Mantenimiento</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Asignar DNI Trabajador:</label>
              <input
                type="text"
                maxLength={8}
                placeholder="DNI Ocupante"
                value={occupantDniInput}
                onChange={(e) => setOccupantDniInput(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
              />
            </div>

            <div className="sm:col-span-3 lg:col-span-6 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 gold-button text-xs font-black rounded-xl shadow-md"
              >
                {editingRoom ? 'Guardar Cambios de Habitación' : 'Crear Habitación'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
