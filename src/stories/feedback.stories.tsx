import { CloudOff, FolderPlus, Inbox, Search, Sparkles, Upload } from 'lucide-react';
import { Alert, Button, Card, EmptyState, Link, Progress, ProgressCircle, Skeleton, Spinner, Stack, toast } from '@ui';
import { defineStories } from '../workbench/types';

export const alert = defineStories({
  id: 'alert',
  title: 'Alert',
  group: 'Feedback',
  component: 'Alert',
  childrenArg: 'children',
  description: 'Inline, contextual messages. Use banner for full-width page notices.',
  playground: {
    args: { tone: 'info', title: 'A new version is available', children: 'Refresh to get the latest features and fixes.', dismissable: true },
    controls: {
      tone: { type: 'select', options: ['neutral', 'info', 'success', 'warning', 'danger'] },
      title: { type: 'text' },
      children: { type: 'text', label: 'body' },
      dismissable: { type: 'boolean' },
    },
    render: (a) => (
      <div className="sb-w-400" style={{ width: 460 }}>
        <Alert key={JSON.stringify(a)} {...a} />
      </div>
    ),
  },
  stories: [
    {
      name: 'Tones',
      layout: 'padded',
      render: () => (
        <Stack gap={3}>
          <Alert title="Heads up">Your trial ends in 3 days.</Alert>
          <Alert tone="info" title="Scheduled maintenance">We’ll be offline Sunday 02:00–03:00 UTC.</Alert>
          <Alert tone="success" title="Payment received">Invoice #1042 has been paid.</Alert>
          <Alert tone="warning" title="Storage almost full" actions={<><Link href="#">Upgrade plan</Link><Link href="#" subtle>Manage files</Link></>}>
            You’ve used 92% of your 10 GB.
          </Alert>
          <Alert tone="danger" title="Sync failed" dismissable>
            We couldn’t reach the server. Check your connection and try again.
          </Alert>
        </Stack>
      ),
    },
    {
      name: 'Banner',
      layout: 'fullscreen',
      render: () => (
        <Stack gap={0}>
          <Alert banner tone="info" icon={<Sparkles />} title="New: AI search." dismissable actions={<Link href="#">Try it</Link>}>
            Find any file by describing it.
          </Alert>
          <Alert banner tone="warning" title="You’re offline." icon={<CloudOff />}>
            Changes will sync when you reconnect.
          </Alert>
        </Stack>
      ),
    },
  ],
});

export const toastStory = defineStories({
  id: 'toast',
  title: 'Toast',
  group: 'Feedback',
  description: 'Transient notifications. Call toast() from anywhere; mount <Toaster /> once. Hover pauses the timer.',
  stories: [
    {
      name: 'Trigger toasts',
      render: () => (
        <>
          <Button onClick={() => toast('Link copied to clipboard')}>Neutral</Button>
          <Button onClick={() => toast.success('File uploaded', { description: 'Q4_2028 Reporting.pdf is ready.' })}>Success</Button>
          <Button onClick={() => toast.error('Couldn’t delete file', { description: 'You don’t have permission.' })}>Error</Button>
          <Button onClick={() => toast.warning('Storage almost full')}>Warning</Button>
          <Button onClick={() => toast.info('3 new comments', { action: { label: 'View', onClick: () => toast('Opening comments…') } })}>With action</Button>
          <Button
            variant="primary"
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 1800)), {
                loading: 'Uploading 4 files…',
                success: 'All files uploaded',
                error: 'Upload failed',
              })
            }
          >
            Promise
          </Button>
        </>
      ),
    },
  ],
});

export const progress = defineStories({
  id: 'progress',
  title: 'Progress & loading',
  group: 'Feedback',
  description: 'Determinate bars and rings, indeterminate bars, spinners and skeletons.',
  stories: [
    {
      name: 'Progress bar',
      render: () => (
        <Stack gap={5} className="sb-w-400">
          <Progress value={64} label="Storage used" showValue />
          <Progress value={32} tone="accent" size="sm" />
          <Progress value={88} tone="warning" />
          <Progress value={100} tone="success" size="lg" />
          <Progress label="Processing…" />
        </Stack>
      ),
    },
    {
      name: 'Progress circle',
      render: () => (
        <>
          <ProgressCircle value={25} />
          <ProgressCircle value={60} tone="accent" size={64} thickness={6} />
          <ProgressCircle value={92} tone="success" size={80} thickness={7} />
          <ProgressCircle value={40} size={32} thickness={3} showValue={false} />
        </>
      ),
    },
    {
      name: 'Spinner',
      render: () => (
        <>
          <Spinner size={14} />
          <Spinner size={18} />
          <Spinner size={24} />
          <span style={{ color: 'var(--accent)' }}>
            <Spinner size={24} />
          </span>
        </>
      ),
    },
    {
      name: 'Skeleton',
      render: () => (
        <Card padding="lg" className="sb-w-400">
          <Stack gap={4}>
            <Stack direction="row" gap={3} align="center">
              <Skeleton circle width={40} />
              <Stack gap={2} grow>
                <Skeleton width="40%" />
                <Skeleton width="60%" height={10} />
              </Stack>
            </Stack>
            <Skeleton lines={3} />
            <Skeleton height={120} />
          </Stack>
        </Card>
      ),
    },
  ],
});

export const empty = defineStories({
  id: 'empty-state',
  title: 'Empty state',
  group: 'Feedback',
  description: 'Shown when there’s nothing to display yet — explain why and offer the next step.',
  stories: [
    {
      name: 'Examples',
      layout: 'padded',
      render: () => (
        <div className="sb-grid-2">
          <EmptyState bordered icon={<FolderPlus />} title="No projects yet" description="Create your first project to start organising files." actions={<><Button size="sm">Import</Button><Button size="sm" variant="primary">New project</Button></>} />
          <EmptyState bordered icon={<Search />} title="No results" description="Try adjusting your search or filters to find what you’re looking for." actions={<Button size="sm">Clear filters</Button>} />
          <EmptyState icon={<Inbox />} title="You’re all caught up" description="New notifications will appear here." />
          <EmptyState icon={<Upload />} title="Drop files to upload" description="Or click to browse. Up to 50 MB each." />
        </div>
      ),
    },
  ],
});
