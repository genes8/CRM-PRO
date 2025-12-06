import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-48 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14">
        <div className="w-6 h-6 bg-[#0d0c22] rounded-md flex items-center justify-center">
          <div className="w-3 h-3 border-[1.5px] border-white rounded-sm" />
        </div>
        <span className="text-base font-semibold text-[#0d0c22] tracking-tight">CRM Pro</span>
      </div>

      <div className="flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
        {/* Main Menu */}
        <nav className="px-2 py-3">
          <p className="px-2 mb-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Menu</p>
          <ul className="space-y-0.5">
            {mainMenuNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-[#0d0c22] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#0d0c22]'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Help Card */}
        <div className="px-2 py-3 border-t border-gray-100">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg">
            <h4 className="text-[#0d0c22] font-semibold text-xs mb-1">Need Help?</h4>
            <p className="text-gray-500 text-[10px] leading-relaxed mb-2">
              Check our docs for guides.
            </p>
            <a href="https://github.com/genes8/CRM-PRO/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="text-[#0d0c22] font-medium text-[10px] hover:underline">
              View Docs →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
