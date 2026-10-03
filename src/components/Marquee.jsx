import './Marquee.css';

// ============================================================
// NUEVO: cinta infinita con el stack (CSS-only, sin JS)
// aria-hidden: es repetición decorativa de contenido ya visible
// ============================================================
const ITEMS = [
  'C#',
  'Java',
  'TypeScript',
  'Python',
  'AI & Fine-tuning',
  'Web & Android',
  'Unity',
  'Unreal',
  'React',
  'Vite',
  'Cloudflare',
  'Docker',
  'Proxmox',
  'Linux',
  'PowerShell',
];

const Marquee = () => (
  <div className="marquee" aria-hidden="true">
    <div className="marquee-track">
      {[0, 1].map((dup) => (
        <ul className="marquee-list" key={dup}>
          {ITEMS.map((item) => (
            <li className="marquee-item" key={`${dup}-${item}`}>
              <span className="marquee-dot" />
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  </div>
);

export default Marquee;
