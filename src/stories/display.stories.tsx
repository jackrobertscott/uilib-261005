import { useState } from 'react';
import { CheckCircle2, CircleDollarSign, FileText, Folder, FolderOpen, GitCommit, MessageSquare, MoreHorizontal, Pin, Plus, Sheet, UserPlus, Users } from 'lucide-react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Code,
  DescriptionList,
  Heading,
  IconButton,
  IconTile,
  Kbd,
  Link,
  List,
  ListItem,
  Sparkline,
  Stack,
  Stat,
  Tag,
  Text,
  Timeline,
  Tree,
  type TreeNode,
} from '@ui';
import { defineStories } from '../workbench/types';
import { people } from './_data';

export const badge = defineStories({
  id: 'badge',
  title: 'Badge & tag',
  group: 'Data display',
  component: 'Badge',
  childrenArg: 'children',
  description: 'Badges label status and metadata. Tags are neutral, optionally removable tokens.',
  playground: {
    args: { children: 'Active', tone: 'success', variant: 'soft', size: 'md', dot: true },
    controls: {
      children: { type: 'text', label: 'label' },
      tone: { type: 'select', options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] },
      variant: { type: 'radio', options: ['soft', 'outline', 'solid'] },
      size: { type: 'radio', options: ['sm', 'md'] },
      dot: { type: 'boolean' },
    },
    render: (a) => <Badge {...a} />,
  },
  stories: [
    {
      name: 'Tones × variants',
      render: () => (
        <Stack gap={3}>
          {(['soft', 'outline', 'solid'] as const).map((v) => (
            <div className="sb-row" key={v}>
              {(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map((t) => (
                <Badge key={t} tone={t} variant={v} dot>
                  {t[0].toUpperCase() + t.slice(1)}
                </Badge>
              ))}
            </div>
          ))}
        </Stack>
      ),
    },
    {
      name: 'File types (reference)',
      render: () => (
        <>
          <Badge variant="outline" size="sm">pdf</Badge>
          <Badge variant="outline" size="sm">docx</Badge>
          <Badge variant="outline" size="sm">xls</Badge>
          <Badge size="sm">12</Badge>
          <Badge tone="accent" size="sm">New</Badge>
          <Badge tone="danger" variant="solid" size="sm">3</Badge>
        </>
      ),
    },
    {
      name: 'Tags',
      render: function Render() {
        const [tags, setTags] = useState(['Design', 'Engineering', 'Marketing', 'Q4 2028']);
        return (
          <div className="sb-row">
            {tags.map((t) => (
              <Tag key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>
                {t}
              </Tag>
            ))}
            <Tag icon={<Pin />}>Pinned</Tag>
            <Tag size="sm">Small</Tag>
          </div>
        );
      },
    },
  ],
});

export const avatar = defineStories({
  id: 'avatar',
  title: 'Avatar',
  group: 'Data display',
  component: 'Avatar',
  description: 'Images fall back to initials in a bordered circle, exactly as in the reference table rows.',
  playground: {
    args: { name: 'Caitlyn Edwards', size: 'lg', shape: 'circle', status: 'online', withImage: true },
    controls: {
      name: { type: 'text' },
      size: { type: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      shape: { type: 'radio', options: ['circle', 'square'] },
      status: { type: 'select', options: ['online', 'away', 'busy', 'offline'] },
      withImage: { type: 'boolean' },
    },
    code: (a) => `<Avatar name="${a.name}" size="${a.size}"${a.shape !== 'circle' ? ` shape="${a.shape}"` : ''}${a.status ? ` status="${a.status}"` : ''}${a.withImage ? ' src={url}' : ''} />`,
    render: ({ withImage, ...a }) => <Avatar {...a} src={withImage ? people[0].avatar : undefined} />,
  },
  stories: [
    {
      name: 'Sizes',
      render: () => (
        <>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <Avatar key={s} size={s} src={people[1].avatar} name="Eve Mathews" />
          ))}
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <Avatar key={'i' + s} size={s} name="Alex Wilkinson" />
          ))}
        </>
      ),
    },
    {
      name: 'Status & shape',
      render: () => (
        <>
          <Avatar name="Olivia Rhye" src={people[3].avatar} status="online" size="lg" />
          <Avatar name="Phoenix Baker" src={people[4].avatar} status="away" size="lg" />
          <Avatar name="Lana Steiner" status="busy" size="lg" />
          <Avatar name="Demi W" status="offline" size="lg" shape="square" />
        </>
      ),
    },
    {
      name: 'Group',
      render: () => (
        <Stack gap={4}>
          <AvatarGroup max={5}>
            {people.map((p) => (
              <Avatar key={p.id} src={p.avatar} name={p.name} />
            ))}
          </AvatarGroup>
          <AvatarGroup size="sm" max={3}>
            {people.map((p) => (
              <Avatar key={p.id} size="sm" src={p.avatar} name={p.name} />
            ))}
          </AvatarGroup>
        </Stack>
      ),
    },
    {
      name: 'User cell (reference)',
      render: () => (
        <Stack gap={4}>
          {people.slice(0, 3).map((p) => (
            <Stack key={p.id} direction="row" gap={2.5} align="center">
              <Avatar src={p.avatar} name={p.name} />
              <div>
                <Text size="sm" weight="medium">{p.name}</Text>
                <Text size="sm" tone="tertiary">{p.email}</Text>
              </div>
            </Stack>
          ))}
        </Stack>
      ),
    },
  ],
});

