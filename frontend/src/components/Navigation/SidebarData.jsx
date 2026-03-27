import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as MdIcons from 'react-icons/md';

export const SidebarData = [
  {
    title: 'Home',
    path: '/dashboard',
    icon: <FaIcons.FaHome />,
    cName: 'nav-text'
  },
  {
    title: 'Inventory',
    path: '/dashboard/inventory',
    icon: <FaIcons.FaBox />,
    cName: 'nav-text'
  },
  {
    title: 'Stocks',
    path: '/dashboard/units',
    icon: <FaIcons.FaBox />,
    cName: 'nav-text'
  }
];