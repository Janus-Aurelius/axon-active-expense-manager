import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case "EMPLOYEE":
          navigate("/employee", { replace: true });
          break;
        case "MANAGER":
          navigate("/manager", { replace: true });
          break;
        case "FINANCE":
          navigate("/finance", { replace: true });
          break;
        default:
          // Default to employee dashboard if role is unknown
          navigate("/employee", { replace: true });
          break;
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while determining where to redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
