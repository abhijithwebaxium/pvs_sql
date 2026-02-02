import { DataTypes, Op } from 'sequelize';

let Employee = null;

export const initEmployeeModel = (sequelize) => {
  if (Employee) {
    return Employee;
  }

  Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  ssn: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  jobTitle: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  companyCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  supervisorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  supervisorName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('employee', 'hr', 'approver', 'admin'),
    defaultValue: 'employee',
  },
  hireDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  lastHireDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  employeeType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  salaryType: {
    type: DataTypes.ENUM('Salary', 'Salaried', 'Hourly'),
    allowNull: true,
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  annualSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  hourlyPayRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  bonus2024: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  bonus2025: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  // Address fields (flattened)
  addressStreet: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  addressCity: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  addressState: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  addressZipCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  addressCountry: {
    type: DataTypes.STRING(100),
    defaultValue: 'USA',
  },
  // Approver fields
  isApprover: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approverLevel: {
    type: DataTypes.ENUM('Level-1', 'Level-2', 'Level-3', 'Level-4', 'Level-5'),
    allowNull: true,
  },
  level1ApproverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  level1ApproverName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  level2ApproverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  level2ApproverName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  level3ApproverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  level3ApproverName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  level4ApproverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  level4ApproverName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  level5ApproverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  level5ApproverName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  // Approval status - stored as JSON for simplicity
  approvalStatus: {
    type: DataTypes.TEXT, // Using TEXT instead of JSON for SQL Server compatibility
    allowNull: true,
    defaultValue: null,
    get() {
      const rawValue = this.getDataValue('approvalStatus');
      if (!rawValue) {
        return {
          enteredBy: null,
          enteredAt: null,
          submittedForApproval: false,
          submittedAt: null,
          level1: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level2: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level3: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level4: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level5: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
        };
      }
      try {
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      } catch (e) {
        console.error('Error parsing approvalStatus:', e);
        return {
          enteredBy: null,
          enteredAt: null,
          submittedForApproval: false,
          submittedAt: null,
          level1: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level2: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level3: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level4: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
          level5: { status: 'pending', approvedBy: null, approvedAt: null, comments: null },
        };
      }
    },
    set(value) {
      if (value === null || value === undefined) {
        this.setDataValue('approvalStatus', null);
      } else {
        this.setDataValue('approvalStatus', typeof value === 'string' ? value : JSON.stringify(value));
      }
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Employees',
  timestamps: true,
  indexes: [
    { fields: ['employeeId'], unique: true },
    // Note: Removed unique index on email with WHERE clause - SQL Server will handle this via column constraint
    { fields: ['isActive'] },
    { fields: ['level1ApproverId'] },
    { fields: ['level2ApproverId'] },
    { fields: ['level3ApproverId'] },
    { fields: ['level4ApproverId'] },
    { fields: ['level5ApproverId'] },
    { fields: ['supervisorId'] },
  ],
  });

  // Define associations
  Employee.belongsTo(Employee, { as: 'supervisor', foreignKey: 'supervisorId' });
  Employee.belongsTo(Employee, { as: 'level1Approver', foreignKey: 'level1ApproverId' });
  Employee.belongsTo(Employee, { as: 'level2Approver', foreignKey: 'level2ApproverId' });
  Employee.belongsTo(Employee, { as: 'level3Approver', foreignKey: 'level3ApproverId' });
  Employee.belongsTo(Employee, { as: 'level4Approver', foreignKey: 'level4ApproverId' });
  Employee.belongsTo(Employee, { as: 'level5Approver', foreignKey: 'level5ApproverId' });

  return Employee;
};

export const getEmployee = () => {
  if (!Employee) {
    throw new Error('Employee model not initialized. Call initEmployeeModel() first.');
  }
  return Employee;
};

export default { initEmployeeModel, getEmployee };
