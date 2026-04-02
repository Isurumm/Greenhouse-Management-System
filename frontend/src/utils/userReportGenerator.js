import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateTime } from "luxon";

const getRoleDisplayName = (role) => {
  const roleMap = {
    admin: "Administrator",
    userCustomerManager: "User/Customer HR Manager",
    orderManager: "Order Manager",
    inventoryManager: "Inventory Manager",
    polytunnelManager: "Polytunnel Manager",
    customer: "Customer",
  };
  return roleMap[role] || "Unknown";
};

export const generateUserReport = ({
  users,
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
  doc.text("User Directory & Access Control Report", pageWidth / 2, yPosition, {
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
  if (appliedFilters.roleFilter) {
    filterTexts.push(`Role: ${appliedFilters.roleFilter}`);
  }
  if (appliedFilters.statusFilter) {
    filterTexts.push(`Status: ${appliedFilters.statusFilter}`);
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

  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalManagers = users.filter(
    (u) => u.role !== "customer" && u.role !== "admin"
  ).length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  const roleBreakdown = {
    admin: users.filter((u) => u.role === "admin").length,
    userCustomerManager: users.filter((u) => u.role === "userCustomerManager")
      .length,
    orderManager: users.filter((u) => u.role === "orderManager").length,
    inventoryManager: users.filter((u) => u.role === "inventoryManager")
      .length,
    polytunnelManager: users.filter((u) => u.role === "polytunnelManager")
      .length,
    customer: users.filter((u) => u.role === "customer").length,
  };

  const summaryData = [
    ["Metric", "Count"],
    ["Total Users", users.length.toString()],
    ["Active Users", activeUsers.toString()],
    ["Inactive Users", inactiveUsers.toString()],
    ["Administrators", totalAdmins.toString()],
    ["Managers/Staff", totalManagers.toString()],
    ["Customers", totalCustomers.toString()],
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

  // Role Breakdown Section
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Role Distribution", 14, yPosition);
  yPosition += 8;

  const roleBreakdownData = Object.entries(roleBreakdown).map(([role, count]) => [
    getRoleDisplayName(role),
    count.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Role", "Count"]],
    body: roleBreakdownData,
    theme: "grid",
    headStyles: {
      fillColor: [168, 85, 247],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: "right" },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Detailed Users Section
  yPosition = checkPageBreak(yPosition, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detailed User Information", 14, yPosition);
  yPosition += 8;

  // Prepare detailed user data
  const userDetailsData = users.map((userObj) => {
    const createdDate = DateTime.fromISO(userObj.createdAt).toFormat("MMM dd, yyyy");
    const status = userObj.isActive ? "Active" : "Inactive";
    const role = getRoleDisplayName(userObj.role);

    return [
      userObj._id.substring(0, 8),
      userObj.name || "-",
      userObj.email || "-",
      role,
      status,
      createdDate,
    ];
  });

  const detailsTableData = [
    ["User ID", "Full Name", "Email", "Role", "Status", "Created Date"],
    ...userDetailsData,
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
      0: { cellWidth: 18 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35 },
      4: { cellWidth: 18 },
      5: { cellWidth: 59 },
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
  doc.save(`Users_Report_${new Date().getTime()}.pdf`);
};
