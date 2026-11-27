import AdminDashboard from "./AdminDashboard";

/**
 * ProDashboard Wrapper Component
 * Provides a dedicated route entry point preconfigured with the "pro" role.
 */
function ProDashboard() {
  return <AdminDashboard role="pro" />;
}

export default ProDashboard;
