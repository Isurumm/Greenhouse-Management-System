import React, { useMemo, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  message,
  Table,
} from 'antd';
import { createTunnelEmployee, updateTunnelEmployee } from '../../api/polytunnelsApi';
import { useAuth } from '../../context/AuthContext';

const EmployeeManager = ({ visible, onClose, tunnels, employees }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [workerFilter, setWorkerFilter] = useState('all');

  const workerFilterOptions = useMemo(() => {
    const tunnelOptions = (Array.isArray(tunnels) ? tunnels : []).map((tunnel) => ({
      value: tunnel._id,
      label: tunnel.name,
    }));

    return [
      { value: 'all', label: 'All Tunnels' },
      ...tunnelOptions,
    ];
  }, [tunnels]);

  const tunnelOptions = useMemo(() => {
    if (!Array.isArray(tunnels)) return [];

    const occupiedTunnelIds = new Map();
    (Array.isArray(employees) ? employees : []).forEach((employee) => {
      const tunnelId = employee.assignedTunnel?._id;
      if (tunnelId) {
        occupiedTunnelIds.set(tunnelId, employee);
      }
    });

    return tunnels.map((tunnel) => {
      const occupiedBy = occupiedTunnelIds.get(tunnel._id);
      const occupiedByAnotherWorker = occupiedBy && occupiedBy._id !== editingId;

      return {
        value: tunnel._id,
        label: occupiedByAnotherWorker ? `${tunnel.name} (Assigned)` : tunnel.name,
        disabled: occupiedByAnotherWorker,
      };
    });
  }, [editingId, employees, tunnels]);

  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    if (workerFilter === 'unassigned') {
      return employees.filter((employee) => !employee.assignedTunnel);
    }
    if (workerFilter !== 'all') {
      return employees.filter(
        (employee) => employee.assignedTunnel?._id === workerFilter,
      );
    }
    return employees;
  }, [employees, workerFilter]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      if (editingId) {
        await updateTunnelEmployee(editingId, values, config);
        message.success('Worker credentials updated');
      } else {
        await createTunnelEmployee(values, config);
        message.success('Worker registered successfully');
      }
      form.resetFields();
      setEditingId(null);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      ...record,
      assignedTunnel: record.assignedTunnel?._id,
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (value) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'roleTitle',
      key: 'roleTitle',
      render: (value) => (
        <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {value}
        </span>
      ),
    },
    {
      title: 'Post',
      key: 'tunnel',
      render: (_, r) => (
        <span className="text-xs font-medium text-gray-500">
          {r.assignedTunnel?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <button
          onClick={() => handleEdit(record)}
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          Edit Details
        </button>
      ),
    },
  ];

  return (
    <Drawer
      title={null}
      size="large"
      onClose={onClose}
      open={visible}
      destroyOnHidden
      className="[&_.ant-drawer-body]:bg-gray-50/70 [&_.ant-drawer-body]:p-0 [&_.ant-drawer-header]:hidden"
    >
      <div className="min-h-full bg-gray-50/70">
        <div className="border-b border-gray-200 bg-white px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Polytunnel Workers
            </h2>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-white px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Modify Assignment' : 'Register New Worker'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingId
                  ? 'Update worker information and assignment details.'
                  : 'Create a new worker record and optionally assign a tunnel.'}
              </p>
            </div>

            <div className="px-6 py-6">
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="grid grid-cols-1 gap-5">
                  <Form.Item
                    name="fullName"
                    label={<span className="font-medium text-gray-700">Full Name</span>}
                    rules={[
                      { required: true, message: 'Worker name is required' },
                      { min: 1, message: 'Worker name is required' },
                      { max: 60, message: 'Worker name is required' },
                      {
                        pattern: /^[A-Za-z][A-Za-z\s'.-]*$/,
                        message: 'Name can only include letters, spaces, apostrophes, dots, and hyphens',
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (!value.trim()) {
                            return Promise.reject(new Error('Name cannot be empty spaces'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                      placeholder="Enter worker name"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Form.Item
                      name="roleTitle"
                      label={<span className="font-medium text-gray-700">Role</span>}
                      rules={[{ required: true, message: 'Please select a farm role' }]}
                      className="mb-0"
                    >
                      <Select
                        size='large'
                        className="custom-select"
                        placeholder="Select role"
                        classNames={{ popup: { root: 'rounded-xl' } }}
                        options={[
                          { value: "Harvester", label: "Harvester" },
                          { value: "Technician", label: "Technician" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label={<span className="font-medium text-gray-700">Contact Number</span>}
                      normalize={(value) => (value ? value.replace(/\D/g, '').slice(0, 10) : '')}
                      rules={[
                        { required: true, message: 'Emergency contact number is required' },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            if (/^\d{10}$/.test(value)) return Promise.resolve();
                            return Promise.reject(new Error('Phone number must contain exactly 10 digits'));
                          },
                        },
                      ]}
                      className="mb-0"
                    >
                      <Input
                        inputMode="numeric"
                        maxLength={10}
                        className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                        placeholder="Enter 10-digit contact number"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="assignedTunnel"
                    label={<span className="font-medium text-gray-700">Assign a Tunnel</span>}
                    extra="Each tunnel can only have one assigned worker."
                    className="mb-0"
                  >
                    <Select
                      size='large'
                      allowClear
                      placeholder="Select an available tunnel"
                      className="custom-select"
                      classNames={{ popup: { root: 'rounded-xl' } }}
                      options={tunnelOptions}
                    />
                  </Form.Item>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="!h-11 !flex-1 !rounded-xl !border-0 !bg-blue-600 !font-medium !shadow-sm hover:!bg-blue-700"
                    >
                      {editingId ? 'Save Re-assignment' : 'Submit ID Card'}
                    </Button>

                    {editingId && (
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          form.resetFields();
                        }}
                        className="!h-11 !flex-1 !rounded-xl !border-gray-200 !font-medium !text-gray-700 !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Registered Workers</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage current worker assignments.
                  </p>
                </div>

                <div className="w-full sm:w-56">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Filter By Tunnel
                  </label>
                  <Select
                    size="medium"
                    value={workerFilter}
                    onChange={setWorkerFilter}
                    className="w-48"
                    options={workerFilterOptions}
                  />
                </div>
              </div>
            </div>

            <div className="px-2 pb-2 pt-2 sm:px-4">
              <Table
                columns={columns}
                dataSource={filteredEmployees}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                size="small"
                className="[&_.ant-table]:rounded-2xl [&_.ant-table-container]:rounded-2xl [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-gray-100 [&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-[0.14em] [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/40"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-select .ant-select-selector {
          height: 44px !important;
          border-radius: 12px !important;
          border-color: rgb(229 231 235) !important;
          box-shadow: none !important;
          display: flex;
          align-items: center;
          padding: 0 11px !important;
        }

        .custom-select.ant-select-focused .ant-select-selector,
        .custom-select:hover .ant-select-selector {
          border-color: rgb(59 130 246) !important;
        }

        .custom-select .ant-select-selection-placeholder,
        .custom-select .ant-select-selection-item {
          line-height: 42px !important;
        }
      `}</style>
    </Drawer>
  );
};

export default EmployeeManager;