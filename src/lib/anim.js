// ============================================================
// NUEVO: utilidades compartidas de animación y entorno
// ============================================================

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const INTRO_KEY = 'hajm:intro-played';

// El intro solo se muestra una vez por sesión (o nunca con reduced-motion)
export const introAlreadyPlayed = () => {
  if (prefersReducedMotion()) return true;
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
};

export const signalIntroDone = () => {
  try {
    sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    /* sesión no disponible: el intro se repetirá, sin más */
  }
  window.dispatchEvent(new Event('intro:done'));
};

// Ejecuta cb cuando el intro terminó (o de inmediato si no va a correr)
export const whenIntroDone = (cb) => {
  if (introAlreadyPlayed()) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener('intro:done', handler, { once: true });
  return () => window.removeEventListener('intro:done', handler);
};

// Instancia global de Lenis (la registra SmoothScroll)
export const getLenis = () => window.__lenis || null;

// NUEVO: espera real a que una fuente esté disponible (document.fonts.status
// puede ser "loaded" antes de que el stylesheet de fuentes llegue, y SplitText
// mediría con la fuente de respaldo → líneas mal calculadas)
export const waitForFonts = (family = 'Outfit', timeout = 3000) =>
  new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      const ready = document.fonts && document.fonts.check(`700 1em "${family}"`);
      if (ready || performance.now() - start > timeout) resolve();
      else setTimeout(tick, 60);
    };
    tick();
  });

export const scrollToTop = (immediate = false) => {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate });
  } else {
    window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
  }
};
