import BasicLayout from '@/layouts/BasicLayout';
import { children } from './routerConfig';
import Services from '@/pages/Services';
import Home from '@/pages/Home';

const routerConfig = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      ...children,
      {
        path: '/services',
        component: Services,
      },
      {
        path: '/home',
        component: Home,
      },
      {
        path: '/',
        redirect: '/home',
      },
    ],
  },
];
export default routerConfig;
