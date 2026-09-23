import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Alert,
  CommandAction,
  IrrigationCommand,
  Plot,
  PlotStatus,
  PlotWithTelemetry,
  Reading,
  Station,
  Valve,
} from '../types/agropulse.types';
import { calculatePlotStatus } from '../lib/plotStatusCalculator';
import { generateUUID } from '../lib/idempotency';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { enqueueManualReading, syncQueuedReadings } from '../services/offlineQueue';
import { useAuth } from './AuthContext';

export interface AgroContextType {
  plots: PlotWithTelemetry[];
  alerts: Alert[];
  commands: IrrigationCommand[];
  historicalReadings: Record<string, Reading[]>; // stationId -> Reading[]
  lastTickTime: string | null;
  apparentLagMs: number;
  isOnline: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updatePlotThresholds: (plotId: string, min: number, max: number) => Promise<{ error?: string }>;
  sendIrrigationCommand: (params: {
    valveId: string;
    plotId: string;
    action: CommandAction;
    durationMin?: number;
  }) => Promise<{ success: boolean; error?: string; command?: IrrigationCommand }>;
  cancelPendingCommand: (commandId: string) => Promise<{ success: boolean; error?: string }>;
  submitManualReading: (data: {
    stationId: string;
    plotId: string;
    moisturePct: number;
    tempC: number;
    rainMm?: number;
    notes?: string;
    lat?: number;
    lng?: number;
  }) => Promise<{ queued: boolean; error?: string }>;
  markAlertAsRead: (alertId: string) => Promise<void>;
}

// Initial seed plots matching seed.sql
const INITIAL_SEED_PLOTS: PlotWithTelemetry[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    organization_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Costa 1',
    crop: 'Citrus',
    threshold_min: 25,
    threshold_max: 45,
    geom: {
      type: 'Polygon',
      coordinates: [[
        [-58.0250, -31.3920],
        [-58.0200, -31.3920],
        [-58.0200, -31.3960],
        [-58.0250, -31.3960],
        [-58.0250, -31.3920],
      ]],
    },
    status: 'optimal',
    valves: [
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        plot_id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Válvula Principal C1',
        status: 'closed',
      },
    ],
    stations: [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        plot_id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Estación Costa 1-A',
        lat: -31.3940,
        lng: -58.0225,
      },
    ],
    latestReading: {
      id: 'r-seed-1',
      station_id: 'c0000000-0000-0000-0000-000000000001',
      moisture_pct: 34.2,
      temp_c: 22.4,
      rain_mm: 0,
      source: 'sensor',
      measured_at: new Date().toISOString(),
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    organization_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Costa 2',
    crop: 'Citrus',
    threshold_min: 25,
    threshold_max: 45,
    geom: {
      type: 'Polygon',
      coordinates: [[
        [-58.0190, -31.3920],
        [-58.0140, -31.3920],
        [-58.0140, -31.3960],
        [-58.0190, -31.3960],
        [-58.0190, -31.3920],
      ]],
    },
    status: 'dry',
    valves: [
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        plot_id: 'b0000000-0000-0000-0000-000000000002',
        name: 'Válvula Aspersores C2',
        status: 'closed',
      },
    ],
    stations: [
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        plot_id: 'b0000000-0000-0000-0000-000000000002',
        name: 'Estación Costa 2-B',
        lat: -31.3940,
        lng: -58.0165,
      },
    ],
    latestReading: {
      id: 'r-seed-2',
      station_id: 'c0000000-0000-0000-0000-000000000002',
      moisture_pct: 18.0,
      temp_c: 27.5,
      rain_mm: 0,
      source: 'sensor',
      measured_at: new Date().toISOString(),
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    organization_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Monte A',
    crop: 'Soja',
    threshold_min: 20,
    threshold_max: 40,
    geom: {
      type: 'Polygon',
      coordinates: [[
        [-58.0250, -31.3970],
        [-58.0140, -31.3970],
        [-58.0140, -31.4020],
        [-58.0250, -31.4020],
        [-58.0250, -31.3970],
      ]],
    },
    status: 'stale',
    valves: [
      {
        id: 'd0000000-0000-0000-0000-000000000003',
        plot_id: 'b0000000-0000-0000-0000-000000000003',
        name: 'Válvula Goteo M1',
        status: 'closed',
      },
    ],
    stations: [
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        plot_id: 'b0000000-0000-0000-0000-000000000003',
        name: 'Estación Monte A-1',
        lat: -31.3995,
        lng: -58.0195,
      },
    ],
    latestReading: {
      id: 'r-seed-3',
      station_id: 'c0000000-0000-0000-0000-000000000003',
      moisture_pct: 26.0,
      temp_c: 21.0,
      rain_mm: 0,
      source: 'sensor',
      // Stale: measured 25 minutes ago
      measured_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
  },
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    plot_id: 'b0000000-0000-0000-0000-000000000002',
    type: 'dry',
    payload: {
      message: 'Lote Costa 2: Humedad bajo umbral mínimo (18%). Se recomienda regar.',
      moisture_pct: 18,
    },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read_at: null,
  },
  {
    id: 'alt-2',
    plot_id: 'b0000000-0000-0000-0000-000000000003',
    type: 'stale',
    payload: {
      message: 'Estación Monte A-1 sin telemetría reciente (>15 min). Posible corte de sensor.',
      last_seen_min: 25,
    },
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read_at: null,
  },
];

