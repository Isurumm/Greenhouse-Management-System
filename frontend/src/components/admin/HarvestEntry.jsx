import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  InputNumber,
  Select,
  Button,
  message,
  Divider,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { getProducts } from "../../api/productsApi";
import { recordHarvest } from "../../api/polytunnelsApi";
import { getInventoryTransactions } from "../../api/inventoryApi";
import { useAuth } from "../../context/AuthContext";
import { DateTime } from "luxon";

const { Text } = Typography;

const HarvestEntry = ({ visible, onClose, tunnel, onRecorded }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [transactionProductFilter, setTransactionProductFilter] =
    useState("all");

  const isRelatedToCurrentTunnel = (transaction) => {
    const reference = (transaction?.reference || "").toLowerCase();
    const tunnelId = (tunnel?._id || "").toLowerCase();
    const tunnelName = (tunnel?.name || "").toLowerCase();

    if (!reference) return false;
    if (tunnelId && reference.includes(tunnelId)) return true;
    if (tunnelName && reference.includes(tunnelName)) return true;
    return false;
  };

  const fetchTransactions = async (filterValue, productList = products) => {
    if (!Array.isArray(productList) || productList.length === 0) {
      setTransactions([]);
      return;
    }

    setTxLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      if (filterValue === "all") {
        const settled = await Promise.allSettled(
          productList.map(async (product) => {
            const { data } = await getInventoryTransactions(
              product._id,
              config,
            );
            return data.map((transaction) => ({
              ...transaction,
              productName: product.name,
            }));
          }),
        );

        const merged = settled
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value)
          .filter((transaction) => isRelatedToCurrentTunnel(transaction))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

        setTransactions(merged);
        return;
      }

      const selectedProduct = productList.find(
        (product) => product._id === filterValue,
      );
      const { data } = await getInventoryTransactions(filterValue, config);
      setTransactions(
        data
          .map((transaction) => ({
            ...transaction,
            productName: selectedProduct?.name || "Unknown Product",
          }))
          .filter((transaction) => isRelatedToCurrentTunnel(transaction)),
      );
    } catch (error) {
      message.error("Failed to load recent inventory transactions");
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      const loadProductsAndTransactions = async () => {
        try {
          const res = await getProducts();
          const productList = Array.isArray(res.data) ? res.data : [];
          setProducts(productList);
          await fetchTransactions("all", productList);
        } catch (error) {
          message.error("Failed to load products for harvest log");
          setProducts([]);
          setTransactions([]);
        }
      };

      setSuccessData(null);
      setTransactionProductFilter("all");
      form.resetFields();
      loadProductsAndTransactions();
    }
  }, [visible, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { ...values, tunnel: tunnel._id };

      const { data } = await recordHarvest(payload, config);
      setSuccessData(data);
      message.success("Harvest recorded & Inventory synchronized!");
      fetchTransactions(transactionProductFilter, products);
   if (onRecorded) {
      onRecorded();
    }
   
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to record harvest",
      );
    } finally {
      setLoading(false);
    }
  };

  const transactionColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-xs">
          {DateTime.fromISO(date).toFormat("MMM dd, HH:mm")}
        </span>
      ),
    },
    {
      title: "Crop",
      key: "productName",
      render: (_, record) => (
        <span className="text-xs font-medium text-gray-700">
          {record.productName || "N/A"}
        </span>
      ),
    },
    {
      title: "Qty (kg)",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => (
        <span
          className={
            qty > 0
              ? "font-semibold text-green-600"
              : "font-semibold text-red-500"
          }
        >
          {qty > 0 ? `+${qty}` : qty}
        </span>
      ),
    },
  ];

  return (
    <Drawer
      title={`Harvest Log: ${tunnel.name}`}
      size="large"
      onClose={onClose}
      open={visible}
      destroyOnHidden
    >
      <>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="product"
            label="Crop Yielded (Storefront Target)"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              placeholder="Link to existing Inventory Product"
              options={products.map((p) => ({
                value: p._id,
                label: p.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Yield Amount (kg)"
            rules={[{ required: true }]}
          >
            <div className="flex items-center gap-2">
              <InputNumber
                min={0.1}
                step={0.1}
                precision={2}
                className="w-full text-lg font-bold"
                size="large"
                placeholder="Enter harvested weight"
              />
              <span className="inline-flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-600">
                kg
              </span>
            </div>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-500 font-bold border-none shadow-md mt-6"
            loading={loading}
          >
            Record Harvest
          </Button>
        </Form>

        <Divider>Recent Inventory Transactions</Divider>

        <div className="mb-4">
            <div className="w-full space-y-1.5">
            <Text className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              Select Crop For Transactions
            </Text>
            <Select
                className="w-52"
              size="large"
              value={transactionProductFilter}
              onChange={(value) => {
                setTransactionProductFilter(value);
                fetchTransactions(value, products);
              }}
              options={[
                { value: "all", label: "All Crops" },
                ...products.map((product) => ({
                  value: product._id,
                  label: product.name,
                })),
              ]}
            />
            </div>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : (
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="_id"
            size="small"
            pagination={{ pageSize: 5 }}
          />
        )}
      </>
    </Drawer>
  );
};

export default HarvestEntry;
