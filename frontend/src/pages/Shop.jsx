import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/productsApi';
import { Card, Button, Spin, Alert, Tooltip } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const { Meta } = Card;

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (error) return <Alert title="Error" description={error} type="error" showIcon />;

  return (
    <div className='font-poppins px-20 bg-white py-20'>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Fresh Produce Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.filter(product => product.countInStock > 0).map((product) => (
            <Card
              hoverable
              className="h-full flex flex-col justify-between rounded-3xl overflow-hidden group font-poppins shadow-sm hover:shadow-xl transition-all"
              cover={
                <div className="relative overflow-hidden h-48">
                  <img
                    alt={product.name}
                    src={product.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <Link to={`/product/${product._id}`}>
                        <Button shape="circle" icon={<EyeOutlined />} size="large" />
                     </Link>
                  </div>
                </div>
              }
            >
              <Meta
                title={<Link to={`/product/${product._id}`} className="text-lg hover:text-green-600">{product.name}</Link>}
                description={
                  <div>
                    <div className="text-green-600 font-bold text-xl mt-2">Rs.{product.price.toFixed(2)}</div>
                    <div className="text-gray-500 text-sm mt-1 truncate">{product.description}</div>
                  </div>
                }
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />} 
                  className="w-full bg-green-600 hover:bg-green-500"
                  onClick={() => addToCart(product, 1)}
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default Shop;
