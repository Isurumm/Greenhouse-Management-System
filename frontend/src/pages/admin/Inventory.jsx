import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Tooltip,
  Input,
  Select,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  AlertOutlined,
  FileTextOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { getProducts, deleteProduct } from "../../api/productsApi";
import { getInventoryTransactions } from "../../api/inventoryApi";
import { useAuth } from "../../context/AuthContext";
import ProductForm from "../../components/admin/ProductForm";
import StockManagement from "../../components/admin/StockManagement";
import SummaryCard from "../../components/admin/SummaryCard";
import DeleteConfirm from "../../components/common/DeleteConfirm";
import { generateInventoryReport } from "../../utils/inventoryReportGenerator";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [productFormVisible, setProductFormVisible] = useState(false);
  const [stockFormVisible, setStockFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [reportVisible, setReportVisible] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (error) {
      message.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); //Data fetched to frontend CRUD - Read
  }, []);

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await deleteProduct(id, config);
      message.success("Product deleted");
      fetchProducts();
    } catch (error) {
      message.error( //CRUD - Delete 
        error.response?.data?.message || "Failed to delete product",
      );
    }
  };

  const getStockStatus = (product) => {
    if (product.countInStock <= 0) return "Out of Stock";
    if (product.countInStock <= product.minStockLevel) return "Low Stock";
    return "In Stock";
  };

  const filteredProducts = products.filter((product) => {
    const q = searchText.trim().toLowerCase();
    const matchesSearch =
      !q ||
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || getStockStatus(product) === statusFilter;
    const matchesCategory = !categoryFilter || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uniqueCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setCategoryFilter("");
  };

  const handleGenerateReport = async () => {
    setReportGenerating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const transactionsByProduct = {};
      await Promise.all(
        filteredProducts.map(async (product) => {
          try {
            const { data } = await getInventoryTransactions(product._id, config);
            transactionsByProduct[product._id] = Array.isArray(data) ? data : [];
          } catch (error) {
            transactionsByProduct[product._id] = [];
          }
        }),
      );

      generateInventoryReport({
        products: filteredProducts,
        transactionsByProduct,
        generatedAt: new Date().toLocaleString(),
        appliedFilters: {
          searchText,
          statusFilter,
          categoryFilter,
        },
      });

      message.success("Inventory report generated successfully");
      setReportVisible(false);
    } catch (error) {
      message.error("Failed to generate inventory report");
    } finally {
      setReportGenerating(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (img) => (
        <div className="flex items-center justify-center">
          <img
            src={img}
            alt="Product"
            className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm"
          />
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-semibold text-gray-900">{text}</span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-medium text-gray-700">Rs.{price.toFixed(2)}</span>
      ),
    },
    {
      // Inventory Page Table
      title: "Stock Status",
      key: "status",
      render: (_, record) => {
        if (record.countInStock <= 0) {
          return (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-100">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Out of Stock ({record.countInStock} Kg)
            </span>
          );
        }
        if (record.countInStock <= record.minStockLevel) {
          return (
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-600 border border-yellow-100">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Low Stock ({record.countInStock} Kg)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 border border-green-100">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            In Stock ({record.countInStock} Kg)
          </span>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => (
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
          {text}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Manage Stock">
            <Button
              type="default"
              icon={<InboxOutlined />}
              size="small"
              className="rounded-lg border-gray-200"
              onClick={() => {
                setSelectedProduct(record);
                setStockFormVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              className="rounded-lg border-gray-200"
              onClick={() => {
                setSelectedProduct(record);
                setProductFormVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <DeleteConfirm
              title="Are you sure?"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="rounded-lg"
              />
            </DeleteConfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
// Calculate the values in the summary cards
  const filteredInStockCount = filteredProducts.filter(
    (p) => p.countInStock > p.minStockLevel,
  ).length;
  const filteredLowStockCount = filteredProducts.filter(
    (p) => p.countInStock > 0 && p.countInStock <= p.minStockLevel,
  ).length;
  const filteredOutOfStockCount = filteredProducts.filter(
    (p) => p.countInStock <= 0,
  ).length;

  return (
    <div className="min-h-[500px] rounded-2xl bg-white  font-poppins">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500">
            Add products and manage stock efficiently.
          </p>
        </div>

        <Space>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setReportVisible(true)}
            className="rounded-lg"
          >
            Generate Report
          </Button>
          <Button
            size="large"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProduct(null);
              setProductFormVisible(true);
            }}
          >
            Add Product
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={<InboxOutlined />}
          title="Total Products"
          value={filteredProducts.length}
          extra={`of ${products.length} catalog items`}
        />
        <SummaryCard
          icon={<InboxOutlined />}
          title="In Stock"
          value={filteredInStockCount}
          extra="healthy inventory"
        />
        <SummaryCard
          icon={<AlertOutlined />}
          title="Low Stock"
          value={filteredLowStockCount}
          extra="needs refill soon"
        />
        <SummaryCard
          icon={<AlertOutlined />}
          title="Out Of Stock"
          value={filteredOutOfStockCount}
          extra="requires action"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-gray-700">
          <FilterOutlined />
          <span className="text-sm font-semibold">Search & Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Input
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search name, category, description"
            className="h-10"
          />
          <Select
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || "")}
            placeholder="Filter by stock status"
            options={[
              { value: "In Stock", label: "In Stock" },
              { value: "Low Stock", label: "Low Stock" },
              { value: "Out of Stock", label: "Out of Stock" },
            ]}
          />
          <Select
            allowClear
            value={categoryFilter || undefined}
            onChange={(value) => setCategoryFilter(value || "")}
            placeholder="Filter by category"
            options={uniqueCategories.map((category) => ({
              value: category,
              label: category,
            }))}
          />
          <Button icon={<ClearOutlined />} onClick={clearFilters} className="h-10">
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredProducts} // Data to Table 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }} // Numbver of Rows in a page (Products) in Inventory
          className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wider [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50"
        />
      </div>

      <ProductForm
        visible={productFormVisible}
        onClose={() => {
          setProductFormVisible(false);
          fetchProducts();
        }}
        product={selectedProduct}
      />

      {stockFormVisible && selectedProduct && (
        <StockManagement
          visible={stockFormVisible}
          onClose={() => {
            setStockFormVisible(false);
            fetchProducts();
          }}
          product={selectedProduct}
        />
      )}

      <Modal
        title="Generate Inventory Report"
        open={reportVisible}
        onCancel={() => setReportVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReportVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="generate"
            type="primary"
            icon={<FileTextOutlined />}
            loading={reportGenerating}
            onClick={handleGenerateReport}
          >
            Generate PDF Report
          </Button>,
        ]}
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            This report includes complete details for all currently filtered products,
            including product data, stock health, pricing, dates, and full transaction
            history.
          </p>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span>Products Included</span>
              <span className="font-semibold">{filteredProducts.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Current Filters</span>
              <span className="font-semibold">
                {searchText || statusFilter || categoryFilter ? "Applied" : "None"}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
