import React, { useState } from "react";
import {
  Drawer,
  Typography,
  Card,
  Steps,
  Divider,
  Select,
  message,
  Tag,
  Avatar,
} from "antd";
import {
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { updateOrderStatus } from "../../api/ordersApi";
import { useAuth } from "../../context/AuthContext";
import { DateTime } from "luxon";

const { Title, Text } = Typography;

const OrderDetailsDrawer = ({ visible, onClose, order }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order?.status);

  React.useEffect(() => {
    if (order) setCurrentStatus(order.status);
  }, [order]);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await updateOrderStatus(order._id, { status: newStatus }, config);
      setCurrentStatus(newStatus);
      message.success(`Order successfully transitioned to ${newStatus}`);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
  const stepIndex =
    statuses.indexOf(currentStatus) === -1
      ? 0
      : statuses.indexOf(currentStatus);

  const statusConfig = {
    Pending: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "Pending",
    },
    Processing: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      label: "Processing",
    },
    Shipped: {
      color: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      label: "Shipped",
    },
    Delivered: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "Delivered",
    },
    Cancelled: {
      color: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      label: "Cancelled",
    },
  };

  const activeStatus = statusConfig[currentStatus] || statusConfig.Pending;

  return (
    <Drawer
      title={null}
      size="large"
      onClose={onClose}
      open={visible}
      className="[&_.ant-drawer-body]:bg-slate-100 [&_.ant-drawer-body]:p-0 [&_.ant-drawer-header]:hidden"
    >
      <div className="min-h-full bg-gradient-to-br from-slate-100 via-white to-slate-100 font-poppins">
        <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Order Details
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${activeStatus.color}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${activeStatus.dot}`}
                    />
                    {activeStatus.label}
                  </div>
                </div>

                <Title level={3} className="!mb-1 !text-slate-900">
                  Order Receipt
                </Title>

                <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Text className="!text-sm !text-slate-500">
                    <span className="font-medium text-slate-700">
                      Order ID:
                    </span>{" "}
                    {order._id}
                  </Text>
                  <Text className="!text-sm !text-slate-500">
                    <span className="font-medium text-slate-700">
                      Customer:
                    </span>{" "}
                    {order.user?.fullName || "N/A"}
                  </Text>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Total Rs.
                  </div>
                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {order.totalPrice.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Items
                  </div>
                  <div className="mt-1 text-lg font-bold text-slate-900">
                    {order.orderItems?.length || 0}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Payment
                  </div>
                  <div className="mt-1 text-sm font-bold">
                    {order.isPaid ? (
                      <span className="text-emerald-600">Paid</span>
                    ) : (
                      <span className="text-red-500">Unpaid</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Update Fulfillment Status
                    </div>
                    <Select
                      value={currentStatus}
                      onChange={handleStatusChange}
                      style={{ width: "100%" }}
                      loading={loading}
                      disabled={
                        currentStatus === "Delivered" ||
                        currentStatus === "Cancelled"
                      }
                      size="large"
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Processing", label: "Processing" },
                        { value: "Shipped", label: "Shipped" },
                        { value: "Delivered", label: "Delivered" },
                        { value: "Cancelled", label: "Cancel Order" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {currentStatus === "Cancelled" ? (
            <div className="overflow-hidden rounded-[28px] border border-red-200 bg-gradient-to-br from-red-50 to-white shadow-sm">
              <div className="px-6 py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <CloseCircleOutlined className="text-3xl text-red-500" />
                </div>
                <h2 className="m-0 text-2xl font-semibold text-red-700">
                  Order Cancelled
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-red-500">
                  This transaction was cancelled and is no longer eligible for
                  fulfillment.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <FileTextOutlined />
                  </div>
                  <div>
                    <Title level={5} className="!mb-0 !text-slate-900">
                      Fulfillment Timeline
                    </Title>
                    <Text className="!text-sm !text-slate-500">
                      Track the current delivery lifecycle of this order.
                    </Text>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <Steps
                  current={stepIndex}
                  responsive
                  items={[
                    { title: "Pending", icon: <ClockCircleOutlined /> },
                    {
                      title: "Processing",
                      icon: (
                        <SyncOutlined spin={currentStatus === "Processing"} />
                      ),
                    },
                    { title: "Shipped", icon: <CarOutlined /> },
                    { title: "Delivered", icon: <CheckCircleOutlined /> },
                  ]}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CreditCardOutlined />
                  </div>
                  <div>
                    <Title level={5} className="!mb-0 !text-slate-900">
                      Billing Summary
                    </Title>
                    <Text className="!text-sm !text-slate-500">
                      Final price breakdown for this order.
                    </Text>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-500">
                    <Text>Subtotal</Text>
                    <Text>Rs.{order.itemsPrice.toFixed(2)}</Text>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <Text>Shipping</Text>
                    <Text>Rs.{order.shippingPrice.toFixed(2)}</Text>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <Text>Tax</Text>
                    <Text>Rs.{order.taxPrice.toFixed(2)}</Text>
                  </div>
                  <Divider className="!my-3" />
                  <div className="flex items-center justify-between">
                    <Text strong className="!text-base !text-slate-900">
                      Total
                    </Text>
                    <Text strong className="!text-xl !text-emerald-600">
                      Rs.{order.totalPrice.toFixed(2)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              size="small"
              className="!overflow-hidden !rounded-[28px] !border-slate-200 !p-0 !shadow-sm"
              bodyStyle={{ padding: 0 }}
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    size={44}
                    icon={<UserOutlined />}
                    className="!bg-blue-50 !text-blue-600"
                  />
                  <div>
                    <Title level={5} className="!mb-0 !text-slate-900">
                      Customer Identity
                    </Title>
                    <Text className="!text-sm !text-slate-500">
                      Buyer contact information
                    </Text>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <Text className="block text-base font-semibold text-slate-900">
                  {order.user?.fullName}
                </Text>
                <Text className="mt-1 block text-sm text-slate-500">
                  {order.user?.email}
                </Text>
              </div>
            </Card>

            <Card
              size="small"
              className="!overflow-hidden !rounded-[28px] !border-slate-200 !p-0 !shadow-sm"
              bodyStyle={{ padding: 0 }}
            >
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    size={44}
                    icon={<EnvironmentOutlined />}
                    className="!bg-orange-50 !text-orange-600"
                  />
                  <div>
                    <Title level={5} className="!mb-0 !text-slate-900">
                      Shipping Destination
                    </Title>
                    <Text className="!text-sm !text-slate-500">
                      Delivery address information
                    </Text>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <Text className="block text-base font-semibold text-slate-900">
                  {order.shippingAddress?.address}
                </Text>
                <Text className="mt-1 block text-sm text-slate-500">
                  {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.postalCode}
                </Text>
                <Text className="mt-1 block text-sm text-slate-500">
                  {order.shippingAddress?.country}
                </Text>
              </div>
            </Card>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <ShoppingOutlined />
                </div>
                <div>
                  <Title level={5} className="!mb-0 !text-slate-900">
                    Cargo Manifest
                  </Title>
                  <Text className="!text-sm !text-slate-500">
                    Complete breakdown of all items included in this order.
                  </Text>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-slate-900">
                        {item.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Quantity:{" "}
                        <span className="font-medium text-slate-700">
                          {item.qty}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Unit Price:{" "}
                        <span className="font-medium text-slate-700">
                          Rs.{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left md:min-w-[180px] md:text-right">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Line Total
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      Rs.{(item.qty * item.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default OrderDetailsDrawer;
