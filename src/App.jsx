import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Navbar from './components/Navbar';
import Portfolio from './pages/Portfolio';
import Portal from './pages/Portal';
import Minecraft from './pages/Minecraft';
import SmoothScroll from './components/SmoothScroll';
import IntroLoader from './components/IntroLoader';
import Footer from './components/Footer';
import { scrollToTop, whenIntroDone } from './lib/anim';
import './index.css';

// NUEVO: evita que el navegador restaure el scroll al recargar o navegar
// (rompía la entrada del Hero al abrir la página abajo)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const AppShell = () => {
  const location = useLocation();
  const mainRef = useRef(null);

  // NUEVO: al cambiar de ruta → scroll al inicio + transición de entrada
  useEffect(() => {
    scrollToTop(true);
    const el = mainRef.current;
    if (!el) return undefined;

    gsap.set(el, { opacity: 0, y: 18 });
    let tween = null;
    const cancel = whenIntroDone(() => {
      tween = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    });

    return () => {
      cancel();
      if (tween) tween.kill();
    };
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Navbar />
      <main ref={mainRef}>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/minecraft" element={<Minecraft />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <SmoothScroll>
        {/* NUEVO: intro cinematográfico (una vez por sesión) */}
        <IntroLoader />
        <AppShell />
      </SmoothScroll>
    </Router>
  );
}

export default App;
