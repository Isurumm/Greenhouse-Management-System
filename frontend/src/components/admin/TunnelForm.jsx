import React, { useEffect } from "react";
import { Drawer, Form, Input, Select, Button, message } from "antd";
import { createPolytunnel, updatePolytunnel } from "../../api/polytunnelsApi";
import { useAuth } from "../../context/AuthContext";

const TunnelForm = ({ visible, onClose, tunnel }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const isEdit = !!tunnel;

  const parseSize = (sizeValue) => {
    if (!sizeValue || typeof sizeValue !== "string") {
      return { widthMeters: undefined, lengthMeters: undefined };
    }

    const match = sizeValue.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
    if (!match) {
      return { widthMeters: undefined, lengthMeters: undefined };
    }

    return {
      widthMeters: match[1],
      lengthMeters: match[2],
    };
  };

  useEffect(() => {
    if (visible) {
      if (tunnel) {
        form.setFieldsValue({
          ...tunnel,
          ...parseSize(tunnel.size),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, tunnel, form]);

  const onFinish = async (values) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { widthMeters, lengthMeters, ...restValues } = values;
      const payload = {
        ...restValues,
        size: `${widthMeters}x${lengthMeters} m`,
      };

      if (isEdit) {
        await updatePolytunnel(tunnel._id, payload, config);
        message.success("Polytunnel details updated");
      } else {
        await createPolytunnel(payload, config);
        message.success("Polytunnel created");
      }
      onClose();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to save polytunnel",
      );
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
      <div className="min-h-full font-poppins bg-gray-50/70">
        <div className="border-b border-gray-200 bg-white px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isEdit ? "Edit Polytunnel" : "Create New Polytunnel"}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-white via-slate-50 to-white px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEdit ? "Edit Tunnel Details" : "New Tunnel Information"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the essential details below to save this polytunnel
                record.
              </p>
            </div>

            <div className="px-6 py-6">
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="grid grid-cols-1 gap-5">
                  <Form.Item
                    name="name"
                    label={
                      <span className="font-medium text-gray-700">
                        Tunnel Name
                      </span>
                    }
                    normalize={(value) =>
                      typeof value === "string" ? value.trimStart() : value
                    }
                    rules={[
                      { required: true, message: "Tunnel Name is required" },
                      {
                        min: 3,
                        message: "Tunnel Name must be at least 3 characters",
                      },
                      {
                        max: 60,
                        message: "Tunnel Name must be 60 characters or less",
                      },
                      {
                        pattern: /^[A-Za-z0-9][A-Za-z0-9\s#'().,_/-]*$/,
                        message:
                          "Use letters, numbers, spaces, and basic symbols only",
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (!value.trim()) {
                            return Promise.reject(
                              new Error("Tunnel Name cannot be empty spaces"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="E.g., Sector 7G Tunnel"
                      className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Form.Item
                      name="widthMeters"
                      label={
                        <span className="font-medium text-gray-700">
                          Width (m)
                        </span>
                      }
                      rules={[
                        { required: true, message: "Width is required" },
                        {
                          pattern: /^(?:[1-9]\d*|0)?(?:\.\d{1,2})?$/,
                          message:
                            "Enter a valid width in meters (up to 2 decimals)",
                        },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            if (Number(value) > 0) return Promise.resolve();
                            return Promise.reject(
                              new Error("Width must be greater than 0"),
                            );
                          },
                        },
                      ]}
                      className="mb-0"
                    >
                      <Input
                        inputMode="decimal"
                        placeholder="E.g., 12.5"
                        className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9.]/g, "") // remove letters/symbols
                            .replace(/(\..*)\./g, "$1"); // allow only one decimal point
                          form.setFieldsValue({ widthMeters: value });
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="lengthMeters"
                      label={
                        <span className="font-medium text-gray-700">
                          Length (m)
                        </span>
                      }
                      rules={[
                        { required: true, message: "Length is required" },
                        {
                          pattern: /^(?:[1-9]\d*|0)?(?:\.\d{1,2})?$/,
                          message:
                            "Enter a valid length in meters (up to 2 decimals)",
                        },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            if (Number(value) > 0) return Promise.resolve();
                            return Promise.reject(
                              new Error("Length must be greater than 0"),
                            );
                          },
                        },
                      ]}
                      className="mb-0"
                    >
                      <Input
                        inputMode="decimal"
                        placeholder="E.g., 30"
                        className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9.]/g, "") // remove letters/symbols
                            .replace(/(\..*)\./g, "$1"); // allow only one decimal point
                          form.setFieldsValue({ lengthMeters: value });
                        }}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="status"
                    label={
                      <span className="font-medium text-gray-700">
                        Current Status
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select the current status",
                      },
                    ]}
                    className="mb-0"
                  >
                    <Select
                      size="large"
                      className="custom-select"
                      placeholder="Select current status"
                      classNames={{ popup: { root: "rounded-xl" } }}
                      options={[
                        { value: "Active", label: "Active (Growing)" },
                        { value: "Maintenance", label: "Maintenance Required" },
                        { value: "Fallow", label: "Inactive" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="cropType"
                    label={
                      <span className="font-medium text-gray-700">
                        Expected Crop Type
                      </span>
                    }
                    normalize={(value) =>
                      typeof value === "string" ? value.trimStart() : value
                    }
                    rules={[
                      {
                        max: 50,
                        message: "Crop type must be 50 characters or less",
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (!value.trim()) {
                            return Promise.reject(
                              new Error("Crop type cannot be only spaces"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="E.g., Cucumbers, Tomatoes"
                      className="!h-11 !rounded-xl !border-gray-200 hover:!border-blue-400 focus:!border-blue-500"
                    />
                  </Form.Item>

                  <div className="pt-2">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="!h-11 !w-full !rounded-xl !border-0 !bg-blue-600 !font-medium !shadow-sm hover:!bg-blue-700"
                    >
                      {isEdit ? "Save Dimensions & Status" : "Create Polytunnel"}
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
      `}</style>
    </Drawer>
  );
};

export default TunnelForm;
