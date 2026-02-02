import PropTypes from "prop-types";

/**
 * Component to conditionally render children based on user role
 * NO LONGER ENFORCES ROLE RESTRICTIONS - Always shows children
 * @param {Array} allowedRoles - DEPRECATED - No longer used
 * @param {ReactNode} children - Content to render
 * @param {ReactNode} fallback - DEPRECATED - No longer used
 */
const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
  // No role checking - always show children
  return children;
};

RoleGuard.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default RoleGuard;
