import { useRef, useEffect } from 'react';
import fluid from 'webgl-fluid';
import './ShaderBackground.css';

// NUEVO: canvas compartido a nivel de módulo.
// webgl-fluid no expone una API para detener la simulación, así que conservamos
// el mismo canvas (y el mismo loop) entre montajes para no duplicar instancias
// al navegar entre páginas (React monta/desmonta esta vista).
let sharedCanvas = null;

const ShaderBackground = ({ className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // NUEVO: crear el canvas una sola vez
    if (!sharedCanvas) {
      sharedCanvas = document.createElement('canvas');
      sharedCanvas.className = 'shader-canvas';
    }

    // NUEVO: reutilizar el canvas en cada montaje (evita loops duplicados)
    if (sharedCanvas.parentNode !== container) {
      container.appendChild(sharedCanvas);
    }

    // Initialize WebGL Fluid Simulation (una sola vez por sesión)
    // Using custom colors to match the Homelab portal theme (slate/dark blue and purple/cyan)
    if (sharedCanvas.dataset.fluidInitialized !== 'true') {
      sharedCanvas.dataset.fluidInitialized = 'true';

      // NUEVO: respeta "prefers-reduced-motion" (sin splats automáticos)
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      fluid(sharedCanvas, {
        IMMEDIATE: !reduceMotion, // NUEVO: un único splat suave al cargar (SPLAT_COUNT = 1 → sin explosión)
        AUTO: !reduceMotion, // NUEVO: movimiento orgánico continuo, sin necesidad del ratón
        INTERVAL: 7000, // NUEVO: una nueva bocanada de humo cada 7s (más sutil)
        SPLAT_COUNT: 1, // NUEVO: splats de 1 en 1 → humo sutil
        TRIGGER: 'hover', // Can be 'click' or 'hover'
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 1.5, // NUEVO: el humo se disipa más rápido (menos acumulación)
        VELOCITY_DISSIPATION: 0.2,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        SPLAT_RADIUS: 0.18, // NUEVO: bocanadas más pequeñas
        SPLAT_FORCE: 4000, // NUEVO: menos fuerza → movimiento más suave
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 2, g: 5, b: 12 }, // Extremely dark blue #02050c
        TRANSPARENT: false,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.22, // NUEVO: menos brillo (antes 0.3)
        BLOOM_THRESHOLD: 0.6,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 0.35, // NUEVO: rayos más tenues (antes 0.5)
      });
    }

    // Forward mouse and touch events from window to canvas
    const forwardEvent = (e) => {
      if (e.target === sharedCanvas) return;

      let clientX = e.clientX;
      let clientY = e.clientY;
      let type = e.type;

      // Map touch events to mouse events for the simulation
      if (e.type.startsWith('touch')) {
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        }

        if (e.type === 'touchstart') type = 'mousedown';
        if (e.type === 'touchmove') type = 'mousemove';
        if (e.type === 'touchend') type = 'mouseup';
      }

      if (clientX === undefined) return;

      const evt = new MouseEvent(type, {
        clientX: clientX,
        clientY: clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // NUEVO: webgl-fluid lee offsetX/offsetY (relativos al canvas). Los definimos
      // explícitamente porque el canvas ya NO cubre toda la ventana y el navegador
      // no garantiza calcularlos en eventos sintéticos.
      const rect = sharedCanvas.getBoundingClientRect();
      Object.defineProperty(evt, 'offsetX', { value: clientX - rect.left });
      Object.defineProperty(evt, 'offsetY', { value: clientY - rect.top });

      sharedCanvas.dispatchEvent(evt);
    };

    window.addEventListener('mousemove', forwardEvent);
    window.addEventListener('mousedown', forwardEvent);
    window.addEventListener('mouseup', forwardEvent);
    window.addEventListener('touchstart', forwardEvent, { passive: true });
    window.addEventListener('touchmove', forwardEvent, { passive: true });
    window.addEventListener('touchend', forwardEvent);

    return () => {
      window.removeEventListener('mousemove', forwardEvent);
      window.removeEventListener('mousedown', forwardEvent);
      window.removeEventListener('mouseup', forwardEvent);
      window.removeEventListener('touchstart', forwardEvent);
      window.removeEventListener('touchmove', forwardEvent);
      window.removeEventListener('touchend', forwardEvent);

      // NUEVO: soltamos el canvas del DOM, pero se conserva vivo para el próximo
      // montaje (así no se reinicia la simulación al navegar entre páginas)
      if (sharedCanvas.parentNode === container) {
        container.removeChild(sharedCanvas);
      }
    };
  }, []);

  return <div ref={containerRef} className={`shader-background ${className}`.trim()} />;
};

export default ShaderBackground;
