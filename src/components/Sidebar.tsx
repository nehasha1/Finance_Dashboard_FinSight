import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, ChevronLeft, ChevronRight, Target, Settings, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { APP_NAME_HTML } from '../constants/brand';
import Logo from './Logo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

const Sidebar = ({ mobileOpen, onMobileOpenChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Target },
  ];

  const sidebarVariants = {
    expanded: { width: '256px' },
    collapsed: { width: '80px' },
  };

  const user = {
    name: 'Neha Sha',
    email: 'shaneha289@gmail.com',
    avatar: null // Placeholder for profile image
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => onMobileOpenChange(false)}
          aria-hidden
        />
      )}

      <motion.aside
        id="app-sidebar"
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen shrink-0 overflow-visible border-r border-border-main bg-surface transition-colors duration-300',
          'lg:static lg:z-20 lg:h-full',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="relative flex h-full flex-col p-4">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'absolute -right-3 top-10 z-[100] hidden h-7 w-7 items-center justify-center rounded-full',
              'border-2 border-background bg-primary text-white shadow-lg ring-2 ring-primary/20',
              'transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'dark:border-slate-900 lg:flex'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div className={cn('mb-10 flex items-center gap-3 overflow-hidden px-2', isCollapsed ? 'justify-center' : '')}>
            <div className="flex h-10 min-w-[40px] shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm ring-2 ring-primary/30">
              <Logo className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap text-xl font-bold tracking-tight text-text-main"
              >
                {APP_NAME_HTML.lead}
                <span className="text-primary">{APP_NAME_HTML.accent}</span>
              </motion.h1>
            )}
          </div>

          <nav className="flex-1 space-y-2 overflow-hidden" aria-label="Main">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onMobileOpenChange(false)}
                title={isCollapsed ? item.name : ''}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all',
                    isCollapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:bg-background'
                  )
                }
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <item.icon className="h-6 w-6 shrink-0" />
                </motion.div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="whitespace-nowrap font-semibold"
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section: Settings & Profile */}
          <div className="mt-auto border-t border-border-main/50 pt-4 space-y-2">
            <button
              title={isCollapsed ? 'Settings' : ''}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-background hover:text-primary',
                isCollapsed ? 'justify-center' : ''
              )}
            >
              <Settings className="h-6 w-6 shrink-0" />
              {!isCollapsed && <span className="font-semibold">Settings</span>}
            </button>

            <div 
              className={cn(
                'flex items-center gap-3 rounded-2xl bg-background/50 p-2 border border-border-main/30',
                isCollapsed ? 'justify-center' : 'px-3 py-2.5'
              )}
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              
              {!isCollapsed && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-sm font-bold text-text-main">{user.name}</p>
                  <p className="truncate text-[10px] font-medium text-text-muted">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
