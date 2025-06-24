import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  reminderTime?: string;
  reminderEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [50, 'Habit name cannot be more than 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  targetCount: {
    type: Number,
    default: 1,
    min: [1, 'Target count must be at least 1'],
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // reminderTime: {
  //   type: String,
  //   match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'],
  // },
  reminderTime: {
    type: String,
    validate: {
      validator: function(this: IHabit, value: string) {
        if (this.reminderEnabled) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        }
        return true; // If not enabled, don't validate
      },
      message: 'Please enter a valid time format (HH:MM)'
    }
  },
  reminderEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient querying
HabitSchema.index({ userId: 1, categoryId: 1 });
HabitSchema.index({ userId: 1, isActive: 1 });
HabitSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);