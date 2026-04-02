import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  InboxOutlined,
  CarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { ADMIN_MODULE_ROLES } from '../../constants/roleAccess';

const { Sider } = Layout;

const AdminSideNav = ({ collapsed, pathname, onToggle, onNavigate, userRole }) => {
  const getMenuItems = () => {
    const items = [
      { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    ];

    if (userRole && ADMIN_MODULE_ROLES.polytunnels.includes(userRole)) {
      items.push({ key: '/admin/polytunnels', icon: <AppstoreOutlined />, label: 'Polytunnels' });
    }

    if (userRole && ADMIN_MODULE_ROLES.inventory.includes(userRole)) {
      items.push({ key: '/admin/inventory', icon: <InboxOutlined />, label: 'Inventory' });
    }

    if (userRole && ADMIN_MODULE_ROLES.orders.includes(userRole)) {
      items.push({ key: '/admin/orders', icon: <ShoppingOutlined />, label: 'Orders' });
    }

    if (userRole && (ADMIN_MODULE_ROLES.deliveries.includes(userRole) || ADMIN_MODULE_ROLES.users.includes(userRole))) {
      items.push({ key: '/admin/deliveries', icon: <CarOutlined />, label: 'Deliveries' });
      items.push({ key: '/admin/users', icon: <TeamOutlined />, label: 'Users & Customers' });
    }

    return items;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={84}
      className="bg-cal-poly-green font-poppins fixed left-0 top-0 bottom-0 z-40 overflow-y-auto"
    >
      <div className="h-20 px-4 flex items-center justify-between border-b border-SGBUS-green">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/adaptive-icon.png" alt="PolyManage" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <p className="text-white font-semibold truncate">PolyManage</p>
              <p className="text-slate-400 text-xs truncate">Admin Workspace</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[pathname]}
          onClick={({ key }) => onNavigate(key)}
          items={getMenuItems()}
          className="bg-transparent font-poppins border-none [&_.ant-menu-item]:rounded-3xl [&_.ant-menu-item-selected]:bg-SGBUS-green/20 [&_.ant-menu-item-selected]:text-white [&_.ant-menu-item]:mb-1"
        />
      </div>
    </Sider>
  );
};

export default AdminSideNav;
 