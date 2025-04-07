import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Custom formatter to use INR text instead of symbol
export const formatCurrency = (amount: number) => {
  return `INR ${amount.toFixed(2)}`;
};

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#4b5563", // Tailwind gray-600
    position: "relative",
  },
  // Coffee bean decorative element (top right)
  coffeeIcon1: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 30,
    height: 30,
  },
  // Coffee bean decorative element (bottom left)
  coffeeIcon2: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 30,
    height: 30,
  },
  // Elegant header with minimal design
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // Tailwind gray-200
    paddingBottom: 20,
  },
  headerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 3,
    backgroundColor: "#8d6e63", // Coffee brown
  },
  cafeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000", // Black for main heading as requested
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  cafeDetails: {
    fontSize: 10,
    color: "#6b7280", // Tailwind gray-500
    marginBottom: 2,
  },
  // Clean invoice title section
  invoiceSection: {
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000", // Black for main heading
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 10,
    color: "#6b7280", // Tailwind gray-500
  },
  // Two-column layout for customer and invoice details
  infoContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  infoColumn: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000", // Black for headings
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 10,
    color: "#6b7280", // Tailwind gray-500
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: "#4b5563", // Tailwind gray-600
  },
  // Elegant table with subtle styling
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb", // Tailwind gray-200
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000", // Black for headings
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6", // Tailwind gray-100
    paddingVertical: 10,
  },
  tableCell: {
    fontSize: 11,
    color: "#4b5563", // Tailwind gray-600
  },
  col1: { width: "50%", paddingRight: 10 },
  col2: { width: "20%", textAlign: "center" },
  col3: { width: "30%", textAlign: "right" },
  // Clean total section
  totalSection: {
    alignSelf: "flex-end",
    width: "40%",
    marginBottom: 40,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb", // Tailwind gray-200
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000", // Black for headings
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000", // Black for headings
  },
  // Elegant thank you message
  thankYou: {
    textAlign: "center",
    fontSize: 14,
    color: "#8d6e63", // Coffee brown
    fontStyle: "italic",
    marginBottom: 30,
  },
  // Minimal footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb", // Tailwind gray-200
    paddingTop: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280", // Tailwind gray-500
    textAlign: "center",
  },
  footerDivider: {
    fontSize: 9,
    color: "#9ca3af", // Tailwind gray-400
    marginHorizontal: 5,
  },
});

interface InvoiceItem {
  name: string;
  qty: number;
  price: string;
}

interface InvoicePDFProps {
  customerName: string;
  paymentMode: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  calculateTotal: () => number;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ 
  customerName, 
  paymentMode, 
  invoiceNumber, 
  items, 
  calculateTotal 
}) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Decorative coffee elements */}
        <Image src="https://cdn-icons-png.flaticon.com/512/2935/2935307.png" style={pdfStyles.coffeeIcon1} />
        <Image src="https://cdn-icons-png.flaticon.com/512/2935/2935307.png" style={pdfStyles.coffeeIcon2} />
        
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerAccent} />
          <Text style={pdfStyles.cafeName}>Lavish Cafe</Text>
          <Text style={pdfStyles.cafeDetails}>4.9 (34 Google reviews) • Where Every Cup Tells a Story</Text>
        </View>
        
        {/* Invoice Title Section */}
        <View style={pdfStyles.invoiceSection}>
          <Text style={pdfStyles.invoiceTitle}>Invoice</Text>
          <Text style={pdfStyles.invoiceDate}>{formattedDate}</Text>
        </View>
        
        {/* Two-column info section */}
        <View style={pdfStyles.infoContainer}>
          <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.infoTitle}>Customer Information</Text>
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Name</Text>
              <Text style={pdfStyles.infoValue}>{customerName}</Text>
            </View>
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Payment Method</Text>
              <Text style={pdfStyles.infoValue}>{paymentMode}</Text>
            </View>
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Date & Time</Text>
              <Text style={pdfStyles.infoValue}>
                {today.toLocaleDateString('en-IN')} {today.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
          
          <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.infoTitle}>Invoice Details</Text>
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Invoice Number</Text>
              <Text style={pdfStyles.infoValue}>{invoiceNumber}</Text>
            </View>
          </View>
        </View>
        
        {/* Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col1]}>Item</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col2]}>Qty</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.col3]}>Price</Text>
          </View>
          
          {items.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, pdfStyles.col1]}>{item.name}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.col2]}>{item.qty}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.col3]}>
                {formatCurrency(parseFloat(item.price || "0"))}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Total Section */}
        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.grandTotal}>
            <Text style={pdfStyles.grandTotalLabel}>Total</Text>
            <Text style={pdfStyles.grandTotalValue}>
              {formatCurrency(calculateTotal())}
            </Text>
          </View>
        </View>
        
        {/* Thank You Note */}
        <Text style={pdfStyles.thankYou}>Thank you for visiting Lavish Cafe!</Text>
        
        {/* Footer */}
        <View style={pdfStyles.footer}>
          <View style={pdfStyles.footerRow}>
            <Text style={pdfStyles.footerText}>380, 4th cross, New BEL Rd, Chikkamaranahalli</Text>
            <Text style={pdfStyles.footerDivider}>•</Text>
            <Text style={pdfStyles.footerText}>Mathikere, Bengaluru, Karnataka 560054</Text>
          </View>
          <View style={pdfStyles.footerRow}>
            <Text style={pdfStyles.footerText}>Phone: 073490 60598</Text>
            <Text style={pdfStyles.footerDivider}>•</Text>
            <Text style={pdfStyles.footerText}>Hours: 8:00 AM - 10:00 PM (Closed on Mondays)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
