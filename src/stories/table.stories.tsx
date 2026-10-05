import { useMemo, useState } from 'react';
import { Download, FileText, FolderInput, MoreVertical, Pencil, Share2, Sheet, Trash2, Image as ImageIcon, PenTool, FileSearch } from 'lucide-react';
import {
  Avatar,
  Button,
  DataTable,
  EmptyState,
  IconButton,
  IconTile,
  Menu,
  MenuItem,
  MenuSeparator,
  Pagination,
  Stack,
  Text,
  toast,
  type Column,
} from '@ui';
import { defineStories } from '../workbench/types';
import { files, fmtDate, type FileRow } from './_data';

export const fileIcon = (t: FileRow['type']) => (t === 'xls' ? <Sheet /> : t === 'png' ? <ImageIcon /> : t === 'fig' ? <PenTool /> : <FileText />);

export function fileColumns(): Column<FileRow>[] {
  return [
    {
      key: 'name',
      header: 'File name',
      sortable: true,
      render: (f) => (
        <Stack direction="row" gap={3} align="center">
          <IconTile size="sm">{fileIcon(f.type)}</IconTile>
          <div style={{ minWidth: 0 }}>
            <Text size="sm" weight="medium" truncate>{f.name}</Text>
            <Text size="xs" tone="tertiary">
              {f.size} · {f.type}
            </Text>
          </div>
        </Stack>
      ),
    },
    {
      key: 'owner',
      header: 'Uploaded by',
      hideBelow: 'md',
      sortable: true,
      sortValue: (f) => f.owner.name,
      render: (f) => (
        <Stack direction="row" gap={2.5} align="center">
          <Avatar src={f.owner.avatar} name={f.owner.name} />
          <div>
            <Text size="sm" weight="medium">{f.owner.name}</Text>
            <Text size="sm" tone="tertiary">{f.owner.email}</Text>
          </div>
        </Stack>
      ),
    },
    { key: 'modified', header: 'Last modified', sortable: true, hideBelow: 'sm', sortValue: (f) => f.modified, render: (f) => <Text size="sm" tone="secondary">{fmtDate(f.modified)}</Text> },
    {
      key: 'actions',
      header: <span className="ui-sr-only">Actions</span>,
      width: 48,
      align: 'right',
      render: (f) => (
        <Menu
          placement="bottom-end"
          trigger={
            <IconButton size="sm" aria-label={`Actions for ${f.name}`}>
              <MoreVertical />
            </IconButton>
          }
        >
          <MenuItem icon={<Download />} shortcut="⌘D" onSelect={() => toast(`Downloading ${f.name}`)}>Download</MenuItem>
          <MenuItem icon={<Share2 />}>Share</MenuItem>
          <MenuItem icon={<Pencil />} shortcut="F2">Rename</MenuItem>
          <MenuItem icon={<FolderInput />}>Move to…</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<Trash2 />} danger onSelect={() => toast.error(`${f.name} deleted`, { action: { label: 'Undo', onClick: () => toast('Restored') } })}>
            Delete
          </MenuItem>
        </Menu>
      ),
    },
  ];
}

export default defineStories({
  id: 'table',
  title: 'Data table',
  group: 'Data display',
  description: 'Sortable columns, row selection (Shift-click for ranges), row menus, bulk-action bar, loading and empty states, responsive column hiding.',
  stories: [
    {
      name: 'File table (reference)',
      layout: 'padded',
      render: function Render() {
        const [page, setPage] = useState(1);
        const [size, setSize] = useState(7);
        const [sel, setSel] = useState<string[]>([]);
        const pageRows = useMemo(() => files.slice((page - 1) * size, page * size), [page, size]);
        return (
          <Stack gap={4}>
            <DataTable
              aria-label="Files"
              columns={fileColumns()}
              rows={pageRows}
              rowKey={(f) => f.id}
              selectable
              selected={sel}
              onSelectedChange={setSel}
              bulkActions={(keys, clear) => (
                <>
                  <Button size="sm" variant="ghost" leading={<Download />} onClick={() => toast(`Downloading ${keys.length} files`)}>
                    Download
                  </Button>
                  <Button size="sm" variant="ghost" leading={<Trash2 />} onClick={() => { toast.error(`${keys.length} files deleted`); clear(); }}>
                    Delete
                  </Button>
                </>
              )}
            />
            <Pagination page={page} pageCount={Math.ceil(files.length / size)} onPageChange={setPage} pageSize={size} pageSizeOptions={[5, 7, 10, 20]} onPageSizeChange={(n) => { setSize(n); setPage(1); }} />
          </Stack>
        );
      },
    },
    {
      name: 'Compact, unbordered',
      layout: 'padded',
      render: () => (
        <DataTable
          bordered={false}
          density="compact"
          rows={files.slice(0, 4)}
          rowKey={(f) => f.id}
          defaultSort={{ key: 'size', direction: 'desc' }}
          columns={[
            { key: 'name', header: 'Name', sortable: true },
            { key: 'type', header: 'Type', render: (f) => f.type.toUpperCase() },
            { key: 'size', header: 'Size', sortable: true, align: 'right', sortValue: (f) => f.bytes },
          ]}
        />
      ),
    },
    {
      name: 'Pinned column, short headers',
      layout: 'padded',
      render: () => (
        <div style={{ maxWidth: 360 }}>
          <DataTable
            bordered
            density="compact"
            pinFirstColumn
            rows={files.slice(0, 5)}
            rowKey={(f) => f.id}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'size', header: 'Size', shortHeader: 'Sz', align: 'right', width: 72 },
              { key: 'type', header: 'Type', shortHeader: 'Ty', width: 72, render: (f) => f.type.toUpperCase() },
              { key: 'owner', header: 'Owner', width: 120, render: (f) => f.owner.name },
              { key: 'modified', header: 'Last modified', shortHeader: 'Modified', width: 140, render: (f) => fmtDate(f.modified) },
            ]}
          />
        </div>
      ),
    },
    {
      name: 'Loading',
      layout: 'padded',
      render: () => <DataTable loading rows={[]} rowKey={(f: FileRow) => f.id} columns={fileColumns().slice(0, 3)} selectable />,
    },
    {
      name: 'Empty',
      layout: 'padded',
      render: () => (
        <DataTable
          rows={[]}
          rowKey={(f: FileRow) => f.id}
          columns={fileColumns().slice(0, 3)}
          empty={<EmptyState icon={<FileSearch />} title="No files found" description="Your search “quarterly” did not match any files. Try another term." actions={<Button size="sm">Clear search</Button>} />}
        />
      ),
    },
  ],
});
