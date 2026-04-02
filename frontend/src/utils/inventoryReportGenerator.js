import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getStockStatus = (product) => {
  if (product.countInStock <= 0) return "Out of Stock";
  if (product.countInStock <= product.minStockLevel) return "Low Stock";
  return "In Stock";
};

export const generateInventoryReport = ({
  products,
  transactionsByProduct,
  generatedAt,
  appliedFilters,
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Inventory Management Report", pageWidth / 2, 16, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedAt}`, 14, 24);

  const filterText = [
    `Search: ${appliedFilters.searchText || "None"}`,
    `Status: ${appliedFilters.statusFilter || "None"}`,
    `Category: ${appliedFilters.categoryFilter || "None"}`,
  ].join(" | ");
  doc.text(`Filters: ${filterText}`, 14, 30);

  const inStockCount = products.filter((p) => getStockStatus(p) === "In Stock").length;
  const lowStockCount = products.filter((p) => getStockStatus(p) === "Low Stock").length;
  const outOfStockCount = products.filter((p) => getStockStatus(p) === "Out of Stock").length;

  autoTable(doc, {
    startY: 36,
    head: [["Summary Metric", "Value"]],
    body: [
      ["Total Products", String(products.length)],
      ["In Stock", String(inStockCount)],
      ["Low Stock", String(lowStockCount)],
      ["Out of Stock", String(outOfStockCount)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [[
      "Name",
      "Category",
      "Price (Rs)",
      "Current Stock",
      "Min Level",
      "Status",
      "Created",
      "Updated",
    ]],
    body: products.map((p) => [
      p.name || "N/A",
      p.category || "N/A",
      Number(p.price || 0).toFixed(2),
      String(p.countInStock ?? 0),
      String(p.minStockLevel ?? 0),
      getStockStatus(p),
      p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A",
      p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "N/A",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [39, 174, 96] },
    margin: { left: 10, right: 10 },
  });

  products.forEach((product, index) => {
    const transactions = transactionsByProduct[product._id] || [];

    doc.addPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Product Details: ${product.name || "Unnamed Product"}`, 14, 14);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const details = [
      `Category: ${product.category || "N/A"}`,
      `Price: Rs.${Number(product.price || 0).toFixed(2)}`,
      `Current Stock: ${product.countInStock ?? 0}`,
      `Minimum Level: ${product.minStockLevel ?? 0}`,
      `Status: ${getStockStatus(product)}`,
      `Description: ${product.description || "N/A"}`,
      `Image URL: ${product.image || "N/A"}`,
      `Created At: ${product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}`,
      `Updated At: ${product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "N/A"}`,
    ];

    let y = 22;
    details.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 5;
    });

    autoTable(doc, {
      startY: y + 2,
      head: [["Date", "Type", "Quantity", "Reference", "Recorded By"]],
      body:
        transactions.length > 0
          ? transactions.map((tx) => [
              tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A",
              tx.type || "N/A",
              String(tx.quantity ?? 0),
              tx.reference || "N/A",
              tx.user?.fullName || tx.user?.email || "N/A",
            ])
          : [["N/A", "No Transactions", "0", "N/A", "N/A"]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [230, 126, 34] },
      margin: { left: 10, right: 10 },
    });

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Product ${index + 1} of ${products.length}`,
      pageWidth - 40,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.setTextColor(0);
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.getHeight() - 8);
    doc.setTextColor(0);
  }

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  doc.save(`Inventory_Report_${stamp}.pdf`);
};
