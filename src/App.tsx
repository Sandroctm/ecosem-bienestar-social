import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ActiveModule, Worker, AttendanceRecord, RoomHandover, IncidentReport, ValuationItem, Room, Pabellon } from './types';
import {
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_VALUATIONS,
  INITIAL_ROOM_HANDOVERS,
  INITIAL_INCIDENTS,
  INITIAL_FAMILY_HEALTH,
  INITIAL_SCHOLARSHIPS,
  INITIAL_INFRASTRUCTURE,
  INITIAL_SOCIAL_IMPACT,
  INITIAL_BENEFIT_REQUESTS,
  INITIAL_SUPPLIERS,
  INITIAL_MICROCREDITS,
  INITIAL_AUDIT_LOGS,
  DEMO_WORKERS,
  DEMO_ATTENDANCE,
  DEMO_BENEFIT_REQUESTS,
} from './utils/mockData';
import { INITIAL_ROOMS, INITIAL_PABELLONES } from './utils/mockRooms';

import { DashboardPage } from './pages/DashboardPage';
import { AccidentsSubsidiesPage } from './pages/AccidentsSubsidiesPage';
import { CampHousingManagementPage } from './pages/CampHousingManagementPage';
import { EventsClimatePage } from './pages/EventsClimatePage';
import { BereavementWorkflowPage } from './pages/BereavementWorkflowPage';
import { ResilienceBackupPage } from './pages/ResilienceBackupPage';

// New Enterprise Pages
import { MedicalLeaveManagementPage } from './pages/MedicalLeaveManagementPage';
import { LoansSocialAssistancePage } from './pages/LoansSocialAssistancePage';
import { SCTRManagementPage } from './pages/SCTRManagementPage';
import { PredictiveAnalyticsPage } from './pages/PredictiveAnalyticsPage';

// New Enterprise Components & Modals
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { MFAModal } from './components/MFAModal';
import { OfflineSyncStatusBadge } from './components/OfflineSyncStatusBadge';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DatabaseSyncModal } from './components/DatabaseSyncModal';
import { subscribeRealtimeSync, broadcastMutation } from './utils/realtimeSyncEngine';
import { fetchStateFromCloudServer } from './utils/databaseStateEngine';
import { pushAttendanceRecordToCloud, fetchLiveCloudAttendanceRecords, startRealtimeCloudStream } from './utils/cloudSyncRelay';

import {
  MOCK_ENTERPRISE_WORKERS,
  MOCK_ENTERPRISE_DESCANSOS,
  MOCK_ENTERPRISE_PRESTAMOS,
  MOCK_ENTERPRISE_SCTR,
  MOCK_ENTERPRISE_ATENCIONES,
  MOCK_ENTERPRISE_VISITAS,
  MOCK_ENTERPRISE_AUDITORIA,
  MOCK_ENTERPRISE_ACCIDENTES,
  MOCK_ENTERPRISE_CAMPAMENTOS,
  MOCK_ENTERPRISE_ENTREGAS,
  MOCK_ENTERPRISE_SOLICITUDES,
  MOCK_ENTERPRISE_ATTENDANCE,
} from './utils/mockEnterprise12Tables';

import {
  INITIAL_ACCIDENTES_TRABAJO,
  INITIAL_CAMPAMENTO_HABITACIONES,
  INITIAL_ENTREGAS_BENEFICIOS,
  INITIAL_SOLICITUDES_APROBACIONES,
  INITIAL_UNIT_TENANTS,
  INITIAL_RESILIENCE_METRICS,
} from './utils/mockExtendedData';
import {
  AccidenteTrabajo,
  CampamentoHabitacion,
  EntregaBeneficio,
  SolicitudAprobacion,
  UnitTenant,
  ResilienceMetrics,
  DescansoMedico,
  PrestamoAyuda,
  SCTRPoliza,
  AtencionSocial,
  VisitaDomiciliaria,
  BitacoraAuditoria,
} from './types';
import { QRAttendancePage } from './pages/QRAttendancePage';
import { ValuationPage } from './pages/ValuationPage';
import { RoomDeliveryPage } from './pages/RoomDeliveryPage';
import { RoomManagementPage } from './pages/RoomManagementPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { FamilyHealthPage } from './pages/FamilyHealthPage';
import { EducationPage } from './pages/EducationPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { SocialImpactPage } from './pages/SocialImpactPage';
import { RequestsPage } from './pages/RequestsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { MicrocreditPage } from './pages/MicrocreditPage';
import { AuditCompliancePage } from './pages/AuditCompliancePage';
import { WorkersManagementPage } from './pages/WorkersManagementPage';
import { WorkerPortalPage } from './pages/WorkerPortalPage';
import { RoomCheckinPortal } from './pages/RoomCheckinPortal';
import { AICopilotModal } from './components/AICopilotModal';

// Modals
import { QRScannerModal } from './components/QRScannerModal';
import { RoomDeliveryDocumentModal } from './components/RoomDeliveryDocumentModal';
import { WhatsAppIncidentModal } from './components/WhatsAppIncidentModal';