// Helper to generate 6-hour history points for chart
function generateInitialHistoricalPoints(): Record<string, Reading[]> {
  const result: Record<string, Reading[]> = {};
  const now = Date.now();

  INITIAL_SEED_PLOTS.forEach((plot) => {
    const station = plot.stations[0];
    if (!station) return;

    const baseMoisture = plot.id.includes('2') ? 18 : plot.id.includes('3') ? 26 : 34;
    const points: Reading[] = [];

    for (let i = 12; i >= 0; i--) {
      const timeOffsetMs = i * 30 * 60 * 1000;
      const pointTime = new Date(now - timeOffsetMs).toISOString();
      const wave = Math.sin(i / 2) * 1.5;
      points.push({
        id: `hist-${station.id}-${i}`,
        station_id: station.id,
        moisture_pct: Number((baseMoisture + wave).toFixed(1)),
        temp_c: Number((24 + Math.cos(i) * 2).toFixed(1)),
        rain_mm: 0,
        source: 'sensor',
        measured_at: pointTime,
      });
    }
    result[station.id] = points;
  });

  return result;
}

const AgroContext = createContext<AgroContextType | undefined>(undefined);

export const AgroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plots, setPlots] = useState<PlotWithTelemetry[]>(INITIAL_SEED_PLOTS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [commands, setCommands] = useState<IrrigationCommand[]>([]);
  const [historicalReadings, setHistoricalReadings] = useState<Record<string, Reading[]>>(
    generateInitialHistoricalPoints()
  );
  const [lastTickTime, setLastTickTime] = useState<string | null>(new Date().toISOString());
  const [apparentLagMs, setApparentLagMs] = useState<number>(120);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Recalculate status for all plots
  const updatePlotsWithStatus = useCallback((targetPlots: PlotWithTelemetry[]) => {
    return targetPlots.map((plot) => {
      const status = calculatePlotStatus({
        latestReading: plot.latestReading,
        thresholdMin: plot.threshold_min,
        thresholdMax: plot.threshold_max,
        now: new Date(),
      });
      return { ...plot, status };
    });
  }, []);

  // Periodic recalculation (e.g. check for stale every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setPlots((prev) => updatePlotsWithStatus(prev));
    }, 15000);
    return () => clearInterval(timer);
  }, [updatePlotsWithStatus]);

  // Try to sync offline queue periodically when online
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const syncInterval = setInterval(async () => {
      try {
        await syncQueuedReadings(supabase);
      } catch (err) {
        console.warn('[SYNC QUEUE] Background sync check failed:', err);
      }
    }, 20000);
    return () => clearInterval(syncInterval);
  }, []);

  // Live Realtime listener or Mock Simulated Telemetry
  useEffect(() => {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('agropulse-realtime-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'readings' },
          (payload) => {
            const newReading = payload.new as Reading;
            handleNewReading(newReading);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'valves' },
          (payload) => {
            const updatedValve = payload.new as Valve;
            handleValveUpdate(updatedValve);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'irrigation_commands' },
          (payload) => {
            const cmd = payload.new as IrrigationCommand;
            handleCommandUpdate(cmd);
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alerts' },
          (payload) => {
            const alert = payload.new as Alert;
            setAlerts((prev) => [alert, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // In standalone Demo/Academic mode without docker or supabase,
      // simulate realistic ticks for Costa 1 and Costa 2 every 6 seconds
      const interval = setInterval(() => {
        const now = new Date();
        const nowIso = now.toISOString();
        setLastTickTime(nowIso);
        setApparentLagMs(Math.floor(80 + Math.random() * 80));

        // Tick Costa 1
        const c1Reading: Reading = {
          id: 'tick-' + Date.now(),
          station_id: 'c0000000-0000-0000-0000-000000000001',
          moisture_pct: Number((33.5 + (Math.random() - 0.5) * 1.2).toFixed(1)),
          temp_c: Number((22.0 + (Math.random() - 0.5) * 0.8).toFixed(1)),
          rain_mm: 0,
          source: 'sensor',
          measured_at: nowIso,
        };
        handleNewReading(c1Reading);

        // Tick Costa 2 (remains dry)
        const c2Reading: Reading = {
          id: 'tick-' + (Date.now() + 1),
          station_id: 'c0000000-0000-0000-0000-000000000002',
          moisture_pct: Number((18.0 + (Math.random() - 0.5) * 0.9).toFixed(1)),
          temp_c: Number((27.5 + (Math.random() - 0.5) * 0.8).toFixed(1)),
          rain_mm: 0,
          source: 'sensor',
          measured_at: nowIso,
        };
        handleNewReading(c2Reading);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleNewReading = (reading: Reading) => {
    const receivedTime = Date.now();
    const measuredTime = new Date(reading.measured_at).getTime();
    const lag = Math.max(10, receivedTime - measuredTime);
    setApparentLagMs(Math.min(lag, 999));
    setLastTickTime(reading.measured_at);

    setPlots((prev) =>
      prev.map((plot) => {
        const isStationInPlot = plot.stations.some((s) => s.id === reading.station_id);
        if (isStationInPlot) {
          const updated = { ...plot, latestReading: reading };
          const status = calculatePlotStatus({
            latestReading: reading,
            thresholdMin: plot.threshold_min,
            thresholdMax: plot.threshold_max,
          });
          return { ...updated, status };
        }
        return plot;
      })
    );

    setHistoricalReadings((prev) => {
      const list = prev[reading.station_id] || [];
      const updatedList = [...list, reading].slice(-24); // Keep last 24 points
      return { ...prev, [reading.station_id]: updatedList };
    });
  };

  const handleValveUpdate = (valve: Valve) => {
    setPlots((prev) =>
      prev.map((plot) => {
        const hasValve = plot.valves.some((v) => v.id === valve.id);
        if (hasValve) {
          return {
            ...plot,
            valves: plot.valves.map((v) => (v.id === valve.id ? valve : v)),
          };
        }
        return plot;
      })
    );
  };

  const handleCommandUpdate = (cmd: IrrigationCommand) => {
    setCommands((prev) => {
      const idx = prev.findIndex((c) => c.id === cmd.id || c.client_request_id === cmd.client_request_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cmd;
        return copy;
      }
      return [cmd, ...prev];
    });
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data: plotsData } = await supabase.from('plots').select('*, stations(*), valves(*)');
        if (plotsData && plotsData.length > 0) {
          const formatted: PlotWithTelemetry[] = await Promise.all(
            plotsData.map(async (p: any) => {
              // Fetch latest reading for station
              const station = p.stations?.[0];
              let latestReading: Reading | undefined;
              if (station) {
                const { data: rData } = await supabase
                  .from('readings')
                  .select('*')
                  .eq('station_id', station.id)
                  .order('measured_at', { ascending: false })
                  .limit(1)
                  .single();
                if (rData) latestReading = rData;
              }
              const status = calculatePlotStatus({
                latestReading,
                thresholdMin: p.threshold_min,
                thresholdMax: p.threshold_max,
              });
              return {
                id: p.id,
                organization_id: p.organization_id,
                name: p.name,
                crop: p.crop,
                geom: p.geom,
                threshold_min: Number(p.threshold_min),
                threshold_max: Number(p.threshold_max),
                valves: p.valves || [],
                stations: p.stations || [],
                latestReading,
                status,
              };
            })
          );
          setPlots(formatted);
        }
      } else {
        // Refresh local mock
        setPlots((prev) => updatePlotsWithStatus(prev));
      }
    } catch (err) {
      console.warn('[AGRO CONTEXT] Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlotThresholds = async (
    plotId: string,
    min: number,
    max: number
  ): Promise<{ error?: string }> => {
    // Role check: Producer and Operator only (RF-11, OA-1)
    if (user?.role === 'advisor') {
      return { error: 'Permiso denegado: El rol de Asesor solo tiene permisos de lectura.' };
    }

    if (min >= max) {
      return { error: 'El umbral mínimo debe ser menor al umbral máximo.' };
    }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('plots')
          .update({ threshold_min: min, threshold_max: max })
          .eq('id', plotId);

        if (error) return { error: error.message };
      }

      // Update in memory
      setPlots((prev) =>
        prev.map((plot) => {
          if (plot.id === plotId) {
            const updated = { ...plot, threshold_min: min, threshold_max: max };
            const status = calculatePlotStatus({
              latestReading: updated.latestReading,
              thresholdMin: min,
              thresholdMax: max,
            });
            return { ...updated, status };
          }
          return plot;
        })
      );

      return {};
    } catch (err: any) {
      return { error: err?.message || 'Error al actualizar umbrales' };
    }
  };

  const sendIrrigationCommand = async (params: {
    valveId: string;
    plotId: string;
    action: CommandAction;
    durationMin?: number;
  }): Promise<{ success: boolean; error?: string; command?: IrrigationCommand }> => {
    // 1. Role verification (OA-1, H2, §5)
    if (!user || user.role === 'advisor') {
      return {
        success: false,
        error: 'Operación denegada: El rol Asesor solo cuenta con acceso de lectura (403 Forbidden).',
      };
    }

    // 2. RF-16: Reject concurrent pending command on the same valve
    const hasPending = commands.some((c) => c.valve_id === params.valveId && c.status === 'pending');
    if (hasPending) {
      return {
        success: false,
        error: 'Ya existe un comando en vuelo (pending) para esta válvula. Aguarde su aplicación.',
      };
    }

    const clientRequestId = generateUUID();
    const newCommand: IrrigationCommand = {
      id: 'cmd-' + Date.now(),
      valve_id: params.valveId,
      requested_by: user.id,
      action: params.action,
      duration_min: params.durationMin,
      status: 'pending',
      client_request_id: clientRequestId,
      created_at: new Date().toISOString(),
    };

    setCommands((prev) => [newCommand, ...prev]);

    // 3. Supabase insert or simulated execution (≤ 3s transition)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('irrigation_commands')
          .insert({
            valve_id: params.valveId,
            requested_by: user.id,
            action: params.action,
            duration_min: params.durationMin,
            status: 'pending',
            client_request_id: clientRequestId,
          })
          .select()
          .single();

        if (error) {
          // If unique constraint failed (RF-16 on DB side)
          setCommands((prev) => prev.filter((c) => c.client_request_id !== clientRequestId));
          return {
            success: false,
            error: error.message.includes('unique')
              ? 'Rechazado por base de datos: Existe una orden pendiente en esta válvula.'
              : error.message,
          };
        }
        return { success: true, command: data };
      } catch (err: any) {
        setCommands((prev) => prev.filter((c) => c.client_request_id !== clientRequestId));
        return { success: false, error: err?.message || 'Error de conexión con el servidor.' };
      }
    } else {
      // Academic simulated worker transition: wait 2.5s, then apply (90% success, 10% simulated failure)
      setTimeout(() => {
        const isFailure = Math.random() < 0.1;
        const finalStatus = isFailure ? 'failed' : 'applied';
        const updatedCmd: IrrigationCommand = {
          ...newCommand,
          status: finalStatus,
          applied_at: new Date().toISOString(),
        };

        setCommands((prev) =>
          prev.map((c) => (c.client_request_id === clientRequestId ? updatedCmd : c))
        );

        if (!isFailure) {
          // Update valve status in plot
          const newValveState = params.action === 'open' ? 'open' : 'closed';
          setPlots((prev) =>
            prev.map((p) => {
              if (p.id === params.plotId) {
                return {
                  ...p,
                  valves: p.valves.map((v) =>
                    v.id === params.valveId ? { ...v, status: newValveState } : v
                  ),
                };
              }
              return p;
            })
          );
        }
      }, 2500);

      return { success: true, command: newCommand };
    }
  };

  const cancelPendingCommand = async (commandId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.role === 'advisor') {
      return { success: false, error: 'Permiso denegado: Solo productores y operadores pueden cancelar.' };
    }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('irrigation_commands')
          .update({ status: 'cancelled' })
          .eq('id', commandId)
          .eq('status', 'pending');

        if (error) return { success: false, error: error.message };
      }

      setCommands((prev) =>
        prev.map((c) => (c.id === commandId ? { ...c, status: 'cancelled' } : c))
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al cancelar comando' };
    }
  };

  const submitManualReading = async (data: {
    stationId: string;
    plotId: string;
    moisturePct: number;
    tempC: number;
    rainMm?: number;
    notes?: string;
    lat?: number;
    lng?: number;
  }): Promise<{ queued: boolean; error?: string }> => {
    const readingItem = {
      station_id: data.stationId,
      plot_id: data.plotId,
      moisture_pct: data.moisturePct,
      temp_c: data.tempC,
      rain_mm: data.rainMm || 0,
      notes: data.notes,
      lat: data.lat,
      lng: data.lng,
    };

    if (isSupabaseConfigured && isOnline) {
      try {
        const { error } = await supabase.from('readings').insert({
          station_id: data.stationId,
          moisture_pct: data.moisturePct,
          temp_c: data.tempC,
          rain_mm: data.rainMm || 0,
          source: 'manual',
        });

        if (!error) {
          // Immediately update local state
          const newReading: Reading = {
            id: 'manual-' + Date.now(),
            station_id: data.stationId,
            moisture_pct: data.moisturePct,
            temp_c: data.tempC,
            rain_mm: data.rainMm || 0,
            source: 'manual',
            measured_at: new Date().toISOString(),
          };
          handleNewReading(newReading);
          return { queued: false };
        }
      } catch (err) {
        console.warn('[MANUAL READING] Remote failed, will queue locally:', err);
      }
    }

    // Enqueue locally for offline resilience (RF-21, RNF-07)
    await enqueueManualReading(readingItem);
    // Update local state optimistically
    const localReading: Reading = {
      id: 'queued-' + Date.now(),
      station_id: data.stationId,
      moisture_pct: data.moisturePct,
      temp_c: data.tempC,
      rain_mm: data.rainMm || 0,
      source: 'manual',
      measured_at: new Date().toISOString(),
    };
    handleNewReading(localReading);
    return { queued: true };
  };

  const markAlertAsRead = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read_at: new Date().toISOString() } : a))
    );
    if (isSupabaseConfigured) {
      await supabase.from('alerts').update({ read_at: new Date().toISOString() }).eq('id', alertId);
    }
  };

  return (
    <AgroContext.Provider
      value={{
        plots,
        alerts,
        commands,
        historicalReadings,
        lastTickTime,
        apparentLagMs,
        isOnline,
        isLoading,
        refreshData,
        updatePlotThresholds,
        sendIrrigationCommand,
        cancelPendingCommand,
        submitManualReading,
        markAlertAsRead,
      }}
    >
      {children}
    </AgroContext.Provider>
  );
};

export const useAgro = () => {
  const context = useContext(AgroContext);
  if (!context) {
    throw new Error('useAgro must be used within an AgroProvider');
  }
  return context;
};
