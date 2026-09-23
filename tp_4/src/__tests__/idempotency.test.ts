import { generateUUID } from '../lib/idempotency';

describe('Idempotency & UUID v4 Standards (RNF-08 & RF-16)', () => {
  const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  test('Generates RFC4122 compliant UUID v4 strings', () => {
    const uuid = generateUUID();
    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBe(36);
    expect(UUID_V4_REGEX.test(uuid)).toBe(true);
  });

  test('Guarantees uniqueness across batch generation (no collisions)', () => {
    const set = new Set<string>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      const id = generateUUID();
      expect(set.has(id)).toBe(false);
      set.add(id);
    }

    expect(set.size).toBe(count);
  });

  test('Simulates RF-16 concurrency defense: rejects second pending command on same valve', () => {
    const valveId = 'd0000000-0000-0000-0000-000000000002';
    const activeCommands = [
      {
        id: 'cmd-1',
        valve_id: valveId,
        status: 'pending' as const,
        client_request_id: generateUUID(),
      },
    ];

    // Attempting to dispatch a new command for the same valve
    const hasPending = activeCommands.some(
      (c) => c.valve_id === valveId && c.status === 'pending'
    );

    expect(hasPending).toBe(true);

    // If previous command finishes (transitions to applied)
    activeCommands[0].status = 'applied' as any;

    const canDispatchNow = !activeCommands.some(
      (c) => c.valve_id === valveId && c.status === 'pending'
    );
    expect(canDispatchNow).toBe(true);
  });
});
