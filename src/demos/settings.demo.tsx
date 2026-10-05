import { useState } from 'react';
import { Mail, Monitor, Moon, Sun, Trash2, TriangleAlert, Laptop, Smartphone } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  Field,
  FileDropzone,
  Input,
  List,
  ListItem,
  PageHeader,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  Tabs,
  TagInput,
  Text,
  Textarea,
  toast,
} from '@ui';
import { defineStories } from '../workbench/types';
import { countries, people, timezones } from '../stories/_data';
import { DemoShell, HeaderActions } from './_shell';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="demo-settings-section">
      <div>
        <Text size="md" weight="semibold">{title}</Text>
        {description && <Text size="sm" tone="tertiary">{description}</Text>}
      </div>
      {children}
    </section>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const [del, setDel] = useState(false);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);
  return (
    <DemoShell active="settings">
      <div className="demo-page demo-page--narrow">
        <PageHeader title="Settings" description="Manage your profile, preferences and workspace." actions={<HeaderActions />}>
          <Tabs value={tab} onValueChange={setTab}>
            <TabList aria-label="Settings sections">
              <Tab value="profile">My profile</Tab>
              <Tab value="prefs">Preferences</Tab>
              <Tab value="notifications" count={3}>Notifications</Tab>
              <Tab value="security">Security</Tab>
            </TabList>
          </Tabs>
        </PageHeader>

        {tab === 'profile' && (
          <form onSubmit={(e) => { e.preventDefault(); setDirty(false); toast.success('Profile saved'); }} onChange={touch}>
            <Section title="Personal info" description="Update your photo and personal details.">
              <Field orientation="horizontal" label="Name" required>
                <Stack direction="row" gap={3}>
                  <Input defaultValue="Caitlyn" aria-label="First name" />
                  <Input defaultValue="Edwards" aria-label="Last name" />
                </Stack>
              </Field>
              <Field orientation="horizontal" label="Email address" required>
                <Input leading={<Mail />} type="email" defaultValue="caitlyn@untitledui.com" />
              </Field>
              <Field orientation="horizontal" label="Your photo" description="This will be displayed on your profile.">
                <Stack direction="row" gap={4} align="flex-start">
                  <Avatar size="xl" src={people[0].avatar} name="Caitlyn Edwards" />
                  <div style={{ flex: 1 }}>
                    <FileDropzone compact onFiles={() => toast('Photo uploaded')} hint="SVG, PNG or JPG (max. 800×800px)" />
                  </div>
                </Stack>
              </Field>
              <Field orientation="horizontal" label="Role">
                <Input defaultValue="Product designer" />
              </Field>
              <Field orientation="horizontal" label="Country">
                <Select searchable defaultValue="australia" options={countries} onValueChange={touch} />
              </Field>
              <Field orientation="horizontal" label="Timezone">
                <Select searchable defaultValue="aest" options={timezones} onValueChange={touch} />
              </Field>
              <Field orientation="horizontal" label="Bio" description="Write a short introduction.">
                <Textarea defaultValue="I design calm, dependable interfaces for file-heavy teams." showCount maxLength={200} autoResize minRows={3} />
              </Field>
              <Field orientation="horizontal" label="Skills">
                <TagInput defaultValue={['Design systems', 'Prototyping', 'Research']} onValueChange={touch} />
              </Field>
            </Section>
            <div className="demo-settings-actions">
              <Button type="button" onClick={() => setDirty(false)} disabled={!dirty}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={!dirty}>Save changes</Button>
            </div>
          </form>
        )}

        {tab === 'prefs' && (
          <div>
            <Section title="Appearance" description="Choose how the interface looks to you.">
              <RadioGroup variant="card" orientation="horizontal" defaultValue="system" aria-label="Theme">
                <Radio value="light" icon={<Sun />} label="Light" />
                <Radio value="dark" icon={<Moon />} label="Dark" />
                <Radio value="system" icon={<Monitor />} label="System" />
              </RadioGroup>
            </Section>
            <Section title="Language & region">
              <Field orientation="horizontal" label="Language">
                <Select defaultValue="en" options={[{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'de', label: 'Deutsch' }, { value: 'ja', label: '日本語' }]} />
              </Field>
              <Field orientation="horizontal" label="Date format">
                <RadioGroup defaultValue="dmy" orientation="horizontal" aria-label="Date format">
                  <Radio value="dmy" label="DD/MM/YYYY" />
                  <Radio value="mdy" label="MM/DD/YYYY" />
                  <Radio value="iso" label="YYYY-MM-DD" />
                </RadioGroup>
              </Field>
            </Section>
            <Section title="Files">
              <Stack gap={4}>
                <Switch labelPosition="start" defaultChecked label="Open files in a new tab" />
                <Switch labelPosition="start" label="Show hidden files" />
                <Switch labelPosition="start" defaultChecked label="Confirm before deleting" description="Ask for confirmation before moving files to trash." />
              </Stack>
            </Section>
          </div>
        )}

        {tab === 'notifications' && (
          <div>
            <Section title="Email notifications" description="Choose what we email you about.">
              <Stack gap={4}>
                <Checkbox defaultChecked label="Comments" description="When someone comments on your file." />
                <Checkbox defaultChecked label="Mentions" description="When someone @mentions you." />
                <Checkbox label="Shares" description="When a file is shared with you." />
                <Checkbox label="Product updates" description="News about features and improvements." />
              </Stack>
            </Section>
            <Section title="Push notifications">
              <Field orientation="horizontal" label="Deliver" description="Choose how often.">
                <RadioGroup defaultValue="instant" aria-label="Frequency">
                  <Radio value="instant" label="Instantly" />
                  <Radio value="hourly" label="Hourly digest" />
                  <Radio value="daily" label="Daily digest" />
                  <Radio value="never" label="Never" />
                </RadioGroup>
              </Field>
            </Section>
          </div>
        )}

        {tab === 'security' && (
          <div>
            <Section title="Password">
              <Field orientation="horizontal" label="Current password"><Input type="password" defaultValue="password123" /></Field>
              <Field orientation="horizontal" label="New password" description="At least 12 characters."><Input type="password" placeholder="••••••••••••" /></Field>
            </Section>
            <Section title="Two-factor authentication">
              <Switch labelPosition="start" defaultChecked label="Authenticator app" description="Use an app like 1Password to generate codes." />
            </Section>
            <Section title="Active sessions" description="Devices signed in to your account.">
              <List>
                <ListItem leading={<span className="ui-icon-tile"><Laptop /></span>} title={<>MacBook Pro · Melbourne <Badge size="sm" tone="success" dot>This device</Badge></>} description="Chrome · Active now" />
                <ListItem leading={<span className="ui-icon-tile"><Smartphone /></span>} title="iPhone 17 · Sydney" description="Safari · 2 days ago" trailing={<Button size="xs">Revoke</Button>} />
              </List>
            </Section>
            <Section title="Danger zone">
              <Alert tone="danger" icon={<TriangleAlert />} title="Delete account" actions={<Button size="sm" variant="danger" leading={<Trash2 />} onClick={() => setDel(true)}>Delete account</Button>}>
                Permanently remove your account and all of its files. This can’t be undone.
              </Alert>
            </Section>
            <ConfirmDialog open={del} onOpenChange={setDel} tone="danger" icon={<TriangleAlert />} title="Delete your account?" description="All 1,284 files will be permanently deleted." confirmLabel="Delete account" confirmVariant="danger" onConfirm={() => new Promise((r) => setTimeout(r, 900)).then(() => void toast('Account scheduled for deletion'))} />
          </div>
        )}
      </div>
    </DemoShell>
  );
}

export default defineStories({
  id: 'demo-settings',
  title: 'Settings',
  group: 'Demos',
  order: 3,
  fullPage: true,
  stories: [{ name: 'Settings', render: () => <SettingsPage /> }],
});

