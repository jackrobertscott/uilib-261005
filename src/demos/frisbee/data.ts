/* Mock data model for the Frisbee league demo — mirrors the shapes in frisbee-211221/shared/src/schemas. */

export type Gender = 'male' | 'female';
export type GenderDivision = 'mixed' | 'men' | 'women';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  admin?: boolean;
  verified: boolean;
  createdOn: Date;
}

export interface Season {
  id: string;
  name: string;
  signUpOpen: boolean;
  isHidden?: boolean;
  useOfficialScoring: boolean;
  genderDivision: GenderDivision;
  /** Ordered team ids per division; index 0 = champion. */
  finalResults?: Record<string, string[]>;
  createdOn: Date;
}

export interface Team {
  id: string;
  seasonId: string;
  name: string;
  color: string;
  division?: number;
  phone?: string;
  email?: string;
  isMock?: boolean;
  createdOn: Date;
  updatedOn: Date;
}

export interface Member {
  id: string;
  teamId: string;
  userId: string;
  captain?: boolean;
  pending?: boolean;
}

export interface Game {
  id: string;
  team1Id: string;
  team2Id: string;
  time: string;
  place: string;
  team1Score?: number;
  team2Score?: number;
}

export interface Fixture {
  id: string;
  seasonId: string;
  title: string;
  date: Date;
  games: Game[];
  grading?: boolean;
}

export interface Report {
  id: string;
  fixtureId: string;
  teamId: string;
  teamAgainstId: string;
  userId?: string;
  scoreFor: number;
  scoreAgainst: number;
  mvpMale?: string;
  mvpMale2?: string;
  mvpFemale?: string;
  mvpFemale2?: string;
  /** Simple scoring: a single 0–20 score. Official scoring: five 0–4 categories. */
  spirit?: number;
  spiritP: [number, number, number, number, number];
  spiritComment: string;
  createdOn: Date;
}

export interface GamedayImport {
  id: string;
  startedOn: Date;
  trigger: 'manual' | 'scheduled';
  status: 'running' | 'success' | 'failed';
  source: string;
  rows: number;
  members: number;
  error?: string;
}

export interface GamedaySettings {
  url: string;
  apiKey: string;
  autoImport: boolean;
}

export interface Db {
  users: User[];
  seasons: Season[];
  teams: Team[];
  members: Member[];
  fixtures: Fixture[];
  reports: Report[];
  imports: GamedayImport[];
  gameday: GamedaySettings;
}

/* ------------------------------------------------------------------------ */
/* Constants                                                                 */
/* ------------------------------------------------------------------------ */

export const TEAM_COLORS = [
  '#fca5a5', '#ef4444', '#dc2626', '#fdba74', '#f97316', '#ea580c', '#fde68a', '#facc15', '#eab308',
  '#bef264', '#84cc16', '#65a30d', '#86efac', '#22c55e', '#15803d', '#5eead4', '#14b8a6', '#0f766e',
  '#67e8f9', '#06b6d4', '#7dd3fc', '#0ea5e9', '#2563eb', '#a5b4fc', '#6366f1', '#4338ca', '#d8b4fe',
  '#a855f7', '#7e22ce', '#f9a8d4', '#ec4899', '#be185d', '#ffffff', '#a1a1aa', '#52525b', '#18181b',
];

export const SPIRIT_CATEGORIES = [
  { title: 'Rules Knowledge and Use', description: 'Knowledge of the rules, avoiding intentional infractions, unnecessary stoppages, and explaining the rules.' },
  { title: 'Fouls and Body Contact', description: 'Avoiding body contact, dangerous plays, and unnecessary fouls.' },
  { title: 'Fair-Mindedness', description: 'Apologising for fouls, informing teammates of wrong calls, and only calling significant breaches.' },
  { title: 'Attitude and Self-Control', description: 'Being polite, playing with appropriate intensity, and being a good sport.' },
  { title: 'Communication', description: 'Communicating respectfully, listening, and explaining calls clearly.' },
];

export const SPIRIT_LEVELS = [
  { value: '4', label: '4 · Legendary' },
  { value: '3', label: '3 · Great' },
  { value: '2', label: '2 · Average' },
  { value: '1', label: '1 · Poor' },
  { value: '0', label: '0 · Terrible' },
];

export const SLOTS = [
  { time: '6:00pm', place: 'Field 1' },
  { time: '6:00pm', place: 'Field 2' },
  { time: '6:00pm', place: 'Field 3' },
  { time: '7:10pm', place: 'Field 1' },
  { time: '7:10pm', place: 'Field 2' },
  { time: '7:10pm', place: 'Field 3' },
];

