import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Home, User } from 'lucide-react';
import { LiquidGlass } from '@liquidglass/react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <LiquidGlass blur={20} displacementScale={1.5} elasticity={0.5} borderRadius={100} className="navbar">
      <nav className="glass-panel" style={{ width: '100%', height: '100%', padding: '1rem 0', borderRadius: 'inherit', boxSizing: 'border-box' }}>
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
    </LiquidGlass>
  );
};

export default Navbar;
