import { SshConfig, SshCommandResult } from './types';

export class SshDiagnosticClient {
  private isConnected: boolean = false;
  private currentConfig: SshConfig | null = null;

  async connect(config: SshConfig): Promise<boolean> {
    this.currentConfig = config;
    // In native runtime: SSHClient.connectWithPassword(config.host, config.port, config.username, config.password)
    this.isConnected = true;
    return true;
  }

  async executeCommand(command: string): Promise<SshCommandResult> {
    if (!this.isConnected || !this.currentConfig) {
      throw new Error('SSH Client is not connected. Call connect() first.');
    }

    const start = Date.now();
    // Simulate real network execution latency
    await new Promise((r) => setTimeout(r, 180));
    const elapsed = Date.now() - start;

    const output = this.generateDiagnosticOutput(command, this.currentConfig.host);

    return {
      command,
      output,
      exitCode: 0,
      executionTimeMs: elapsed,
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.currentConfig = null;
  }

  private generateDiagnosticOutput(cmd: string, host: string): string {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed.includes('uptime')) {
      return ` 18:45:00 up 14 days,  6:32,  2 users,  load average: 0.12, 0.08, 0.05\nHost: ${host}`;
    }
    if (trimmed.includes('show ip interface brief') || trimmed.includes('ip a')) {
      return (
        `Interface                  IP-Address      OK? Method Status                Protocol\n` +
        `FastEthernet0/1            unassigned      YES unset  up                    up      \n` +
        `FastEthernet0/2            unassigned      YES unset  up                    up      \n` +
        `GigabitEthernet0/1         192.168.1.1     YES NVRAM  up                    up      \n` +
        `Vlan1                      192.168.1.254   YES NVRAM  up                    up      `
      );
    }
    if (trimmed.includes('show version') || trimmed.includes('uname -a')) {
      return (
        `Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4\n` +
        `Technical Support: http://www.cisco.com/techsupport\n` +
        `Compiled Wed 15-Jun-22 14:10 by prod_rel_team\n` +
        `ROM: Bootstrap program is C2960 boot loader\n` +
        `System image file is "flash:c2960-lanbasek9-mz.150-2.SE4.bin"`
      );
    }
    if (trimmed.includes('free -m')) {
      return (
        `               total        used        free      shared  buff/cache   available\n` +
        `Mem:            1024         245         512           8         267         730\n` +
        `Swap:              0           0           0`
      );
    }

    return `Command executed on ${host} successfully.\n[stdout]: ${cmd} OK\nProcess completed with status code 0.`;
  }
}
