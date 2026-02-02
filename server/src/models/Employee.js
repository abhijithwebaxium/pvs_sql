import mongoose from "mongoose";

const { Schema, model } = mongoose;

const EmployeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    ssn: {
      type: String,
      trim: true,
      sparse: true,
    },
    position: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    companyCode: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    supervisorName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["employee", "hr", "approver", "admin"],
      default: "employee",
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    lastHireDate: {
      type: Date,
    },
    employeeType: {
      type: String,
      trim: true,
    },
    salaryType: {
      type: String,
      enum: ["Salary", "Salaried", "Hourly", null],
      default: null,
    },
    salary: {
      type: Number,
      default: 0,
    },
    annualSalary: {
      type: Number,
      default: 0,
    },
    hourlyPayRate: {
      type: Number,
      default: 0,
    },
    bonus2024: {
      type: Number,
      default: 0,
    },
    bonus2025: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: "USA", trim: true },
    },
    isApprover: {
      type: Boolean,
      default: false,
    },
    approverLevel: {
      type: String,
      enum: ["Level-1", "Level-2", "Level-3", "Level-4", "Level-5", null],
      default: null,
    },
    level1Approver: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    level1ApproverName: {
      type: String,
      trim: true,
    },
    level2Approver: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    level2ApproverName: {
      type: String,
      trim: true,
    },
    level3Approver: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    level3ApproverName: {
      type: String,
      trim: true,
    },
    level4Approver: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    level4ApproverName: {
      type: String,
      trim: true,
    },
    level5Approver: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    level5ApproverName: {
      type: String,
      trim: true,
    },
    // Approval status tracking
    approvalStatus: {
      enteredBy: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
      },
      enteredAt: {
        type: Date,
        default: null,
      },
      submittedForApproval: {
        type: Boolean,
        default: false,
      },
      submittedAt: {
        type: Date,
        default: null,
      },
      level1: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: "Employee",
          default: null,
        },
        approvedAt: {
          type: Date,
          default: null,
        },
        comments: {
          type: String,
          trim: true,
        },
      },
      level2: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: "Employee",
          default: null,
        },
        approvedAt: {
          type: Date,
          default: null,
        },
        comments: {
          type: String,
          trim: true,
        },
      },
      level3: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: "Employee",
          default: null,
        },
        approvedAt: {
          type: Date,
          default: null,
        },
        comments: {
          type: String,
          trim: true,
        },
      },
      level4: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: "Employee",
          default: null,
        },
        approvedAt: {
          type: Date,
          default: null,
        },
        comments: {
          type: String,
          trim: true,
        },
      },
      level5: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: "Employee",
          default: null,
        },
        approvedAt: {
          type: Date,
          default: null,
        },
        comments: {
          type: String,
          trim: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

EmployeeSchema.pre("validate", function () {
  if (!this.isApprover) {
    this.approverLevel = null;
  }
});

// Index for efficient queries
// EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ level1Approver: 1 });
EmployeeSchema.index({ level2Approver: 1 });
EmployeeSchema.index({ level3Approver: 1 });
EmployeeSchema.index({ level4Approver: 1 });
EmployeeSchema.index({ level5Approver: 1 });

export default model("Employee", EmployeeSchema);
