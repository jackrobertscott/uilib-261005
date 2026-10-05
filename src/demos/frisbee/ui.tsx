/* Small compositions shared across the Frisbee demo (built only from library components). */
import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx, Pagination, SearchInput, Swatch, Text, type Option, type SortState } from '@ui';
import type { Team, User } from './data';

export const fmtDate = (d: Date) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
export const fmtShort = (d: Date) => new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d);
export const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: 'numeric', minute: '2-digit' }).format(d);

/** Team name with its colour chip. */
export function TeamName({ team, size = 'sm', short, muted }: { team?: Team; size?: 'sm' | 'md'; short?: boolean; muted?: boolean }) {
  if (!team) return <Text as="span" size="sm" tone="tertiary">Unknown team</Text>;
  const label = short ? initials(team.name) : team.name;
  return (
    <span className={cx('fr-team', muted && 'fr-team--muted')} data-size={size}>
      <Swatch color={team.color} size={size === 'md' ? 'md' : 'sm'} />
      <span className="fr-team__name">{label}</span>
    </span>
  );
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => !/^the$/i.test(w))
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const teamOptions = (teams: Team[]): Option[] =>
  teams.map((t) => ({ value: t.id, label: t.name, icon: <Swatch color={t.color} />, meta: t.division ? `Div ${t.division}` : undefined }));

export const userOptions = (users: User[]): Option[] => users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}`, description: u.email }));

/** A card-like disclosure row: title on the left, meta + chevron on the right, optional action button. */
export function FixtureRow({ title, meta, open, onToggle, action, children }: { title: ReactNode; meta?: ReactNode; open: boolean; onToggle: () => void; action?: ReactNode; children?: ReactNode }) {
  return (
    <section className="fr-row" data-open={open || undefined}>
      <div className="fr-row__head">
        <button type="button" className="fr-row__toggle" aria-expanded={open} onClick={onToggle}>
          <span className="fr-row__title">{title}</span>
          <span className="fr-row__meta">{meta}</span>
          <ChevronDown className="fr-row__chevron" aria-hidden />
        </button>
        {action && <div className="fr-row__action">{action}</div>}
      </div>
      {open && <div className="fr-row__body">{children}</div>}
    </section>
  );
}

/** Client-side search + sort + paging for directory pages. */
export function usePaged<T>(rows: T[], opts: { search: (row: T) => string; pageSize?: number }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(opts.pageSize ?? 25);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => opts.search(r).toLowerCase().includes(q)) : rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  return {
    query,
    setQuery: (q: string) => {
      setQuery(q);
      setPage(1);
    },
    rows: filtered.slice((current - 1) * pageSize, current * pageSize),
    total: filtered.length,
    pager: (
      <Pagination
        page={current}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        total={filtered.length}
      />
    ),
  };
}

/** Sort rows by a column key using a value getter map (DataTable sorts only the visible page otherwise). */
export function sortRows<T>(rows: T[], sort: SortState | null, get: Record<string, (r: T) => string | number | Date | undefined>) {
  if (!sort || !get[sort.key]) return rows;
  const g = get[sort.key];
  const dir = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = g(a);
    const y = g(b);
    if (x == null) return 1;
    if (y == null) return -1;
    return (x < y ? -1 : x > y ? 1 : 0) * dir;
  });
}

export function Toolbar({ search, onSearch, placeholder = 'Search', children }: { search?: string; onSearch?: (q: string) => void; placeholder?: string; children?: ReactNode }) {
  return (
    <div className="fr-toolbar">
      {onSearch && <SearchInput className="fr-toolbar__search" placeholder={placeholder} value={search} onChange={(e) => onSearch(e.target.value)} onClear={() => onSearch('')} />}
      <div className="fr-toolbar__actions">{children}</div>
    </div>
  );
}

/** Heading row for a page section. */
export function SectionTitle({ icon, title, aside }: { icon?: ReactNode; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="fr-section-title">
      {icon && <span className="fr-section-title__icon">{icon}</span>}
      <Text as="h2" size="sm" weight="semibold">{title}</Text>
      {aside && <div className="fr-section-title__aside">{aside}</div>}
    </div>
  );
}
