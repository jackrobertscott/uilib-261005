/* Derived league statistics — ladder, spirit, MVPs, score distribution, missing reports. */
import type { Db, Fixture, Report, Team, User } from './data';

export interface LadderRow {
  team: Team;
  games: number;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  for: number;
  against: number;
  ratio: number;
  avgFor: number;
  avgAgainst: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Win = 4, draw = 2, loss = 0. Grading fixtures are excluded. Sorted by points then ratio. */
export function ladder(teams: Team[], fixtures: Fixture[]): LadderRow[] {
  const rows = new Map<string, LadderRow>(
    teams.map((t) => [t.id, { team: t, games: 0, points: 0, wins: 0, losses: 0, draws: 0, for: 0, against: 0, ratio: 0, avgFor: 0, avgAgainst: 0 }]),
  );
  for (const f of fixtures) {
    if (f.grading) continue;
    for (const g of f.games) {
      if (g.team1Score == null || g.team2Score == null) continue;
      const pairs = [
        [g.team1Id, g.team1Score, g.team2Score],
        [g.team2Id, g.team2Score, g.team1Score],
      ] as const;
      for (const [id, sf, sa] of pairs) {
        const row = rows.get(id);
        if (!row) continue;
        row.games++;
        row.for += sf;
        row.against += sa;
        if (sf > sa) (row.wins++, (row.points += 4));
        else if (sf < sa) row.losses++;
        else (row.draws++, (row.points += 2));
      }
    }
  }
  for (const r of rows.values()) {
    r.ratio = r.against ? Math.round((r.for / r.against) * 100) : 0;
    r.avgFor = r.games ? round2(r.for / r.games) : 0;
    r.avgAgainst = r.games ? round2(r.against / r.games) : 0;
  }
  return [...rows.values()].sort((a, b) => b.points - a.points || b.ratio - a.ratio || a.team.name.localeCompare(b.team.name));
}

/** Group teams by division ("none" for unassigned). */
export function byDivision<T>(items: T[], get: (x: T) => number | undefined = (x) => (x as { division?: number }).division) {
  const map = new Map<string, T[]>();
  for (const i of items) {
    const key = get(i) != null ? String(get(i)) : 'none';
    map.set(key, [...(map.get(key) ?? []), i]);
  }
  return [...map.entries()].sort(([a], [b]) => (a === 'none' ? 1 : b === 'none' ? -1 : Number(a) - Number(b)));
}

export const reportSpirit = (r: Report, official: boolean) => (official ? r.spiritP.reduce((s, v) => s + v, 0) : (r.spirit ?? 0));

export interface SpiritRow {
  team: Team;
  gotPoints: number;
  gotReports: number;
  gotAvg: number;
  gotAdj: number;
  sentPoints: number;
  sentReports: number;
  sentAvg: number;
  sentAdj: number;
  diff: number;
  adjDiff: number;
}

/**
 * Spirit table. "Adjusted" scores correct for how generous or harsh the other side
 * usually is: each score is shifted by (league average − that team's usual average).
 */
export function spiritTable(teams: Team[], reports: Report[], official: boolean): SpiritRow[] {
  const ids = new Set(teams.map((t) => t.id));
  const rs = reports.filter((r) => ids.has(r.teamId) && ids.has(r.teamAgainstId));
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0);
  const league = avg(rs.map((r) => reportSpirit(r, official)));
  const sentAvg = new Map(teams.map((t) => [t.id, avg(rs.filter((r) => r.teamId === t.id).map((r) => reportSpirit(r, official)))]));
  const gotAvg = new Map(teams.map((t) => [t.id, avg(rs.filter((r) => r.teamAgainstId === t.id).map((r) => reportSpirit(r, official)))]));
  return teams.map((team) => {
    const got = rs.filter((r) => r.teamAgainstId === team.id);
    const sent = rs.filter((r) => r.teamId === team.id);
    const gotPoints = got.reduce((s, r) => s + reportSpirit(r, official), 0);
    const sentPoints = sent.reduce((s, r) => s + reportSpirit(r, official), 0);
    const gotA = got.length ? gotPoints / got.length : 0;
    const sentA = sent.length ? sentPoints / sent.length : 0;
    const gotAdj = avg(got.map((r) => reportSpirit(r, official) + league - (sentAvg.get(r.teamId) ?? league)));
    const sentAdj = avg(sent.map((r) => reportSpirit(r, official) + league - (gotAvg.get(r.teamAgainstId) ?? league)));
    return {
      team,
      gotPoints,
      gotReports: got.length,
      gotAvg: round2(gotA),
      gotAdj: round2(gotAdj),
      sentPoints,
      sentReports: sent.length,
      sentAvg: round2(sentA),
      sentAdj: round2(sentAdj),
      diff: round2(sentA - gotA),
      adjDiff: round2(sentAdj - gotAdj),
    };
  });
}

