# 📧 Email Setup Guide for Creative Canvas IT

## The Issue
Your email service is currently not configured, which is why you're not receiving password reset emails. The system is only logging to the console instead of actually sending emails.

## 🔧 Solution: Configure Gmail SMTP

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. In the same Security section, find **App passwords**
2. Click **App passwords**
3. Select **Mail** and **Other (custom name)**
4. Enter "Creative Canvas IT" as the name
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this)

### Step 3: Create .env.local File
Create a file named `.env.local` in your project root with the following content:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/creative-canvas-it

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email Configuration - Gmail SMTP
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 4: Replace Placeholder Values
Replace the following values in your `.env.local` file:

- `your-email@gmail.com` → Your actual Gmail address (for EMAIL_USER)
- `your-16-character-app-password` → The app password you generated in Step 2 (for EMAIL_APP_PASSWORD)
- `your-super-secret-jwt-key-change-this-in-production` → A random secret string
- `your-nextauth-secret-key-change-this-in-production` → Another random secret string

### Step 5: Restart Your Development Server
After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## 🧪 Testing Email Functionality

### Test Password Reset
1. Go to `http://localhost:3000/forgot-password`
2. Enter your email address
3. Click "Send Reset Link"
4. Check your email inbox (and spam folder)

### Expected Behavior
- ✅ Success message: "Password reset email sent successfully"
- ✅ Email arrives in your inbox with a professional HTML template
- ✅ Reset link works and redirects to password reset page

## 🎨 Email Features Implemented

### Beautiful HTML Templates
- **Professional Design**: Modern, responsive email templates
- **Brand Identity**: Creative Canvas IT branding with colors and styling
- **Security Warnings**: Clear expiration notices and security reminders
- **Mobile Friendly**: Responsive design that works on all devices

### Email Types Supported
1. **Password Reset Emails**
   - Secure reset links with 1-hour expiration
   - Professional HTML template with branding
   - Clear instructions and security warnings

2. **Welcome Emails** (Ready for future use)
   - Welcome message for new users
   - Dashboard access links
   - Feature overview

## 🔒 Security Features

- **App Password**: Uses Gmail's secure app password system
- **HTTPS**: Secure SMTP connection
- **Link Expiration**: Password reset links expire in 1 hour
- **Token Validation**: Secure token generation and validation

## 🚨 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Ensure 2FA is enabled on your Gmail account
   - Double-check the app password (16 characters, no spaces)
   - Verify the email address is correct

2. **"Connection refused"**
   - Check your internet connection
   - Ensure SMTP_PORT is set to 587
   - Try SMTP_PORT 465 if 587 doesn't work

3. **"Email not received"**
   - Check spam/junk folder
   - Verify the email address in SMTP_USER
   - Wait 1-2 minutes for delivery

4. **"Invalid credentials"**
   - Regenerate the app password
   - Ensure no extra spaces in .env.local values
   - Restart the development server after changes

### Debug Mode
If emails still don't work, check the console output. You should see:
```
Password reset email sent successfully: <message-id>
```

If you see:
```
Email service not configured. Password reset email would be sent to: ...
```
Then your .env.local file is not being read properly.

## 📱 Alternative Email Services

If Gmail doesn't work, you can use other SMTP providers:

### Outlook/Hotmail
```bash
EMAIL_USER=your-email@outlook.com
EMAIL_APP_PASSWORD=your-password
# Note: For Outlook, you may need to modify the email service to use different SMTP settings
```

### Yahoo Mail
```bash
EMAIL_USER=your-email@yahoo.com
EMAIL_APP_PASSWORD=your-app-password
# Note: For Yahoo, you may need to modify the email service to use different SMTP settings
```

### SendGrid (Professional)
```bash
EMAIL_USER=apikey
EMAIL_APP_PASSWORD=your-sendgrid-api-key
# Note: For SendGrid, you may need to modify the email service to use different SMTP settings
```

## 🎯 Next Steps

Once email is working:
1. Test the complete password reset flow
2. Consider adding email verification for new registrations
3. Set up email notifications for admin actions
4. Add email templates for other system notifications

## 📞 Support

If you continue having issues:
1. Check the browser console for errors
2. Verify your .env.local file syntax
3. Test with a different email provider
4. Check your firewall/antivirus settings

---

**Note**: Keep your `.env.local` file secure and never commit it to version control. The app password is sensitive information that should be kept private.
