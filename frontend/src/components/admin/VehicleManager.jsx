import React, { useState } from "react";
import { Drawer, Form, Input, Button, Table, message, Select, Tag } from "antd";
import { createVehicle, updateVehicle } from "../../api/deliveriesApi";
import { useAuth } from "../../context/AuthContext";

const VehicleManager = ({ visible, onClose, vehicles }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      if (editingId) {
        await updateVehicle(editingId, values, config);
        message.success("Vehicle metrics updated");
      } else {
        await createVehicle(values, config);
        message.success("Vehicle registered");
      }
      form.resetFields();
      setEditingId(null);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
  };

  const columns = [
    {
      title: "Plates",
      dataIndex: "licensePlate",
      key: "plate",
      render: (t) => (
        <span className="inline-flex rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-1 font-mono text-xs font-bold tracking-wide text-gray-800">
          {t}
        </span>
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (value) => (
        <span className="font-medium text-gray-800">{value}</span>
      ),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (value) => <span className="text-sm text-gray-600">{value}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
            st === "Active"
              ? "border-green-100 bg-green-50 text-green-600"
              : "border-orange-100 bg-orange-50 text-orange-600"
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
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
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
              Vehile Registration
            </h2>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-white via-slate-50 to-white px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId
                  ? "Edit Vehicle"
                  : "Register New Vehicle"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingId
                  ? "Update the selected vehicle and save the latest vehicle information."
                  : "Add a new vehicle to the System."}
              </p>
            </div>

            <div className="px-6 py-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ status: "Active" }}
              >
                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Form.Item
                      name="licensePlate"
                      label={
                        <span className="font-medium text-gray-700">
                          Gov License Plate
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input
                        className="!h-11 !rounded-xl !border-gray-200 !font-mono !text-base uppercase hover:!border-blue-400 focus:!border-blue-500"
                        placeholder="ABC-1234"
                      />
                    </Form.Item>

                    <Form.Item
                      name="capacity"
                      label={
                        <span className="font-medium text-gray-700">
                          Payload Rating
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Select
                        className="custom-select"
                        classNames={{ popup: { root: 'rounded-xl' } }}
                        options={[
                          { value: "Small", label: "Small (Van)" },
                          { value: "Medium", label: "Medium (Box Truck)" },
                          { value: "Large", label: "Large (HGV)" },
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Form.Item
                      name="model"
                      label={
                        <span className="font-medium text-gray-700">
                          Make & Model
                        </span>
                      }
                      rules={[{ required: true }]}
                      className="mb-0"
                    >
                      <Input
                        className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                        placeholder="E.g., Ford Transit"
                      />
                    </Form.Item>

                    <Form.Item
                      name="status"
                      label={
                        <span className="font-medium text-gray-700">
                          Current Status
                        </span>
                      }
                      className="mb-0"
                    >
                      <Select
                        size="large"
                        className="custom-select"
                        classNames={{ popup: { root: 'rounded-xl' } }}
                        options={[
                          { value: "Active", label: "Active" },
                          { value: "Maintenance", label: "In the Shop (Maintenance)" },
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    {editingId && (
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          form.resetFields();
                        }}
                        className="!h-11 !rounded-xl !border-gray-200 !px-6 !font-medium !text-gray-700 !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
                      >
                        Cancel
                      </Button>
                    )}

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="!h-11 !rounded-xl !border-0 !bg-blue-600 !px-8 !font-medium !shadow-sm hover:!bg-blue-700"
                    >
                      {editingId ? "Save Changes" : "Register Vehicle"}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Vehicle List
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review registered vehicles and update records when needed.
              </p>
            </div>

            <div className="px-2 pb-2 pt-2 sm:px-4">
              <Table
                columns={columns}
                dataSource={vehicles}
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

export default VehicleManager;
