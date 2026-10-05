import { useState } from 'react';
import { Building2, CreditCard, Landmark, User, Users, Wallet } from 'lucide-react';
import { Checkbox, CheckboxGroup, Field, Radio, RadioGroup, SegmentedControl, Stack, Switch } from '@ui';
import { defineStories } from '../workbench/types';
import { LayoutGrid, List, Rows3 } from 'lucide-react';

export const checkbox = defineStories({
  id: 'checkbox',
  title: 'Checkbox',
  group: 'Selection',
  component: 'Checkbox',
  description: 'Custom checkbox with indeterminate state, labels, descriptions and groups.',
  playground: {
    args: { label: 'Remember me', description: 'Stay signed in for 30 days', size: 'md', disabled: false, invalid: false },
    controls: {
      label: { type: 'text' },
      description: { type: 'text' },
      size: { type: 'radio', options: ['sm', 'md'] },
      disabled: { type: 'boolean' },
      invalid: { type: 'boolean' },
    },
    render: (a) => <Checkbox {...a} />,
  },
  stories: [
    {
      name: 'States',
      render: () => (
        <>
          <Checkbox aria-label="Unchecked" />
          <Checkbox aria-label="Checked" defaultChecked />
          <Checkbox aria-label="Indeterminate" checked="indeterminate" />
          <Checkbox aria-label="Disabled" disabled />
          <Checkbox aria-label="Disabled checked" disabled defaultChecked />
        </>
      ),
    },
    {
      name: 'Select all (indeterminate)',
      render: function Render() {
        const all = ['Email', 'Push', 'SMS'];
        const [v, setV] = useState<string[]>(['Email']);
        const state = v.length === all.length ? true : v.length ? 'indeterminate' : false;
        return (
          <Stack gap={3}>
            <Checkbox label="All notifications" checked={state} onCheckedChange={() => setV(v.length === all.length ? [] : all)} />
            <div style={{ paddingLeft: 26 }}>
              <CheckboxGroup value={v} onValueChange={setV} aria-label="Channels">
                {all.map((c) => (
                  <Checkbox key={c} value={c} label={c} />
                ))}
              </CheckboxGroup>
            </div>
          </Stack>
        );
      },
    },
    {
      name: 'Group with descriptions',
      render: () => (
        <Field label="Permissions">
          <CheckboxGroup defaultValue={['read', 'write']}>
            <Checkbox value="read" label="Read" description="View files and folders" />
            <Checkbox value="write" label="Write" description="Create and edit files" />
            <Checkbox value="share" label="Share" description="Invite others to collaborate" />
            <Checkbox value="admin" label="Administer" description="Change settings — owner only" disabled />
          </CheckboxGroup>
        </Field>
      ),
    },
  ],
});

export const radio = defineStories({
  id: 'radio',
  title: 'Radio group',
  group: 'Selection',
  description: 'Single choice. Arrow keys move and select; only the checked option is in the tab order. Card variant for richer choices.',
  stories: [
    {
      name: 'Default',
      render: () => (
        <Field label="Notify me about">
          <RadioGroup defaultValue="mentions">
            <Radio value="all" label="All new messages" />
            <Radio value="mentions" label="Direct messages and mentions" />
            <Radio value="none" label="Nothing" />
          </RadioGroup>
        </Field>
      ),
    },
    {
      name: 'Horizontal',
      render: () => (
        <RadioGroup orientation="horizontal" defaultValue="monthly" aria-label="Billing period">
          <Radio value="monthly" label="Monthly" />
          <Radio value="yearly" label="Yearly" />
          <Radio value="lifetime" label="Lifetime" disabled />
        </RadioGroup>
      ),
    },
    {
      name: 'Cards',
      layout: 'padded',
      render: () => (
        <Stack gap={6}>
          <RadioGroup variant="card" orientation="horizontal" defaultValue="team" aria-label="Plan">
            <Radio value="solo" icon={<User />} label="Solo" description="For individuals — $9/mo" />
            <Radio value="team" icon={<Users />} label="Team" description="Up to 20 members — $29/mo" />
            <Radio value="org" icon={<Building2 />} label="Organisation" description="Unlimited — custom pricing" />
          </RadioGroup>
          <div className="sb-w-400">
            <RadioGroup variant="card" defaultValue="card" aria-label="Payment method">
              <Radio value="card" icon={<CreditCard />} label="Credit card" description="Visa ending in 4242" />
              <Radio value="bank" icon={<Landmark />} label="Bank transfer" description="2–3 business days" />
              <Radio value="wallet" icon={<Wallet />} label="Wallet" description="Apple Pay, Google Pay" disabled />
            </RadioGroup>
          </div>
        </Stack>
      ),
    },
  ],
});

export const switches = defineStories({
  id: 'switch',
  title: 'Switch',
  group: 'Selection',
  component: 'Switch',
  description: 'Binary on/off setting that applies immediately.',
  playground: {
    args: { label: 'Airplane mode', size: 'md', disabled: false, labelPosition: 'end' },
    controls: {
      label: { type: 'text' },
      size: { type: 'radio', options: ['sm', 'md'] },
      labelPosition: { type: 'radio', options: ['end', 'start'] },
      disabled: { type: 'boolean' },
    },
    render: (a) => <Switch {...a} />,
  },
  stories: [
    {
      name: 'States',
      render: () => (
        <>
          <Switch aria-label="Off" />
          <Switch aria-label="On" defaultChecked />
          <Switch aria-label="Small" size="sm" defaultChecked />
          <Switch aria-label="Disabled" disabled />
          <Switch aria-label="Disabled on" disabled defaultChecked />
        </>
      ),
    },
    {
      name: 'Settings list',
      render: () => (
        <Stack gap={5} className="sb-w-400">
          <Switch labelPosition="start" defaultChecked label="Email notifications" description="Receive a daily digest of activity." />
          <Switch labelPosition="start" label="Desktop notifications" description="Get notified about mentions instantly." />
          <Switch labelPosition="start" defaultChecked label="Two-factor authentication" description="Require a code when signing in." />
        </Stack>
      ),
    },
  ],
});

export const segmented = defineStories({
  id: 'segmented-control',
  title: 'Segmented control',
  group: 'Selection',
  description: 'Compact single-choice toggle with a sliding indicator — matches the tab style in the reference.',
  stories: [
    {
      name: 'Text',
      render: () => (
        <SegmentedControl
          aria-label="Range"
          defaultValue="week"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
      ),
    },
    {
      name: 'Icons',
      render: () => (
        <>
          <SegmentedControl
            aria-label="View"
            defaultValue="grid"
            options={[
              { value: 'grid', icon: <LayoutGrid />, 'aria-label': 'Grid' },
              { value: 'list', icon: <List />, 'aria-label': 'List' },
              { value: 'rows', icon: <Rows3 />, 'aria-label': 'Rows' },
            ]}
          />
          <SegmentedControl
            size="sm"
            aria-label="View"
            defaultValue="list"
            options={[
              { value: 'grid', icon: <LayoutGrid />, label: 'Grid' },
              { value: 'list', icon: <List />, label: 'List' },
            ]}
          />
        </>
      ),
    },
    {
      name: 'Full width',
      render: () => (
        <div className="sb-w-400">
          <SegmentedControl
            fullWidth
            aria-label="Billing"
            defaultValue="yearly"
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly (save 20%)' },
            ]}
          />
        </div>
      ),
    },
  ],
});
