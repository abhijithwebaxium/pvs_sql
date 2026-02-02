import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";
import { ROLES } from "../utils/roleHelpers";

/**
 * Custom hook for role-based access control
 * NO LONGER ENFORCES ROLE RESTRICTIONS - All checks return true
 * @returns {Object} Role checking utilities
 */
export const useRole = () => {
  const user = useSelector(selectUser);

  return {
    user,
    // All role checks return true - no restrictions
    hasRole: (role) => true,
    hasAnyRole: (roles) => true,
    isAdmin: true,
    isHR: true,
    isApprover: true,
    isEmployee: true,
    canManageEmployees: true,
    canManageBranches: true,
    canApprove: true,
    canViewBonuses: true,
    canManageBonuses: true,
    ROLES,
  };
};
