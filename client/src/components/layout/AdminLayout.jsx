import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  BarChart3,
  Archive,
  Cat,
  ChevronsLeft,
  ChevronsRight,
  Home,
  Image as ImageIcon,
  LogOut,
  Ticket,
  Users,
} from 'lucide-react';
import BackNavigation from '../shared/BackNavigation';

const SIDEBAR_PREF_KEY = 'admin-sidebar-collapsed';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem(SIDEBAR_PREF_KEY);
    setIsCollapsed(savedPreference === 'true');
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((current) => {
      const nextValue = !current;
      localStorage.setItem(SIDEBAR_PREF_KEY, String(nextValue));
      return nextValue;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = useMemo(
    () => [
      { name: 'Dashboard', path: '/admin', icon: <BarChart3 className="h-5 w-5" />, exact: true },
      { name: 'Manage Bookings', path: '/admin/bookings', icon: <Ticket className="h-5 w-5" /> },
      { name: 'Manage Animals', path: '/admin/animals', icon: <Cat className="h-5 w-5" /> },
      { name: 'Manage Tickets', path: '/admin/tickets', icon: <Ticket className="h-5 w-5" /> },
      { name: 'Gallery & Events', path: '/admin/gallery', icon: <ImageIcon className="h-5 w-5" /> },
      { name: 'Manage Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
      { name: 'History', path: '/admin/history', icon: <Archive className="h-5 w-5" /> },
    ],
    []
  );

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="drawer min-h-screen bg-[#f6f3ea] lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <div className="navbar w-full border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur lg:hidden">
          <div className="flex-none">
            <label htmlFor="admin-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-6 w-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2 text-xl font-bold uppercase tracking-wider">Lahore Zoo Admin</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        <main className="mx-auto w-full max-w-7xl flex-1 p-6 lg:p-10">
          <div className="mb-6">
            <BackNavigation fallbackTo="/" label="Back" />
          </div>
          <Outlet />
        </main>
      </div>

      <div className="drawer-side z-40 shadow-xl">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div
          className={`flex min-h-full flex-col items-stretch border-r border-emerald-100 bg-white transition-[width] duration-300 ${
            isCollapsed ? 'w-24' : 'w-72'
          }`}
        >
          <div className="flex items-start justify-between border-b border-gray-100 p-6">
            <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
              <h2 className="text-2xl font-bold tracking-tighter uppercase text-primary">Zoo Admin</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Management Portal</p>
            </div>
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 lg:inline-flex"
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex-1 p-4">
            <div className="rounded-[1.75rem] border border-emerald-100/80 bg-[#f8faf6] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <ul className="menu w-full gap-2 bg-transparent p-0">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    title={item.name}
                    className={({ isActive }) =>
                      `rounded-xl p-3 transition-all ${isCollapsed ? 'justify-center' : 'flex items-center gap-3'} ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-emerald-900/10'
                          : 'text-slate-700 hover:bg-white hover:text-emerald-800 hover:shadow-sm'
                      }`
                    }
                  >
                    {item.icon}
                    {!isCollapsed ? <span className="font-semibold">{item.name}</span> : null}
                  </NavLink>
                </li>
              ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto border-t border-emerald-100 bg-[#f8f6ef] p-4">
            <Link
              to="/"
              title="Back to Home"
              className={`mb-4 inline-flex items-center rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-950 ${
                isCollapsed ? 'w-full justify-center' : 'w-full justify-start gap-2'
              }`}
            >
              <Home className="h-4 w-4" />
              {!isCollapsed ? 'Back to Home' : null}
            </Link>

            <div className={`mb-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="avatar">
                {user?.avatar ? (
                  <div className="h-10 w-10 overflow-hidden rounded-full ring ring-emerald-100 ring-offset-2 ring-offset-[#f8f6ef]">
                    <img src={user.avatar} alt={user.name || 'User avatar'} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral text-neutral-content">
                    <span className="font-bold">{userInitial}</span>
                  </div>
                )}
              </div>
              {!isCollapsed ? (
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-bold">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
              ) : null}
            </div>

            <button
              className={`btn btn-outline btn-error ${isCollapsed ? 'btn-square w-full' : 'w-full btn-sm'}`}
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="mr-0 h-4 w-4" />
              {!isCollapsed ? 'Sign Out' : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
