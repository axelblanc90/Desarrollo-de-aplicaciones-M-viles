-- seed.sql
-- AgroPulse (TP4) Seed Data for "Estancia Didáctica Concordia"

-- Note: In Supabase, auth.users are created via Auth API or SQL if permissions allow.
-- Here we provide fixed UUIDs so foreign keys align cleanly.

DO $$
DECLARE
    org_id UUID := 'a0000000-0000-0000-0000-000000000001';
    
    -- Users UUIDs
    user_producer UUID := 'u0000000-0000-0000-0000-000000000001';
    user_operator UUID := 'u0000000-0000-0000-0000-000000000002';
    user_advisor  UUID := 'u0000000-0000-0000-0000-000000000003';
    
    -- Plots UUIDs
    plot_costa1 UUID := 'b0000000-0000-0000-0000-000000000001';
    plot_costa2 UUID := 'b0000000-0000-0000-0000-000000000002';
    plot_montea  UUID := 'b0000000-0000-0000-0000-000000000003';

    -- Stations UUIDs
    station_c1 UUID := 'c0000000-0000-0000-0000-000000000001';
    station_c2 UUID := 'c0000000-0000-0000-0000-000000000002';
    station_ma UUID := 'c0000000-0000-0000-0000-000000000003';

    -- Valves UUIDs
    valve_c1 UUID := 'd0000000-0000-0000-0000-000000000001';
    valve_c2 UUID := 'd0000000-0000-0000-0000-000000000002';
    valve_ma UUID := 'd0000000-0000-0000-0000-000000000003';

BEGIN
    -- 1. Create Organization
    INSERT INTO organizations (id, name, region)
    VALUES (org_id, 'Estancia Didáctica Concordia', 'Concordia, Entre Ríos')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- 2. Create Auth Users if they do not exist (Standard Supabase Auth seed pattern)
    -- Producer
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
        user_producer,
        'productor@agropulse.test',
        crypt('AgroPulse2026!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Carlos Productor"}',
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- Operator
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
        user_operator,
        'operador@agropulse.test',
        crypt('AgroPulse2026!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Mateo Operador"}',
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- Advisor
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
        user_advisor,
        'asesor@agropulse.test',
        crypt('AgroPulse2026!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Ing. Agr. Lucía Asesora"}',
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Memberships
    INSERT INTO memberships (user_id, organization_id, role)
    VALUES 
        (user_producer, org_id, 'producer'),
        (user_operator, org_id, 'operator'),
        (user_advisor,  org_id, 'advisor')
    ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role;

    -- 4. Plots (Coordinates in Concordia, Entre Ríos: ~ -31.390, -58.020)
    -- Plot 1: Costa 1 (Citrus, Optimal)
    INSERT INTO plots (id, organization_id, name, crop, threshold_min, threshold_max, geom)
    VALUES (
        plot_costa1,
        org_id,
        'Costa 1',
        'Citrus',
        25,
        45,
        '{
            "type": "Polygon",
            "coordinates": [[
                [-58.0250, -31.3920],
                [-58.0200, -31.3920],
                [-58.0200, -31.3960],
                [-58.0250, -31.3960],
                [-58.0250, -31.3920]
            ]]
        }'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Plot 2: Costa 2 (Citrus, Dry for demo)
    INSERT INTO plots (id, organization_id, name, crop, threshold_min, threshold_max, geom)
    VALUES (
        plot_costa2,
        org_id,
        'Costa 2',
        'Citrus',
        25,
        45,
        '{
            "type": "Polygon",
            "coordinates": [[
                [-58.0190, -31.3920],
                [-58.0140, -31.3920],
                [-58.0140, -31.3960],
                [-58.0190, -31.3960],
                [-58.0190, -31.3920]
            ]]
        }'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Plot 3: Monte A (Soja, Stale demonstration)
    INSERT INTO plots (id, organization_id, name, crop, threshold_min, threshold_max, geom)
    VALUES (
        plot_montea,
        org_id,
        'Monte A',
        'Soja',
        20,
        40,
        '{
            "type": "Polygon",
            "coordinates": [[
                [-58.0250, -31.3970],
                [-58.0140, -31.3970],
                [-58.0140, -31.4020],
                [-58.0250, -31.4020],
                [-58.0250, -31.3970]
            ]]
        }'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- 5. Stations
    INSERT INTO stations (id, plot_id, name, lat, lng)
    VALUES
        (station_c1, plot_costa1, 'Estación Costa 1-A', -31.3940, -58.0225),
        (station_c2, plot_costa2, 'Estación Costa 2-B', -31.3940, -58.0165),
        (station_ma, plot_montea,  'Estación Monte A-1', -31.3995, -58.0195)
    ON CONFLICT (id) DO NOTHING;

    -- 6. Valves
    INSERT INTO valves (id, plot_id, name, status)
    VALUES
        (valve_c1, plot_costa1, 'Válvula Principal C1', 'closed'),
        (valve_c2, plot_costa2, 'Válvula Aspersores C2', 'closed'),
        (valve_ma, plot_montea,  'Válvula Goteo M1',     'closed')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Initial Telemetry Readings (Historical points for the last 6h + current reading)
    -- Costa 1: Optimal moisture (~32-35%)
    INSERT INTO readings (station_id, measured_at, moisture_pct, temp_c, rain_mm, source)
    SELECT 
        station_c1,
        now() - (interval '30 minutes' * s),
        32 + (sin(s)::numeric * 2),
        22 + (cos(s)::numeric * 3),
        0,
        'sensor'
    FROM generate_series(0, 12) AS s;

    -- Costa 2: Dry moisture (< 25%, e.g., 18%)
    INSERT INTO readings (station_id, measured_at, moisture_pct, temp_c, rain_mm, source)
    SELECT 
        station_c2,
        now() - (interval '30 minutes' * s),
        18 + (sin(s)::numeric * 1.5),
        27 + (cos(s)::numeric * 2),
        0,
        'sensor'
    FROM generate_series(0, 12) AS s;

    -- Monte A: Stale (reading older than 25 minutes ago)
    INSERT INTO readings (station_id, measured_at, moisture_pct, temp_c, rain_mm, source)
    SELECT 
        station_ma,
        now() - interval '25 minutes' - (interval '30 minutes' * s),
        26 + (sin(s)::numeric * 2),
        21 + (cos(s)::numeric * 2),
        0,
        'sensor'
    FROM generate_series(0, 12) AS s;

    -- 8. Initial Alerts
    INSERT INTO alerts (plot_id, type, payload)
    VALUES
        (plot_costa2, 'dry', '{"message": "Humedad bajo umbral mínimo (18%). Se sugiere regar.", "moisture_pct": 18}'),
        (plot_montea, 'stale', '{"message": "Estación Monte A-1 sin telemetría reciente (>15 min).", "last_seen_min": 25}');

END $$;
