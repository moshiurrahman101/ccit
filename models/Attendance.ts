import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId; // Required - attendance is per batch
  scheduleId?: mongoose.Types.ObjectId; // Link to specific scheduled class
  classDate: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  markedBy: mongoose.Types.ObjectId; // mentor or admin who marked attendance
  markedAt: Date;
  isOnline: boolean; // true for online classes, false for offline
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  scheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  classDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  checkInTime: Date,
  checkOutTime: Date,
  notes: {
    type: String,
    trim: true
  },
  markedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same student on same schedule/date
AttendanceSchema.index({ student: 1, batch: 1, classDate: 1 }, { unique: true });
AttendanceSchema.index({ student: 1, scheduleId: 1 }, { unique: true, sparse: true });

// Index for efficient queries
AttendanceSchema.index({ classDate: 1, status: 1 });
AttendanceSchema.index({ markedBy: 1, markedAt: 1 });
AttendanceSchema.index({ course: 1, classDate: 1 });
AttendanceSchema.index({ batch: 1, classDate: 1 });

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
