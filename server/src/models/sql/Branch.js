import { DataTypes } from 'sequelize';

let Branch = null;

export const initBranchModel = (sequelize, Employee) => {
  if (Branch) return Branch;

  Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  branchCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  branchName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false,
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
  // Contact info
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Branches',
  timestamps: true,
  indexes: [
    { fields: ['branchCode'], unique: true },
    { fields: ['isActive'] },
  ],
  });

  // Define associations
  Branch.belongsTo(Employee, { as: 'manager', foreignKey: 'managerId' });

  return Branch;
};

export const getBranch = () => {
  if (!Branch) {
    throw new Error('Branch model not initialized. Call initBranchModel() first.');
  }
  return Branch;
};

export default { initBranchModel, getBranch };
