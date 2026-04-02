import React, { useState, useEffect } from 'react';
import { Drawer, Form, InputNumber, Button, Select, Input, Table, Spin, message, Typography, Tag, Divider } from 'antd';
import { addInventoryTransaction, getInventoryTransactions } from '../../api/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { DateTime } from 'luxon';

const { Title, Text } = Typography;

const StockManagement = ({ visible, onClose, product }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  
  const [currentStock, setCurrentStock] = useState(product?.countInStock || 0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await getInventoryTransactions(product._id, config);
      setTransactions(data);
    } catch (error) {
      message.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && product) {
      setCurrentStock(product.countInStock);
      fetchTransactions();
    }
  }, [visible, product]);

  const onFinish = async (values) => {
    setFormLoading(true);
    let qty = values.quantity;
    if (values.type === 'Stock Out') qty = -Math.abs(qty); // Ensure it's negative
    else if (values.type === 'Stock In' || values.type === 'Harvest Entry') qty = Math.abs(qty); // Ensure it's positive

    if (currentStock + qty < 0) {
      message.error("Transaction would drop stock below zero.");
      setFormLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await addInventoryTransaction(product._id, { ...values, quantity: qty }, config);
      message.success('Stock adjusted via official ledger entry');
      form.resetFields();
      setCurrentStock(prev => prev + qty);
      fetchTransactions();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to submit transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span className="text-xs">{DateTime.fromISO(date).toFormat('MMM dd, HH:mm')}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = 'blue';
        if (type === 'Stock In') color = 'green';
        if (type === 'Stock Out') color = 'red';
        if (type === 'Harvest Entry') color = 'purple';
        return <Tag color={color} className="text-[10px]">{type}</Tag>;
      }
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => <span className={`font-bold ${qty > 0 ? 'text-green-600' : 'text-red-500'}`}>{qty > 0 ? `+${qty}` : qty}</span>
    },
    {
      title: 'Ref / User',
      key: 'info',
      render: (_, record) => (
         <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-mono">{record.reference || 'N/A'}</span>
            <span className="text-[10px] text-gray-400">{record.user?.fullName}</span>
         </div>
      )
    }
  ];

  return (
    <Drawer title={`Inventory Ledger: ${product?.name}`} size="large" onClose={onClose} open={visible} destroyOnHidden>
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
         <Text className="text-gray-500 uppercase font-semibold tracking-wider text-xs">Total Current Stock</Text>
         <Text className="text-3xl font-extrabold text-gray-900">{currentStock}</Text>
      </div>

      <Title level={5} className="mb-4">Log New Movement</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} className="bg-white p-4 border border-blue-100 rounded-lg shadow-sm mb-8">
        <div className="flex gap-4">
           <Form.Item name="type" label="Movement Type" rules={[{ required: true }]} className="w-1/2">
             <Select
               options={[
                 { value: "Stock In", label: "Stock In (+)" },
                 { value: "Stock Out", label: "Stock Out (-)" },
               ]}
             />
           </Form.Item>
           <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]} className="w-1/2">
             <InputNumber className="w-full" />
           </Form.Item>
        </div>
        <Form.Item name="reference" label="Reference Note (Optional)">
           <Input placeholder="E.g. Discarded expired batch, Harvest from Tunnel #2" />
        </Form.Item>
        <Button type="primary" htmlType="submit" className="w-full bg-blue-600" loading={formLoading}>
           Submit Signed Transaction to Ledger
        </Button>
      </Form>

      <Divider>Transaction History Log</Divider>

      {loading ? (
        <div className="flex justify-center p-8"><Spin /></div>
      ) : (
        <Table columns={columns} dataSource={transactions} rowKey="_id" pagination={{ pageSize: 5 }} size="small" />
      )}
    </Drawer>
  );
};

export default StockManagement;
