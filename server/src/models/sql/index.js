import { initEmployeeModel, getEmployee } from './Employee.js';
import { initBranchModel, getBranch } from './Branch.js';

let Employee = null;
let Branch = null;

// Initialize all models - call this after database connection
export const initModels = (sequelize) => {
  if (Employee && Branch) {
    return { Employee, Branch };
  }

  // Initialize Employee first (no dependencies)
  Employee = initEmployeeModel(sequelize);

  // Initialize Branch (depends on Employee)
  Branch = initBranchModel(sequelize, Employee);

  return { Employee, Branch };
};

// Get initialized models (will throw if not initialized)
export const getModels = () => {
  return {
    Employee: getEmployee(),
    Branch: getBranch(),
  };
};

// Export individual getters
export { getEmployee as Employee, getBranch as Branch };

// Default export
export default {
  initModels,
  getModels,
};
