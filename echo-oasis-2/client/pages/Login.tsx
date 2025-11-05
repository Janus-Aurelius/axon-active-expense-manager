import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/api/auth-api";
import { useAuth } from "@/lib/auth-context";
import RoleSelection from "@/components/RoleSelection";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading, isAuthenticated, setDevRole } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setDevRole(role);
    setShowRoleSelection(false);
  };

  const handleBackToRoleSelection = () => {
    setShowRoleSelection(true);
    setSelectedRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role before signing in.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(email, password);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Navigation is handled by the useEffect hook when isAuthenticated changes
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during login.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="flex justify-center mb-8">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2460/2460529.png"
              alt="ExpenseFlow logo"
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to manage your expenses
          </p>

          {showRoleSelection ? (
            <div>
              <RoleSelection
                onRoleSelect={handleRoleSelect}
                selectedRole={selectedRole}
              />
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Development Mode: Select your role to continue
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-900">
                      Role: {selectedRole}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBackToRoleSelection}
                    className="text-xs"
                  >
                    Change
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
