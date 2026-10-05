import { useEffect, useState } from 'react';
import { Bell, Crown, Mail, Phone, Trash2, UserMinus, UserPlus } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Combobox,
  ConfirmDialog,
  DescriptionList,
  Dialog,
  EmptyState,
  Field,
  IconButton,
  Input,
  Select,
  Stack,
  SwatchPicker,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Tooltip,
  toast,
} from '@ui';
import { TEAM_COLORS, fullName, uid, type Team } from '../data';
import { useStore } from '../store';
import { TeamName, fmtDate, userOptions } from '../ui';

const DIVISIONS = [
  { value: 'none', label: 'Unassigned' },
  { value: '1', label: 'Division 1' },
  { value: '2', label: 'Division 2' },
  { value: '3', label: 'Division 3' },
];

/** Name / contact / division / colour fields, shared by the admin view, create dialog and captain settings. */
export function TeamForm({ team, onSave, saveLabel = 'Save changes', allowDivision }: { team: Partial<Team>; onSave: (t: Partial<Team>) => void; saveLabel?: string; allowDivision?: boolean }) {
  const [form, setForm] = useState(team);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setForm(team), [team]);
  const set = (p: Partial<Team>) => setForm((f) => ({ ...f, ...p }));
  const save = () => {
    if (!form.name?.trim()) return setError('Team name is required.');
    if (form.email && !/.+@.+\..+/.test(form.email)) return setError('That email address doesn’t look right.');
    setError(null);
    onSave({ ...form, name: form.name.trim() });
  };
  return (
    <Stack gap={4}>
      <Field label="Team name" error={error}>
        <Input value={form.name ?? ''} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <div className="fr-grid-2">
        <Field label="Public phone" optional>
          <Input leading={<Phone />} value={form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} placeholder="04xx xxx xxx" />
        </Field>
        <Field label="Public email" optional>
          <Input leading={<Mail />} type="email" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} placeholder="team@example.com" />
        </Field>
      </div>
      {allowDivision && (
        <Field label="Division" description="Fixtures are generated within each division.">
          <Select value={form.division ? String(form.division) : 'none'} onValueChange={(v) => set({ division: v && v !== 'none' ? Number(v) : undefined })} options={DIVISIONS} />
        </Field>
      )}
      <Field label="Colour" description="Shown next to your team name across the app.">
        <SwatchPicker colors={TEAM_COLORS} value={form.color ?? null} onValueChange={(c) => set({ color: c })} size="sm" />
      </Field>
      <Button variant="primary" onClick={save} style={{ alignSelf: 'flex-end' }}>{saveLabel}</Button>
    </Stack>
  );
}

