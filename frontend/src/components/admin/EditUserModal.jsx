import React, { useState } from "react";
import { Drawer, Form, Input, Select, Button, Switch, message } from "antd";
import { updateUser } from "../../api/usersApi";
import { useAuth } from "../../context/AuthContext";

const handlePhoneKeyDown = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }

  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
};

const normalizePhoneInput = (event) => {
  const value = event?.target?.value || "";
  return value.replace(/\D/g, "").slice(0, 10);
};

const handleTextKeyDown = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }

  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
};

const sanitizeTextInput = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/[0-9]/g, "");
};

const EditUserModal = ({ visible, onClose, targetUser }) => {
  const [form] = Form.useForm();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };

      const payload = {
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        phone: values.phone,
        address: values.address,
        isActive: values.isActive,
      };

      if (values.password) {
        payload.password = values.password;
      }

      await updateUser(targetUser._id, payload, config);
      message.success("User updated successfully");
      onClose(true);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={null}
      open={visible}
      onClose={() => onClose(false)}
      destroyOnClose
      closeIcon={false}
      width={480}
      styles={{ body: { padding: 0 } }}
      className="font-poppins [&_.ant-drawer-content-wrapper]:rounded-l-3xl [&_.ant-drawer-content-wrapper]:shadow-2xl"
    >
      <div className="font-poppins">
        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-200 rounded-tl-3xl">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Edit User Account
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-gray-500">
              Update profile details, role, and account status.
            </p>
          </div>
        </div>

        <div className="px-8 py-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              fullName: targetUser.name,
              email: targetUser.email,
              role: targetUser.role,
              phone: targetUser.phone || "",
              address: targetUser.address || "",
              isActive: targetUser.isActive,
            }}
          >
            <Form.Item
              name="fullName"
              label={<span className="font-medium text-gray-700">Full Name</span>}
              rules={[
                { required: true, message: "Full name is required" },
                {
                  pattern: /^[^0-9]*$/,
                  message: "Full name cannot contain numbers",
                },
              ]}
              className="mb-4"
            >
              <Input
                placeholder="Enter full name"
                onKeyDown={handleTextKeyDown}
                onChange={(event) => {
                  form.setFieldValue(
                    "fullName",
                    sanitizeTextInput(event.target.value),
                  );
                }}
                className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-medium text-gray-700">Email</span>}
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email address" },
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email must include @ and a valid domain",
                },
              ]}
              className="mb-4"
            >
              <Input
                placeholder="name@example.com"
                className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-medium text-gray-700">Password (Optional)</span>}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.length >= 6) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Password must be at least 6 characters"),
                    );
                  },
                },
              ]}
              className="mb-4"
            >
              <Input.Password
                placeholder="Leave blank to keep existing password"
                className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={<span className="font-medium text-gray-700">System Role</span>}
              rules={[{ required: true, message: "Select a role" }]}
              className="mb-4"
            >
              <Select
                size="large"
                className="custom-select"
                classNames={{ popup: { root: "rounded-xl" } }}
                options={[
                  { value: "customer", label: "Customer" },
                  { value: "polytunnelManager", label: "Polytunnel Manager" },
                  { value: "inventoryManager", label: "Inventory Manager" },
                  { value: "orderManager", label: "Order Dispatch Manager" },
                  { value: "userCustomerManager", label: "User/HR Manager" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="font-medium text-gray-700">Phone Number</span>}
              getValueFromEvent={normalizePhoneInput}
              rules={[
                { required: true, message: "Phone number is required" },
                {
                  validator: (_, value) => {
                    if (/^\d{10}$/.test(value)) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Phone number must be exactly 10 digits"),
                    );
                  },
                },
              ]}
              className="mb-4"
            >
              <Input
                placeholder="Enter phone number"
                maxLength={10}
                inputMode="numeric"
                onKeyDown={handlePhoneKeyDown}
                className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="address"
              label={<span className="font-medium text-gray-700">Address</span>}
              rules={[{ required: true, message: "Address is required" }]}
              className="mb-4"
            >
              <Input
                placeholder="Enter address"
                className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={<span className="font-medium text-gray-700">Account Status</span>}
              valuePropName="checked"
              className="mb-0"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
            </Form.Item>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => onClose(false)}
                className="!h-11 !rounded-xl !border-gray-200 !px-6 !font-medium !text-gray-700 !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!h-11 !rounded-xl !border-0 !bg-blue-600 !px-8 !font-medium !shadow-sm hover:!bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </Form>
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

export default EditUserModal;
