import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Home, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <Terminal className="brand-icon" size={24} />
          <span className="brand-text">Hector<span className="text-gradient">AJM</span></span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} />
            <span>Portfolio</span>
          </Link>
          <Link to="/portal" className={`nav-link ${location.pathname === '/portal' ? 'active' : ''}`}>
            <User size={18} />
            <span>Server Portal</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
