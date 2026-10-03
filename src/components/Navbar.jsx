import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Home, User, Gamepad2 } from 'lucide-react';
import gsap from 'gsap';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navRef = useRef(null);
  const linksRef = useRef(null);
  const indicatorRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // NUEVO: indicador (píldora) que se desliza hacia el link activo
  const placeIndicator = (animate) => {
    const links = linksRef.current;
    const indicator = indicatorRef.current;
    if (!links || !indicator) return;
    const active = links.querySelector('.nav-link.active');
    if (!active) return;
    const { offsetLeft: x, offsetWidth: width } = active;
    if (animate) {
      gsap.to(indicator, { x, width, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.set(indicator, { x, width });
    }
  };

  useEffect(() => {
    placeIndicator(false);
    const onResize = () => placeIndicator(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    placeIndicator(true);
  }, [location.pathname]);

  // NUEVO: se oculta al bajar, reaparece al subir; glass más intenso con scroll
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        const next = y > 24;
        return next === prev ? prev : next;
      });

      const nav = navRef.current;
      if (!nav) return;
      if (y > 180 && y > lastY + 4) {
        gsap.to(nav, { yPercent: -140, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      } else if (y < lastY - 4 || y <= 180) {
        gsap.to(nav, { yPercent: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`navbar glass-panel ${scrolled ? 'navbar-scrolled' : ''}`}
      ref={navRef}
      aria-label="Main"
    >
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <Terminal className="brand-icon" size={24} />
          <span className="brand-text">Hector<span className="text-gradient">AJM</span></span>
        </Link>
        <div className="nav-links" ref={linksRef}>
          {/* NUEVO: píldora del link activo (se mueve con GSAP) */}
          <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} />
            <span>Portfolio</span>
          </Link>
          <Link to="/portal" className={`nav-link ${location.pathname === '/portal' ? 'active' : ''}`}>
            <User size={18} />
            <span>Server Portal</span>
          </Link>
          <Link to="/minecraft" className={`nav-link ${location.pathname === '/minecraft' ? 'active' : ''}`}>
            <Gamepad2 size={18} />
            <span>Minecraft</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
