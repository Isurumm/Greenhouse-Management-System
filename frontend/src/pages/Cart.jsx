import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Row,
  Col,
  List,
  Typography,
  Divider,
  Alert,
  Select,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const Cart = () => {
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatQty = (value) => {
    const num = Number(value || 0);
    return Number.isInteger(num)
      ? `${num}`
      : `${num.toFixed(2).replace(/\.00$/, "")}`;
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

  const handleCheckout = () => {
    if (!user) {
      navigate("/auth/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl font-poppins shadow-sm h-screen px-24 pt-20">
      <h1 className="text-gray-900 border-b text-3xl font-semibold border-gray-100 pb-4 mb-8">
        <ShoppingCartOutlined className="text-green-600 mr-2" />
        Shopping Cart
      </h1>

      {cart.cartItems.length === 0 ? (
        <Alert
          title="Your cart is empty"
          description={
            <span className="font-poppins">
              Looks like you haven't added any produce yet.{" "}
              <Link
                to="/shop"
                className="text-green-600 font-bold hover:underline"
              >
                Go back to shop
              </Link>
            </span>
          }
          type="info"
          showIcon
          className="bg-blue-50 border border-blue-100"
        />
      ) : (
        <Row gutter={[48, 24]}>
          <Col xs={24} lg={16}>
            <List
              itemLayout="horizontal"
              dataSource={cart.cartItems}
              renderItem={(item) => {
                const isInsufficientStock = item.qty > item.countInStock;
                return (
                  <>
                    {isInsufficientStock && (
                      <Alert
                        message="Insufficient Stock"
                        description={`${item.name}: Only ${formatQty(item.countInStock)} available but ${formatQty(item.qty)} requested. Please reduce quantity.`}
                        type="error"
                        showIcon
                        className="mb-4 !rounded-lg"
                      />
                    )}
                    <List.Item
                      className={`py-6 border-b border-gray-100 ${isInsufficientStock ? "bg-red-50" : "bg-white"}`}
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFromCart(item.product)}
                        >
                          Remove
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        }
                        title={
                          <Link
                            to={`/product/${item.product}`}
                            className="text-lg font-bold text-gray-800 font-poppins hover:text-green-600"
                          >
                            {item.name}
                          </Link>
                        }
                        description={
                          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
                            <span className="text-xl font-bold text-gray-900 font-poppins w-24">
                              Rs.{item.price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Qty:</span>
                              <Select
                                value={Math.floor(item.qty)}
                                onChange={(val) => addToCart(item, val)}
                                options={generateQtyOptions(
                                  Math.floor(item.countInStock),
                                )}
                                className="w-32"
                                size="large"
                              />
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  </>
                );
              }}
            />
          </Col>
          <Col xs={24} lg={8}>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24 font-poppins">
              <h1 className="mb-4 text-gray-800 text-2xl font-semibold border-b border-gray-200 pb-2">
                Order Summary
              </h1>

              <div className="flex justify-between items-center py-3 text-gray-600 text-lg">
                <span>
                  Items (
                  {formatQty(
                    cart.cartItems.reduce((acc, item) => acc + item.qty, 0),
                  )}
                  )
                </span>
                <span className="font-semibold text-gray-900">
                  Rs.
                  {cart.cartItems
                    .reduce((acc, item) => acc + item.qty * item.price, 0)
                    .toFixed(2)}
                </span>
              </div>

              <Divider className="my-2" />

              <div className="flex justify-between items-center py-3">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-semibold text-green-600">
                  Rs.
                  {cart.cartItems
                    .reduce((acc, item) => acc + item.qty * item.price, 0)
                    .toFixed(2)}
                </span>
              </div>

              <Button
                type="primary"
                size="large"
                className="w-full mt-6 h-10 text-lg rounded-3xl bg-green-600 hover:bg-green-500 font-semibold shadow-md flex items-center justify-center gap-2"
                onClick={handleCheckout}
                disabled={cart.cartItems.length === 0}
              >
                Proceed to Checkout <CreditCardOutlined />
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Cart;
