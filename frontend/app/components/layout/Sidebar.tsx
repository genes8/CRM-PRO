import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Search,
  BarChart3
} from 'lucide-react';
import { cn } from '~/lib/utils';

const mainMenuNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14">
        <div className="w-7 h-7 bg-[#0d0c22] rounded-md flex items-center justify-center">
          <div className="w-3.5 h-3.5 border-2 border-white rounded-sm" />
        </div>
        <span className="text-lg font-semibold text-[#0d0c22] tracking-tight">CRM Pro</span>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-120px)] overflow-y-auto">
        {/* Main Menu */}
        <nav className="px-3 py-2">
          <p className="px-3 mb-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Main Menu</p>
          <ul className="space-y-0.5">
            {mainMenuNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                    isActive
                      ? 'bg-[#0d0c22] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#0d0c22]'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Help Card */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
            <h4 className="text-[#0d0c22] font-semibold text-[14px] mb-1">Need Help?</h4>
            <p className="text-gray-500 text-[12px] leading-relaxed mb-3">
              Check our documentation for guides and tutorials.
            </p>
            <a
              href="#"
              className="text-[#0d0c22] font-medium text-[12px] hover:underline"
            >
              View Documentation →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
