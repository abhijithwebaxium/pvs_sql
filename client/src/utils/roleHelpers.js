// Role-based access control utilities
// NO LONGER ENFORCES ROLE RESTRICTIONS - All functions return true

export const ROLES = {
  EMPLOYEE: "employee",
  APPROVER: "approver",
  HR: "hr",
  ADMIN: "admin",
};

// Check if user has specific role - ALWAYS RETURNS TRUE
export const hasRole = (user, role) => {
  return true;
};

// Check if user has any of the specified roles - ALWAYS RETURNS TRUE
export const hasAnyRole = (user, roles) => {
  return true;
};

// Check if user is admin - ALWAYS RETURNS TRUE
export const isAdmin = (user) => {
  return true;
};

// Check if user is HR - ALWAYS RETURNS TRUE
export const isHR = (user) => {
  return true;
};

// Check if user is approver - ALWAYS RETURNS TRUE
export const isApprover = (user) => {
  return true;
};

// Check if user is employee - ALWAYS RETURNS TRUE
export const isEmployee = (user) => {
  return true;
};

// Check if user can manage employees - ALWAYS RETURNS TRUE
export const canManageEmployees = (user) => {
  return true;
};

// Check if user can manage branches - ALWAYS RETURNS TRUE
export const canManageBranches = (user) => {
  return true;
};

// Check if user can approve - ALWAYS RETURNS TRUE
export const canApprove = (user) => {
  return true;
};

// Check if user can view bonuses - ALWAYS RETURNS TRUE
export const canViewBonuses = (user) => {
  return true;
};

// Check if user can manage bonuses - ALWAYS RETURNS TRUE
export const canManageBonuses = (user) => {
  return true;
};

// Get user display name
export const getUserDisplayName = (user) => {
  if (!user) return "User";
  return user.fullName
    || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user.firstName
    || "User";
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.EMPLOYEE]: "Employee",
    [ROLES.APPROVER]: "Approver",
    [ROLES.HR]: "HR Manager",
    [ROLES.ADMIN]: "Administrator",
  };
  return roleNames[role] || role;
};
