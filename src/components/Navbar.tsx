import { Menu, X, Moon, Sun, ShieldCheck, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { APP_NAME_HTML } from '../constants/brand';
import { cn } from '../utils/cn';

type NavbarProps = {
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
};

const Navbar = ({ mobileMenuOpen, onMobileMenuToggle }: NavbarProps) => {
  const { role, setRole, isDarkMode, toggleDarkMode } = useAppContext();

  return (
    <header
      className={cn(
        'sticky top-0 z-[60] w-full border-b border-border-main bg-background/95 px-4 py-3 backdrop-blur-md md:px-8 lg:px-10 lg:py-3.5'
      )}
    >
      <div className="flex w-full items-center gap-3">
        <motion.button
          type="button"
          onClick={onMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-controls="app-sidebar"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-main bg-surface text-text-main shadow-sm',
            'transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'lg:hidden'
          )}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={2.25} /> : <Menu className="h-5 w-5" strokeWidth={2.25} />}
        </motion.button>

        <div className="min-w-0 flex-1 lg:flex-none">
          <p className="truncate text-lg font-bold tracking-tight text-text-main lg:hidden">
            {APP_NAME_HTML.lead}
            <span className="text-primary">{APP_NAME_HTML.accent}</span>
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="flex rounded-xl border border-border-main bg-surface p-1"
            role="group"
            aria-label="Access mode"
          >
            <motion.button
              type="button"
              onClick={() => setRole('Admin')}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:px-3.5',
                role === 'Admin'
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border-main'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setRole('Viewer')}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all sm:px-3.5',
                role === 'Viewer'
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border-main'
                  : 'text-text-muted hover:text-text-main'
              )}
            >
              <UserCircle className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Viewer</span>
            </motion.button>
          </div>

          <motion.button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            whileTap={{ scale: 0.96 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-main bg-surface text-text-muted transition-all hover:bg-background"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
