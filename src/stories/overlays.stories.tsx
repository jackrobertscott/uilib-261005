import { useState } from 'react';
import {
  Archive,
  Bell,
  Copy,
  Download,
  Filter,
  FolderInput,
  LogOut,
  MoreHorizontal,
  Pencil,
  Settings,
  Share2,
  Trash2,
  TriangleAlert,
  User,
  UserPlus,
  Keyboard,
  Star,
  Columns3,
  CheckCircle2,
  FileText,
  Folder,
  Plus,
} from 'lucide-react';
import {
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  CommandPalette,
  ConfirmDialog,
  ContextMenu,
  DateRangePicker,
  Dialog,
  Drawer,
  Field,
  IconButton,
  Input,
  Kbd,
  Menu,
  MenuCheckboxItem,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  Popover,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  toast,
} from '@ui';
import { defineStories } from '../workbench/types';
import { people } from './_data';

export const menu = defineStories({
  id: 'menu',
  title: 'Dropdown menu',
  group: 'Overlays',
  description: 'Keyboard navigable (arrows, Home/End, typeahead), with icons, shortcuts, checkable items, radio groups and nested submenus.',
  stories: [
    {
      name: 'Actions menu',
      height: 120,
      render: () => (
        <Menu trigger={<Button trailing={<MoreHorizontal />}>Actions</Button>}>
          <MenuItem icon={<Pencil />} shortcut="F2">Rename</MenuItem>
          <MenuItem icon={<Copy />} shortcut="⌘D">Duplicate</MenuItem>
          <MenuItem icon={<Share2 />}>Share</MenuItem>
          <MenuSub label="Move to" icon={<FolderInput />}>
            <MenuItem icon={<Folder />}>Olivia’s files</MenuItem>
            <MenuItem icon={<Folder />}>Dashboard UI</MenuItem>
            <MenuSub label="Projects" icon={<Folder />}>
              <MenuItem>Website</MenuItem>
              <MenuItem>Mobile app</MenuItem>
            </MenuSub>
            <MenuSeparator />
            <MenuItem icon={<Plus />}>New folder…</MenuItem>
          </MenuSub>
          <MenuItem icon={<Archive />} disabled>Archive</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<Trash2 />} danger shortcut="⌫">Delete</MenuItem>
        </Menu>
      ),
    },
    {
      name: 'Checkable items',
      height: 120,
      render: function Render() {
        const [cols, setCols] = useState({ name: true, owner: true, modified: true, size: false });
        const [sort, setSort] = useState('modified');
        return (
          <Menu trigger={<Button leading={<Columns3 />}>View</Button>} minWidth={220}>
            <MenuLabel>Columns</MenuLabel>
            {Object.entries(cols).map(([k, v]) => (
              <MenuCheckboxItem key={k} checked={v} onCheckedChange={(c) => setCols({ ...cols, [k]: c })}>
                {k[0].toUpperCase() + k.slice(1)}
              </MenuCheckboxItem>
            ))}
            <MenuSeparator />
            <MenuLabel>Sort by</MenuLabel>
            <MenuRadioGroup value={sort} onValueChange={setSort}>
              <MenuRadioItem value="name">Name</MenuRadioItem>
              <MenuRadioItem value="modified">Last modified</MenuRadioItem>
              <MenuRadioItem value="size">Size</MenuRadioItem>
            </MenuRadioGroup>
          </Menu>
        );
      },
    },
    {
      name: 'Account menu',
      height: 120,
      render: () => (
        <Menu placement="bottom-end" minWidth={240} trigger={<button type="button" style={{ borderRadius: '50%' }} aria-label="Account"><Avatar src={people[3].avatar} name="Olivia Rhye" /></button>}>
          <MenuHeader>
            <Stack direction="row" gap={2.5} align="center">
              <Avatar src={people[3].avatar} name="Olivia Rhye" status="online" />
              <div>
                <Text size="sm" weight="semibold">Olivia Rhye</Text>
                <Text size="xs" tone="tertiary">olivia@untitledui.com</Text>
              </div>
            </Stack>
          </MenuHeader>
          <MenuSeparator />
          <MenuItem icon={<User />} shortcut="⌘P">Profile</MenuItem>
          <MenuItem icon={<Settings />} shortcut="⌘,">Settings</MenuItem>
          <MenuItem icon={<Keyboard />} shortcut="?">Shortcuts</MenuItem>
          <MenuItem icon={<UserPlus />}>Invite colleagues</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<LogOut />} shortcut="⌥⇧Q">Sign out</MenuItem>
        </Menu>
      ),
    },
    {
      name: 'Context menu',
      description: 'Right-click (or Shift+F10 when focused) inside the box.',
      render: () => (
        <ContextMenu
          content={
            <>
              <MenuItem icon={<FileText />}>Open</MenuItem>
              <MenuItem icon={<Download />}>Download</MenuItem>
              <MenuItem icon={<Star />}>Add to starred</MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Trash2 />} danger>Delete</MenuItem>
            </>
          }
        >
          <div tabIndex={0} style={{ width: 320, height: 140, display: 'grid', placeItems: 'center', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)', background: 'var(--bg-surface)' }}>
            Right-click here
          </div>
        </ContextMenu>
      ),
    },
  ],
});

