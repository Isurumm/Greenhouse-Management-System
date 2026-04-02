import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  message,
  Alert,
  Descriptions,
} from "antd";
import { assignDispatch } from "../../api/deliveriesApi";
import { useAuth } from "../../context/AuthContext";

const DispatchModal = ({ visible, onClose, order, drivers }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await assignDispatch(
        {
          orderId: order._id,
          driverId: values.driverId,
        },
        config,
      );

      message.success("Dispatch officially recorded. Driver is now on route!");
      onClose();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to dispatch order",
      );
    } finally {
      setLoading(false);
    }
  };

  // Only show available and active drivers
  const availableDrivers = drivers.filter(
    (d) => d.status === "Available" && d.assignedVehicle,
  );

  return (
    <Modal
      title={
        <div className="text-xl font-bold">Initiate Physical Dispatch</div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Descriptions column={1} bordered size="small" className="mb-6 bg-white">
        <Descriptions.Item label="Postal Boundary">
          {order.shippingAddress?.postalCode}
        </Descriptions.Item>
        <Descriptions.Item label="Package Count">
          {order.orderItems?.length} Crates/Items
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="driverId"
          label="Select Ready Courier"
          rules={[{ required: true, message: "A courier must be selected" }]}
        >
          <Select
            size="large"
            placeholder="Scan available roster..."
            options={availableDrivers.map((d) => ({
              value: d._id,
              label: (
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold">{d.fullName}</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {d.assignedVehicle?.licensePlate}
                  </span>
                </div>
              ),
            }))}
          />
        </Form.Item>

        {availableDrivers.length === 0 && (
          <p className="text-red-500 text-sm mb-4 font-bold">
            No couriers are currently assigned to vehicles and available. Please
            check the Courier Directory.
          </p>
        )}

        <Button
          type="primary"
          htmlType="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 h-14 text-lg font-bold shadow-md"
          loading={loading}
          disabled={availableDrivers.length === 0}
        >
          Sign Dispatch Authorization
        </Button>
      </Form>
    </Modal>
  );
};

export default DispatchModal;
