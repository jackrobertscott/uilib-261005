import { useEffect, useState } from 'react';
import { CalendarCog, KeyRound, LogOut, Shield, UserRound, Users, Shirt, CalendarPlus } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  toast,
} from '@ui';
import type { Gender, GenderDivision, User } from '../data';
import { useStore } from '../store';
import { MembersManager, TeamForm } from './TeamDialog';
import { SeasonCreateDialog } from '../Season';

export function SettingsDialog({ open, onOpenChange, initialTab }: { open: boolean; onOpenChange: (o: boolean) => void; initialTab?: string }) {
  const s = useStore();
  const [tab, setTab] = useState('account');
  useEffect(() => {
    if (open) setTab(initialTab ?? 'account');
  }, [open, initialTab]);
  const onTeam = !!s.myTeam;
  const canEditTeam = onTeam && (s.isCaptain || s.isAdmin);
  const tabs = [
    { id: 'account', label: 'Account', icon: <UserRound /> },
    { id: 'password', label: 'Password', icon: <KeyRound /> },
    ...(onTeam ? [{ id: 'team', label: 'Team', icon: <Shirt /> }, { id: 'members', label: 'Members', icon: <Users /> }] : []),
    ...(s.isAdmin ? [{ id: 'season', label: 'Season', icon: <CalendarCog /> }] : []),
  ];
  const active = tabs.some((t) => t.id === tab) ? tab : 'account';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Settings" size="xl" className="fr-settings">
      <Tabs orientation="vertical" value={active} onValueChange={setTab} className="fr-settings__tabs">
        <TabList aria-label="Settings sections">
          {tabs.map((t) => (
            <Tab key={t.id} value={t.id} icon={t.icon}>{t.label}</Tab>
          ))}
        </TabList>
        <TabPanel value="account"><AccountSettings /></TabPanel>
        <TabPanel value="password"><PasswordSettings /></TabPanel>
        {onTeam && (
          <TabPanel value="team">
            {canEditTeam ? (
              <TeamForm
                team={s.myTeam!}
                onSave={(p) => {
                  s.update((db) => ({ ...db, teams: db.teams.map((t) => (t.id === s.myTeam!.id ? { ...t, ...p, updatedOn: new Date() } : t)) }));
                  toast.success('Team details saved');
                }}
              />
            ) : (
              <Alert tone="info" icon={<Shield />} title="Only captains can edit team details">Ask your captain if your team’s contact details or colour need updating.</Alert>
            )}
          </TabPanel>
        )}
        {onTeam && (
          <TabPanel value="members">
            <Stack gap={5}>
              <MembersManager teamId={s.myTeam!.id} canManage={canEditTeam} />
              <LeaveTeam onLeft={() => onOpenChange(false)} />
            </Stack>
          </TabPanel>
        )}
        {s.isAdmin && <TabPanel value="season"><SeasonSettings /></TabPanel>}
      </Tabs>
    </Dialog>
  );
}

function AccountSettings() {
  const s = useStore();
  const [form, setForm] = useState<User>(s.user!);
  useEffect(() => setForm(s.user!), [s.user]);
  const save = () => {
    s.update((db) => ({ ...db, users: db.users.map((u) => (u.id === form.id ? form : u)) }));
    toast.success('Account saved');
  };
  return (
    <Stack gap={4}>
      <div className="fr-grid-2">
        <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
        <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
      </div>
      <Field label="Email" labelAside={form.verified ? <Badge size="sm" tone="success" dot>Verified</Badge> : <Badge size="sm" tone="warning" dot>Unverified</Badge>}>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value, verified: e.target.value === s.user!.email && s.user!.verified })} />
      </Field>
      {!form.verified && (
        <Alert tone="warning" actions={<Button size="xs" onClick={() => s.setAuth('verify')}>Verify now</Button>}>Verify your email so captains can find you.</Alert>
      )}
      <Field label="Gender" description="Used for MVP voting in mixed divisions.">
        <RadioGroup orientation="horizontal" value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Gender })}>
          <Radio value="female" label="Female" />
          <Radio value="male" label="Male" />
        </RadioGroup>
      </Field>
      <Button variant="primary" onClick={save} style={{ alignSelf: 'flex-end' }}>Save changes</Button>
    </Stack>
  );
}

function PasswordSettings() {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const save = () => {
    if (!pw.current) return setError('Enter your current password.');
    if (pw.next.length < 8) return setError('Use at least 8 characters.');
    if (pw.next !== pw.confirm) return setError('The new passwords don’t match.');
    setError(null);
    setPw({ current: '', next: '', confirm: '' });
    toast.success('Password updated');
  };
  return (
    <Stack gap={4}>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label="Current password"><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
      <Field label="New password" description="At least 8 characters."><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
      <Field label="Confirm new password"><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
      <Button variant="primary" onClick={save} style={{ alignSelf: 'flex-end' }}>Update password</Button>
    </Stack>
  );
}

function LeaveTeam({ onLeft }: { onLeft: () => void }) {
  const s = useStore();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <div className="fr-danger-row">
        <div>
          <Text size="sm" weight="medium">Leave {s.myTeam?.name}</Text>
          <Text size="xs" tone="tertiary">You won’t be able to report scores until you join another team.</Text>
        </div>
        <Button variant="danger" size="sm" leading={<LogOut />} onClick={() => setConfirm(true)}>Leave team</Button>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        tone="danger"
        icon={<LogOut />}
        title={`Leave ${s.myTeam?.name}?`}
        description="Your captain will need to approve you if you want to rejoin."
        confirmLabel="Leave team"
        confirmVariant="danger"
        onConfirm={() => {
          s.update((db) => ({ ...db, members: db.members.filter((m) => m.id !== s.membership?.id) }));
          toast(`You left ${s.myTeam?.name}`);
          setConfirm(false);
          onLeft();
        }}
      />
    </>
  );
}

function SeasonSettings() {
  const s = useStore();
  const season = s.season!;
  const [form, setForm] = useState(season);
  const [creating, setCreating] = useState(false);
  useEffect(() => setForm(season), [season]);
  const save = () => {
    s.update((db) => ({ ...db, seasons: db.seasons.map((x) => (x.id === form.id ? form : x)) }));
    toast.success('Season saved');
  };
  return (
    <Stack gap={4}>
      <Field label="Season name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Switch checked={!!form.isHidden} onCheckedChange={(v) => setForm({ ...form, isHidden: v })} label="Hide from season picker" description="Only admins will see this season in the dashboard menu." labelPosition="start" />
      <Switch checked={form.signUpOpen} onCheckedChange={(v) => setForm({ ...form, signUpOpen: v })} label="Sign-ups open" description="Teams and players can register while this is on." labelPosition="start" />
      <Field label="Division">
        <Select value={form.genderDivision} onValueChange={(v) => v && setForm({ ...form, genderDivision: v as GenderDivision })} options={[{ value: 'mixed', label: 'Mixed' }, { value: 'men', label: 'Men’s / Open' }, { value: 'women', label: 'Women’s' }]} />
      </Field>
      <Field label="Scoring system" description="Fixed once a season starts so results stay comparable.">
        <Input value={form.useOfficialScoring ? 'Official — 5 spirit categories, 1st/2nd MVP' : 'Simple — single spirit score and MVP'} readOnly disabled />
      </Field>
      <div className="fr-split">
        <Button variant="ghost" leading={<CalendarPlus />} onClick={() => setCreating(true)}>New season…</Button>
        <Button variant="primary" onClick={save}>Save season</Button>
      </div>
      <SeasonCreateDialog open={creating} onOpenChange={setCreating} />
    </Stack>
  );
}
