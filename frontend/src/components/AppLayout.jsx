import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function AppLayout({ profile, onSearch, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Navbar
        profile={profile}
        onSearch={onSearch}
        onMenuClick={() => setMenuOpen(true)}
        showMenuButton
      />
      <div className="app-layout">
        <Sidebar profile={profile} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="app-content">{children}</div>
      </div>
    </>
  );
}

export default AppLayout;
