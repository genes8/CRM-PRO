import { Outlet, Navigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-[#0d0c22] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Sidebar />
      <Header />
      <main className="ml-48 pt-14 min-h-screen">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
