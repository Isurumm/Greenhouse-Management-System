import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePolytunnelReport = (reportData) => {
  const {
    tunnels = [],
    employees = [],
    generatedAt = new Date().toLocaleString(),
  } = reportData || {};

  // Create PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Helper function to add text with word wrapping
  const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize / 2.5);
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (yPos, requiredHeight = 30) => {
    if (yPos + requiredHeight > pageHeight - 10) {
      doc.addPage();
      return 20;
    }
    return yPos;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Polytunnel Management Report", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 12;

  // Report metadata
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  const metadataText = `Generated: ${generatedAt} | Total Tunnels: ${tunnels.length} | Staff Records: ${employees.length}`;
  doc.text(metadataText, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  // Horizontal line
  doc.setDrawColor(0, 0, 0);
  doc.line(10, yPosition, pageWidth - 10, yPosition);
  yPosition += 6;

  // Summary Statistics Section
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Summary Statistics", 12, yPosition);
  yPosition += 8;

  const activeTunnels = tunnels.filter((t) => t.status === "Active").length;
  const maintenanceTunnels = tunnels.filter((t) => t.status === "Maintenance")
    .length;
  const fallowTunnels = tunnels.filter((t) => t.status === "Fallow").length;
  const unassignedStaff = employees.filter((e) => !e.assignedTunnel).length;

  const summaryData = [
    ["Metric", "Count"],
    ["Total Polytunnels", tunnels.length.toString()],
    ["Active Tunnels", activeTunnels.toString()],
    ["Maintenance Tunnels", maintenanceTunnels.toString()],
    ["Fallow Tunnels", fallowTunnels.toString()],
    ["Total Staff", employees.length.toString()],
    ["Unassigned Staff", unassignedStaff.toString()],
    ["Assigned Staff", (employees.length - unassignedStaff).toString()],
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
      1: { cellWidth: 50, halign: "right" },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Detailed Polytunnel Information
  yPosition = checkPageBreak(yPosition, 40);

  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Detailed Polytunnel Information", 12, yPosition);
  yPosition += 8;

  // Create table data for all tunnels
  const tunnelTableData = [
    ["Name", "Size", "Crop Type", "Status", "Created Date"],
  ];

  tunnels.forEach((tunnel) => {
    const createdDate = tunnel.createdAt
      ? new Date(tunnel.createdAt).toLocaleDateString()
      : "N/A";

    tunnelTableData.push([
      tunnel.name || "N/A",
      tunnel.size || "N/A",
      tunnel.cropType || "Not specified",
      tunnel.status || "N/A",
      createdDate,
    ]);
  });

  autoTable(doc, {
    startY: yPosition,
    head: [tunnelTableData[0]],
    body: tunnelTableData.slice(1),
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35 },
    },
    margin: { left: 12, right: 12 },
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Staff Assignment Details
  yPosition = checkPageBreak(yPosition, 40);

  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Staff Assignment Details", 12, yPosition);
  yPosition += 8;

  if (employees.length > 0) {
    const staffTableData = [
      ["Staff Name", "Assigned Tunnel", "Status", "Joining Date"],
    ];

    employees.forEach((emp) => {
      const joiningDate = emp.createdAt
        ? new Date(emp.createdAt).toLocaleDateString()
        : "N/A";

      staffTableData.push([
        emp.fullName || "N/A",
        emp.assignedTunnel?.name || "Unassigned",
        emp.assignedTunnel ? "Assigned" : "Unassigned",
        joiningDate,
      ]);
    });

    autoTable(doc, {
      startY: yPosition,
      head: [staffTableData[0]],
      body: staffTableData.slice(1),
      theme: "striped",
      headStyles: {
        fillColor: [251, 146, 60],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
      },
      margin: { left: 12, right: 12 },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text("No staff records available.", 12, yPosition);
    yPosition += 8;
  }

  // Tunnel-wise Staff Assignment
  yPosition = checkPageBreak(yPosition, 40);

  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Tunnel-wise Staff Assignment", 12, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  let hasAssignments = false;
  tunnels.forEach((tunnel) => {
    yPosition = checkPageBreak(yPosition, 15);

    const tunnelStaff = employees.filter((e) => e.assignedTunnel?._id === tunnel._id);

    if (tunnelStaff.length > 0) {
      hasAssignments = true;
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.text(`${tunnel.name} (${tunnel.status})`, 12, yPosition);
      yPosition += 5;

      doc.setFont(undefined, "normal");
      doc.setFontSize(9);
      tunnelStaff.forEach((staff) => {
        if (yPosition + 4 > pageHeight - 10) {
          doc.addPage();
          yPosition = 15;
        }
        doc.text(`• ${staff.fullName}`, 16, yPosition);
        yPosition += 4;
      });
      yPosition += 2;
    }
  });

  if (!hasAssignments) {
    doc.setFontSize(10);
    doc.text("No staff assignments available.", 12, yPosition);
    yPosition += 8;
  }

  // Add footer
  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(128, 128, 128);

    // Page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
    }
  };

  addFooter();

  // Generate filename with timestamp
  const timestamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const filename = `Polytunnel_Report_${timestamp}.pdf`;

  // Download the PDF
  doc.save(filename);
};
