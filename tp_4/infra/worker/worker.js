const { Kafka } = require('kafkajs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key';
const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const kafka = new Kafka({
  clientId: 'agropulse-ingestion-worker',
  brokers,
  retry: {
    initialRetryTime: 1000,
    retries: 20
  }
});

const consumer = kafka.consumer({ groupId: 'agropulse-worker-group' });

async function processIrrigationCommands() {
  try {
    const { data: pendingCommands, error } = await supabase
      .from('irrigation_commands')
      .select('id, valve_id, action, duration_min, client_request_id')
      .eq('status', 'pending');

    if (error) {
      // If table or service key is invalid in demo mode, silently wait
      return;
    }

    if (pendingCommands && pendingCommands.length > 0) {
      for (const cmd of pendingCommands) {
        console.log(`[COMMAND PROCESSING] id=${cmd.id} valve=${cmd.valve_id} action=${cmd.action} duration=${cmd.duration_min}min`);
        
        // Simulate physical valve delay (1-3s)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Academic simulated failure: 10% chance
        const isFailure = Math.random() < 0.10;
        const targetStatus = isFailure ? 'failed' : 'applied';
        const valveStatus = (!isFailure && cmd.action === 'open') ? 'open' : 'closed';

        // 1. Update command status
        const { error: cmdErr } = await supabase
          .from('irrigation_commands')
          .update({
            status: targetStatus,
            applied_at: new Date().toISOString()
          })
          .eq('id', cmd.id)
          .eq('status', 'pending'); // optimistic lock

        if (!cmdErr && !isFailure) {
          // 2. Update valve status
          await supabase
            .from('valves')
            .update({
              status: valveStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', cmd.valve_id);

          console.log(`[COMMAND APPLIED] valve=${cmd.valve_id} is now ${valveStatus}`);
        } else if (isFailure) {
          console.warn(`[COMMAND FAILED] valve=${cmd.valve_id} failed with simulated valve_timeout`);
        }
      }
    }
  } catch (err) {
    console.error('[WORKER ERROR] Command polling failed:', err.message);
  }
}

async function run() {
  console.log('[WORKER] Connecting to Redpanda broker at:', brokers);
  console.log('[WORKER] Connecting to Supabase at:', supabaseUrl);

  await consumer.connect();
  await consumer.subscribe({ topic: 'soil.moisture', fromBeginning: false });
  await consumer.subscribe({ topic: 'weather.tick', fromBeginning: false });

  console.log('[WORKER] Subscribed to topics: soil.moisture, weather.tick');

  // Start polling for pending commands every 2 seconds
  setInterval(processIrrigationCommands, 2000);

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        console.log(`[CONSUMED] topic=${topic} payload=`, payload);

        if (topic === 'soil.moisture') {
          const { error } = await supabase.from('readings').insert({
            station_id: payload.station_id,
            moisture_pct: payload.moisture_pct,
            temp_c: payload.temp_c,
            measured_at: payload.ts || new Date().toISOString(),
            source: 'sensor'
          });

          if (error) {
            console.warn(`[WORKER] Failed to insert reading (station may not exist yet): ${error.message}`);
          } else {
            console.log(`[UPSERT READING] station=${payload.station_id} moisture=${payload.moisture_pct}% temp=${payload.temp_c}°C`);
          }
        }
      } catch (err) {
        console.error('[WORKER ERROR] Error processing message:', err.message);
      }
    }
  });
}

run().catch(console.error);
