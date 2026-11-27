import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
