import { useState } from 'react';
import { Globe, Lock, Users, Eye } from 'lucide-react';
import { Avatar, Combobox, Field, MultiSelect, Select, Stack } from '@ui';
import { defineStories } from '../workbench/types';
import { countries, people, timezones } from './_data';

const roles = [
  { value: 'owner', label: 'Owner', description: 'Full access including billing' },
  { value: 'admin', label: 'Admin', description: 'Manage members and settings' },
  { value: 'editor', label: 'Editor', description: 'Create and edit content' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  { value: 'guest', label: 'Guest', description: 'Limited to shared items', disabled: true },
];

export default defineStories({
  id: 'select',
  title: 'Select',
  group: 'Selection',
  component: 'Select',
  description: 'A fully custom listbox: keyboard navigation, typeahead, groups, descriptions, icons, search and multi-select. No native <select>.',
  playground: {
    args: { placeholder: 'Select a country', size: 'md', searchable: false, clearable: false, invalid: false, disabled: false },
    controls: {
      placeholder: { type: 'text' },
      size: { type: 'radio', options: ['sm', 'md', 'lg'] },
      searchable: { type: 'boolean' },
      clearable: { type: 'boolean' },
      invalid: { type: 'boolean' },
      disabled: { type: 'boolean' },
    },
    code: (a) => `<Select\n  options={countries}${a.searchable ? '\n  searchable' : ''}${a.clearable ? '\n  clearable' : ''}\n  placeholder="${a.placeholder}"\n/>`,
    render: (a) => (
      <div className="sb-w-280">
        <Select options={countries} {...a} />
      </div>
    ),
    height: 280,
  },
  stories: [
    {
      name: 'Basic',
      render: function Render() {
        const [v, setV] = useState<string | null>('editor');
        return (
          <Stack gap={5} className="sb-w-280">
            <Field label="Role" description={`Value: ${v ?? 'none'}`}>
              <Select value={v} onValueChange={setV} options={roles} />
            </Field>
          </Stack>
        );
      },
    },
    {
      name: 'Icons & visibility',
      render: () => (
        <div className="sb-w-280">
          <Field label="Visibility">
            <Select
              defaultValue="team"
              options={[
                { value: 'private', label: 'Private', icon: <Lock /> },
                { value: 'team', label: 'Team', icon: <Users /> },
                { value: 'public', label: 'Public', icon: <Globe /> },
                { value: 'link', label: 'Anyone with link', icon: <Eye /> },
              ]}
            />
          </Field>
        </div>
      ),
    },
    {
      name: 'Grouped with search',
      description: 'Type to filter; matching text is highlighted.',
      render: () => (
        <div className="sb-w-280">
          <Field label="Timezone">
            <Select searchable clearable placeholder="Select timezone" options={timezones} popupWidth={300} />
          </Field>
        </div>
      ),
    },
    {
      name: 'People picker',
      render: () => (
        <div className="sb-w-280">
          <Field label="Assignee">
            <Select
              defaultValue="u2"
              searchable
              options={people.map((p) => ({ value: p.id, label: p.name, description: p.email, icon: <Avatar size="xs" src={p.avatar} name={p.name} /> }))}
            />
          </Field>
        </div>
      ),
    },
    {
      name: 'Multi-select',
      render: function Render() {
        const [v, setV] = useState<string[]>(['france', 'japan']);
        return (
          <Stack gap={5} className="sb-w-320">
            <Field label="Countries" description="Selections collapse to +N after 3 chips.">
              <MultiSelect searchable clearable value={v} onValueChange={setV} options={countries} placeholder="Choose countries" />
            </Field>
          </Stack>
        );
      },
    },
    {
      name: 'Combobox',
      description: 'An editable input that suggests options as you type. Can accept free text.',
      render: () => (
        <Stack gap={5} className="sb-w-280">
          <Field label="Country">
            <Combobox options={countries} placeholder="Start typing…" />
          </Field>
          <Field label="Tag" description="Free text allowed">
            <Combobox allowCustomValue options={['design', 'engineering', 'marketing', 'sales'].map((t) => ({ value: t, label: t }))} placeholder="Pick or create" />
          </Field>
        </Stack>
      ),
    },
    {
      name: 'States',
      render: () => (
        <Stack gap={4} className="sb-w-280">
          <Select size="sm" options={roles} placeholder="Small" />
          <Select size="lg" options={roles} placeholder="Large" />
          <Field label="Invalid" error="Please choose a role.">
            <Select options={roles} />
          </Field>
          <Select disabled options={roles} defaultValue="viewer" />
        </Stack>
      ),
    },
  ],
});
