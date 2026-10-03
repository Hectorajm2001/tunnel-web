import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import { scrollToTop } from '../lib/anim';
import { useMagnetic } from '../hooks/usePointerFx';
import './Footer.css';

// ============================================================
// NUEVO: footer (solo reutiliza enlaces y marca existentes)
// ============================================================
const Footer = () => {
  const fxRef = useRef(null);
  useMagnetic(fxRef, '.footer-top', { strength: 0.3, maxOffset: 12 });

  return (
    <footer className="footer" ref={fxRef}>
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-name">
            <Terminal size={20} className="brand-icon" />
            Hector<span className="text-gradient">AJM</span>
          </span>
          <p className="footer-tag">Building digital experiences &amp; infrastructure.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <Link to="/" className="footer-link">Portfolio</Link>
          <Link to="/portal" className="footer-link">Server Portal</Link>
          <a
            href="https://github.com/Hectorajm2001"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </nav>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Hector Jaramillo Montantes</p>
        <button
          type="button"
          className="footer-top glass-panel"
          onClick={() => scrollToTop()}
          aria-label="Back to top"
        >
          ↑
        </button>
      </div>
    </footer>
  );
};

export default Footer;
