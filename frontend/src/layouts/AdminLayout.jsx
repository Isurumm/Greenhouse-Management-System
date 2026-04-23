import React, { useState } from 'react';
import { Layout, Button, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import AdminSideNav from '../components/admin/AdminSideNav';

const { Header, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const siderWidth = collapsed ? 84 : 260;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const userMenu = {
    items: [
      {
        key: '1',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout className="min-h-screen font-poppins bg-slate-50">
      <AdminSideNav
        collapsed={collapsed}
        pathname={location.pathname}
        onToggle={() => setCollapsed(!collapsed)}
        onNavigate={navigate}
        userRole={user?.role}
      />
      <Layout style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s ease' }}>
        <Header
          className="fixed top-0 z-30 bg-white p-0 px-4 flex justify-between items-center shadow-sm border-b border-slate-100"
          style={{
            left: siderWidth,
            right: 0,
            transition: 'left 0.2s ease',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-12 h-12"
          />
          <div className="hidden items-center gap-4 md:flex font-poppins">
             <span className="font-semibold">{user?.name} ({user?.role})</span>
             <Dropdown menu={userMenu} placement="bottomRight">
                <Button type="text" icon={<UserOutlined />} className="rounded-full bg-gray-100" />
             </Dropdown>
          </div>
        </Header>
        <Content className="mx-6 mb-6 mt-[88px] p-6 min-h-[280px] bg-white rounded-2xl shadow-sm overflow-auto border border-slate-100">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
