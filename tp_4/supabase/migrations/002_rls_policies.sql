-- 002_rls_policies.sql
-- Row Level Security (RLS) and Realtime Publication for AgroPulse

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE valves ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Helper function: get user organizations
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT organization_id FROM memberships WHERE user_id = auth.uid();
$$;

-- Helper function: check if user has active producer/operator role in org
CREATE OR REPLACE FUNCTION is_producer_or_operator(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM memberships 
        WHERE user_id = auth.uid() 
          AND organization_id = org_id 
          AND role IN ('producer', 'operator')
    );
$$;

-- 1. Organizations: SELECT if member
CREATE POLICY "Users can view organizations they belong to"
ON organizations FOR SELECT
TO authenticated
USING (id IN (SELECT get_user_organizations()));

-- 2. Memberships: SELECT if member of same org
CREATE POLICY "Users can view memberships of their organizations"
ON memberships FOR SELECT
TO authenticated
USING (organization_id IN (SELECT get_user_organizations()));

-- 3. Plots: SELECT if member, UPDATE thresholds if producer or operator
CREATE POLICY "Users can view plots of their organizations"
ON plots FOR SELECT
TO authenticated
USING (organization_id IN (SELECT get_user_organizations()));

CREATE POLICY "Producers and operators can update plot thresholds"
ON plots FOR UPDATE
TO authenticated
USING (is_producer_or_operator(organization_id))
WITH CHECK (is_producer_or_operator(organization_id));

-- 4. Stations: SELECT if member
CREATE POLICY "Users can view stations of their organizations"
ON stations FOR SELECT
TO authenticated
USING (
    plot_id IN (
        SELECT id FROM plots WHERE organization_id IN (SELECT get_user_organizations())
    )
);

-- 5. Readings: SELECT if member, INSERT manual reading if producer/operator
CREATE POLICY "Users can view readings of their stations"
ON readings FOR SELECT
TO authenticated
USING (
    station_id IN (
        SELECT s.id FROM stations s
        JOIN plots p ON p.id = s.plot_id
        WHERE p.organization_id IN (SELECT get_user_organizations())
    )
);

CREATE POLICY "Producers and operators can insert manual readings"
ON readings FOR INSERT
TO authenticated
WITH CHECK (
    source = 'manual' AND
    station_id IN (
        SELECT s.id FROM stations s
        JOIN plots p ON p.id = s.plot_id
        WHERE is_producer_or_operator(p.organization_id)
    )
);

-- 6. Valves: SELECT if member, UPDATE by service_role (worker) or producer/operator
CREATE POLICY "Users can view valves of their plots"
ON valves FOR SELECT
TO authenticated
USING (
    plot_id IN (
        SELECT id FROM plots WHERE organization_id IN (SELECT get_user_organizations())
    )
);

-- 7. Irrigation Commands: SELECT if member, INSERT if producer or operator
CREATE POLICY "Users can view irrigation commands"
ON irrigation_commands FOR SELECT
TO authenticated
USING (
    valve_id IN (
        SELECT v.id FROM valves v
        JOIN plots p ON p.id = v.plot_id
        WHERE p.organization_id IN (SELECT get_user_organizations())
    )
);

CREATE POLICY "Producers and operators can create irrigation commands"
ON irrigation_commands FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = requested_by AND
    valve_id IN (
        SELECT v.id FROM valves v
        JOIN plots p ON p.id = v.plot_id
        WHERE is_producer_or_operator(p.organization_id)
    )
);

CREATE POLICY "Producers and operators can cancel pending commands"
ON irrigation_commands FOR UPDATE
TO authenticated
USING (
    status = 'pending' AND
    auth.uid() = requested_by
)
WITH CHECK (
    status = 'cancelled'
);

-- 8. Alerts: SELECT if member, UPDATE read_at if member
CREATE POLICY "Users can view alerts of their plots"
ON alerts FOR SELECT
TO authenticated
USING (
    plot_id IN (
        SELECT id FROM plots WHERE organization_id IN (SELECT get_user_organizations())
    )
);

CREATE POLICY "Users can mark alerts as read"
ON alerts FOR UPDATE
TO authenticated
USING (
    plot_id IN (
        SELECT id FROM plots WHERE organization_id IN (SELECT get_user_organizations())
    )
)
WITH CHECK (
    read_at IS NOT NULL
);

-- Enable Supabase Realtime for live updates
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE readings;
    ALTER PUBLICATION supabase_realtime ADD TABLE valves;
    ALTER PUBLICATION supabase_realtime ADD TABLE irrigation_commands;
    ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
