import { useState } from 'react';
import { ArrowUpRight, CircleDollarSign, Download, HardDrive, Plus, Upload, Users, FileText } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DateRangePicker,
  IconButton,
  List,
  ListItem,
  PageHeader,
  Progress,
  ProgressCircle,
  SegmentedControl,
  Sparkline,
  Stack,
  Stat,
  Text,
  Timeline,
  Tooltip,
  defaultRangePresets,
} from '@ui';
import { defineStories } from '../workbench/types';
import { people } from '../stories/_data';
import { DemoShell, HeaderActions } from './_shell';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const series = {
  uploads: [42, 55, 48, 62, 70, 66, 81, 77, 90, 86, 98, 104],
  shares: [20, 26, 30, 28, 35, 40, 38, 46, 50, 48, 55, 61],
};

function BarChart({ range }: { range: string }) {
  const n = range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const up = series.uploads.slice(-n);
  const sh = series.shares.slice(-n);
  const labels = months.slice(-n);
  const max = Math.max(...up) * 1.1;
  return (
    <div>
      <div className="demo-legend">
        <span><i style={{ background: 'var(--chart-1)' }} />Uploads</span>
        <span><i style={{ background: 'var(--chart-5)' }} />Shares</span>
      </div>
      <div className="demo-chart" role="img" aria-label="Uploads and shares per month">
        {labels.map((m, i) => (
          <div key={m} className="demo-chart__col">
            <div className="demo-chart__bars">
              <Tooltip content={`${m}: ${up[i]} uploads`}>
                <div className="demo-chart__bar" tabIndex={0} style={{ height: `${(up[i] / max) * 100}%`, background: 'var(--chart-1)' }} />
              </Tooltip>
              <Tooltip content={`${m}: ${sh[i]} shares`}>
                <div className="demo-chart__bar" tabIndex={0} style={{ height: `${(sh[i] / max) * 100}%`, background: 'var(--chart-5)' }} />
              </Tooltip>
            </div>
            <span className="demo-chart__label">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPage() {
  const [range, setRange] = useState('12m');
  return (
    <DemoShell active="dashboard">
      <div className="demo-page">
        <PageHeader
          title="Welcome back, Caitlyn"
          description="Here’s what’s happening across your workspace."
          actions={<HeaderActions />}
        />
        <Stack direction="row" gap={2} wrap justify="space-between">
          <SegmentedControl
            size="sm"
            aria-label="Range"
            value={range}
            onValueChange={setRange}
            options={[
              { value: '12m', label: '12 months' },
              { value: '6m', label: '6 months' },
              { value: '3m', label: '3 months' },
            ]}
          />
          <Stack direction="row" gap={2}>
            <DateRangePicker size="sm" presets={defaultRangePresets} placeholder="Custom range" />
            <Button size="sm" leading={<Download />}>Export</Button>
            <Button size="sm" variant="primary" leading={<Plus />}>New report</Button>
          </Stack>
        </Stack>

        <div className="demo-grid-4">
          <Card padding="lg"><Stat label="Total files" value="12,481" delta={8.2} deltaLabel="vs last month" icon={<FileText />} /></Card>
          <Card padding="lg"><Stat label="Active members" value="48" delta={4} deltaLabel="vs last month" icon={<Users />} chart={<Sparkline data={[3, 5, 4, 6, 7, 6, 8]} width={72} />} /></Card>
          <Card padding="lg"><Stat label="Monthly spend" value="$2,340" delta={-3.4} invertDelta deltaLabel="vs last month" icon={<CircleDollarSign />} /></Card>
          <Card padding="lg">
            <Stack gap={3}>
              <Stack direction="row" gap={2} align="center">
                <span className="ui-icon-tile" data-size="sm"><HardDrive /></span>
                <Text size="sm" tone="secondary" weight="medium">Storage</Text>
              </Stack>
              <Stack direction="row" gap={4} align="center">
                <ProgressCircle value={72} size={56} thickness={5} tone="accent" />
                <div>
                  <Text size="lg" weight="semibold">7.2 GB</Text>
                  <Text size="xs" tone="tertiary">of 10 GB used</Text>
                </div>
              </Stack>
            </Stack>
          </Card>
        </div>

        <div className="demo-grid-main">
          <Card>
            <CardHeader title="Activity" description="Uploads and shares over time" actions={<IconButton size="sm" aria-label="Open report"><ArrowUpRight /></IconButton>} />
            <CardBody>
              <BarChart range={range} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Storage by type" />
            <CardBody>
              <Stack gap={4}>
                <Progress label="Documents" value={46} showValue tone="accent" size="sm" />
                <Progress label="Spreadsheets" value={22} showValue size="sm" />
                <Progress label="Design files" value={18} showValue tone="warning" size="sm" />
                <Progress label="Images" value={9} showValue tone="success" size="sm" />
                <Progress label="Other" value={5} showValue size="sm" />
              </Stack>
            </CardBody>
          </Card>
        </div>

        <div className="demo-grid-main">
          <Card>
            <CardHeader title="Top contributors" actions={<Button size="sm" variant="ghost">View all</Button>} divider />
            <DataTable
              bordered={false}
              density="compact"
              rowKey={(p) => p.id}
              rows={people.slice(0, 5).map((p, i) => ({ ...p, files: [148, 121, 96, 72, 51][i], change: [12, 8, -4, 3, 0][i] }))}
              columns={[
                { key: 'name', header: 'Member', sortable: true, render: (p) => <Stack direction="row" gap={2.5} align="center"><Avatar size="sm" src={p.avatar} name={p.name} /><div><Text size="sm" weight="medium">{p.name}</Text><Text size="xs" tone="tertiary">{p.role}</Text></div></Stack> },
                { key: 'files', header: 'Files', sortable: true, align: 'right' },
                { key: 'change', header: 'Trend', align: 'right', render: (p) => <Badge size="sm" tone={p.change > 0 ? 'success' : p.change < 0 ? 'danger' : 'neutral'}>{p.change > 0 ? '+' : ''}{p.change}%</Badge> },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Recent activity" divider />
            <CardBody>
              <Timeline
                items={[
                  { id: '1', marker: <Avatar size="sm" src={people[1].avatar} name="Eve" />, title: <><b>Eve</b> shared <b>Marketing site</b></>, time: '5m' },
                  { id: '2', marker: <Upload />, title: <><b>Alex</b> uploaded 4 files</>, time: '1h' },
                  { id: '3', marker: <Avatar size="sm" src={people[3].avatar} name="Olivia" />, title: <><b>Olivia</b> created <b>Roadmap 2028</b></>, time: '3h' },
                  { id: '4', title: 'Weekly backup completed', time: 'Mon', tone: 'success' },
                ]}
              />
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Pending invitations" description="People who haven’t joined yet." divider />
          <List bordered={false}>
            {['lana@acme.com', 'demi@acme.com'].map((e) => (
              <ListItem key={e} leading={<Avatar name={e} />} title={e} description="Invited 2 days ago · Editor" trailing={<><Button size="xs" variant="ghost">Revoke</Button><Button size="xs">Resend</Button></>} />
            ))}
          </List>
        </Card>
      </div>
    </DemoShell>
  );
}

export default defineStories({
  id: 'demo-dashboard',
  title: 'Dashboard',
  group: 'Demos',
  order: 2,
  fullPage: true,
  stories: [{ name: 'Dashboard', render: () => <DashboardPage /> }],
});
