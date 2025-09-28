import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

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

  // Colors - Professional color scheme
  const primaryColor = '#1e40af'; // Professional blue
  const secondaryColor = '#1e3a8a'; // Darker blue
  const accentColor = '#dc2626'; // Red accent
  const successColor = '#059669'; // Green
  const warningColor = '#d97706'; // Orange
  const textColor = '#111827'; // Almost black
  const lightGray = '#f8fafc';
  const borderColor = '#e2e8f0';
  const mutedColor = '#64748b';

  // Helper functions
  const drawText = (text: string, x: number, y: number, fontSize: number, color: string = textColor, fontWeight: string = 'normal', align: string = 'left') => {
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = align as CanvasTextAlign;
    ctx.fillText(text, x, y);
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = borderColor, width: number = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawRect = (x: number, y: number, w: number, h: number, color: string, fill: boolean = true) => {
    if (fill) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  };

  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, color: string, fill: boolean = true) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // Load and draw logo
  let logoImage = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      logoImage = await loadImage(logoPath);
    }
  } catch (error) {
    console.log('Could not load logo:', error);
  }

  // Header Section with gradient background
  const headerHeight = 220;
  
  // Header background with subtle pattern
  for (let i = 0; i < width; i += 20) {
    drawLine(i, 0, i, headerHeight, lightGray, 0.5);
  }

  // Logo placement
  if (logoImage) {
    const logoSize = 80;
    const logoX = 100;
    const logoY = 70;
    
    // Draw logo with subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    // Fallback logo placeholder
    drawRoundedRect(100, 70, 80, 80, 8, primaryColor);
    drawText('CCI', 140, 115, 20, '#ffffff', 'bold', 'center');
  }

  // Company information
  const companyX = 220;
  drawText('Creative Canvas IT', companyX, 90, 28, primaryColor, 'bold');
  drawText('Professional IT Training & Development', companyX, 120, 18, mutedColor);
  drawText('📧 info@creativecanvasit.com', companyX, 145, 14, textColor);
  drawText('📞 01603-718379', companyX, 165, 14, textColor);
  drawText('📍 34 W Nakhalpara Rd, Dhaka 1215', companyX, 185, 14, textColor);

  // Invoice header
  const invoiceHeaderX = width - 300;
  drawRoundedRect(invoiceHeaderX - 20, 60, 280, 120, 12, lightGray);
  
  drawText('INVOICE', invoiceHeaderX + 120, 95, 32, accentColor, 'bold', 'center');
  drawText(`#${invoiceData.invoiceNumber}`, invoiceHeaderX + 120, 125, 18, textColor, 'bold', 'center');
  
  const invoiceDate = formatDate(invoiceData.createdAt);
  const dueDate = formatDate(invoiceData.dueDate);
  drawText(`Date: ${invoiceDate}`, invoiceHeaderX + 120, 150, 14, textColor, 'normal', 'center');
  drawText(`Due: ${dueDate}`, invoiceHeaderX + 120, 170, 14, textColor, 'normal', 'center');

  // Customer Information Section
  const customerY = 280;
  drawText('Bill To', 100, customerY, 20, textColor, 'bold');
  
  drawRoundedRect(100, customerY + 20, 900, 100, 8, '#ffffff', false);
  drawRect(100, customerY + 20, 900, 100, lightGray);
  
  drawText(invoiceData.studentName, 120, customerY + 50, 18, textColor, 'bold');
  drawText(`📧 ${invoiceData.studentEmail}`, 120, customerY + 75, 14, textColor);
  drawText(`📞 ${invoiceData.studentPhone || 'Not provided'}`, 120, customerY + 95, 14, textColor);

  // Course Details Section
  const detailsY = 420;
  drawText('Course Details', 100, detailsY, 20, textColor, 'bold');
  
  // Enhanced table design
  const tableY = detailsY + 40;
  const tableWidth = width - 200;
  
  // Table header with gradient
  drawRoundedRect(100, tableY, tableWidth, 50, 8, primaryColor);
  drawText('Course Name', 120, tableY + 30, 16, '#ffffff', 'bold');
  drawText('Regular Price', width - 400, tableY + 30, 16, '#ffffff', 'bold', 'right');
  drawText('Discount', width - 250, tableY + 30, 16, '#ffffff', 'bold', 'right');
  drawText('Final Price', width - 100, tableY + 30, 16, '#ffffff', 'bold', 'right');

  // Table row with subtle styling
  const rowY = tableY + 50;
  drawRoundedRect(100, rowY, tableWidth, 60, 0, '#ffffff', false);
  drawRect(100, rowY, tableWidth, 60, '#f8fafc');
  
  drawText(invoiceData.batchName, 120, rowY + 35, 16, textColor);
  drawText(`৳${invoiceData.amount.toLocaleString()}`, width - 400, rowY + 35, 16, mutedColor, 'normal', 'right');
  drawText(`৳${invoiceData.discountAmount.toLocaleString()}`, width - 250, rowY + 35, 16, successColor, 'normal', 'right');
  drawText(`৳${invoiceData.finalAmount.toLocaleString()}`, width - 100, rowY + 35, 18, primaryColor, 'bold', 'right');

  // Payment Summary Section
  const summaryY = rowY + 100;
  drawRoundedRect(width - 500, summaryY, 400, 120, 12, lightGray);
  
  drawText('Payment Summary', width - 480, summaryY + 30, 18, textColor, 'bold');
  
  const totalPaid = invoiceData.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoiceData.finalAmount - totalPaid;
  
  drawText('Total Amount:', width - 480, summaryY + 55, 14, textColor);
  drawText(`৳${invoiceData.finalAmount.toLocaleString()}`, width - 120, summaryY + 55, 16, textColor, 'bold', 'right');
  
  drawText('Amount Paid:', width - 480, summaryY + 75, 14, textColor);
  drawText(`৳${totalPaid.toLocaleString()}`, width - 120, summaryY + 75, 16, successColor, 'bold', 'right');
  
  drawText('Amount Due:', width - 480, summaryY + 95, 14, textColor, 'bold');
  drawText(`৳${remaining.toLocaleString()}`, width - 120, summaryY + 95, 18, remaining > 0 ? accentColor : successColor, 'bold', 'right');

  // Payment History Section
  const paymentY = summaryY + 160;
  if (invoiceData.payments.length > 0) {
    drawText('Payment History', 100, paymentY, 20, textColor, 'bold');
    
    const paymentTableY = paymentY + 40;
    const paymentTableWidth = width - 200;
    
    // Payment table header
    drawRoundedRect(100, paymentTableY, paymentTableWidth, 45, 8, secondaryColor);
    drawText('Date', 120, paymentTableY + 28, 14, '#ffffff', 'bold');
    drawText('Method', 300, paymentTableY + 28, 14, '#ffffff', 'bold');
    drawText('Amount', width - 300, paymentTableY + 28, 14, '#ffffff', 'bold', 'right');
    drawText('Status', width - 120, paymentTableY + 28, 14, '#ffffff', 'bold', 'right');

    // Payment rows with alternating colors
    invoiceData.payments.forEach((payment, index) => {
      const paymentRowY = paymentTableY + 45 + (index * 55);
      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      
      drawRect(100, paymentRowY, paymentTableWidth, 55, rowBg);
      drawLine(100, paymentRowY, width - 100, paymentRowY, borderColor);
      
      drawText(formatDate(payment.submittedAt), 120, paymentRowY + 32, 14, textColor);
      drawText(payment.method.toUpperCase(), 300, paymentRowY + 32, 14, textColor);
      drawText(`৳${payment.amount.toLocaleString()}`, width - 300, paymentRowY + 32, 14, textColor, 'normal', 'right');
      
      // Status badge
      const statusColor = payment.status === 'verified' ? successColor : 
                         payment.status === 'pending' ? warningColor : accentColor;
      drawRoundedRect(width - 150, paymentRowY + 15, 80, 25, 12, statusColor);
      drawText(payment.status.toUpperCase(), width - 110, paymentRowY + 32, 12, '#ffffff', 'bold', 'center');
    });
  }

  // Footer Section
  const footerY = height - 180;
  drawLine(100, footerY, width - 100, footerY, borderColor, 2);
  
  // Thank you message
  drawRoundedRect(100, footerY + 20, width - 200, 80, 12, lightGray);
  drawText('Thank you for choosing Creative Canvas IT!', width / 2, footerY + 50, 18, primaryColor, 'bold', 'center');
  drawText('For any queries, contact us at info@creativecanvasit.com or call 01603-718379', width / 2, footerY + 75, 14, textColor, 'normal', 'center');
  
  // Footer note
  drawText('This is a computer generated invoice and does not require a signature.', width / 2, footerY + 110, 12, mutedColor, 'normal', 'center');
  drawText('Generated on ' + new Date().toLocaleString(), width / 2, footerY + 130, 12, mutedColor, 'normal', 'center');

  // Add decorative elements
  // Top right corner accent with CCI initials
  drawRoundedRect(width - 100, 20, 80, 80, 40, accentColor);
  drawText('CCI', width - 60, 65, 16, '#ffffff', 'bold', 'center');
  
  // Bottom left corner accent
  drawRoundedRect(20, height - 100, 60, 60, 30, primaryColor);

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
