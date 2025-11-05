import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, PieChart, Zap } from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: TrendingDown,
      title: "Track Expenses",
      description: "Monitor your spending with detailed categorization and analytics",
    },
    {
      icon: PieChart,
      title: "Budget Planning",
      description: "Set budgets and get alerts when you're about to exceed limits",
    },
    {
      icon: Zap,
      title: "Smart Insights",
      description: "Get AI-powered recommendations to optimize your spending",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2460/2460529.png"
              alt="ExpenseFlow logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ExpenseFlow
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/admin">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                Admin Panel
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6 text-sm font-medium text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Smart Expense Management
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Take Control of Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Financial Life
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              ExpenseFlow helps you track, analyze, and optimize your spending
              with intuitive tools and powerful insights. Start building better
              financial habits today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2 text-gray-700 hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 mb-20 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-12 aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl font-bold mb-4">📊</div>
                  <p className="text-xl font-semibold">
                    Dashboard Preview Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Finances
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your money efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Master Your Expenses?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of users taking control of their finances
          </p>
          <Link to="/signup">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2460/2460529.png"
              alt="ExpenseFlow logo"
              className="w-6 h-6"
            />
            <span className="font-semibold text-white">ExpenseFlow</span>
          </div>
          <p className="mb-6">
            Smart expense tracking for smarter financial decisions
          </p>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-sm text-gray-500">
              © 2024 ExpenseFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
