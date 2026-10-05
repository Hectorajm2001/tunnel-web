import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, HardDrive, Lock, Cpu, Terminal, Home, Activity, Gamepad2, Monitor, Shield, Copy, Check, Bot, KeyRound } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTilt } from '../hooks/usePointerFx';

gsap.registerPlugin(useGSAP);
import './Portal.css';

const services = [
  {
    name: 'Escritorio & VPN SSL (GPU 60FPS)',
    description: 'Navegador y Terminal Remota sobre SSL (Radeon Vega 11 VAAPI)',
    url: 'https://desktop.hectorajm.dpdns.org',
    icon: <Monitor size={28} />,
    color: '#8b5cf6',
    status: 'online'
  },
  {
    name: 'Antigravity Remote Agent',
    description: 'Agente CLI (agy) Conectado al Homelab para Pruebas y Control Remoto',
    url: 'https://antigravity.google.com',
    icon: <Bot size={28} />,
    color: '#ec4899',
    status: 'online'
  },
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
    url: 'https://dash.hectorajm.dpdns.org',
    icon: <Home size={28} />,
    color: '#ff5722',
    status: 'online'
  },
  {
    name: 'Portainer',
    description: 'Gestión de Contenedores y Docker (Red Local / Escritorio SSL)',
    url: 'http://192.168.1.69:9000',
    icon: <Server size={28} />,
    color: '#0db7ed',
    status: 'online'
  },
  {
    name: 'Uptime Kuma',
    description: 'Monitoreo de Estado y Alertas (Red Local / Escritorio SSL)',
    url: 'http://192.168.1.69:3001',
    icon: <Activity size={28} />,
    color: '#00e676',
    status: 'online'
  }
];

const Portal = () => {
  const container = useRef(null);
  const [stats, setStats] = useState(null);
  const [vpnPassword, setVpnPassword] = useState('');
  const [vpnKeys, setVpnKeys] = useState(null);
  const [vpnError, setVpnError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const unlockVpnKeys = async (e) => {
    e.preventDefault();
    setVpnError('');
    try {
      const res = await fetch('https://api.hectorajm.dpdns.org/api/unlock-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: vpnPassword })
      });
      if (!res.ok) {
        setVpnError('Clave incorrecta');
        return;
      }
      const data = await res.json();
      setVpnKeys(data);
      setVpnPassword('');
    } catch {
      setVpnError('Error de conexión');
    }
  };

  const copyUri = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  useTilt(container, '.service-card', { max: 6 });

  useGSAP(() => {
    const tl = gsap.timeline();

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

        <div className="vpn-quick-bar glass-panel">
          <div className="vpn-quick-info">
            <Shield size={22} className="shield-icon" />
            <div>
              <strong>Túneles VPN Privados (Xray VLESS + BBR)</strong>
              <p>Protegido con clave en el servidor. Ninguna llave ni UUID está expuesta públicamente en la web.</p>
            </div>
          </div>
          <div className="vpn-quick-actions">
            {!vpnKeys ? (
              <form className="vpn-unlock-form" onSubmit={unlockVpnKeys}>
                <input
                  type="password"
                  className="vpn-pass-input"
                  placeholder="Clave del Homelab..."
                  value={vpnPassword}
                  onChange={(e) => setVpnPassword(e.target.value)}
                />
                <button type="submit" className="vpn-copy-btn">
                  <KeyRound size={16} />
                  <span>Desbloquear Llaves VPN</span>
                </button>
                {vpnError && <span className="vpn-error-msg">{vpnError}</span>}
              </form>
            ) : (
              <>
                <button type="button" className="vpn-copy-btn" onClick={() => copyUri('ssl', vpnKeys.ssl)}>
                  {copiedKey === 'ssl' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedKey === 'ssl' ? 'Copiado SSL 443' : 'Copiar VPN Inyección SSL (Cloudflare 443)'}</span>
                </button>
                <button type="button" className="vpn-copy-btn gaming" onClick={() => copyUri('gaming', vpnKeys.gaming)}>
                  {copiedKey === 'gaming' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedKey === 'gaming' ? 'Copiado Gaming XHTTP' : 'Copiar VPN Gaming (XHTTP H2/H3)'}</span>
                </button>
              </>
            )}
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
