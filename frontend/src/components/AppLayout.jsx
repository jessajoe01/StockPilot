import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/categories', label: 'Categories' },
  { path: '/products', label: 'Products' },
  { path: '/suppliers', label: 'Suppliers' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14.5" stroke="#E8A93D" strokeWidth="1.4" opacity="0.5" />
            <path d="M8 20 Q14 9 24 12" stroke="#E8A93D" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="24" cy="12" r="2.2" fill="#E8A93D" />
          </svg>
          <span>Stock<span className="accent">Pilot</span></span>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-spacer" />
          <div className="app-topbar-user">
            <div className="app-user-info">
              <div className="app-user-name">{user?.name}</div>
              <div className="app-user-role">{user?.role}</div>
            </div>
            <button className="app-logout-btn" onClick={logout}>Log out</button>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}