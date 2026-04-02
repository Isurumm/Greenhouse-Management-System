import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tooltip, Input, Select, Space } from 'antd';
import {
  SafetyCertificateOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { getUsers, deleteUser } from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';
import { DateTime } from 'luxon';
import UserRoleModal from '../../components/admin/UserRoleModal';
import AddUserModal from '../../components/admin/AddUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import SummaryCard from '../../components/admin/SummaryCard';
import DeleteConfirm from '../../components/common/DeleteConfirm';
import { generateUserReport } from '../../utils/userReportGenerator';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await getUsers(config);
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await deleteUser(id, config);
      message.success('Account permanently erased');
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleTag = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            Admin
          </span>
        );
      case 'polytunnelManager':
        return (
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            Polytunnel Manager
          </span>
        );
      case 'inventoryManager':
        return (
          <span className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
            Inventory Manager
          </span>
        );
      case 'orderManager':
        return (
          <span className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
            Order Manager
          </span>
        );
      case 'userCustomerManager':
        return (
          <span className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
            User/Customer HR
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            Customer
          </span>
        );
    }
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: '_id',
      key: 'id',
      render: (id) => (
        <span className="font-mono text-xs text-gray-400">{id}</span>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <span className="font-semibold text-gray-900">{text}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span className="text-sm text-gray-600">{text}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-xs text-gray-500">
          {DateTime.fromISO(date).toFormat('MMM dd, yyyy')}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip>
            <Button
              type="default"
              icon={<SafetyCertificateOutlined />}
              size="small"
              className="rounded-lg border-gray-200"
              onClick={() => {
                setSelectedUser(record);
                setRoleModalVisible(true);
              }}
              disabled={record.email === 'admin@example.com'}
            >
              Modify Role
            </Button>
          </Tooltip>

          <Tooltip title="Edit User">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              className="rounded-lg border-gray-200"
              onClick={() => {
                setSelectedUser(record);
                setEditUserModalVisible(true);
              }}
              disabled={record.email === 'admin@example.com' || record._id === user._id}
            >
              Edit User
            </Button>
          </Tooltip>

          <Tooltip title="Delete User">
            <DeleteConfirm
              title="Delete this user permanently?"
              onConfirm={() => handleDelete(record._id)}
              disabled={
                record.email === 'admin@example.com' ||
                record._id === user._id
              }
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={
                  record.email === 'admin@example.com' ||
                  record._id === user._id
                }
              />
            </DeleteConfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalManagers = users.filter(
    (u) => u.role !== 'customer' && u.role !== 'admin'
  ).length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  const filteredUsers = users.filter((u) => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      u.name?.toLowerCase().includes(normalizedSearch) ||
      u.email?.toLowerCase().includes(normalizedSearch) ||
      u._id?.toLowerCase().includes(normalizedSearch);

    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && u.isActive) ||
      (selectedStatus === 'inactive' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedRole('all');
    setSelectedStatus('all');
  };

  // Generate report with current filtered data
  const handleGenerateReport = () => {
    if (filteredUsers.length === 0) {
      message.warning('No users to generate report');
      return;
    }

    const filters = {
      searchText: searchText || null,
      roleFilter: selectedRole !== 'all' ? selectedRole : null,
      statusFilter: selectedStatus !== 'all' ? selectedStatus : null,
    };

    try {
      generateUserReport({
        users: filteredUsers,
        generatedAt: new Date().toLocaleString(),
        appliedFilters: filters,
      });
      message.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    }
  };

  return (
    <div className="min-h-[500px] rounded-2xl border border-gray-200 bg-gray-50/60 p-6 shadow-sm font-poppins">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Users & Customers
            </h1>
            <p className="text-sm text-gray-500">
              Manage user roles, permissions, and system access.
            </p>
          </div>

          <Button
            type="primary"
            onClick={() => setAddUserModalVisible(true)}
            className="!h-11 !rounded-xl !border-0 !bg-blue-600 !px-6 !font-medium !shadow-sm hover:!bg-blue-700"
          >
            + Add New User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={<TeamOutlined />}
          title="Total Users"
          value={filteredUsers.length}
          extra={`${users.length} all accounts`}
        />
        <SummaryCard
          icon={<UserOutlined />}
          title="Customers"
          value={filteredUsers.filter((u) => u.role === 'customer').length}
          extra="standard users"
        />
        <SummaryCard
          icon={<SafetyCertificateOutlined />}
          title="Managers"
          value={filteredUsers.filter(
            (u) => u.role !== 'customer' && u.role !== 'admin'
          ).length}
          extra={`${filteredUsers.filter((u) => u.role === 'admin').length} admins`}
        />
        <SummaryCard
          icon={<DeleteOutlined />}
          title="Inactive"
          value={filteredUsers.filter((u) => !u.isActive).length}
          extra="disabled accounts"
        />
      </div>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <Space size={12} wrap className="w-full">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by name, email, or user ID"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="!w-[300px]"
          />

          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            className="!w-[220px]"
            suffixIcon={<FilterOutlined />}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'userCustomerManager', label: 'User/HR Manager' },
              { value: 'orderManager', label: 'Order Manager' },
              { value: 'inventoryManager', label: 'Inventory Manager' },
              { value: 'polytunnelManager', label: 'Polytunnel Manager' },
              { value: 'customer', label: 'Customer' },
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="!w-[180px]"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <Button 
            onClick={handleResetFilters}
            icon={<ClearOutlined />}
          >
            Reset
          </Button>

          <Button 
            type="primary"
            onClick={handleGenerateReport}
            icon={<FileTextOutlined />}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Report
          </Button>
        </Space>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 12 }}
          className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50"
        />
      </div>

      {roleModalVisible && selectedUser && (
        <UserRoleModal
          visible={roleModalVisible}
          onClose={() => {
            setRoleModalVisible(false);
            fetchUsers();
            setSelectedUser(null);
          }}
          targetUser={selectedUser}
        />
      )}

      {addUserModalVisible && (
        <AddUserModal
          visible={addUserModalVisible}
          onClose={(refresh) => {
            setAddUserModalVisible(false);
            if (refresh) {
              fetchUsers();
            }
          }}
        />
      )}

      {editUserModalVisible && selectedUser && (
        <EditUserModal
          visible={editUserModalVisible}
          targetUser={selectedUser}
          onClose={(refresh) => {
            setEditUserModalVisible(false);
            setSelectedUser(null);
            if (refresh) {
              fetchUsers();
            }
          }}
        />
      )}
    </div>
  );
};

export default Users;