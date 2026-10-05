import { useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button, DataTable, EmptyState, Text, type SortState } from '@ui';
import type { Team } from '../data';
import { useStore } from '../store';
import { TeamName, Toolbar, fmtShort, sortRows, usePaged } from '../ui';
import { TeamDialog, TeamCreateDialog } from '../modals/TeamDialog';

export function TeamsPage() {
  const s = useStore();
  const [sort, setSort] = useState<SortState | null>({ key: 'name', direction: 'asc' });
  const [viewing, setViewing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const memberCount = (id: string) => s.db.members.filter((m) => m.teamId === id && !m.pending).length;

  const rows = useMemo(
    () =>
      sortRows(s.teams, sort, {
        name: (t) => t.name,
        division: (t) => t.division ?? 99,
        phone: (t) => t.phone,
        email: (t) => t.email,
        members: (t) => memberCount(t.id),
        created: (t) => t.createdOn,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.teams, sort, s.db.members],
  );
  const paged = usePaged(rows, { search: (t) => [t.name, t.email, t.phone, t.division].join(' ') });

  return (
    <div className="fr-page">
      <Toolbar search={paged.query} onSearch={paged.setQuery} placeholder="Search teams">
        {s.isAdmin && <Button variant="primary" leading={<Plus />} onClick={() => setCreating(true)}>Create team</Button>}
      </Toolbar>
      <DataTable<Team>
        aria-label="Teams"
        rowKey={(t) => t.id}
        rows={paged.rows}
        sort={sort}
        onSortChange={setSort}
        sortRows={false}
        onRowClick={(t) => setViewing(t.id)}
        empty={<EmptyState icon={<Users />} title={paged.query ? 'No matching teams' : 'No teams yet'} description={paged.query ? 'Try another name.' : 'Teams appear here once they sign up for the season.'} />}
        columns={[
          { key: 'name', header: 'Team', sortable: true, render: (t) => <TeamName team={t} /> },
          { key: 'division', header: 'Division', sortable: true, render: (t) => (t.division ? `Division ${t.division}` : <Text as="span" size="sm" tone="tertiary">Unassigned</Text>) },
          { key: 'members', header: 'Players', align: 'right', sortable: true, hideBelow: 'sm', render: (t) => memberCount(t.id) },
          { key: 'phone', header: 'Phone', sortable: true, hideBelow: 'md', render: (t) => <span className="fr-num">{t.phone || '—'}</span> },
          { key: 'email', header: 'Email', sortable: true, hideBelow: 'lg', render: (t) => t.email || '—' },
          { key: 'created', header: 'Created', sortable: true, hideBelow: 'md', render: (t) => <span className="fr-num">{fmtShort(t.createdOn)}</span> },
        ]}
      />
      {paged.pager}
      <TeamDialog teamId={viewing} onClose={() => setViewing(null)} />
      <TeamCreateDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
