import { useEffect, useMemo, useState } from 'react';
import { Info, Megaphone, Trash2 } from 'lucide-react';
import { Alert, Button, ConfirmDialog, Dialog, Divider, Field, NumberInput, Select, Stack, Text, Textarea, Tooltip, toast } from '@ui';
import { SPIRIT_CATEGORIES, SPIRIT_LEVELS, TODAY, uid, type Gender, type Report } from '../data';
import { isPlayed } from '../compute';
import { useStore } from '../store';
import { TeamName, fmtDate, teamOptions, userOptions } from '../ui';

type MvpKey = 'mvpMale' | 'mvpMale2' | 'mvpFemale' | 'mvpFemale2';

interface Form {
  fixtureId: string | null;
  teamId: string | null;
  againstId: string | null;
  scoreFor: number | null;
  scoreAgainst: number | null;
  mvp: Record<MvpKey, string | null>;
  spirit: number;
  spiritP: number[];
  comment: string;
}

const blank = (): Form => ({
  fixtureId: null,
  teamId: null,
  againstId: null,
  scoreFor: null,
  scoreAgainst: null,
  mvp: { mvpMale: null, mvpMale2: null, mvpFemale: null, mvpFemale2: null },
  spirit: 2,
  spiritP: [2, 2, 2, 2, 2],
  comment: '',
});

/**
 * Score report: fixture → reporting team → opponent (auto-detected from the draw),
 * scores, MVP votes for the opposition and spirit scores. Also used by admins to edit reports.
 */
