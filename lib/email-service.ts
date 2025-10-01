import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  // Check if email configuration is available
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('Email configuration missing. Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env.local file');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

// Email service for sending password reset emails
export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
  try {
    console.log('Starting sendPasswordResetEmail...');
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`Email service not configured. Password reset email would be sent to: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Reset URL: ${resetUrl}`);
      return false;
    }

    console.log('Transporter created successfully');

    // Create simple HTML email template for testing
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Reset - Creative Canvas IT</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎨 Creative Canvas IT</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Empowering Digital Creators</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; text-align: center;">Password Reset Request</h2>
          
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>We received a request to reset your password for your Creative Canvas IT account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          
          <p style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
            © ${new Date().getFullYear()} Creative Canvas IT. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    console.log('HTML template created');

    // Create text version for email clients that don't support HTML
    const textTemplate = `
Password Reset Request - Creative Canvas IT

Hello ${name},

We received a request to reset your password for your Creative Canvas IT account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email.

For security reasons, never share this link with anyone.

Best regards,
Creative Canvas IT Team
    `;

    // Send email
    console.log('Attempting to send email...');
    const mailOptions = {
      from: `"Creative Canvas IT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Creative Canvas IT',
      text: textTemplate,
      html: htmlTemplate,
    };
    
    console.log('Mail options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
    
    const info = await transporter.sendMail(mailOptions);

    console.log('Password reset email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Email service for sending welcome emails
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`Email service not configured. Welcome email would be sent to: ${email}`);
      return false;
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Creative Canvas IT</title>
        <style>
          /* Reset styles for email clients */
          body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
          }
          
          /* Main styles */
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          
          .email-wrapper {
            padding: 40px 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }
          
          .email-content {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.1;
          }
          
          .logo {
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .tagline {
            position: relative;
            z-index: 1;
            font-size: 14px;
            color: #d1fae5;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .title {
            color: #1f2937;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
            text-align: center;
            line-height: 1.3;
          }
          
          .greeting {
            font-size: 18px;
            color: #4b5563;
            margin-bottom: 24px;
          }
          
          .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .features-list {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .features-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            text-align: center;
          }
          
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 15px;
            color: #4b5563;
          }
          
          .feature-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            font-size: 16px;
          }
          
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: #ffffff;
            padding: 18px 36px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          
          .cta-button:hover::before {
            left: 100%;
          }
          
          .celebration {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }
          
          .celebration-text {
            color: #92400e;
            font-size: 16px;
            font-weight: 600;
            margin: 0;
          }
          
          .support-note {
            background-color: #f1f5f9;
            border-left: 4px solid #10b981;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .support-note-text {
            color: #475569;
            font-size: 14px;
            font-weight: 500;
          }
          
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-content {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
          }
          
          .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 12px;
          }
          
          .social-links {
            margin: 20px 0;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #64748b;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
          }
          
          .social-link:hover {
            color: #10b981;
          }
          
          /* Mobile responsive styles */
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .title {
              font-size: 24px;
            }
            
            .cta-button {
              padding: 16px 28px;
              font-size: 15px;
              width: 100%;
              box-sizing: border-box;
            }
            
            .footer {
              padding: 20px;
            }
            
            .features-list {
              padding: 20px;
            }
          }
          
          @media only screen and (max-width: 480px) {
            .email-wrapper {
              padding: 10px 5px;
            }
            
            .header {
              padding: 25px 15px;
            }
            
            .content {
              padding: 25px 15px;
            }
            
            .title {
              font-size: 22px;
            }
            
            .greeting {
              font-size: 16px;
            }
            
            .description {
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-wrapper">
            <div class="email-content">
              <div class="header">
                <div class="logo">🎨 Creative Canvas IT</div>
                <div class="tagline">Empowering Digital Creators</div>
              </div>
              
              <div class="content">
                <h1 class="title">Welcome to Creative Canvas IT!</h1>
                
                <p class="greeting">Hello <strong>${name}</strong>,</p>
                
                <p class="description">
                  Welcome to Creative Canvas IT! We're absolutely thrilled to have you join our community 
                  of passionate learners and digital creators. Your journey to mastering cutting-edge 
                  technology starts now!
                </p>
                
                <div class="celebration">
                  <p class="celebration-text">🎉 Your account has been successfully created! 🎉</p>
                </div>
                
                <div class="features-list">
                  <div class="features-title">What you can do now:</div>
                  <div class="feature-item">
                    <span class="feature-icon">📚</span>
                    Access all our premium courses and learning materials
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🎥</span>
                    Join live sessions and interactive workshops
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">👥</span>
                    Connect with fellow students and expert mentors
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    Track your learning progress and achievements
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">💼</span>
                    Build a portfolio of real-world projects
                  </div>
                </div>
                
                <div class="button-container">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="cta-button">Get Started Now</a>
                </div>
                
                <div class="support-note">
                  <p class="support-note-text">
                    Need help getting started? Our support team is here to assist you every step of the way. 
                    Don't hesitate to reach out if you have any questions!
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-content">
                  <div class="footer-logo">Creative Canvas IT</div>
                  
                  <div class="social-links">
                    <a href="#" class="social-link">Website</a>
                    <a href="#" class="social-link">Support</a>
                    <a href="#" class="social-link">Community</a>
                  </div>
                  
                  <p>
                    Thank you for choosing Creative Canvas IT!<br>
                    Let's create something amazing together.<br><br>
                    <strong>&copy; ${new Date().getFullYear()} Creative Canvas IT. All rights reserved.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
Welcome to Creative Canvas IT!

Hello ${name},

Welcome to Creative Canvas IT! We're excited to have you join our community.

Your account has been successfully created. You can now access all our courses and learning materials.

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

If you have any questions, don't hesitate to reach out to our support team.

Thank you for choosing Creative Canvas IT!

Best regards,
Creative Canvas IT Team
    `;

    const info = await transporter.sendMail({
      from: `"Creative Canvas IT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Creative Canvas IT!',
      text: textTemplate,
      html: htmlTemplate,
    });

    console.log('Welcome email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Generic OTP email sender for sensitive actions (e.g., payment deletion)
export async function sendOtpEmail(email: string, name: string, code: string, purpose = 'Payment Deletion Verification'): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`Email service not configured. OTP would be sent to: ${email} Code: ${code}`);
      return false;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:560px; margin:auto;">
        <h2 style="margin:0 0 12px 0;">${purpose}</h2>
        <p style="margin:0 0 8px 0;">Hi ${name || ''},</p>
        <p style="margin:0 0 12px 0;">Your one-time verification code is:</p>
        <div style="font-size: 22px; font-weight: bold; letter-spacing: 4px; background:#f5f5f5; padding:12px 16px; border-radius:8px; display:inline-block;">
          ${code}
        </div>
        <p style="margin:12px 0 0 0;">This code will expire in 15 minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Creative Canvas IT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${purpose} - ${code}`,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}