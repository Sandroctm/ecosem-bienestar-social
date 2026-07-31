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

// Pages
import { DashboardPage } from './pages/DashboardPage';
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
  const [workers, setWorkers] = useState<Worker[]>(() => loadFromStorage('ecosem_workers', INITIAL_WORKERS));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('ecosem_attendance', INITIAL_ATTENDANCE));
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
  const [auditLogs, setAuditLogs] = useState(() => loadFromStorage('ecosem_audit_logs', INITIAL_AUDIT_LOGS));

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
    workerDni: string,
    serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno',
    roomNumber?: string
  ) => {
    const worker = workers.find((w) => w.dni === workerDni);
    const workerName = worker ? worker.fullName : `Trabajador DNI ${workerDni}`;
    const company = worker ? worker.company : 'Contratista';
    const camp = worker ? worker.camp : 'Campamento Minero';

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      workerDni,
      workerName,
      company,
      camp,
      serviceType,
      status: 'Válido',
      scannedBy: roomNumber ? `Auto-Registro Habitación ${roomNumber}` : 'Escáner Garita ECOSEM',
      roomNumber,
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);

    // Send to Google Sheets Webhook in background if configured
    sendToGoogleSheets(newRecord).catch((err) => console.error('Error auto-syncing sheets:', err));

    // Log audit
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      module: 'Asistencia QR',
      action: `Marcación ${serviceType} registrada para ${workerName}${roomNumber ? ` (Habitación ${roomNumber})` : ''}`,
      user: 'Supervisor Escáner',
      hashSignature: `0x${Math.random().toString(16).substring(2, 10)}`,
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

  const isPortal = activeModule === 'room-checkin-portal';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header Bar */}
      {!isPortal && (
        <Navbar
          activeModule={activeModule}
          onNavigate={(mod) => setActiveModule(mod)}
          onExportCurrentModule={handleExportCurrentModuleToExcel}
        />
      )}

      <div className={isPortal ? "flex-1 w-full mx-auto" : "flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto p-3 sm:p-5 gap-5"}>
        
        {/* Navigation Sidebar */}
        {!isPortal && <Sidebar activeModule={activeModule} onNavigate={(mod) => setActiveModule(mod)} />}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeModule === 'dashboard' && (
            <DashboardPage
              requests={benefitRequests}
              onNavigate={(mod) => setActiveModule(mod)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenRoomModal={() => setIsRoomModalOpen(true)}
              onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
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
            />
          )}

          {activeModule === 'valuation' && (
            <ValuationPage workers={workers} />
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
        </main>
      </div>


      {/* MODALS */}
      <QRScannerModal
        workers={workers}
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

    </div>
  );
}

export default App;
