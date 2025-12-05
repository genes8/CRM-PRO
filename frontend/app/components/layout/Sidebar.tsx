import { NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '~/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">CRM Pro</span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            Need Help?
          </h4>
          <p className="text-xs text-slate-600 mb-3">
            Check our documentation for guides and tutorials.
          </p>
          <a
            href="#"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View Documentation →
          </a>
        </div>
      </div>
    </aside>
  );
}
