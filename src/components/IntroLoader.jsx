import { useEffect, useRef, useState } from 'react';
import { createTimeline, stagger } from 'animejs';
import { introAlreadyPlayed, signalIntroDone } from '../lib/anim';
import './IntroLoader.css';

// ============================================================
// NUEVO: intro cinematográfico (anime.js v4)
// - Se muestra una sola vez por sesión (sessionStorage)
// - No corre con prefers-reduced-motion
// - Barra de progreso + contador 0→100 + salida en barrido
// ============================================================
const IntroLoader = () => {
  const [skipped] = useState(() => introAlreadyPlayed());
  const [done, setDone] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (skipped) return;
    const root = overlayRef.current;
    if (!root) return;

    document.documentElement.classList.add('intro-lock');

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove('intro-lock');
      signalIntroDone();
      setDone(true);
    };

    const counter = root.querySelector('.intro-counter-value');
    let tl = null;

    try {
      tl = createTimeline({
        defaults: { ease: 'outQuart', duration: 700 },
        onComplete: finish,
      });

      tl.add('.intro-word-inner', {
        y: ['115%', '0%'],
        opacity: [0, 1],
        duration: 700,
        ease: 'outExpo',
        delay: stagger(90),
      }, 0)
        .add('.intro-bar-fill', {
          scaleX: [0, 1],
          duration: 1050,
          ease: 'inOutQuart',
          onUpdate: (self) => {
            if (counter) {
              counter.textContent = String(Math.round(self.progress * 100)).padStart(3, '0');
            }
          },
        }, 90)
        .add('.intro-meta', { opacity: [1, 0], duration: 260, ease: 'outQuad' }, '+=90')
        .add('.intro-overlay', { y: ['0%', '-100%'], duration: 680, ease: 'inOutQuart' }, '-=140');
    } catch {
      // Ante cualquier fallo, el intro no debe bloquear el sitio
      finish();
    }

    // Failsafe: nunca dejar la portada bloqueada más de 4s
    const failsafe = setTimeout(finish, 4000);

    return () => {
      clearTimeout(failsafe);
      if (tl) tl.pause();
      document.documentElement.classList.remove('intro-lock');
    };
  }, [skipped]);

  if (skipped || done) return null;

  return (
    <div className="intro-overlay" ref={overlayRef} role="presentation">
      <div className="intro-wordmark" aria-label="HectorAJM">
        <span className="intro-word">
          <span className="intro-word-inner">Hector</span>
        </span>
        <span className="intro-word">
          <span className="intro-word-inner text-gradient">AJM</span>
        </span>
      </div>
      <div className="intro-meta">
        <span className="intro-bar">
          <span className="intro-bar-fill" />
        </span>
        <span className="intro-counter" aria-hidden="true">
          <span className="intro-counter-value">000</span>%
        </span>
      </div>
    </div>
  );
};

export default IntroLoader;
