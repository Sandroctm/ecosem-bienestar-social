import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ActiveModule, Worker, AttendanceRecord, RoomHandover, IncidentReport, ValuationItem } from './types';
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
} from './utils/mockData';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { QRAttendancePage } from './pages/QRAttendancePage';
import { ValuationPage } from './pages/ValuationPage';
import { RoomDeliveryPage } from './pages/RoomDeliveryPage';
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

// Modals
import { QRScannerModal } from './components/QRScannerModal';
import { RoomDeliveryDocumentModal } from './components/RoomDeliveryDocumentModal';
import { WhatsAppIncidentModal } from './components/WhatsAppIncidentModal';

// Excel Exporter
import { exportToExcel } from './utils/excelExport';

export function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  // Application Data States (Clean / Empty by default per user request)
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [valuations, setValuations] = useState<ValuationItem[]>(INITIAL_VALUATIONS);
  const [roomHandovers, setRoomHandovers] = useState<RoomHandover[]>(INITIAL_ROOM_HANDOVERS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [familyHealth, setFamilyHealth] = useState(INITIAL_FAMILY_HEALTH);
  const [scholarships, setScholarships] = useState(INITIAL_SCHOLARSHIPS);
  const [infrastructure, setInfrastructure] = useState(INITIAL_INFRASTRUCTURE);
  const [socialImpact, setSocialImpact] = useState(INITIAL_SOCIAL_IMPACT);
  const [benefitRequests, setBenefitRequests] = useState(INITIAL_BENEFIT_REQUESTS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [microcredits, setMicrocredits] = useState(INITIAL_MICROCREDITS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Modals state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Worker registration handlers
  const handleAddWorker = (newWorker: Worker) => {
    setWorkers([newWorker, ...workers]);
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers(workers.filter((w) => w.id !== workerId));
  };

  const handleLoadDemoData = () => {
    setWorkers(DEMO_WORKERS);
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
    serviceType: 'Almuerzo' | 'Cena' | 'Alojamiento' | 'Ingreso Campamento' | 'Desayuno'
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
      scannedBy: 'Escáner Garita ECOSEM',
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);

    // Log audit
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      module: 'Asistencia QR',
      action: `Marcación ${serviceType} registrada para ${workerName}`,
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <Navbar
        activeModule={activeModule}
        onNavigate={(mod) => setActiveModule(mod)}
        onExportCurrentModule={handleExportCurrentModuleToExcel}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto p-3 sm:p-5 gap-5">
        
        {/* Navigation Sidebar */}
        <Sidebar activeModule={activeModule} onNavigate={(mod) => setActiveModule(mod)} />

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

          {activeModule === 'workers' && (
            <WorkersManagementPage
              workers={workers}
              onAddWorker={handleAddWorker}
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
            <ValuationPage
              valuations={valuations}
              onAddValuation={handleAddValuation}
              onExportExcel={handleExportCurrentModuleToExcel}
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

    </div>
  );
}

export default App;
