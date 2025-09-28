import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 10,
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  billToInfo: {
    flex: 1,
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  billToDetails: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  courseInfo: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  courseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  courseDetails: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalsContainer: {
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#059669',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: '#374151',
  },
  totalValue: {
    fontSize: 10,
    color: '#374151',
  },
  totalLabelFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValueFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 3,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
});

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  batchId: {
    _id: string;
    name: string;
    regularPrice: number;
    discountPrice?: number;
  };
  studentId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  payments: Array<{
    _id: string;
    amount: number;
    method: 'bkash' | 'nagad' | 'bank_transfer' | 'cash';
    senderNumber: string;
    transactionId?: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    verifiedAt?: string;
  }>;
}

interface StudentData {
  name: string;
  email: string;
  phone?: string;
}

interface SimpleInvoicePDFProps {
  invoice: InvoiceData;
  student: StudentData;
}

const SimpleInvoicePDF: React.FC<SimpleInvoicePDFProps> = ({ invoice, student }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    // Use "BDT" instead of ৳ symbol for better PDF compatibility
    return `BDT ${amount.toLocaleString()}`;
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return method.toUpperCase();
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'VERIFIED';
      case 'pending': return 'PENDING';
      case 'rejected': return 'REJECTED';
      default: return status.toUpperCase();
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Creative Canvas IT</Text>
            <Text style={styles.companyDetails}>
              Professional IT Training & Development{'\n'}
              34 W Nakhalpara Rd, Dhaka 1215{'\n'}
              Phone: 01603-718379{'\n'}
              Email: creativecanvasit@gmail.com
            </Text>
          </View>
          
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Date: {formatDate(invoice.createdAt)}</Text>
            <Text style={styles.invoiceDate}>Due: {formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <View style={styles.billToInfo}>
            <Text style={styles.billToTitle}>Bill To:</Text>
            <Text style={styles.billToDetails}>
              {student.name}{'\n'}
              Email: {student.email}{'\n'}
              Phone: {student.phone || 'Not provided'}
            </Text>
          </View>
          
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>Course Information:</Text>
            <Text style={styles.courseDetails}>
              Course: {invoice.batchId.name}{'\n'}
              Regular Price: {formatCurrency(invoice.amount)}{'\n'}
              {(invoice as any).discountAmount > 0 ? `Discount: ${formatCurrency((invoice as any).discountAmount)}\n` : ''}
              Final Amount: {formatCurrency((invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount))}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{invoice.batchId.name}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
              {formatCurrency((invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount))}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Regular Price:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.amount)}</Text>
            </View>
            {(invoice as any).discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>-{formatCurrency((invoice as any).discountAmount)}</Text>
              </View>
            )}
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>Total Amount:</Text>
              <Text style={styles.totalValueFinal}>
                {formatCurrency((invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount))}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Paid:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.paidAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Due:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.remainingAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Method</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Status</Text>
              </View>
              
              {invoice.payments.map((payment, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(payment.createdAt)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{getPaymentMethodText(payment.method)}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                    {getStatusText(payment.status)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Thank you for choosing Creative Canvas IT!</Text>
          <Text style={styles.footerText}>
            For any queries, contact us at creativecanvasit@gmail.com
          </Text>
          <Text style={styles.footerText}>
            Phone: 01603-718379 | Address: 34 W Nakhalpara Rd, Dhaka 1215
          </Text>
          <Text style={styles.footerText}>
            This is a computer generated invoice and does not require a signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SimpleInvoicePDF;
