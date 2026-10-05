import { Download, Plus, Home } from 'lucide-react';
import { Breadcrumbs, Button, Card, Divider, HStack, PageHeader, SectionHeader, Stack, Tab, TabList, Tabs } from '@ui';
import { defineStories } from '../workbench/types';

const Box = ({ label }: { label: string }) => (
  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)', fontSize: 'var(--fs-xs)', fontWeight: 500 }}>{label}</div>
);

export default defineStories({
  id: 'layout',
  title: 'Layout primitives',
  group: 'Layout',
  description: 'Stack/HStack space children on the design-system scale; PageHeader and SectionHeader give pages consistent structure; Divider separates content.',
  stories: [
    {
      name: 'Stack & HStack',
      layout: 'padded',
      render: () => (
        <Stack gap={6}>
          <Stack gap={2}>
            <Box label="Stack gap={2}" />
            <Box label="Item" />
            <Box label="Item" />
          </Stack>
          <HStack gap={3}>
            <Box label="HStack gap={3}" />
            <Box label="Item" />
            <Box label="Item" />
          </HStack>
          <HStack justify="space-between">
            <Box label="justify=space-between" />
            <Box label="Item" />
          </HStack>
        </Stack>
      ),
    },
    {
      name: 'Page header',
      layout: 'padded',
      render: () => (
        <Card padding="lg">
          <PageHeader
            eyebrow={<Breadcrumbs items={[{ label: 'Home', icon: <Home size={14} /> }, { label: 'All files' }]} />}
            title="All files"
            description="Manage cloud files and projects here."
            actions={
              <>
                <Button leading={<Download />}>Export</Button>
                <Button variant="primary" leading={<Plus />}>Upload</Button>
              </>
            }
          >
            <Tabs defaultValue="all">
              <TabList aria-label="Sections">
                <Tab value="all">All</Tab>
                <Tab value="shared">Shared</Tab>
                <Tab value="starred">Starred</Tab>
              </TabList>
            </Tabs>
          </PageHeader>
        </Card>
      ),
    },
    {
      name: 'Section header & divider',
      layout: 'padded',
      render: () => (
        <Card padding="lg">
          <Stack gap={5}>
            <SectionHeader title="File explorer" description="Browse and filter everything in this workspace." actions={<Button size="sm">View all</Button>} />
            <Divider />
            <Divider label="or continue with" />
            <HStack gap={3} style={{ height: 24 }}>
              <span>Left</span>
              <Divider orientation="vertical" />
              <span>Right</span>
            </HStack>
          </Stack>
        </Card>
      ),
    },
  ],
});
