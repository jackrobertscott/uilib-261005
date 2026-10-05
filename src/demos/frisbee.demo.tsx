import { defineStories } from '../workbench/types';
import { FrisbeeApp } from './frisbee/App';

export default defineStories({
  id: 'demo-frisbee',
  title: 'Frisbee league',
  group: 'Demos',
  order: 5,
  fullPage: true,
  description: 'A full rebuild of the Perth Ultimate League app (frisbee-211221) on mock data. Use the account menu to view as admin, captain, player or a user without a team.',
  stories: [{ name: 'Frisbee league', render: () => <FrisbeeApp /> }],
});