// Excel Exporter
import { exportToExcel } from './utils/excelExport';

// Google Sheets integration
import { sendToGoogleSheets } from './utils/googleSheets';

// Utility helper to safely load state from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error loading state ${key}:`, e);
    }
  }
  return defaultValue;
};

/**
 * Returns the base URL to use for QR codes.
 * - If user configured a custom URL in localStorage, use that.
 * - If running on localhost, try to use the Vercel production URL.
 * - Otherwise use the current origin.
 */
export const getQrBaseUrl = (): string => {
  const custom = localStorage.getItem('ecosem_qr_base_url');
  if (custom) return custom.replace(/\/$/, '');
  const origin = window.location.origin;
  // If localhost, check if a production URL is saved
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    const vercelUrl = localStorage.getItem('ecosem_vercel_url');
    if (vercelUrl) return vercelUrl.replace(/\/$/, '');
  }
  return origin;
};

export function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  // Application Data States (Clean / Empty by default, persisted in localStorage)
  const [workers, setWorkers] = useState<Worker[]>(() => loadFromStorage('ecosem_workers', MOCK_ENTERPRISE_WORKERS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('ecosem_attendance', MOCK_ENTERPRISE_ATTENDANCE));
  const [valuations, setValuations] = useState<ValuationItem[]>(() => loadFromStorage('ecosem_valuations', INITIAL_VALUATIONS));
  const [roomHandovers, setRoomHandovers] = useState<RoomHandover[]>(() => loadFromStorage('ecosem_room_handovers', INITIAL_ROOM_HANDOVERS));
  const [rooms, setRooms] = useState<Room[]>(() => loadFromStorage('ecosem_rooms', INITIAL_ROOMS));
  const [pabellones, setPabellones] = useState<Pabellon[]>(() => loadFromStorage('ecosem_pabellones', INITIAL_PABELLONES));
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => loadFromStorage('ecosem_incidents', INITIAL_INCIDENTS));
  const [familyHealth, setFamilyHealth] = useState(() => loadFromStorage('ecosem_family_health', INITIAL_FAMILY_HEALTH));
  const [scholarships, setScholarships] = useState(() => loadFromStorage('ecosem_scholarships', INITIAL_SCHOLARSHIPS));
  const [infrastructure, setInfrastructure] = useState(() => loadFromStorage('ecosem_infrastructure', INITIAL_INFRASTRUCTURE));
  const [socialImpact, setSocialImpact] = useState(() => loadFromStorage('ecosem_social_impact', INITIAL_SOCIAL_IMPACT));
  const [benefitRequests, setBenefitRequests] = useState(() => loadFromStorage('ecosem_benefit_requests', INITIAL_BENEFIT_REQUESTS));
  const [suppliers, setSuppliers] = useState(() => loadFromStorage('ecosem_suppliers', INITIAL_SUPPLIERS));
  const [microcredits, setMicrocredits] = useState(() => loadFromStorage('ecosem_microcredits', INITIAL_MICROCREDITS));
  const [auditLogs, setAuditLogs] = useState(() => loadFromStorage('ecosem_audit_logs', MOCK_ENTERPRISE_AUDITORIA));

  // Estados para Módulos Operativos Extendidos (Tablas 09 a 12, Multitenant y Resiliencia)
  const [accidentes, setAccidentes] = useState<AccidenteTrabajo[]>(() => loadFromStorage('ecosem_accidentes', INITIAL_ACCIDENTES_TRABAJO));
  const [campamentos, setCampamentos] = useState<CampamentoHabitacion[]>(() => loadFromStorage('ecosem_campamentos', INITIAL_CAMPAMENTO_HABITACIONES));
  const [entregas, setEntregas] = useState<EntregaBeneficio[]>(() => loadFromStorage('ecosem_entregas', INITIAL_ENTREGAS_BENEFICIOS));
  const [solicitudes, setSolicitudes] = useState<SolicitudAprobacion[]>(() => loadFromStorage('ecosem_solicitudes', INITIAL_SOLICITUDES_APROBACIONES));
  const [tenants] = useState<UnitTenant[]>(() => loadFromStorage('ecosem_tenants', INITIAL_UNIT_TENANTS));
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => loadFromStorage('ecosem_current_tenant_id', INITIAL_UNIT_TENANTS[0].id));
  const [resilienceMetrics, setResilienceMetrics] = useState<ResilienceMetrics>(() => loadFromStorage('ecosem_resilience', INITIAL_RESILIENCE_METRICS));

  // Estados Enterprise Nuevos
  const [descansos, setDescansos] = useState<DescansoMedico[]>(() => loadFromStorage('ecosem_descansos', MOCK_ENTERPRISE_DESCANSOS));
  const [prestamos, setPrestamos] = useState<PrestamoAyuda[]>(() => loadFromStorage('ecosem_prestamos', MOCK_ENTERPRISE_PRESTAMOS));
  const [sctrs, setSctrs] = useState<SCTRPoliza[]>(() => loadFromStorage('ecosem_sctrs', MOCK_ENTERPRISE_SCTR));
  const [atenciones, setAtenciones] = useState<AtencionSocial[]>(() => loadFromStorage('ecosem_atenciones', MOCK_ENTERPRISE_ATENCIONES));
  const [visitas, setVisitas] = useState<VisitaDomiciliaria[]>(() => loadFromStorage('ecosem_visitas', MOCK_ENTERPRISE_VISITAS));

  // Modals de Control Corporativo
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [isMfaVerified, setIsMfaVerified] = useState(() => loadFromStorage('ecosem_mfa_verified', false));
  const [isOnline, setIsOnline] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(() => loadFromStorage('ecosem_high_contrast', false));
  const [isDbSyncModalOpen, setIsDbSyncModalOpen] = useState(false);

  // Recargar todos los estados desde localStorage tras importar un respaldo o sincronizar desde la nube
  const handleReloadAllState = () => {
    setWorkers(loadFromStorage('ecosem_workers', MOCK_ENTERPRISE_WORKERS));
    setAttendanceRecords(loadFromStorage('ecosem_attendance', MOCK_ENTERPRISE_ATTENDANCE));
    setDescansos(loadFromStorage('ecosem_descansos', MOCK_ENTERPRISE_DESCANSOS));
    setPrestamos(loadFromStorage('ecosem_prestamos', MOCK_ENTERPRISE_PRESTAMOS));
    setSctrs(loadFromStorage('ecosem_sctrs', MOCK_ENTERPRISE_SCTR));
    setAtenciones(loadFromStorage('ecosem_atenciones', MOCK_ENTERPRISE_ATENCIONES));
    setVisitas(loadFromStorage('ecosem_visitas', MOCK_ENTERPRISE_VISITAS));
    setAccidentes(loadFromStorage('ecosem_accidentes', INITIAL_ACCIDENTES_TRABAJO));
    setCampamentos(loadFromStorage('ecosem_campamentos', INITIAL_CAMPAMENTO_HABITACIONES));
    setEntregas(loadFromStorage('ecosem_entregas', INITIAL_ENTREGAS_BENEFICIOS));
    setSolicitudes(loadFromStorage('ecosem_solicitudes', INITIAL_SOLICITUDES_APROBACIONES));
    setRooms(loadFromStorage('ecosem_rooms', INITIAL_ROOMS));
  };

  // Persistence Effects
  useEffect(() => { localStorage.setItem('ecosem_accidentes', JSON.stringify(accidentes)); }, [accidentes]);
  useEffect(() => { localStorage.setItem('ecosem_campamentos', JSON.stringify(campamentos)); }, [campamentos]);
  useEffect(() => { localStorage.setItem('ecosem_entregas', JSON.stringify(entregas)); }, [entregas]);
  useEffect(() => { localStorage.setItem('ecosem_solicitudes', JSON.stringify(solicitudes)); }, [solicitudes]);
  useEffect(() => { localStorage.setItem('ecosem_current_tenant_id', JSON.stringify(currentTenantId)); }, [currentTenantId]);
  useEffect(() => { localStorage.setItem('ecosem_resilience', JSON.stringify(resilienceMetrics)); }, [resilienceMetrics]);
  useEffect(() => { localStorage.setItem('ecosem_descansos', JSON.stringify(descansos)); }, [descansos]);
  useEffect(() => { localStorage.setItem('ecosem_prestamos', JSON.stringify(prestamos)); }, [prestamos]);
  useEffect(() => { localStorage.setItem('ecosem_sctrs', JSON.stringify(sctrs)); }, [sctrs]);
  useEffect(() => { localStorage.setItem('ecosem_atenciones', JSON.stringify(atenciones)); }, [atenciones]);
  useEffect(() => { localStorage.setItem('ecosem_visitas', JSON.stringify(visitas)); }, [visitas]);
  useEffect(() => { localStorage.setItem('ecosem_mfa_verified', JSON.stringify(isMfaVerified)); }, [isMfaVerified]);
  useEffect(() => { localStorage.setItem('ecosem_high_contrast', JSON.stringify(isHighContrast)); }, [isHighContrast]);

  // Persistence Effects - Automatically write states to localStorage on change
  useEffect(() => { localStorage.setItem('ecosem_workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('ecosem_attendance', JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem('ecosem_valuations', JSON.stringify(valuations)); }, [valuations]);
  useEffect(() => { localStorage.setItem('ecosem_room_handovers', JSON.stringify(roomHandovers)); }, [roomHandovers]);
  useEffect(() => { localStorage.setItem('ecosem_rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('ecosem_pabellones', JSON.stringify(pabellones)); }, [pabellones]);
  useEffect(() => { localStorage.setItem('ecosem_incidents', JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem('ecosem_family_health', JSON.stringify(familyHealth)); }, [familyHealth]);
  useEffect(() => { localStorage.setItem('ecosem_scholarships', JSON.stringify(scholarships)); }, [scholarships]);
  useEffect(() => { localStorage.setItem('ecosem_infrastructure', JSON.stringify(infrastructure)); }, [infrastructure]);
  useEffect(() => { localStorage.setItem('ecosem_social_impact', JSON.stringify(socialImpact)); }, [socialImpact]);
  useEffect(() => { localStorage.setItem('ecosem_benefit_requests', JSON.stringify(benefitRequests)); }, [benefitRequests]);
  useEffect(() => { localStorage.setItem('ecosem_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('ecosem_microcredits', JSON.stringify(microcredits)); }, [microcredits]);
  useEffect(() => { localStorage.setItem('ecosem_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Suscripción al bus en tiempo real (BroadcastChannel Engine)
  useEffect(() => {
    const unsubscribe = subscribeRealtimeSync((event) => {
      console.log(`[Sincro Tiempo Real Recibida]: ${event.action} en tabla ${event.tableName}`);
      if (event.tableName === 'descansos' && event.payload) {
        setDescansos((prev) => [event.payload, ...prev.filter((d) => d.idDescanso !== event.payload.idDescanso)]);
      } else if (event.tableName === 'prestamos' && event.payload) {
        setPrestamos((prev) => [event.payload, ...prev.filter((p) => p.idPrestamo !== event.payload.idPrestamo)]);
      } else if (event.tableName === 'workers' && event.payload) {
        setWorkers((prev) => [event.payload, ...prev.filter((w) => w.id !== event.payload.id)]);
      } else if (event.tableName === 'ecosem_attendance' && event.payload) {
        setAttendanceRecords((prev) => [event.payload, ...prev.filter((a) => a.id !== event.payload.id)]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Intentar sincronización remota desde la nube al arrancar en cualquier PC
  useEffect(() => {
    fetchStateFromCloudServer().then((res) => {
      if (res.success) {
        console.log('[Cloud Startup Sync] Datos del sistema restaurados desde la Nube.');
        handleReloadAllState();
      }
    }).catch(() => {});
  }, []);

  // Stream de Sincronización en Tiempo Real Celular -> PC (SSE + Polling Instantáneo Nube)
  useEffect(() => {
    const unsubscribeCloudStream = startRealtimeCloudStream((incomingRecord) => {
      setAttendanceRecords((prev) => {
        const exists = prev.some((r) => r.id === incomingRecord.id);
        if (!exists) {
          console.log(`[Cloud Stream SSE] Nueva marcación recibida desde celular: ${incomingRecord.workerName} (${incomingRecord.serviceType})`);
          return [incomingRecord, ...prev];
        }
        return prev;
      });
    });

    const handleCloudEvent = (e: Event) => {
      const customEv = e as CustomEvent<AttendanceRecord>;
      if (customEv.detail) {
        const newRec = customEv.detail;
        setAttendanceRecords((prev) => [newRec, ...prev.filter((r) => r.id !== newRec.id)]);
      }
    };

    window.addEventListener('ecosem_cloud_attendance_event', handleCloudEvent);

    return () => {
      unsubscribeCloudStream();
      window.removeEventListener('ecosem_cloud_attendance_event', handleCloudEvent);
    };
  }, []);

  // Listener para Ctrl + K o Cmd + K (Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle URL Parameter Routing for direct Room Checkin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const dni = params.get('dni');
    if (action === 'room-checkin' || dni) {
      setActiveModule('room-checkin-portal');
    }
  }, []);

  // Modals state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);

  // Room management handlers
  const handleAddRoom = (newRoom: Room) => setRooms([newRoom, ...rooms]);
  const handleUpdateRoom = (updatedRoom: Room) => setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  const handleDeleteRoom = (roomId: string) => setRooms(rooms.filter((r) => r.id !== roomId));
  const handleUpdateLinenChange = (roomId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setRooms(rooms.map((r) => (r.id === roomId ? { ...r, lastLinenChangeDate: todayStr, status: r.status === 'Limpieza' ? 'Libre' : r.status } : r)));
  };

  // Worker registration handlers
  const handleAddWorker = (newWorker: Worker) => {
    setWorkers([newWorker, ...workers]);
  };

  const handleBatchAddWorkers = (newWorkers: Worker[]) => {
    setWorkers((prev) => [...newWorkers, ...prev]);
    newWorkers.forEach((w) => broadcastMutation('workers', 'INSERT', w));

    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      idLog: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      module: 'Registro de Personal',
      action: `Importación Masiva Excel: ${newWorkers.length} colaboradores agregados`,
      user: 'Administrador / Recursos Humanos',
      ipAddress: '192.168.10.100',
      hashSignature: `0x${Math.random().toString(16).substring(2, 10)}`,
      details: `Se realizó la carga masiva vía Excel (.xlsx) de ${newWorkers.length} personal(es).`,
    };
    setAuditLogs((prev: any) => [newLog, ...prev]);
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorkers(workers.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)));
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers(workers.filter((w) => w.id !== workerId));
  };

  const handleLoadDemoData = () => {
    setWorkers(DEMO_WORKERS);
    setAttendanceRecords(DEMO_ATTENDANCE);
    setBenefitRequests(DEMO_BENEFIT_REQUESTS);
  };

  // Handlers for Extra Modules
  const handleAddScholarship = (item: any) => setScholarships([item, ...scholarships]);
  const handleDeleteScholarship = (id: string) => setScholarships(scholarships.filter((s) => s.id !== id));

  const handleAddFamilyHealth = (item: any) => setFamilyHealth([item, ...familyHealth]);
  const handleDeleteFamilyHealth = (id: string) => setFamilyHealth(familyHealth.filter((f) => f.id !== id));

  const handleAddInfrastructure = (item: any) => setInfrastructure([item, ...infrastructure]);
  const handleDeleteInfrastructure = (id: string) => setInfrastructure(infrastructure.filter((i) => i.id !== id));

  const handleAddSocialImpact = (item: any) => setSocialImpact([item, ...socialImpact]);
  const handleDeleteSocialImpact = (id: string) => setSocialImpact(socialImpact.filter((m) => m.id !== id));

  const handleAddBenefitRequest = (item: any) => setBenefitRequests([item, ...benefitRequests]);
  const handleUpdateBenefitRequestStatus = (id: string, status: any) =>
    setBenefitRequests(benefitRequests.map((r) => (r.id === id ? { ...r, status } : r)));
  const handleDeleteBenefitRequest = (id: string) => setBenefitRequests(benefitRequests.filter((r) => r.id !== id));

  const handleAddSupplier = (item: any) => setSuppliers([item, ...suppliers]);
  const handleDeleteSupplier = (id: string) => setSuppliers(suppliers.filter((s) => s.id !== id));

  const handleAddMicrocredit = (item: any) => setMicrocredits([item, ...microcredits]);
  const handleDeleteMicrocredit = (id: string) => setMicrocredits(microcredits.filter((c) => c.id !== id));

  const handleAddAuditLog = (item: any) => setAuditLogs([item, ...auditLogs]);

  // Attendance scan handler
  const handleScanSuccess = (
    rawDniInput: string,
    serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno',
    roomNumber?: string
  ) => {
    const cleanInput = rawDniInput.trim();
    const dniMatch = cleanInput.match(/\b\d{8}\b/);
    const workerDni = dniMatch ? dniMatch[0] : cleanInput;

    const worker = workers.find(
      (w) => w.dni === workerDni || w.dni === cleanInput || w.qrCodeValue.includes(cleanInput) || w.id === cleanInput
    );

    const workerName = worker ? worker.fullName : (dniMatch || /^\d{8}$/.test(workerDni) ? `Personal DNI ${workerDni}` : workerDni);
    const company = worker ? worker.company : 'ECOSEM Contratista';
    const camp = worker ? worker.camp : 'Sede Morococha - Unidad Toromocho';

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
      workerDni,
      workerName,
      company,
      camp,
      serviceType,
      status: 'Válido',
      scannedBy: roomNumber ? `Auto-Registro Habitación ${roomNumber}` : 'Escáner Móvil / Celular QR',
      roomNumber: roomNumber || (worker ? worker.roomNumber : undefined),
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    broadcastMutation('ecosem_attendance', 'INSERT', newRecord);
    pushAttendanceRecordToCloud(newRecord).catch(() => {});

    // Send to Google Sheets Webhook in background if configured
    sendToGoogleSheets(newRecord).catch((err) => console.error('Error auto-syncing sheets:', err));

    // Log audit
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      idLog: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      module: 'Asistencia QR',
      action: `Marcación ${serviceType} registrada para ${workerName}${roomNumber ? ` (Habitación ${roomNumber})` : ''}`,
      user: 'Supervisor Escáner',
      ipAddress: '192.168.10.100',
      hashSignature: `0x${Math.random().toString(16).substring(2, 10)}`,
      details: `Marcación ${serviceType} registrada para ${workerName}`,
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleAddValuation = (item: ValuationItem) => {
    setValuations([item, ...valuations]);
  };

  const handleSaveRoomHandover = (handover: RoomHandover) => {
    const exists = roomHandovers.some((h) => h.id === handover.id);
    if (exists) {
      setRoomHandovers(roomHandovers.map((h) => (h.id === handover.id ? handover : h)));
    } else {
      setRoomHandovers([handover, ...roomHandovers]);
    }
  };

  const handleSaveIncident = (incident: IncidentReport) => {
    setIncidents([incident, ...incidents]);
  };

  // Export current module data to Excel (.xlsx)
  const handleExportCurrentModuleToExcel = () => {
    switch (activeModule) {
      case 'workers':
        exportToExcel(workers, 'Padron_Personal_ECOSEM', 'Personal');
        break;
      case 'qr-attendance':
        exportToExcel(attendanceRecords, 'Asistencia_QR_ECOSEM', 'Asistencia QR');
        break;
      case 'valuation':
        exportToExcel(valuations, 'Valorizacion_Precio_Diario_ECOSEM', 'Valorizaciones');
        break;
      case 'room-handover':
        exportToExcel(roomHandovers, 'Entrega_Cuartos_Habitaciones_ECOSEM', 'Actas Cuartos');
        break;
      case 'incidents':
        exportToExcel(incidents, 'Incidentes_WhatsApp_ECOSEM', 'Incidentes');
        break;
      case 'family-health':
        exportToExcel(familyHealth, 'Salud_Familiar_ECOSEM', 'Salud');
        break;
      case 'education':
        exportToExcel(scholarships, 'Educacion_Becas_ECOSEM', 'Becas');
        break;
      case 'infrastructure':
        exportToExcel(infrastructure, 'Infraestructura_OXI_ECOSEM', 'Obras OXI');
        break;
      case 'social-impact':
        exportToExcel(socialImpact, 'Impacto_Social_ICBS_ECOSEM', 'Impacto ICBS');
        break;
      case 'benefit-requests':
        exportToExcel(benefitRequests, 'Solicitudes_Beneficios_ECOSEM', 'Solicitudes');
        break;
      case 'local-suppliers':
        exportToExcel(suppliers, 'Proveedores_Locales_ECOSEM', 'Proveedores');
        break;
      case 'microcredits':
        exportToExcel(microcredits, 'Emprendimiento_Microcreditos_ECOSEM', 'Microcréditos');
        break;
      case 'audit':
        exportToExcel(auditLogs, 'Auditoria_Cumplimiento_ECOSEM', 'Auditoría');
        break;
      case 'dashboard':
      default:
        exportToExcel(workers, 'Personal_Y_Resumen_ECOSEM', 'Personal ECOSEM');
        break;
    }
  };

  // Handlers para Módulos Operativos Extendidos
  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  // Descansos Medicos (03)
  const handleAddDescanso = (newLeave: DescansoMedico) => setDescansos([newLeave, ...descansos]);
  const handleUpdateDescanso = (updated: DescansoMedico) =>
    setDescansos(descansos.map((d) => (d.idDescanso === updated.idDescanso ? updated : d)));
  const handleDeleteDescanso = (id: string) => {
    setDescansos(
      descansos.map((d) =>
        d.idDescanso === id ? { ...d, deletedAt: new Date().toISOString(), deletedBy: 'Piero Admin' } : d
      )
    );
  };

  // Prestamos y Ayudas (04)
  const handleAddPrestamo = (newLoan: PrestamoAyuda) => setPrestamos([newLoan, ...prestamos]);
  const handleUpdatePrestamo = (updated: PrestamoAyuda) =>
    setPrestamos(prestamos.map((p) => (p.idPrestamo === updated.idPrestamo ? updated : p)));
  const handleDeletePrestamo = (id: string) => {
    setPrestamos(
      prestamos.map((p) =>
        p.idPrestamo === id ? { ...p, deletedAt: new Date().toISOString(), deletedBy: 'Piero Admin' } : p
      )
    );
  };

  // SCTR Pólizas (05)
  const handleAddSctr = (newSctr: SCTRPoliza) => setSctrs([newSctr, ...sctrs]);
  const handleUpdateSctr = (updated: SCTRPoliza) =>
    setSctrs(sctrs.map((s) => (s.idPoliza === updated.idPoliza ? updated : s)));
  const handleDeleteSctr = (id: string) => {
    setSctrs(
      sctrs.map((s) =>
        s.idPoliza === id ? { ...s, deletedAt: new Date().toISOString(), deletedBy: 'Piero Admin' } : s
      )
    );
  };

  // Atenciones Sociales (06)
  const handleAddAtencion = (newAten: AtencionSocial) => setAtenciones([newAten, ...atenciones]);
  const handleDeleteAtencion = (id: string) => {
    setAtenciones(
      atenciones.map((a) =>
        a.idAtencion === id ? { ...a, deletedAt: new Date().toISOString(), deletedBy: 'Piero Admin' } : a
      )
    );
  };

  // Handler de Sincronización Offline PWA
  const handleOfflineSyncItem = (tableName: string, actionType: string, decryptedPayload: any) => {
    try {
      const data = JSON.parse(decryptedPayload);
      if (tableName === 'atenciones') {
        setAtenciones((prev) => [data, ...prev]);
      } else if (tableName === 'descansos') {
        setDescansos((prev) => [data, ...prev]);
      }
    } catch (e) {
      console.error('Error sincronizando ítem offline:', e);
    }
  };

  const handleAddAccident = (newAcc: AccidenteTrabajo) => setAccidentes([newAcc, ...accidentes]);
  const handleUpdateAccident = (updatedAcc: AccidenteTrabajo) =>
    setAccidentes(accidentes.map((a) => (a.idAccidente === updatedAcc.idAccidente ? updatedAcc : a)));

  const handleAddAsignacionCampamento = (newAsig: CampamentoHabitacion) =>
    setCampamentos([newAsig, ...campamentos]);
  const handleUpdateAsignacionCampamento = (updatedAsig: CampamentoHabitacion) =>
    setCampamentos(campamentos.map((c) => (c.idAsignacion === updatedAsig.idAsignacion ? updatedAsig : c)));

  const handleAddEntrega = (newEnt: EntregaBeneficio) => setEntregas([newEnt, ...entregas]);
  const handleUpdateEntrega = (updatedEnt: EntregaBeneficio) =>
    setEntregas(entregas.map((e) => (e.idEntrega === updatedEnt.idEntrega ? updatedEnt : e)));

  const handleAddSolicitud = (newSol: SolicitudAprobacion) => setSolicitudes([newSol, ...solicitudes]);
  const handleUpdateSolicitud = (updatedSol: SolicitudAprobacion) =>
    setSolicitudes(solicitudes.map((s) => (s.idSolicitud === updatedSol.idSolicitud ? updatedSol : s)));

  const handleTriggerBackup = () => {
    setResilienceMetrics((prev: ResilienceMetrics) => ({
      ...prev,
      lastBackupTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }));
  };

  const handleToggleFailover = () => {
    setResilienceMetrics((prev: ResilienceMetrics) => ({
      ...prev,
      isFailoverActive: !prev.isFailoverActive,
      nodeStatus: !prev.isFailoverActive
        ? 'Failover Replica (AWS-SA-EAST-1)'
        : 'Primary (Morococha Node 01)',
    }));
  };

  const handleSimulateRTO = () => {
    setResilienceMetrics((prev: ResilienceMetrics) => ({
      ...prev,
      lastBackupTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }));
  };

  const isPortal = activeModule === 'room-checkin-portal';

  return (
    <div className={`min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950 transition-colors ${
      isHighContrast ? 'bg-black text-white' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Header Bar */}
      {!isPortal && (
        <Navbar
          activeModule={activeModule}
          onNavigate={(mod) => setActiveModule(mod)}
          onExportCurrentModule={handleExportCurrentModuleToExcel}
          tenants={tenants}
          currentTenantId={currentTenantId}
          onTenantChange={setCurrentTenantId}
          isOnline={isOnline}
          onToggleOnline={() => setIsOnline(!isOnline)}
          isHighContrast={isHighContrast}
          onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isMfaVerified={isMfaVerified}
          onOpenMfaModal={() => setIsMfaOpen(true)}
          onOpenDbSyncModal={() => setIsDbSyncModalOpen(true)}
        />
      )}

      <div className={isPortal ? "flex-1 w-full mx-auto" : "flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto p-3 sm:p-5 gap-5"}>
        
        {/* Navigation Sidebar */}
        {!isPortal && <Sidebar activeModule={activeModule} onNavigate={(mod) => setActiveModule(mod)} />}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <ErrorBoundary fallbackModuleName={activeModule}>
          {activeModule === 'dashboard' && (
            <DashboardPage
              requests={benefitRequests}
              onNavigate={(mod: ActiveModule) => setActiveModule(mod)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenRoomModal={() => setIsRoomModalOpen(true)}
              onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            />
          )}

          {activeModule === 'accidents-subsidies' && (
            <AccidentsSubsidiesPage
              accidentes={accidentes}
              workers={workers}
              onAddAccident={handleAddAccident}
              onUpdateAccident={handleUpdateAccident}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'camp-housing' && (
            <CampHousingManagementPage
              campamentos={campamentos}
              workers={workers}
              onAddAsignacion={handleAddAsignacionCampamento}
              onUpdateAsignacion={handleUpdateAsignacionCampamento}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'events-climate' && (
            <EventsClimatePage
              entregas={entregas}
              workers={workers}
              onAddEntrega={handleAddEntrega}
              onUpdateEntrega={handleUpdateEntrega}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'bereavement-workflow' && (
            <BereavementWorkflowPage
              solicitudes={solicitudes}
              workers={workers}
              onAddSolicitud={handleAddSolicitud}
              onUpdateSolicitud={handleUpdateSolicitud}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'resilience-backup' && (
            <ResilienceBackupPage
              metrics={resilienceMetrics}
              onTriggerBackup={handleTriggerBackup}
              onToggleFailover={handleToggleFailover}
              onSimulateRTO={handleSimulateRTO}
            />
          )}

          {activeModule === 'medical-leaves' && (
            <MedicalLeaveManagementPage
              descansos={descansos}
              workers={workers}
              onAddDescanso={handleAddDescanso}
              onUpdateDescanso={handleUpdateDescanso}
              onDeleteDescanso={handleDeleteDescanso}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'loans-assistance' && (
            <LoansSocialAssistancePage
              prestamos={prestamos}
              atenciones={atenciones}
              visitas={visitas}
              workers={workers}
              onAddPrestamo={handleAddPrestamo}
              onUpdatePrestamo={handleUpdatePrestamo}
              onDeletePrestamo={handleDeletePrestamo}
              onAddAtencion={handleAddAtencion}
              onDeleteAtencion={handleDeleteAtencion}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'sctr-management' && (
            <SCTRManagementPage
              sctrs={sctrs}
              workers={workers}
              onAddSctr={handleAddSctr}
              onUpdateSctr={handleUpdateSctr}
              onDeleteSctr={handleDeleteSctr}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'predictive-analytics' && (
            <PredictiveAnalyticsPage
              workers={workers}
              descansos={descansos}
              currentTenantName={currentTenant.name}
            />
          )}

          {activeModule === 'room-checkin-portal' && (
            <RoomCheckinPortal
              workers={workers}
              onAddAttendance={handleScanSuccess}
              attendanceRecords={attendanceRecords}
              onBackToDashboard={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setActiveModule('dashboard');
              }}
            />
          )}

          {activeModule === 'workers' && (
            <WorkersManagementPage
              workers={workers}
              onAddWorker={handleAddWorker}
              onBatchAddWorkers={handleBatchAddWorkers}
              onUpdateWorker={handleUpdateWorker}
              onDeleteWorker={handleDeleteWorker}
              onLoadDemoData={handleLoadDemoData}
            />
          )}

          {activeModule === 'worker-portal' && (
            <WorkerPortalPage
              workers={workers}
              onSaveIncident={handleSaveIncident}
            />
          )}

          {activeModule === 'qr-attendance' && (
            <QRAttendancePage
              attendanceRecords={attendanceRecords}
              workers={workers}
              onOpenScanner={() => setIsQRScannerOpen(true)}
              onExportExcel={handleExportCurrentModuleToExcel}
              onAddAttendance={handleScanSuccess}
            />
          )}

          {activeModule === 'valuation' && (
            <ValuationPage workers={workers} attendanceRecords={attendanceRecords} />
          )}

          {activeModule === 'room-management' && (
            <RoomManagementPage
              rooms={rooms}
              pabellones={pabellones}
              workers={workers}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onUpdateLinenChange={handleUpdateLinenChange}
              onOpenAICopilot={() => setIsAICopilotOpen(true)}
            />
          )}

          {activeModule === 'room-handover' && (
            <RoomDeliveryPage
              handovers={roomHandovers}
              workers={workers}
              onSaveHandover={handleSaveRoomHandover}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'incidents' && (
            <IncidentsPage
              incidents={incidents}
              onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'family-health' && (
            <FamilyHealthPage
              records={familyHealth}
              onAddRecord={handleAddFamilyHealth}
              onDeleteRecord={handleDeleteFamilyHealth}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'education' && (
            <EducationPage
              scholarships={scholarships}
              onAddScholarship={handleAddScholarship}
              onDeleteScholarship={handleDeleteScholarship}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'infrastructure' && (
            <InfrastructurePage
              projects={infrastructure}
              onAddProject={handleAddInfrastructure}
              onDeleteProject={handleDeleteInfrastructure}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'social-impact' && (
            <SocialImpactPage
              metrics={socialImpact}
              onAddMetric={handleAddSocialImpact}
              onDeleteMetric={handleDeleteSocialImpact}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'benefit-requests' && (
            <RequestsPage
              requests={benefitRequests}
              onAddRequest={handleAddBenefitRequest}
              onUpdateStatus={handleUpdateBenefitRequestStatus}
              onDeleteRequest={handleDeleteBenefitRequest}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'local-suppliers' && (
            <SuppliersPage
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'microcredits' && (
            <MicrocreditPage
              credits={microcredits}
              onAddCredit={handleAddMicrocredit}
              onDeleteCredit={handleDeleteMicrocredit}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}

          {activeModule === 'audit' && (
            <AuditCompliancePage
              logs={auditLogs}
              onAddLog={handleAddAuditLog}
              onExportExcel={handleExportCurrentModuleToExcel}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>


      {/* MODALS */}
      <QRScannerModal
        workers={workers}
        attendanceRecords={attendanceRecords}
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <RoomDeliveryDocumentModal
        handover={null}
        workers={workers}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSaveHandover={handleSaveRoomHandover}
      />

      <WhatsAppIncidentModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onSaveIncident={handleSaveIncident}
      />

      <AICopilotModal
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        rooms={rooms}
        workers={workers}
        incidents={incidents}
        attendance={attendanceRecords}
      />

      {/* Enterprise Enterprise Modals */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        workers={workers}
        sctrs={sctrs}
        prestamos={prestamos}
        onNavigate={setActiveModule}
      />

      <MFAModal
        isOpen={isMfaOpen}
        onClose={() => setIsMfaOpen(false)}
        onVerifySuccess={() => setIsMfaVerified(true)}
      />

      <DatabaseSyncModal
        isOpen={isDbSyncModalOpen}
        onClose={() => setIsDbSyncModalOpen(false)}
        onDataRestored={handleReloadAllState}
      />

    </div>
  );
}

export default App;
