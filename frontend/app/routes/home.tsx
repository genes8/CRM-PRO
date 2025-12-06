import { Navigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { ArrowRight, Shield, BarChart3, Users } from 'lucide-react';
import { Button } from '~/components/ui';

export function meta() {
  return [
    { title: "CRM Pro - Professional Dashboard Solution" },
    { name: "description", content: "Manage your business with our professional dashboard solution." },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] via-white to-orange-50/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0d0c22] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm" />
            </div>
            <span className="text-xl font-semibold text-[#0d0c22]">CRM Pro</span>
          </div>
          <a href="/api/auth/google/login">
            <Button>
              Sign in with Google
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-medium mb-6">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Professional Dashboard Solution
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-[#0d0c22] mb-6 leading-tight">
            Manage Your Business
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> Analytics</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Streamline your sales process, track deals, manage contacts, and boost productivity with our elegant dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/auth/google/login">
              <Button size="lg" className="w-full sm:w-auto">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Get Started with Google
              </Button>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
            <div className="p-3 bg-orange-50 rounded-xl w-fit mb-4">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#0d0c22] mb-2">Contact Management</h3>
            <p className="text-gray-600">
              Organize and track all your contacts in one place. Never lose touch with important leads.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
            <div className="p-3 bg-green-50 rounded-xl w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#0d0c22] mb-2">Deal Pipeline</h3>
            <p className="text-gray-600">
              Visualize your sales pipeline and track deals from lead to close with ease.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
            <div className="p-3 bg-purple-50 rounded-xl w-fit mb-4">
              <Shield className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#0d0c22] mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your data is protected with enterprise-grade security and HTTP-only authentication.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © 2024 CRM Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
