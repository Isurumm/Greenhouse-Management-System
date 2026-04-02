import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateTime } from "luxon";

export const generateOrderReport = ({
  orders,
  generatedAt,
  appliedFilters = {},
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Helper function to check if we need a new page
  const checkPageBreak = (yPos, requiredHeight = 30) => {
    if (yPos + requiredHeight > pageHeight - 10) {
      doc.addPage();
      return 20;
    }
    return yPos;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Order Management Report", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  // Report metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedAt}`, 14, yPosition);
  yPosition += 6;

  // Applied Filters
  const filterTexts = [];
  if (appliedFilters.searchText) {
    filterTexts.push(`Search: ${appliedFilters.searchText}`);
  }
  if (appliedFilters.statusFilter) {
    filterTexts.push(`Status: ${appliedFilters.statusFilter}`);
  }
  if (appliedFilters.paymentFilter !== undefined) {
    filterTexts.push(
      `Payment: ${appliedFilters.paymentFilter ? "Paid" : "Not Paid"}`
    );
  }
  if (appliedFilters.dateRange) {
    filterTexts.push(`Date Range: ${appliedFilters.dateRange}`);
  }

  if (filterTexts.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Filters: ${filterTexts.join(" | ")}`, 14, yPosition);
    yPosition += 6;
  }

  // Summary Statistics Section
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary Statistics", 14, yPosition);
  yPosition += 8;

  const paidOrders = orders.filter((o) => o.isPaid).length;
  const unpaidOrders = orders.filter((o) => !o.isPaid).length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const processingOrders = orders.filter(
    (o) => o.status === "Processing"
  ).length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const averageOrderValue =
    orders.length > 0
      ? orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0) /
        orders.length
      : 0;

  const summaryData = [
    ["Metric", "Value"],
    ["Total Orders", orders.length.toString()],
    ["Paid Orders", paidOrders.toString()],
    ["Unpaid Orders", unpaidOrders.toString()],
    ["Pending", pendingOrders.toString()],
    ["Processing", processingOrders.toString()],
    ["Delivered", deliveredOrders.toString()],
    ["Total Revenue", `Rs. ${totalRevenue.toFixed(2)}`],
    ["Average Order Value", `Rs. ${averageOrderValue.toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 80, halign: "right" },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Detailed Orders Section
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detailed Order Information", 14, yPosition);
  yPosition += 8;

  // Prepare detailed order data
  const orderDetailsData = orders.map((order) => {
    const date = DateTime.fromISO(order.createdAt).toFormat("MMM dd, yyyy");
    const items = order.orderItems
      ? order.orderItems.map((item) => `${item.name} (Qty: ${item.qty})`).join("; ")
      : "-";
    const paymentStatus = order.isPaid ? "Paid" : "Not Paid";

    return [
      order._id.substring(0, 8),
      order.user?.fullName || "Unknown",
      date,
      order.status,
      paymentStatus,
      `Rs. ${Number(order.totalPrice || 0).toFixed(2)}`,
      items,
    ];
  });

  const detailsTableData = [
    [
      "Order ID",
      "Customer",
      "Date",
      "Status",
      "Payment",
      "Total",
      "Items",
    ],
    ...orderDetailsData,
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [detailsTableData[0]],
    body: detailsTableData.slice(1),
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 22 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 72 },
    },
    margin: { left: 12, right: 12 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageWidth = pageSize.getWidth();

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    },
  });

  // Save the PDF
  doc.save(`Orders_Report_${new Date().getTime()}.pdf`);
};
