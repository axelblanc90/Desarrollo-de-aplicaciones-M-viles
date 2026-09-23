-- 001_initial_schema.sql
-- AgroPulse (TP4) Initial Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Memberships
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('producer', 'operator', 'advisor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

-- 3. Plots
CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop TEXT NOT NULL,
    geom JSONB NOT NULL, -- GeoJSON polygon: coordinates array [[lng, lat], ...]
    threshold_min NUMERIC NOT NULL DEFAULT 25,
    threshold_max NUMERIC NOT NULL DEFAULT 45,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Stations
CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Readings
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    moisture_pct NUMERIC NOT NULL,
    temp_c NUMERIC NOT NULL,
    rain_mm NUMERIC NOT NULL DEFAULT 0,
    source TEXT NOT NULL CHECK (source IN ('sensor', 'manual')) DEFAULT 'sensor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_station_measured_at 
ON readings (station_id, measured_at DESC);

-- 6. Valves
CREATE TABLE IF NOT EXISTS valves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'closed',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Irrigation Commands
CREATE TABLE IF NOT EXISTS irrigation_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    valve_id UUID NOT NULL REFERENCES valves(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN ('open', 'close')),
    duration_min INTEGER CHECK (duration_min >= 1 AND duration_min <= 120),
    status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'failed', 'cancelled')) DEFAULT 'pending',
    client_request_id UUID UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_at TIMESTAMPTZ
);

-- RF-16: Reject concurrent pending commands for the same valve
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_command_per_valve 
ON irrigation_commands(valve_id) 
WHERE status = 'pending';

-- 8. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('dry', 'stale', 'system')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);
