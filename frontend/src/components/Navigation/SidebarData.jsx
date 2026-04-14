import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as MdIcons from 'react-icons/md';
import * as GiIcons from 'react-icons/gi';

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
    title: 'Point of Sale',
    path: '/dashboard/pos',
    icon: <MdIcons.MdOutlinePointOfSale />,
    cName: 'nav-text'
  },
  {
    title: 'Summary Sales',
    path: '/dashboard/sales',
    icon: <FaIcons.FaMoneyBill/>,
    cName: 'nav-text'
  },
  {
    title: 'Expenses',
    path: '/dashboard/expenses',
    icon: <GiIcons.GiExpense/>,
    cName: 'nav-text'
  },
  {
    title: 'Settings',
    path: '/dashboard/units',
    icon: <IoIcons.IoMdSettings />,
    cName: 'nav-text'
  }
];