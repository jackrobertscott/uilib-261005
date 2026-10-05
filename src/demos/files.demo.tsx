import { useMemo, useState } from 'react';
import { Download, FileText, Filter, Folder, Link2, Pin, Plus, Share2, Sheet, Trash2, UserPlus, FileSearch } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  DataTable,
  DateRangePicker,
  Dialog,
  DescriptionList,
  Drawer,
  EmptyState,
  Field,
  IconButton,
  IconTile,
  Input,
  PageHeader,
  Pagination,
  RadioGroup,
  Radio,
  SearchInput,
  SectionHeader,
  Select,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
  Timeline,
  toast,
} from '@ui';
import { defineStories } from '../workbench/types';
import { files, fmtDate, people, type FileRow } from '../stories/_data';
import { fileColumns, fileIcon } from '../stories/table.stories';
import { DemoShell, HeaderActions } from './_shell';

const typeTabs: Record<string, FileRow['type'][] | null> = {
  all: null,
  docs: ['docx'],
  sheets: ['xls'],
  pdf: ['pdf'],
  images: ['png', 'fig'],
};

function FilesPage() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(7);
  const [sel, setSel] = useState<string[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detail, setDetail] = useState<FileRow | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [pinned, setPinned] = useState(['f3', 'f1', 'f7']);

  const rows = useMemo(() => {
    const types = typeTabs[tab];
    return files.filter((f) => (!types || types.includes(f.type)) && f.name.toLowerCase().includes(q.toLowerCase()) && (!owners.length || owners.includes(f.owner.id)));
  }, [tab, q, owners]);
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const pageRows = rows.slice((page - 1) * size, page * size);

  const quick = [
    { icon: <FileText />, label: 'New document' },
    { icon: <Sheet />, label: 'New spreadsheet' },
    { icon: <Folder />, label: 'New project' },
    { icon: <UserPlus />, label: 'New team' },
  ];

  return (
    <DemoShell active="files">
      <div className="demo-page">
        <PageHeader title="All files" description="Manage cloud files and projects here." actions={<HeaderActions />} />

        <div className="demo-quick">
          {quick.map((qa) => (
            <Card key={qa.label} interactive padding="md" tabIndex={0} className="demo-quick__card" onClick={() => setCreating(qa.label)} onKeyDown={(e) => e.key === 'Enter' && setCreating(qa.label)}>
              <Stack direction="row" justify="space-between" align="flex-start">
                <IconTile>{qa.icon}</IconTile>
                <Plus size={15} className="demo-quick__plus" />
              </Stack>
              <Text size="sm" weight="medium">{qa.label}</Text>
            </Card>
          ))}
        </div>

        <Stack gap={4}>
          <SectionHeader title="File explorer" />
          <div className="demo-toolbar">
            <Tabs variant="segmented" size="sm" value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
              <TabList aria-label="File type">
                <Tab value="all">View all</Tab>
                <Tab value="docs">Documents</Tab>
                <Tab value="sheets">Spreadsheets</Tab>
                <Tab value="pdf">PDFs</Tab>
                <Tab value="images">Images</Tab>
              </TabList>
            </Tabs>
            <Stack direction="row" gap={2} className="demo-toolbar__right">
              <SearchInput size="sm" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="demo-search" />
              <Button size="sm" leading={<Filter />} onClick={() => setFiltersOpen(true)}>
                Filters{owners.length ? <Badge size="sm" tone="accent">{owners.length}</Badge> : null}
              </Button>
            </Stack>
          </div>

          <div className="demo-pinned">
            {pinned.map((id) => files.find((f) => f.id === id)!).map((f) => (
              <Card key={f.id} interactive padding="sm" onClick={() => setDetail(f)}>
                <Stack direction="row" gap={3} align="center">
                  <IconTile>{fileIcon(f.type)}</IconTile>
                  <Stack gap={0} grow>
                    <Text size="sm" weight="medium" truncate>{f.name}</Text>
                    <Text size="xs" tone="tertiary">{f.size} · {f.type}</Text>
                  </Stack>
                  <IconButton size="xs" aria-label="Unpin" className="demo-pin" onClick={(e) => { e.stopPropagation(); setPinned(pinned.filter((x) => x !== f.id)); toast(`Unpinned ${f.name}`); }}>
                    <Pin />
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </div>

          <DataTable
            aria-label="Files"
            columns={fileColumns()}
            rows={pageRows}
            rowKey={(f) => f.id}
            selectable
            selected={sel}
            onSelectedChange={setSel}
            onRowClick={setDetail}
            empty={<EmptyState icon={<FileSearch />} title="No files found" description={q ? `Nothing matches “${q}”.` : 'No files of this type yet.'} actions={q ? <Button size="sm" onClick={() => setQ('')}>Clear search</Button> : undefined} />}
            bulkActions={(keys, clear) => (
              <>
                <Button size="sm" variant="ghost" leading={<Download />} onClick={() => toast(`Downloading ${keys.length} files`)}>Download</Button>
                <Button size="sm" variant="ghost" leading={<Share2 />}>Share</Button>
                <Button size="sm" variant="ghost" leading={<Trash2 />} onClick={() => { toast.error(`${keys.length} files moved to trash`, { action: { label: 'Undo', onClick: () => toast('Restored') } }); clear(); }}>Delete</Button>
              </>
            )}
          />
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} pageSize={size} pageSizeOptions={[5, 7, 10, 20]} onPageSizeChange={(n) => { setSize(n); setPage(1); }} />
        </Stack>
      </div>

      <Drawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filters"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOwners([])}>Reset</Button>
            <Button variant="primary" onClick={() => setFiltersOpen(false)}>Show {rows.length} files</Button>
          </>
        }
      >
        <Stack gap={6}>
          <Field label="Uploaded by">
            <CheckboxGroup value={owners} onValueChange={(v) => { setOwners(v); setPage(1); }}>
              {people.slice(0, 5).map((p) => (
                <Checkbox key={p.id} value={p.id} label={<Stack direction="row" gap={2} align="center"><Avatar size="xs" src={p.avatar} name={p.name} />{p.name}</Stack>} />
              ))}
            </CheckboxGroup>
          </Field>
          <Field label="Last modified">
            <DateRangePicker />
          </Field>
          <Field label="Sort by">
            <Select defaultValue="modified" options={[{ value: 'modified', label: 'Last modified' }, { value: 'name', label: 'Name' }, { value: 'size', label: 'Size' }]} />
          </Field>
        </Stack>
      </Drawer>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name}
        description={detail ? `${detail.size} · ${detail.type.toUpperCase()}` : undefined}
        footer={
          <>
            <Button leading={<Link2 />} onClick={() => toast.success('Link copied')}>Copy link</Button>
            <Button variant="primary" leading={<Download />}>Download</Button>
          </>
        }
      >
        {detail && (
          <Stack gap={6}>
            <div className="demo-preview">
              <IconTile size="lg">{fileIcon(detail.type)}</IconTile>
            </div>
            <DescriptionList
              items={[
                { term: 'Owner', detail: <Stack direction="row" gap={2} align="center"><Avatar size="xs" src={detail.owner.avatar} name={detail.owner.name} />{detail.owner.name}</Stack> },
                { term: 'Modified', detail: fmtDate(detail.modified) },
                { term: 'Size', detail: detail.size },
                { term: 'Sharing', detail: <Badge tone="success" dot size="sm">Team</Badge> },
              ]}
            />
            <Stack gap={3}>
              <Text size="sm" weight="semibold">Activity</Text>
              <Timeline
                items={[
                  { id: '1', marker: <Avatar size="sm" src={detail.owner.avatar} name={detail.owner.name} />, title: <><b>{detail.owner.name.split(' ')[0]}</b> edited the file</>, time: '2h ago' },
                  { id: '2', marker: <Avatar size="sm" src={people[1].avatar} name="Eve" />, title: <><b>Eve</b> left a comment</>, time: 'Yesterday', children: '“Looks great — ship it.”' },
                  { id: '3', title: 'File uploaded', time: fmtDate(detail.modified), tone: 'success' },
                ]}
              />
            </Stack>
          </Stack>
        )}
      </Drawer>

      <Dialog
        open={!!creating}
        onOpenChange={(o) => !o && setCreating(null)}
        icon={<Plus />}
        title={creating ?? ''}
        description="Give it a name and choose who can access it."
        footer={
          <>
            <Button onClick={() => setCreating(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => { toast.success(`${creating} created`); setCreating(null); }}>Create</Button>
          </>
        }
      >
        <Stack gap={4}>
          <Field label="Name" required>
            <Input placeholder="Untitled" autoFocus />
          </Field>
          <Field label="Access">
            <RadioGroup defaultValue="team">
              <Radio value="private" label="Only me" />
              <Radio value="team" label="Everyone in Untitled UI" />
              <Radio value="link" label="Anyone with the link" />
            </RadioGroup>
          </Field>
        </Stack>
      </Dialog>
    </DemoShell>
  );
}

export default defineStories({
  id: 'demo-files',
  title: 'Files (reference)',
  group: 'Demos',
  order: 1,
  fullPage: true,
  stories: [{ name: 'Files', render: () => <FilesPage /> }],
});
