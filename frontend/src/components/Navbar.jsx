import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, LogOut, LayoutGrid, ChevronDown, Plus } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import CreateProjectModal from './CreateProjectModal';

function Navbar({ profile, onSearch, onMenuClick, showMenuButton }) {
  const navigate = useNavigate();
  const { projects, currentProject, selectProject } = useProjects();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const switcherRef = useRef(null);

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {showMenuButton && (
          <button className="hamburger-btn" onClick={onMenuClick} aria-label="Open menu">
            <Menu size={22} />
          </button>
        )}
        <Link to="/dashboard" className="navbar-logo">
          <LayoutGrid size={20} className="navbar-logo-icon" />
          <span className="navbar-logo-text">TaskMatrix</span>
        </Link>

        <div className="project-switcher" ref={switcherRef}>
          <button
            className="project-switcher-btn"
            onClick={() => setSwitcherOpen((s) => !s)}
          >
            <span className="project-switcher-name">
              {currentProject ? currentProject.name : 'No projects yet'}
            </span>
            <ChevronDown size={14} />
          </button>

          {switcherOpen && (
            <div className="project-switcher-menu">
              {projects.map((p) => (
                <button
                  key={p._id}
                  className={`project-switcher-item ${
                    p._id === currentProject?._id ? 'active' : ''
                  }`}
                  onClick={() => {
                    selectProject(p._id);
                    setSwitcherOpen(false);
                  }}
                >
                  {p.name}
                </button>
              ))}
              {projects.length === 0 && (
                <div className="project-switcher-empty">No projects yet</div>
              )}
              <button
                className="project-switcher-create"
                onClick={() => {
                  setSwitcherOpen(false);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={14} /> Create new project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-search-wrap">
        <Search size={15} className="navbar-search-icon" />
        <input
          type="text"
          className="navbar-search"
          placeholder="Search tasks..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          disabled={!onSearch}
        />
      </div>

      <div className="navbar-right">
        <Link to="/profile" className="avatar-circle" title="View Profile">
          {initial}
        </Link>
        <button className="navbar-logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={14} />
          <span className="logout-btn-label">Logout</span>
        </button>
      </div>

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
    </nav>
  );
}

export default Navbar;
