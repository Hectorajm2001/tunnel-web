import { useEffect, useRef } from 'react';
import { GitBranch, ExternalLink, Code, Server, Database } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// NUEVO: humo WebGL (fluid) + escena 3D + cinta de stack
import ShaderBackground from '../components/ShaderBackground';
import Marquee from '../components/Marquee';
import Safe3D from '../components/Safe3D';
import { introAlreadyPlayed, prefersReducedMotion, waitForFonts, whenIntroDone } from '../lib/anim';
import { useMagnetic, useTilt } from '../hooks/usePointerFx';
import './Portfolio.css';

const projects = [
  {
    title: 'Realme C51 Root',
    description: 'Scripts and utilities to unlock the bootloader and root the Realme C51 smartphone.',
    icon: <GitBranch size={32} className="project-icon" />,
    tech: ['PowerShell', 'Android', 'Rooting'],
    link: 'https://github.com/Hectorajm2001/realme-c51-root-unlock'
  },
  {
    title: 'Encuesta-web',
    description: 'A dynamic web application built for creating and managing surveys efficiently.',
    icon: <Server size={32} className="project-icon" />,
    tech: ['TypeScript', 'Web'],
    link: 'https://github.com/Hectorajm2001/Encuesta-web'
  },
  {
    title: 'SentinelOps',
    description: 'A multi-agent system that detects, investigates, and generates responses to cybersecurity incidents in real time.',
    icon: <Database size={32} className="project-icon" />,
    tech: ['Python', 'AI Agents', 'Cybersecurity'],
    link: 'https://github.com/Hectorajm2001/SentinelOps'
  },
  {
    title: 'Microservices Hub',
    description: 'Micro-SaaS control plane to manage, monitor and deploy microservices with open source cloud-native stack.',
    icon: <Code size={32} className="project-icon" />,
    tech: ['TypeScript', 'Cloud-Native', 'Micro-SaaS'],
    link: 'https://github.com/Hectorajm2001/open-source-microservices-hub'
  },
  {
    title: 'Personal Web Portal',
    description: 'This very website! A modern React application serving as a portfolio and secure gateway.',
    icon: <Code size={32} className="project-icon" />,
    tech: ['React', 'Vite', 'Cloudflare'],
    link: 'https://github.com/Hectorajm2001/tunnel-web'
  },
  {
    title: 'Chudbi Landing',
    description: 'Landing page for Chudbi.app. A modern and responsive presentation for the platform.',
    icon: <Code size={32} className="project-icon" />,
    tech: ['HTML', 'Web'],
    link: 'https://github.com/Hectorajm2001/chudbi-landing'
  },
  {
    title: 'MontiilloSite 3D',
    description: 'Sitio web de montiillo3D dedicado a la impresion 3D, muestra de trabajo, galeria y cotizaciones.',
    icon: <Code size={32} className="project-icon" />,
    tech: ['Web', '3D Printing', 'Business'],
    link: 'https://github.com/Hectorajm2001/MontiilloSite'
  },
  {
    title: 'Escaner-wifi',
    description: 'WiFi DensePose turns commodity WiFi signals into real-time human pose estimation and presence detection.',
    icon: <Server size={32} className="project-icon" />,
    tech: ['Rust', 'WiFi Sensing', 'AI'],
    link: 'https://github.com/Hectorajm2001/Escaner-wifi'
  }
];

