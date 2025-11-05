import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/api/auth-api";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole | null;
}

const roleDescriptions = {
  [UserRole.EMPLOYEE]: {
    title: "Employee",
    description: "Submit and manage your expense requests",
    color: "bg-blue-500",
    icon: "👤",
  },
  [UserRole.MANAGER]: {
    title: "Manager",
    description: "Review and approve employee expense requests",
    color: "bg-green-500",
    icon: "👔",
  },
  [UserRole.FINANCE]: {
    title: "Finance",
    description: "Process approved expenses and manage payments",
    color: "bg-purple-500",
    icon: "💰",
  },
};

export default function RoleSelection({
  onRoleSelect,
  selectedRole,
}: RoleSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Your Role
        </h3>
        <p className="text-sm text-gray-600">
          Choose your role to access the appropriate features
        </p>
      </div>

      <div className="grid gap-3">
        {Object.entries(roleDescriptions).map(([role, info]) => (
          <Card
            key={role}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === role
                ? "ring-2 ring-blue-500 shadow-md"
                : "hover:border-gray-300"
            }`}
            onClick={() => onRoleSelect(role as UserRole)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{info.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{info.title}</h4>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
                {selectedRole === role && (
                  <Badge className="bg-blue-500 text-white">Selected</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
