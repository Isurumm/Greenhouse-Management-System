import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardAnalytics } from '../api/adminApi';
import SummaryCard from '../components/admin/SummaryCard';

const { Title, Text } = Typography;

const dayOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

const statusTag = (status) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border';
  if (status === 'Delivered') return <span className={`${base} bg-[#F0FFF1] text-[#004B23] border-[#70E000]`}>Delivered</span>;
  if (status === 'Shipped') return <span className={`${base} bg-blue-50 text-blue-700 border-blue-300`}>Shipped</span>;
  if (status === 'Processing') return <span className={`${base} bg-amber-50 text-amber-700 border-amber-300`}>Processing</span>;
  if (status === 'Pending') return <span className={`${base} bg-gray-100 text-gray-600 border-gray-300`}>Pending</span>;
  if (status === 'Cancelled') return <span className={`${base} bg-red-50 text-red-600 border-red-300`}>Cancelled</span>;
  return <span className={`${base} bg-gray-100 text-gray-600 border-gray-300`}>{status}</span>;
};

const roleLabelMap = {
  admin: 'Admin',
  customer: 'Customers',
  polytunnelManager: 'Polytunnel Managers',
  inventoryManager: 'Inventory Managers',
  orderManager: 'Order Managers',
  userCustomerManager: 'User/Customer Managers',
};

const roleModules = {
  admin: ['polytunnel', 'inventory', 'orders', 'usersDelivery'],
  polytunnelManager: ['polytunnel'],
  inventoryManager: ['inventory'],
  orderManager: ['orders'],
  userCustomerManager: ['usersDelivery'],
};