export interface MvpRow {
  user: User;
  team?: Team;
  points: number;
  votes: number;
}

/** MVP standings: official scoring gives 5 for 1st and 3 for 2nd; simple scoring 1 per vote. */
export function mvpTable(db: Db, teams: Team[], reports: Report[], official: boolean) {
  const teamIds = new Set(teams.map((t) => t.id));
  const tally = new Map<string, { points: number; votes: number }>();
  const add = (id: string | undefined, pts: number) => {
    if (!id) return;
    const t = tally.get(id) ?? { points: 0, votes: 0 };
    t.points += pts;
    t.votes++;
    tally.set(id, t);
  };
  for (const r of reports) {
    if (!teamIds.has(r.teamId)) continue;
    add(r.mvpMale, official ? 5 : 1);
    add(r.mvpFemale, official ? 5 : 1);
    if (official) {
      add(r.mvpMale2, 3);
      add(r.mvpFemale2, 3);
    }
  }
  const teamOf = (userId: string) => {
    const m = db.members.find((x) => x.userId === userId && teamIds.has(x.teamId) && !x.pending);
    return teams.find((t) => t.id === m?.teamId);
  };
  const rows: MvpRow[] = [...tally.entries()]
    .map(([id, t]) => ({ user: db.users.find((u) => u.id === id)!, team: teamOf(id), ...t }))
    .filter((r) => r.user)
    .sort((a, b) => b.points - a.points || a.user.firstName.localeCompare(b.user.firstName));
  return { male: rows.filter((r) => r.user.gender === 'male'), female: rows.filter((r) => r.user.gender === 'female') };
}

/** How often each points total occurs across all recorded games (optionally for one team). */
export function scoreDistribution(fixtures: Fixture[], teamId?: string | null) {
  const counts = new Map<number, number>();
  let max = 0;
  for (const f of fixtures)
    for (const g of f.games) {
      if (g.team1Score == null || g.team2Score == null) continue;
      const scores = teamId ? (g.team1Id === teamId ? [g.team1Score] : g.team2Id === teamId ? [g.team2Score] : []) : [g.team1Score, g.team2Score];
      for (const s of scores) {
        if (s <= 0) continue;
        counts.set(s, (counts.get(s) ?? 0) + 1);
        max = Math.max(max, s);
      }
    }
  return Array.from({ length: Math.max(max, 15) }, (_, i) => ({ points: i + 1, count: counts.get(i + 1) ?? 0 }));
}

/** Teams that played in a fixture but have not submitted a report for it. */
export function missingReports(fixture: Fixture, reports: Report[]) {
  const filed = new Set(reports.filter((r) => r.fixtureId === fixture.id).map((r) => r.teamId));
  return fixture.games.flatMap((g) => [g.team1Id, g.team2Id]).filter((id) => !filed.has(id));
}

export const isPlayed = (f: Fixture, today: Date) => f.date.getTime() <= today.getTime();