export function ReportDialog({ open, onOpenChange, report }: { open: boolean; onOpenChange: (o: boolean) => void; report?: Report | null }) {
  const s = useStore();
  const official = s.season?.useOfficialScoring ?? true;
  const editing = !!report;
  const [form, setForm] = useState<Form>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fixtures = useMemo(
    () => s.db.fixtures.filter((f) => f.seasonId === s.season?.id).sort((a, b) => b.date.getTime() - a.date.getTime()),
    [s.db.fixtures, s.season],
  );

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (report) {
      setForm({
        fixtureId: report.fixtureId,
        teamId: report.teamId,
        againstId: report.teamAgainstId,
        scoreFor: report.scoreFor,
        scoreAgainst: report.scoreAgainst,
        mvp: { mvpMale: report.mvpMale ?? null, mvpMale2: report.mvpMale2 ?? null, mvpFemale: report.mvpFemale ?? null, mvpFemale2: report.mvpFemale2 ?? null },
        spirit: report.spirit ?? 2,
        spiritP: [...report.spiritP],
        comment: report.spiritComment,
      });
    } else {
      // Default to the most recent played fixture and the user's own team.
      const latest = fixtures.find((f) => isPlayed(f, TODAY));
      const teamId = s.myTeam?.id ?? null;
      setForm({ ...blank(), fixtureId: latest?.id ?? null, teamId, againstId: opponentIn(latest?.id ?? null, teamId) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, report]);

  function opponentIn(fixtureId: string | null, teamId: string | null) {
    const f = s.db.fixtures.find((x) => x.id === fixtureId);
    const g = f?.games.find((x) => x.team1Id === teamId || x.team2Id === teamId);
    return g ? (g.team1Id === teamId ? g.team2Id : g.team1Id) : null;
  }

  const set = (p: Partial<Form>) => setForm((f) => ({ ...f, ...p }));
  const fixture = s.db.fixtures.find((f) => f.id === form.fixtureId);
  const drawOpponent = opponentIn(form.fixtureId, form.teamId);
  const team = s.teamById(form.teamId ?? undefined);
  const against = s.teamById(form.againstId ?? undefined);
  const existing = !editing && s.db.reports.find((r) => r.fixtureId === form.fixtureId && r.teamId === form.teamId);

  const division = s.season?.genderDivision ?? 'mixed';
  const slots: { key: MvpKey; label: string; gender: Gender }[] = [
    ...(division !== 'women' ? [{ key: 'mvpMale' as const, label: official ? 'Male MVP · 1st' : 'Male MVP', gender: 'male' as const }] : []),
    ...(division !== 'women' && official ? [{ key: 'mvpMale2' as const, label: 'Male MVP · 2nd', gender: 'male' as const }] : []),
    ...(division !== 'men' ? [{ key: 'mvpFemale' as const, label: official ? 'Female MVP · 1st' : 'Female MVP', gender: 'female' as const }] : []),
    ...(division !== 'men' && official ? [{ key: 'mvpFemale2' as const, label: 'Female MVP · 2nd', gender: 'female' as const }] : []),
  ];
  const opposition = useMemo(
    () => s.db.members.filter((m) => m.teamId === form.againstId && !m.pending).map((m) => s.userById(m.userId)!).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.db.members, form.againstId],
  );
  const spiritTotal = form.spiritP.reduce((a, b) => a + b, 0);
  const extreme = form.spiritP.some((v) => v === 0 || v === 4);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.fixtureId) e.fixture = 'Choose the fixture you played.';
    if (!form.teamId) e.team = 'Choose the team you’re reporting for.';
    if (!form.againstId) e.against = 'Choose your opponent.';
    if (form.teamId && form.teamId === form.againstId) e.against = 'A team can’t report against itself.';
    if (form.scoreFor == null) e.scoreFor = 'Enter your score.';
    if (form.scoreAgainst == null) e.scoreAgainst = 'Enter your opponent’s score.';
    if (official && extreme && !form.comment.trim()) e.comment = 'Add a comment explaining any 0 or 4 spirit score.';
    if (existing) e.fixture = `${team?.name} already reported for this fixture. An admin can edit it from Reports.`;
    setErrors(e);
    if (Object.keys(e).length) return;

    const data: Report = {
      id: report?.id ?? uid('rpt'),
      fixtureId: form.fixtureId!,
      teamId: form.teamId!,
      teamAgainstId: form.againstId!,
      userId: report?.userId ?? s.user?.id,
      scoreFor: form.scoreFor!,
      scoreAgainst: form.scoreAgainst!,
      mvpMale: form.mvp.mvpMale ?? undefined,
      mvpMale2: form.mvp.mvpMale2 ?? undefined,
      mvpFemale: form.mvp.mvpFemale ?? undefined,
      mvpFemale2: form.mvp.mvpFemale2 ?? undefined,
      spirit: official ? spiritTotal : form.spirit,
      spiritP: form.spiritP as Report['spiritP'],
      spiritComment: form.comment.trim(),
      createdOn: report?.createdOn ?? new Date(),
    };
    s.update((db) => ({ ...db, reports: editing ? db.reports.map((r) => (r.id === data.id ? data : r)) : [data, ...db.reports] }));
    toast.success(editing ? 'Report updated' : 'Score reported', { description: `${team?.name} ${data.scoreFor}–${data.scoreAgainst} ${against?.name}` });
    onOpenChange(false);
  };

  const remove = () => {
    s.update((db) => ({ ...db, reports: db.reports.filter((r) => r.id !== report?.id) }));
    toast('Report deleted');
    setConfirmDelete(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        icon={!editing ? <Megaphone /> : undefined}
        title={editing ? 'Edit report' : 'Report score'}
        description={!editing ? 'Submit within 48 hours of your game. Both teams report so results can be cross-checked.' : undefined}
        size="lg"
        footer={
          <>
            {editing && (
              <Button variant="danger" leading={<Trash2 />} onClick={() => setConfirmDelete(true)} className="fr-footer-left">
                Delete
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>{editing ? 'Save report' : 'Submit report'}</Button>
          </>
        }
      >
        <Stack gap={5}>
          <div className="fr-grid-2">
            <Field label="Fixture" error={errors.fixture}>
              <Select
                placeholder="Select a fixture"
                value={form.fixtureId}
                onValueChange={(v) => set({ fixtureId: v, againstId: opponentIn(v, form.teamId) ?? form.againstId })}
                options={fixtures.map((f) => ({ value: f.id, label: f.title, meta: fmtDate(f.date), disabled: !isPlayed(f, TODAY) && !s.isAdmin }))}
              />
            </Field>
            <Field label="Reporting for" error={errors.team}>
              <Select
                placeholder="Select your team"
                searchable
                disabled={!s.isAdmin}
                value={form.teamId}
                onValueChange={(v) => set({ teamId: v, againstId: opponentIn(form.fixtureId, v) })}
                options={teamOptions(s.teams)}
              />
            </Field>
          </div>

          <Field label="Opponent" error={errors.against} description={drawOpponent ? 'From the draw for this fixture.' : form.teamId && fixture ? 'This team isn’t in the draw for this fixture — choose the opponent.' : undefined}>
            {drawOpponent && !s.isAdmin ? (
              <div className="fr-readonly"><TeamName team={against} size="md" /></div>
            ) : (
              <Select placeholder="Select opponent" searchable value={form.againstId} onValueChange={(v) => set({ againstId: v })} options={teamOptions(s.teams.filter((t) => t.id !== form.teamId))} />
            )}
          </Field>

          <div className="fr-grid-2">
            <Field label={team ? `${team.name} score` : 'Your score'} error={errors.scoreFor}>
              <NumberInput value={form.scoreFor} onValueChange={(v) => set({ scoreFor: v })} min={0} max={30} placeholder="0" />
            </Field>
            <Field label={against ? `${against.name} score` : 'Opponent score'} error={errors.scoreAgainst}>
              <NumberInput value={form.scoreAgainst} onValueChange={(v) => set({ scoreAgainst: v })} min={0} max={30} placeholder="0" />
            </Field>
          </div>

          <Divider label="MVPs from the opposition" />
          <div className="fr-grid-2">
            {slots.map((slot) => {
              const taken = new Set(Object.entries(form.mvp).filter(([k, v]) => k !== slot.key && v).map(([, v]) => v));
              return (
                <Field key={slot.key} label={slot.label} optional>
                  <Select
                    placeholder={against ? 'Select a player' : 'Choose opponent first'}
                    disabled={!against}
                    searchable
                    clearable
                    value={form.mvp[slot.key]}
                    onValueChange={(v) => set({ mvp: { ...form.mvp, [slot.key]: v } })}
                    options={userOptions(opposition.filter((u) => u.gender === slot.gender && !taken.has(u.id))).map((o) => ({ ...o, description: undefined }))}
                    emptyText="No eligible players"
                  />
                </Field>
              );
            })}
          </div>
          {official && <Text size="xs" tone="tertiary">1st place votes are worth 5 points, 2nd place votes 3 points.</Text>}

          <Divider label="Spirit of the game" />
          {official ? (
            <Stack gap={2}>
              {SPIRIT_CATEGORIES.map((c, i) => (
                <div key={c.title} className="fr-spirit-row">
                  <Text as="span" size="sm" className="fr-spirit-row__label">
                    {c.title}
                    <Tooltip content={c.description}>
                      <span className="fr-info" tabIndex={0} aria-label={c.description}><Info /></span>
                    </Tooltip>
                  </Text>
                  <Select
                    aria-label={c.title}
                    size="sm"
                    value={String(form.spiritP[i])}
                    onValueChange={(v) => set({ spiritP: form.spiritP.map((x, j) => (j === i ? Number(v) : x)) })}
                    options={SPIRIT_LEVELS}
                  />
                </div>
              ))}
              <div className="fr-spirit-total">
                <Text size="sm" tone="secondary">Total</Text>
                <Text size="lg" weight="semibold" className="fr-num">{spiritTotal}<Text as="span" size="sm" tone="tertiary"> / 20</Text></Text>
              </div>
            </Stack>
          ) : (
            <Field label="Spirit score" description="How did the opposition play the game?">
              <Select value={String(form.spirit)} onValueChange={(v) => set({ spirit: Number(v) })} options={SPIRIT_LEVELS} />
            </Field>
          )}
          <Field label="Comment" error={errors.comment} optional={!(official && extreme)} required={official && extreme} description={official && extreme ? 'Required when any category is scored 0 or 4.' : 'Shared with league admins, not the other team.'}>
            <Textarea value={form.comment} onChange={(e) => set({ comment: e.target.value })} rows={3} placeholder="Anything the spirit director should know?" />
          </Field>
          {existing && <Alert tone="warning">{team?.name} has already submitted a report for {fixture?.title}.</Alert>}
        </Stack>
      </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        tone="danger"
        icon={<Trash2 />}
        title="Delete this report?"
        description="Spirit and MVP points from this report will be removed from the standings."
        confirmLabel="Delete report"
        confirmVariant="danger"
        onConfirm={remove}
      />
    </>
  );
}
