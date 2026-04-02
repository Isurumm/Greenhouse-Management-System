import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, message, Badge, Input, Select, DatePicker, Space } from 'antd';
import {
  EyeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { getAllOrders } from '../../api/ordersApi';
import { useAuth } from '../../context/AuthContext';
import { DateTime } from 'luxon';
import OrderDetailsDrawer from '../../components/admin/OrderDetailsDrawer';
import SummaryCard from '../../components/admin/SummaryCard';
import { generateOrderReport } from '../../utils/orderReportGenerator';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await getAllOrders(config);
      setOrders(data);
    } catch (error) {
      message.error('Failed to grab global order list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // Filter orders based on applied filters
  const getFilteredOrders = () => {
    return orders.filter((order) => {
      // Search filter (by customer name or order ID)
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesCustomer = order.user?.fullName
          ?.toLowerCase()
          .includes(searchLower);
        const matchesOrderId = order._id
          .toLowerCase()
          .includes(searchLower);
        if (!matchesCustomer && !matchesOrderId) return false;
      }

      // Status filter
      if (statusFilter && order.status !== statusFilter) return false;

      // Payment filter
      if (paymentFilter !== null && order.isPaid !== paymentFilter) return false;

      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const createdDate = DateTime.fromISO(order.createdAt);
        const startDate = dayjs(dateRange[0]).toDate();
        const endDate = dayjs(dateRange[1]).toDate();
        const orderDate = createdDate.toJSDate();
        if (orderDate < startDate || orderDate > endDate) return false;
      }

      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: 'id',
      render: (id) => (
        <span className="font-mono text-xs text-gray-400">{id}</span>
      ),
    },
    {
      title: 'Customer',
      key: 'user',
      render: (_, record) => (
        <span className="font-semibold text-gray-900">
          {record.user?.fullName || 'Unknown'}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-gray-600 text-sm">
          {DateTime.fromISO(date).toFormat('MMM dd, yyyy HH:mm')}
        </span>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total) => (
        <span className="font-semibold text-gray-900">
          Rs.{total?.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: 'Payment',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (isPaid) =>
        isPaid ? (
          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 border border-green-100">
            Paid
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-100">
            Not Paid
          </span>
        ),
      filters: [
        { text: 'Paid', value: true },
        { text: 'Not Paid', value: false },
      ],
      onFilter: (value, record) => record.isPaid === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let style =
          'bg-gray-100 text-gray-600 border-gray-200';
        if (status === 'Processing')
          style = 'bg-blue-50 text-blue-600 border-blue-100';
        if (status === 'Shipped')
          style = 'bg-yellow-50 text-yellow-600 border-yellow-100';
        if (status === 'Delivered')
          style = 'bg-green-50 text-green-600 border-green-100';
        if (status === 'Cancelled')
          style = 'bg-red-50 text-red-600 border-red-100';

        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${style}`}>
            {status}
          </span>
        );
      },
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Processing', value: 'Processing' },
        { text: 'Shipped', value: 'Shipped' },
        { text: 'Delivered', value: 'Delivered' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="default"
          icon={<EyeOutlined />}
          size="small"
          className="rounded-lg border-gray-200"
          onClick={() => {
            setSelectedOrder(record);
            setDrawerVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const pendingCount = filteredOrders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing'
  ).length;
  const completedCount = filteredOrders.filter(
    (o) => o.status === 'Delivered'
  ).length;
  const unpaidCount = filteredOrders.filter((o) => !o.isPaid).length;
  const totalRevenue = filteredOrders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setPaymentFilter(null);
    setDateRange(null);
    message.success('Filters cleared');
  };

  // Generate report with current filtered data
  const handleGenerateReport = () => {
    if (filteredOrders.length === 0) {
      message.warning('No orders to generate report');
      return;
    }

    const filters = {
      searchText,
      statusFilter,
      paymentFilter,
      dateRange: dateRange
        ? `${dayjs(dateRange[0]).format('MMM DD, YYYY')} - ${dayjs(dateRange[1]).format('MMM DD, YYYY')}`
        : null,
    };

    try {
      generateOrderReport({
        orders: filteredOrders,
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Order Management
        </h1>
        <p className="text-sm text-gray-500">
          Monitor transactions and track fulfillment progress.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={<ShoppingOutlined />}
          title="Total Orders"
          value={filteredOrders.length}
          extra="all transactions"
        />
        <SummaryCard
          icon={<ClockCircleOutlined />}
          title="Waiting Action"
          value={pendingCount}
          extra="pending + processing"
        />
        <SummaryCard
          icon={<CheckCircleOutlined />}
          title="Delivered"
          value={completedCount}
          extra="completed orders"
        />
        <SummaryCard
          icon={<DollarOutlined />}
          title="Paid Revenue"
          value={totalRevenue}
          precision={2}
          prefix="Rs."
          extra={`${unpaidCount} unpaid orders`}
        />
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Search & Filter Orders
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Search by customer name or order ID"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg"
            size="middle"
          />

          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            className="w-full"
            options={[
              { label: 'Pending', value: 'Pending' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
          />

          <Select
            placeholder="Filter by Payment"
            value={paymentFilter}
            onChange={setPaymentFilter}
            allowClear
            className="w-full"
            options={[
              { label: 'Paid', value: true },
              { label: 'Not Paid', value: false },
            ]}
          />

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="MMM DD, YYYY"
            className="w-full rounded-lg"
          />

          <Space className="w-full justify-center md:justify-end">
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              className="rounded-lg"
            >
              Clear
            </Button>
            <Button
              icon={<FileTextOutlined />}
              type="primary"
              onClick={handleGenerateReport}
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Report
            </Button>
          </Space>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 12 }}
          className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50"
        />
      </div>

      <OrderDetailsDrawer
        visible={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          fetchOrders();
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default Orders;