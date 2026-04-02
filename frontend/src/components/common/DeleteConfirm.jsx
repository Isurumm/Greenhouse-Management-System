import React, { useState } from "react";
import { Modal, Button } from "antd";
import { RiDeleteBin6Line } from "react-icons/ri";

const DeleteConfirm = ({
  title = "Are you sure?",
  description = "Do you really want to delete these records? This process cannot be undone.",
  onConfirm,
  okText = "Delete",
  cancelText = "Cancel",
  disabled = false,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = (e) => {
    if (disabled) return;
    if (children?.props?.onClick) {
      children.props.onClick(e);
    }
    setOpen(true);
  };

  const handleCancel = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (onConfirm) {
        await onConfirm();
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: handleOpen,
        })}

      <Modal
        open={open}
        onCancel={handleCancel}
        footer={null}
        centered
        closable
        destroyOnHidden
        width={500}
      >
        <div className="relative bg-white px-7 pb-7 pt-8 text-center ">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <div className="flex h-16 w-16 items-center justify-center">
                <RiDeleteBin6Line className="text-4xl text-red-600" />
              </div>
            </div>

            <h3 className="mb-2 text-[26px] font-semibold tracking-tight text-gray-900">
              {title}
            </h3>

            <p className="mx-auto max-w-[290px] text-[14px] leading-6 text-gray-500">
              {description}
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="!h-11 !min-w-[110px] !rounded-xl !border !border-gray-200 !bg-white !px-6 !text-sm !font-medium !text-gray-700 !shadow-sm hover:!border-gray-300 hover:!bg-gray-50 hover:!text-gray-900"
              >
                {cancelText}
              </Button>

              <Button
              type="primary"
                danger
                loading={loading}
                onClick={handleConfirm}
                className="!h-11 !min-w-[110px] !rounded-xl !border-0  !px-6 !text-sm !font-medium !text-white !shadow-sm "
              >
                {okText}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeleteConfirm;