import React, { useState } from "react";
import { Drawer, Form, Input, Select, Button, Table, message } from "antd";
import { createDriver, updateDriver } from "../../api/deliveriesApi";
import { useAuth } from "../../context/AuthContext";

const DriverManager = ({ visible, onClose, drivers, vehicles }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      if (editingId) {
        await updateDriver(editingId, values, config);
        message.success("Courier profile updated");
      } else {
        await createDriver(values, config);
        message.success("Courier signed to ledger");
      }
      form.resetFields();
      setEditingId(null);
      onClose();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to sync Driver data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({
      ...record,
      assignedVehicle: record.assignedVehicle?._id,
    });
  };

  const columns = [
    {
      title: "Courier Name",
      dataIndex: "fullName",
      key: "name",
      render: (t) => <span className="font-semibold text-gray-800">{t}</span>,
    },
    {
      title: "Contact",
      dataIndex: "phone",
      key: "phone",
      render: (value) => <span className="text-sm text-gray-600">{value}</span>,
    },
    {
      title: "Current Truck",
      key: "vehicle",
      render: (_, r) =>
        r.assignedVehicle ? (
          <span className="inline-flex rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-xs font-bold text-gray-600">
            {r.assignedVehicle.licensePlate}
          </span>
        ) : (
          <span className="text-xs italic text-gray-400">Unassigned</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st) => (
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
            st === "Available"
              ? "border-green-100 bg-green-50 text-green-600"
              : st === "On Route"
                ? "border-blue-100 bg-blue-50 text-blue-600"
                : "border-gray-200 bg-gray-100 text-gray-600"
          }`}
        >
          {st}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <button
          onClick={() => handleEdit(record)}
          className="text-sm font-semibold text-green-600 transition hover:text-green-700"
        >
          Edit
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
      <div className="min-h-full bg-gray-50/70 font-poppins">
        <div className="border-b border-gray-200 bg-white px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              {editingId ? "Edit Courier Profile" : "Courier Management"}
            </h2>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-white via-green-50 to-white px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId
                  ? "Re-assign Driver"
                  : "Sign New Driver"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingId
                  ? "Update courier details, vehicle assignment, and duty status."
                  : "Create a new courier record for delivery operations."}
              </p>
            </div>

            <div className="px-6 py-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ status: "Available" }}
              >
                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Form.Item
                      name="fullName"
                      label={
                        <span className="font-medium text-gray-700">
                          Legal Full Name
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="John Courier"
                        className="!h-11 !rounded-xl !border-gray-200 hover:!border-green-400 focus:!border-green-500"
                      />
                    </Form.Item>

                    <Form.Item
                      name="licenseNumber"
                      label={
                        <span className="font-medium text-gray-700">
                          Gov License Number
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input
                        className="!h-11 !rounded-xl !border-gray-200 !font-mono hover:!border-green-400 focus:!border-green-500"
                        placeholder="Enter license number"
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Form.Item
                      name="phone"
                      label={
                        <span className="font-medium text-gray-700">
                          Dispatch Contact
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="(555) 123-4567"
                        className="!h-11 !rounded-xl !border-gray-200 hover:!border-green-400 focus:!border-green-500"
                      />
                    </Form.Item>

                    <Form.Item
                      name="assignedVehicle"
                      label={
                        <span className="font-medium text-gray-700">
                          Issue Keys (Vehicle Assign)
                        </span>
                      }
                      className="mb-0"
                    >
                      <Select
                        size="large"
                        placeholder="Assign a truck"
                        allowClear
                        className="custom-select"
                        classNames={{ popup: { root: 'rounded-xl' } }}
                        options={vehicles
                          .filter((v) => v.status === "Active")
                          .map((v) => ({
                            value: v._id,
                            label: `${v.model} (${v.licensePlate})`,
                          }))}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="status"
                    label={
                      <span className="font-medium text-gray-700">
                        Duty Status
                      </span>
                    }
                    className="mb-0 md:max-w-xs"
                  >
                    <Select
                      size="large"
                      className="custom-select"
                      classNames={{ popup: { root: 'rounded-xl' } }}
                      options={[
                        { value: "Available", label: "Available (Standby)" },
                        { value: "On Route", label: "Tracking On Route" },
                        { value: "Off Duty", label: "Inactive / Off Duty" },
                      ]}
                    />
                  </Form.Item>

                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="!h-11 !rounded-xl !border-0 !bg-green-600 !px-8 !font-medium !shadow-sm hover:!bg-green-700"
                    >
                      {editingId ? "Commit Modification" : "Register Courier"}
                    </Button>

                    {editingId && (
                      <Button
                        className="!h-11 !rounded-xl !border-gray-200 !px-6 !font-medium !text-gray-700 !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
                        onClick={() => {
                          setEditingId(null);
                          form.resetFields();
                        }}
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
              <h3 className="text-lg font-semibold text-gray-900">
                Courier Directory
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review assigned vehicles, availability, and courier contact
                details.
              </p>
            </div>

            <div className="px-2 pb-2 pt-2 sm:px-4">
              <Table
                columns={columns}
                dataSource={drivers}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                size="small"
                className="[&_.ant-table]:rounded-2xl [&_.ant-table-container]:rounded-2xl [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-gray-100 [&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-[0.14em] [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr:hover>td]:bg-green-50/40"
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
          border-color: rgb(34 197 94) !important;
        }

        .custom-select .ant-select-selection-placeholder,
        .custom-select .ant-select-selection-item {
          line-height: 42px !important;
        }
      `}</style>
    </Drawer>
  );
};

export default DriverManager;