export const card = defineStories({
  id: 'card',
  title: 'Card',
  group: 'Data display',
  description: 'Surface container with header/body/footer slots. Includes the "New document" quick-action tile and pinned file card from the reference.',
  stories: [
    {
      name: 'Quick actions (reference)',
      layout: 'padded',
      render: () => (
        <div className="sb-grid-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {[
            [FileText, 'New document'],
            [Sheet, 'New spreadsheet'],
            [Folder, 'New project'],
            [UserPlus, 'New team'],
          ].map(([Icon, label]: any) => (
            <Card key={label} interactive padding="md" tabIndex={0} style={{ gap: 'var(--sp-5)' }}>
              <Stack direction="row" justify="space-between" align="flex-start">
                <IconTile>
                  <Icon />
                </IconTile>
                <Plus size={16} color="var(--text-tertiary)" />
              </Stack>
              <Text size="sm" weight="medium">{label}</Text>
            </Card>
          ))}
        </div>
      ),
    },
    {
      name: 'Pinned file (reference)',
      layout: 'padded',
      render: () => (
        <div className="sb-grid-3">
          {[
            ['Q4_2028 Reporting', '1.2 MB', 'pdf', FileText],
            ['Dashboard tech requirements', '220 KB', 'docx', FileText],
            ['FY_2027-28 Financials', '628 KB', 'xls', Sheet],
          ].map(([name, size, type, Icon]: any) => (
            <Card key={name} interactive padding="sm">
              <Stack direction="row" gap={3} align="center">
                <IconTile>
                  <Icon />
                </IconTile>
                <Stack gap={0} grow>
                  <Text size="sm" weight="medium" truncate>{name}</Text>
                  <Text size="xs" tone="tertiary">
                    {size} · {type}
                  </Text>
                </Stack>
                <Pin size={14} color="var(--text-tertiary)" style={{ alignSelf: 'flex-start' }} />
              </Stack>
            </Card>
          ))}
        </div>
      ),
    },
    {
      name: 'Composed card',
      render: () => (
        <Card className="sb-w-400">
          <CardHeader title="Team members" description="Invite your colleagues to collaborate." icon={<Users />} actions={<IconButton aria-label="More" size="sm"><MoreHorizontal /></IconButton>} divider />
          <CardBody>
            <Stack gap={3}>
              {people.slice(0, 3).map((p) => (
                <Stack key={p.id} direction="row" gap={2.5} align="center">
                  <Avatar size="sm" src={p.avatar} name={p.name} />
                  <Text size="sm" style={{ flex: 1 }}>{p.name}</Text>
                  <Badge size="sm" variant="outline">{p.role.split(' ')[0]}</Badge>
                </Stack>
              ))}
            </Stack>
          </CardBody>
          <CardFooter>
            <Button size="sm" variant="ghost">Cancel</Button>
            <Button size="sm" variant="primary" leading={<UserPlus />}>Invite</Button>
          </CardFooter>
        </Card>
      ),
    },
    {
      name: 'Variants',
      layout: 'padded',
      render: () => (
        <div className="sb-grid-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {(['outline', 'elevated', 'subtle', 'ghost'] as const).map((v) => (
            <Card key={v} variant={v} padding="lg">
              <Text size="sm" weight="medium">{v}</Text>
              <Text size="xs" tone="tertiary">variant="{v}"</Text>
            </Card>
          ))}
        </div>
      ),
    },
  ],
});

export const stat = defineStories({
  id: 'stat',
  title: 'Stat',
  group: 'Data display',
  description: 'KPI content for dashboards with change indicator and sparkline.',
  stories: [
    {
      name: 'Metric cards',
      layout: 'padded',
      render: () => (
        <div className="sb-grid-3">
          <Card padding="lg">
            <Stat label="Total revenue" value="$48,920" delta={12.4} deltaLabel="vs last month" icon={<CircleDollarSign />} chart={<Sparkline data={[4, 6, 5, 8, 7, 9, 12, 11, 14]} tone="success" />} />
          </Card>
          <Card padding="lg">
            <Stat label="Active users" value="2,318" delta={3.1} deltaLabel="vs last month" icon={<Users />} chart={<Sparkline data={[8, 7, 9, 8, 10, 9, 11, 10, 12]} />} />
          </Card>
          <Card padding="lg">
            <Stat label="Churn rate" value="1.8%" delta={-0.6} invertDelta deltaLabel="vs last month" icon={<CheckCircle2 />} chart={<Sparkline data={[9, 8, 8, 7, 7, 6, 5, 5, 4]} tone="neutral" />} />
          </Card>
        </div>
      ),
    },
  ],
});

