import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface IPasswordResetModel extends mongoose.Model<IPasswordReset> {
  createResetToken(email: string): Promise<IPasswordReset>;
  verifyAndUseToken(token: string): Promise<IPasswordReset | null>;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: [true, 'Token is required']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
PasswordResetSchema.index({ email: 1 });
PasswordResetSchema.index({ token: 1 });
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create reset token
PasswordResetSchema.statics.createResetToken = async function(email: string) {
  // Generate random token
  const token = require('crypto').randomBytes(32).toString('hex');
  
  // Remove any existing tokens for this email
  await this.deleteMany({ email, used: false });
  
  // Create new reset token
  const resetToken = new this({
    email,
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  });
  
  await resetToken.save();
  return resetToken;
};

// Static method to verify and use reset token
PasswordResetSchema.statics.verifyAndUseToken = async function(token: string) {
  const resetToken = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!resetToken) {
    return null;
  }
  
  // Mark token as used
  resetToken.used = true;
  await resetToken.save();
  
  return resetToken;
};

export const PasswordReset = mongoose.models.PasswordReset || mongoose.model<IPasswordReset, IPasswordResetModel>('PasswordReset', PasswordResetSchema);
export default PasswordReset;
