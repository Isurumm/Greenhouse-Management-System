import React, { useState } from "react";
import { Modal, Form, Select, Button, message, Alert, Typography } from "antd";
import { updateUserRole } from "../../api/usersApi";
import { useAuth } from "../../context/AuthContext";

const { Text } = Typography;

const UserRoleModal = ({ visible, onClose, targetUser }) => {
  const [form] = Form.useForm();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await updateUserRole(
        targetUser._id,
        {
          role: values.role,
        },
        config,
      );

      message.success(
        `Granted ${values.role} privileges to ${targetUser.name}`,
      );
      onClose();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update system role",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Role Based Access Control"
      open={visible}
      onCancel={onClose}
      destroyOnClose
      width={600}
      footer={null}
      className="font-poppins"
      classNames={{ header: "!pb-2", content: "!p-6" }}
    >
      <div className="font-poppins">
        <p className="mb-6 text-sm leading-6 text-gray-500">
          Update this user's system role and access level.
        </p>
        <Alert
          message="Role Based Access Control Warning"
          description="Altering this role grants access and permissions mapped to protected system routes. Proceed carefully."
          type="warning"
          showIcon
          className="!mb-6 !rounded-xl !border-orange-200 !bg-orange-50"
        />
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <Text className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Target Personnel
          </Text>
          <Text className="mt-2 block font-semibold text-gray-900">
            {targetUser.name}
          </Text>
          <Text className="block font-mono text-xs text-gray-500">
            {targetUser.email}
          </Text>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: targetUser.role }}
        >
          <Form.Item
            name="role"
            label={
              <span className="font-medium text-gray-700">System Role</span>
            }
            rules={[
              {
                required: true,
                message: "Select a valid authorization ladder",
              },
            ]}
            className="mb-0"
          >
            <Select
              size="large"
              className="custom-select"
              classNames={{ popup: { root: 'rounded-xl' } }}
              options={[
                { value: "customer", label: "Level 0: Customer" },
                { value: "polytunnelManager", label: "Level 1: Polytunnel Manager" },
                { value: "inventoryManager", label: "Level 1: Inventory Manager" },
                { value: "orderManager", label: "Level 1: Order Dispatch Manager" },
                { value: "userCustomerManager", label: "Level 2: User/HR Manager" },
                { value: "admin", label: "Level 9:Admin" },
              ]}
            />
          </Form.Item>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              onClick={onClose}
              className="!h-11 !rounded-xl !border-gray-200 !px-6 !font-medium !text-gray-700 !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="!h-11 !rounded-xl !border-0 !bg-red-600 !px-8 !font-medium !shadow-sm hover:!bg-red-700"
            >
              Confirm Role Update
            </Button>
          </div>
        </Form>
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
          border-color: rgb(239 68 68) !important;
        }

        .custom-select .ant-select-selection-placeholder,
        .custom-select .ant-select-selection-item {
          line-height: 42px !important;
        }
      `}</style>
    </Modal>
  );
};

export default UserRoleModal;
