import type { ReactNode } from 'react';
import { Archive, Asterisk, Bell, Calendar, File, Folder, FolderLock, Home, MoreVertical, Palette, Settings, Users, LayoutDashboard } from 'lucide-react';
import { AppShell, Avatar, IconButton, NavItem, NavSection, Sidebar, SidebarFooter, SidebarHeader, Stack, Text, Tree, Menu, MenuItem, Button } from '@ui';
import { people } from '../stories/_data';
import './demos.css';

export type DemoPage = 'home' | 'files' | 'dashboard' | 'settings' | 'team';

const go = (id: string) => () => {
  location.hash = `/${id}`;
};

/** The shared app sidebar used by the app demos (mirrors the reference). */
export function DemoShell({ active, children }: { active: DemoPage; children: ReactNode }) {
  return (
    <AppShell
      framed
      className="demo-shell"
      sidebar={
        <Sidebar>
          <SidebarHeader logo={<Asterisk />} title="Untitled UI" />
          <NavSection>
            <NavItem icon={<Home />} label="Home" active={active === 'home'} onClick={go('demo-dashboard')} />
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active={active === 'dashboard'} onClick={go('demo-dashboard')} />
            <NavItem icon={<File />} label="All files" active={active === 'files'} onClick={go('demo-files')} />
            <NavItem icon={<Folder />} label="All projects" />
            <NavItem icon={<FolderLock />} label="Private projects" />
            <NavItem icon={<Archive />} label="Archived projects" />
            <NavItem icon={<Users />} label="Shared with me" active={active === 'team'} badge={4} />
            <NavItem icon={<Calendar />} label="Events" />
            <NavItem icon={<Palette />} label="Design" />
            <NavItem icon={<Bell />} label="Notifications" />
            <NavItem icon={<Settings />} label="Settings" active={active === 'settings'} onClick={go('demo-settings')} />
          </NavSection>
          <NavSection
            title="Browser"
            action={
              <Menu placement="bottom-end" trigger={<IconButton size="xs" aria-label="Browser options"><MoreVertical /></IconButton>}>
                <MenuItem>New folder</MenuItem>
                <MenuItem>Collapse all</MenuItem>
              </Menu>
            }
          >
            <li className="ui-sidebar__collapsible">
              <Tree
                aria-label="Browser"
                defaultExpanded={['folders']}
                nodes={[
                  { id: 'projects', label: 'Projects', children: [{ id: 'p1', label: 'Website' }, { id: 'p2', label: 'Mobile app' }] },
                  {
                    id: 'folders',
                    label: 'Folders',
                    children: ['Olivia’s files', 'Sophie’s files', 'Dashboard UI', 'Dribbble', 'Websites', 'Mobile apps'].map((l, i) => ({ id: `f${i}`, label: l, children: [{ id: `f${i}c`, label: 'Archive' }] })),
                  },
                ]}
              />
            </li>
          </NavSection>
          <SidebarFooter>
            <Stack direction="row" gap={2.5} align="center" className="demo-account">
              <Avatar size="sm" src={people[0].avatar} name="Caitlyn Edwards" />
              <Button variant="link" size="sm" className="demo-signout" onClick={go('demo-auth')}>
                Sign out
              </Button>
              <Text size="sm" weight="medium" className="demo-account__link">
                Account
              </Text>
            </Stack>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </AppShell>
  );
}

/** Top-right header cluster (bell, menu, avatar) from the reference. */
export function HeaderActions() {
  return (
    <Stack direction="row" gap={1} align="center">
      <IconButton aria-label="Notifications" size="sm">
        <Bell />
      </IconButton>
      <Menu placement="bottom-end" trigger={<IconButton aria-label="More" size="sm"><MoreVertical /></IconButton>}>
        <MenuItem icon={<Settings />} onSelect={go('demo-settings')}>Settings</MenuItem>
        <MenuItem icon={<Users />}>Invite people</MenuItem>
      </Menu>
      <Avatar size="md" src={people[0].avatar} name="Caitlyn Edwards" style={{ marginLeft: 6 }} />
    </Stack>
  );
}
