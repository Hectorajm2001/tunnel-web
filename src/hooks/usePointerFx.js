import { useEffect } from 'react';
import gsap from 'gsap';
import { isFinePointer, prefersReducedMotion } from '../lib/anim';

// ============================================================
// NUEVO: botones magnéticos — siguen ligeramente el cursor.
// Solo en desktop con puntero fino y sin reduced-motion.
// ============================================================
export const useMagnetic = (rootRef, selector, opts = {}) => {
  const { strength = 0.22, maxOffset = 16, radius = 40 } = opts;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isFinePointer() || prefersReducedMotion()) return;

    const els = Array.from(root.querySelectorAll(selector));
    if (!els.length) return;

    const fns = els.map((el) => ({
      el,
      xTo: gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' }),
      yTo: gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' }),
    }));

    const onMove = (e) => {
      fns.forEach(({ el, xTo, yTo }) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + radius);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + radius);

        if (Math.abs(dx) < 1.3 && Math.abs(dy) < 1.3) {
          xTo(gsap.utils.clamp(-maxOffset, maxOffset, dx * r.width * strength));
          yTo(gsap.utils.clamp(-maxOffset, maxOffset, dy * r.height * strength));
        } else {
          xTo(0);
          yTo(0);
        }
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      els.forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: 'transform' });
      });
    };
  }, [rootRef, selector, strength, maxOffset, radius]);
};

// ============================================================
// NUEVO: tarjetas con inclinación 3D + brillo que sigue al cursor
// (expone --mx / --my en el elemento para el efecto "shine")
// ============================================================
export const useTilt = (rootRef, selector, opts = {}) => {
  const { max = 7, scale = 1.015 } = opts;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isFinePointer() || prefersReducedMotion()) return;

    const els = Array.from(root.querySelectorAll(selector));
    if (!els.length) return;

    const fns = els.map((el) => {
      gsap.set(el, { transformPerspective: 900, transformOrigin: 'center' });
      return {
        el,
        rx: gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' }),
        ry: gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' }),
        // NUEVO: scaleX/scaleY por separado (quickTo('scale') no es "resetable" en GSAP)
        sx: gsap.quickTo(el, 'scaleX', { duration: 0.6, ease: 'power3.out' }),
        sy: gsap.quickTo(el, 'scaleY', { duration: 0.6, ease: 'power3.out' }),
      };
    });

    const resetVars = (el) => {
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    };

    const onMove = (e) => {
      fns.forEach(({ el, rx, ry, sx, sy }) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const inside = px >= -0.05 && px <= 1.05 && py >= -0.05 && py <= 1.05;

        if (inside) {
          rx(gsap.utils.clamp(-max, max, -(py - 0.5) * 2 * max));
          ry(gsap.utils.clamp(-max, max, (px - 0.5) * 2 * max));
          sx(scale);
          sy(scale);
          el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
          el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        } else {
          rx(0);
          ry(0);
          sx(1);
          sy(1);
          resetVars(el);
        }
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      els.forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: 'transform' });
        resetVars(el);
      });
    };
  }, [rootRef, selector, max, scale]);
};