export const dialog = defineStories({
  id: 'dialog',
  title: 'Dialog',
  group: 'Overlays',
  description: 'Modal dialogs trap focus, lock scroll and close on Escape/backdrop. ConfirmDialog handles async confirmation.',
  stories: [
    {
      name: 'Form dialog',
      render: function Render() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Button variant="primary" leading={<UserPlus />} onClick={() => setOpen(true)}>
              Invite member
            </Button>
            <Dialog
              open={open}
              onOpenChange={setOpen}
              icon={<UserPlus />}
              title="Invite team member"
              description="They’ll receive an email with a link to join."
              footer={
                <>
                  <Button onClick={() => setOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => { setOpen(false); toast.success('Invitation sent'); }}>Send invite</Button>
                </>
              }
            >
              <Stack gap={4}>
                <Field label="Email address" required>
                  <Input type="email" placeholder="name@company.com" />
                </Field>
                <Field label="Role">
                  <Select defaultValue="editor" options={[{ value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' }]} />
                </Field>
                <Field label="Message" optional>
                  <Textarea placeholder="Add a personal note…" minRows={2} />
                </Field>
              </Stack>
            </Dialog>
          </>
        );
      },
    },
    {
      name: 'Destructive confirm',
      render: function Render() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Button variant="danger" leading={<Trash2 />} onClick={() => setOpen(true)}>
              Delete project
            </Button>
            <ConfirmDialog
              open={open}
              onOpenChange={setOpen}
              icon={<TriangleAlert />}
              tone="danger"
              title="Delete project?"
              description="“Dashboard UI” and its 24 files will be permanently deleted. This can’t be undone."
              confirmLabel="Delete"
              confirmVariant="danger"
              onConfirm={() => new Promise((r) => setTimeout(r, 1200)).then(() => void toast.success('Project deleted'))}
            />
          </>
        );
      },
    },
    {
      name: 'Success',
      render: function Render() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Button onClick={() => setOpen(true)}>Show success</Button>
            <Dialog open={open} onOpenChange={setOpen} size="sm" icon={<CheckCircle2 />} tone="success" title="Payment successful" description="Your Team plan is now active. A receipt has been emailed to you." footer={<Button variant="primary" fullWidth onClick={() => setOpen(false)}>Continue</Button>} />
          </>
        );
      },
    },
  ],
});

export const drawer = defineStories({
  id: 'drawer',
  title: 'Drawer',
  group: 'Overlays',
  description: 'Side or bottom sheet for filters, details and secondary forms.',
  stories: [
    {
      name: 'Filters drawer',
      render: function Render() {
        const [open, setOpen] = useState(false);
        const [side, setSide] = useState<'right' | 'left' | 'bottom'>('right');
        return (
          <>
            {(['right', 'left', 'bottom'] as const).map((s) => (
              <Button key={s} leading={<Filter />} onClick={() => { setSide(s); setOpen(true); }}>
                Open {s}
              </Button>
            ))}
            <Drawer
              open={open}
              onOpenChange={setOpen}
              side={side}
              title="Filters"
              description="Narrow down files in this view."
              footer={
                <>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
                  <Button variant="primary" onClick={() => setOpen(false)}>Apply filters</Button>
                </>
              }
            >
              <Stack gap={5}>
                <Field label="File type">
                  <CheckboxGroup defaultValue={['pdf', 'docx']}>
                    <Checkbox value="pdf" label="PDF" />
                    <Checkbox value="docx" label="Documents" />
                    <Checkbox value="xls" label="Spreadsheets" />
                    <Checkbox value="img" label="Images" />
                  </CheckboxGroup>
                </Field>
                <Field label="Uploaded by">
                  <Select searchable placeholder="Anyone" options={people.map((p) => ({ value: p.id, label: p.name, icon: <Avatar size="xs" src={p.avatar} name={p.name} /> }))} />
                </Field>
                <Field label="Modified">
                  <DateRangePicker />
                </Field>
                <Field label="Size (MB)">
                  <Slider defaultValue={[0, 50]} max={100} />
                </Field>
                <Switch label="Only starred" />
              </Stack>
            </Drawer>
          </>
        );
      },
    },
  ],
});

