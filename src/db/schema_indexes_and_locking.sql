-- =============================================================================
-- ECOSEM BIENESTAR SOCIAL — ENTERPRISE DATABASE SCHEMA & CONCURRENCY CONTROL
-- PostgreSQL Production Schema + Relational Indexes + Optimistic/Pessimistic Locking
-- =============================================================================

-- 1. CREACIÓN DE TABLAS CON SOPORTE DE BLOQUEO OPTIMISTA (version_id) Y SOFT DELETE
CREATE TABLE IF NOT EXISTS trabajadores (
    id VARCHAR(64) PRIMARY KEY,
    dni VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    camp VARCHAR(150) NOT NULL,
    room_number VARCHAR(50),
    photo_url TEXT,
    phone_whatsapp VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Activo',
    qr_code_value VARCHAR(255) UNIQUE NOT NULL,
    sctr_expiration_date DATE,
    has_active_medical_leave BOOLEAN DEFAULT FALSE,
    monthly_average_salary NUMERIC(12,2) DEFAULT 0.00,
    version_id INT DEFAULT 1 NOT NULL, -- Bloqueo Optimista contra Dirty Reads
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft Delete Global
    deleted_by VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS descansos_medicos (
    id_descanso VARCHAR(64) PRIMARY KEY,
    id_trabajador VARCHAR(64) REFERENCES trabajadores(id),
    worker_name VARCHAR(255) NOT NULL,
    worker_dni VARCHAR(15) NOT NULL,
    company VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_descanso INT NOT NULL,
    tipo_descanso VARCHAR(100) NOT NULL,
    dias_empresa INT DEFAULT 20,
    dias_essalud INT DEFAULT 0,
    monto_subsidio_estimado NUMERIC(12,2) DEFAULT 0.00,
    estado_subsidio VARCHAR(50) DEFAULT 'Pendiente Planilla',
    cie10_codigo VARCHAR(50) NOT NULL,
    cie10_diagnostico_encrypted TEXT NOT NULL, -- AES-256 Ley N° 29733
    unidad_minera VARCHAR(150) NOT NULL,
    version_id INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS campamento_habitaciones (
    id_asignacion VARCHAR(64) PRIMARY KEY,
    id_trabajador VARCHAR(64) REFERENCES trabajadores(id),
    modulo_habitacion VARCHAR(100) NOT NULL,
    cama_asignada VARCHAR(50) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE,
    estado_habitacion VARCHAR(50) DEFAULT 'Limpia / Asignada',
    version_id INT DEFAULT 1 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(150)
);

-- 2. ÍNDICES RELACIONALES PARA CONSULTAS EN TIEMPO REAL (< 50ms)
-- Previene la lentitud progresiva al superar 10,000+ registros
CREATE INDEX IF NOT EXISTS idx_trabajadores_dni ON trabajadores(dni);
CREATE INDEX IF NOT EXISTS idx_trabajadores_status ON trabajadores(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_descansos_fechas ON descansos_medicos(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_descansos_trabajador ON descansos_medicos(id_trabajador) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campamento_cama ON campamento_habitaciones(modulo_habitacion, cama_asignada) WHERE deleted_at IS NULL;

-- 3. PROCEDIMIENTO CON BLOQUEO PESIMISTA (SELECT ... FOR UPDATE)
-- Evita el choque de asignaciones simultáneas (Dirty Reads) en camas o apoyos económicos
CREATE OR REPLACE FUNCTION asignar_cama_campamento_transaccional(
    p_id_asignacion VARCHAR,
    p_id_trabajador VARCHAR,
    p_modulo VARCHAR,
    p_cama VARCHAR,
    p_fecha_ingreso DATE
) RETURNS BOOLEAN AS $$
DECLARE
    v_cama_ocupada INT;
BEGIN
    -- Bloquear el registro especifico para evitar race condition
    PERFORM 1 
    FROM campamento_habitaciones 
    WHERE modulo_habitacion = p_modulo 
      AND cama_asignada = p_cama 
      AND fecha_salida IS NULL 
      AND deleted_at IS NULL
    FOR UPDATE;

    SELECT COUNT(*) INTO v_cama_ocupada
    FROM campamento_habitaciones
    WHERE modulo_habitacion = p_modulo 
      AND cama_asignada = p_cama 
      AND fecha_salida IS NULL 
      AND deleted_at IS NULL;

    IF v_cama_ocupada > 0 THEN
        RAISE EXCEPTION 'La cama % en módulo % ya fue asignada por otra sesión.', p_cama, p_modulo;
        RETURN FALSE;
    END IF;

    INSERT INTO campamento_habitaciones (id_asignacion, id_trabajador, modulo_habitacion, cama_asignada, fecha_ingreso)
    VALUES (p_id_asignacion, p_id_trabajador, p_modulo, p_cama, p_fecha_ingreso);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. GUÍA DE CONFIGURACIÓN DE CONCENTRADOR DE CONEXIONES (PgBouncer Pooler)
-- Prevención de Fuga de Conexiones (Connection Leaks)
-- file: pgbouncer.ini
-- [pgbouncer]
-- pool_mode = transaction
-- max_client_conn = 2000
-- default_pool_size = 50
-- reserve_pool_size = 10
