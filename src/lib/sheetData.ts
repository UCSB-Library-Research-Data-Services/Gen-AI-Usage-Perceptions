import Papa from 'papaparse';

// Public Google Sheet — read-only CSV export via the gviz endpoint, no API key required.
const SHEET_ID = '11ZqerU04wqC5TbPieLtrf5k5XJDPd4-Oiae-G-1JZfA';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
const POLL_INTERVAL_MS = 5000;

export interface TaskId {
  key: 'writing' | 'code' | 'data';
  label: string;
}

export const TASKS: TaskId[] = [
  { key: 'writing', label: 'Writing' },
  { key: 'code', label: 'Code' },
  { key: 'data', label: 'Data' },
];

export interface Point {
  x: number; // frequency of use (0-7)
  y: number; // perceived accuracy (0-10)
}

export interface DashboardData {
  writing: Point[];
  code: Point[];
  data: Point[];
  responseCount: number;
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
}

// Column order expected in the form responses sheet:
// Timestamp, Writing freq, Writing acc, Code freq, Code acc, Data freq, Data acc
const COLUMN_INDEX = {
  writingFreq: 1,
  writingAcc: 2,
  codeFreq: 3,
  codeAcc: 4,
  dataFreq: 5,
  dataAcc: 6,
};

function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRows(rows: string[][]): Omit<DashboardData, 'loading' | 'error' | 'lastUpdated'> {
  const writing: Point[] = [];
  const code: Point[] = [];
  const data: Point[] = [];

  // First row is the header emitted by the form; skip it.
  for (const row of rows.slice(1)) {
    const wf = toNumberOrNull(row[COLUMN_INDEX.writingFreq]);
    const wa = toNumberOrNull(row[COLUMN_INDEX.writingAcc]);
    if (wf !== null && wa !== null) writing.push({ x: wf, y: wa });

    const cf = toNumberOrNull(row[COLUMN_INDEX.codeFreq]);
    const ca = toNumberOrNull(row[COLUMN_INDEX.codeAcc]);
    if (cf !== null && ca !== null) code.push({ x: cf, y: ca });

    const df = toNumberOrNull(row[COLUMN_INDEX.dataFreq]);
    const da = toNumberOrNull(row[COLUMN_INDEX.dataAcc]);
    if (df !== null && da !== null) data.push({ x: df, y: da });
  }

  const responseCount = rows.length > 0 ? rows.length - 1 : 0;
  return { writing, code, data, responseCount };
}

async function fetchCsv(): Promise<string[][]> {
  // Cache-bust so polling actually picks up fresh responses instead of a cached copy.
  const response = await fetch(`${CSV_URL}&_=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet (status ${response.status})`);
  }
  const text = await response.text();
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  return result.data;
}

type Listener = (data: DashboardData) => void;

export function createDashboardStore() {
  let state: DashboardData = {
    writing: [],
    code: [],
    data: [],
    responseCount: 0,
    lastUpdated: null,
    loading: true,
    error: null,
  };

  const listeners = new Set<Listener>();
  let timer: ReturnType<typeof setInterval> | null = null;

  function emit() {
    for (const listener of listeners) listener(state);
  }

  async function refresh() {
    try {
      const rows = await fetchCsv();
      const parsed = parseRows(rows);
      state = { ...state, ...parsed, loading: false, error: null, lastUpdated: new Date() };
    } catch (err) {
      state = { ...state, loading: false, error: (err as Error).message };
    }
    emit();
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    listener(state);

    if (listeners.size === 1) {
      refresh();
      timer = setInterval(refresh, POLL_INTERVAL_MS);
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }

  return { subscribe, refresh };
}

export const dashboardStore = createDashboardStore();
