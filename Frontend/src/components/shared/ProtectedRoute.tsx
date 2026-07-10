import { Navigate } from "react-router";
import { useAuth } from "../../store/authContext";

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/administrator/login" replace />;
  }
  // When a role is required, reject users who don't have it (defence-in-depth
  // alongside the server-side [Authorize(Roles="Admin")] checks).
  if (role && currentRole !== role) {
    return <Navigate to="/administrator/login" replace />;
  }
  return <>{children}</>;
}
