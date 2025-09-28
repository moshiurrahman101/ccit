import { createCanvas, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

// Register fonts if needed (optional)
// registerFont(path.join(process.cwd(), 'fonts', 'NotoSansBengali-Regular.ttf'), { family: 'Noto Sans Bengali' });

interface InvoiceData {
  invoiceNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  batchName: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  dueDate: string;
  createdAt: string;
  payments: Array<{
    amount: number;
    method: string;
    senderNumber: string;
    transactionId?: string;
    status: string;
    submittedAt: string;
  }>;
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  // Create canvas - A4 size (210mm x 297mm) at 300 DPI
  const width = 2480; // 210mm * 300/25.4
  const height = 3508; // 297mm * 300/25.4
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background color
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Colors
  const primaryColor = '#2563eb'; // Blue
  const secondaryColor = '#1e40af'; // Darker blue
  const accentColor = '#f59e0b'; // Orange
  const textColor = '#1f2937'; // Dark gray
  const lightGray = '#f3f4f6';
  const borderColor = '#e5e7eb';

  // Helper function to draw text
  const drawText = (text: string, x: number, y: number, fontSize: number, color: string = textColor, fontWeight: string = 'normal', align: string = 'left') => {
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = align as CanvasTextAlign;
    ctx.fillText(text, x, y);
  };

  // Helper function to draw line
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = borderColor, width: number = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Helper function to draw rectangle
  const drawRect = (x: number, y: number, width: number, height: number, color: string, fill: boolean = true) => {
    if (fill) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeStyle = color;
      ctx.strokeRect(x, y, width, height);
    }
  };

  // Header Section
  const headerHeight = 200;
  
  // Header background
  drawRect(0, 0, width, headerHeight, lightGray);

  // Logo (if exists)
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      // Note: In a real implementation, you'd load and draw the image
      // For now, we'll use a placeholder
      drawRect(100, 50, 120, 60, primaryColor);
      drawText('LOGO', 160, 85, 16, '#ffffff', 'bold', 'center');
    }
  } catch (error) {
    console.log('Logo not found, using text');
  }

  // Company name and details
  drawText('Creative Computer & IT Training Center', 300, 60, 32, primaryColor, 'bold');
  drawText('CCIT', 300, 90, 24, secondaryColor, 'bold');
  drawText('Professional IT Training & Development', 300, 120, 16, textColor);
  drawText('Email: info@ccit.com | Phone: +880-XXX-XXXXXXX', 300, 140, 14, textColor);
  drawText('Address: Your Business Address, City, Country', 300, 160, 14, textColor);

  // Invoice title and number
  drawText('INVOICE', width - 200, 60, 36, accentColor, 'bold', 'right');
  drawText(`#${invoiceData.invoiceNumber}`, width - 200, 95, 20, textColor, 'bold', 'right');
  drawText(`Date: ${formatDate(invoiceData.createdAt)}`, width - 200, 120, 14, textColor, 'normal', 'right');
  drawText(`Due Date: ${formatDate(invoiceData.dueDate)}`, width - 200, 140, 14, textColor, 'normal', 'right');

  // Customer Information Section
  const customerY = 250;
  drawText('Bill To:', 100, customerY, 18, textColor, 'bold');
  drawRect(100, customerY + 20, 800, 120, '#ffffff', false);
  
  drawText(invoiceData.studentName, 120, customerY + 50, 16, textColor, 'bold');
  drawText(`Email: ${invoiceData.studentEmail}`, 120, customerY + 75, 14, textColor);
  drawText(`Phone: ${invoiceData.studentPhone || 'N/A'}`, 120, customerY + 95, 14, textColor);

  // Invoice Details Section
  const detailsY = 420;
  drawText('Course Details:', 100, detailsY, 18, textColor, 'bold');
  
  // Table header
  const tableY = detailsY + 40;
  drawRect(100, tableY, width - 200, 50, primaryColor);
  drawText('Description', 120, tableY + 30, 16, '#ffffff', 'bold');
  drawText('Amount', width - 300, tableY + 30, 16, '#ffffff', 'bold', 'right');
  drawText('Discount', width - 200, tableY + 30, 16, '#ffffff', 'bold', 'right');

  // Table row
  const rowY = tableY + 50;
  drawRect(100, rowY, width - 200, 60, '#ffffff', false);
  drawText(invoiceData.batchName, 120, rowY + 35, 16, textColor);
  drawText(`৳${invoiceData.amount.toLocaleString()}`, width - 300, rowY + 35, 16, textColor, 'normal', 'right');
  drawText(`৳${invoiceData.discountAmount.toLocaleString()}`, width - 200, rowY + 35, 16, textColor, 'normal', 'right');

  // Total section
  const totalY = rowY + 100;
  drawRect(width - 400, totalY, 300, 80, lightGray);
  drawText('Total Amount:', width - 380, totalY + 30, 16, textColor, 'bold');
  drawText(`৳${invoiceData.finalAmount.toLocaleString()}`, width - 200, totalY + 30, 20, primaryColor, 'bold', 'right');
  drawText('Amount Due:', width - 380, totalY + 55, 16, textColor, 'bold');
  const remainingAmount = invoiceData.finalAmount - invoiceData.payments.reduce((sum, p) => sum + p.amount, 0);
  drawText(`৳${remainingAmount.toLocaleString()}`, width - 200, totalY + 55, 20, remainingAmount > 0 ? accentColor : '#10b981', 'bold', 'right');

  // Payment History Section
  const paymentY = totalY + 120;
  if (invoiceData.payments.length > 0) {
    drawText('Payment History:', 100, paymentY, 18, textColor, 'bold');
    
    // Payment table header
    const paymentTableY = paymentY + 40;
    drawRect(100, paymentTableY, width - 200, 40, secondaryColor);
    drawText('Date', 120, paymentTableY + 25, 14, '#ffffff', 'bold');
    drawText('Method', 300, paymentTableY + 25, 14, '#ffffff', 'bold');
    drawText('Amount', width - 400, paymentTableY + 25, 14, '#ffffff', 'bold', 'right');
    drawText('Status', width - 200, paymentTableY + 25, 14, '#ffffff', 'bold', 'right');

    // Payment rows
    invoiceData.payments.forEach((payment, index) => {
      const paymentRowY = paymentTableY + 40 + (index * 50);
      drawRect(100, paymentRowY, width - 200, 50, '#ffffff', false);
      drawText(formatDate(payment.submittedAt), 120, paymentRowY + 30, 14, textColor);
      drawText(payment.method.toUpperCase(), 300, paymentRowY + 30, 14, textColor);
      drawText(`৳${payment.amount.toLocaleString()}`, width - 400, paymentRowY + 30, 14, textColor, 'normal', 'right');
      
      const statusColor = payment.status === 'verified' ? '#10b981' : payment.status === 'pending' ? accentColor : '#ef4444';
      drawText(payment.status.toUpperCase(), width - 200, paymentRowY + 30, 14, statusColor, 'bold', 'right');
    });
  }

  // Footer Section
  const footerY = height - 150;
  drawLine(100, footerY, width - 100, footerY, borderColor, 2);
  
  drawText('Thank you for choosing CCIT!', width / 2, footerY + 30, 16, primaryColor, 'bold', 'center');
  drawText('For any queries, contact us at info@ccit.com', width / 2, footerY + 55, 14, textColor, 'normal', 'center');
  drawText('This is a computer generated invoice.', width / 2, footerY + 80, 12, textColor, 'normal', 'center');

  // Convert canvas to buffer
  return canvas.toBuffer('image/png');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}