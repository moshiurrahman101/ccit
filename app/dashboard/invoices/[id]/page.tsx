'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Printer,
  Receipt, 
  Calendar, 
  User, 
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  FileText,
  Building2
} from 'lucide-react';
import { formatBanglaNumber, formatBanglaDate, formatBanglaCurrency } from '@/lib/utils/banglaNumbers';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import SimpleInvoicePDF from '@/components/invoice/SimpleInvoicePDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { toast } from 'sonner';

interface Invoice {
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
  payments: Payment[];
}

interface Payment {
  _id: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'bank_transfer' | 'cash';
  senderNumber: string;
  transactionId?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
}

interface StudentData {
  name: string;
  email: string;
  phone?: string;
}

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
      };
      
      const token = getCookie('auth-token');
      
      const response = await fetch(`/api/students/invoices/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        
        // Fetch student data
        const studentResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          setStudent({
            name: studentData.user?.name || studentData.name,
            email: studentData.user?.email || studentData.email,
            phone: studentData.user?.phone || studentData.phone
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch invoice');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'পরিশোধিত';
      case 'partial': return 'আংশিক পরিশোধিত';
      case 'pending': return 'অপেক্ষমান';
      case 'overdue': return 'মেয়াদ উত্তীর্ণ';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'যাচাইকৃত';
      case 'pending': return 'অপেক্ষমান';
      case 'rejected': return 'প্রত্যাখ্যান';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'bank_transfer': return 'ব্যাংক ট্রান্সফার';
      case 'cash': return 'নগদ';
      default: return method;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'bkash': return '💳';
      case 'nagad': return '💳';
      case 'bank_transfer': return '🏦';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col space-y-4">
        <p>Invoice not found or you don't have permission to view it.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ফিরে যান
        </Button>
      </div>
    );
  }

  if (!invoice || !student) {
    return (
      <div className="flex justify-center items-center h-screen flex-col space-y-4">
        <p>Invoice not found or you don't have permission to view it.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ফিরে যান
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="self-start no-print"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান
        </Button>
        
        <div className="flex gap-2 no-print">
          <PDFDownloadLink
            document={<SimpleInvoicePDF invoice={invoice} student={student} />}
            fileName={`invoice-${invoice.invoiceNumber}.pdf`}
            onError={(error) => {
              console.error('PDF generation error:', error);
              toast.error(`PDF generation failed: ${(error as any)?.message || 'Unknown error'}`);
            }}
          >
            {({ loading, error }) => (
              <Button
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
                onClick={() => {
                  if (error) {
                    toast.error('PDF generation failed. Please try again.');
                  }
                }}
              >
                <Download className="h-4 w-4" />
                {loading ? "Generating..." : error ? "Retry PDF" : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
        <Card className="max-w-4xl mx-auto invoice-print border-orange-200 shadow-lg">
        <CardHeader className="border-b-2 border-orange-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-orange-600">Invoice #{invoice.invoiceNumber}</CardTitle>
              <p className="text-muted-foreground">
                {formatBanglaDate(invoice.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getStatusColor(invoice.status)}>
                {getStatusText(invoice.status)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Due: {formatBanglaDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Company Header */}
          <div className="mb-8 border-b pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Creative Canvas IT Logo" 
                    className="h-16 w-auto object-contain"
                    onError={(e) => {
                      // Fallback if logo not found
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                {/* Company name removed - logo is shown above */}
                <p className="text-muted-foreground mb-1">Professional IT Training & Development</p>
                <p className="text-muted-foreground mb-1">34 W Nakhalpara Rd, Dhaka 1215</p>
                <p className="text-muted-foreground mb-1">Phone: 01603-718379</p>
                <p className="text-muted-foreground">Email: creativecanvasit@gmail.com</p>
              </div>
              
              <div className="flex-1 text-right">
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-muted-foreground">{student.email}</p>
                  <p className="text-muted-foreground">{student.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold mb-2 text-orange-700">Course Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Course Name</p>
                <p className="font-medium">{invoice.batchId?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular Price</p>
                <CurrencyDisplay amount={invoice.amount} />
              </div>
              {(invoice as any).discountAmount > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Discount</p>
                  <CurrencyDisplay amount={(invoice as any).discountAmount} className="text-orange-600" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Final Amount</p>
                <CurrencyDisplay amount={(invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount)} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4 text-orange-700">Items</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-orange-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-white">Description</th>
                    <th className="px-4 py-3 text-right font-medium text-white">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3">{invoice.batchId.name}</td>
                    <td className="px-4 py-3 text-right">
                      <CurrencyDisplay amount={(invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount)} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between">
                <span>Regular Price:</span>
                <CurrencyDisplay amount={invoice.amount} />
              </div>
              {(invoice as any).discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <CurrencyDisplay amount={-(invoice as any).discountAmount} className="text-orange-600" />
                </div>
              )}
              <div className="flex justify-between border-t-2 border-orange-200 pt-2 font-bold text-lg">
                <span>Total Amount:</span>
                <CurrencyDisplay amount={(invoice as any).finalAmount || (invoice.amount - (invoice as any).discountAmount)} className="text-orange-600" />
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <CurrencyDisplay amount={invoice.paidAmount} />
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Amount Due:</span>
                <CurrencyDisplay 
                  amount={invoice.remainingAmount} 
                  className={invoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'} 
                />
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-orange-700">Payment History</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-orange-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-white">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-white">Method</th>
                      <th className="px-4 py-3 text-right font-medium text-white">Amount</th>
                      <th className="px-4 py-3 text-center font-medium text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment, index) => (
                      <tr key={index} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}>
                        <td className="px-4 py-3">{formatBanglaDate(payment.createdAt)}</td>
                        <td className="px-4 py-3">{getPaymentMethodText(payment.method)}</td>
                        <td className="px-4 py-3 text-right">
                          <CurrencyDisplay amount={payment.amount} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {getPaymentStatusText(payment.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-orange-200 text-center text-sm text-muted-foreground">
            <h3 className="font-semibold text-orange-600 mb-2">Thank you for choosing Creative Canvas IT!</h3>
            <p className="mb-1">For any queries, contact us at creativecanvasit@gmail.com</p>
            <p className="mb-1">Phone: 01603-718379 | Address: 34 W Nakhalpara Rd, Dhaka 1215</p>
            <p>Please make payment by the due date to avoid late fees.</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .invoice-print {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}