import { useState, useEffect } from 'react';
import {
  Gamepad2, Users, Pickaxe, Gem, Skull, Trophy, Clock,
  Copy, Check, Download, ExternalLink, Mic, CheckCircle2, Circle, Compass
} from 'lucide-react';
import './Minecraft.css';

const API_BASE = 'https://api.hectorajm.dpdns.org';

const Minecraft = () => {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/minecraft`);
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error('Error fetching Minecraft data:', e);
      }
    };
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  const copyIp = () => {
    navigator.clipboard.writeText(data?.address || 'stamina-feeder.tun.ply.gg');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = data?.milestones || [];
  const completedCount = data?.completedMilestones || 0;
  const progressPct = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;
  const totals = data?.totals || { playHours: 0, blocksMined: 0, diamonds: 0, mobKills: 0, advancements: 0, deaths: 0 };
  const players = data?.players || [];

  return (
    <div className="mc-page">
      <div className="portal-bg" aria-hidden="true" />
      <div className="container">
        {/* Hero / Connection Header */}
        <header className="mc-hero glass-panel">
          <div className="mc-hero-main">
            <div className="mc-badges">
              <span className={`mc-status-pill ${data?.online !== false ? 'online' : 'offline'}`}>
                <span className="mc-dot" />
                {data?.online !== false ? 'SERVIDOR EN LÍNEA' : 'OFFLINE'}
              </span>
              <span className="mc-badge"><Gamepad2 size={15} /> {data?.version || 'Paper 26.2'}</span>
              <span className="mc-badge voice"><Mic size={15} /> Chat de Proximidad Activo</span>
              <span className="mc-badge"><Users size={15} /> {data ? `${data.onlineCount} / ${data.maxPlayers}` : '0 / 10'} jugando</span>
            </div>

            <h1 className="mc-title">
              Servidor <span className="text-gradient">Minecraft</span> Homelab
            </h1>
            <p className="mc-subtitle">
              Supervivencia comunitaria con chat de voz de proximidad, tumbas, teletransporte y mapa 3D en tiempo real.
            </p>

            <div className="mc-actions">
              <button type="button" onClick={copyIp} className="mc-ip-btn">
                <span className="mc-ip-label">IP:</span>
                <code>{data?.address || 'stamina-feeder.tun.ply.gg'}</code>
                {copied ? <Check size={18} className="copied-icon" /> : <Copy size={18} />}
                <span className="mc-ip-hint">{copied ? '¡Copiada!' : 'Copiar'}</span>
              </button>

              <a href={`${API_BASE}/api/minecraft/modpack/mrpack`} className="mc-dl-btn primary">
                <Download size={17} />
                <span>Modpack (.mrpack)</span>
              </a>
              <a href={`${API_BASE}/api/minecraft/modpack/zip`} className="mc-dl-btn">
                <Download size={17} />
                <span>Mods (.zip TLauncher)</span>
              </a>
            </div>
          </div>
        </header>

        {/* Global Stats Bar */}
        <section className="mc-stats-grid">
          <div className="mc-stat-card glass-panel">
            <Clock size={22} className="mc-stat-icon" style={{ color: '#38bdf8' }} />
            <div>
              <p className="mc-stat-value">{totals.playHours} h</p>
              <p className="mc-stat-label">Tiempo Jugado</p>
            </div>
          </div>
          <div className="mc-stat-card glass-panel">
            <Pickaxe size={22} className="mc-stat-icon" style={{ color: '#a78bfa' }} />
            <div>
              <p className="mc-stat-value">{totals.blocksMined.toLocaleString()}</p>
              <p className="mc-stat-label">Bloques Picados</p>
            </div>
          </div>
          <div className="mc-stat-card glass-panel">
            <Gem size={22} className="mc-stat-icon" style={{ color: '#22d3ee' }} />
            <div>
              <p className="mc-stat-value">{totals.diamonds}</p>
              <p className="mc-stat-label">Diamantes Minados</p>
            </div>
          </div>
          <div className="mc-stat-card glass-panel">
            <Trophy size={22} className="mc-stat-icon" style={{ color: '#facc15' }} />
            <div>
              <p className="mc-stat-value">{totals.advancements}</p>
              <p className="mc-stat-label">Logros Desbloqueados</p>
            </div>
          </div>
          <div className="mc-stat-card glass-panel">
            <Skull size={22} className="mc-stat-icon" style={{ color: '#f87171' }} />
            <div>
              <p className="mc-stat-value">{totals.deaths}</p>
              <p className="mc-stat-label">Muertes Totales</p>
            </div>
          </div>
        </section>

        {/* Live 3D Map (BlueMap) */}
        <section className="mc-section glass-panel">
          <div className="mc-section-header">
            <div>
              <h2 className="mc-section-title">
                <Compass size={22} className="text-gradient" /> Mapa 3D en Vivo
              </h2>
              <p className="mc-section-desc">
                Explora las construcciones y ve la posición de los jugadores conectados en tiempo real (Overworld, Nether y End).
              </p>
            </div>
            <a
              href={`${API_BASE}/map/`}
              target="_blank"
              rel="noreferrer"
              className="mc-dl-btn primary"
            >
              <span>Pantalla Completa</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="mc-map-frame-wrap">
            <iframe
              src={`${API_BASE}/map/`}
              title="Mapa en vivo de Minecraft (BlueMap)"
              className="mc-map-iframe"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>

        {/* World Progression / Milestones */}
        <section className="mc-section glass-panel">
          <div className="mc-section-header">
            <div>
              <h2 className="mc-section-title">
                <Trophy size={22} className="text-gradient" /> Avance Global del Mundo
              </h2>
              <p className="mc-section-desc">
                Se actualiza automáticamente cuando cualquier jugador desbloquea un hito dentro del servidor.
              </p>
            </div>
            <div className="mc-progress-summary">
              <span>{completedCount} / {milestones.length} hitos ({progressPct}%)</span>
              <div className="stat-bar-bg" style={{ width: '160px' }}>
                <div className="stat-bar-fill" style={{ width: `${progressPct}%`, background: '#10b981' }} />
              </div>
            </div>
          </div>

          <div className="mc-milestones-grid">
            {milestones.map((m) => (
              <div key={m.id} className={`mc-milestone ${m.completed ? 'done' : ''}`}>
                <div className="mc-milestone-icon">
                  {m.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </div>
                <div className="mc-milestone-body">
                  <h4>{m.title}</h4>
                  <p>{m.desc}</p>
                  {m.unlockedBy && (
                    <span className="mc-unlocked-by">Desbloqueado por {m.unlockedBy}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Players & Leaderboard */}
        <section className="mc-section glass-panel">
          <div className="mc-section-header">
            <div>
              <h2 className="mc-section-title">
                <Users size={22} className="text-gradient" /> Jugadores y Estadísticas
              </h2>
              <p className="mc-section-desc">
                Progreso individual de todos los jugadores registrados en el mundo.
              </p>
            </div>
          </div>

          {players.length === 0 ? (
            <p className="mc-empty">
              Aún no han entrado jugadores al mundo. ¡Conéctate a <code>stamina-feeder.tun.ply.gg</code> para aparecer en el ranking!
            </p>
          ) : (
            <div className="mc-table-wrap">
              <table className="mc-players-table">
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Estado / Ubicación</th>
                    <th>Horas</th>
                    <th>Diamantes</th>
                    <th>Bloques</th>
                    <th>Mobs</th>
                    <th>Logros</th>
                    <th>Muertes</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.uuid}>
                      <td className="mc-player-cell">
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(p.name)}/36`}
                          alt={p.name}
                          className="mc-avatar"
                        />
                        <span className="mc-player-name">{p.name}</span>
                      </td>
                      <td>
                        {p.online ? (
                          <span className="mc-online-tag">
                            ● En línea {p.location ? `(${p.location.dimension}: ${p.location.x}, ${p.location.z})` : ''}
                          </span>
                        ) : (
                          <span className="mc-offline-tag">Desconectado</span>
                        )}
                      </td>
                      <td>{p.playHours} h</td>
                      <td>{p.diamonds}</td>
                      <td>{p.blocksMined.toLocaleString()}</td>
                      <td>{p.mobKills}</td>
                      <td>{p.advancements}</td>
                      <td>{p.deaths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Minecraft;
