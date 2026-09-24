import { create } from 'zustand';
import type {
  ApiInput,
  ApiResult,
  DashboardState,
  Job,
} from '../shared/types.js';
import { errorMessage } from '../shared/types.ts';

type ActiveJob = Pick<Job, 'id' | 'kind' | 'status'>;
interface Session extends DashboardState {
  token: string;
  connected: boolean;
  pending: boolean;
  error: string;
  projectError: string;
  selected: string | null;
  active: ActiveJob[];
  receive: (snapshot: DashboardState) => void;
  select: (id: string) => void;
  action: (path: string, data?: ApiInput) => Promise<boolean>;
}

function retain<T>(previous: T, next: T): T {
  return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
}

export const useSession = create<Session>((set, get) => ({
  project: null,
  recentProjects: [],
  devices: [],
  warnings: [],
  scanning: false,
  jobs: [],
  active: [],
  token: '',
  connected: false,
  pending: false,
  error: '',
  projectError: '',
  selected: null,
  receive: (snapshot) =>
    set((previous) => ({
      project: retain(previous.project, snapshot.project),
      recentProjects: retain(previous.recentProjects, snapshot.recentProjects),
      devices: retain(previous.devices, snapshot.devices),
      warnings: retain(previous.warnings, snapshot.warnings),
      scanning: snapshot.scanning,
      jobs: retain(
        previous.jobs,
        snapshot.jobs.map((job) =>
          retain(
            previous.jobs.find((old) => old.id === job.id),
            job,
          )!,
        ),
      ),
      active: retain(
        previous.active,
        snapshot.jobs
          .filter((job) => ['running', 'stopping'].includes(job.status))
          .map(({ id, kind, status }) => ({ id, kind, status })),
      ),
      connected: true,
    })),
  select: (selected) => set({ selected }),
  action: async (path, data = {}) => {
    if (get().pending || !get().connected) return false;
    set({
      pending: true,
      error: '',
      ...(path === 'project' ? { projectError: '' } : {}),
    });
    try {
      const response = await fetch(
        `/api/${path}?token=${encodeURIComponent(get().token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );
      const result: ApiResult = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.id) set({ selected: result.id });
      if (
        path === 'project' ||
        (path === 'clear' && 'id' in data && data.id === get().selected)
      )
        set({ selected: null });
      return true;
    } catch (error) {
      set(
        path === 'project'
          ? { projectError: errorMessage(error) }
          : { error: errorMessage(error) },
      );
      return false;
    } finally {
      set({ pending: false });
    }
  },
}));

export function connectSession() {
  const key = 'exposed.sessionToken';
  const incoming = window.location.hash.slice(1);
  let token = incoming;
  try {
    if (incoming) {
      window.localStorage.setItem(key, incoming);
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      );
    }
    token = incoming || window.localStorage.getItem(key) || '';
  } catch {}
  useSession.setState({ token, connected: false });
  if (!token) return;
  const events = new EventSource(
    `/api/events?token=${encodeURIComponent(token)}`,
  );
  events.onmessage = (event) =>
    useSession.getState().receive(JSON.parse(event.data));
  events.onerror = () => useSession.setState({ connected: false });
  return () => {
    events.close();
    useSession.setState({ connected: false });
  };
}

export const selectDisabled = (state: Session) =>
  !state.connected || state.pending;
