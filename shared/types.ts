export interface Project {
  name: string;
  path: string;
  expo: string;
}
export interface RecentProject {
  name: string;
  path: string;
}
export interface Device {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  type: 'simulator' | 'connected' | 'avd';
  state: string;
  runtime?: string;
}
export interface Inventory {
  devices: Device[];
  warnings: string[];
}
export interface Job {
  id: string;
  label: string;
  kind: string;
  status: 'running' | 'stopping' | 'stopped' | 'completed' | 'failed';
  startedAt: string;
  logs: string[];
  exitCode?: number | null;
  signal?: string | null;
}
export interface DashboardState extends Inventory {
  project: Project | null;
  recentProjects: RecentProject[];
  scanning: boolean;
  jobs: Job[];
}
export type ApiInput =
  | { path: string }
  | { id: string }
  | { action: 'metro'; clear?: boolean }
  | { action: 'boot' | 'build'; deviceId: string; deviceType: Device['type'] }
  | Record<string, never>;
export interface ApiResult {
  id?: string;
  ok?: boolean;
  error?: string;
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
