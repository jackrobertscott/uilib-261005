import { useEffect, useState } from 'react';
import { GitMerge, Mail, Trash2 } from 'lucide-react';
import { Alert, Button, Combobox, ConfirmDialog, DescriptionList, Dialog, Field, Input, Radio, RadioGroup, Stack, Switch, Text, toast } from '@ui';
import { fullName, uid, type Gender, type User } from '../data';
import { useStore } from '../store';
import { fmtDate, userOptions } from '../ui';

/** Admin: create or edit a user account, merge duplicates, or delete. */
export function UserDialog({ user, onClose }: { user: User | 'new' | null; onClose: () => void }) {
  const s = useStore();
  const isNew = user === 'new';
  const [form, setForm] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);
  const [merge, setMerge] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setError(null);
    if (user === 'new') setForm({ firstName: '', lastName: '', email: '', gender: 'female', verified: false });
    else if (user) setForm(user);
  }, [user]);

  const set = (p: Partial<User>) => setForm((f) => ({ ...f, ...p }));
  const save = () => {
    if (!form.firstName?.trim() || !form.lastName?.trim()) return setError('First and last name are required.');
    if (!form.email || !/.+@.+\..+/.test(form.email)) return setError('Enter a valid email address.');
    if (s.db.users.some((u) => u.email.toLowerCase() === form.email!.toLowerCase() && u.id !== form.id)) return setError('Another account already uses that email. Merge the accounts instead.');
    const next = { ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim() } as User;
    if (isNew) {
      next.id = uid('usr');
      next.createdOn = new Date();
    }
    s.update((db) => ({ ...db, users: isNew ? [...db.users, next] : db.users.map((u) => (u.id === next.id ? next : u)) }));
    toast.success(isNew ? `${fullName(next)} created` : 'User saved');
    onClose();
  };

  const existing = user && user !== 'new' ? user : null;

  return (
    <>
      <Dialog
        open={!!user && !merge}
        onOpenChange={(o) => !o && onClose()}
        title={isNew ? 'Create user' : fullName(existing)}
        description={existing?.email}
        footer={
          <>
            {existing && (
              <Stack direction="row" gap={2} className="fr-footer-left">
                <Button variant="ghost" leading={<GitMerge />} onClick={() => setMerge(true)}>Merge…</Button>
                <Button variant="ghost" leading={<Trash2 />} onClick={() => setConfirmDelete(true)} disabled={existing.id === s.user?.id}>Delete</Button>
              </Stack>
            )}
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={save}>{isNew ? 'Create user' : 'Save'}</Button>
          </>
        }
      >
        <Stack gap={4}>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="fr-grid-2">
            <Field label="First name"><Input value={form.firstName ?? ''} onChange={(e) => set({ firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={form.lastName ?? ''} onChange={(e) => set({ lastName: e.target.value })} /></Field>
          </div>
          <Field label="Email">
            <Input leading={<Mail />} type="email" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
          </Field>
          <Field label="Gender">
            <RadioGroup orientation="horizontal" value={form.gender} onValueChange={(v) => set({ gender: v as Gender })}>
              <Radio value="female" label="Female" />
              <Radio value="male" label="Male" />
            </RadioGroup>
          </Field>
          <Switch checked={!!form.verified} onCheckedChange={(v) => set({ verified: v })} label="Email verified" labelPosition="start" />
          <Switch checked={!!form.admin} onCheckedChange={(v) => set({ admin: v })} label="League admin" description="Can manage fixtures, teams, users and all reports." labelPosition="start" disabled={existing?.id === s.user?.id} />
          {existing && <DescriptionList items={[{ term: 'Joined', detail: fmtDate(existing.createdOn) }, { term: 'User id', detail: <Text as="span" size="sm" mono>{existing.id}</Text> }]} />}
        </Stack>
      </Dialog>
      {existing && <MergeDialog open={merge} onOpenChange={setMerge} target={existing} onMerged={onClose} />}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        tone="danger"
        icon={<Trash2 />}
        title={`Delete ${fullName(existing)}?`}
        description="Their team memberships will be removed. Reports they submitted are kept."
        confirmLabel="Delete user"
        confirmVariant="danger"
        onConfirm={() => {
          s.update((db) => ({ ...db, users: db.users.filter((u) => u.id !== existing?.id), members: db.members.filter((m) => m.userId !== existing?.id) }));
          toast(`${fullName(existing)} deleted`);
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}

/** Fold a duplicate account into `target`: memberships, reports and MVP votes move across. */
function MergeDialog({ open, onOpenChange, target, onMerged }: { open: boolean; onOpenChange: (o: boolean) => void; target: User; onMerged: () => void }) {
  const s = useStore();
  const [dupe, setDupe] = useState<string | null>(null);
  useEffect(() => setDupe(null), [open]);
  const other = s.userById(dupe ?? undefined);
  const reportCount = s.db.reports.filter((r) => r.userId === dupe).length;
  const memberCount = s.db.members.filter((m) => m.userId === dupe).length;

  const doMerge = () => {
    if (!dupe) return;
    const swap = (id?: string) => (id === dupe ? target.id : id);
    s.update((db) => ({
      ...db,
      users: db.users.filter((u) => u.id !== dupe),
      members: db.members.map((m) => ({ ...m, userId: swap(m.userId)! })),
      reports: db.reports.map((r) => ({ ...r, userId: swap(r.userId), mvpMale: swap(r.mvpMale), mvpMale2: swap(r.mvpMale2), mvpFemale: swap(r.mvpFemale), mvpFemale2: swap(r.mvpFemale2) })),
    }));
    toast.success(`Merged ${fullName(other)} into ${fullName(target)}`);
    onOpenChange(false);
    onMerged();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<GitMerge />}
      title="Merge accounts"
      description={`Pick a duplicate account to fold into ${fullName(target)}. The duplicate is deleted afterwards.`}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Back</Button>
          <Button variant="danger" disabled={!dupe} onClick={doMerge}>Merge accounts</Button>
        </>
      }
    >
      <Stack gap={4}>
        <Field label="Duplicate account">
          <Combobox options={userOptions(s.db.users.filter((u) => u.id !== target.id))} value={dupe} onValueChange={setDupe} placeholder="Search by name or email…" />
        </Field>
        {other && (
          <Alert tone="warning" title="This can’t be undone">
            {memberCount} team membership{memberCount === 1 ? '' : 's'} and {reportCount} submitted report{reportCount === 1 ? '' : 's'} from {other.email} will move to {target.email}.
          </Alert>
        )}
      </Stack>
    </Dialog>
  );
}
