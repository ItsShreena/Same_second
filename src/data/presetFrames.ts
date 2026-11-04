export interface PresetFrame {
  id: string;
  name: string;
  label: string;
  scenario: 'live' | 'wicket' | 'ad_hold' | 'unreadable' | 'six';
  over: number;
  ball: number;
  score: string;
  expectedStatus: 'LIVE' | 'HOLD' | 'UNREADABLE';
  description: string;
  badgeColor: string;
  previewGradient: string;
}

export const PRESET_FRAMES: PresetFrame[] = [
  {
    id: 'frame_17_2',
    name: 'Over 17.2 — Live Broadcaster Banner',
    label: 'Clean Feed (17.2)',
    scenario: 'live',
    over: 17,
    ball: 2,
    score: '158/4',
    expectedStatus: 'LIVE',
    description: 'Crisp Star Sports broadcast feed. Scoreboard clearly visible at bottom.',
    badgeColor: '#22c55e',
    previewGradient: 'from-blue-900/60 via-slate-900 to-emerald-950/70',
  },
  {
    id: 'frame_17_4_wicket',
    name: 'Over 17.4 — Wicket Alert Graphic',
    label: 'Wicket Ball (17.4)',
    scenario: 'wicket',
    over: 17,
    ball: 4,
    score: '164/5',
    expectedStatus: 'LIVE',
    description: 'WICKET banner flashed across TV graphic. Score counter increments to 164/5.',
    badgeColor: '#ef4444',
    previewGradient: 'from-red-950/70 via-slate-900 to-blue-900/60',
  },
  {
    id: 'frame_ad_break',
    name: 'Ad Break / Slow-Mo Replay (Ticker Masked)',
    label: 'Commercial / HOLD',
    scenario: 'ad_hold',
    over: 17,
    ball: 4,
    score: '164/5',
    expectedStatus: 'HOLD',
    description: 'Broadcaster cuts to sponsor bumper & slow-mo replay. Scoreboard hidden. Safe HOLD triggered.',
    badgeColor: '#eab308',
    previewGradient: 'from-amber-950/70 via-stone-900 to-zinc-950',
  },
  {
    id: 'frame_unreadable',
    name: 'Angled TV / Low Light Glare',
    label: 'Glare / UNREADABLE',
    scenario: 'unreadable',
    over: 17,
    ball: 4,
    score: '---',
    expectedStatus: 'UNREADABLE',
    description: 'Ceiling light reflection obscures ticker. AI cannot confirm ball; holds all incoming spoilers.',
    badgeColor: '#94a3b8',
    previewGradient: 'from-zinc-900 via-neutral-900 to-black',
  },
  {
    id: 'frame_18_1_six',
    name: 'Over 18.1 — Maximum Six Graphic',
    label: 'Sixer Jump (18.1)',
    scenario: 'six',
    over: 18,
    ball: 1,
    score: '172/5',
    expectedStatus: 'LIVE',
    description: '18th over commences with towering six. Ticker updates to 18.1.',
    badgeColor: '#ccff00',
    previewGradient: 'from-lime-950/60 via-slate-900 to-cyan-950/60',
  },
];
