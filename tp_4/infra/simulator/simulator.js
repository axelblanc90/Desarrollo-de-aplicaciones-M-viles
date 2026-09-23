const { Kafka } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const kafka = new Kafka({
  clientId: 'agropulse-iot-simulator',
  brokers,
  retry: {
    initialRetryTime: 1000,
    retries: 20
  }
});

const producer = kafka.producer();

// Seed station UUIDs matching seed.sql
const STATIONS = [
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Costa 1-A', baseMoisture: 34.0, baseTemp: 22.0, active: true },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Costa 2-B', baseMoisture: 18.0, baseTemp: 27.5, active: true },
  { id: 'c0000000-0000-0000-0000-000000000003', name: 'Monte A-1',  baseMoisture: 26.0, baseTemp: 21.0, active: process.env.SIMULATE_MONTE_A === 'true' }
];

async function run() {
  console.log('[SIMULATOR] Connecting to Redpanda broker at:', brokers);
  await producer.connect();
  console.log('[SIMULATOR] Connected. Starting sensor telemetry loop (interval: 5s)...');

  setInterval(async () => {
    for (const station of STATIONS) {
      if (!station.active) {
        continue;
      }

      // Add gentle realistic noise
      const noise = (Math.random() - 0.5) * 1.2;
      const moisture = Math.max(5, Math.min(60, Number((station.baseMoisture + noise).toFixed(1))));
      const temp = Number((station.baseTemp + (Math.random() - 0.5) * 0.8).toFixed(1));
      const rain = Math.random() < 0.1 ? Number((Math.random() * 2).toFixed(1)) : 0;
      const ts = new Date().toISOString();

      const soilPayload = {
        station_id: station.id,
        moisture_pct: moisture,
        temp_c: temp,
        ts
      };

      const weatherPayload = {
        station_id: station.id,
        rain_mm: rain,
        ts
      };

      try {
        await producer.send({
          topic: 'soil.moisture',
          messages: [{ key: station.id, value: JSON.stringify(soilPayload) }]
        });

        await producer.send({
          topic: 'weather.tick',
          messages: [{ key: station.id, value: JSON.stringify(weatherPayload) }]
        });

        console.log(`[PRODUCED] [soil.moisture] station="${station.name}" (${station.id}) moisture=${moisture}% temp=${temp}°C ts=${ts}`);
      } catch (err) {
        console.error('[SIMULATOR ERROR] Failed to produce tick:', err.message);
      }
    }
  }, 5000);
}

run().catch(console.error);
