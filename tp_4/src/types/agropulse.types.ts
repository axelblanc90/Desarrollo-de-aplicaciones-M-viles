export type UserRole = 'producer' | 'operator' | 'advisor';

export type PlotStatus = 'optimal' | 'dry' | 'wet' | 'stale';

export type ValveStatus = 'open' | 'closed';

export type CommandAction = 'open' | 'close';

export type CommandStatus = 'pending' | 'applied' | 'failed' | 'cancelled';

export interface Organization {
  id: string;
  name: string;
  region: string;
  created_at?: string;
}

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [[lng, lat], ...]
}

export interface Plot {
  id: string;
  organization_id: string;
  name: string;
  crop: string;
  geom: GeoPolygon;
  threshold_min: number;
  threshold_max: number;
  created_at?: string;
}

export interface Station {
  id: string;
  plot_id: string;
  name: string;
  lat: number;
  lng: number;
  created_at?: string;
}

export interface Reading {
  id: string;
  station_id: string;
  measured_at: string;
  moisture_pct: number;
  temp_c: number;
  rain_mm: number;
  source: 'sensor' | 'manual';
  created_at?: string;
}

export interface Valve {
  id: string;
  plot_id: string;
  name: string;
  status: ValveStatus;
  updated_at?: string;
}

export interface IrrigationCommand {
  id: string;
  valve_id: string;
  requested_by: string;
  action: CommandAction;
  duration_min?: number;
  status: CommandStatus;
  client_request_id: string;
  created_at: string;
  applied_at?: string | null;
}

export interface Alert {
  id: string;
  plot_id: string;
  type: 'dry' | 'stale' | 'system';
  payload: {
    message: string;
    moisture_pct?: number;
    last_seen_min?: number;
  };
  created_at: string;
  read_at?: string | null;
}

export interface PlotWithTelemetry extends Plot {
  status: PlotStatus;
  latestReading?: Reading;
  valves: Valve[];
  stations: Station[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}
