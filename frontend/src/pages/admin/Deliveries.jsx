import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Table,
  Badge,
  message,
  Input,
  Select,
  DatePicker,
  Space,
} from "antd";
import {
  CarOutlined,
  IdcardOutlined,
  SendOutlined,
  FileTextOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import {
  getVehicles,
  getDrivers,
  getPendingOrders,
} from "../../api/deliveriesApi";
import { useAuth } from "../../context/AuthContext";
import { DateTime } from "luxon";
import dayjs from "dayjs";

import VehicleManager from "../../components/admin/VehicleManager";
import DriverManager from "../../components/admin/DriverManager";
import DispatchModal from "../../components/admin/DispatchModal";
import SummaryCard from "../../components/admin/SummaryCard";
import { generateDeliveryReport } from "../../utils/deliveryReportGenerator";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Deliveries = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dispatchOrders, setDispatchOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [vehicleVisible, setVehicleVisible] = useState(false);
  const [driverVisible, setDriverVisible] = useState(false);
  const [dispatchVisible, setDispatchVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [driverFilter, setDriverFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [vRes, dRes, oRes] = await Promise.all([
        getVehicles(config),
        getDrivers(config),
        getPendingOrders(config),
      ]);
      setVehicles(vRes.data);
      setDrivers(dRes.data);
      setDispatchOrders(oRes.data);
    } catch (error) {
      message.error("Failed to grab delivery logistics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [user]);

  // Filter orders based on applied filters
  const getFilteredOrders = () => {
    return dispatchOrders.filter((order) => {
      // Search filter (by order ID, customer name, or destination)
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesOrderId = order._id.toLowerCase().includes(searchLower);
        const matchesCustomer = order.user?.fullName
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDestination =
          `${order.shippingAddress?.city}${order.shippingAddress?.postalCode}`
            .toLowerCase()
            .includes(searchLower);
        if (!matchesOrderId && !matchesCustomer && !matchesDestination)
          return false;
      }

      // Status filter
      if (statusFilter && order.status !== statusFilter) return false;

      // Driver filter
      if (driverFilter && !order.assignedDriver) return false;
      if (driverFilter && order.assignedDriver?._id !== driverFilter)
        return false;

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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter(null);
    setDriverFilter(null);
    setDateRange(null);
    message.success("Filters cleared");
  };

  // Generate report with current filtered data
  const handleGenerateReport = () => {
    if (filteredOrders.length === 0) {
      message.warning("No orders to generate report");
      return;
    }

    const filters = {
      searchText,
      statusFilter,
      driverFilter: driverFilter
        ? drivers.find((d) => d._id === driverFilter)?.fullName
        : null,
      dateRange: dateRange
        ? `${dayjs(dateRange[0]).format("MMM DD, YYYY")} - ${dayjs(dateRange[1]).format("MMM DD, YYYY")}`
        : null,
    };

    try {
      generateDeliveryReport({
        orders: filteredOrders,
        drivers,
        vehicles,
        generatedAt: new Date().toLocaleString(),
        appliedFilters: filters,
      });
      message.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      message.error("Failed to generate report");
    }
  };

  const orderColumns = [
    {
      title: "Order",
      dataIndex: "_id",
      key: "id",
      render: (t) => (
        <span className="font-mono text-xs text-gray-700">{t}</span>
      ),
    },
    {
      title: "Destination",
      key: "location",
      render: (_, r) => (
        <span className="text-sm text-gray-700">
          {r.shippingAddress?.city}, {r.shippingAddress?.postalCode}
        </span>
      ),
    },
    {
      title: "Courier",
      key: "courier",
      render: (_, r) =>
        r.assignedDriver ? (
          <span className="font-semibold text-blue-600">
            {r.assignedDriver.fullName}
          </span>
        ) : (
          <span className="text-gray-400 italic text-sm">None Assigned</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "Processing")
          return (
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
              Awaiting Dispatch
            </span>
          );
        if (status === "Shipped")
          return (
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100">
              On Route
            </span>
          );
        if (status === "Delivered")
          return (
            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 border border-green-100">
              Delivered
            </span>
          );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.status === "Processing") {
          return (
            <Button
              type="primary"
              size="small"
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
              icon={<SendOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setDispatchVisible(true);
              }}
            >
              Assign
            </Button>
          );
        }
        return (
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">
            Dispatched
          </span>
        );
      },
    },
  ];

  const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
  const availableDrivers = drivers.filter(
    (d) => d.status === "Available",
  ).length;
  const awaitingDispatch = filteredOrders.filter(
    (o) => o.status === "Processing",
  ).length;

  return (
    <div className="min-h-[500px] rounded-2xl border border-gray-200 bg-gray-50/60 p-6 shadow-sm font-poppins">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Logistics & Dispatch Operations
        </h1>
        <p className="text-sm text-gray-500">
          Manage vehicles, drivers, and dispatch orders efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={<CarOutlined />}
          title="Total Vehicles"
          value={vehicles.length}
          extra={`${activeVehicles} active`}
        />
        <SummaryCard
          icon={<IdcardOutlined />}
          title="Total Drivers"
          value={drivers.length}
          extra={`${availableDrivers} available`}
        />
        <SummaryCard
          icon={<SendOutlined />}
          title="Awaiting Dispatch"
          value={awaitingDispatch}
          extra="processing orders"
        />
        <SummaryCard
          icon={<IdcardOutlined />}
          title="Delivered Orders"
          value={filteredOrders.length}
          extra="visible orders"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button
          type="primary"
          className="!h-10 !rounded-xl"
          onClick={() => setVehicleVisible(true)}
        >
          Manage Vehicles
        </Button>
        <Button
          type="default"
          className="!h-10 !rounded-xl "
          onClick={() => setDriverVisible(true)}
        >
          Manage Drivers
        </Button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Search & Filter Deliveries
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Search by order ID, customer or destination"
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
              { label: "Awaiting Dispatch", value: "Processing" },
              { label: "On Route", value: "Shipped" },
              { label: "Delivered", value: "Delivered" },
            ]}
          />

          <Select
            placeholder="Filter by Driver"
            value={driverFilter}
            onChange={setDriverFilter}
            allowClear
            className="w-full"
            options={drivers.map((d) => ({
              label: d.fullName,
              value: d._id,
            }))}
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

      <Table
        columns={orderColumns}
        dataSource={filteredOrders}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50"
      />

      <VehicleManager
        visible={vehicleVisible}
        onClose={() => {
          setVehicleVisible(false);
          fetchGlobalData();
        }}
        vehicles={vehicles}
      />

      <DriverManager
        visible={driverVisible}
        onClose={() => {
          setDriverVisible(false);
          fetchGlobalData();
        }}
        drivers={drivers}
        vehicles={vehicles}
      />

      {dispatchVisible && selectedOrder && (
        <DispatchModal
          visible={dispatchVisible}
          onClose={() => {
            setDispatchVisible(false);
            setSelectedOrder(null);
            fetchGlobalData();
          }}
          order={selectedOrder}
          drivers={drivers}
        />
      )}
    </div>
  );
};

export default Deliveries;
