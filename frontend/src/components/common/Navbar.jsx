import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Kanban, User, LogOut, LayoutGrid, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to={user ? "/dashboard" : "/login"} className="nav-logo" onClick={() => setIsMenuOpen(false)}>
        <Kanban size={24} />
        <span>TrelloMini</span>
      </Link>
      
      {user && (
        <>
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/dashboard" className="nav-link nav-user" onClick={() => setIsMenuOpen(false)}>
              <LayoutGrid size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/profile" className="nav-link nav-user" onClick={() => setIsMenuOpen(false)}>
              <User size={18} />
              <span>Profile</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary nav-user" style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </nav>
        </>
      )}
    </header>
  );
};

export default Navbar;
