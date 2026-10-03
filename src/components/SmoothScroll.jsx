import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { introAlreadyPlayed } from '../lib/anim';

// ============================================================
// NUEVO: scroll suave (Lenis) sincronizado con GSAP ScrollTrigger.
// - El raf de Lenis se monta en el ticker de GSAP (integración oficial)
// - Se desactiva por completo con prefers-reduced-motion
// - Queda bloqueado mientras corre el intro
// ============================================================
const SmoothScroll = ({ children }) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      smoothWheel: true,
      anchors: true, // los links #ancla funcionan suaves
    });

    window.__lenis = lenis;

    const update = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Mientras el intro cubre la pantalla, el scroll queda bloqueado
    let introDone = introAlreadyPlayed();
    const onIntroDone = () => {
      introDone = true;
      lenis.start();
    };
    if (!introDone) {
      lenis.stop();
      window.addEventListener('intro:done', onIntroDone, { once: true });
    }

    return () => {
      window.removeEventListener('intro:done', onIntroDone);
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return children;
};

export default SmoothScroll;
