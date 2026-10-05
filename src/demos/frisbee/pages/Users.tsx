import { useMemo, useState } from 'react';
import { Plus, ShieldCheck, UserRound } from 'lucide-react';
import { Avatar, Badge, Button, DataTable, EmptyState, Stack, Text, type SortState } from '@ui';
import { fullName, type User } from '../data';
import { useStore } from '../store';
import { TeamName, Toolbar, fmtShort, sortRows, usePaged } from '../ui';
import { UserDialog } from '../modals/UserDialog';

export function UsersPage() {
  const s = useStore();
  const [sort, setSort] = useState<SortState | null>({ key: 'name', direction: 'asc' });
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const teamIds = useMemo(() => new Set(s.teams.map((t) => t.id)), [s.teams]);
  const teamOf = (u: User) => s.teamById(s.db.members.find((m) => m.userId === u.id && teamIds.has(m.teamId) && !m.pending)?.teamId);

  const rows = useMemo(
    () =>
      sortRows(s.db.users, sort, {
        name: (u) => `${u.firstName} ${u.lastName}`,
        email: (u) => u.email,
        gender: (u) => u.gender,
        team: (u) => teamOf(u)?.name ?? '~',
        created: (u) => u.createdOn,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.db.users, sort, s.db.members, teamIds],
  );
  const paged = usePaged(rows, { search: (u) => `${u.firstName} ${u.lastName} ${u.email}` });

  return (
    <div className="fr-page">
      <Toolbar search={paged.query} onSearch={paged.setQuery} placeholder="Search by name or email">
        <Button variant="primary" leading={<Plus />} onClick={() => setEditing('new')}>Create user</Button>
      </Toolbar>
      <DataTable<User>
        aria-label="Users"
        rowKey={(u) => u.id}
        rows={paged.rows}
        sort={sort}
        onSortChange={setSort}
        sortRows={false}
        onRowClick={setEditing}
        empty={<EmptyState icon={<UserRound />} title="No matching users" description="Try another name or email address." />}
        columns={[
          {
            key: 'name',
            header: 'Name',
            sortable: true,
            render: (u) => (
              <Stack direction="row" gap={2.5} align="center">
                <Avatar size="sm" name={fullName(u)} />
                <Text as="span" size="sm" weight="medium">{fullName(u)}</Text>
                {u.admin && <Badge size="sm" tone="info" icon={<ShieldCheck />}>Admin</Badge>}
              </Stack>
            ),
          },
          {
            key: 'email',
            header: 'Email',
            sortable: true,
            hideBelow: 'sm',
            render: (u) => (
              <Stack direction="row" gap={2} align="center">
                <Text as="span" size="sm" tone="secondary">{u.email}</Text>
                {!u.verified && <Badge size="sm" tone="warning" variant="outline">Unverified</Badge>}
              </Stack>
            ),
          },
          { key: 'gender', header: 'Gender', sortable: true, hideBelow: 'md', render: (u) => (u.gender === 'male' ? 'Male' : 'Female') },
          { key: 'team', header: 'Team', sortable: true, hideBelow: 'md', render: (u) => (teamOf(u) ? <TeamName team={teamOf(u)} /> : <Text as="span" size="sm" tone="tertiary">—</Text>) },
          { key: 'created', header: 'Joined', sortable: true, hideBelow: 'lg', render: (u) => <span className="fr-num">{fmtShort(u.createdOn)}</span> },
        ]}
      />
      {paged.pager}
      <UserDialog user={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
