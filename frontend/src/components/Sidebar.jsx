import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Home,
  List,
  Calendar,
  Clock,
  BarChart3,
  Folder,
  Users,
  Settings as SettingsIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Board', Icon: LayoutGrid, path: '/tasks' },
  { label: 'Dashboard', Icon: Home, path: '/dashboard' },
  { label: 'List', Icon: List, path: '/list' },
  { label: 'Calendar', Icon: Calendar, path: '/calendar' },
  { label: 'Timeline', Icon: Clock, path: '/timeline' },
  { label: 'Reports', Icon: BarChart3, path: '/reports' },
  { label: 'Files', Icon: Folder, path: '/files' },
  { label: 'Team', Icon: Users, path: '/team' },
  { label: 'Settings', Icon: SettingsIcon, path: '/settings' },
];

function Sidebar({ profile, isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, Icon, path }) => (
            <Link
              key={label}
              to={path}
              onClick={onClose}
              className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="sidebar-user-name">{profile?.name}</div>
            <div className="sidebar-user-role">
              {profile?.isPro ? 'Pro Member' : 'Free Member'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
