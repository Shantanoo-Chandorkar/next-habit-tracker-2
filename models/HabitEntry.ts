import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitEntry extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  completed: boolean;
  completedCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HabitEntrySchema: Schema = new Schema({
  habitId: {
    type: Schema.Types.ObjectId,
    ref: 'Habit',
    required: [true, 'Habit ID is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient querying
HabitEntrySchema.index({ userId: 1, date: -1 });
HabitEntrySchema.index({ habitId: 1, date: -1 });
HabitEntrySchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export default mongoose.models.HabitEntry || mongoose.model<IHabitEntry>('HabitEntry', HabitEntrySchema);