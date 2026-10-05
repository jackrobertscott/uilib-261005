import { useEffect, useState } from 'react';
import { ChevronDown, LogIn, LogOut, Menu as MenuIcon, Moon, Settings, Sun, UserPlus, Users, Megaphone } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  IconButton,
  Link,
  Menu,
  MenuHeader,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  Select,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  toast,
} from '@ui';
import { PERSONA, fullName } from './data';
import { FrisbeeProvider, useStore, type Page } from './store';
import { Logo } from './Logo';
import { AuthScreen } from './Auth';
import { FixtureShare } from './FixtureShare';
import { SeasonSetup } from './Season';
import { LadderPage } from './pages/Ladder';
import { FixturesPage } from './pages/Fixtures';
import { ReportsPage } from './pages/Reports';
import { SpiritPage } from './pages/Spirit';
import { MvpPage } from './pages/Mvp';
import { TeamsPage } from './pages/Teams';
import { UsersPage } from './pages/Users';
import { PortPage } from './pages/Port';
import { ReportDialog } from './modals/ReportDialog';
import { SettingsDialog } from './modals/Settings';
import { JoinTeamDialog } from './modals/JoinTeam';
import './frisbee.css';

const PAGES: { id: Page; label: string; admin?: boolean }[] = [
  { id: 'ladder', label: 'Ladder' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'reports', label: 'Reports', admin: true },
  { id: 'spirit', label: 'Spirit', admin: true },
  { id: 'mvp', label: 'MVP', admin: true },
  { id: 'teams', label: 'Teams' },
  { id: 'users', label: 'Users', admin: true },
  { id: 'port', label: 'Port', admin: true },
];