/* ── Section Header ──────────────────────────────────────────────── */
const SectionHeader = ({ title, action, actionLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-[#70E000] inline-block" />
      <h3 className="text-sm font-bold text-[#004B23] uppercase tracking-widest">{title}</h3>
    </div>
    {action && (
      <button
        onClick={action}
        className="text-xs font-semibold text-[#004B23] hover:text-[#70E000] underline underline-offset-2 transition-colors"
      >
        {actionLabel} →
      </button>
    )}
  </div>
);

/* ── Panel ───────────────────────────────────────────────────────── */
const Panel = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#e8f5e9] rounded-2xl shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

/* ── Pill Tag ────────────────────────────────────────────────────── */
const Pill = ({ color = 'green', children }) => {
  const map = {
    green: 'bg-[#F0FFF1] text-[#004B23] border-[#70E000]/40',
    lime: 'bg-[#f7ffe0] text-[#3a6800] border-[#CCFF33]/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-300',
    red: 'bg-red-50 text-red-600 border-red-300',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-500 border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[color] || map.green}`}>
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [dashboard, setDashboard] = useState(null);

  const fetchDashboard = async (selectedDays) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await getDashboardAnalytics(config, selectedDays);
      setDashboard(data);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(days); }, [user, days]);

  const visibleModules = useMemo(() => new Set(roleModules[user?.role] || []), [user]);
  const canSee = (moduleName) => visibleModules.has(moduleName);

  const summaryCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      { key: 'tunnels', module: 'polytunnel', title: 'Total Polytunnels', value: dashboard.polytunnels.total, icon: <AppstoreOutlined />, extra: `${dashboard.polytunnels.statusCounts.Active} active structures` },
      { key: 'employees', module: 'polytunnel', title: 'Tunnel Employees', value: dashboard.polytunnels.employees.total, icon: <UserOutlined />, extra: `${dashboard.polytunnels.employees.unassigned} unassigned` },
      { key: 'products', module: 'inventory', title: 'Products', value: dashboard.products.total, icon: <InboxOutlined />, extra: `${dashboard.products.lowStock} low stock` },
      { key: 'orders', module: 'orders', title: 'Total Orders', value: dashboard.orders.total, icon: <ShoppingOutlined />, extra: `${dashboard.orders.today} placed today` },
      { key: 'ordersAction', module: 'orders', title: 'Orders Waiting Action', value: dashboard.alerts.pendingOrProcessingOrders, icon: <ExclamationCircleOutlined />, extra: 'pending + processing' },
      { key: 'revenue', module: 'orders', title: 'Paid Revenue', value: dashboard.orders.revenuePaid, precision: 2, prefix: 'Rs.', icon: <ShoppingOutlined />, extra: `${dashboard.orders.paid} paid orders` },
      { key: 'users', module: 'usersDelivery', title: 'Total Users', value: dashboard.users.total, icon: <UserOutlined />, extra: `${dashboard.users.byRole.customer} customers` },
      { key: 'drivers', module: 'usersDelivery', title: 'Total Drivers', value: dashboard.deliveries.drivers.total, icon: <CarOutlined />, extra: `${dashboard.deliveries.drivers.available} available` },
      { key: 'vehicles', module: 'usersDelivery', title: 'Total Vehicles', value: dashboard.deliveries.vehicles.total, icon: <CarOutlined />, extra: `${dashboard.deliveries.vehicles.active} active` },
    ].filter((c) => canSee(c.module));
  }, [dashboard, visibleModules]);

  const monthlyMax = Math.max(...(dashboard?.orders.monthlyTrend || []).map((m) => m.count), 1);

  /* ── Table columns ────────────────────────────────────────────── */
  const recentOrdersColumns = [
    { title: 'Order ID', dataIndex: '_id', key: 'id', render: (id) => <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{id?.slice(-8)}</span> },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', render: (n) => <span className="font-semibold text-[#004B23] text-sm">{n}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => statusTag(s) },
    { title: 'Payment', dataIndex: 'isPaid', key: 'isPaid', render: (p) => p ? <Pill color="green">Paid</Pill> : <Pill color="red">Unpaid</Pill> },
    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', render: (t) => <span className="font-bold text-[#004B23]">Rs.{Number(t || 0).toFixed(2)}</span> },
    { title: 'Placed', dataIndex: 'createdAt', key: 'createdAt', render: (v) => <span className="text-xs text-gray-400">{DateTime.fromISO(v).toFormat('MMM dd, HH:mm')}</span> },
  ];

  const lowStockColumns = [
    { title: 'Product', dataIndex: 'name', key: 'name', render: (n) => <span className="font-semibold text-[#004B23] text-sm">{n}</span> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c) => <Pill color="blue">{c}</Pill> },
    {
      title: 'Stock', key: 'stock',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${row.countInStock <= 0 ? 'bg-red-500' : 'bg-amber-400'}`} />
          <span className="font-semibold text-sm">{row.countInStock}</span>
          <span className="text-xs text-gray-400">/ min {row.minStockLevel}</span>
        </div>
      ),
    },
  ];

  const recentCustomersColumns = [
    { title: 'Customer', dataIndex: 'fullName', key: 'fullName', render: (n) => <span className="font-semibold text-[#004B23] text-sm">{n}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (e) => <span className="text-xs text-gray-400">{e}</span> },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (a) => a ? <Pill color="green">Active</Pill> : <Pill color="gray">Inactive</Pill> },
    { title: 'Joined', dataIndex: 'createdAt', key: 'createdAt', render: (d) => <span className="text-xs text-gray-400">{DateTime.fromISO(d).toFormat('MMM dd, yyyy')}</span> },
  ];

  const recentHarvestColumns = [
    { title: 'Tunnel', dataIndex: 'tunnelName', key: 'tunnelName', render: (v) => <span className="font-semibold text-[#004B23] text-sm">{v}</span> },
    { title: 'Product', dataIndex: 'productName', key: 'productName', render: (v) => <span className="text-sm text-gray-600">{v}</span> },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (q) => <Pill color="lime">+{q} kg</Pill> },
    { title: 'Logged At', dataIndex: 'createdAt', key: 'createdAt', render: (d) => <span className="text-xs text-gray-400">{DateTime.fromISO(d).toFormat('MMM dd, HH:mm')}</span> },
  ];

  const inventoryTxColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Pill color={t === 'Stock Out' ? 'red' : 'blue'}>{t}</Pill> },
    { title: 'Product', dataIndex: 'productName', key: 'productName', render: (v) => <span className="font-semibold text-[#004B23] text-sm">{v}</span> },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', render: (q) => <span className={`font-bold text-sm ${q >= 0 ? 'text-[#31CB00]' : 'text-red-500'}`}>{q >= 0 ? `+${q}` : q}</span> },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (d) => <span className="text-xs text-gray-400">{DateTime.fromISO(d).toFormat('MMM dd, HH:mm')}</span> },
  ];

  const recentAssignmentColumns = [
    { title: 'Order', dataIndex: '_id', key: '_id', render: (id) => <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{id?.slice(-8)}</span> },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', render: (v) => <span className="font-semibold text-[#004B23] text-sm">{v}</span> },
    { title: 'Driver', dataIndex: 'driverName', key: 'driverName', render: (v) => <Pill color="blue">{v}</Pill> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => statusTag(s) },
  ];

  /* ── Ant Design token overrides via inline style ──────────────── */
  const tableProps = {
    pagination: false,
    size: 'small',
    className: 'agri-table',
    style: { '--ant-table-header-bg': '#F0FFF1', '--ant-table-row-hover-bg': '#f7ffe8' },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F0FFF1] flex items-center justify-center animate-pulse">
          <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
            <path d="M5 35 C5 35 12 10 35 5 C35 5 28 30 5 35Z" fill="#004B23" />
            <path d="M20 20 L35 5" stroke="#70E000" strokeWidth="2" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[#004B23] tracking-wide">Loading data…</span>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-500 font-medium">Dashboard data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* ── Global Style Injection ───────────────────────────────── */}
      <style>{`
        .agri-table .ant-table-thead > tr > th {
          background: #F0FFF1 !important;
          color: #004B23 !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid #d4f0d4 !important;
        }
        .agri-table .ant-table-tbody > tr:hover > td {
          background: #f7ffe8 !important;
        }
        .agri-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f7f0 !important;
          padding: 10px 12px !important;
        }
        .agri-table .ant-table { border-radius: 12px !important; overflow: hidden; }
        .agri-select .ant-select-selector {
          border-color: #d4f0d4 !important;
          border-radius: 10px !important;
          background: white !important;
        }
        .ant-progress-bg { background: #70E000 !important; }
        .agri-alert.ant-alert {
          border-radius: 14px !important;
          border-color: #CCFF33 !important;
          background: #f7ffe0 !important;
        }
      `}</style>

      <div className=" mx-auto px-4 py-4 space-y-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#004B23] px-8 py-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between shadow-lg">
          {/* decorative leaves */}
          <div className="pointer-events-none absolute right-0 top-0 opacity-10 w-52 h-full flex items-center justify-end pr-4">
            <svg viewBox="0 0 120 120" fill="none" className="w-44">
              <path d="M10 110 C10 110 35 20 110 10 C110 10 90 90 10 110Z" fill="#CCFF33" />
              <path d="M60 60 L110 10" stroke="#CCFF33" strokeWidth="2" />
              <path d="M30 85 C30 85 55 40 95 30" stroke="#70E000" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#CCFF33] text-xs font-bold tracking-[0.15em] uppercase">Operations Command Center</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              Welcome back, <span className="text-[#70E000]">{user?.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 z-10">
            <span className="text-green-300/70 text-sm font-medium">Time Range</span>
            <Select
              value={days}
              style={{ width: 155 }}
              options={dayOptions}
              onChange={setDays}
              className="agri-select"
              classNames={{ popup: { root: 'agri-select-popup' } }}
            />
          </div>
        </div>

        {/* ── Summary Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {summaryCards.map(({ key, ...cardProps }) => (
            <SummaryCard key={key} {...cardProps} />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            ORDERS MODULE
        ══════════════════════════════════════════════════════════ */}
        {canSee('orders') && (
          <div className="space-y-4">
            {/* Trend + Status Mix */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              {/* Trend */}
              <Panel className="xl:col-span-3">
                <SectionHeader title="Order & Revenue Trend (Last 6 Months)" />
                <div className="space-y-3">
                  {dashboard.orders.monthlyTrend.map((month) => {
                    const pct = Math.round((month.count / monthlyMax) * 100);
                    return (
                      <div key={month.key} className="flex items-center gap-3">
                        <span className="w-8 text-xs text-gray-400 text-right shrink-0">{month.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-[#F0FFF1] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#004B23] to-[#70E000] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#004B23] w-16 text-right">{month.count} ord.</span>
                        <span className="text-xs font-bold text-[#31CB00] w-16 text-right">Rs.{month.revenue.toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Status Mix */}
              <Panel className="xl:col-span-2">
                <SectionHeader title="Order Status Mix" />
                <div className="space-y-3">
                  {Object.entries(dashboard.orders.statusCounts).map(([key, count]) => {
                    const pct = dashboard.orders.total ? Math.round((count / dashboard.orders.total) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 font-medium">{key}</span>
                          <span className="text-xs font-bold text-[#004B23]">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F0FFF1] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#70E000] to-[#CCFF33]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>

            {/* Recent Orders Table */}
            <Panel>
              <SectionHeader title="Recent Orders" action={() => navigate('/admin/orders')} actionLabel="Open Orders Module" />
              <Table
                columns={recentOrdersColumns}
                dataSource={dashboard.orders.recent}
                rowKey="_id"
                {...tableProps}
              />
            </Panel>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            INVENTORY MODULE
        ══════════════════════════════════════════════════════════ */}
        {canSee('inventory') && (
          // Grid appears as 2 colunmns
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel>
              <SectionHeader title="Low / Out of Stock Products" action={() => navigate('/admin/inventory')} actionLabel="Open Inventory" />
              <Table
                columns={lowStockColumns}
                dataSource={[...dashboard.products.lowStockItems, ...dashboard.products.outOfStockItems]}
                rowKey="_id"
                pagination={{ pageSize: 6, size: 'small' }}
                {...tableProps}
              />
            </Panel>
            <Panel>
              <SectionHeader title="Recent Inventory Transactions" />
              <Table
                columns={inventoryTxColumns}
                dataSource={dashboard.inventory.recentTransactions}
                rowKey="_id"
                {...tableProps}
              />
            </Panel>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            POLYTUNNEL MODULE
        ══════════════════════════════════════════════════════════ */}
        {canSee('polytunnel') && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Ops overview */}
            <Panel className="xl:col-span-2">
              <SectionHeader title="Polytunnel Operations Overview" />
              <div className="space-y-2">
                {[
                  { label: 'Active Tunnels', value: dashboard.polytunnels.statusCounts.Active, color: 'bg-[#F0FFF1]', pill: 'green' },
                  { label: 'Maintenance Tunnels', value: dashboard.polytunnels.statusCounts.Maintenance, color: 'bg-amber-50', pill: 'amber' },
                  { label: `Harvest Quantity (${days}d)`, value: dashboard.polytunnels.harvest.quantityInRange, color: 'bg-blue-50', pill: 'blue' },
                ].map(({ label, value, color, pill }) => (
                  <div key={label} className={`flex items-center justify-between rounded-xl ${color} px-4 py-3`}>
                    <span className="text-sm text-gray-700 font-medium">{label}</span>
                    <Pill color={pill}>{label.includes('Harvest') ? `${value} Kg` : value}</Pill>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Recent harvests */}
            <Panel className="xl:col-span-3">
              <SectionHeader title="Recent Harvest Activity" action={() => navigate('/admin/polytunnels')} actionLabel="Open Polytunnels" />
              <Table
                columns={recentHarvestColumns}
                dataSource={dashboard.polytunnels.harvest.recentHarvests}
                rowKey="_id"
                {...tableProps}
              />
            </Panel>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            USERS & DELIVERY MODULE
        ══════════════════════════════════════════════════════════ */}
        {canSee('usersDelivery') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Users by Role */}
              <Panel>
                <SectionHeader title="Users by Role" />
                <div className="space-y-2">
                  {Object.entries(dashboard.users.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between rounded-xl border border-[#e8f5e9] px-4 py-2.5">
                      <span className="text-sm text-gray-700 font-medium">{roleLabelMap[role] || role}</span>
                      <Pill color="lime">{count}</Pill>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Delivery Capacity */}
              <Panel>
                <SectionHeader title="Delivery Capacity Snapshot" />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[
                    { label: 'Drivers Available', value: dashboard.deliveries.drivers.available, accent: 'text-[#31CB00]' },
                    { label: 'Drivers On Route', value: dashboard.deliveries.drivers.onRoute, accent: 'text-blue-600' },
                    { label: 'Vehicles Active', value: dashboard.deliveries.vehicles.active, accent: 'text-[#004B23]' },
                    { label: 'Vehicles Maintenance', value: dashboard.deliveries.vehicles.maintenance, accent: 'text-amber-600' },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="rounded-xl bg-[#F0FFF1] border border-[#e8f5e9] p-4">
                      <div className={`text-3xl font-bold font-poppins ${accent}`}>{value}</div>
                      <div className="text-xs text-gray-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              <Panel className="xl:col-span-3">
                <SectionHeader title="Recent Deliveries" action={() => navigate('/admin/deliveries')} actionLabel="Open Deliveries" />
                <Table columns={recentAssignmentColumns} dataSource={dashboard.deliveries.recentAssignments} rowKey="_id" {...tableProps} />
              </Panel>
              <Panel className="xl:col-span-2">
                <SectionHeader title="Recent Registered Customers" action={() => navigate('/admin/users')} actionLabel="Open Users" />
                <Table columns={recentCustomersColumns} dataSource={dashboard.users.recentCustomers} rowKey="_id" {...tableProps} />
              </Panel>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            ADMIN-ONLY: Alerts + Quick Actions
        ══════════════════════════════════════════════════════════ */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Operational Alerts */}
            <Panel>
              <SectionHeader title="Alerts" />
              <div className="space-y-2">
                {[
                  { label: 'Out of stock items', value: dashboard.alerts.outOfStockCount, bg: 'bg-red-50', pill: 'red' },
                  { label: 'Low stock items', value: dashboard.alerts.lowStockCount, bg: 'bg-amber-50', pill: 'amber' },
                  { label: 'Unpaid orders', value: dashboard.alerts.unpaidOrders, bg: 'bg-orange-50', pill: 'amber' },
                  { label: 'Tunnels in maintenance', value: dashboard.alerts.maintenanceTunnels, bg: 'bg-blue-50', pill: 'blue' },
                  { label: 'Unassigned workers', value: dashboard.alerts.unassignedEmployees, bg: 'bg-purple-50', pill: 'purple' },
                ].map(({ label, value, bg, pill }) => (
                  <div key={label} className={`flex items-center justify-between rounded-xl ${bg} px-4 py-3`}>
                    <span className="text-sm text-gray-700 font-medium">{label}</span>
                    <Pill color={pill}>{value}</Pill>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;