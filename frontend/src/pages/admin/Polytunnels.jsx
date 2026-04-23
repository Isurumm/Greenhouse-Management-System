import React, { useState, useEffect } from "react";
import { Button, message, Typography, Empty, Spin, Input, Select, Space, Modal } from "antd";
import {
  PlusOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import {
  getPolytunnels,
  getTunnelEmployees,
  deletePolytunnel,
} from "../../api/polytunnelsApi";
import { useAuth } from "../../context/AuthContext";
import TunnelForm from "../../components/admin/TunnelForm";
import EmployeeManager from "../../components/admin/EmployeeManager";
import HarvestEntry from "../../components/admin/HarvestEntry";
import SummaryCard from "../../components/admin/SummaryCard";
import PolytunnelCard from "../../components/admin/PolytunnelCard";
import { generatePolytunnelReport } from "../../utils/reportGenerator";

const { Title, Text } = Typography;

const Polytunnels = () => {
  const [tunnels, setTunnels] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cropTypeFilter, setCropTypeFilter] = useState("");
  const [reportVisible, setReportVisible] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);

  // Modals state
  const [tunnelFormVisible, setTunnelFormVisible] = useState(false);
  const [employeeManagerVisible, setEmployeeManagerVisible] = useState(false);
  const [harvestVisible, setHarvestVisible] = useState(false);
  const [selectedTunnel, setSelectedTunnel] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [tunnelsRes, empRes] = await Promise.all([
        getPolytunnels(config),
        getTunnelEmployees(config),
      ]);
      setTunnels(tunnelsRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      message.error("Failed to fetch polytunnel data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await deletePolytunnel(id, config);
      message.success("Polytunnel removed");
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete tunnel");
    }
  };

  // Filter functions
  const getFilteredTunnels = () => {
    return tunnels.filter((tunnel) => {
      const matchesSearch =
        tunnel.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (tunnel.cropType &&
          tunnel.cropType.toLowerCase().includes(searchText.toLowerCase()));

      const matchesStatus = !statusFilter || tunnel.status === statusFilter;
      const matchesCropType =
        !cropTypeFilter || tunnel.cropType === cropTypeFilter;

      return matchesSearch && matchesStatus && matchesCropType;
    });
  };

  const getUniqueCropTypes = () => {
    const cropTypes = tunnels
      .map((t) => t.cropType)
      .filter((ct) => ct && ct.trim());
    return [...new Set(cropTypes)].sort();
  };

  const handleGenerateReport = async () => {
    setReportGenerating(true);
    try {
      const filteredTunnels = getFilteredTunnels();
      if (filteredTunnels.length === 0) {
        message.warning("No polytunnels to generate report");
        return;
      }

      const reportData = {
        tunnels: filteredTunnels,
        employees,
        generatedAt: new Date().toLocaleString(),
      };
      generatePolytunnelReport(reportData);
      message.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating polytunnel report:", error);
      message.error("Failed to generate report");
    } finally {
      setReportGenerating(false);
      setReportVisible(false);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setCropTypeFilter("");
  };

  const getEmployeesForTunnel = (tunnelId) => {
    if (!Array.isArray(employees)) return [];
    return employees.filter((e) => e.assignedTunnel?._id === tunnelId);
  };

  return (
    <div className="overflow-hidden font-poppins bg-white">
      <div className="border-b border-gray-100 bg-gradient-to-r from-white via-slate-50 to-white">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">
              Polytunnel Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage Tunnels, assign workers, and trigger harvests.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap xl:justify-end">
            <Button
              type="default"
              icon={<FileTextOutlined />}
              onClick={() => setReportVisible(true)}
              className="!h-11 !rounded-xl !border-gray-200 !px-5 !font-medium !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
            >
              Generate Report
            </Button>
            <Button
              type="default"
              icon={<UnorderedListOutlined />}
              onClick={() => setEmployeeManagerVisible(true)}
              className="!h-11 !rounded-xl !border-gray-200 !px-5 !font-medium !shadow-sm hover:!border-gray-300 hover:!text-gray-900"
            >
              Manage All Workers
            </Button>
            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedTunnel(null);
                setTunnelFormVisible(true);
              }}
            >
              Create New Tunnel
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<UnorderedListOutlined />}
            title="Total Tunnels"
            value={getFilteredTunnels().length}
            extra={`of ${tunnels.length} total`}
          />
          <SummaryCard
            icon={<TeamOutlined />}
            title="Active Tunnels"
            value={getFilteredTunnels().filter(t => t.status === "Active").length}
            extra={`${getFilteredTunnels().filter((t) => t.status === "Maintenance").length} in maintenance`}
          />
          <SummaryCard
            icon={<TeamOutlined />}
            title="Assigned Staff"
            value={employees.filter((e) => e.assignedTunnel).length}
            extra="currently assigned"
          />
          <SummaryCard
            icon={<TeamOutlined />}
            title="Unassigned Staff"
            value={employees.filter((e) => !e.assignedTunnel).length}
            extra="pending assignment"
          />
        </div>

        {/* Search and Filter Section */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3 mb-4">
            <FilterOutlined className="text-blue-600" />
            <span className="font-medium text-gray-700">Filters & Search</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search by name or crop..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="!h-10 !rounded-lg"
              allowClear
            />
            <Select
              placeholder="Filter by Status"
              value={statusFilter || undefined}
              onChange={(value) => setStatusFilter(value || "")}
              allowClear
              className="!h-10"
              options={[
                { label: "Active", value: "Active" },
                { label: "Maintenance", value: "Maintenance" },
                { label: "Fallow", value: "Fallow" },
              ]}
            />
            <Select
              placeholder="Filter by Crop Type"
              value={cropTypeFilter || undefined}
              onChange={(value) => setCropTypeFilter(value || "")}
              allowClear
              className="!h-10"
              options={getUniqueCropTypes().map((crop) => ({
                label: crop,
                value: crop,
              }))}
            />
            <Button
              icon={<ClearOutlined />}
              onClick={clearFilters}
              className="!h-10 !rounded-lg"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-center">
              <Spin size="large" />
              <Text className="text-sm text-gray-500">
                Loading polytunnel data...
              </Text>
            </div>
          </div>
        ) : getFilteredTunnels().length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14">
            <Empty
              description={
                <span className="text-sm text-gray-500">
                  {tunnels.length === 0
                    ? "No polytunnels available yet. Start by constructing your first tunnel."
                    : "No polytunnels match your filters. Try adjusting your search criteria."}
                </span>
              }
            >
              {tunnels.length === 0 && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="!h-11 !rounded-xl !border-0 !bg-blue-600 !px-5 !font-medium !shadow-sm hover:!bg-blue-700"
                  onClick={() => {
                    setSelectedTunnel(null);
                    setTunnelFormVisible(true);
                  }}
                >
                  Construct Tunnel
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {getFilteredTunnels().map((tunnel) => {
              const tunnelStaff = getEmployeesForTunnel(tunnel._id);

              return (
                <PolytunnelCard
                  key={tunnel._id}
                  tunnel={tunnel}
                  staffCount={tunnelStaff.length}
                  workerNames={tunnelStaff.map((worker) => worker.fullName)}
                  onHarvestClick={() => {
                    setSelectedTunnel(tunnel);
                    setHarvestVisible(true);
                  }}
                  onEditClick={() => {
                    setSelectedTunnel(tunnel);
                    setTunnelFormVisible(true);
                  }}
                  onDeleteClick={() => handleDelete(tunnel._id)}
                  onAssignClick={() => setEmployeeManagerVisible(true)}
                />
              );
            })}
          </div>
        )}
      </div>

      <TunnelForm
        visible={tunnelFormVisible}
        onClose={() => {
          setTunnelFormVisible(false);
          fetchData();
        }}
        tunnel={selectedTunnel}
      />

      <EmployeeManager
        visible={employeeManagerVisible}
        onClose={() => {
          setEmployeeManagerVisible(false);
          fetchData();
        }}
        tunnels={tunnels}
        employees={employees}
      />

      {harvestVisible && selectedTunnel && (
        <HarvestEntry
          visible={harvestVisible}
          onClose={() => {
            setHarvestVisible(false);
            fetchData();
          }}
          tunnel={selectedTunnel}
          onRecorded={fetchData}
        />
      )}

      {/* Report Generation Modal */}
      <Modal
        title="Generate Polytunnel Report"
        open={reportVisible}
        onCancel={() => setReportVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReportVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="generate"
            type="primary"
            loading={reportGenerating}
            onClick={handleGenerateReport}
            icon={<FileTextOutlined />}
          >
            Generate PDF Report
          </Button>,
        ]}
        className="font-poppins"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Report Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tunnels to Include:</span>
                <span className="font-medium text-gray-900">
                  {getFilteredTunnels().length} tunnel(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Staff Records:</span>
                <span className="font-medium text-gray-900">
                  {employees.length} employee(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Generated At:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Report will include:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Tunnel details (name, size, crop type, status)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Assigned staff members and roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Creation and modification dates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Current filtration applied (if any)</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Polytunnels;
