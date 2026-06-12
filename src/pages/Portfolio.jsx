import React, { useRef } from 'react';
import { GitBranch, ExternalLink, Code, Server, Database } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);
import './Portfolio.css';

const projects = [
  {
    title: 'SentinelOps',
    description: 'A multi-agent system that detects, investigates, and generates responses to cybersecurity incidents in real time.',
    icon: <Database size={32} className="project-icon" />,
    tech: ['Python', 'AI Agents', 'Cybersecurity'],
    link: 'https://github.com/Hectorajm2001/SentinelOps'
  },
  {
    title: 'Escaner-wifi',
    description: 'WiFi DensePose turns commodity WiFi signals into real-time human pose estimation and presence detection.',
    icon: <Server size={32} className="project-icon" />,
    tech: ['Rust', 'WiFi Sensing', 'AI'],
    link: 'https://github.com/Hectorajm2001/Escaner-wifi'
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
  }
];

const Portfolio = () => {
  const container = useRef(null);

  useGSAP(() => {
    // Hero animations
    const tl = gsap.timeline();
    tl.from('.badge', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from('.hero-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.6')
      .from('.hero-actions a', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, '-=0.4')
      .from('.code-window', { scale: 0.9, opacity: 0, duration: 0.8, ease: 'elastic.out(1, 0.8)' }, '-=0.6');

    // Projects stagger
    gsap.from('.project-card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%'
      }
    });
  }, { scope: container });

  return (
    <div className="portfolio-page" ref={container}>
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge glass-panel">Full Stack Developer & SysAdmin</div>
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
                <br />  <span className="property">name</span>: <span className="string">'Hector'</span>,
                <br />  <span className="property">skills</span>: [<span className="string">'React'</span>, <span className="string">'Node.js'</span>, <span className="string">'Linux'</span>],
                <br />  <span className="property">status</span>: <span className="string">'Building awesome things'</span>
                <br />{'}'};
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <div className="container">
          <h2 className="section-title">Featured <span className="text-gradient">Projects</span></h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div className="project-card glass-panel" key={index}>
                <div className="project-header">
                  {project.icon}
                  <a href={project.link} className="project-link">
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
