import { useState } from 'react';
import { CloudDownload, Database, Download, FileUp, Inbox, Pencil, Settings2, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  ConfirmDialog,
  DataTable,
  Dialog,
  EmptyState,
  Field,
  FileDropzone,
  FileItem,
  IconTile,
  Input,
  NumberInput,
  Spinner,
  Stack,
  Switch,
  Text,
  toast,
} from '@ui';
import { TODAY, addDays, makeSeason, makeUsers, rng, uid, type Db, type GamedayImport } from '../data';
import { useStore } from '../store';
import { fmtDateTime } from '../ui';

type Tool = 'import' | 'gameday' | 'export' | 'mock' | 'delete' | null;

export function PortPage() {
  const s = useStore();
  const [tool, setTool] = useState<Tool>(null);
  const configured = !!s.db.gameday.url && !!s.db.gameday.apiKey;
  const running = s.db.imports.some((i) => i.status === 'running');

  const runImport = (trigger: GamedayImport['trigger'] = 'manual') => {
    const job: GamedayImport = { id: uid('imp'), startedOn: new Date(), trigger, status: 'running', source: s.db.gameday.url, rows: 0, members: 0 };
    s.update((db) => ({ ...db, imports: [job, ...db.imports] }));
    setTimeout(() => {
      const ok = Math.random() > 0.2;
      s.update((db) => ({
        ...db,
        imports: db.imports.map((i) => (i.id === job.id ? { ...i, status: ok ? 'success' : 'failed', rows: ok ? 132 : 0, members: ok ? 9 : 0, error: ok ? undefined : '401 Unauthorized — check the API key' } : i)),
      }));
      ok ? toast.success('GameDay import finished', { description: '132 rows read, 9 new members.' }) : toast.error('GameDay import failed', { description: 'The API key was rejected.' });
    }, 1800);
  };

  const tools = [
    { id: 'import' as const, icon: <FileUp />, title: 'Import CSV', body: 'Bulk-add players and teams from a spreadsheet.' },
    { id: 'gameday' as const, icon: <Settings2 />, title: 'GameDay settings', body: configured ? 'Connected — imports registrations from GameDay.' : 'Connect GameDay to sync registrations.' },
    { id: 'run' as const, icon: <CloudDownload />, title: 'Run GameDay import', body: configured ? 'Pull the latest registrations now.' : 'Configure GameDay settings first.', disabled: !configured || running },
    { id: 'export' as const, icon: <Download />, title: 'Export data', body: 'Download the season as JSON for backups or analysis.' },
    { id: 'mock' as const, icon: <Pencil />, title: 'Create mock data', body: 'Generate a sample season to try features safely.' },
    { id: 'delete' as const, icon: <Trash2 />, title: 'Delete mock data', body: 'Remove every generated sample record.', danger: true },
  ];

  return (
    <div className="fr-page">
      <div className="fr-tools">
        {tools.map((t) => (
          <button key={t.id} type="button" className="fr-tool" data-danger={t.danger || undefined} disabled={t.disabled} onClick={() => (t.id === 'run' ? runImport() : setTool(t.id))}>
            <IconTile size="sm">{t.id === 'run' && running ? <Spinner size={14} /> : t.icon}</IconTile>
            <span className="fr-tool__text">
              <Text as="span" size="sm" weight="medium">{t.title}</Text>
              <Text as="span" size="xs" tone="tertiary">{t.body}</Text>
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="GameDay import history" description={s.db.gameday.autoImport ? 'Automatic import runs nightly at 2:00am.' : 'Imports run when triggered manually.'} divider />
        <DataTable<GamedayImport>
          bordered={false}
          density="compact"
          rowKey={(i) => i.id}
          rows={s.db.imports}
          empty={<EmptyState icon={<Inbox />} title="No imports yet" description="Runs will appear here once GameDay is connected." />}
          columns={[
            { key: 'startedOn', header: 'Started', render: (i) => <span className="fr-num">{fmtDateTime(i.startedOn)}</span> },
            { key: 'trigger', header: 'Trigger', render: (i) => (i.trigger === 'manual' ? 'Manual' : 'Scheduled') },
            {
              key: 'status',
              header: 'Status',
              render: (i) =>
                i.status === 'running' ? (
                  <Badge size="sm" icon={<Spinner size={10} />}>Running</Badge>
                ) : (
                  <Badge size="sm" tone={i.status === 'success' ? 'success' : 'danger'} dot>{i.status === 'success' ? 'Success' : 'Failed'}</Badge>
                ),
            },
            { key: 'source', header: 'Source', hideBelow: 'lg', render: (i) => <Text as="span" size="sm" tone="secondary" truncate>{i.source}</Text> },
            { key: 'rows', header: 'Rows', align: 'right', hideBelow: 'sm' },
            { key: 'members', header: 'Members', align: 'right', hideBelow: 'sm' },
            { key: 'error', header: 'Error', hideBelow: 'md', render: (i) => (i.error ? <Text as="span" size="sm" tone="danger">{i.error}</Text> : '—') },
          ]}
        />
      </Card>

      <ImportCsvDialog open={tool === 'import'} onOpenChange={(o) => !o && setTool(null)} />
      <GamedaySettingsDialog open={tool === 'gameday'} onOpenChange={(o) => !o && setTool(null)} />
      <ExportDialog open={tool === 'export'} onOpenChange={(o) => !o && setTool(null)} />
      <MockGenerateDialog open={tool === 'mock'} onOpenChange={(o) => !o && setTool(null)} />
      <ConfirmDialog
        open={tool === 'delete'}
        onOpenChange={(o) => !o && setTool(null)}
        tone="danger"
        icon={<Trash2 />}
        title="Delete all mock data?"
        description="Removes every season, team, fixture and report in this demo — including the sample league — so you can see the new-season flow. Users are kept."
        confirmLabel="Delete mock data"
        confirmVariant="danger"
        onConfirm={() => {
          s.update((db) => ({ ...db, seasons: [], teams: [], members: [], fixtures: [], reports: [] }));
          setTool(null);
          toast('Mock data deleted');
        }}
      />
    </div>
  );
}

function ImportCsvDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [files, setFiles] = useState<{ file: File; progress: number; status: 'uploading' | 'complete' | 'error' }[]>([]);
  const add = (list: File[]) => {
    const items = list.map((file) => ({ file, progress: 0, status: 'uploading' as const }));
    setFiles((f) => [...f, ...items]);
    items.forEach((it) => {
      let p = 0;
      const t = setInterval(() => {
        p += 20;
        setFiles((fs) => fs.map((x) => (x.file === it.file ? { ...x, progress: Math.min(100, p), status: p >= 100 ? 'complete' : 'uploading' } : x)));
        if (p >= 100) clearInterval(t);
      }, 180);
    });
  };
  const done = files.length > 0 && files.every((f) => f.status === 'complete');
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (onOpenChange(o), !o && setFiles([]))}
      icon={<FileUp />}
      title="Import CSV"
      description="Columns: first name, last name, email, gender, team. Existing users are matched by email."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" disabled={!done} onClick={() => (toast.success('Import queued', { description: `${files.length} file${files.length === 1 ? '' : 's'} will be processed.` }), onOpenChange(false), setFiles([]))}>
            Import
          </Button>
        </>
      }
    >
      <Stack gap={3}>
        <FileDropzone accept=".csv,text/csv" onFiles={add} hint="CSV files only (max. 5 MB)" maxSize={5 * 1024 * 1024} />
        {files.map((f) => (
          <FileItem key={f.file.name} name={f.file.name} size={f.file.size} progress={f.progress} status={f.status} onRemove={() => setFiles((fs) => fs.filter((x) => x !== f))} />
        ))}
      </Stack>
    </Dialog>
  );
}

function GamedaySettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const [form, setForm] = useState(s.db.gameday);
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (onOpenChange(o), o || setForm(s.db.gameday))}
      icon={<Settings2 />}
      title="GameDay settings"
      description="Registrations from GameDay are matched to users by email."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              s.update((db) => ({ ...db, gameday: form }));
              toast.success('GameDay settings saved');
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <Field label="Export URL" description="The registrations report URL from your GameDay admin.">
          <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://websites.mygameday.app/…" />
        </Field>
        <Field label="API key">
          <Input type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="gd_live_…" />
        </Field>
        <Switch checked={form.autoImport} onCheckedChange={(v) => setForm({ ...form, autoImport: v })} label="Import automatically" description="Runs every night at 2:00am." labelPosition="start" />
      </Stack>
    </Dialog>
  );
}

const COLLECTIONS = ['teams', 'members', 'fixtures', 'reports', 'users'] as const;

function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const [picked, setPicked] = useState<string[]>(['teams', 'fixtures', 'reports']);
  const exportNow = () => {
    const season = s.season!;
    const teamIds = new Set(s.teams.map((t) => t.id));
    const scoped: Record<string, unknown[]> = {
      teams: s.teams,
      members: s.db.members.filter((m) => teamIds.has(m.teamId)),
      fixtures: s.db.fixtures.filter((f) => f.seasonId === season.id),
      reports: s.db.reports.filter((r) => teamIds.has(r.teamId)),
      users: s.db.users.map(({ id, firstName, lastName, gender }) => ({ id, firstName, lastName, gender })),
    };
    const data = Object.fromEntries(picked.map((k) => [k, scoped[k]]));
    const blob = new Blob([JSON.stringify({ season, ...data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${season.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Export downloaded');
    onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Database />}
      title="Export data"
      description={`Download ${s.season?.name} as JSON.`}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" leading={<Download />} disabled={!picked.length} onClick={exportNow}>Download</Button>
        </>
      }
    >
      <Field label="Include">
        <CheckboxGroup value={picked} onValueChange={setPicked}>
          {COLLECTIONS.map((c) => (
            <Checkbox key={c} value={c} label={c[0].toUpperCase() + c.slice(1)} description={c === 'users' ? 'Names and gender only — emails are never exported.' : undefined} />
          ))}
        </CheckboxGroup>
      </Field>
    </Dialog>
  );
}

function MockGenerateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore();
  const [name, setName] = useState('Mock League');
  const [rounds, setRounds] = useState<number | null>(9);
  const [played, setPlayed] = useState<number | null>(4);
  const generate = () => {
    const seed = Math.floor(Math.random() * 1e6);
    const extra = s.db.users.length < 100 ? makeUsers(rng(seed), 150, TODAY) : [];
    const users = [...s.db.users, ...extra];
    const r = Math.max(1, rounds ?? 9);
    const p = Math.min(r, Math.max(0, played ?? 0));
    const created = makeSeason({ name: name.trim() || 'Mock League', start: addDays(TODAY, -7 * p + 1), rounds: r, played: p, seed, users, mock: true });
    s.update((db): Db => ({
      ...db,
      users,
      seasons: [...created.seasons, ...db.seasons],
      teams: [...db.teams, ...created.teams],
      members: [...db.members, ...created.members],
      fixtures: [...db.fixtures, ...created.fixtures],
      reports: [...db.reports, ...created.reports],
    }));
    s.setSeasonId(created.seasons[0].id);
    toast.success(`${created.seasons[0].name} generated`, { description: `${created.teams.length} teams, ${created.fixtures.length} rounds, ${created.reports.length} reports.` });
    onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Pencil />}
      title="Create mock data"
      description="Generates a complete sample season with 12 teams, players, results and reports."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" onClick={generate}>Generate</Button>
        </>
      }
    >
      <Stack gap={4}>
        <Field label="Season name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <div className="fr-grid-2">
          <Field label="Rounds"><NumberInput value={rounds} onValueChange={setRounds} min={1} max={20} /></Field>
          <Field label="Rounds already played"><NumberInput value={played} onValueChange={setPlayed} min={0} max={rounds ?? 20} /></Field>
        </div>
        <Alert tone="info">Mock teams are flagged so they can be removed later with “Delete mock data”.</Alert>
      </Stack>
    </Dialog>
  );
}
