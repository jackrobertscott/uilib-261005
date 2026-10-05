import { useState } from 'react';
import { Bell, CreditCard, FileText, Folder, Home, Settings, Shield, User, Users } from 'lucide-react';
import { Accordion, AccordionItem, Badge, Breadcrumbs, NavItem, NavSection, Pagination, Stack, Stepper, Tab, TabList, TabPanel, Tabs, Text, Button } from '@ui';
import { defineStories } from '../workbench/types';

export const tabs = defineStories({
  id: 'tabs',
  title: 'Tabs',
  group: 'Navigation',
  description: 'Three styles: line, segmented (the reference "View all / Documents / …" control) and pills. Arrow keys move between tabs.',
  playground: {
    args: { variant: 'segmented', size: 'md' },
    controls: { variant: { type: 'radio', options: ['line', 'segmented', 'pills'] }, size: { type: 'radio', options: ['sm', 'md'] } },
    code: (a) => `<Tabs variant="${a.variant}" size="${a.size}" defaultValue="all">\n  <TabList>\n    <Tab value="all">View all</Tab>\n    <Tab value="docs">Documents</Tab>\n  </TabList>\n  <TabPanel value="all">…</TabPanel>\n</Tabs>`,
    render: (a) => (
      <Tabs variant={a.variant} size={a.size} defaultValue="all">
        <TabList aria-label="File types">
          <Tab value="all">View all</Tab>
          <Tab value="docs">Documents</Tab>
          <Tab value="sheets">Spreadsheets</Tab>
          <Tab value="pdf">PDFs</Tab>
          <Tab value="img">Images</Tab>
        </TabList>
      </Tabs>
    ),
  },
  stories: [
    {
      name: 'Line with icons & counts',
      layout: 'padded',
      render: () => (
        <Tabs defaultValue="account">
          <TabList aria-label="Settings">
            <Tab value="account" icon={<User />}>Account</Tab>
            <Tab value="team" icon={<Users />} count={8}>Team</Tab>
            <Tab value="billing" icon={<CreditCard />}>Billing</Tab>
            <Tab value="notifications" icon={<Bell />} count={3}>Notifications</Tab>
            <Tab value="security" icon={<Shield />} disabled>Security</Tab>
          </TabList>
          <TabPanel value="account"><Text tone="secondary" size="sm">Account settings panel.</Text></TabPanel>
          <TabPanel value="team"><Text tone="secondary" size="sm">Team panel.</Text></TabPanel>
          <TabPanel value="billing"><Text tone="secondary" size="sm">Billing panel.</Text></TabPanel>
          <TabPanel value="notifications"><Text tone="secondary" size="sm">Notifications panel.</Text></TabPanel>
        </Tabs>
      ),
    },
    {
      name: 'Pills',
      render: () => (
        <Tabs variant="pills" defaultValue="overview">
          <TabList aria-label="Project">
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="files">Files</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
        </Tabs>
      ),
    },
    {
      name: 'Vertical',
      description: 'orientation="vertical" stacks the list beside the panel — for settings dialogs and side navigation. Up/Down arrows move between tabs.',
      layout: 'padded',
      render: () => (
        <Tabs orientation="vertical" defaultValue="account" className="sb-w-full">
          <TabList aria-label="Settings">
            <Tab value="account" icon={<User />}>Account</Tab>
            <Tab value="team" icon={<Users />} count={8}>Team</Tab>
            <Tab value="billing" icon={<CreditCard />}>Billing</Tab>
            <Tab value="notifications" icon={<Bell />}>Notifications</Tab>
          </TabList>
          <TabPanel value="account"><Text tone="secondary" size="sm">Account settings panel.</Text></TabPanel>
          <TabPanel value="team"><Text tone="secondary" size="sm">Team panel.</Text></TabPanel>
          <TabPanel value="billing"><Text tone="secondary" size="sm">Billing panel.</Text></TabPanel>
          <TabPanel value="notifications"><Text tone="secondary" size="sm">Notifications panel.</Text></TabPanel>
        </Tabs>
      ),
    },
  ],
});

export const breadcrumbs = defineStories({
  id: 'breadcrumbs',
  title: 'Breadcrumbs',
  group: 'Navigation',
  stories: [
    {
      name: 'Default',
      render: () => (
        <Stack gap={4}>
          <Breadcrumbs items={[{ label: 'Home', icon: <Home size={15} /> }, { label: 'All files' }, { label: 'Q4_2028 Reporting' }]} />
          <Breadcrumbs separator="slash" items={[{ label: 'Projects' }, { label: 'Dashboard UI' }, { label: 'Settings' }]} />
        </Stack>
      ),
    },
    {
      name: 'Collapsed',
      description: 'Long trails collapse middle items into a menu.',
      render: () => (
        <Breadcrumbs maxItems={4} items={[{ label: 'Home', icon: <Home size={15} /> }, { label: 'Folders', icon: <Folder size={15} /> }, { label: 'Olivia’s files' }, { label: '2028' }, { label: 'Q4' }, { label: 'Reporting.pdf', icon: <FileText size={15} /> }]} />
      ),
    },
  ],
});

