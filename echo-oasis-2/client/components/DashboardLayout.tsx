import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Sun, Moon, LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "@/components/NotificationBell";

interface NavigationTab {
  id: number;
  label: string;
  icon: LucideIcon;
  badge?: string | null;
}

interface HeaderAction {
  label: string;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  title: string;
  navigationTabs: NavigationTab[];
  activeTab: number;
  onTabChange: (tabId: number) => void;
  headerActions?: HeaderAction[];
  statusInfo?: {
    status: string;
    statusClassName: string;
    lastUpdated: string;
  };
  children: ReactNode;
  userInfo?: {
    initials: string;
    name: string;
    department: string;
  };
}

export default function DashboardLayout({
  title,
  navigationTabs,
  activeTab,
  onTabChange,
  headerActions = [],
  statusInfo,
  children,
  userInfo = { initials: "Q3C", name: "Q3C Dev", department: "Finance" },
}: DashboardLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`flex h-screen ${isDarkMode ? "dark bg-slate-900" : "bg-gray-50"}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        } border-r transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        <div className="flex-1 p-6">
          {/* Avatar Section */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 mx-auto">
              <span className="text-white font-bold text-lg">
                {userInfo.initials}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="text-center">
                <div
                  className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {userInfo.name}
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {userInfo.department}
                </div>
                <label
                  className={`text-xs cursor-pointer mt-2 inline-block ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Upload avatar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      console.log(e.target.files?.[0]);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-slate-700"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {tab.label}
                      </span>
                      {tab.badge && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isDarkMode
                              ? "bg-slate-700 text-gray-200"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          className={`border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"} p-4`}
        >
          <div className="flex items-center justify-between gap-2">
            {isSidebarOpen && (
              <div
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Dev: <strong>Q3C</strong>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-slate-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-slate-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={`flex-1 flex flex-col overflow-hidden`}>
        {/* TOP BAR */}
        <header
          className={`border-b ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          } px-8 py-4 flex items-center justify-between`}
        >
          <h1
            className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </h1>
          <div className="flex gap-4">
            {headerActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                className={action.className}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
            <NotificationBell isDarkMode={isDarkMode} />
            <Button
              variant="outline"
              className={
                isDarkMode
                  ? "border-slate-600 text-white hover:bg-slate-700"
                  : ""
              }
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* STATUS BAR */}
        {statusInfo && (
          <div
            className={`border-b ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            } px-8 py-4 flex items-center justify-between`}
          >
            <div
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Status:{" "}
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.statusClassName}`}
              >
                {statusInfo.status}
              </span>
            </div>
            <div
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Last updated:{" "}
              <span className="font-semibold">{statusInfo.lastUpdated}</span>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div
          className={`flex-1 overflow-y-auto ${isDarkMode ? "bg-slate-900" : "bg-gray-50"}`}
        >
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
