import React, { useState, useEffect } from "react";
import {
  Steps,
  Button,
  Typography,
  Form,
  Input,
  Row,
  Col,
  Card,
  message,
  Result,
  Spin,
  Checkbox,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, payOrder } from "../api/ordersApi";
import {
  HomeOutlined,
  ProfileOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const formatCurrency = (value) => `Rs.${Number(value || 0).toFixed(2)}`;
const formatWeight = (value) => {
  const num = Number(value || 0);
  if (Number.isInteger(num)) {
    return `${num}`;
  }
  return `${num.toFixed(2).replace(/\.00$/, "")}`;
};
const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : new Date().toLocaleString();

const isExpiryInPast = (expiry) => {
  if (!expiry) {
    return false;
  }

  const [monthText, yearText] = expiry.split("/");
  const month = Number(monthText);
  const year = Number(`20${yearText}`);

  if (!month || !year) {
    return false;
  }

  const expiryDate = new Date(year, month, 0);
  const currentDate = new Date();

  return expiryDate < new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
};

const buildReceiptHtml = (order, customerName) => {
  const safeOrder = order || {};
  const safeItems = safeOrder.orderItems || [];
  const paidAt = safeOrder.paidAt || safeOrder.paymentResult?.update_time;

  const rows = safeItems
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${formatWeight(item.qty)} Kg</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.price)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.qty * item.price)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${safeOrder._id || "Order"}</title>
      </head>
      <body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#111827;">
        <div style="max-width:900px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <h1 style="margin:0;font-size:26px;">Order Receipt</h1>
              <p style="margin:6px 0 0;color:#6b7280;">Thank you for your purchase.</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;"><strong>Order ID:</strong> ${safeOrder._id || "-"}</p>
              <p style="margin:6px 0 0;"><strong>Payment:</strong> ${safeOrder.paymentResult?.status || "COMPLETED"}</p>
              <p style="margin:6px 0 0;"><strong>Date:</strong> ${formatDate(paidAt)}</p>
            </div>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:20px;">
            <div>
              <h3 style="margin:0 0 8px;font-size:16px;">Customer</h3>
              <p style="margin:0 0 6px;">${customerName || "Customer"}</p>
              <p style="margin:0;color:#6b7280;">${safeOrder.paymentResult?.email_address || "-"}</p>
            </div>
            <div>
              <h3 style="margin:0 0 8px;font-size:16px;">Shipping Address</h3>
              <p style="margin:0 0 6px;">${safeOrder.shippingAddress?.address || "-"}</p>
              <p style="margin:0 0 6px;">${safeOrder.shippingAddress?.city || "-"}, ${safeOrder.shippingAddress?.postalCode || "-"}</p>
              <p style="margin:0;">${safeOrder.shippingAddress?.country || "-"}</p>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="text-align:left;padding:10px;border-bottom:1px solid #e5e7eb;">Item</th>
                <th style="text-align:center;padding:10px;border-bottom:1px solid #e5e7eb;">Qty (Kg)</th>
                <th style="text-align:right;padding:10px;border-bottom:1px solid #e5e7eb;">Unit Price</th>
                <th style="text-align:right;padding:10px;border-bottom:1px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div style="max-width:340px;margin-left:auto;margin-top:20px;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Items</span><strong>${formatCurrency(safeOrder.itemsPrice)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Shipping</span><strong>${safeOrder.shippingPrice === 0 ? "Free" : formatCurrency(safeOrder.shippingPrice)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Tax</span><strong>${formatCurrency(safeOrder.taxPrice)}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:8px;border-top:1px solid #e5e7eb;font-size:18px;"><span>Total</span><strong>${formatCurrency(safeOrder.totalPrice)}</strong></div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { cart, saveShippingAddress, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentConsentChecked, setPaymentConsentChecked] = useState(false);

  const handlePrintReceipt = () => {
    if (!orderCreated) {
      message.warning("Order receipt is not available yet.");
      return;
    }

    const html = buildReceiptHtml(orderCreated, user?.name);
    const printWindow = window.open("", "_blank", "width=1024,height=720");

    if (!printWindow) {
      message.error(
        "Unable to open print window. Please allow pop-ups and try again.",
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Form for shipping
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login?redirect=/checkout");
    }
    if (cart.cartItems.length === 0 && !orderCreated) {
      navigate("/cart");
    }
    // Prefill shipping
    if (cart.shippingAddress && Object.keys(cart.shippingAddress).length > 0) {
      form.setFieldsValue({
        ...cart.shippingAddress,
        country: cart.shippingAddress.country || "Sri Lanka",
      });
    } else {
      form.setFieldsValue({ country: "Sri Lanka" });
    }
  }, [user, navigate, cart, orderCreated, form]);

  const calculateTotals = () => {
    const itemsPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0,
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = 0.15 * itemsPrice;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  };

  const totals = calculateTotals();

  const handleShippingSubmit = (values) => {
    saveShippingAddress({
      ...values,
      country: "Sri Lanka",
    });
    setCurrentStep(1);
  };

  const getInsufficientItems = () => {
    return cart.cartItems.filter((item) => item.qty > item.countInStock);
  };

  const hasInsufficientStock = getInsufficientItems().length > 0;

  const handlePlaceOrder = async () => {
    if (hasInsufficientStock) {
      const insufficientItems = getInsufficientItems();
      const itemNames = insufficientItems.map((item) => item.name).join(", ");
      message.error(
        `Insufficient stock for ${itemNames}. Please adjust quantities.`,
      );
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await createOrder(
        {
          orderItems: cart.cartItems.map((item) => ({
            product: item.product,
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
          })),
          shippingAddress: cart.shippingAddress,
          paymentMethod: "Mock Gateway Simulated Card",
          itemsPrice: totals.itemsPrice,
          taxPrice: totals.taxPrice,
          shippingPrice: totals.shippingPrice,
          totalPrice: totals.totalPrice,
        },
        config,
      );

      setOrderCreated(data);
      setCurrentStep(2);
    } catch (err) {
      message.error(err.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedPayment = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Mocked payment result
      const paymentResult = {
        id: `mock_trans_${Math.floor(Math.random() * 1000000000)}`,
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        email_address: user.email,
      };

      const { data } = await payOrder(orderCreated._id, paymentResult, config);
      setOrderCreated(data || orderCreated);

      clearCart();
      setCurrentStep(3);
      message.success("Payment successful!");
    } catch (err) {
      message.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Shipping",
      icon: <HomeOutlined />,
      content: (
        <Form
          layout="vertical"
          form={form}
          onFinish={handleShippingSubmit}
          className="max-w-xl mx-auto py-8"
          initialValues={{ country: "Sri Lanka" }}
        >
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input size="large" placeholder="123 Main St" />
          </Form.Item>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: "City is required" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="postalCode"
            label="Postal Code"
            getValueFromEvent={(e) =>
              (e?.target?.value || "").replace(/\D/g, "").slice(0, 5)
            }
            rules={[
              { required: true, message: "Postal Code is required" },
              {
                pattern: /^\d{5}$/,
                message: "Postal Code must be exactly 5 numbers",
              },
            ]}
          >
            <Input
              size="large"
              maxLength={5}
              inputMode="numeric"
              placeholder="e.g. 10100"
            />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Country is required" }]}
          >
            <Input size="large" disabled />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full bg-green-600 rounded-3xl hover:bg-green-500 font-semibold"
          >
            Continue to Review
          </Button>
        </Form>
      ),
    },
    {
      title: "Review",
      icon: <ProfileOutlined />,
      content: (
        <div className="py-8">
          {hasInsufficientStock && (
            <div className="mb-6">
              <Alert
                message="Insufficient Stock for Some Items"
                description={`The following items have insufficient inventory: ${getInsufficientItems()
                  .map((item) => item.name)
                  .join(", ")}. Please reduce quantities.`}
                type="error"
                showIcon
                className="!rounded-lg"
              />
            </div>
          )}
          <Row gutter={48}>
            <Col xs={24} md={16}>
              <Card
                title="Shipping Details"
                className="mb-6 shadow-sm font-semibold font-poppins border-gray-200"
              >
                <p className="font-normal text-gray-700">
                  {cart.shippingAddress?.address}
                </p>
                <p className="font-normal text-gray-700">
                  {cart.shippingAddress?.city},{" "}
                  {cart.shippingAddress?.postalCode}
                </p>
                <p className="font-normal text-gray-700">
                  {cart.shippingAddress?.country}
                </p>
              </Card>
              <Card
                title="Order Items"
                className="mb-6 shadow-sm font-semibold font-poppins border-gray-200"
              >
                {cart.cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 font-normal"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <span className="text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-gray-600">
                      {formatWeight(item.qty)} Kg x Rs.{item.price.toFixed(2)} ={" "}
                      <span className="font-bold text-gray-900">
                        Rs.{(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                title="Order Summary"
                className="shadow-sm font-bold border-gray-200 bg-gray-50 font-poppins"
              >
                <div className="flex justify-between py-2 font-normal text-gray-600">
                  <span>Items</span>
                  <span>Rs.{totals.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-normal text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {totals.shippingPrice === 0
                      ? "Free"
                      : totals.shippingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 font-normal text-gray-600 border-b border-gray-200 pb-4">
                  <span>Tax (15%)</span>
                  <span>Rs.{totals.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-4 text-xl">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">
                    Rs.{totals.totalPrice.toFixed(2)}
                  </span>
                </div>
                <Button
                  loading={loading}
                  type="primary"
                  size="large"
                  disabled={hasInsufficientStock}
                  onClick={handlePlaceOrder}
                  className="w-full mt-4 bg-green-600 hover:bg-green-500 font-semibold h-10 rounded-3xl"
                >
                  Confirm Order & Pay
                </Button>
                <Button
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  className="w-full mt-4 h-10 rounded-3xl"
                >
                  Back to Shipping
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: "Payment",
      icon: <CreditCardOutlined />,
      content: (
        <div className="max-w-xl mx-auto font-poppins py-12">
          <Card className="shadow-lg border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-cal-poly-green font-poppins text-white p-6 -mx-6 -mt-6 mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <LockOutlined />
                Secure Checkout
              </h3>
              <p className="opacity-80 mt-1">Order ID: {orderCreated?._id}</p>
            </div>

            <div className="text-center font-poppins mb-8">
              <p className="text-gray-500 mb-1">Amount Due</p>
              <p className="text-4xl font-extrabold text-gray-900">
                Rs.{orderCreated?.totalPrice?.toFixed(2)}
              </p>
            </div>

            <Form
              layout="vertical"
              onFinish={handleSimulatedPayment}
              initialValues={{ cardholderName: user?.name || "" }}
            >
              <Form.Item
                label="Cardholder Name"
                name="cardholderName"
                rules={[
                  { required: true, message: "Cardholder name is required" },
                  {
                    pattern: /^[^\d]+$/,
                    message: "Cardholder name cannot contain numbers",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter cardholder name"
                  onKeyDown={(e) => {
                    if (/\d/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Card Number"
                name="cardNumber"
                getValueFromEvent={(e) => {
                  const digitsOnly = (e?.target?.value || "")
                    .replace(/\D/g, "")
                    .slice(0, 16);
                  return digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                }}
                rules={[
                  { required: true, message: "Card number is required" },
                  {
                    pattern: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
                    message: "Card number must be exactly 16 numbers",
                  },
                ]}
              >
                <Input
                  size="large"
                  maxLength={19}
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  className="font-mono tracking-widest text-lg"
                  suffix={<CreditCardOutlined className="text-gray-400" />}
                />
              </Form.Item>
              <div className="flex gap-4">
                <Form.Item
                  label="Expiry"
                  name="expiry"
                  className="w-1/2"
                  getValueFromEvent={(e) => {
                    const digitsOnly = (e?.target?.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 4);
                    if (digitsOnly.length <= 2) {
                      return digitsOnly;
                    }
                    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
                  }}
                  rules={[
                    { required: true, message: "Expiry is required" },
                    {
                      pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                      message: "Use valid format MM/YY",
                    },
                    {
                      validator: (_, value) =>
                        value && isExpiryInPast(value)
                          ? Promise.reject(
                              new Error(
                                "Expiry date cannot be in the past",
                              ),
                            )
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={5}
                    inputMode="numeric"
                    placeholder="MM/YY"
                    className="text-center font-mono"
                  />
                </Form.Item>
                <Form.Item
                  label="CVC"
                  name="cvc"
                  className="w-1/2"
                  getValueFromEvent={(e) =>
                    (e?.target?.value || "").replace(/\D/g, "").slice(0, 3)
                  }
                  rules={[
                    { required: true, message: "CVC is required" },
                    {
                      pattern: /^\d{3}$/,
                      message: "CVC must be exactly 3 numbers",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={3}
                    inputMode="numeric"
                    placeholder="CVC"
                    className="text-center font-mono"
                  />
                </Form.Item>
              </div>

              <div className="mb-3">
                <Checkbox
                  checked={paymentConsentChecked}
                  onChange={(e) => setPaymentConsentChecked(e.target.checked)}
                >
                  Click to confirm that you have reviewed and agreed to the
                  order details. Once you proceed with "Pay Now", the order
                  becomes final and cannot be modified or canceled.
                </Checkbox>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full h-10 text-lg mt-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-3xl tracking-wide"
                loading={loading}
                disabled={!paymentConsentChecked}
              >
                Pay Now
              </Button>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      title: "Complete",
      icon: <CheckCircleOutlined />,
      content: (
        <Result
          status="success"
          title={
            <span className="text-2xl font-bold font-poppins text-gray-800">
              Payment Successful!
            </span>
          }
          subTitle={
            <div className="text-lg mt-2 text-gray-600">
              Your order{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                {orderCreated?._id}
              </span>{" "}
              has been confirmed.
            </div>
          }
          className="py-20 bg-white rounded-xl shadow-sm border border-green-100"
          extra={[
            <Button
              type="primary"
              size="large"
              key="orders"
              className="bg-green-600 h-10 rounded-3xl px-8 font-semibold mt-4"
              onClick={() => navigate("/orders")}
            >
              Track My Order
            </Button>,
            <Button
              size="large"
              key="print"
              className="h-10 rounded-3xl px-8 font-semibold border-gray-600 text-gray-700 mt-4"
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </Button>,
            <Button
              size="large"
              key="shop"
              className="h-10 rounded-3xl px-8 font-semibold border-green-600 text-green-600 mt-4"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </Button>,
          ]}
        />
      ),
    },
  ];

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
    icon: item.icon,
  }));

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm min-h-[600px] font-poppins max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">
        Checkout
      </h1>
      <Steps
        current={currentStep}
        items={items}
        className="mb-12"
        responsive={false}
      />
      <div className="steps-content">{steps[currentStep].content}</div>
    </div>
  );
};

export default Checkout;
