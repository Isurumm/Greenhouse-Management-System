import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateTime } from "luxon";

export const generateDeliveryReport = ({
  orders,
  drivers,
  vehicles,
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
  doc.text("Delivery & Logistics Report", pageWidth / 2, yPosition, {
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
  if (appliedFilters.driverFilter) {
    filterTexts.push(`Driver: ${appliedFilters.driverFilter}`);
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

  const processingOrders = orders.filter((o) => o.status === "Processing").length;
  const shippedOrders = orders.filter((o) => o.status === "Shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const unassignedOrders = orders.filter((o) => !o.assignedDriver).length;
  const assignedOrders = orders.filter((o) => o.assignedDriver).length;

  const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
  const availableDrivers = drivers.filter((d) => d.status === "Available").length;
  const onRouteDrivers = drivers.filter((d) => d.status === "On Route").length;

  const summaryData = [
    ["Metric", "Value"],
    ["Total Orders", orders.length.toString()],
    ["Awaiting Dispatch", processingOrders.toString()],
    ["On Route (Shipped)", shippedOrders.toString()],
    ["Delivered", deliveredOrders.toString()],
    ["Assigned to Driver", assignedOrders.toString()],
    ["Unassigned Orders", unassignedOrders.toString()],
    ["Total Vehicles", vehicles.length.toString()],
    ["Active Vehicles", activeVehicles.toString()],
    ["Total Drivers", drivers.length.toString()],
    ["Available Drivers", availableDrivers.toString()],
    ["On Route Drivers", onRouteDrivers.toString()],
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
      0: { cellWidth: 110 },
      1: { cellWidth: 70, halign: "right" },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Detailed Orders Section
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detailed Delivery Orders", 14, yPosition);
  yPosition += 8;

  // Prepare detailed order data
  const orderDetailsData = orders.map((order) => {
    const date = DateTime.fromISO(order.createdAt).toFormat("MMM dd, yyyy");
    const destination = `${order.shippingAddress?.city || "-"}, ${
      order.shippingAddress?.postalCode || "-"
    }`;
    const driver = order.assignedDriver ? order.assignedDriver.fullName : "Unassigned";
    const items = order.orderItems
      ? order.orderItems.map((item) => `${item.name} (${item.qty})`).join("; ")
      : "-";

    return [
      order._id.substring(0, 8),
      date,
      destination,
      driver,
      order.status,
      `Rs. ${Number(order.totalPrice || 0).toFixed(2)}`,
      items,
    ];
  });

  const detailsTableData = [
    ["Order ID", "Date", "Destination", "Driver", "Status", "Total", "Items"],
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
      0: { cellWidth: 20 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 66 },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Vehicle Section Header
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Vehicle Management", 14, yPosition);
  yPosition += 8;

  // Vehicles Data
  const vehicleData = vehicles.map((v) => [
    v.licensePlate || "-",
    v.model || "-",
    v.capacity || "-",
    v.status || "Unknown",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["License Plate", "Model", "Capacity", "Status"]],
    body: vehicleData.length > 0 ? vehicleData : [["No vehicles found", "-", "-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 85 },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Personnel Section Header
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Personnel Management", 14, yPosition);
  yPosition += 8;
  const driverData = drivers.map((d) => {
    let vehicleInfo = "Not Assigned";
    if (d.assignedVehicle) {
      // If assignedVehicle is populated as an object
      if (typeof d.assignedVehicle === "object" && d.assignedVehicle.licensePlate) {
        vehicleInfo = d.assignedVehicle.licensePlate;
      } else if (typeof d.assignedVehicle === "string") {
        // If it's just an ID, find it in vehicles array
        const assignedVehicle = vehicles.find((v) => v._id?.toString() === d.assignedVehicle?.toString());
        vehicleInfo = assignedVehicle ? assignedVehicle.licensePlate : "Vehicle Not Found";
      }
    }
    return [
      d.fullName || "-",
      d.phone || "-",
      d.licenseNumber || "-",
      vehicleInfo,
      d.status || "Unknown",
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [["Driver Name", "Phone", "License", "Assigned Vehicle", "Status"]],
    body: driverData.length > 0 ? driverData : [["No drivers found", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 24 },
      2: { cellWidth: 28 },
      3: { cellWidth: 36 },
      4: { cellWidth: 84 },
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
  doc.save(`Delivery_Report_${new Date().getTime()}.pdf`);
};