/** "Today" for the demo, so the season is mid-way through. */
export const TODAY = new Date(2026, 9, 5);

/* ------------------------------------------------------------------------ */
/* Seeded random                                                             */
/* ------------------------------------------------------------------------ */

export function rng(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(arr: T[]) => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
  };
}

let idSeq = 0;
export const uid = (prefix = 'id') => `${prefix}_${(++idSeq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/* ------------------------------------------------------------------------ */
/* Generators                                                                */
/* ------------------------------------------------------------------------ */

const FIRST_M = ['Alex', 'Archie', 'Ben', 'Charlie', 'Daniel', 'Ethan', 'Harry', 'Henry', 'Hugo', 'Jack', 'James', 'Leo', 'Liam', 'Max', 'Nathan', 'Noah', 'Oliver', 'Oscar', 'Ryan', 'Sam', 'Samuel', 'Thomas', 'Will', 'Zac'];
const FIRST_F = ['Amelia', 'Ava', 'Charlotte', 'Chloe', 'Evie', 'Freya', 'Georgia', 'Grace', 'Harper', 'Isla', 'Maya', 'Matilda', 'Mia', 'Olivia', 'Ruby', 'Sophie', 'Willow', 'Zoe'];
const LAST = ['Campbell', 'Chen', 'Clarke', 'Edwards', 'Hall', 'Hughes', 'Kaur', 'Kelly', 'Kim', 'Lee', 'Martin', 'Morris', 'Murphy', 'Nguyen', "O'Brien", 'Patel', 'Price', 'Reid', 'Rivera', 'Russo', 'Singh', 'Taylor', 'Tran', 'Walker', 'Wilson'];

export const TEAM_SEED = [
  { name: 'Flying Squirrels', color: '#f97316', division: 1 },
  { name: 'Disc Jockeys', color: '#0ea5e9', division: 1 },
  { name: 'Hammer Time', color: '#ef4444', division: 1 },
  { name: 'Huck Finns', color: '#22c55e', division: 1 },
  { name: 'Layout Legends', color: '#a855f7', division: 1 },
  { name: 'Sky Walkers', color: '#facc15', division: 1 },
  { name: 'Stack Attack', color: '#14b8a6', division: 2 },
  { name: 'Swan River Sharks', color: '#06b6d4', division: 2 },
  { name: 'Fremantle Flyers', color: '#84cc16', division: 2 },
  { name: 'The Pulls', color: '#eab308', division: 2 },
  { name: 'Zone Defence', color: '#6366f1', division: 2 },
  { name: 'Point Blockers', color: '#ec4899', division: 2 },
];

const COMMENTS = [
  '',
  '',
  'Great game, really fair and friendly.',
  'Fantastic spirit all round, thanks for the game!',
  'A couple of contested calls but resolved quickly.',
  'Loved the energy. Good communication on the line.',
  'Some confusion around picks, otherwise great.',
  'Thanks for a fun one, see you next round.',
];

export function makeUsers(r: ReturnType<typeof rng>, count: number, start: Date): User[] {
  const used = new Set<string>();
  const users: User[] = [];
  while (users.length < count) {
    const gender: Gender = users.length % 2 ? 'female' : 'male';
    const first = r.pick(gender === 'male' ? FIRST_M : FIRST_F);
    const last = r.pick(LAST);
    const key = `${first} ${last}`;
    if (used.has(key)) continue;
    used.add(key);
    users.push({
      id: uid('usr'),
      firstName: first,
      lastName: last,
      email: `${first}.${last}`.toLowerCase().replace(/'/g, '') + '@example.com',
      gender,
      verified: r.chance(0.92),
      createdOn: addDays(start, -r.int(0, 330)),
    });
  }
  return users;
}

/** Circle-method round robin: returns rounds of [teamA, teamB] index pairs. */
export function roundRobin(n: number, rounds: number, offset = 0): [number, number][][] {
  const ids = Array.from({ length: n % 2 ? n + 1 : n }, (_, i) => i);
  const m = ids.length;
  const out: [number, number][][] = [];
  for (let r = 0; r < rounds; r++) {
    const k = (r + offset) % (m - 1);
    const rot = [ids[0], ...ids.slice(1).map((_, i) => ids[1 + ((i + k) % (m - 1))])];
    const pairs: [number, number][] = [];
    for (let i = 0; i < m / 2; i++) {
      const a = rot[i];
      const b = rot[m - 1 - i];
      if (a < n && b < n) pairs.push(r % 2 ? [b, a] : [a, b]);
    }
    out.push(pairs);
  }
  return out;
}

/** Strength rating per team so the ladder has a believable spread. */
const STRENGTH = [0.62, 0.7, 0.45, 0.4, 0.78, 0.42, 0.66, 0.6, 0.48, 0.47, 0.44, 0.5];

export interface SeasonOptions {
  name: string;
  start: Date;
  rounds: number;
  /** Rounds that already have results (before TODAY). */
  played: number;
  seed: number;
  users: User[];
  /** Optional fixed membership for the persona users. */
  pinned?: { userId: string; teamIndex: number; captain?: boolean; pending?: boolean }[];
  /** Users who must not be put on a team (e.g. the "no team" persona). */
  exclude?: string[];
  finalResults?: boolean;
  mock?: boolean;
}

/** Build one full season: teams, members, fixtures with results, and score reports. */
export function makeSeason(opts: SeasonOptions): Pick<Db, 'seasons' | 'teams' | 'members' | 'fixtures' | 'reports'> {
  const r = rng(opts.seed);
  const season: Season = {
    id: uid('ssn'),
    name: opts.name,
    signUpOpen: !opts.finalResults,
    useOfficialScoring: true,
    genderDivision: 'mixed',
    createdOn: addDays(opts.start, -45),
  };

  const teams: Team[] = TEAM_SEED.map((t) => ({
    id: uid('tm'),
    seasonId: season.id,
    name: t.name,
    color: t.color,
    division: t.division,
    phone: `04${r.int(10, 99)} ${r.int(100, 999)} ${r.int(100, 999)}`,
    email: t.name.toLowerCase().replace(/\s+/g, '.') + '@example.com',
    isMock: opts.mock,
    createdOn: addDays(opts.start, -r.int(20, 50)),
    updatedOn: addDays(opts.start, r.int(0, 30)),
  }));

  // Members: ~11 per team, balanced by gender.
  const members: Member[] = [];
  const taken = new Set([...(opts.exclude ?? []), ...(opts.pinned ?? []).map((p) => p.userId)]);
  for (const p of opts.pinned ?? []) members.push({ id: uid('mbr'), teamId: teams[p.teamIndex].id, userId: p.userId, captain: p.captain, pending: p.pending });
  const pool = opts.users.filter((u) => !taken.has(u.id) && !u.admin);
  const males = pool.filter((u) => u.gender === 'male');
  const females = pool.filter((u) => u.gender === 'female');
  teams.forEach((t, ti) => {
    const have = members.filter((m) => m.teamId === t.id);
    const hasCaptain = have.some((m) => m.captain);
    const want = { male: 6, female: 5 };
    for (const m of have) {
      const u = opts.users.find((x) => x.id === m.userId)!;
      want[u.gender]--;
    }
    const add = (u: User | undefined, captain = false) => u && members.push({ id: uid('mbr'), teamId: t.id, userId: u.id, captain });
    for (let i = 0; i < want.male; i++) add(males.shift(), !hasCaptain && i === 0);
    for (let i = 0; i < want.female; i++) add(females.shift());
    if (ti % 4 === 0) add(r.chance(0.5) ? males.shift() : females.shift()); // a few pending requests
    if (ti % 4 === 0) members[members.length - 1].pending = true;
  });

  const playersOf = (teamId: string, gender: Gender) =>
    members.filter((m) => m.teamId === teamId && !m.pending).map((m) => opts.users.find((u) => u.id === m.userId)!).filter((u) => u.gender === gender);

  // Fixtures: round robin across all teams, results for played rounds.
  const fixtures: Fixture[] = [];
  const reports: Report[] = [];
  const pairs = roundRobin(teams.length, opts.rounds, opts.seed % 5);
  pairs.forEach((round, ri) => {
    const fixture: Fixture = {
      id: uid('fx'),
      seasonId: season.id,
      title: ri === 0 ? 'Round 1 (Grading)' : `Round ${ri + 1}`,
      date: addDays(opts.start, ri * 7),
      grading: ri === 0,
      games: round.map(([a, b], gi) => ({ id: uid('gm'), team1Id: teams[a].id, team2Id: teams[b].id, ...SLOTS[gi % SLOTS.length] })),
    };
    fixtures.push(fixture);
    if (ri >= opts.played) return;

    fixture.games.forEach((g) => {
      const ia = teams.findIndex((t) => t.id === g.team1Id);
      const ib = teams.findIndex((t) => t.id === g.team2Id);
      const pa = STRENGTH[ia] / (STRENGTH[ia] + STRENGTH[ib]);
      const winA = r.next() < pa;
      const winner = r.chance(0.45) ? 15 : r.int(10, 14); // otherwise the time cap ended the game
      const loser = Math.max(3, winner - r.int(1, 8));
      g.team1Score = winA ? winner : loser;
      g.team2Score = winA ? loser : winner;

      // Each team files a report about its opponent (a few go missing, more in the latest round).
      for (const [self, other, sf, sa] of [
        [g.team1Id, g.team2Id, g.team1Score, g.team2Score],
        [g.team2Id, g.team1Id, g.team2Score, g.team1Score],
      ] as const) {
        const missingChance = ri === opts.played - 1 ? 0.25 : 0.06;
        if (r.chance(missingChance)) continue;
        const generous = 2 + (teams.findIndex((t) => t.id === self) % 3 === 0 ? 1 : 0);
        const spiritP = Array.from({ length: 5 }, () => Math.max(0, Math.min(4, generous + r.int(-1, 1)))) as Report['spiritP'];
        const mvp = (gender: Gender, n: number) => playersOf(other, gender)[(ri * 3 + n * 5 + r.int(0, 3)) % Math.max(1, playersOf(other, gender).length)]?.id;
        const submitter = members.filter((m) => m.teamId === self && !m.pending);
        reports.push({
          id: uid('rpt'),
          fixtureId: fixture.id,
          teamId: self,
          teamAgainstId: other,
          userId: r.pick(submitter).userId,
          scoreFor: sf,
          scoreAgainst: sa,
          mvpMale: mvp('male', 0),
          mvpMale2: mvp('male', 1),
          mvpFemale: mvp('female', 0),
          mvpFemale2: mvp('female', 1),
          spiritP,
          spirit: spiritP.reduce((s, v) => s + v, 0),
          spiritComment: r.pick(COMMENTS),
          createdOn: new Date(fixture.date.getTime() + r.int(2, 40) * 3600_000),
        });
      }
    });
  });

  return { seasons: [season], teams, members, fixtures, reports };
}

export const fullName = (u?: Pick<User, 'firstName' | 'lastName'> | null) => (u ? `${u.firstName} ${u.lastName}` : '—');

/** Persona ids so the demo can switch who is "signed in". */
export const PERSONA = { admin: 'usr_admin', captain: 'usr_captain', player: 'usr_player', noTeam: 'usr_noteam' } as const;

export function makeDb(): Db {
  const r = rng(211221);
  const base = makeUsers(r, 150, TODAY);
  const personas: User[] = [
    { id: PERSONA.admin, firstName: 'Alex', lastName: 'Morgan', email: 'admin@example.com', gender: 'female', admin: true, verified: true, createdOn: new Date(2025, 2, 4) },
    { id: PERSONA.captain, firstName: 'Thomas', lastName: 'Edwards', email: 'thomas.edwards@example.com', gender: 'male', verified: true, createdOn: new Date(2025, 5, 18) },
    { id: PERSONA.player, firstName: 'Ruby', lastName: 'Nguyen', email: 'ruby.nguyen@example.com', gender: 'female', verified: true, createdOn: new Date(2025, 7, 2) },
    { id: PERSONA.noTeam, firstName: 'Sam', lastName: 'Rivera', email: 'sam.rivera@example.com', gender: 'male', verified: false, createdOn: new Date(2026, 8, 30) },
  ];
  const users = [...personas, ...base];

  const winter = makeSeason({
    name: 'Winter League 2026',
    start: new Date(2026, 7, 29),
    rounds: 9,
    played: 6,
    seed: 7,
    users,
    exclude: [PERSONA.noTeam],
    pinned: [
      { userId: PERSONA.admin, teamIndex: 0, captain: true },
      { userId: PERSONA.captain, teamIndex: 1, captain: true },
      { userId: PERSONA.player, teamIndex: 0 },
    ],
  });
  const summer = makeSeason({
    name: 'Summer League 2026',
    start: new Date(2026, 0, 17),
    rounds: 9,
    played: 9,
    seed: 3,
    users,
    exclude: [PERSONA.noTeam],
    pinned: [
      { userId: PERSONA.admin, teamIndex: 0, captain: true },
      { userId: PERSONA.captain, teamIndex: 1, captain: true },
      { userId: PERSONA.player, teamIndex: 0 },
    ],
    finalResults: true,
  });
  summer.seasons[0].signUpOpen = false;

  const db: Db = {
    users,
    seasons: [...winter.seasons, ...summer.seasons],
    teams: [...winter.teams, ...summer.teams],
    members: [...winter.members, ...summer.members],
    fixtures: [...winter.fixtures, ...summer.fixtures],
    reports: [...winter.reports, ...summer.reports],
    imports: [],
    gameday: { url: '', apiKey: '', autoImport: false },
  };
  return db;
}