const tree: TreeNode[] = [
  {
    id: 'projects',
    label: 'Projects',
    icon: <Folder />,
    iconOpen: <FolderOpen />,
    children: [
      { id: 'p-web', label: 'Website redesign', icon: <Folder />, children: [{ id: 'p-web-1', label: 'Wireframes.fig', icon: <FileText /> }] },
      { id: 'p-app', label: 'Mobile app', icon: <Folder /> , children: [{ id: 'p-app-1', label: 'Spec.docx', icon: <FileText /> }]},
    ],
  },
  {
    id: 'folders',
    label: 'Folders',
    icon: <Folder />,
    iconOpen: <FolderOpen />,
    children: ['Olivia’s files', 'Sophie’s files', 'Dashboard UI', 'Dribbble', 'Websites', 'Mobile apps'].map((l, i) => ({
      id: `f${i}`,
      label: l,
      icon: <Folder />,
      meta: i === 2 ? '12' : undefined,
      children: i < 2 ? [{ id: `f${i}-a`, label: 'Notes.md', icon: <FileText /> }] : undefined,
    })),
  },
];

export const treeStory = defineStories({
  id: 'tree',
  title: 'Tree view',
  group: 'Data display',
  description: 'Hierarchical navigation like the "Browser" panel in the reference. Arrow keys expand/collapse and move; Enter selects.',
  stories: [
    {
      name: 'Folder browser',
      render: function Render() {
        const [sel, setSel] = useState<string | null>('f2');
        return (
          <div className="sb-w-280" style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 'var(--radius-lg)', boxShadow: '0 0 0 1px var(--border-subtle)' }}>
            <Tree aria-label="Files" nodes={tree} selected={sel} onSelect={setSel} defaultExpanded={['folders']} />
          </div>
        );
      },
    },
  ],
});

export const lists = defineStories({
  id: 'list',
  title: 'List, timeline & details',
  group: 'Data display',
  description: 'Row lists, activity timelines and description lists for detail views.',
  stories: [
    {
      name: 'List',
      render: () => (
        <div className="sb-w-400" style={{ width: 420 }}>
          <List>
            {people.slice(0, 4).map((p, i) => (
              <ListItem key={p.id} leading={<Avatar src={p.avatar} name={p.name} status={p.status} />} title={p.name} description={p.email} trailing={i === 0 ? <Badge tone="accent" size="sm">Owner</Badge> : p.role} onClick={() => undefined} />
            ))}
          </List>
        </div>
      ),
    },
    {
      name: 'Timeline',
      render: () => (
        <div className="sb-w-400" style={{ width: 420 }}>
          <Timeline
            items={[
              { id: '1', marker: <Avatar size="sm" src={people[0].avatar} name="Caitlyn" />, title: <><b>Caitlyn</b> uploaded <b>Dashboard requirements v2</b></>, time: '2m ago' },
              { id: '2', marker: <MessageSquare />, title: <><b>Eve</b> commented</>, time: '1h ago', children: '“Can we tighten the spacing on the table header?”' },
              { id: '3', marker: <GitCommit />, title: <><b>Alex</b> merged <Code>feat/pagination</Code></>, time: 'Yesterday' },
              { id: '4', title: 'Project created', time: 'Jan 2', tone: 'success' },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Description list',
      layout: 'padded',
      render: () => (
        <Stack gap={8}>
          <DescriptionList
            items={[
              { term: 'File name', detail: 'Q4_2028 Reporting.pdf' },
              { term: 'Uploaded by', detail: <Stack direction="row" gap={2} align="center"><Avatar size="xs" name="Alex Wilkinson" /> Alex Wilkinson</Stack> },
              { term: 'Size', detail: '1.2 MB' },
              { term: 'Status', detail: <Badge tone="success" dot size="sm">Synced</Badge> },
            ]}
          />
          <DescriptionList layout="grid" items={[{ term: 'Plan', detail: 'Team' }, { term: 'Seats', detail: '12 of 20' }, { term: 'Renews', detail: 'Feb 1, 2029' }, { term: 'Amount', detail: '$348.00' }]} />
        </Stack>
      ),
    },
  ],
});

export const typographyComp = defineStories({
  id: 'text',
  title: 'Heading, text & link',
  group: 'Data display',
  stories: [
    {
      name: 'Typography components',
      layout: 'padded',
      render: () => (
        <Stack gap={3}>
          <Heading level={1}>All files</Heading>
          <Text tone="tertiary" size="sm">Manage cloud files and projects here.</Text>
          <Heading level={3}>File explorer</Heading>
          <Text>
            Body text with a <Link href="#">link</Link>, an <Link href="#" external>external link</Link>, some <Code>inline code</Code> and a shortcut <Kbd>⌘</Kbd> <Kbd>K</Kbd>.
          </Text>
          <Text size="sm" tone="secondary" mono>
            sha256: 8f2a…c41e
          </Text>
        </Stack>
      ),
    },
  ],
});
