import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ladder, byDivision } from './compute';
import { makeDb, PERSONA, type Db, type Member, type Season, type Team, type User } from './data';

export type Page = 'ladder' | 'fixtures' | 'reports' | 'spirit' | 'mvp' | 'teams' | 'users' | 'port';
export type AuthStep = 'welcome' | 'login' | 'signup' | 'forgot' | 'verify';
export type Overlay =
  | { kind: 'report' }
  | { kind: 'settings'; tab?: string }
  | { kind: 'join' }
  | { kind: 'logout' }
  | null;

interface Store {
  db: Db;
  update: (fn: (db: Db) => Db) => void;
  /** Signed-in user (null = public visitor). */
  user: User | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  season: Season | null;
  seasons: Season[];
  setSeasonId: (id: string) => void;
  teams: Team[];
  /** The signed-in user's membership in the current season. */
  membership: Member | null;
  myTeam: Team | null;
  isAdmin: boolean;
  isCaptain: boolean;
  page: Page;
  setPage: (p: Page) => void;
  overlay: Overlay;
  open: (o: Overlay) => void;
  auth: AuthStep | null;
  setAuth: (s: AuthStep | null) => void;
  /** Fixture id when showing the shareable fixture view. */
  share: string | null;
  setShare: (id: string | null) => void;
  teamById: (id?: string) => Team | undefined;
  userById: (id?: string) => User | undefined;
}

const Ctx = createContext<Store | null>(null);

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside FrisbeeProvider');
  return s;
};

function seed(): Db {
  const db = makeDb();
  // The finished season gets final results taken from its ladder.
  const done = db.seasons.find((s) => !s.signUpOpen);
  if (done) {
    const teams = db.teams.filter((t) => t.seasonId === done.id);
    const rows = ladder(teams, db.fixtures.filter((f) => f.seasonId === done.id));
    done.finalResults = Object.fromEntries(byDivision(rows, (r) => r.team.division).map(([div, rs]) => [div, rs.map((r) => r.team.id)]));
  }
  return db;
}

export function FrisbeeProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(seed);
  const [userId, setUserId] = useState<string | null>(PERSONA.admin);
  const [seasonId, setSeasonId] = useState<string | null>(() => db.seasons[0]?.id ?? null);
  const [page, setPage] = useState<Page>('fixtures');
  const [overlay, open] = useState<Overlay>(null);
  const [auth, setAuth] = useState<AuthStep | null>(null);
  const [share, setShare] = useState<string | null>(null);

  const update = useCallback((fn: (db: Db) => Db) => setDb(fn), []);

  const value = useMemo<Store>(() => {
    const user = db.users.find((u) => u.id === userId) ?? null;
    const isAdmin = !!user?.admin;
    const seasons = db.seasons.filter((s) => isAdmin || !s.isHidden);
    const season = db.seasons.find((s) => s.id === seasonId) ?? seasons[0] ?? null;
    const teams = season ? db.teams.filter((t) => t.seasonId === season.id).sort((a, b) => a.name.localeCompare(b.name)) : [];
    const teamIds = new Set(teams.map((t) => t.id));
    const membership = (user && db.members.find((m) => m.userId === user.id && teamIds.has(m.teamId))) || null;
    const myTeam = membership && !membership.pending ? (teams.find((t) => t.id === membership.teamId) ?? null) : null;
    return {
      db,
      update,
      user,
      signIn: (id) => {
        setUserId(id);
        setAuth(null);
      },
      signOut: () => {
        setUserId(null);
        if (!['ladder', 'fixtures', 'teams'].includes(page)) setPage('fixtures');
      },
      season,
      seasons,
      setSeasonId,
      teams,
      membership,
      myTeam,
      isAdmin,
      isCaptain: !!membership?.captain && !membership.pending,
      page,
      setPage,
      overlay,
      open,
      auth,
      setAuth,
      share,
      setShare,
      teamById: (id) => db.teams.find((t) => t.id === id),
      userById: (id) => db.users.find((u) => u.id === id),
    };
  }, [db, userId, seasonId, page, overlay, auth, share, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
