import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// NUEVO: escena 3D del Hero — nebulosa de partículas + carcasa wireframe.
// - Se carga en su propio chunk (React.lazy) para no engordar el bundle inicial
// - DPR limitado, pausa al salir de pantalla/pestaña, dispose completo
// - Con prefers-reduced-motion renderiza un único frame estático
import './Hero3D.css';

const CYAN = 0x22d3ee;
const VIOLET = 0x8b5cf6;

const Hero3D = ({ className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact = window.matchMedia('(max-width: 900px), (hover: none)').matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    // pivot: rotación suave siguiendo al cursor | group: rotación/paneo propios
    const pivot = new THREE.Group();
    const group = new THREE.Group();
    const narrow = container.clientWidth < 900;
    group.position.set(narrow ? 0 : 1.3, narrow ? 0.35 : 0.05, -0.4);
    group.scale.setScalar(narrow ? 0.72 : 1);
    pivot.add(group);
    scene.add(pivot);

    // --- nebulosa de partículas ---
    const COUNT = compact ? 900 : 2600;
    const RADIUS = 2.35;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const colorA = new THREE.Color(CYAN);
    const colorB = new THREE.Color(VIOLET);
    const tmp = new THREE.Color();
    const golden = Math.PI * (1 + Math.sqrt(5));

    for (let i = 0; i < COUNT; i += 1) {
      const t = i / COUNT;
      const phi = Math.acos(1 - 2 * t);
      const theta = golden * i;
      const r = RADIUS * (0.9 + Math.random() * 0.18);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      positions.set([x, y, z], i * 3);

      tmp.copy(colorA).lerp(colorB, THREE.MathUtils.clamp((y / RADIUS + 1) / 2, 0, 1));
      const boost = 0.6 + Math.random() * 0.55;
      colors.set([tmp.r * boost, tmp.g * boost, tmp.b * boost], i * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // sprite redondo generado en canvas (sin assets externos)
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(spriteCanvas);
    sprite.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.PointsMaterial({
      size: 0.085,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    group.add(points);

    // --- carcasa wireframe (solo desktop) ---
    let shell = null;
    let shellGeometry = null;
    let shellMaterial = null;
    if (!compact) {
      const baseGeometry = new THREE.IcosahedronGeometry(RADIUS * 0.99, 1);
      shellGeometry = new THREE.EdgesGeometry(baseGeometry);
      baseGeometry.dispose();
      shellMaterial = new THREE.LineBasicMaterial({
        color: VIOLET,
        transparent: true,
        opacity: 0.07,
      });
      shell = new THREE.LineSegments(shellGeometry, shellMaterial);
      group.add(shell);
    }

    // --- estado / interacción ---
    const state = {
      pointerX: 0,
      pointerY: 0,
      scroll: 0,
      raf: 0,
      visible: true,
    };
    const baseY = group.position.y;

    const onPointerMove = (e) => {
      state.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      state.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const clockStart = performance.now();

    const renderFrame = () => {
      const t = (performance.now() - clockStart) / 1000; // NUEVO: timing propio (THREE.Clock está deprecado en r186)

      group.rotation.y = t * 0.07;
      group.rotation.x = Math.sin(t * 0.16) * 0.07;
      group.position.y = baseY + state.scroll * 1.15;

      // el cursor inclina suavemente todo el conjunto
      pivot.rotation.x += (-state.pointerY * 0.28 - pivot.rotation.x) * 0.045;
      pivot.rotation.y += (state.pointerX * 0.4 - pivot.rotation.y) * 0.045;

      if (shell) shell.rotation.y = -t * 0.1;

      material.opacity = Math.max(0, 0.9 - state.scroll * 0.6);

      renderer.render(scene, camera);
      state.raf = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (!state.raf) state.raf = requestAnimationFrame(renderFrame);
    };
    const stop = () => {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
    };

    // --- tamaño ---
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    // --- pausa fuera de pantalla / pestaña oculta ---
    const io = new IntersectionObserver(
      ([entry]) => {
        state.visible = entry.isIntersecting;
        if (state.visible && !document.hidden) start();
        else stop();
      },
      { rootMargin: '160px' },
    );
    io.observe(container);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (state.visible) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // --- scroll: el conjunto se hunde y se desvanece al salir del Hero ---
    const st = ScrollTrigger.create({
      trigger: container.closest('.hero-section') || container,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        state.scroll = self.progress;
      },
    });

    if (reduceMotion) {
      // frame estático, sin bucle ni listeners
      group.rotation.y = 0.6;
      renderer.render(scene, camera);
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      start();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      st.kill();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);

      geometry.dispose();
      material.dispose();
      sprite.dispose();
      if (shellGeometry) shellGeometry.dispose();
      if (shellMaterial) shellMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={`hero-3d ${className}`.trim()} />;
};

export default Hero3D;