export const pagination = defineStories({
  id: 'pagination',
  title: 'Pagination',
  group: 'Navigation',
  description: 'Full variant matches the reference footer: page indicator, rows-per-page select and numbered navigation.',
  stories: [
    {
      name: 'Full',
      layout: 'padded',
      render: function Render() {
        const [p, setP] = useState(1);
        const [s, setS] = useState(7);
        return <Pagination page={p} pageCount={3} onPageChange={setP} pageSize={s} onPageSizeChange={setS} pageSizeOptions={[7, 14, 21]} />;
      },
    },
    {
      name: 'Many pages',
      layout: 'padded',
      render: function Render() {
        const [p, setP] = useState(8);
        return <Pagination variant="numbers" page={p} pageCount={24} onPageChange={setP} />;
      },
    },
    {
      name: 'Simple',
      render: function Render() {
        const [p, setP] = useState(2);
        return <Pagination variant="simple" page={p} pageCount={10} onPageChange={setP} />;
      },
    },
  ],
});

export const stepper = defineStories({
  id: 'stepper',
  title: 'Stepper',
  group: 'Navigation',
  description: 'Progress through a multi-step flow. Completed steps can be revisited.',
  stories: [
    {
      name: 'Horizontal',
      layout: 'padded',
      render: function Render() {
        const [c, setC] = useState(1);
        const steps = [
          { title: 'Your details', description: 'Name and email' },
          { title: 'Company', description: 'A few details' },
          { title: 'Invite team', description: 'Start collaborating' },
          { title: 'Done', description: 'You’re all set' },
        ];
        return (
          <Stack gap={6}>
            <Stepper steps={steps} current={c} onStepClick={setC} />
            <Stack direction="row" gap={2} justify="flex-end">
              <Button disabled={c === 0} onClick={() => setC(c - 1)}>Back</Button>
              <Button variant="primary" disabled={c === steps.length - 1} onClick={() => setC(c + 1)}>Continue</Button>
            </Stack>
          </Stack>
        );
      },
    },
    {
      name: 'Vertical',
      render: () => (
        <div className="sb-w-280">
          <Stepper
            orientation="vertical"
            current={2}
            steps={[
              { title: 'Create account', description: 'Completed Jan 2' },
              { title: 'Verify email', description: 'Completed Jan 2' },
              { title: 'Connect storage', description: 'Google Drive, Dropbox or S3' },
              { title: 'Invite your team' },
            ]}
          />
        </div>
      ),
    },
  ],
});

export const accordion = defineStories({
  id: 'accordion',
  title: 'Accordion',
  group: 'Navigation',
  description: 'Expandable sections. Single or multiple open; bordered, separated or plain.',
  stories: [
    {
      name: 'Bordered',
      render: () => (
        <div className="sb-w-400" style={{ width: 480 }}>
          <Accordion defaultValue={['a']}>
            <AccordionItem value="a" title="What file types are supported?">PDF, Office documents, images, Figma files and more — up to 5 GB each.</AccordionItem>
            <AccordionItem value="b" title="Can I share files with people outside my team?">Yes. Create a link and choose who can view or edit.</AccordionItem>
            <AccordionItem value="c" title="How does version history work?">Every save creates a version you can restore for 90 days.</AccordionItem>
            <AccordionItem value="d" title="Enterprise SSO" disabled>Available on the Enterprise plan.</AccordionItem>
          </Accordion>
        </div>
      ),
    },
    {
      name: 'Separated, multiple',
      render: () => (
        <div className="sb-w-400" style={{ width: 480 }}>
          <Accordion variant="separated" multiple defaultValue={['n']}>
            <AccordionItem value="n" icon={<Bell />} title="Notifications" subtitle={<>3 channels · <Badge size="sm" tone="success">On</Badge></>}>Email, push and in-app notifications are enabled.</AccordionItem>
            <AccordionItem value="s" icon={<Shield />} title="Security" subtitle="2FA enabled">Two-factor authentication protects your account.</AccordionItem>
            <AccordionItem value="b" icon={<CreditCard />} title="Billing" subtitle="Team plan">Next invoice on Feb 1.</AccordionItem>
          </Accordion>
        </div>
      ),
    },
    {
      name: 'Plain',
      render: () => (
        <div className="sb-w-400" style={{ width: 480 }}>
          <Accordion variant="plain">
            <AccordionItem value="1" title="Shipping">Free shipping on orders over $50.</AccordionItem>
            <AccordionItem value="2" title="Returns">30-day returns, no questions asked.</AccordionItem>
          </Accordion>
        </div>
      ),
    },
  ],
});

export const sidebarNav = defineStories({
  id: 'sidebar-nav',
  title: 'Sidebar navigation',
  group: 'Navigation',
  description: 'NavItem and NavSection build app sidebars; see the Files demo for the full shell.',
  stories: [
    {
      name: 'Nav items & sections',
      render: () => (
        <div style={{ width: 248, padding: 12, background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', boxShadow: '0 0 0 1px var(--border-subtle)' }}>
          <Stack gap={4}>
            <NavSection>
              <NavItem icon={<Home />} label="Home" href="#" />
              <NavItem icon={<FileText />} label="All files" active href="#" />
              <NavItem icon={<Users />} label="Team" badge={8} href="#" />
              <NavItem icon={<Settings />} label="Settings" href="#" />
            </NavSection>
            <NavSection title="Browser" collapsible>
              <NavItem label="Projects">
                <NavItem label="Website" href="#" />
                <NavItem label="Mobile app" href="#" />
              </NavItem>
              <NavItem label="Folders" defaultOpen>
                <NavItem label="Olivia’s files" href="#" />
                <NavItem label="Dashboard UI" href="#" />
              </NavItem>
            </NavSection>
          </Stack>
        </div>
      ),
    },
  ],
});
