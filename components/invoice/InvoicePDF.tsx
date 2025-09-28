import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  companyInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  logo: {
    width: 80,
    height: 60,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  invoiceInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 3,
  },
  dueDate: {
    fontSize: 12,
    color: '#374151',
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billToInfo: {
    flex: 1,
    marginRight: 20,
  },
  billToTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  billToDetails: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.5,
  },
  courseInfo: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  courseDetails: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.4,
  },
  itemsTable: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 11,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
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
    borderTopColor: '#1e40af',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    color: '#374151',
  },
  totalLabelFinal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValueFinal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  paymentHistory: {
    marginBottom: 30,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  paymentTable: {
    flexDirection: 'column',
  },
  paymentHeader: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  paymentHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  paymentRowAlt: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  decorativeElement: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
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

interface InvoicePDFProps {
  invoice: InvoiceData;
  student: StudentData;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, student }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return styles.statusPaid;
      case 'pending': return styles.statusPending;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusPending;
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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return method.toUpperCase();
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative Element */}
        <View style={styles.decorativeElement}>
          <Text style={styles.decorativeText}>CCI</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Creative Canvas IT</Text>
            <Text style={styles.companyTagline}>Professional IT Training & Development</Text>
            <Text style={styles.companyDetails}>
              34 W Nakhalpara Rd, Dhaka 1215{'\n'}
              Phone: 01603-718379{'\n'}
              Email: info@creativecanvasit.com
            </Text>
          </View>
          
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Date: {formatDate(invoice.createdAt)}</Text>
            <Text style={styles.dueDate}>Due: {formatDate(invoice.dueDate)}</Text>
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
              Regular Price: ৳{invoice.amount.toLocaleString()}{'\n'}
              {(invoice as any).discountAmount > 0 && `Discount: ৳${(invoice as any).discountAmount.toLocaleString()}{'\n'}`}
              Final Amount: ৳{(invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{invoice.batchId.name}</Text>
            <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>
              ৳{(invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Regular Price:</Text>
              <Text style={styles.totalValue}>৳{invoice.amount.toLocaleString()}</Text>
            </View>
            {(invoice as any).discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>-৳{(invoice as any).discountAmount.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>Total Amount:</Text>
              <Text style={styles.totalValueFinal}>
                ৳{(invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Paid:</Text>
              <Text style={styles.totalValue}>৳{invoice.paidAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Due:</Text>
              <Text style={styles.totalValue}>
                ৳{invoice.remainingAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <View style={styles.paymentHistory}>
            <Text style={styles.paymentTitle}>Payment History</Text>
            <View style={styles.paymentTable}>
              <View style={styles.paymentHeader}>
                <Text style={[styles.paymentHeaderText, { flex: 1 }]}>Date</Text>
                <Text style={[styles.paymentHeaderText, { flex: 1 }]}>Method</Text>
                <Text style={[styles.paymentHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                <Text style={[styles.paymentHeaderText, { flex: 1, textAlign: 'center' }]}>Status</Text>
              </View>
              
              {invoice.payments.map((payment, index) => (
                <View key={index} style={index % 2 === 0 ? styles.paymentRow : styles.paymentRowAlt}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(payment.createdAt)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{getPaymentMethodText(payment.method)}</Text>
                  <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>
                    ৳{payment.amount.toLocaleString()}
                  </Text>
                  <View style={[styles.statusBadge, getStatusColor(payment.status)]}>
                    <Text>{getStatusText(payment.status)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Thank you for choosing Creative Canvas IT!</Text>
          <Text style={styles.footerText}>
            For any queries, contact us at info@creativecanvasit.com
          </Text>
          <Text style={styles.footerText}>
            Phone: 01603-718379 | Address: 34 W Nakhalpara Rd, Dhaka 1215
          </Text>
          <Text style={styles.footerText}>
            This is a computer generated invoice and does not require a signature.
          </Text>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