/** Follows the document colour mode so the in-app toggle and the workbench stay in sync. */
function useColorMode() {
  const read = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const [mode, setMode] = useState<'light' | 'dark'>(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setMode(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  const toggle = () => {
    document.documentElement.dataset.theme = mode === 'dark' ? 'light' : 'dark';
  };
  return [mode, toggle] as const;
}

export function FrisbeeApp() {
  return (
    <FrisbeeProvider>
      <Root />
    </FrisbeeProvider>
  );
}

function Root() {
  const { auth, share, season } = useStore();
  if (auth) return <AuthScreen />;
  if (share) return <FixtureShare />;
  if (!season) return <SeasonSetup />;
  return <Dashboard />;
}

function Dashboard() {
  const s = useStore();
  const pages = PAGES.filter((p) => !p.admin || s.isAdmin);
  const page = pages.some((p) => p.id === s.page) ? s.page : 'fixtures';

  const reportScore = () => {
    if (!s.user) {
      toast({ title: 'Log in to report a score', description: 'Score reports are submitted by team members.' });
      return s.setAuth('welcome');
    }
    if (!s.myTeam && !s.isAdmin) return s.open({ kind: 'join' });
    s.open({ kind: 'report' });
  };

  return (
    <div className="fr-app">
      <Header />
      <nav className="fr-nav" aria-label="Sections">
        <Tabs value={page} onValueChange={(v) => s.setPage(v as Page)} className="fr-nav__tabs">
          <TabList aria-label="Sections">
            {pages.map((p) => (
              <Tab key={p.id} value={p.id}>
                {p.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
        <Menu
          className="fr-nav__menu"
          trigger={
            <Button variant="secondary" size="sm" leading={<MenuIcon />} trailing={<ChevronDown />} className="fr-nav__menu-trigger">
              {pages.find((p) => p.id === page)?.label}
            </Button>
          }
        >
          {pages.map((p) => (
            <MenuItem key={p.id} onSelect={() => s.setPage(p.id)}>
              {p.label}
            </MenuItem>
          ))}
        </Menu>
        <Button variant="primary" size="sm" leading={<Megaphone />} onClick={reportScore} className="fr-nav__report">
          Report score
        </Button>
      </nav>

      <main className="fr-main">
        {page === 'ladder' && <LadderPage />}
        {page === 'fixtures' && <FixturesPage onReport={reportScore} />}
        {page === 'reports' && <ReportsPage />}
        {page === 'spirit' && <SpiritPage />}
        {page === 'mvp' && <MvpPage />}
        {page === 'teams' && <TeamsPage />}
        {page === 'users' && <UsersPage />}
        {page === 'port' && <PortPage />}
      </main>

      <footer className="fr-footer">
        <Link href="#" subtle onClick={(e) => e.preventDefault()}>WFDF rules</Link>
        <Link href="#" subtle onClick={(e) => e.preventDefault()}>Accreditation</Link>
        <Link href="#" subtle onClick={(e) => e.preventDefault()}>Injury &amp; insurance</Link>
      </footer>

      <ReportDialog open={s.overlay?.kind === 'report'} onOpenChange={(o) => !o && s.open(null)} />
      <SettingsDialog open={s.overlay?.kind === 'settings'} onOpenChange={(o) => !o && s.open(null)} initialTab={s.overlay?.kind === 'settings' ? s.overlay.tab : undefined} />
      <JoinTeamDialog open={s.overlay?.kind === 'join'} onOpenChange={(o) => !o && s.open(null)} />
      <ConfirmDialog
        open={s.overlay?.kind === 'logout'}
        onOpenChange={(o) => !o && s.open(null)}
        icon={<LogOut />}
        title="Log out?"
        description="You can keep browsing fixtures and the ladder as a visitor."
        confirmLabel="Log out"
        onConfirm={() => {
          s.signOut();
          s.open(null);
          toast('Logged out');
        }}
      />
    </div>
  );
}

function Header() {
  const s = useStore();
  const [mode, toggleMode] = useColorMode();
  const persona = Object.entries(PERSONA).find(([, id]) => id === s.user?.id)?.[0] ?? 'custom';

  return (
    <header className="fr-header">
      <div className="fr-brand">
        <Logo />
        <div className="fr-brand__text">
          <Text as="span" weight="semibold" size="sm" className="fr-brand__name">Perth Ultimate League</Text>
          <Text as="span" size="xs" tone="tertiary" className="fr-brand__sub">Ultimate frisbee · est. 2009</Text>
        </div>
      </div>

      <div className="fr-header__actions">
        {s.user && (
          s.myTeam ? (
            <Button variant="ghost" size="sm" className="fr-header__team" leading={<span className="fr-dot" style={{ background: s.myTeam.color }} aria-hidden />} onClick={() => s.open({ kind: 'settings', tab: 'team' })}>
              <span className="fr-header__team-name">{s.myTeam.name}</span>
            </Button>
          ) : s.membership?.pending ? (
            <Tooltip content="Waiting for the team captain to approve your request">
              <Button variant="ghost" size="sm" onClick={() => s.open({ kind: 'join' })}>
                <Badge tone="warning" dot size="sm">Pending</Badge>
              </Button>
            </Tooltip>
          ) : (
            <Button variant="soft" size="sm" leading={<Users />} onClick={() => s.open({ kind: 'join' })}>
              Join a team
            </Button>
          )
        )}

        <Select
          size="sm"
          aria-label="Season"
          className="fr-header__season"
          value={s.season?.id ?? null}
          onValueChange={(v) => v && s.setSeasonId(v)}
          options={s.seasons.map((x) => ({ value: x.id, label: x.name, meta: x.isHidden ? 'Hidden' : undefined }))}
          popupWidth={240}
        />

        <Tooltip content={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton size="sm" variant="ghost" aria-label="Toggle colour mode" onClick={toggleMode}>
            {mode === 'dark' ? <Sun /> : <Moon />}
          </IconButton>
        </Tooltip>

        {s.user ? (
          <>
            <Tooltip content="Settings">
              <IconButton size="sm" variant="ghost" aria-label="Settings" onClick={() => s.open({ kind: 'settings' })} className="fr-hide-sm">
                <Settings />
              </IconButton>
            </Tooltip>
            <Menu
              placement="bottom-end"
              minWidth={230}
              trigger={
                <button type="button" className="fr-avatar-btn" aria-label="Account menu">
                  <Avatar size="sm" name={fullName(s.user)} />
                </button>
              }
            >
              <MenuHeader>
                <Text size="sm" weight="medium">{fullName(s.user)}</Text>
                <Text size="xs" tone="tertiary">{s.user.email}</Text>
              </MenuHeader>
              <MenuSeparator />
              <MenuItem icon={<Settings />} onSelect={() => s.open({ kind: 'settings' })}>Settings</MenuItem>
              <MenuSub label="Demo: view as" icon={<Users />}>
                <MenuRadioGroup value={persona} onValueChange={(v) => s.signIn(PERSONA[v as keyof typeof PERSONA])}>
                  <MenuRadioItem value="admin">Admin · Alex Morgan</MenuRadioItem>
                  <MenuRadioItem value="captain">Captain · Thomas Edwards</MenuRadioItem>
                  <MenuRadioItem value="player">Player · Ruby Nguyen</MenuRadioItem>
                  <MenuRadioItem value="noTeam">No team · Sam Rivera</MenuRadioItem>
                </MenuRadioGroup>
              </MenuSub>
              <MenuSeparator />
              <MenuItem icon={<LogOut />} onSelect={() => s.open({ kind: 'logout' })}>Log out</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" leading={<LogIn />} onClick={() => s.setAuth('login')} className="fr-hide-sm">
              Log in
            </Button>
            <Button size="sm" variant="secondary" leading={<UserPlus />} onClick={() => s.setAuth('welcome')}>
              Sign up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
