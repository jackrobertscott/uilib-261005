import { useState } from 'react';
import { AtSign, DollarSign, Lock, Mail } from 'lucide-react';
import { Button, Field, HStack, Input, Link, SearchInput, Stack, Textarea } from '@ui';
import { defineStories } from '../workbench/types';

export default defineStories({
  id: 'input',
  title: 'Text field',
  group: 'Inputs',
  component: 'Input',
  description: 'Single-line text entry with icons, add-ons, clear button and password reveal. Wrap in Field for label, help and errors.',
  playground: {
    args: { placeholder: 'olivia@untitledui.com', size: 'md', clearable: true, invalid: false, disabled: false, type: 'text' },
    controls: {
      placeholder: { type: 'text' },
      size: { type: 'radio', options: ['sm', 'md', 'lg'] },
      type: { type: 'select', options: ['text', 'email', 'password', 'search'] },
      clearable: { type: 'boolean' },
      invalid: { type: 'boolean' },
      disabled: { type: 'boolean' },
    },
    render: (a) => (
      <div className="sb-w-320">
        <Input {...a} />
      </div>
    ),
  },
  stories: [
    {
      name: 'Sizes',
      render: () => (
        <Stack className="sb-w-320">
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
          <Input size="lg" placeholder="Large" />
        </Stack>
      ),
    },
    {
      name: 'Icons & add-ons',
      render: () => (
        <Stack className="sb-w-320">
          <Input leading={<Mail />} placeholder="you@company.com" />
          <Input startAddon="https://" placeholder="untitledui.com" />
          <Input leading={<DollarSign />} endAddon="USD" placeholder="0.00" inputMode="decimal" />
          <Input leading={<AtSign />} trailing={<Lock />} defaultValue="olivia" readOnly />
        </Stack>
      ),
    },
    {
      name: 'With Field',
      description: 'Field wires up label, description and error message with the right aria attributes.',
      render: () => (
        <Stack gap={5} className="sb-w-320">
          <Field label="Email" description="We’ll never share your email." required>
            <Input type="email" placeholder="you@company.com" />
          </Field>
          <Field label="Username" error="This username is already taken.">
            <Input defaultValue="olivia" />
          </Field>
          <Field label="Password" labelAside={<Link href="#" subtle>Forgot?</Link>}>
            <Input type="password" defaultValue="hunter22" />
          </Field>
          <Field label="Company" optional>
            <Input placeholder="Acme Inc." />
          </Field>
          <Field label="Workspace ID" disabled>
            <Input defaultValue="ws_8f2k1a" />
          </Field>
        </Stack>
      ),
    },
    {
      name: 'Search',
      render: () => (
        <Stack className="sb-w-320">
          <SearchInput />
          <SearchInput shortcut="⌘K" placeholder="Search files" />
        </Stack>
      ),
    },
    {
      name: 'Textarea',
      render: function Render() {
        const [v, setV] = useState('');
        return (
          <Stack gap={5} className="sb-w-400">
            <Field label="Description" description="Write a few sentences about the project.">
              <Textarea placeholder="Tell us more…" showCount maxLength={280} value={v} onChange={(e) => setV(e.target.value)} />
            </Field>
            <Field label="Auto-resizing">
              <Textarea autoResize minRows={2} maxRows={8} placeholder="Grows as you type…" />
            </Field>
            <Field label="Feedback" error="Please add at least 20 characters.">
              <Textarea defaultValue="Too short" />
            </Field>
          </Stack>
        );
      },
    },
    {
      name: 'Inline form',
      render: () => (
        <HStack gap={2} className="sb-w-400">
          <Input leading={<Mail />} placeholder="Enter your email" />
          <Button variant="primary">Subscribe</Button>
        </HStack>
      ),
    },
  ],
});
