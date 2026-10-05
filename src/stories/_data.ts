/** Shared demo data for stories and demos. */

/** Abstract gradient "photo" avatars as inline SVG — no network needed. */
export function avatarSrc(seed: number) {
  const h1 = (seed * 67) % 360;
  const h2 = (h1 + 40) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1} 55% 82%)"/><stop offset="1" stop-color="hsl(${h2} 45% 62%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="hsl(${h2} 35% 38%)" opacity=".55"/><path d="M12 64c2-14 10-21 20-21s18 7 20 21z" fill="hsl(${h2} 35% 32%)" opacity=".55"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
}

export const people: Person[] = [
  { id: 'u1', name: 'Caitlyn Edwards', email: 'caitlyn@untitledui.com', role: 'Product designer', avatar: avatarSrc(1), status: 'online' },
  { id: 'u2', name: 'Eve Mathews', email: 'eve@untitledui.com', role: 'Engineering lead', avatar: avatarSrc(2), status: 'away' },
  { id: 'u3', name: 'Alex Wilkinson', email: 'alex@untitledui.com', role: 'Frontend engineer', status: 'online' },
  { id: 'u4', name: 'Olivia Rhye', email: 'olivia@untitledui.com', role: 'Head of product', avatar: avatarSrc(4), status: 'busy' },
  { id: 'u5', name: 'Phoenix Baker', email: 'phoenix@untitledui.com', role: 'Data analyst', avatar: avatarSrc(5), status: 'offline' },
  { id: 'u6', name: 'Lana Steiner', email: 'lana@untitledui.com', role: 'Marketing', status: 'online' },
  { id: 'u7', name: 'Demi Wilkinson', email: 'demi@untitledui.com', role: 'Customer success', avatar: avatarSrc(7), status: 'away' },
  { id: 'u8', name: 'Candice Wu', email: 'candice@untitledui.com', role: 'Backend engineer', avatar: avatarSrc(8), status: 'online' },
];

export const countries = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Denmark', 'Finland', 'France', 'Germany', 'Iceland',
  'India', 'Ireland', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Portugal', 'Singapore',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'United States',
].map((c) => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c }));

export const timezones = [
  { value: 'pst', label: 'Pacific Time', meta: 'UTC−08:00', group: 'Americas' },
  { value: 'mst', label: 'Mountain Time', meta: 'UTC−07:00', group: 'Americas' },
  { value: 'cst', label: 'Central Time', meta: 'UTC−06:00', group: 'Americas' },
  { value: 'est', label: 'Eastern Time', meta: 'UTC−05:00', group: 'Americas' },
  { value: 'gmt', label: 'Greenwich Mean Time', meta: 'UTC±00:00', group: 'Europe & Africa' },
  { value: 'cet', label: 'Central European Time', meta: 'UTC+01:00', group: 'Europe & Africa' },
  { value: 'eet', label: 'Eastern European Time', meta: 'UTC+02:00', group: 'Europe & Africa' },
  { value: 'ist', label: 'India Standard Time', meta: 'UTC+05:30', group: 'Asia & Pacific' },
  { value: 'jst', label: 'Japan Standard Time', meta: 'UTC+09:00', group: 'Asia & Pacific' },
  { value: 'aest', label: 'Australian Eastern Time', meta: 'UTC+10:00', group: 'Asia & Pacific' },
];

export interface FileRow {
  id: string;
  name: string;
  size: string;
  bytes: number;
  type: 'pdf' | 'docx' | 'xls' | 'png' | 'fig';
  owner: Person;
  modified: Date;
}

const d = (s: string) => new Date(s);
export const files: FileRow[] = [
  { id: 'f1', name: 'Dashboard requirements v2', size: '220 KB', bytes: 220_000, type: 'docx', owner: people[0], modified: d('2028-01-04') },
  { id: 'f2', name: 'Marketing site requirements', size: '488 KB', bytes: 488_000, type: 'docx', owner: people[1], modified: d('2028-01-04') },
  { id: 'f3', name: 'Q4_2028 Reporting', size: '1.2 MB', bytes: 1_200_000, type: 'pdf', owner: people[2], modified: d('2028-01-02') },
  { id: 'f4', name: 'Q3_2028 Reporting', size: '1.3 MB', bytes: 1_300_000, type: 'pdf', owner: people[2], modified: d('2028-01-06') },
  { id: 'f5', name: 'Q2_2028 Reporting', size: '1.1 MB', bytes: 1_100_000, type: 'pdf', owner: people[0], modified: d('2028-01-08') },
  { id: 'f6', name: 'Q1_2028 Reporting', size: '1.8 MB', bytes: 1_800_000, type: 'pdf', owner: people[0], modified: d('2028-01-06') },
  { id: 'f7', name: 'FY_2026-27 Financials', size: '628 KB', bytes: 628_000, type: 'xls', owner: people[1], modified: d('2028-01-04') },
  { id: 'f8', name: 'Brand guidelines', size: '4.6 MB', bytes: 4_600_000, type: 'pdf', owner: people[3], modified: d('2027-12-19') },
  { id: 'f9', name: 'Onboarding flow', size: '12.4 MB', bytes: 12_400_000, type: 'fig', owner: people[4], modified: d('2027-12-15') },
  { id: 'f10', name: 'Hero illustration', size: '2.2 MB', bytes: 2_200_000, type: 'png', owner: people[6], modified: d('2027-12-11') },
  { id: 'f11', name: 'Pricing experiments', size: '342 KB', bytes: 342_000, type: 'xls', owner: people[7], modified: d('2027-12-02') },
  { id: 'f12', name: 'Customer interviews', size: '96 KB', bytes: 96_000, type: 'docx', owner: people[5], modified: d('2027-11-28') },
  { id: 'f13', name: 'Design system audit', size: '1.4 MB', bytes: 1_400_000, type: 'pdf', owner: people[3], modified: d('2027-11-20') },
  { id: 'f14', name: 'Roadmap 2028', size: '512 KB', bytes: 512_000, type: 'docx', owner: people[3], modified: d('2027-11-14') },
  { id: 'f15', name: 'Churn analysis', size: '780 KB', bytes: 780_000, type: 'xls', owner: people[4], modified: d('2027-11-02') },
  { id: 'f16', name: 'App store screenshots', size: '8.1 MB', bytes: 8_100_000, type: 'png', owner: people[6], modified: d('2027-10-30') },
  { id: 'f17', name: 'Security review', size: '233 KB', bytes: 233_000, type: 'pdf', owner: people[7], modified: d('2027-10-21') },
  { id: 'f18', name: 'Mobile app wireframes', size: '9.8 MB', bytes: 9_800_000, type: 'fig', owner: people[0], modified: d('2027-10-12') },
  { id: 'f19', name: 'Team offsite agenda', size: '64 KB', bytes: 64_000, type: 'docx', owner: people[5], modified: d('2027-10-03') },
  { id: 'f20', name: 'Investor update', size: '1.0 MB', bytes: 1_000_000, type: 'pdf', owner: people[3], modified: d('2027-09-29') },
  { id: 'f21', name: 'Support macros', size: '41 KB', bytes: 41_000, type: 'docx', owner: people[6], modified: d('2027-09-18') },
];

export const fmtDate = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
