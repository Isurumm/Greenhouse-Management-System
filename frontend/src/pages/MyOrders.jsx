import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Alert, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../api/ordersApi';
import { useAuth } from '../context/AuthContext';
import { DateTime } from 'luxon';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate('/auth/login?redirect=/orders');
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await getMyOrders(config);
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError('Could not fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: 'id',
      render: (text) => <span className="font-mono text-gray-500 uppercase text-xs">{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => <span>{DateTime.fromISO(date).toFormat('MMM dd, yyyy HH:mm')}</span>,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'total',
      render: (total) => <span className="font-bold text-gray-900">Rs.{total.toFixed(2)}</span>,
    },
    {
      title: 'Payment Status',
      key: 'payment',
      render: (_, record) => (
        record.isPaid ? 
        <Tag color="success" className="font-semibold">Paid</Tag> : 
        <Tag color="error" className="font-semibold">Not Paid</Tag>
      ),
    },
    {
      title: 'Order Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Pending') color = 'warning';
        if (status === 'Processing') color = 'processing';
        if (status === 'Ready to Deliver') color = 'cyan';
        if (status === 'In Transit') color = 'geekblue';
        if (status === 'Delivered') color = 'success';

        return <Tag color={color} className="uppercase font-bold text-xs">{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
           type="text" 
           icon={<EyeOutlined />} 
           className="text-blue-600 hover:text-blue-800"
           // Add onClick={() => navigate(`/orders/${record._id}`)} when order detail view is done
        >
           View
        </Button>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (error) return <Alert title="Error" description={error} type="error" showIcon />;

  return (
    <div className="bg-white rounded-2xl shadow-sm min-h-[600px] font-poppins p-20">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">Order History</h1>
      <Table 
         dataSource={orders} 
         columns={columns} 
         rowKey="_id" 
         pagination={{ pageSize: 10 }}
         className="border border-gray-100 rounded-lg overflow-hidden shadow-sm"
      />
    </div>
  );
};

export default MyOrders;