export const popover = defineStories({
  id: 'popover',
  title: 'Popover & tooltip',
  group: 'Overlays',
  description: 'Popovers hold interactive content; tooltips give short hints on hover/focus and replace the native title attribute.',
  stories: [
    {
      name: 'Popover',
      height: 160,
      render: () => (
        <>
          <Popover trigger={<Button leading={<Bell />}>Notifications</Button>} title="Notification settings" description="Choose what you hear about." showClose width={300}>
            <Stack gap={4}>
              <Switch labelPosition="start" label="Mentions" defaultChecked />
              <Switch labelPosition="start" label="Comments" defaultChecked />
              <Switch labelPosition="start" label="File uploads" />
            </Stack>
          </Popover>
          <Popover trigger={<Button leading={<Share2 />}>Share</Button>} title="Share “Q4 Reporting”" width={340}>
            {(close) => (
              <Stack gap={3}>
                <Stack direction="row" gap={2}>
                  <Input placeholder="Add people by email" size="sm" />
                  <Button size="sm" variant="primary" onClick={() => { close(); toast.success('Shared'); }}>Invite</Button>
                </Stack>
                {people.slice(0, 3).map((p) => (
                  <Stack key={p.id} direction="row" gap={2} align="center">
                    <Avatar size="sm" src={p.avatar} name={p.name} />
                    <Text size="sm" style={{ flex: 1 }}>{p.name}</Text>
                    <Text size="xs" tone="tertiary">Can edit</Text>
                  </Stack>
                ))}
              </Stack>
            )}
          </Popover>
        </>
      ),
    },
    {
      name: 'Tooltip',
      render: () => (
        <>
          {(['top', 'right', 'bottom', 'left'] as const).map((p) => (
            <Tooltip key={p} content={`Tooltip on ${p}`} placement={p}>
              <Button>{p}</Button>
            </Tooltip>
          ))}
          <Tooltip content="Copy link" shortcut="⌘L">
            <IconButton variant="secondary" aria-label="Copy link">
              <Copy />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ],
});

export const cmdk = defineStories({
  id: 'command-palette',
  title: 'Command palette',
  group: 'Overlays',
  description: '⌘K launcher with grouped, searchable commands. The workbench itself uses it — press ⌘K anywhere.',
  stories: [
    {
      name: 'Command palette',
      render: function Render() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Button onClick={() => setOpen(true)} trailing={<Kbd size="sm">⌘K</Kbd>}>
              Open palette
            </Button>
            <CommandPalette
              open={open}
              onOpenChange={setOpen}
              hotkey={false}
              commands={[
                { value: 'new-doc', label: 'New document', group: 'Create', icon: <FileText />, meta: '⌘N', onRun: () => toast('New document') },
                { value: 'new-folder', label: 'New folder', group: 'Create', icon: <Folder />, onRun: () => toast('New folder') },
                { value: 'invite', label: 'Invite member', group: 'Create', icon: <UserPlus />, onRun: () => toast('Invite') },
                { value: 'q4', label: 'Q4_2028 Reporting', group: 'Recent files', icon: <FileText />, meta: 'pdf', onRun: () => toast('Open Q4') },
                { value: 'fin', label: 'FY_2026-27 Financials', group: 'Recent files', icon: <FileText />, meta: 'xls', onRun: () => toast('Open FY') },
                { value: 'settings', label: 'Settings', group: 'Navigate', icon: <Settings />, meta: '⌘,', onRun: () => toast('Settings') },
                { value: 'logout', label: 'Sign out', group: 'Navigate', icon: <LogOut />, onRun: () => toast('Signed out') },
              ]}
            />
          </>
        );
      },
    },
  ],
});