/** Roster management: approve requests, promote captains, remove players, add existing users. */
export function MembersManager({ teamId, canManage }: { teamId: string; canManage: boolean }) {
  const s = useStore();
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const members = s.db.members
    .filter((m) => m.teamId === teamId)
    .map((m) => ({ m, u: s.userById(m.userId)! }))
    .filter((x) => x.u)
    .sort((a, b) => Number(!!b.m.captain) - Number(!!a.m.captain) || Number(!!b.m.pending) - Number(!!a.m.pending) || a.u.firstName.localeCompare(b.u.firstName));
  const seasonTeamIds = new Set(s.teams.map((t) => t.id));
  const available = s.db.users.filter((u) => !s.db.members.some((m) => m.userId === u.id && seasonTeamIds.has(m.teamId)));
  const patchMember = (id: string, p: Partial<(typeof members)[number]['m']>) => s.update((db) => ({ ...db, members: db.members.map((m) => (m.id === id ? { ...m, ...p } : m)) }));
  const removingMember = members.find((x) => x.m.id === removing);

  const add = () => {
    if (!adding) return;
    s.update((db) => ({ ...db, members: [...db.members, { id: uid('mbr'), teamId, userId: adding }] }));
    toast.success(`${fullName(s.userById(adding))} added to the team`);
    setAdding(null);
  };

  return (
    <Stack gap={4}>
      {canManage && (
        <div className="fr-add-member">
          <Combobox options={userOptions(available)} value={adding} onValueChange={setAdding} placeholder="Find a player by name or email…" aria-label="Add a player" leading={<UserPlus />} />
          <Button variant="primary" disabled={!adding} onClick={add}>Add</Button>
        </div>
      )}
      {members.length === 0 ? (
        <EmptyState icon={<UserPlus />} title="No players yet" description="Players can request to join from the dashboard." />
      ) : (
        <ul className="fr-members">
          {members.map(({ m, u }) => (
            <li key={m.id}>
              <Avatar size="sm" name={fullName(u)} />
              <div className="fr-members__who">
                <Text size="sm" weight="medium">{fullName(u)}</Text>
                {canManage && <Text size="xs" tone="tertiary">{u.email}</Text>}
              </div>
              {m.captain && <Badge size="sm" icon={<Crown />}>Captain</Badge>}
              {m.pending && <Badge size="sm" tone="warning" icon={<Bell />}>Requested</Badge>}
              {canManage && (
                <div className="fr-members__actions">
                  {m.pending ? (
                    <>
                      <Button size="xs" variant="primary" onClick={() => (patchMember(m.id, { pending: false }), toast.success(`${u.firstName} approved`))}>Approve</Button>
                      <Button size="xs" variant="ghost" onClick={() => (s.update((db) => ({ ...db, members: db.members.filter((x) => x.id !== m.id) })), toast(`${u.firstName}’s request declined`))}>Decline</Button>
                    </>
                  ) : (
                    <>
                      <Tooltip content={m.captain ? 'Remove captain role' : 'Make captain'}>
                        <IconButton size="xs" variant="ghost" aria-label={m.captain ? `Remove captain role from ${u.firstName}` : `Make ${u.firstName} captain`} pressed={m.captain} onClick={() => patchMember(m.id, { captain: !m.captain })}>
                          <Crown />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Remove from team">
                        <IconButton size="xs" variant="ghost" aria-label={`Remove ${u.firstName} from team`} onClick={() => setRemoving(m.id)}>
                          <UserMinus />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        tone="danger"
        icon={<UserMinus />}
        title={`Remove ${removingMember ? fullName(removingMember.u) : ''}?`}
        description="They’ll lose access to reporting for this team. They can request to join again."
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={() => {
          s.update((db) => ({ ...db, members: db.members.filter((x) => x.id !== removing) }));
          setRemoving(null);
        }}
      />
    </Stack>
  );
}

/** Team detail: admins get editable details + roster; everyone else a read-only card. */
export function TeamDialog({ teamId, onClose }: { teamId: string | null; onClose: () => void }) {
  const s = useStore();
  const team = s.teamById(teamId ?? undefined);
  const [tab, setTab] = useState('details');
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => setTab('details'), [teamId]);
  const roster = s.db.members.filter((m) => m.teamId === teamId && !m.pending);
  const captain = s.userById(roster.find((m) => m.captain)?.userId);

  return (
    <>
      <Dialog
        open={!!team}
        onOpenChange={(o) => !o && onClose()}
        size="lg"
        title={team && <TeamName team={team} size="md" />}
        description={team && `${team.division ? `Division ${team.division}` : 'No division'} · ${roster.length} players`}
        footer={
          s.isAdmin ? (
            <>
              <Button variant="danger" leading={<Trash2 />} onClick={() => setConfirmDelete(true)} className="fr-footer-left">Delete team</Button>
              <Button onClick={onClose}>Close</Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )
        }
      >
        {team && s.isAdmin && (
          <Tabs value={tab} onValueChange={setTab}>
            <TabList aria-label="Team">
              <Tab value="details">Details</Tab>
              <Tab value="members" count={roster.length}>Members</Tab>
            </TabList>
            <TabPanel value="details">
              <Stack gap={5}>
                <TeamForm
                  team={team}
                  allowDivision
                  onSave={(p) => {
                    s.update((db) => ({ ...db, teams: db.teams.map((t) => (t.id === team.id ? { ...t, ...p, updatedOn: new Date() } : t)) }));
                    toast.success('Team saved');
                  }}
                />
                <DescriptionList
                  items={[
                    { term: 'Created', detail: fmtDate(team.createdOn) },
                    { term: 'Last updated', detail: fmtDate(team.updatedOn) },
                  ]}
                />
              </Stack>
            </TabPanel>
            <TabPanel value="members">
              <MembersManager teamId={team.id} canManage />
            </TabPanel>
          </Tabs>
        )}
        {team && !s.isAdmin && (
          <Stack gap={5}>
            <DescriptionList
              items={[
                { term: 'Captain', detail: fullName(captain) },
                { term: 'Phone', detail: team.phone || '—' },
                { term: 'Email', detail: team.email || '—' },
              ]}
            />
            <Stack gap={2}>
              <Text size="sm" weight="medium">Players</Text>
              <MembersManager teamId={team.id} canManage={false} />
            </Stack>
          </Stack>
        )}
      </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        tone="danger"
        icon={<Trash2 />}
        title={`Delete ${team?.name}?`}
        description="Its members and reports will be removed, and it will be taken out of every fixture. This can’t be undone."
        confirmLabel="Delete team"
        confirmVariant="danger"
        onConfirm={() => {
          s.update((db) => ({
            ...db,
            teams: db.teams.filter((t) => t.id !== teamId),
            members: db.members.filter((m) => m.teamId !== teamId),
            reports: db.reports.filter((r) => r.teamId !== teamId && r.teamAgainstId !== teamId),
            fixtures: db.fixtures.map((f) => ({ ...f, games: f.games.filter((g) => g.team1Id !== teamId && g.team2Id !== teamId) })),
          }));
          toast(`${team?.name} deleted`);
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}

/** Create a team; when `asCaptain` the signed-in user becomes its captain. */
export function TeamCreateDialog({ open, onOpenChange, asCaptain }: { open: boolean; onOpenChange: (o: boolean) => void; asCaptain?: boolean }) {
  const s = useStore();
  const used = new Set(s.teams.map((t) => t.color));
  const initial = { name: '', color: TEAM_COLORS.find((c) => !used.has(c)) ?? TEAM_COLORS[0] };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create team" description={asCaptain ? 'You’ll be the captain and can invite players afterwards.' : `Adds a team to ${s.season?.name}.`}>
      {open && (
        <TeamForm
          team={initial}
          allowDivision={s.isAdmin}
          saveLabel="Create team"
          onSave={(p) => {
            const team: Team = { id: uid('tm'), seasonId: s.season!.id, name: p.name!, color: p.color!, division: p.division, phone: p.phone, email: p.email, createdOn: new Date(), updatedOn: new Date() };
            s.update((db) => ({
              ...db,
              teams: [...db.teams, team],
              members: asCaptain && s.user ? [...db.members.filter((m) => !(m.userId === s.user!.id && m.pending)), { id: uid('mbr'), teamId: team.id, userId: s.user.id, captain: true }] : db.members,
            }));
            toast.success(`${team.name} created`);
            onOpenChange(false);
          }}
        />
      )}
    </Dialog>
  );
}
