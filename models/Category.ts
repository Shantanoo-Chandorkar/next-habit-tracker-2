import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  color: string;
  icon: string;
  userId?: mongoose.Types.ObjectId | null; // Make it optional in the TypeScript interface
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [30, 'Category name cannot be more than 30 characters'],
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
  },
  icon: {
    type: String,
    required: [true, 'Category icon is required'],
    trim: true,
  },
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   // Make userId conditionally required:
  //   // It is required ONLY if isDefault is false.
  //   validate: {
  //     validator: function(this: ICategory, value: any) {
  //       // userId is required if isDefault is false
  //       if (!this.isDefault && !value) {
  //         return false;
  //       }
  //       return true;
  //     },
  //     message: 'User ID is required'
  //   },
  //   default: null, // Set a default of null for when it's not required (i.e., for default categories)
  // },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(this: ICategory, value: any) {
        // userId is required if isDefault is false
        if (!this.isDefault && !value) {
          return false;
        }
        return true;
      },
      message: 'User ID is required'
    },
    default: null, // Set a default of null for when it's not required (i.e., for default categories)
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying
CategorySchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true, $ne: null } } });
CategorySchema.index({ isDefault: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);