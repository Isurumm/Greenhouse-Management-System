import React, { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
} from "antd";
import { createProduct, updateProduct } from "../../api/productsApi";
import { useAuth } from "../../context/AuthContext";

const handleNumericKeyDown = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }

  const isNumber = /^[0-9.]$/.test(event.key);
  if (!isNumber) {
    event.preventDefault();
  }
};

const handleTextKeyDown = (event) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }

  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
};

const sanitizeTextInput = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/[0-9]/g, "");
};

const parseDecimalInput = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", fractional = ""] = cleaned.split(".");
  return fractional !== "" ? `${whole}.${fractional.slice(0, 2)}` : whole;
};

const parseIntegerInput = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\D/g, "");
};

const ProductForm = ({ visible, onClose, product }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const isEdit = !!product;

  useEffect(() => {
    if (!visible) return;

    if (product) {
      form.setFieldsValue(product);
      return;
    }

    form.resetFields();
  }, [visible, product, form]);

  const onFinish = async (values) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      if (isEdit) {
        await updateProduct(product._id, values, config);
        message.success("Product updated successfully");
      } else {
        await createProduct(values, config);
        message.success("Product created successfully");
      }
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <Drawer
      title={null}
      size="large"
      onClose={onClose}
      open={visible}
      destroyOnHidden
      className="[&_.ant-drawer-body]:bg-gray-50/70 [&_.ant-drawer-body]:p-0 [&_.ant-drawer-header]:hidden"
    >
      <div className="min-h-full bg-gray-50/70">
        <div className="border-b border-gray-200 bg-white px-6 py-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isEdit ? "Edit Product Catalog Details" : "Add New Product"}
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-white via-slate-50 to-white px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEdit ? "Product Information" : "New Product Details"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the required fields below to save this product.
              </p>
            </div>

            <div className="px-6 py-6">
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="grid grid-cols-1 gap-5">
                  <Form.Item
                    name="name"
                    label={
                      <span className="font-medium text-gray-700">
                        Product Name
                      </span>
                    }
                    rules={[
                      { required: true, message: "Product name is required" },
                      {
                        pattern: /^[^0-9]*$/,
                        message: "Product name cannot contain numbers",
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="E.g., Organic Carrots"
                      onKeyDown={handleTextKeyDown}
                      onChange={(event) => {
                        form.setFieldValue(
                          "name",
                          sanitizeTextInput(event.target.value),
                        );
                      }}
                      className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="category"
                    label={
                      <span className="font-medium text-gray-700">
                        Category
                      </span>
                    }
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <Select
                      size="large"
                      placeholder="Select a category"
                      className="custom-select"
                      classNames={{ popup: { root: 'rounded-xl' } }}
                      options={[
                        { value: 'Vegetables', label: 'Vegetables' },
                        { value: 'Fruits', label: 'Fruits' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="price"
                    label={
                      <span className="font-medium text-gray-700">
                        Price (Rs.)
                      </span>
                    }
                    rules={[
                      { required: true, message: "Price is required" },
                      {
                        type: "number",
                        min: 0.01,
                        message: "Price must be at least 0.01",
                      },
                    ]}
                    className="mb-0"
                  >
                    <InputNumber
                      min={0.01}
                      step={0.01}
                      precision={2}
                      parser={parseDecimalInput}
                      onKeyDown={handleNumericKeyDown}
                      className="!h-11 !w-full"
                      prefix="Rs."
                      placeholder="Enter price"
                    />
                  </Form.Item>

                  <Form.Item
                    name="image"
                    label={
                      <span className="font-medium text-gray-700">
                        Image URL
                      </span>
                    }
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="https://..."
                      className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <span className="font-medium text-gray-700">
                        Description
                      </span>
                    }
                    rules={[{ required: true }]}
                    className="mb-0"
                  >
                    <Input.TextArea
                      rows={4}
                      className="!rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                      placeholder="Write a short product description"
                    />
                  </Form.Item>

                  <Form.Item
                    name="minStockLevel"
                    label={
                      <span className="font-medium text-gray-700">
                        Minimum Stock Level Alert
                      </span>
                    }
                    rules={[
                      { required: true, message: "Minimum stock level is required" },
                      {
                        type: "number",
                        min: 0,
                        message: "Minimum stock level cannot be negative",
                      },
                    ]}
                    className="mb-0"
                  >
                    <InputNumber
                      min={0}
                      step={1}
                      precision={0}
                      parser={parseIntegerInput}
                      onKeyDown={handleNumericKeyDown}
                      className="!h-11 !w-full"
                      placeholder="Enter threshold"
                      tooltip="Alerts will appear if stock drops below this number"
                    />
                  </Form.Item>

                  <div className="pt-2">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="!h-11 !w-full !rounded-xl !border-0 !bg-blue-600 !font-medium !shadow-sm hover:!bg-blue-700"
                    >
                      {isEdit
                        ? "Update Product Details"
                        : "Create Product Catalog Entry"}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-select .ant-select-selector {
          height: 44px !important;
          border-radius: 12px !important;
          border-color: rgb(229 231 235) !important;
          box-shadow: none !important;
          display: flex;
          align-items: center;
          padding: 0 11px !important;
        }

        .custom-select.ant-select-focused .ant-select-selector,
        .custom-select:hover .ant-select-selector {
          border-color: rgb(59 130 246) !important;
        }

        .custom-select .ant-select-selection-placeholder,
        .custom-select .ant-select-selection-item {
          line-height: 42px !important;
        }

        .ant-input-number {
          border-radius: 12px !important;
          border-color: rgb(229 231 235) !important;
          box-shadow: none !important;
        }

        .ant-input-number:hover,
        .ant-input-number-focused {
          border-color: rgb(59 130 246) !important;
        }

        .ant-input-number-input {
          height: 42px !important;
        }
      `}</style>
    </Drawer>
  );
};

export default ProductForm;
