import AdminDashboard from "./AdminDashboard";

/**
 * PlusDashboard Wrapper Component
 * Provides a dedicated route entry point preconfigured with the "plus" role.
 */
function PlusDashboard() {
  return <AdminDashboard role="plus" />;
}

export default PlusDashboard;
