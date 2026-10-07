export interface SshConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export interface SshCommandResult {
  command: string;
  output: string;
  exitCode: number;
  executionTimeMs: number;
}
