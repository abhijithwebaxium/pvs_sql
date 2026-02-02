import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const BranchSchema = new Schema(
  {
    branchCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'USA', trim: true },
    },
    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
BranchSchema.index({ branchCode: 1 });
BranchSchema.index({ isActive: 1 });

export default model('Branch', BranchSchema);
