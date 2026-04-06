import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-background text-text-main transition-colors duration-300 animated-bg">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileOpenChange={setMobileMenuOpen} />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-6 pt-0 md:pb-8 lg:pb-10">
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen((o) => !o)}
        />
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
          <div className="space-y-8 pb-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
