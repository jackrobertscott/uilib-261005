import { useEffect, useMemo, useState } from 'react';
import { Asterisk, Command as CommandIcon, Moon, Palette, Sun, LayoutGrid, Monitor, Tablet, Smartphone, Boxes } from 'lucide-react';
import {
  Breadcrumbs,
  Button,
  CommandPalette,
  IconButton,
  Kbd,
  NavItem,
  NavSection,
  SearchInput,
  SegmentedControl,
  Toaster,
  Tooltip,
  type Command,
} from '@ui';
import { GROUPS, byId, modules } from './registry';
import { useThemeState } from './theme';
import { ThemeDrawer } from './ThemeDrawer';
import { StoryPage } from './StoryPage';
import { Overview } from './Overview';
import './workbench.css';

function useHashRoute() {
  const read = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'overview';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = (id: string) => {
    location.hash = `/${id}`;
  };
  return [route, go] as const;
}

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export function Workbench() {
  const [route, go] = useHashRoute();
  const [theme, setTheme] = useThemeState();
  const [query, setQuery] = useState('');
  const [themeOpen, setThemeOpen] = useState(false);
  const [cmdk, setCmdk] = useState(false);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const mod = byId.get(route);

  useEffect(() => {
    document.title = `${mod?.title ?? 'Overview'} · Workbench`;
    document.querySelector('.wb-main')?.scrollTo({ top: 0 });
  }, [mod]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? modules.filter((m) => m.title.toLowerCase().includes(q) || m.group.toLowerCase().includes(q)) : modules;
  }, [query]);

  const commands: Command[] = useMemo(
    () => [
      ...modules.map((m) => ({ value: m.id, label: m.title, group: m.group, onRun: () => go(m.id), keywords: [m.component ?? ''] })),
      { value: 'theme-toggle', label: 'Toggle light / dark', group: 'Theme', icon: <Moon />, onRun: () => setTheme((t) => ({ ...t, mode: t.mode === 'dark' ? 'light' : 'dark' })) },
      { value: 'theme-edit', label: 'Edit theme tokens…', group: 'Theme', icon: <Palette />, onRun: () => setThemeOpen(true) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="wb">
      <aside className="wb-sidebar">
        <div className="wb-brand">
          <span className="wb-brand__mark">
            <Asterisk />
          </span>
          <div>
            <div className="wb-brand__name">Untitled UI Kit</div>
            <div className="wb-brand__sub">Component workbench</div>
          </div>
        </div>
        <SearchInput size="sm" placeholder="Find component" value={query} onChange={(e) => setQuery(e.target.value)} shortcut="⌘K" />
        <nav className="wb-nav" aria-label="Components">
          {!query && (
            <ul className="ui-nav-section__list">
              <NavItem icon={<LayoutGrid />} label="Overview" active={route === 'overview'} href="#/overview" />
            </ul>
          )}
          {GROUPS.map((g) => {
            const items = filtered.filter((m) => m.group === g);
            if (!items.length) return null;
            return (
              <NavSection key={g} title={g}>
                {items.map((m) => (
                  <NavItem key={m.id} label={m.title} active={route === m.id} href={`#/${m.id}`} />
                ))}
              </NavSection>
            );
          })}
          {query && filtered.length === 0 && <p className="wb-empty">No components match “{query}”.</p>}
        </nav>
        <div className="wb-sidebar__foot">
          <Boxes size={14} />
          {modules.filter((m) => m.group !== 'Demos' && m.group !== 'Foundations').length} components · {modules.reduce((n, m) => n + m.stories.length, 0)} stories
        </div>
      </aside>

      <div className="wb-body">
        <header className="wb-topbar">
          <Breadcrumbs items={mod ? [{ label: mod.group, onClick: () => go('overview') }, { label: mod.title }] : [{ label: 'Overview' }]} />
          <div className="wb-topbar__actions">
            {mod?.fullPage && (
              <SegmentedControl
                size="sm"
                aria-label="Viewport"
                value={viewport}
                onValueChange={(v) => setViewport(v as Viewport)}
                options={[
                  { value: 'desktop', icon: <Monitor />, 'aria-label': 'Desktop' },
                  { value: 'tablet', icon: <Tablet />, 'aria-label': 'Tablet' },
                  { value: 'mobile', icon: <Smartphone />, 'aria-label': 'Mobile' },
                ]}
              />
            )}
            <Button size="sm" variant="ghost" leading={<CommandIcon />} onClick={() => setCmdk(true)}>
              Search <Kbd size="sm">⌘K</Kbd>
            </Button>
            <Tooltip content={theme.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton size="sm" aria-label="Toggle colour mode" onClick={() => setTheme({ ...theme, mode: theme.mode === 'dark' ? 'light' : 'dark' })}>
                {theme.mode === 'dark' ? <Sun /> : <Moon />}
              </IconButton>
            </Tooltip>
            <Button size="sm" variant="secondary" leading={<Palette />} onClick={() => setThemeOpen(true)}>
              Theme
            </Button>
          </div>
        </header>
        <main className="wb-main" data-full={mod?.fullPage || undefined}>
          {mod ? <StoryPage key={mod.id} mod={mod} viewport={viewport} /> : <Overview onOpen={go} />}
        </main>
      </div>

      <ThemeDrawer open={themeOpen} onOpenChange={setThemeOpen} theme={theme} setTheme={setTheme} />
      <CommandPalette open={cmdk} onOpenChange={setCmdk} commands={commands} />
      <Toaster />
    </div>
  );
}