const Portfolio = () => {
  const container = useRef(null);
  const heroTl = useRef(null);
  const heroSplit = useRef(null);
  const titleSplit = useRef(null);
  const shouldPlayRef = useRef(false);

  // NUEVO: CTAs magnéticos + tarjetas con tilt 3D (solo puntero fino)
  useMagnetic(container, '.hero-actions a', { strength: 0.24 });
  useTilt(container, '.project-card', { max: 7 });

  useGSAP(() => {
    // Projects stagger (revelado escalonado de las tarjetas)
    gsap.from('.project-card', {
      y: 60,
      scale: 0.98,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%'
      }
    });

    /* ================================================================
       Parallax multicapa + revelados (GSAP ScrollTrigger)
       - scrub: true → el parallax responde directo a la posición del scroll
       - k → intensidad responsive (en móvil los desplazamientos se reducen)
       ================================================================ */
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: '(min-width: 900px)',
      isMobile: '(max-width: 899px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions;
      const k = isDesktop ? 1 : 0.45;

      if (!reduceMotion) {
        const heroTrigger = { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true };
        [
          ['.hero-smoke', 110],       // humo: capa más lejana (se queda atrás)
          ['.hero-3d-layer', 70],     // nebulosa 3D (profundidad intermedia)
          ['.parallax-deep', 60],     // degradado de fondo profundo
          ['.parallax-mid', -40],     // degradado de fondo medio
          ['.hero-content', -70],     // texto (primer plano)
          ['.hero-visual', -130]      // ventana de código (mayor profundidad)
        ].forEach(([selector, distance]) => {
          gsap.to(selector, { y: distance * k, ease: 'none', scrollTrigger: { ...heroTrigger } });
        });

        gsap.to('.projects-parallax', {
          y: 150 * k,
          ease: 'none',
          scrollTrigger: { trigger: '.projects-section', start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }

      /* NUEVO: revelado del título de sección por líneas SIN máscara
         (overflow:clip rompe el degradado de "Projects" en Chrome) */
      if (!reduceMotion) {
        waitForFonts('Outfit').then(() => {
          if (!container.current) return;
          titleSplit.current?.revert();
          const tSplit = new SplitText('.projects-section .section-title', {
            type: 'lines',
            aria: 'auto',
            linesClass: 'title-line',
          });
          titleSplit.current = tSplit;
          gsap.set(tSplit.lines, { yPercent: 60, opacity: 0 });
          gsap.to(tSplit.lines, {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power4.out',
            scrollTrigger: { trigger: '.projects-section', start: 'top 78%' }
          });
        });
      }
    });
  }, { scope: container });

  // ================================================================
  // NUEVO: controlador de la entrada del Hero
  // - Espera a que las FUENTES carguen antes de dividir el título
  //   (si no, SplitText mide con el fallback y el título queda en 5 líneas)
  // - Arranca la animación cuando el intro libera la pantalla
  // ================================================================
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let cancelled = false;
    let ctx = null;

    // ocultamos el título de inmediato para evitar un flash antes del split
    gsap.set('.hero-title', { opacity: 0 });

    const setup = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        heroSplit.current?.revert();
        const split = new SplitText('.hero-title', {
          type: 'lines',
          aria: 'auto',
          linesClass: 'hero-line',
        });
        heroSplit.current = split;

        gsap.set('.hero-title', { opacity: 1 });
        gsap.set('.badge, .hero-subtitle, .hero-actions a, .hero-scroll', { opacity: 0, y: 24 });
        gsap.set(split.lines, { yPercent: 55, opacity: 0 });
        gsap.set('.code-window', { scale: 0.92, opacity: 0 });

        heroTl.current = gsap
          .timeline({ paused: true, defaults: { ease: 'power3.out' } })
          .to('.badge', { opacity: 1, y: 0, duration: 0.5 })
          .to(split.lines, { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.12, ease: 'power4.out' }, '-=0.3')
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.65')
          .to('.hero-actions a', { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
          .to('.hero-scroll', { opacity: 0.75, y: 0, duration: 0.5 }, '-=0.35')
          .to('.code-window', { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }, '-=0.8');

        if (shouldPlayRef.current) heroTl.current.play();
      }, container);
    };

    const play = () => {
      shouldPlayRef.current = true;
      if (heroTl.current) heroTl.current.play();
    };

    const cancelIntro = introAlreadyPlayed() ? (play(), () => {}) : whenIntroDone(play);

    // NUEVO: esperar a la fuente real antes de dividir el título
    waitForFonts('Outfit').then(setup);

    return () => {
      cancelled = true;
      cancelIntro();
      if (ctx) ctx.revert();
      heroSplit.current?.revert();
      heroSplit.current = null;
      heroTl.current = null;
    };
  }, []);

  return (
    <div className="portfolio-page" ref={container}>
      <section className="hero-section">
        {/* NUEVO: capas FX agrupadas y recortadas (evita que el blur invada
            otras secciones sin romper el background-clip:text del título) */}
        <div className="hero-fx-clip" aria-hidden="true">
          {/* Humo WebGL (fluid) scoped SOLO al Hero */}
          <ShaderBackground className="hero-smoke" />

          {/* NUEVO: nebulosa de partículas 3D (three.js, chunk aparte con
              ErrorBoundary: si falla la descarga, la web sigue funcionando) */}
          <div className="hero-3d-layer">
            <Safe3D className="hero-3d" />
          </div>

          {/* Capas decorativas de fondo para el parallax multicapa */}
          <div className="parallax-layer parallax-deep" />
          <div className="parallax-layer parallax-mid" />
        </div>

        <div className="hero-content">
          <div className="badge glass-panel">Full Stack Developer &amp; SysAdmin</div>
          <h1 className="hero-title">
            Building digital <br />
            experiences & <span className="text-gradient">infrastructure</span>
          </h1>
          <p className="hero-subtitle">
            Welcome to my personal slice of the internet. I build applications and manage my own infrastructure.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn-primary">View Projects</a>
            <a href="https://github.com/Hectorajm2001" target="_blank" rel="noreferrer" className="btn-secondary">
              <GitBranch size={20} /> GitHub
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glow-orb primary"></div>
          <div className="glow-orb secondary"></div>
          <div className="code-window glass-panel">
            <div className="window-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <pre className="code-content">
              <code>
                <span className="keyword">const</span> <span className="variable">developer</span> = {'{'}
                <br />  <span className="property">name</span>: <span className="string">'Hector Jaramillo Montantes'</span>,
                <br />  <span className="property">skills</span>: [
                <br />    <span className="string">'C#'</span>, <span className="string">'Java'</span>, <span className="string">'AI & Fine-tuning'</span>,
                <br />    <span className="string">'Web & Android'</span>, <span className="string">'Unity'</span>, <span className="string">'Unreal'</span>
                <br />  ],
                <br />  <span className="property">status</span>: <span className="string">'Building awesome things'</span>
                <br />{'}'};
              </code>
            </pre>
          </div>
        </div>

        {/* NUEVO: indicador de scroll */}
        <a href="#projects" className="hero-scroll" aria-label="Scroll to featured projects">
          <span className="hero-scroll-mouse">
            <span className="hero-scroll-dot" />
          </span>
          <span className="hero-scroll-label">Scroll</span>
        </a>
      </section>

      {/* NUEVO: cinta infinita de stack */}
      <Marquee />

      <section id="projects" className="projects-section">
        {/* NUEVO: capa de fondo con parallax, recortada por un wrapper
            (overflow:hidden en la sección rompía el degradado de "Projects") */}
        <div className="parallax-clip" aria-hidden="true">
          <div className="parallax-layer projects-parallax" />
        </div>

        <div className="container">
          <h2 className="section-title">Featured <span className="text-gradient">Projects</span></h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div className="project-card glass-panel" key={index}>
                <div className="project-header">
                  {project.icon}
                  <a
                    href={project.link}
                    className="project-link"
                    aria-label={`Open ${project.title} on GitHub`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="tech-badge">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
