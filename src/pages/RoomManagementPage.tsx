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
  X,
  UserCheck,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  Table,
  Grid,
  UserMinus,
  CheckSquare
} from 'lucide-react';
import { Room, RoomStatus, Pabellon, Worker, BedSheetAlert } from '../types';
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

const REGISTERED_CAMPS_LIST = [
  'Sede Morococha - Unidad Toromocho',
  'Campamento Soledad',
  'Campamento Diana - Módulo A',
  'Campamento Diana - Módulo B',
  'Campamento Central',
  'Campamento Carhuacoto',
  'Campamento Tuctu',
  'Hotel Centro',
  'Posada del Minero',
  'San Cristóbal',
  'Andaychagua',
];

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCampFilter, setSelectedCampFilter] = useState<string>('Todos');
  const [selectedPabellonFilter, setSelectedPabellonFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // New/Edit Room Form state
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [campInput, setCampInput] = useState<string>('Sede Morococha - Unidad Toromocho');
  const [pabellonInput, setPabellonInput] = useState(pabellones[0]?.name || 'Pabellón A');
  const [floorInput, setFloorInput] = useState<number>(1);
  const [capacityInput, setCapacityInput] = useState<number>(2);
  const [statusInput, setStatusInput] = useState<RoomStatus>('Libre');
  const [occupantDniInput, setOccupantDniInput] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // New Pabellón modal state
  const [isNewPabellonModalOpen, setIsNewPabellonModalOpen] = useState(false);
  const [newPabellonName, setNewPabellonName] = useState('');
  const [newPabellonCamp, setNewPabellonCamp] = useState<string>('Sede Morococha - Unidad Toromocho');
  const [newPabellonDesc, setNewPabellonDesc] = useState('');

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
    const lastChange = new Date(r.lastLinenChangeDate || new Date());
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
    const matchesCamp =
      selectedCampFilter === 'Todos' ||
      (r.camp && r.camp.toLowerCase().includes(selectedCampFilter.toLowerCase())) ||
      (selectedCampFilter.includes('Morococha') && (!r.camp || r.camp.includes('Morococha')));
    const matchesPabellon = selectedPabellonFilter === 'Todos' || r.pabellon === selectedPabellonFilter;
    const matchesStatus = statusFilter === 'Todos' || r.status === statusFilter;
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pabellon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.camp && r.camp.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.currentOccupantName && r.currentOccupantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.occupantCompany && r.occupantCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.currentOccupantDni && r.currentOccupantDni.includes(searchTerm));

    return matchesCamp && matchesPabellon && matchesStatus && matchesSearch;
  });

  // Open modal for CREATING room
  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setRoomNumberInput('');
    setCampInput(selectedCampFilter !== 'Todos' ? selectedCampFilter : REGISTERED_CAMPS_LIST[0]);
    setPabellonInput(pabellones[0]?.name || 'Pabellón A');
    setFloorInput(1);
    setCapacityInput(2);
    setStatusInput('Libre');
    setOccupantDniInput('');
    setSelectedWorkerId('');
    setIsFormModalOpen(true);
  };

  // Open modal for EDITING room
  const handleStartEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumberInput(room.roomNumber);
    setCampInput(room.camp || REGISTERED_CAMPS_LIST[0]);
    setPabellonInput(room.pabellon);
    setFloorInput(room.floor);
    setCapacityInput(room.capacity);
    setStatusInput(room.status);
    setOccupantDniInput(room.currentOccupantDni || '');
    const matched = workers.find((w) => w.dni === room.currentOccupantDni);
    setSelectedWorkerId(matched?.id || '');
    setIsFormModalOpen(true);
  };

  // Worker dropdown selection sync
  const handleWorkerSelect = (workerId: string) => {
    setSelectedWorkerId(workerId);
    if (!workerId) {
      setOccupantDniInput('');
      return;
    }
    const found = workers.find((w) => w.id === workerId);
    if (found) {
      setOccupantDniInput(found.dni);
      if (statusInput === 'Libre') {
        setStatusInput('Ocupado');
      }
    }
  };

  // Submit Form (Create or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumberInput.trim()) {
      alert('Ingrese el número o identificador de la habitación.');
      return;
    }

    let occupantName = undefined;
    let occupantCompany = undefined;
    let occupantDni = occupantDniInput.trim() || undefined;

    if (selectedWorkerId) {
      const w = workers.find((item) => item.id === selectedWorkerId);
      if (w) {
        occupantName = w.fullName;
        occupantCompany = w.company;
        occupantDni = w.dni;
      }
    } else if (occupantDni) {
      const foundWorker = workers.find((w) => w.dni === occupantDni);
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
        camp: campInput,
        floor: floorInput,
        capacity: capacityInput,
        status: statusInput,
        currentOccupantDni: statusInput === 'Libre' ? undefined : occupantDni,
        currentOccupantName: statusInput === 'Libre' ? undefined : occupantName || editingRoom.currentOccupantName,
        occupantCompany: statusInput === 'Libre' ? undefined : occupantCompany || editingRoom.occupantCompany,
      };
      onUpdateRoom(updated);
    } else {
      const newRoom: Room = {
        id: `R-${Date.now().toString().slice(-5)}`,
        roomNumber: roomNumberInput.trim(),
        pabellon: pabellonInput,
        camp: campInput,
        floor: floorInput,
        capacity: capacityInput,
        status: statusInput,
        currentOccupantDni: statusInput === 'Libre' ? undefined : occupantDni,
        currentOccupantName: statusInput === 'Libre' ? undefined : occupantName,
        occupantCompany: statusInput === 'Libre' ? undefined : occupantCompany,
        lastLinenChangeDate: new Date().toISOString().split('T')[0],
      };
      onAddRoom(newRoom);
    }

    setIsFormModalOpen(false);
  };

  // Quick Action: Liberar / Desocupar Cuarto
  const handleVacateRoom = (room: Room) => {
    if (window.confirm(`¿Desea desocupar la habitación ${room.roomNumber} y pasarla a estado Limpieza?`)) {
      const updated: Room = {
        ...room,
        status: 'Limpieza',
        currentOccupantDni: undefined,
        currentOccupantName: undefined,
        occupantCompany: undefined,
      };
      onUpdateRoom(updated);
      setIsFormModalOpen(false);
    }
  };

  // Quick Action: Delete Room
  const handleDeleteConfirm = (roomId: string, roomNum: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente la habitación ${roomNum}?`)) {
      onDeleteRoom(roomId);
      setIsFormModalOpen(false);
    }
  };

  // Color mapping helper for Room Status
  const getStatusColorBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Libre':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:border-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          icon: '🟢',
        };
      case 'Ocupado':
        return {
          bg: 'bg-rose-950/80 text-rose-200 border-rose-500/50 hover:border-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          icon: '🔴',
        };
      case 'Limpieza':
        return {
          bg: 'bg-amber-950/80 text-amber-200 border-amber-500/50 hover:border-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          icon: '🟡',
        };
      case 'Reservado':
        return {
          bg: 'bg-blue-950/80 text-blue-200 border-blue-500/50 hover:border-blue-400',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
          icon: '🔵',
        };
      case 'Mantenimiento':
        return {
          bg: 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          icon: '⚫',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner & IA Copilot trigger */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 md:p-8 border border-amber-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5" /> Módulo de Alojamiento & Control de Pabellones
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
              PLANO & GESTIÓN DE <span className="gold-gradient-text">HABITACIONES MINERAS</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Control biológico de capacidad de camas, visualización gráfica interactiva por pabellones, alertas de cambio de sábanas a 14 días y registro inmediato de ocupantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl gold-button text-xs font-black shadow-xl hover:scale-105 transition-all text-slate-950"
            >
              <Plus className="w-5 h-5" /> ➕ Crear Habitación
            </button>

            <button
              onClick={onOpenAICopilot}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-xs font-bold hover:bg-indigo-600/40 shadow-lg"
            >
              <Bot className="w-4 h-4 text-indigo-300" />
              IA Copilot
            </button>

            <button
              onClick={() => exportToExcel(rooms, 'Control_Habitaciones_ECOSEM', 'Habitaciones')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 shadow-lg"
            >
              Exportar Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Hospedados</span>
          <div className="text-2xl font-black text-emerald-400">{totalHospedados} Pers.</div>
          <span className="text-[10px] text-slate-400 block">En {occupiedRooms.length} cuartos ocupados</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Camas Ocupadas / Libres</span>
          <div className="text-2xl font-black text-slate-100">
            <span className="text-rose-400">{occupiedBeds}</span> / <span className="text-emerald-400">{freeBeds}</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Capacidad total: {totalBeds} camas</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Cuartos Libres</span>
          <div className="text-2xl font-black text-emerald-400">{freeRooms.length} Cuartos</div>
          <span className="text-[10px] text-emerald-300 block">Disponibilidad inmediata 🟢</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-rose-500/30 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Alertas Sábanas (14D)</span>
          <div className="text-2xl font-black text-rose-400">{redAlertsCount} Alertas</div>
          <span className="text-[10px] text-rose-300 block">Cambio urgente de lencería 🔴</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 col-span-2 sm:col-span-1 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Ocupación General</span>
          <div className="text-2xl font-black text-amber-400">
            {rooms.length > 0 ? Math.round((occupiedRooms.length / rooms.length) * 100) : 0}%
          </div>
          <span className="text-[10px] text-amber-300 block">Eficiencia de campamento</span>
        </div>
      </div>

      {/* Bed Sheets Alert Banner */}
      {redAlertsCount > 0 && (
        <div className="bg-rose-950/60 border-2 border-rose-500/50 p-5 rounded-3xl space-y-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-300 font-black text-sm">
              <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
              <span>ALERTA DE BIENESTAR SOCIAL: {redAlertsCount} HABITACIONES REQUIEREN CAMBIO DE SÁBANAS (&gt;= 14 DÍAS O LIMPIEZA)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {bedSheetAlerts.filter(a => a.isRedAlert).map((alert) => (
              <div key={alert.roomId} className="bg-slate-950/90 border border-rose-500/40 p-3.5 rounded-2xl flex items-center justify-between shadow">
                <div>
                  <div className="font-extrabold text-slate-100 text-sm">Habitación {alert.roomNumber}</div>
                  <div className="text-[11px] text-slate-400 font-semibold">{alert.pabellon}</div>
                  <div className="text-rose-400 font-bold text-xs mt-1">Hace {alert.daysSinceLastChange} días</div>
                </div>
                <button
                  onClick={() => onUpdateLinenChange(alert.roomId)}
                  className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px] shadow hover:bg-emerald-400 transition-all flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Marcar Cambio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Controls Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 Buscar por número de cuarto, pabellón, DNI u ocupante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" /> Plano Gráfico
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-4 h-4" /> Tabla Detallada
              </button>
            </div>

            <select
              value={selectedCampFilter}
              onChange={(e) => setSelectedCampFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-950 border border-amber-500/40 rounded-2xl text-amber-300 font-extrabold text-xs shadow"
            >
              <option value="Todos">🌐 Todos los Campamentos ({rooms.length} cuartos)</option>
              {REGISTERED_CAMPS_LIST.map((c) => (
                <option key={c} value={c}>🏕️ {c}</option>
              ))}
            </select>

            <select
              value={selectedPabellonFilter}
              onChange={(e) => setSelectedPabellonFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 font-bold"
            >
              <option value="Todos">Todos los Pabellones</option>
              {pabellones.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 font-bold"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Libre">🟢 Libre</option>
              <option value="Ocupado">🔴 Ocupado</option>
              <option value="Limpieza">🟡 Limpieza</option>
              <option value="Reservado">🔵 Reservado</option>
              <option value="Mantenimiento">⚫ Mantenimiento</option>
            </select>
          </div>
        </div>

        {/* Status Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 font-bold">Leyenda:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">🟢 Libre</span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">🔴 Ocupado</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">🟡 Limpieza</span>
            <span className="flex items-center gap-1 text-blue-400 font-bold">🔵 Reservado</span>
            <span className="flex items-center gap-1 text-slate-400 font-bold">⚫ Mantenimiento</span>
          </div>

          <span className="text-amber-400 font-mono text-[11px] font-bold">
            Mostrando {filteredRooms.length} de {rooms.length} habitaciones
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: GRID BY PABELLONES */}
      {viewMode === 'grid' && (
        <div className="space-y-6 animate-fade-in-up">
          {pabellones.map((pab) => {
            const roomsInPab = filteredRooms.filter((r) => r.pabellon === pab.name);
            if (selectedPabellonFilter !== 'Todos' && selectedPabellonFilter !== pab.name) return null;
            if (roomsInPab.length === 0 && searchTerm) return null;

            return (
              <div key={pab.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="font-black text-base text-slate-100 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>{pab.name.toUpperCase()}</span>
                    <span className="text-xs text-slate-400 font-normal">({pab.description || 'Pabellón de Alojamiento Minero'})</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300">
                    {roomsInPab.length} Cuartos
                  </span>
                </div>

                {roomsInPab.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-bold">
                    No hay habitaciones en este pabellón.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {roomsInPab.map((r) => {
                      const statusBadge = getStatusColorBadge(r.status);
                      const lastChangeDate = new Date(r.lastLinenChangeDate || new Date());
                      const daysLinen = Math.floor((today.getTime() - lastChangeDate.getTime()) / (1000 * 3600 * 24));
                      const isLinenAlert = daysLinen >= 14 || r.status === 'Limpieza';

                      return (
                        <div
                          key={r.id}
                          onClick={() => handleStartEdit(r)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 relative ${statusBadge.bg} shadow-lg space-y-2`}
                        >
                          {isLinenAlert && (
                            <span className="absolute -top-2.5 -right-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-white animate-pulse">
                              SÁBANAS ⚠️
                            </span>
                          )}

                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="font-black text-base text-slate-100">Hab. {r.roomNumber}</span>
                            <span className="text-sm">{statusBadge.icon}</span>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-300">
                            Piso {r.floor} • Cap: <strong className="text-amber-300">{r.capacity} camas</strong>
                          </div>

                          {r.status === 'Ocupado' && r.currentOccupantName ? (
                            <div className="pt-2 border-t border-slate-700/50 text-[11px] space-y-0.5">
                              <div className="font-bold text-slate-100 truncate flex items-center gap-1">
                                <Users className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">{r.currentOccupantName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{r.occupantCompany || 'Sin Contrata'}</div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-slate-700/50 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wide">
                              {r.status}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: DETAILED TABLE */}
      {viewMode === 'table' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl animate-fade-in-up">
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-xs text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-950 text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 border-r border-slate-800">N° Habitación</th>
                  <th className="p-3.5 border-r border-slate-800">Pabellón</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Piso / Capacidad</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Estado</th>
                  <th className="p-3.5 border-r border-slate-800">Huésped / Ocupante Actual</th>
                  <th className="p-3.5 border-r border-slate-800 text-center">Último Cambio Sábanas</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-950 font-mono text-xs">
                {filteredRooms.map((r) => {
                  const statusBadge = getStatusColorBadge(r.status);
                  const lastChangeDate = new Date(r.lastLinenChangeDate || new Date());
                  const daysLinen = Math.floor((today.getTime() - lastChangeDate.getTime()) / (1000 * 3600 * 24));
                  const isLinenAlert = daysLinen >= 14;

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 border-r border-slate-800 font-bold text-amber-300 font-sans text-sm">
                        Habitación {r.roomNumber}
                      </td>
                      <td className="p-3.5 border-r border-slate-800 font-sans text-slate-200 font-bold">
                        {r.pabellon}
                      </td>
                      <td className="p-3.5 border-r border-slate-800 text-center text-slate-300">
                        Piso {r.floor} ({r.capacity} Camas)
                      </td>
                      <td className="p-3.5 border-r border-slate-800 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBadge.badgeBg}`}>
                          {statusBadge.icon} {r.status}
                        </span>
                      </td>
                      <td className="p-3.5 border-r border-slate-800 font-sans">
                        {r.currentOccupantName ? (
                          <div>
                            <div className="font-bold text-slate-100">{r.currentOccupantName}</div>
                            <div className="text-[10px] text-slate-400">DNI: {r.currentOccupantDni || 'N/A'} • {r.occupantCompany}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Sin Ocupante</span>
                        )}
                      </td>
                      <td className="p-3.5 border-r border-slate-800 text-center">
                        <span className={isLinenAlert ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          Hace {daysLinen} días {isLinenAlert && '⚠️'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(r)}
                            className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                            title="Editar Habitación"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onUpdateLinenChange(r.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            title="Marcar Cambio de Sábanas"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>

                          {r.status === 'Ocupado' && (
                            <button
                              onClick={() => handleVacateRoom(r)}
                              className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30"
                              title="Desocupar Habitación"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteConfirm(r.id, r.roomNumber)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                            title="Eliminar Habitación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL OVERLAY: CREAR / EDITAR HABITACIÓN
         ───────────────────────────────────────────────────────────── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <BedDouble className="w-6 h-6" />
                <h3 className="text-lg font-black uppercase">
                  {editingRoom ? `Editar Habitación ${editingRoom.roomNumber}` : '➕ Crear Nueva Habitación'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Campamento Minero *:</label>
                  <select
                    value={campInput}
                    onChange={(e) => setCampInput(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm"
                  >
                    {REGISTERED_CAMPS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">N° de Habitación / Cuarto *:</label>
                  <input
                    type="text"
                    placeholder="Ej: HAB. 502"
                    value={roomNumberInput}
                    onChange={(e) => setRoomNumberInput(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pabellón *:</label>
                  <select
                    value={pabellonInput}
                    onChange={(e) => setPabellonInput(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-sm"
                  >
                    {pabellones.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Piso *:</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={floorInput}
                    onChange={(e) => setFloorInput(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-sm text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Capacidad (Camas) *:</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-sm text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estado de la Habitación *:</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as RoomStatus)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-bold text-sm"
                  >
                    <option value="Libre">🟢 Libre</option>
                    <option value="Ocupado">🔴 Ocupado</option>
                    <option value="Limpieza">🟡 Limpieza</option>
                    <option value="Reservado">🔵 Reservado</option>
                    <option value="Mantenimiento">⚫ Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">DNI del Ocupante (Opcional):</label>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="DNI Ocupante"
                    value={occupantDniInput}
                    onChange={(e) => {
                      setOccupantDniInput(e.target.value);
                      const matched = workers.find((w) => w.dni === e.target.value.trim());
                      if (matched) setSelectedWorkerId(matched.id);
                    }}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-slate-300 font-bold mb-1">Seleccionar Trabajador Activo:</label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => handleWorkerSelect(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-xs"
                  >
                    <option value="">-- Buscar o Seleccionar Personal Registrado --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName} ({w.dni}) — {w.company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Footer Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {editingRoom ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVacateRoom(editingRoom)}
                      className="px-3.5 py-2.5 bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 font-bold rounded-xl hover:bg-indigo-600/40 text-xs flex items-center gap-1.5"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Desocupar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteConfirm(editingRoom.id, editingRoom.roomNumber)}
                      className="px-3.5 py-2.5 bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold rounded-xl hover:bg-rose-600/30 text-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 gold-button text-xs font-black rounded-xl shadow-xl flex items-center gap-2 text-slate-950"
                  >
                    <Check className="w-4 h-4" /> {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
