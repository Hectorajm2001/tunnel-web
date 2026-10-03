import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, HardDrive, Lock, Cpu, Terminal, Home, Activity, Gamepad2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTilt } from '../hooks/usePointerFx';

gsap.registerPlugin(useGSAP);
import './Portal.css';

const services = [
  {
    name: 'Minecraft Live Map & Avance',
    description: 'Mapa 3D en Vivo, Progreso del Mundo, Estadísticas y Modpack',
    url: '/minecraft',
    internal: true,
    icon: <Gamepad2 size={28} />,
    color: '#10b981',
    status: 'online'
  },
  {
    name: 'Homarr',
    description: 'Dashboard Central & Accesos Rápidos',
    url: 'https://homarr.hectorajm.dpdns.org',
    icon: <Home size={28} />,
    color: '#ff5722',
    status: 'online'
  },
  {
    name: 'Portainer',
    description: 'Gestión de Contenedores y Docker',
    url: 'https://portainer.hectorajm.dpdns.org',
    icon: <Server size={28} />,
    color: '#0db7ed',
    status: 'online'
  },
  {
    name: 'Uptime Kuma',
    description: 'Monitoreo de Estado y Alertas en Tiempo Real',
    url: 'https://uptime.hectorajm.dpdns.org',
    icon: <Activity size={28} />,
    color: '#00e676',
    status: 'online'
  }
];

const Portal = () => {
  const container = useRef(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://api.hectorajm.dpdns.org/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // NUEVO: inclinación 3D + brillo en las tarjetas de servicio (solo desktop)
  useTilt(container, '.service-card', { max: 6 });

  useGSAP(() => {
    const tl = gsap.timeline();

    // NUEVO: se quitó la animación de .security-badge (ya no existe en el markup
    // y generaba un warning de GSAP en consola)
    tl.from('.portal-title', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from('.portal-subtitle', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from('.system-status', { scale: 0.95, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2');

    gsap.from('.service-card', {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.8
    });
  }, { scope: container });

  return (
    <div className="portal-page" ref={container}>
      {/* NUEVO: fondo mesh decorativo (CSS puro) */}
      <div className="portal-bg" aria-hidden="true" />

      <div className="container">
        <header className="portal-header">
          <h1 className="portal-title"><Terminal className="brand-icon" size={48} /> Hector<span className="text-gradient">AJM</span></h1>
          <p className="portal-subtitle">Access your internal infrastructure and services securely.</p>
        </header>

        <div className="system-status glass-panel">
          <div className="status-item">
            <Cpu size={24} className="status-icon text-gradient" />
            <div style={{ flex: 1 }}>
              <div className="stat-header">
                <p className="status-label">CPU</p>
                <p className="status-value">{stats ? `${stats.cpu}%` : '...'}</p>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar-fill" style={{ width: `${stats ? stats.cpu : 0}%`, background: 'var(--accent-primary)' }}></div>
              </div>
            </div>
          </div>
          <div className="status-divider"></div>
          <div className="status-item">
            <HardDrive size={24} className="status-icon text-gradient" />
            <div style={{ flex: 1 }}>
              <div className="stat-header">
                <p className="status-label">RAM</p>
                <p className="status-value">{stats && stats.ramText ? stats.ramText : '...'}</p>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar-fill" style={{ width: `${stats ? stats.ram : 0}%`, background: 'var(--accent-secondary)' }}></div>
              </div>
            </div>
          </div>
          <div className="status-divider"></div>
          <div className="status-item">
            <Lock size={24} className="status-icon text-gradient" />
            <div>
              <p className="status-label">Uptime</p>
              <p className="status-value active-status" style={{ fontSize: '1rem' }}>{stats ? stats.uptime : '...'}</p>
            </div>
          </div>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const CardTag = service.internal ? Link : 'a';
            const cardProps = service.internal
              ? { to: service.url }
              : { href: service.url, target: '_blank', rel: 'noreferrer' };
            return (
              <CardTag {...cardProps} className="service-card glass-panel" key={index}>
                <div className="service-icon-wrapper" style={{ backgroundColor: `${service.color}20`, color: service.color }}>
                  {service.icon}
                </div>
                <div className="service-info">
                  <div className="service-header">
                    <h3 className="service-name">{service.name}</h3>
                    <div className={`status-indicator ${service.status}`}></div>
                  </div>
                  <p className="service-desc">{service.description}</p>
                </div>
                <div className="service-hover-indicator">
                  <span className="arrow">→</span>
                </div>
              </CardTag>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Portal;
