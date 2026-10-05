import { useState } from 'react';
import { ArrowRight, Bold, ChevronDown, Download, Filter, Italic, Plus, Settings, Trash2, Underline, Upload } from 'lucide-react';
import { Button, ButtonGroup, IconButton, Kbd, Menu, MenuItem, Tooltip } from '@ui';
import { defineStories } from '../workbench/types';

export default defineStories({
  id: 'button',
  title: 'Button',
  group: 'Actions',
  component: 'Button',
  childrenArg: 'children',
  description: 'Triggers an action. Primary uses the ink colour of the theme; secondary is the bordered surface button from the reference design.',
  playground: {
    args: { children: 'Button', variant: 'primary', size: 'md', loading: false, disabled: false, fullWidth: false },
    controls: {
      children: { type: 'text', label: 'label' },
      variant: { type: 'select', options: ['primary', 'secondary', 'ghost', 'soft', 'accent', 'danger', 'link'] },
      size: { type: 'radio', options: ['xs', 'sm', 'md', 'lg'] },
      loading: { type: 'boolean' },
      disabled: { type: 'boolean' },
      fullWidth: { type: 'boolean' },
    },
    render: (a) => (
      <div style={{ width: a.fullWidth ? 320 : undefined }}>
        <Button {...a} />
      </div>
    ),
  },
  stories: [
    {
      name: 'Variants',
      render: () => (
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </>
      ),
    },
    {
      name: 'Sizes',
      render: () => (
        <>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </>
      ),
    },
    {
      name: 'With icons',
      render: () => (
        <>
          <Button variant="primary" leading={<Plus />}>
            New file
          </Button>
          <Button leading={<Filter />}>Filters</Button>
          <Button trailing={<ArrowRight />} variant="ghost">
            Continue
          </Button>
          <Button leading={<Upload />} variant="soft">
            Upload
          </Button>
          <Button leading={<Trash2 />} variant="danger">
            Delete
          </Button>
        </>
      ),
    },
    {
      name: 'Icon buttons',
      description: 'Square buttons. Always pair with aria-label; add a Tooltip for sighted users.',
      render: () => (
        <>
          {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
            <Tooltip key={s} content={`Settings (${s})`}>
              <IconButton size={s} aria-label="Settings" variant="secondary">
                <Settings />
              </IconButton>
            </Tooltip>
          ))}
          <Tooltip content="Download" shortcut="⌘D">
            <IconButton aria-label="Download">
              <Download />
            </IconButton>
          </Tooltip>
          <IconButton aria-label="Add" variant="primary">
            <Plus />
          </IconButton>
        </>
      ),
    },
    {
      name: 'States',
      render: () => (
        <>
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button loading>Loading</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="ghost" disabled>
            Disabled
          </Button>
        </>
      ),
    },
    {
      name: 'Button group',
      description: 'Segmented actions and a split button.',
      render: function Render() {
        const [fmt, setFmt] = useState<string[]>(['bold']);
        const toggle = (k: string) => setFmt((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
        return (
          <>
            <ButtonGroup>
              <Button>Day</Button>
              <Button>Week</Button>
              <Button>Month</Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Formatting">
              <IconButton variant="secondary" aria-label="Bold" pressed={fmt.includes('bold')} onClick={() => toggle('bold')}>
                <Bold />
              </IconButton>
              <IconButton variant="secondary" aria-label="Italic" pressed={fmt.includes('italic')} onClick={() => toggle('italic')}>
                <Italic />
              </IconButton>
              <IconButton variant="secondary" aria-label="Underline" pressed={fmt.includes('underline')} onClick={() => toggle('underline')}>
                <Underline />
              </IconButton>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="primary">Publish</Button>
              <Menu
                placement="bottom-end"
                trigger={
                  <IconButton variant="primary" aria-label="More publish options" style={{ borderLeftColor: 'color-mix(in oklab, var(--primary-fg) 20%, transparent)' }}>
                    <ChevronDown />
                  </IconButton>
                }
              >
                <MenuItem>Schedule…</MenuItem>
                <MenuItem>Save as draft</MenuItem>
              </Menu>
            </ButtonGroup>
          </>
        );
      },
    },
    {
      name: 'With shortcut',
      render: () => (
        <>
          <Button variant="secondary" trailing={<Kbd size="sm">⌘S</Kbd>}>
            Save
          </Button>
          <Button variant="primary" trailing={<Kbd size="sm">↵</Kbd>}>
            Send
          </Button>
        </>
      ),
    },
  ],
});
