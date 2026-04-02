import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../api/productsApi';
import { Button, Spin, Alert, Row, Col, Divider, Select, message } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();

  const formatQty = (value) => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? `${num}` : `${num.toFixed(2).replace(/\.00$/, '')}`;
  };

  const generateQtyOptions = (maxQty) => {
    const options = [];
    for (let i = 1; i <= maxQty; i++) {
      options.push({
        value: i,
        label: `${i}`,
      });
    }
    return options;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const availableStock = Math.floor(Number(product.countInStock || 0));
    if (qty > availableStock) {
      message.error(
        `Insufficient stock! Only ${availableStock} available. Please reduce quantity.`
      );
      return;
    }
    addToCart(product, qty);
    message.success(`${qty} x ${product.name} added to cart`);
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (error) return <Alert title="Error" description={error} type="error" showIcon />;
  if (!product) return <Alert title="Not Found" description="Product not found" type="warning" showIcon />;

  return (
    <div className='font-poppins px-20 pt-10 bg-white pb-24 min-h-screen'>
      <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />} className="mb-6 font-poppins text-gray-600">
        Back
      </Button>

      <Row gutter={[48, 48]} className="bg-white p-8 rounded-2xl font-poppins shadow-sm">
        <Col xs={24} md={12}>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
          </div>
        </Col>
        <Col xs={24} md={12} className="flex flex-col font-poppins justify-center">
          <div className="mb-4">
            <span className="text-sm font-bold tracking-widest text-green-500 uppercase">{product.category}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
          <div className="text-3xl font-bold text-gray-900 mb-6">Rs.{product.price.toFixed(2)}</div>
          
          <Divider />
          
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {product.description}
          </p>

          <div className={`text-lg font-semibold mb-6 ${product.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'} ({Math.floor(product.countInStock)})
          </div>

          {product.countInStock > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
                 <span className="font-medium text-gray-700">Quantity:</span>
                 <Select
                   value={Math.floor(qty)}
                   onChange={(val) => setQty(val)}
                   options={generateQtyOptions(Math.floor(product.countInStock))}
                   className="w-32"
                   size="large"
                 />
              </div>
              {qty > product.countInStock && (
                <Alert
                  message="Insufficient Stock"
                  description={`Only ${Math.floor(product.countInStock)} available. Please select a lower quantity.`}
                  type="warning"
                  showIcon
                  className="!mb-4"
                />
              )}
            </div>
          )}
          <div className="flex gap-4">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              className="flex-1 h-10 rounded-3xl text-md bg-green-600 hover:bg-green-500 font-semibold"
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
            >
              Add to Cart
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetails;
