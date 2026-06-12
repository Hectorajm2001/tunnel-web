import React, { useRef, useState, useEffect } from 'react';
import { Shield, Server, HardDrive, Network, Lock, Monitor, Cpu, Music, Film } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
import './Portal.css';

const services = [
  {
    name: 'Proxmox VE',
    description: 'Virtual Environment Management',
    url: 'https://pve.hectorajm.dpdns.org', // Assuming standard subdomains
    icon: <Server size={28} />,
    color: '#e47911',
    status: 'online'
  },
  {
    name: 'Portainer',
    description: 'Docker Container Management',
    url: 'https://docker.hectorajm.dpdns.org',
    icon: <HardDrive size={28} />,
    color: '#13b5ea',
    status: 'online'
  },
  {
    name: 'Pi-hole',
    description: 'Network-wide Ad Blocking',
    url: 'https://dns.hectorajm.dpdns.org',
    icon: <Network size={28} />,
    color: '#f60d1a',
    status: 'online'
  },
  {
    name: 'Grafana',
    description: 'Server Metrics & Monitoring',
    url: 'https://grafana.hectorajm.dpdns.org',
    icon: <Monitor size={28} />,
    color: '#f05a28',
    status: 'online'
  },
  {
    name: 'SwingMusic',
    description: 'Personal Music Server',
    url: 'https://swingmusic.hectorajm.dpdns.org',
    icon: <Music size={28} />,
    color: '#9c27b0', // Purple color
    status: 'online'
  },
  {
    name: 'Jellyfin',
    description: 'Media Streaming Server',
    url: 'https://jellyfin.hectorajm.dpdns.org',
    icon: <Film size={28} />,
    color: '#00a4dc', // Jellyfin blue
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

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.security-badge', { y: -20, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' })
      .from('.portal-title', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
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
      <div className="container">
        <header className="portal-header">
          <div className="security-badge glass-panel">
            <Shield size={16} className="shield-icon" />
            <span>Secured via Cloudflare Zero Trust</span>
          </div>
          <h1 className="portal-title">Homelab <span className="text-gradient">Portal</span></h1>
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
          {services.map((service, index) => (
            <a href={service.url} target="_blank" rel="noreferrer" className="service-card glass-panel" key={index}>
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
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portal;
