import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Check, Download, ExternalLink, RefreshCw, Lock, Terminal, User, Shield, Settings, LogOut, Crown
} from 'lucide-react';
import './Minecraft.css';

const API_BASE = 'https://api.hectorajm.dpdns.org';
const ASSET_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/26.3/assets/minecraft/textures';
const LOCAL_ASSET_BASE = `${API_BASE}/api/mc-textures`;

// Zero-dependency Web Audio API 8-bit Minecraft SFX synthesizer
let sharedAudioCtx = null;

const mcTone = (ctx, start, { freq, to, dur = 0.1, type = 'square', vol = 0.12 }) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
};

const mcNoise = (ctx, start, dur, { freq = 1200, to, type = 'lowpass', vol = 0.2 } = {}) => {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = type;
  filt.frequency.setValueAtTime(freq, start);
  if (to) filt.frequency.exponentialRampToValueAtTime(to, start + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.connect(filt);
  filt.connect(gain);
  gain.connect(ctx.destination);
  src.start(start);
  src.stop(start + dur);
};

// opts.semi: semitono del bloque musical (0-24) · opts.hit: golpe actual al picar (1-5)
const playMcSfx = (type = 'pop', opts = {}) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    switch (type) {
      case 'xp':
        [587.33, 659.25, 783.99, 1046.5].forEach((freq, i) =>
          mcTone(ctx, now + i * 0.055, { freq, dur: 0.18, type: 'triangle' })
        );
        return;
      case 'achievement':
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) =>
          mcTone(ctx, now + i * 0.09, { freq, dur: 0.35, type: 'triangle', vol: 0.13 })
        );
        return;
      case 'note': {
        // Afinación real del bloque musical: F#3 (185 Hz) + semitonos
        const freq = 185 * Math.pow(2, (opts.semi || 0) / 12);
        mcTone(ctx, now, { freq, dur: 0.5, type: 'sine', vol: 0.2 });
        mcTone(ctx, now, { freq: freq * 2, dur: 0.25, type: 'triangle', vol: 0.05 });
        mcNoise(ctx, now, 0.03, { freq: 2200, type: 'highpass', vol: 0.06 });
        return;
      }
      case 'mine': {
        const hit = opts.hit || 1;
        mcNoise(ctx, now, 0.09, { freq: 500 + hit * 160, type: 'bandpass', vol: 0.22 });
        mcTone(ctx, now, { freq: 150 + hit * 28, to: 60, dur: 0.09, vol: 0.1 });
        return;
      }
      case 'break':
        mcNoise(ctx, now, 0.3, { freq: 1800, to: 200, vol: 0.32 });
        mcTone(ctx, now, { freq: 110, to: 45, dur: 0.18, vol: 0.14 });
        return;
      case 'creeper':
        mcNoise(ctx, now, 1.2, { freq: 2600, type: 'highpass', vol: 0.16 });
        return;
      case 'explode':
        mcNoise(ctx, now, 1.1, { freq: 1600, to: 70, vol: 0.55 });
        mcTone(ctx, now, { freq: 95, to: 28, dur: 0.9, type: 'sawtooth', vol: 0.3 });
        return;
      case 'eat':
        [0, 0.1, 0.2].forEach((t) => mcNoise(ctx, now + t, 0.06, { freq: 900, type: 'bandpass', vol: 0.28 }));
        return;
      case 'lever':
        mcTone(ctx, now, { freq: 240, to: 150, dur: 0.05, vol: 0.14 });
        mcTone(ctx, now + 0.07, { freq: 320, to: 200, dur: 0.05, vol: 0.12 });
        mcNoise(ctx, now, 0.04, { freq: 3000, type: 'highpass', vol: 0.08 });
        return;
      case 'portal':
        mcTone(ctx, now, { freq: 110, to: 330, dur: 1.5, type: 'sine', vol: 0.2 });
        mcTone(ctx, now, { freq: 117, to: 352, dur: 1.5, type: 'triangle', vol: 0.12 });
        mcNoise(ctx, now, 1.5, { freq: 300, to: 2400, type: 'bandpass', vol: 0.12 });
        return;
      case 'herobrine':
        mcTone(ctx, now, { freq: 55, to: 41, dur: 2.2, type: 'sine', vol: 0.3 });
        mcNoise(ctx, now, 2.2, { freq: 220, to: 60, vol: 0.18 });
        return;
      case 'ender':
        mcTone(ctx, now, { freq: 190, to: 880, dur: 0.28, type: 'sine', vol: 0.15 });
        return;
      case 'ghast':
        mcTone(ctx, now, { freq: 720, to: 1040, dur: 0.35, type: 'sine', vol: 0.22 });
        mcTone(ctx, now + 0.18, { freq: 1040, to: 480, dur: 0.45, type: 'triangle', vol: 0.18 });
        mcNoise(ctx, now + 0.1, 0.45, { freq: 1400, to: 300, vol: 0.16 });
        return;
      case 'fireball':
        mcNoise(ctx, now, 0.25, { freq: 400, to: 1600, vol: 0.25 });
        mcNoise(ctx, now + 0.2, 0.8, { freq: 1200, to: 60, vol: 0.45 });
        mcTone(ctx, now + 0.2, { freq: 85, to: 30, dur: 0.7, type: 'sawtooth', vol: 0.25 });
        return;
      case 'enderman':
        mcTone(ctx, now, { freq: 310, to: 190, dur: 0.4, type: 'sawtooth', vol: 0.25 });
        mcTone(ctx, now + 0.08, { freq: 440, to: 280, dur: 0.35, type: 'sawtooth', vol: 0.2 });
        mcNoise(ctx, now, 0.5, { freq: 2400, to: 800, vol: 0.22 });
        return;
      case 'teleport':
        mcTone(ctx, now, { freq: 180, to: 640, dur: 0.22, type: 'sine', vol: 0.25 });
        mcTone(ctx, now + 0.05, { freq: 640, to: 160, dur: 0.24, type: 'triangle', vol: 0.2 });
        mcNoise(ctx, now, 0.26, { freq: 1800, to: 250, type: 'bandpass', vol: 0.18 });
        return;
      case 'charge': {
        const ch = opts.charge || 1;
        const baseF = 440 + ch * 95;
        mcTone(ctx, now, { freq: baseF, to: baseF * 1.5, dur: 0.28, type: 'triangle', vol: 0.22 });
        mcTone(ctx, now + 0.06, { freq: baseF * 2, dur: 0.22, type: 'sine', vol: 0.16 });
        return;
      }
      default:
        // pop
        mcTone(ctx, now, { freq: 420, to: 660, dur: 0.07, type: 'triangle' });
    }
  } catch {}
};

const SPLASH_PHRASES = [
  '¡No piques hacia abajo!',
  '100% libre de Herobrine... ¿o no?',
  '¡Java y Bedrock juntos!',
  'Creeper, aw man!',
  '¿Alguien tiene hierro que me preste?',
  '¡Cuidado con el Warden!',
  'La tarta es mentira (pero rica)',
  'Ahora con 20% más de gravilla',
  'Hecho en un homelab, no en la nube',
  '¡Sin lag! Bueno, casi',
  'Tu cama está en otra dimensión',
  'Lava abajo, paciencia arriba',
  'Que no te mire el Enderman',
  'sudo op @a',
  '¡Haz clic en el Creeper! (bajo tu propio riesgo)',
  'Probado por 0 Villagers',
  'Dos Sniffers caben en un Homelab',
  '↑ ↑ ↓ ↓ ← → ← → B A',
  'Cinco clics al ícono... y no mires atrás'
];

const BURIED_ORES = [
  { id: 'diamond_ore', label: 'Diamante', dropIcon: 'diamond', texture: 'block/diamond_ore.png', reward: '+1 💎 Diamante', debris: ['#4aedd9', '#1fb5a5', '#c8fff6'] },
  { id: 'emerald_ore', label: 'Esmeralda', dropIcon: 'emerald', texture: 'block/emerald_ore.png', reward: '+1 💚 Esmeralda', debris: ['#17dd62', '#0a9b3f', '#9dffbd'] },
  { id: 'gold_ore', label: 'Oro', dropIcon: 'gold_ingot', texture: 'block/gold_ore.png', reward: '+1 🪙 Oro', debris: ['#fcee4b', '#d9a521', '#fff8b0'] },
  { id: 'redstone_ore', label: 'Redstone', dropIcon: 'redstone', texture: 'block/redstone_ore.png', reward: '+4 🔴 Redstone', glow: true, debris: ['#ff2a2a', '#a50d0d', '#ff8a8a'] }
];

// Dimensiones: tema, flora de superficie y textos de transición
const DIMENSIONS = {
  overworld: {
    label: '🌿 Overworld', short: 'Overworld', chip: 'grass_block_side', portalText: 'Volviendo al Overworld…',
    flora: ['dandelion', 'oak_sapling', 'torch', 'poppy']
  },
  nether: {
    label: '🔥 Nether', short: 'Nether', chip: 'netherrack', portalText: 'Entrando al Nether…',
    flora: ['crimson_fungus', 'warped_fungus', 'soul_torch', 'crimson_roots']
  },
  end: {
    label: '🌌 End', short: 'End', chip: 'end_stone', portalText: 'Cruzando al End…',
    flora: ['chorus_flower', 'chorus_plant', 'end_rod', 'chorus_flower_dead']
  }
};
const DIMENSION_ORDER = ['overworld', 'nether', 'end'];

const NOTE_NAMES = ['F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F'];
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

// Catálogo de secretos: icono y nombre
const SECRET_EGGS = [
  { id: 'creeper', icon: 'gunpowder', name: 'Aw Man' },
  { id: 'ghast', icon: 'ghast_tear', name: 'Lágrima al Viento' },
  { id: 'enderman', icon: 'ender_eye', name: 'Contacto Visual' },
  { id: 'note', icon: 'note_block', name: 'Afinador Perfecto' },
  { id: 'cake', icon: 'cake', name: 'La Tarta es Mentira' },
  { id: 'anchor', icon: 'respawn_anchor', name: 'Ancla Sobrecargada' },
  { id: 'dragon_egg', icon: 'dragon_egg', name: 'Huevo Escapista' },
  { id: 'portal', icon: 'obsidian', name: 'Más Profundo' },
  { id: 'end', icon: 'ender_pearl', name: 'El Fin... ¿o No?' },
  { id: 'miner', icon: 'diamond_pickaxe', name: 'Minero Maestro' },
  { id: 'konami', icon: 'experience_bottle', name: 'Código Konami' },
  { id: 'herobrine', icon: 'nether_star', name: 'Nunca Estuvo Allí' },
  { id: 'doll', icon: 'name_tag', name: 'Nombre Raro' }
];

const ITEM_TEXTURE_ALIASES = {
  ghast_tear: 'item/ghast_tear.png',
  nether_star: 'item/nether_star.png',
  gunpowder: 'item/gunpowder.png',
  oak_log: 'block/oak_log.png',
  birch_log: 'block/birch_log.png',
  spruce_log: 'block/spruce_log.png',
  cobblestone: 'block/cobblestone.png',
  cobbled_deepslate: 'block/cobbled_deepslate.png',
  stone: 'block/stone.png',
  deepslate: 'block/deepslate.png',
  dirt: 'block/dirt.png',
  grass_block: 'block/grass_block_side.png',
  gravel: 'block/gravel.png',
  sand: 'block/sand.png',
  tuff: 'block/tuff.png',
  oak_planks: 'block/oak_planks.png',
  birch_planks: 'block/birch_planks.png',
  crafting_table: 'block/crafting_table_front.png',
  furnace: 'block/furnace_front.png',
  blast_furnace: 'block/blast_furnace_front.png',
  chest: 'block/barrel_side.png',
  ender_chest: 'item/ender_eye.png',
  torch: 'block/torch.png',
  soul_torch: 'block/soul_torch.png',
  oak_fence: 'block/oak_planks.png',
  tnt: 'block/tnt_side.png',
  obsidian: 'block/obsidian.png',
  crying_obsidian: 'block/crying_obsidian.png',
  glass: 'block/glass.png',
  hay_block: 'block/hay_block_side.png',
  crossbow: 'item/crossbow_standby.png',
  compass: 'item/compass_16.png',
  recovery_compass: 'item/recovery_compass_16.png',
  clock: 'item/clock_00.png',
  shield: 'gui/sprites/container/slot/shield.png',
  dragon_egg: 'block/dragon_egg.png',
  beacon: 'block/beacon.png',
  enchanting_table: 'block/enchanting_table_top.png',
  anvil: 'block/anvil.png',
  glowstone: 'block/glowstone.png',
  sponge: 'block/sponge.png',
  bedrock: 'block/bedrock.png',
  diamond_block: 'block/diamond_block.png',
  gold_block: 'block/gold_block.png',
  iron_block: 'block/iron_block.png',
  emerald_block: 'block/emerald_block.png',
  netherite_block: 'block/netherite_block.png',
  redstone_block: 'block/redstone_block.png',
  rail: 'block/rail.png',
  powered_rail: 'block/powered_rail.png',
  sculk_shrieker: 'block/sculk_shrieker_side.png',
  carved_pumpkin: 'block/carved_pumpkin.png',
  jack_o_lantern: 'block/jack_o_lantern.png',
  cobweb: 'block/cobweb.png',
  ice: 'block/ice.png',
  packed_ice: 'block/packed_ice.png',
  leaf_litter: 'block/leaf_litter.png',
  command_block: 'block/command_block_front.png',
  player_head: 'block/carved_pumpkin.png',
  note_block: 'block/note_block.png',
  dandelion: 'block/dandelion.png',
  poppy: 'block/poppy.png',
  oak_sapling: 'block/oak_sapling.png',
  lever: 'block/lever.png',
  wither_skeleton_skull: 'block/soul_sand.png',
  dragon_head: 'block/dragon_egg.png',
  white_banner: 'item/ominous_bottle.png',
  red_bed: 'block/red_bed_head_up.png',
  decorated_pot: 'item/angler_pottery_sherd.png',
  dried_ghast: 'block/dried_ghast_hydration_0_north.png',
  potion: 'item/experience_bottle.png',
  map: 'item/filled_map.png',
  red_nether_bricks: 'block/red_nether_bricks.png',
  polished_blackstone_bricks: 'block/polished_blackstone_bricks.png',
  ancient_debris: 'block/ancient_debris_side.png',
  nether_bricks: 'block/nether_bricks.png',
  respawn_anchor: 'block/respawn_anchor_side0.png',
  end_stone: 'block/end_stone.png',
  purpur_block: 'block/purpur_block.png',
  sculk_catalyst: 'block/sculk_catalyst_side.png',
  target: 'block/target_side.png',
  jukebox: 'block/jukebox_side.png',
  chiseled_tuff: 'block/chiseled_tuff.png',
  copper_bulb: 'block/copper_bulb.png',
  honey_block: 'block/honey_block_side.png',
  sculk_sensor: 'block/sculk_sensor_side.png',
  lightning_rod: 'block/lightning_rod.png',
  chiseled_bookshelf: 'block/chiseled_bookshelf_empty.png',
  crafter: 'block/crafter_north.png',
  creaking_heart: 'block/creaking_heart_awake.png',
  lodestone: 'block/lodestone_side.png',
  verdant_froglight: 'block/verdant_froglight_side.png',
  sniffer_egg: 'block/sniffer_egg_not_cracked_north.png',
  bee_nest: 'block/bee_nest_front.png'
};

const ARMOR_EMPTY_SPRITES = {
  head: `${ASSET_BASE}/gui/sprites/container/slot/helmet.png`,
  chest: `${ASSET_BASE}/gui/sprites/container/slot/chestplate.png`,
  legs: `${ASSET_BASE}/gui/sprites/container/slot/leggings.png`,
  feet: `${ASSET_BASE}/gui/sprites/container/slot/boots.png`,
  offhand: `${ASSET_BASE}/gui/sprites/container/slot/shield.png`
};

const formatItemName = (id) => {
  if (!id) return '';
  return String(id)
    .replace(/^minecraft:/, '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const McItemIcon = ({ id, size = 34, className = 'mc-slot-icon' }) => {
  const cleanId = String(id || '').replace(/^minecraft:/, '').toLowerCase();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
  }, [cleanId]);

  const candidates = useMemo(() => {
    if (!cleanId) return [];
    const list = [];
    if (ITEM_TEXTURE_ALIASES[cleanId]) {
      list.push(`${ASSET_BASE}/${ITEM_TEXTURE_ALIASES[cleanId]}`);
      list.push(`${LOCAL_ASSET_BASE}/${ITEM_TEXTURE_ALIASES[cleanId]}`);
    }
    for (const base of [ASSET_BASE, LOCAL_ASSET_BASE]) {
      list.push(
        `${base}/item/${cleanId}.png`,
        `${base}/block/${cleanId}.png`,
        `${base}/block/${cleanId}_side.png`,
        `${base}/block/${cleanId}_top.png`,
        `${base}/block/${cleanId}_front.png`
      );
    }
    return [...new Set(list)];
  }, [cleanId]);

  if (!cleanId) return null;
  if (step >= candidates.length) {
    return (
      <div className="mc-slot-fallback" style={{ width: size, height: size }}>
        {cleanId.slice(0, 4)}
      </div>
    );
  }

  return (
    <img
      src={candidates[step]}
      alt=""
      className={className}
      style={{ width: size, height: size }}
      onError={() => setStep((s) => s + 1)}
      draggable={false}
    />
  );
};

const CREATIVE_CATALOG = {
  combat: {
    label: '⚔️ Combate',
    items: [
      { id: 'minecraft:netherite_sword', name: 'Espada de Netherite' },
      { id: 'minecraft:diamond_sword', name: 'Espada de Diamante' },
      { id: 'minecraft:iron_spear', name: 'Lanza de Hierro (26.3)' },
      { id: 'minecraft:mace', name: 'Maza Pesada (Mace)' },
      { id: 'minecraft:trident', name: 'Tridente' },
      { id: 'minecraft:bow', name: 'Arco' },
      { id: 'minecraft:crossbow', name: 'Ballesta' },
      { id: 'minecraft:arrow', name: 'Flechas' },
      { id: 'minecraft:shield', name: 'Escudo' },
      { id: 'minecraft:totem_of_undying', name: 'Tótem de la Inmortalidad' },
      { id: 'minecraft:netherite_helmet', name: 'Casco de Netherite' },
      { id: 'minecraft:netherite_chestplate', name: 'Peto de Netherite' },
      { id: 'minecraft:netherite_leggings', name: 'Grebas de Netherite' },
      { id: 'minecraft:netherite_boots', name: 'Botas de Netherite' },
      { id: 'minecraft:copper_helmet', name: 'Casco de Cobre (26.3)' },
      { id: 'minecraft:copper_chestplate', name: 'Peto de Cobre (26.3)' },
      { id: 'minecraft:copper_leggings', name: 'Grebas de Cobre (26.3)' },
      { id: 'minecraft:copper_boots', name: 'Botas de Cobre (26.3)' }
    ]
  },
  tools: {
    label: '⛏️ Herramientas',
    items: [
      { id: 'minecraft:netherite_pickaxe', name: 'Pico de Netherite' },
      { id: 'minecraft:diamond_pickaxe', name: 'Pico de Diamante' },
      { id: 'minecraft:copper_pickaxe', name: 'Pico de Cobre (26.3)' },
      { id: 'minecraft:netherite_axe', name: 'Hacha de Netherite' },
      { id: 'minecraft:diamond_axe', name: 'Hacha de Diamante' },
      { id: 'minecraft:netherite_shovel', name: 'Pala de Netherite' },
      { id: 'minecraft:copper_shovel', name: 'Pala de Cobre (26.3)' },
      { id: 'minecraft:netherite_hoe', name: 'Azada de Netherite' },
      { id: 'minecraft:elytra', name: 'Elytras' },
      { id: 'minecraft:firework_rocket', name: 'Cohetes Propulsores' },
      { id: 'minecraft:fishing_rod', name: 'Caña de Pescar' },
      { id: 'minecraft:flint_and_steel', name: 'Mechero' },
      { id: 'minecraft:shears', name: 'Tijeras' },
      { id: 'minecraft:water_bucket', name: 'Cubo de Agua' },
      { id: 'minecraft:lava_bucket', name: 'Cubo de Lava' },
      { id: 'minecraft:oak_boat', name: 'Bote de Roble' },
      { id: 'minecraft:saddle', name: 'Montura' },
      { id: 'minecraft:compass', name: 'Brújula' }
    ]
  },
  food: {
    label: '🍎 Comida',
    items: [
      { id: 'minecraft:enchanted_golden_apple', name: 'Manzana Dorada Encantada (Notch)' },
      { id: 'minecraft:golden_apple', name: 'Manzana de Oro' },
      { id: 'minecraft:golden_carrot', name: 'Zanahoria Dorada' },
      { id: 'minecraft:cooked_beef', name: 'Filete Asado' },
      { id: 'minecraft:cooked_porkchop', name: 'Chuleta Cocinada' },
      { id: 'minecraft:cooked_mutton', name: 'Cordero Asado' },
      { id: 'minecraft:cooked_chicken', name: 'Pollo Asado' },
      { id: 'minecraft:cooked_salmon', name: 'Salmón Ahumado' },
      { id: 'minecraft:bread', name: 'Pan' },
      { id: 'minecraft:baked_potato', name: 'Papa Horneada' },
      { id: 'minecraft:pumpkin_pie', name: 'Pastel de Calabaza' },
      { id: 'minecraft:cake', name: 'Pastel' },
      { id: 'minecraft:chorus_fruit', name: 'Fruta Coral' },
      { id: 'minecraft:milk_bucket', name: 'Cubo de Leche' }
    ]
  },
  materials: {
    label: '💎 Materiales',
    items: [
      { id: 'minecraft:diamond', name: 'Diamante' },
      { id: 'minecraft:netherite_ingot', name: 'Lingote de Netherite' },
      { id: 'minecraft:emerald', name: 'Esmeralda' },
      { id: 'minecraft:gold_ingot', name: 'Lingote de Oro' },
      { id: 'minecraft:iron_ingot', name: 'Lingote de Hierro' },
      { id: 'minecraft:copper_ingot', name: 'Lingote de Cobre' },
      { id: 'minecraft:coal', name: 'Carbón' },
      { id: 'minecraft:lapis_lazuli', name: 'Lapislázuli' },
      { id: 'minecraft:redstone', name: 'Polvo de Redstone' },
      { id: 'minecraft:quartz', name: 'Cuarzo del Nether' },
      { id: 'minecraft:amethyst_shard', name: 'Fragmento de Amatista' },
      { id: 'minecraft:ender_pearl', name: 'Perla de Ender' },
      { id: 'minecraft:ender_eye', name: 'Ojo de Ender' },
      { id: 'minecraft:blaze_rod', name: 'Vara de Blaze' },
      { id: 'minecraft:nether_star', name: 'Estrella del Nether' },
      { id: 'minecraft:shulker_shell', name: 'Caparazón de Shulker' },
      { id: 'minecraft:netherite_upgrade_smithing_template', name: 'Plantilla de Mejora Netherite' },
      { id: 'minecraft:stick', name: 'Palo' }
    ]
  },
  blocks: {
    label: '🧱 Bloques',
    items: [
      { id: 'minecraft:oak_log', name: 'Tronco de Roble' },
      { id: 'minecraft:oak_planks', name: 'Madera de Roble' },
      { id: 'minecraft:cobblestone', name: 'Adoquín' },
      { id: 'minecraft:stone', name: 'Piedra' },
      { id: 'minecraft:cobbled_deepslate', name: 'Pizarra Profunda' },
      { id: 'minecraft:dirt', name: 'Tierra' },
      { id: 'minecraft:grass_block', name: 'Bloque de Pasto' },
      { id: 'minecraft:sand', name: 'Arena' },
      { id: 'minecraft:gravel', name: 'Grava' },
      { id: 'minecraft:glass', name: 'Cristal' },
      { id: 'minecraft:obsidian', name: 'Obsidiana' },
      { id: 'minecraft:crying_obsidian', name: 'Obsidiana Llorosa' },
      { id: 'minecraft:torch', name: 'Antorcha' },
      { id: 'minecraft:crafting_table', name: 'Mesa de Crafteo' },
      { id: 'minecraft:furnace', name: 'Horno' },
      { id: 'minecraft:chest', name: 'Cofre / Barril' },
      { id: 'minecraft:ender_chest', name: 'Cofre de Ender' },
      { id: 'minecraft:tnt', name: 'TNT' },
      { id: 'minecraft:diamond_block', name: 'Bloque de Diamante' },
      { id: 'minecraft:netherite_block', name: 'Bloque de Netherite' },
      { id: 'minecraft:glowstone', name: 'Piedra Luminosa' },
      { id: 'minecraft:hay_block', name: 'Bala de Heno' }
    ]
  },
  special: {
    label: '🧪 Especial',
    items: [
      { id: 'minecraft:experience_bottle', name: 'Frasco con Experiencia' },
      { id: 'minecraft:beacon', name: 'Faro Mágico (Beacon)' },
      { id: 'minecraft:dragon_egg', name: 'Huevo de la Dragona' },
      { id: 'minecraft:enchanting_table', name: 'Mesa de Encantamientos' },
      { id: 'minecraft:anvil', name: 'Yunque' },
      { id: 'minecraft:music_disc_pigstep', name: 'Disco Musical: Pigstep' },
      { id: 'minecraft:music_disc_otherside', name: 'Disco Musical: Otherside' },
      { id: 'minecraft:spyglass', name: 'Catalejo' },
      { id: 'minecraft:goat_horn', name: 'Cuerno de Cabra' },
      { id: 'minecraft:heart_of_the_sea', name: 'Corazón del Mar' },
      { id: 'minecraft:recovery_compass', name: 'Brújula de Recuperación' },
      { id: 'minecraft:clock', name: 'Reloj' }
    ]
  }
};

const PRANK_CATEGORIES = {
  terror: {
    label: '👻 Sustos',
    items: [
      {
        id: 'herobrine_ritual',
        icon: 'soul_torch',
        label: 'Aparición de Herobrine',
        desc: 'Finge que entra al server, apaga la luz, susurra y Herobrine camina hacia él con espada de netherita',
        danger: false
      },
      {
        id: 'herobrine_shrine',
        icon: 'crying_obsidian',
        label: 'Altar de Herobrine',
        desc: 'Construye el altar bloque a bloque, cae un rayo y Herobrine camina con espada de netherita sin atacar',
        danger: false
      },
      {
        id: 'herobrine_leave',
        icon: 'ender_pearl',
        label: 'Sacar a Herobrine',
        desc: 'Borra los muñecos y manda el mensaje de que salió del juego',
        danger: false
      },
      {
        id: 'warden_cinematic',
        icon: 'sculk_shrieker',
        label: 'Susto del Warden',
        desc: 'Oscuridad, latidos y el grito del Warden detrás (no hace daño)',
        danger: false
      },
      {
        id: 'elder_curse',
        icon: 'heart_of_the_sea',
        label: 'Jumpscare del Guardián',
        desc: 'Le sale el fantasma en la cara con grito de Ghast y fatiga',
        danger: false
      },
      {
        id: 'illusion_clones',
        icon: 'armor_stand',
        label: 'Rodear de clones',
        desc: 'Pone 6 muñecos iguales mirándolo fijo',
        danger: false
      },
      {
        id: 'fake_ban',
        icon: 'barrier',
        label: 'Ban falso por X-Ray',
        desc: 'Le pone la pantalla negra diciendo que fue baneado 5s',
        danger: false
      }
    ]
  },
  illusions: {
    label: '💥 Bromas',
    items: [
      {
        id: 'fake_tnt',
        icon: 'tnt',
        label: 'TNT falsa',
        desc: 'Suena la mecha y lo vuela por los aires sin romper nada',
        danger: false
      },
      {
        id: 'creeper_ambush',
        icon: 'gunpowder',
        label: 'Creepers detrás',
        desc: 'Suenan varios Creepers a punto de explotar a su espalda',
        danger: false
      },
      {
        id: 'fake_creeper_charge',
        icon: 'flint_and_steel',
        label: 'Creeper eléctrico',
        desc: 'Le aparece un Creeper cargado enfrente y desaparece',
        danger: false
      },
      {
        id: 'anvil_drop_scare',
        icon: 'anvil',
        label: 'Yunque en la cabeza',
        desc: 'Sonido de yunque cayéndole encima a todo volumen',
        danger: false
      },
      {
        id: 'cursed_diamonds',
        icon: 'diamond',
        label: 'Diamantes falsos',
        desc: 'Dice que ganó 64 diamantes pero le salen murciélagos y mareo',
        danger: false
      },
      {
        id: 'fake_lightning',
        icon: 'blaze_rod',
        label: 'Trueno sin daño',
        desc: 'Cae un rayo justo encima pero sin quemarlo',
        danger: false
      }
    ]
  },
  chaos: {
    label: '🌪️ Caos',
    items: [
      {
        id: 'tornado_spin',
        icon: 'wind_charge',
        label: 'Vuelta de tornado',
        desc: 'Lo levanta y le gira la cámara rápido por unos segundos',
        danger: false
      },
      {
        id: 'glass_cage',
        icon: 'glass',
        label: 'Jaula de cristal',
        desc: 'Lo encierra en cristal 8 segundos y luego se quita solo',
        danger: false
      },
      {
        id: 'disco_party',
        icon: 'music_disc_pigstep',
        label: 'Fiesta con ovejas jeb_',
        desc: 'Ovejas arcoíris, música Pigstep y cohetes',
        danger: false
      },
      {
        id: 'ufo_abduction',
        icon: 'ender_eye',
        label: 'Abducción OVNI',
        desc: 'Se lo lleva flotando al cielo y cae con caída lenta',
        danger: false
      },
      {
        id: 'freeze',
        icon: 'packed_ice',
        label: 'Congelar',
        desc: 'No se puede mover por 10 segundos',
        danger: false
      },
      {
        id: 'spider_web',
        icon: 'cobweb',
        label: 'Telarañas',
        desc: 'Ruido de arañas y caminar súper lento un rato',
        danger: false
      },
      {
        id: 'drunk',
        icon: 'fermented_spider_eye',
        label: 'Marear pantalla',
        desc: 'Le da náusea por 15 segundos',
        danger: false
      },
      {
        id: 'chicken_rain',
        icon: 'feather',
        label: 'Lluvia de pollos',
        desc: 'Le caen 18 pollos encima',
        danger: false
      }
    ]
  },
  bosses: {
    label: '👑 Jefes',
    items: [
      {
        id: 'titan',
        type: 'boss',
        icon: 'netherite_axe',
        label: '👹 Titán del Nether (500 HP)',
        desc: 'Piglin Brute gigante con Netherite IV, Hacha pesada y Fuerza II',
        danger: true
      },
      {
        id: 'wraith',
        type: 'boss',
        icon: 'bow',
        label: '👑 Rey Espectral (400 HP)',
        desc: 'Stray glacial con corona de oro, arco de fuego y aura congelante',
        danger: true
      },
      {
        id: 'void',
        type: 'boss',
        icon: 'dragon_breath',
        label: '🌌 Reina del Vacío (350 HP)',
        desc: 'Enderman supremo con teletransporte veloz, 24 daño y Aliento de Dragón',
        danger: true
      },
      {
        id: 'sculk',
        type: 'boss',
        icon: 'echo_shard',
        label: '🦠 Corruptor del Sculk (700 HP)',
        desc: 'Ravager colosal del Deep Dark con 30 de daño, rugido del Warden y almas',
        danger: true
      },
      {
        id: 'clear_bosses',
        type: 'boss',
        icon: 'barrier',
        label: '🧹 Quitar todos los Jefes',
        desc: 'Elimina los jefes activos y quita las barras de vida',
        danger: false
      }
    ]
  },
  events: {
    label: '🎆 Eventos',
    items: [
      {
        id: 'blood_moon',
        type: 'event',
        icon: 'redstone_block',
        label: '🔴 Luna de Sangre',
        desc: 'Medianoche roja con monstruos más veloces y peligrosos',
        danger: false
      },
      {
        id: 'meteor_shower',
        type: 'event',
        icon: 'fire_charge',
        label: '🌠 Lluvia de Meteoritos',
        desc: 'Explosiones y fuego cayendo del cielo cerca de los jugadores',
        danger: false
      },
      {
        id: 'thunder_curse',
        type: 'event',
        icon: 'lightning_rod',
        label: '⚡ Tormenta Maldita',
        desc: 'Cielos oscuros con truenos continuos y relámpagos',
        danger: false
      },
      {
        id: 'lucky_rain',
        type: 'event',
        icon: 'emerald',
        label: '💎 Fiebre de Oro y XP',
        desc: 'Lluvia de orbes de experiencia y tesoros para todos',
        danger: false
      },
      {
        id: 'raid_patrol',
        type: 'event',
        icon: 'white_banner',
        label: '⚔️ Patrulla de Saqueadores',
        desc: 'Aplica Mal Presagio e invoca al capitán saqueador',
        danger: false
      },
      {
        id: 'server_party',
        type: 'event',
        icon: 'music_disc_pigstep',
        label: '🎉 Fiesta del Servidor',
        desc: 'Día soleado, música Pigstep y fuegos artificiales para todos',
        danger: false
      },
      {
        id: 'clear_events',
        type: 'event',
        icon: 'milk_bucket',
        label: '🕊️ Limpiar Todos los Eventos',
        desc: 'Detiene todos los eventos, quita bossbars, restaura clima soleado y limpia efectos',
        danger: false,
        clear: true
      }
    ]
  },
  lethal: {
    label: '☠️ Peligro real',
    items: [
      {
        id: 'baby_zombies',
        icon: 'rotten_flesh',
        label: '4 Baby Zombies',
        desc: 'Le suelta 4 zombies chiquitos de verdad atrás',
        danger: true
      },
      {
        id: 'real_lightning',
        icon: 'fire_charge',
        label: 'Rayo de verdad',
        desc: 'Le cae un rayo real con fuego y daño',
        danger: true
      },
      {
        id: 'warden_real',
        icon: 'echo_shard',
        label: 'Soltar un Warden',
        desc: 'Spawnea un Warden real a 2 bloques de él',
        danger: true
      }
    ]
  }
};

const ADVANCEMENT_TABS = [
  {
    key: 'story',
    label: 'Minecraft',
    subtitle: 'El corazón y la historia del juego',
    icon: 'grass_block',
    bg: `${ASSET_BASE}/gui/advancements/backgrounds/stone.png`,
    nodes: [
      { id: 'minecraft:story/root', parent: null, col: 0, row: 2, frame: 'task', icon: 'grass_block', title: 'Minecraft', desc: 'El corazón y la historia del juego' },
      { id: 'minecraft:story/mine_stone', parent: 'minecraft:story/root', col: 1, row: 2, frame: 'task', icon: 'wooden_pickaxe', title: 'Edad de Piedra', desc: 'Pica piedra con tu nuevo pico' },
      { id: 'minecraft:story/upgrade_tools', parent: 'minecraft:story/mine_stone', col: 2, row: 2, frame: 'task', icon: 'stone_pickaxe', title: 'Una Mejora', desc: 'Construye un pico mejor de piedra' },
      { id: 'minecraft:story/smelt_iron', parent: 'minecraft:story/upgrade_tools', col: 3, row: 2, frame: 'task', icon: 'iron_ingot', title: 'Edad de Hierro', desc: 'Funde un lingote de hierro en el horno' },
      { id: 'minecraft:story/obtain_armor', parent: 'minecraft:story/smelt_iron', col: 4, row: 0, frame: 'task', icon: 'iron_chestplate', title: '¡Vístete!', desc: 'Protégete con una pieza de armadura de hierro' },
      { id: 'minecraft:story/deflect_arrow', parent: 'minecraft:story/obtain_armor', col: 5, row: 0, frame: 'task', icon: 'shield', title: 'Hoy No, Gracias', desc: 'Desvía un proyectil con un escudo' },
      { id: 'minecraft:story/iron_tools', parent: 'minecraft:story/smelt_iron', col: 4, row: 2, frame: 'task', icon: 'iron_pickaxe', title: '¿No es Hierro-nico?', desc: 'Mejora tu pico a hierro' },
      { id: 'minecraft:story/mine_diamond', parent: 'minecraft:story/iron_tools', col: 5, row: 2, frame: 'task', icon: 'diamond', title: '¡Diamantes!', desc: 'Consigue diamantes en las profundidades' },
      { id: 'minecraft:story/shiny_gear', parent: 'minecraft:story/mine_diamond', col: 6, row: 1, frame: 'task', icon: 'diamond_chestplate', title: 'Cúbreme de Diamantes', desc: 'La armadura de diamante salva vidas' },
      { id: 'minecraft:story/enchant_item', parent: 'minecraft:story/mine_diamond', col: 6, row: 2, frame: 'task', icon: 'enchanted_book', title: 'Encantador', desc: 'Encanta un objeto en una mesa de encantamientos' },
      { id: 'minecraft:story/lava_bucket', parent: 'minecraft:story/smelt_iron', col: 4, row: 4, frame: 'task', icon: 'lava_bucket', title: 'Cosas Calientes', desc: 'Llena un cubo con lava ardiente' },
      { id: 'minecraft:story/form_obsidian', parent: 'minecraft:story/lava_bucket', col: 5, row: 4, frame: 'task', icon: 'obsidian', title: 'Mente Fría', desc: 'Forma y pica un bloque de obsidiana' },
      { id: 'minecraft:story/enter_the_nether', parent: 'minecraft:story/form_obsidian', col: 6, row: 4, frame: 'task', icon: 'flint_and_steel', title: 'Tenemos que Ir Más Profundo', desc: 'Construye, enciende y entra a un portal del Nether' },
      { id: 'minecraft:story/cure_zombie_villager', parent: 'minecraft:story/enter_the_nether', col: 7, row: 3, frame: 'goal', icon: 'golden_apple', title: 'Doctor Zombi', desc: 'Debilita y cura a un aldeano zombi' },
      { id: 'minecraft:story/follow_ender_eye', parent: 'minecraft:story/enter_the_nether', col: 7, row: 4, frame: 'task', icon: 'ender_eye', title: 'Sigue al Ojo', desc: 'Sigue un ojo de Ender hasta el Stronghold' },
      { id: 'minecraft:story/enter_the_end', parent: 'minecraft:story/follow_ender_eye', col: 8, row: 4, frame: 'task', icon: 'end_stone', title: '¿El Fin?', desc: 'Entra al portal del End' }
    ]
  },
  {
    key: 'nether',
    label: 'Nether',
    subtitle: 'Trae ropa de verano al Inframundo',
    icon: 'red_nether_bricks',
    bg: `${ASSET_BASE}/gui/advancements/backgrounds/nether.png`,
    nodes: [
      { id: 'minecraft:nether/root', parent: null, col: 0, row: 4, frame: 'task', icon: 'red_nether_bricks', title: 'Nether', desc: 'Trae ropa de verano' },
      { id: 'minecraft:nether/return_to_sender', parent: 'minecraft:nether/root', col: 1, row: 0, frame: 'challenge', icon: 'fire_charge', title: 'Devuelto al Remitente', desc: 'Destruye un Ghast con su propia bola de fuego' },
      { id: 'minecraft:nether/uneasy_alliance', parent: 'minecraft:nether/return_to_sender', col: 2, row: 0, frame: 'challenge', icon: 'ghast_tear', title: 'Alianza Incómoda', desc: 'Rescata un Ghast del Nether y mátalo en el Overworld' },
      { id: 'minecraft:nether/find_bastion', parent: 'minecraft:nether/root', col: 1, row: 1, frame: 'task', icon: 'polished_blackstone_bricks', title: 'Aquellos Eran los Días', desc: 'Entra en un Bastión en Ruinas' },
      { id: 'minecraft:nether/loot_bastion', parent: 'minecraft:nether/find_bastion', col: 2, row: 1, frame: 'task', icon: 'chest', title: 'Cerdo de Guerra', desc: 'Saquea un cofre en un Bastión en Ruinas' },
      { id: 'minecraft:nether/obtain_ancient_debris', parent: 'minecraft:nether/root', col: 1, row: 2, frame: 'task', icon: 'ancient_debris', title: 'Oculto en las Profundidades', desc: 'Obtén Escombros Ancestrales' },
      { id: 'minecraft:nether/netherite_armor', parent: 'minecraft:nether/obtain_ancient_debris', col: 2, row: 2, frame: 'challenge', icon: 'netherite_chestplate', title: 'Cúbreme de Escombros', desc: 'Consigue una armadura completa de Netherite' },
      { id: 'minecraft:nether/fast_travel', parent: 'minecraft:nether/root', col: 1, row: 3, frame: 'challenge', icon: 'map', title: 'Burbuja Subespacial', desc: 'Usa el Nether para viajar 7 km en el Overworld' },
      { id: 'minecraft:nether/find_fortress', parent: 'minecraft:nether/root', col: 1, row: 4, frame: 'task', icon: 'nether_bricks', title: 'Una Terrible Fortaleza', desc: 'Ábrete paso hasta una Fortaleza del Nether' },
      { id: 'minecraft:nether/get_wither_skull', parent: 'minecraft:nether/find_fortress', col: 2, row: 3, frame: 'task', icon: 'wither_skeleton_skull', title: 'Escalofriante Esqueleto', desc: 'Obtén la calavera de un Esqueleto Wither' },
      { id: 'minecraft:nether/summon_wither', parent: 'minecraft:nether/get_wither_skull', col: 3, row: 3, frame: 'task', icon: 'nether_star', title: 'Alturas Marchitas', desc: 'Invoca al Wither' },
      { id: 'minecraft:nether/create_beacon', parent: 'minecraft:nether/summon_wither', col: 4, row: 3, frame: 'task', icon: 'beacon', title: 'Trae el Faro a Casa', desc: 'Construye y coloca un Faro' },
      { id: 'minecraft:nether/create_full_beacon', parent: 'minecraft:nether/create_beacon', col: 5, row: 3, frame: 'goal', icon: 'beacon', title: 'Farolero', desc: 'Lleva un Faro a su máxima potencia' },
      { id: 'minecraft:nether/obtain_blaze_rod', parent: 'minecraft:nether/find_fortress', col: 2, row: 4, frame: 'task', icon: 'blaze_rod', title: 'En Llamas', desc: 'Despoja a un Blaze de su vara' },
      { id: 'minecraft:nether/brew_potion', parent: 'minecraft:nether/obtain_blaze_rod', col: 3, row: 4, frame: 'task', icon: 'potion', title: 'Destilería Local', desc: 'Prepara una poción' },
      { id: 'minecraft:nether/all_potions', parent: 'minecraft:nether/brew_potion', col: 4, row: 4, frame: 'challenge', icon: 'milk_bucket', title: 'Una Mezcla Furiosa', desc: 'Ten todos los efectos de poción aplicados a la vez' },
      { id: 'minecraft:nether/all_effects', parent: 'minecraft:nether/all_potions', col: 5, row: 4, frame: 'challenge', icon: 'bucket', title: '¿Cómo Llegamos Aquí?', desc: 'Ten todos los efectos de estado aplicados a la vez' },
      { id: 'minecraft:nether/obtain_crying_obsidian', parent: 'minecraft:nether/root', col: 1, row: 5, frame: 'task', icon: 'crying_obsidian', title: '¿Quién Está Cortando Cebollas?', desc: 'Obtén Obsidiana Llorosa' },
      { id: 'minecraft:nether/charge_respawn_anchor', parent: 'minecraft:nether/obtain_crying_obsidian', col: 2, row: 5, frame: 'task', icon: 'respawn_anchor', title: 'No Tan "Nueve" Vidas', desc: 'Carga un Nexo de Reaparición al máximo' },
      { id: 'minecraft:nether/ride_strider', parent: 'minecraft:nether/root', col: 1, row: 6, frame: 'task', icon: 'warped_fungus_on_a_stick', title: 'Este Barco Tiene Patas', desc: 'Monta un Lavagante con un hongo distorsionado en un palo' },
      { id: 'minecraft:nether/ride_strider_in_overworld_lava', parent: 'minecraft:nether/ride_strider', col: 2, row: 6, frame: 'task', icon: 'warped_fungus_on_a_stick', title: 'Se Siente Como en Casa', desc: 'Pasea en Lavagante 50 bloques sobre lava en el Overworld' },
      { id: 'minecraft:nether/explore_nether', parent: 'minecraft:nether/ride_strider', col: 2, row: 7, frame: 'challenge', icon: 'netherite_boots', title: 'Destinos Turísticos Ardientes', desc: 'Explora los 5 biomas del Nether' },
      { id: 'minecraft:nether/distract_piglin', parent: 'minecraft:nether/root', col: 1, row: 7, frame: 'task', icon: 'gold_ingot', title: '¡Oh, Brillante!', desc: 'Distrae a los Piglins con oro' }
    ]
  },
  {
    key: 'end',
    label: 'El End',
    subtitle: '¿O es el principio?',
    icon: 'end_stone',
    bg: `${ASSET_BASE}/gui/advancements/backgrounds/end.png`,
    nodes: [
      { id: 'minecraft:end/root', parent: null, col: 0, row: 2, frame: 'task', icon: 'end_stone', title: 'El End', desc: '¿O el principio?' },
      { id: 'minecraft:end/kill_dragon', parent: 'minecraft:end/root', col: 1, row: 2, frame: 'task', icon: 'dragon_head', title: 'Liberar el End', desc: 'Buena suerte derrotando a la Dragona del End' },
      { id: 'minecraft:end/dragon_egg', parent: 'minecraft:end/kill_dragon', col: 2, row: 0, frame: 'goal', icon: 'dragon_egg', title: 'La Próxima Generación', desc: 'Sostén el Huevo de la Dragona' },
      { id: 'minecraft:end/dragon_breath', parent: 'minecraft:end/kill_dragon', col: 2, row: 1, frame: 'goal', icon: 'dragon_breath', title: 'Necesitas una Menta', desc: 'Recoge aliento de dragón en un frasco de cristal' },
      { id: 'minecraft:end/respawn_dragon', parent: 'minecraft:end/kill_dragon', col: 2, row: 2, frame: 'goal', icon: 'end_crystal', title: 'El Fin... ¿Otra Vez?', desc: 'Revive a la Dragona del End' },
      { id: 'minecraft:end/enter_end_gateway', parent: 'minecraft:end/kill_dragon', col: 2, row: 3, frame: 'task', icon: 'ender_pearl', title: 'Escapada Remota', desc: 'Escapa de la isla central hacia las islas exteriores' },
      { id: 'minecraft:end/find_end_city', parent: 'minecraft:end/enter_end_gateway', col: 3, row: 3, frame: 'task', icon: 'purpur_block', title: 'La Ciudad en el Fin del Juego', desc: 'Entra en una Ciudad del End' },
      { id: 'minecraft:end/elytra', parent: 'minecraft:end/find_end_city', col: 4, row: 2, frame: 'goal', icon: 'elytra', title: 'El Cielo es el Límite', desc: 'Encuentra unas Elytras en un barco del End' },
      { id: 'minecraft:end/levitate', parent: 'minecraft:end/find_end_city', col: 4, row: 3, frame: 'challenge', icon: 'shulker_shell', title: 'Gran Vista Desde Aquí Arriba', desc: 'Levita 50 bloques de altura por el ataque de un Shulker' }
    ]
  },
  {
    key: 'adventure',
    label: 'Aventura',
    subtitle: 'Aventura, exploración y combate',
    icon: 'map',
    bg: `${ASSET_BASE}/gui/advancements/backgrounds/adventure.png`,
    nodes: [
      { id: 'minecraft:adventure/root', parent: null, col: 0, row: 6, frame: 'task', icon: 'map', title: 'Aventura', desc: 'Aventura, exploración y combate' },
      { id: 'minecraft:adventure/voluntary_exile', parent: 'minecraft:adventure/root', col: 1, row: 0, frame: 'task', icon: 'white_banner', title: 'Exilio Voluntario', desc: 'Mata al capitán de una patrulla de saqueadores' },
      { id: 'minecraft:adventure/hero_of_the_village', parent: 'minecraft:adventure/voluntary_exile', col: 2, row: 0, frame: 'challenge', icon: 'white_banner', title: 'Héroe de la Aldea', desc: 'Defiende con éxito una aldea de una incursión' },
      { id: 'minecraft:adventure/spyglass_at_parrot', parent: 'minecraft:adventure/root', col: 1, row: 1, frame: 'task', icon: 'spyglass', title: '¿Es un Pájaro?', desc: 'Mira a un loro a través de un catalejo' },
      { id: 'minecraft:adventure/spyglass_at_ghast', parent: 'minecraft:adventure/spyglass_at_parrot', col: 2, row: 1, frame: 'task', icon: 'spyglass', title: '¿Es un Globo?', desc: 'Mira a un Ghast a través de un catalejo' },
      { id: 'minecraft:adventure/spyglass_at_dragon', parent: 'minecraft:adventure/spyglass_at_ghast', col: 3, row: 1, frame: 'task', icon: 'spyglass', title: '¿Es un Avión?', desc: 'Mira a la Dragona del End a través de un catalejo' },
      { id: 'minecraft:adventure/kill_a_mob', parent: 'minecraft:adventure/root', col: 1, row: 3, frame: 'task', icon: 'iron_sword', title: 'Cazador de Monstruos', desc: 'Mata a cualquier monstruo hostil' },
      { id: 'minecraft:adventure/kill_all_mobs', parent: 'minecraft:adventure/kill_a_mob', col: 2, row: 2, frame: 'challenge', icon: 'diamond_sword', title: 'Monstruos Cazados', desc: 'Mata a uno de cada monstruo hostil' },
      { id: 'minecraft:adventure/kill_mob_near_sculk_catalyst', parent: 'minecraft:adventure/kill_a_mob', col: 2, row: 3, frame: 'challenge', icon: 'sculk_catalyst', title: 'Se Expande', desc: 'Mata a una criatura cerca de un catalizador de Sculk' },
      { id: 'minecraft:adventure/totem_of_undying', parent: 'minecraft:adventure/kill_a_mob', col: 2, row: 4, frame: 'goal', icon: 'totem_of_undying', title: 'Post Mortem', desc: 'Usa un Tótem de la Inmortalidad para engañar a la muerte' },
      { id: 'minecraft:adventure/spear_many_mobs', parent: 'minecraft:adventure/kill_a_mob', col: 3, row: 2, frame: 'goal', icon: 'iron_spear', title: 'Brocheta de Mobs', desc: 'Golpea a 5 criaturas en un solo ataque de carga con Lanza' },
      { id: 'minecraft:adventure/throw_trident', parent: 'minecraft:adventure/kill_a_mob', col: 3, row: 3, frame: 'task', icon: 'trident', title: 'Un Tiro al Aire', desc: 'Lanza un tridente a algo' },
      { id: 'minecraft:adventure/very_very_frightening', parent: 'minecraft:adventure/throw_trident', col: 4, row: 3, frame: 'task', icon: 'trident', title: 'Muy, Muy Aterrador', desc: 'Golpea a un aldeano con un rayo' },
      { id: 'minecraft:adventure/shoot_arrow', parent: 'minecraft:adventure/kill_a_mob', col: 3, row: 4, frame: 'task', icon: 'bow', title: 'Apunta', desc: 'Dispara algo con un arco y una flecha' },
      { id: 'minecraft:adventure/sniper_duel', parent: 'minecraft:adventure/shoot_arrow', col: 4, row: 4, frame: 'challenge', icon: 'arrow', title: 'Duelo de Francotiradores', desc: 'Mata a un esqueleto desde al menos 50 metros de distancia' },
      { id: 'minecraft:adventure/bullseye', parent: 'minecraft:adventure/shoot_arrow', col: 4, row: 5, frame: 'challenge', icon: 'target', title: 'En el Blanco', desc: 'Da en el centro exacto de una diana desde 30 metros' },
      { id: 'minecraft:adventure/ol_betsy', parent: 'minecraft:adventure/root', col: 1, row: 5, frame: 'task', icon: 'crossbow', title: 'Vieja Confiable', desc: 'Dispara una ballesta' },
      { id: 'minecraft:adventure/whos_the_pillager_now', parent: 'minecraft:adventure/ol_betsy', col: 2, row: 5, frame: 'task', icon: 'crossbow', title: '¿Quién es el Saqueador Ahora?', desc: 'Dale a un saqueador de su propia medicina' },
      { id: 'minecraft:adventure/two_birds_one_arrow', parent: 'minecraft:adventure/ol_betsy', col: 2, row: 6, frame: 'challenge', icon: 'crossbow', title: 'Dos Pájaros de un Tiro', desc: 'Mata dos Fantasmas con una flecha perforante' },
      { id: 'minecraft:adventure/arbalistic', parent: 'minecraft:adventure/ol_betsy', col: 3, row: 6, frame: 'challenge', icon: 'crossbow', title: 'Arbalístico', desc: 'Mata cinco criaturas únicas con un disparo de ballesta' },
      { id: 'minecraft:adventure/trade', parent: 'minecraft:adventure/root', col: 1, row: 7, frame: 'task', icon: 'emerald', title: '¡Qué Ganga!', desc: 'Comercia con éxito con un aldeano' },
      { id: 'minecraft:adventure/summon_iron_golem', parent: 'minecraft:adventure/trade', col: 2, row: 7, frame: 'goal', icon: 'carved_pumpkin', title: 'Ayuda Contratada', desc: 'Invoca un Gólem de Hierro para defender una aldea' },
      { id: 'minecraft:adventure/trade_at_world_height', parent: 'minecraft:adventure/trade', col: 3, row: 7, frame: 'task', icon: 'emerald', title: 'Comerciante Estelar', desc: 'Comercia con un aldeano en el límite de altura de construcción' },
      { id: 'minecraft:adventure/sleep_in_bed', parent: 'minecraft:adventure/root', col: 1, row: 8, frame: 'task', icon: 'red_bed', title: 'Dulces Sueños', desc: 'Duerme en una cama para cambiar tu punto de aparición' },
      { id: 'minecraft:adventure/adventuring_time', parent: 'minecraft:adventure/sleep_in_bed', col: 2, row: 8, frame: 'challenge', icon: 'diamond_boots', title: 'Hora de Aventuras', desc: 'Descubre todos los biomas del Overworld' },
      { id: 'minecraft:adventure/play_jukebox_in_meadows', parent: 'minecraft:adventure/sleep_in_bed', col: 3, row: 8, frame: 'task', icon: 'jukebox', title: 'Sonido de la Música', desc: 'Haz que el prado cobre vida con el sonido de un tocadiscos' },
      { id: 'minecraft:adventure/walk_on_powder_snow_with_leather_boots', parent: 'minecraft:adventure/sleep_in_bed', col: 4, row: 8, frame: 'task', icon: 'leather_boots', title: 'Ligero como un Conejo', desc: 'Camina sobre nieve polvo con botas de cuero' },
      { id: 'minecraft:adventure/minecraft_trials_edition', parent: 'minecraft:adventure/root', col: 1, row: 9, frame: 'task', icon: 'chiseled_tuff', title: 'Minecraft: Edición Cámaras de Desafío', desc: 'Entra en una Cámara de Desafío' },
      { id: 'minecraft:adventure/under_lock_and_key', parent: 'minecraft:adventure/minecraft_trials_edition', col: 2, row: 9, frame: 'task', icon: 'trial_key', title: 'Bajo Llave', desc: 'Abre una bóveda con una llave de desafío' },
      { id: 'minecraft:adventure/revaulting', parent: 'minecraft:adventure/under_lock_and_key', col: 3, row: 9, frame: 'goal', icon: 'ominous_trial_key', title: 'Re-Bóveda', desc: 'Abre una bóveda ominosa con una llave ominosa' },
      { id: 'minecraft:adventure/blowback', parent: 'minecraft:adventure/minecraft_trials_edition', col: 2, row: 10, frame: 'challenge', icon: 'wind_charge', title: 'Contraataque de Viento', desc: 'Mata a un Breeze con su propia carga de viento desviada' },
      { id: 'minecraft:adventure/who_needs_rockets', parent: 'minecraft:adventure/minecraft_trials_edition', col: 3, row: 10, frame: 'task', icon: 'wind_charge', title: '¿Quién Necesita Cohetes?', desc: 'Usa una carga de viento para lanzarte 8 bloques hacia arriba' },
      { id: 'minecraft:adventure/overoverkill', parent: 'minecraft:adventure/minecraft_trials_edition', col: 4, row: 10, frame: 'challenge', icon: 'mace', title: 'Súper Masacre', desc: 'Inflige 50 corazones de daño en un solo golpe con la Maza' },
      { id: 'minecraft:adventure/lighten_up', parent: 'minecraft:adventure/minecraft_trials_edition', col: 4, row: 9, frame: 'task', icon: 'copper_bulb', title: 'Ilumínate', desc: 'Raspa una lámpara de cobre con un hacha para que brille más' },
      { id: 'minecraft:adventure/salvage_sherd', parent: 'minecraft:adventure/root', col: 1, row: 11, frame: 'task', icon: 'brush', title: 'Restauración Cuidadosa', desc: 'Cepilla bloque sospechoso para obtener un fragmento de cerámica' },
      { id: 'minecraft:adventure/craft_decorated_pot_using_only_sherds', parent: 'minecraft:adventure/salvage_sherd', col: 2, row: 11, frame: 'task', icon: 'decorated_pot', title: 'Respetando los Restos', desc: 'Fabrica una vasija decorada con 4 fragmentos de cerámica' },
      { id: 'minecraft:adventure/trim_with_any_armor_pattern', parent: 'minecraft:adventure/root', col: 1, row: 12, frame: 'task', icon: 'dune_armor_trim_smithing_template', title: 'Creando un Nuevo Estilo', desc: 'Adorna tu armadura en una mesa de herrería' },
      { id: 'minecraft:adventure/trim_with_all_exclusive_armor_patterns', parent: 'minecraft:adventure/trim_with_any_armor_pattern', col: 2, row: 12, frame: 'challenge', icon: 'silence_armor_trim_smithing_template', title: 'Herrería con Estilo', desc: 'Aplica los diseños de armadura exclusivos al menos una vez' },
      { id: 'minecraft:adventure/honey_block_slide', parent: 'minecraft:adventure/root', col: 3, row: 11, frame: 'task', icon: 'honey_block', title: 'Situación Pegajosa', desc: 'Salta contra un bloque de miel para frenar tu caída' },
      { id: 'minecraft:adventure/avoid_vibration', parent: 'minecraft:adventure/root', col: 4, row: 11, frame: 'task', icon: 'sculk_sensor', title: 'Se Mueve en Silencio', desc: 'Camina en sigilo cerca de un sensor de Sculk o Warden' },
      { id: 'minecraft:adventure/fall_from_world_height', parent: 'minecraft:adventure/root', col: 5, row: 11, frame: 'challenge', icon: 'water_bucket', title: 'Cuevas y Acantilados', desc: 'Cae desde lo más alto hasta el fondo del mundo y sobrevive' },
      { id: 'minecraft:adventure/lightning_rod_with_villager_no_fire', parent: 'minecraft:adventure/root', col: 3, row: 12, frame: 'task', icon: 'lightning_rod', title: 'Protector de Sobretensión', desc: 'Protege a un aldeano de un rayo con un pararrayos' },
      { id: 'minecraft:adventure/read_power_of_chiseled_bookshelf', parent: 'minecraft:adventure/root', col: 4, row: 12, frame: 'task', icon: 'chiseled_bookshelf', title: 'El Poder de los Libros', desc: 'Lee la señal de energía de una estantería cincelada' },
      { id: 'minecraft:adventure/crafters_crafting_crafters', parent: 'minecraft:adventure/root', col: 5, row: 12, frame: 'task', icon: 'crafter', title: 'Fabricadores Fabricando Fabricadores', desc: 'Establece un Fabricador automático que fabrique otro Fabricador' },
      { id: 'minecraft:adventure/brush_armadillo', parent: 'minecraft:adventure/root', col: 6, row: 11, frame: 'task', icon: 'armadillo_scute', title: '¿No son Escudos Lindos?', desc: 'Obtén escamas de armadillo usando un pincel' },
      { id: 'minecraft:adventure/heart_transplanter', parent: 'minecraft:adventure/root', col: 6, row: 12, frame: 'task', icon: 'creaking_heart', title: 'Trasplante de Corazón', desc: 'Coloca un Corazón de Creaking entre dos bloques de roble pálido' },
      { id: 'minecraft:adventure/use_lodestone', parent: 'minecraft:adventure/root', col: 5, row: 9, frame: 'task', icon: 'lodestone', title: 'Llévanos a Casa', desc: 'Usa una brújula en una Magnetita' }
    ]
  },
  {
    key: 'husbandry',
    label: 'Agricultura',
    subtitle: 'El mundo está lleno de amigos y comida',
    icon: 'hay_block',
    bg: `${ASSET_BASE}/gui/advancements/backgrounds/husbandry.png`,
    nodes: [
      { id: 'minecraft:husbandry/root', parent: null, col: 0, row: 4, frame: 'task', icon: 'hay_block', title: 'Agricultura', desc: 'El mundo está lleno de amigos y comida' },
      { id: 'minecraft:husbandry/breed_an_animal', parent: 'minecraft:husbandry/root', col: 1, row: 0, frame: 'task', icon: 'wheat', title: 'Los Loros y los Murciélagos', desc: 'Cría dos animales juntos' },
      { id: 'minecraft:husbandry/bred_all_animals', parent: 'minecraft:husbandry/breed_an_animal', col: 2, row: 0, frame: 'challenge', icon: 'golden_carrot', title: 'De Dos en Dos', desc: 'Cría todos los animales posibles' },
      { id: 'minecraft:husbandry/plant_seed', parent: 'minecraft:husbandry/root', col: 1, row: 1, frame: 'task', icon: 'wheat', title: 'Un Lugar Sembrado', desc: 'Planta una semilla y mírala crecer' },
      { id: 'minecraft:husbandry/balanced_diet', parent: 'minecraft:husbandry/plant_seed', col: 2, row: 1, frame: 'challenge', icon: 'apple', title: 'Una Dieta Equilibrada', desc: 'Come todo lo que sea comestible' },
      { id: 'minecraft:husbandry/obtain_netherite_hoe', parent: 'minecraft:husbandry/plant_seed', col: 3, row: 1, frame: 'challenge', icon: 'netherite_hoe', title: 'Dedicación Seria', desc: 'Usa un lingote de Netherite para mejorar una azada' },
      { id: 'minecraft:husbandry/fishy_business', parent: 'minecraft:husbandry/root', col: 1, row: 2, frame: 'task', icon: 'fishing_rod', title: 'Negocio Sospechoso', desc: 'Pesca un pez' },
      { id: 'minecraft:husbandry/tactical_fishing', parent: 'minecraft:husbandry/fishy_business', col: 2, row: 2, frame: 'task', icon: 'pufferfish_bucket', title: 'Pesca Táctica', desc: 'Atrapa un pez en un cubo... ¡sin caña de pescar!' },
      { id: 'minecraft:husbandry/axolotl_in_a_bucket', parent: 'minecraft:husbandry/tactical_fishing', col: 3, row: 2, frame: 'task', icon: 'axolotl_bucket', title: 'El Depredador Más Tierno', desc: 'Atrapa un ajolote en un cubo' },
      { id: 'minecraft:husbandry/kill_axolotl_target', parent: 'minecraft:husbandry/axolotl_in_a_bucket', col: 4, row: 2, frame: 'task', icon: 'tropical_fish_bucket', title: 'El Poder Curativo de la Amistad', desc: 'Haz equipo con un ajolote y gana una pelea' },
      { id: 'minecraft:husbandry/tame_an_animal', parent: 'minecraft:husbandry/root', col: 1, row: 3, frame: 'task', icon: 'lead', title: 'Mejores Amigos para Siempre', desc: 'Domestica un animal' },
      { id: 'minecraft:husbandry/complete_catalogue', parent: 'minecraft:husbandry/tame_an_animal', col: 2, row: 3, frame: 'challenge', icon: 'cod', title: 'Un Catálogo Completo', desc: 'Domestica todas las variantes de gatos' },
      { id: 'minecraft:husbandry/whole_pack', parent: 'minecraft:husbandry/tame_an_animal', col: 2, row: 4, frame: 'challenge', icon: 'bone', title: 'Toda la Manada', desc: 'Domestica una de cada variante de lobo' },
      { id: 'minecraft:husbandry/remove_wolf_armor', parent: 'minecraft:husbandry/tame_an_animal', col: 3, row: 3, frame: 'task', icon: 'shears', title: 'Cortando Lazos', desc: 'Quita la armadura de lobo usando tijeras' },
      { id: 'minecraft:husbandry/repair_wolf_armor', parent: 'minecraft:husbandry/tame_an_animal', col: 3, row: 4, frame: 'task', icon: 'wolf_armor', title: 'Como Nuevo', desc: 'Repara una armadura de lobo dañada con escamas de armadillo' },
      { id: 'minecraft:husbandry/safely_harvest_honey', parent: 'minecraft:husbandry/root', col: 1, row: 5, frame: 'task', icon: 'honey_bottle', title: 'Abeja Nuestra Invitada', desc: 'Usa una fogata para recolectar miel sin enojar a las abejas' },
      { id: 'minecraft:husbandry/wax_on', parent: 'minecraft:husbandry/safely_harvest_honey', col: 2, row: 5, frame: 'task', icon: 'honeycomb', title: 'Dar Cera', desc: 'Aplica panal a un bloque de cobre' },
      { id: 'minecraft:husbandry/wax_off', parent: 'minecraft:husbandry/wax_on', col: 3, row: 5, frame: 'task', icon: 'stone_axe', title: 'Pulir Cera', desc: 'Raspa la cera de un bloque de cobre' },
      { id: 'minecraft:husbandry/tadpole_in_a_bucket', parent: 'minecraft:husbandry/root', col: 1, row: 6, frame: 'task', icon: 'tadpole_bucket', title: 'Renacuajo al Cubo', desc: 'Atrapa un renacuajo en un cubo' },
      { id: 'minecraft:husbandry/leash_all_frog_variants', parent: 'minecraft:husbandry/tadpole_in_a_bucket', col: 2, row: 6, frame: 'task', icon: 'lead', title: 'Con Nuestros Poderes Combinados', desc: 'Ten las 3 variantes de ranas con una rienda' },
      { id: 'minecraft:husbandry/froglights', parent: 'minecraft:husbandry/leash_all_frog_variants', col: 3, row: 6, frame: 'challenge', icon: 'verdant_froglight', title: 'Con Nuestros Poderes Iluminados', desc: 'Consigue los 3 bloques de rana luminosa en tu inventario' },
      { id: 'minecraft:husbandry/allay_deliver_item_to_player', parent: 'minecraft:husbandry/root', col: 1, row: 7, frame: 'task', icon: 'cookie', title: 'Tienes un Amigo en Mí', desc: 'Haz que un Allay te entregue un objeto' },
      { id: 'minecraft:husbandry/allay_deliver_cake_to_note_block', parent: 'minecraft:husbandry/allay_deliver_item_to_player', col: 2, row: 7, frame: 'task', icon: 'note_block', title: 'Canción de Cumpleaños', desc: 'Haz que un Allay suelte un pastel en un bloque musical' },
      { id: 'minecraft:husbandry/obtain_sniffer_egg', parent: 'minecraft:husbandry/root', col: 1, row: 8, frame: 'task', icon: 'sniffer_egg', title: 'Huele Interesante', desc: 'Obtén un Huevo de Sniffer' },
      { id: 'minecraft:husbandry/feed_snifflet', parent: 'minecraft:husbandry/obtain_sniffer_egg', col: 2, row: 8, frame: 'task', icon: 'torchflower_seeds', title: 'Pequeños Olfatos', desc: 'Alimenta a un Sniffer bebé' },
      { id: 'minecraft:husbandry/plant_any_sniffer_seed', parent: 'minecraft:husbandry/feed_snifflet', col: 3, row: 8, frame: 'task', icon: 'pitcher_pod', title: 'Plantando el Pasado', desc: 'Planta cualquier semilla encontrada por un Sniffer' },
      { id: 'minecraft:husbandry/silk_touch_nest', parent: 'minecraft:husbandry/root', col: 4, row: 5, frame: 'task', icon: 'bee_nest', title: 'Mudanza Total', desc: 'Mueve una colmena con 3 abejas dentro usando Toque de Seda' },
      { id: 'minecraft:husbandry/ride_a_boat_with_a_goat', parent: 'minecraft:husbandry/root', col: 4, row: 6, frame: 'task', icon: 'oak_boat', title: 'Lo que Flote tu Cabra', desc: 'Súbete a un bote con una cabra' },
      { id: 'minecraft:husbandry/make_a_sign_glow', parent: 'minecraft:husbandry/root', col: 4, row: 7, frame: 'task', icon: 'glow_ink_sac', title: 'Brilla y Contempla', desc: 'Haz que el texto de un cartel brille' },
      { id: 'minecraft:husbandry/place_dried_ghast_in_water', parent: 'minecraft:husbandry/root', col: 4, row: 8, frame: 'task', icon: 'dried_ghast', title: '¡Mantente Hidratado!', desc: 'Coloca un Ghast Seco en el agua' }
    ]
  },
  {
    key: 'hackathon',
    label: 'Hackathon CS',
    subtitle: '5 Retos Universitarios de Ciencias de la Computación',
    icon: 'redstone',
    bg: `${ASSET_BASE}/gui/advancements/backgrounds/stone.png`,
    nodes: [
      { id: 'hackathon:root', parent: null, col: 0, row: 2, frame: 'goal', icon: 'command_block', title: 'Hackathon Universitario CS', desc: 'Domina los 5 retos de Ingeniería en Computación dentro del servidor' },
      { id: 'hackathon:reto_1', parent: 'hackathon:root', col: 1, row: 0, frame: 'challenge', icon: 'redstone', title: 'Reto 1: La ALU Rota', desc: 'Lógica Digital: Repara el Sumador Completo y Compuertas XOR/AND' },
      { id: 'hackathon:reto_2', parent: 'hackathon:root', col: 1, row: 1, frame: 'challenge', icon: 'repeater', title: 'Reto 2: Packet Tracer Físico', desc: 'Redes: Enrutamiento CIDR y reglas de Firewall ACL con Redstone' },
      { id: 'hackathon:reto_3', parent: 'hackathon:root', col: 1, row: 2, frame: 'challenge', icon: 'rail', title: 'Reto 3: Puente de Grafos', desc: 'Algoritmos: Resuelve el Camino Mínimo de Dijkstra en vagoneta' },
      { id: 'hackathon:reto_4', parent: 'hackathon:root', col: 1, row: 3, frame: 'challenge', icon: 'clock', title: 'Reto 4: Deadlock de Filósofos', desc: 'Sistemas Operativos: Sincroniza los Semáforos Mutex sin bloqueo' },
      { id: 'hackathon:reto_5', parent: 'hackathon:root', col: 1, row: 4, frame: 'challenge', icon: 'ender_eye', title: 'Reto 5: Criptografía XOR', desc: 'Seguridad: Descifra la Matriz Binaria para abrir la bóveda' }
    ]
  }
];

// 8x8 pixel Creeper face matrix for Overworld
const CREEPER_FACE_PIXELS = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 0, 0, 1, 1, 0,
  0, 1, 1, 0, 0, 1, 1, 0,
  0, 0, 0, 1, 1, 0, 0, 0,
  0, 0, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 0, 0, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0
];

// 8x8 pixel Ghast face matrix for Nether (0: white body, 1: dark eye/mouth, 2: tear trails)
const GHAST_FACE_PIXELS = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 0, 0, 1, 1, 0,
  0, 2, 2, 0, 0, 2, 2, 0,
  0, 2, 0, 0, 0, 0, 2, 0,
  0, 0, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0
];

// 8x8 pixel Enderman face matrix for The End (0: dark body, 1: purple eye outer, 2: pink/white center)
const ENDERMAN_FACE_PIXELS = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  1, 2, 0, 0, 0, 0, 2, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0
];

const Minecraft = () => {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedBedrock, setCopiedBedrock] = useState(false);
  const [mapUrl, setMapUrl] = useState(`${API_BASE}/map/`);

  // Admin / God Mode states
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [adminMe, setAdminMe] = useState('AntonioJara');
  const [tpTarget, setTpTarget] = useState('');
  const [inspectData, setInspectData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // 1:1 Inventory & Creative states
  const [showEnderChest, setShowEnderChest] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [heldCatalogItem, setHeldCatalogItem] = useState(null);
  const [creativeTab, setCreativeTab] = useState('combat');
  const [creativeSearch, setCreativeSearch] = useState('');
  const [creativeQty, setCreativeQty] = useState(1);
  const [placeMode, setPlaceMode] = useState(false);

  // Prank & RCON states
  const [prankTab, setPrankTab] = useState('terror');
  const [customItem, setCustomItem] = useState('minecraft:diamond');
  const [customCount, setCustomCount] = useState(1);
  const [titleText, setTitleText] = useState('TE ESTOY VIENDO');
  const [subText, setSubText] = useState('');
  const [rawCmd, setRawCmd] = useState('');
  const [adminLog, setAdminLog] = useState('');

  // 1:1 Advancements Screen (L Menu) states
  const [advTab, setAdvTab] = useState('story');
  const [advPlayerFilter, setAdvPlayerFilter] = useState('ALL');
  const [showAdvLabels, setShowAdvLabels] = useState(false);
  const [focusedAdvId, setFocusedAdvId] = useState(null);
  const [advDragging, setAdvDragging] = useState(false);
  const [advDragOrigin, setAdvDragOrigin] = useState({ x: 0, y: 0, left: 0, top: 0 });
  const advViewportRef = useRef(null);

  // Living World & Interactive Easter Egg states
  const [splashIdx, setSplashIdx] = useState(() => Math.floor(Math.random() * SPLASH_PHRASES.length));
  const [toasts, setToasts] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [foundEggs, setFoundEggs] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mc_eggs') || '[]');
      return Array.isArray(s) ? s.filter((id) => SECRET_EGGS.some((e) => e.id === id)) : [];
    } catch {
      return [];
    }
  });
  const [flash, setFlash] = useState(false);
  const [portalFx, setPortalFx] = useState(null); // null | 'nether' | 'overworld'
  const [herobrineFx, setHerobrineFx] = useState(null); // null | { left, top }
  const [xpRain, setXpRain] = useState(false);
  const [noteSemi, setNoteSemi] = useState(0);
  const [cakeGone, setCakeGone] = useState(false);
  const fxId = useRef(0);
  const creeperRef = useRef(null);
  const iconClicks = useRef([]);
  const brokenOres = useRef(new Set());
  const konamiPos = useRef(0);
  const foundRef = useRef(foundEggs);
  const [creeperState, setCreeperState] = useState('idle'); // 'idle' | 'primed' | 'exploded'
  const [ghastState, setGhastState] = useState('idle'); // 'idle' | 'shooting' | 'fired'
  const [endermanState, setEndermanState] = useState('idle'); // 'idle' | 'staring' | 'teleported'
  const [anchorCharges, setAnchorCharges] = useState(0); // 0..4
  const [anchorBlown, setAnchorBlown] = useState(false);
  const [eggOffset, setEggOffset] = useState({ x: 0, y: 0 });
  const [eggTaps, setEggTaps] = useState(0);
  const [leverPulled, setLeverPulled] = useState(false);
  const [dollEasterEgg, setDollEasterEgg] = useState('normal'); // 'normal' | 'dinnerbone' | 'jeb'
  const [dimension, setDimension] = useState(() => {
    try {
      const saved = localStorage.getItem('mc_dimension');
      return DIMENSIONS[saved] ? saved : 'overworld';
    } catch {
      return 'overworld';
    }
  });
  const netherMode = dimension === 'nether';
  useEffect(() => {
    try { localStorage.setItem('mc_dimension', dimension); } catch {}
  }, [dimension]);
  const [cakeBites, setCakeBites] = useState(0);
  const [noteParticles, setNoteParticles] = useState([]);
  const [minedTotal, setMinedTotal] = useState(0);
  const [oreStates, setOreStates] = useState({
    diamond_ore: { hits: 0, broken: false, toast: '' },
    emerald_ore: { hits: 0, broken: false, toast: '' },
    gold_ore: { hits: 0, broken: false, toast: '' },
    redstone_ore: { hits: 0, broken: false, toast: '' }
  });

  // Player Authentication & Privacy Settings states
  const [playerUser, setPlayerUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mc_player_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [mySettings, setMySettings] = useState({
    hideLocation: false,
    hideOnline: false,
    pvpMode: 'peaceful',
    tagline: '',
    notifyDeaths: true
  });

  useEffect(() => {
    if (!playerUser?.token) return;
    if (playerUser.settings) {
      setMySettings((prev) => ({ ...prev, ...playerUser.settings }));
    }
    fetch(`${API_BASE}/api/minecraft/player/me`, {
      headers: { Authorization: `Bearer ${playerUser.token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Expired');
        return res.json();
      })
      .then((resData) => {
        if (resData.player?.settings) {
          setMySettings((prev) => ({ ...prev, ...resData.player.settings }));
          setPlayerUser((prev) => (prev ? { ...prev, settings: resData.player.settings } : prev));
        }
      })
      .catch(() => {
        localStorage.removeItem('mc_player_session');
        setPlayerUser(null);
      });
  }, [playerUser?.token]);

  const isAdmin = playerUser?.username?.toLowerCase() === 'antoniojara';

  useEffect(() => {
    if (isAdmin) {
      setShowAdmin(true);
      setAdminUnlocked(true);
      setAdminMe('AntonioJara');
    } else {
      setShowAdmin(false);
      setAdminUnlocked(false);
    }
  }, [isAdmin]);

  const handlePlayerLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Ingresa tu usuario y contraseña de Minecraft.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/minecraft/player/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password
        })
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setLoginError(resData.error || 'Credenciales inválidas.');
        playMcSfx('break');
      } else {
        const session = {
          token: resData.token,
          username: resData.player.username,
          settings: resData.player.settings
        };
        localStorage.setItem('mc_player_session', JSON.stringify(session));
        setPlayerUser(session);
        setMySettings(resData.player.settings);
        setLoginModalOpen(false);
        setLoginForm({ username: '', password: '' });
        playMcSfx('xp');
        const statsRes = await fetch(`${API_BASE}/api/minecraft`);
        if (statsRes.ok) setData(await statsRes.json());
      }
    } catch {
      setLoginError('Error de red al conectar con el servidor.');
      playMcSfx('break');
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePlayerLogout = () => {
    playMcSfx('break');
    localStorage.removeItem('mc_player_session');
    setPlayerUser(null);
    setShowAdmin(false);
    setAdminUnlocked(false);
    setSettingsModalOpen(false);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!playerUser?.token) return;
    setSavingSettings(true);
    setSaveStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/minecraft/player/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${playerUser.token}`
        },
        body: JSON.stringify(mySettings)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSaveStatus('¡Preferencias guardadas con éxito!');
        playMcSfx('xp');
        const updated = { ...playerUser, settings: resData.settings };
        localStorage.setItem('mc_player_session', JSON.stringify(updated));
        setPlayerUser(updated);
        const statsRes = await fetch(`${API_BASE}/api/minecraft`);
        if (statsRes.ok) setData(await statsRes.json());
        setTimeout(() => setSaveStatus(''), 4000);
      } else {
        setSaveStatus(resData.error || 'Error al guardar.');
        playMcSfx('break');
      }
    } catch {
      setSaveStatus('Error de red al guardar.');
      playMcSfx('break');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/minecraft`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          if (!selectedPlayer && json.players?.length) {
            setSelectedPlayer(json.players[0].name);
          }
        }
      } catch (e) {
        console.error('Error fetching Minecraft data:', e);
      }
    };
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [selectedPlayer]);

  const currentPlayerObj = (data?.players || []).find((p) => p.name === selectedPlayer) || data?.players?.[0];

  const callAdmin = async (payload) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (playerUser?.token) {
        headers['Authorization'] = `Bearer ${playerUser.token}`;
      }
      const res = await fetch(`${API_BASE}/api/minecraft/admin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          password: adminPass,
          player: selectedPlayer || 'AntonioJara',
          uuid: currentPlayerObj?.uuid,
          ...payload
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setAdminLog(`❌ ${json.error || 'Error'}`);
        return null;
      }
      if (json.output) setAdminLog(`✅ ${json.output}`);
      return json;
    } catch {
      setAdminLog('❌ Error de red con la API');
      return null;
    }
  };

  const inspectPlayer = async (targetName) => {
    const pObj = (data?.players || []).find((p) => p.name === (targetName || selectedPlayer)) || currentPlayerObj;
    if (!pObj) return;
    setInspectLoading(true);
    const res = await callAdmin({ action: 'inspect', player: pObj.name, uuid: pObj.uuid });
    setInspectLoading(false);
    if (res) {
      setAdminUnlocked(true);
      setInspectData(res);
    }
  };

  const handleUnlockAdmin = async (e) => {
    e.preventDefault();
    playMcSfx('xp');
    await inspectPlayer(selectedPlayer);
  };

  // Build O(1) slot lookup maps for 1:1 Survival Inventory (0..35) and EnderChest (0..26)
  const invMap = useMemo(() => {
    const map = {};
    for (const it of inspectData?.inventory || []) {
      if (it && it.slot !== undefined) map[Number(it.slot)] = it;
    }
    return map;
  }, [inspectData]);

  const enderMap = useMemo(() => {
    const map = {};
    for (const it of inspectData?.enderChest || []) {
      if (it && it.slot !== undefined) map[Number(it.slot)] = it;
    }
    return map;
  }, [inspectData]);

  const handleSlotClick = async (slotType, slotKey, currentItem) => {
    playMcSfx('pop');
    if (heldCatalogItem) {
      await callAdmin({
        action: 'set_slot',
        slotType,
        slot: slotKey,
        item: heldCatalogItem.id,
        count: heldCatalogItem.count || creativeQty
      });
      setHeldCatalogItem(null);
      await inspectPlayer(selectedPlayer);
      return;
    }

    if (!selectedSlot) {
      if (currentItem?.id) {
        setSelectedSlot({ slotType, slot: slotKey, item: currentItem });
      }
      return;
    }

    if (selectedSlot.slotType === slotType && String(selectedSlot.slot) === String(slotKey)) {
      setSelectedSlot(null);
      return;
    }

    await callAdmin({
      action: 'move_slot',
      fromType: selectedSlot.slotType,
      fromSlot: selectedSlot.slot,
      toType: slotType,
      toSlot: slotKey,
      toItem: currentItem?.id || 'minecraft:air',
      toCount: currentItem?.count || 1
    });
    setSelectedSlot(null);
    await inspectPlayer(selectedPlayer);
  };

  const handleSlotRightClick = async (e, slotType, slotKey, currentItem) => {
    e.preventDefault();
    if (!currentItem?.id) return;
    playMcSfx('break');
    setSelectedSlot(null);
    await callAdmin({
      action: 'remove_slot',
      slotType,
      slot: slotKey,
      item: currentItem.id,
      count: currentItem.count
    });
    await inspectPlayer(selectedPlayer);
  };

  const handleTrashClick = async () => {
    playMcSfx('break');
    if (heldCatalogItem) {
      setHeldCatalogItem(null);
      return;
    }
    if (selectedSlot) {
      await callAdmin({
        action: 'remove_slot',
        slotType: selectedSlot.slotType,
        slot: selectedSlot.slot
      });
      setSelectedSlot(null);
      await inspectPlayer(selectedPlayer);
    }
  };

  // =====================================================
  // Interactive Easter Egg Infrastructure & Handlers
  // =====================================================
  const pushToast = ({ icon, title, desc, kind = 'goal', label = '¡Logro conseguido!' }) => {
    const id = ++fxId.current;
    setToasts((prev) => [...prev.slice(-2), { id, icon, title, desc, kind, label }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5200);
  };

  const spawnBurstAt = (x, y, { colors, count = 10, spread = 60 }) => {
    const list = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const force = spread * (0.4 + Math.random() * 0.8);
      return {
        id: ++fxId.current,
        x,
        y,
        dx: Math.cos(angle) * force,
        dy: Math.sin(angle) * force - spread * 0.35,
        color: colors[i % colors.length],
        size: 4 + Math.floor(Math.random() * 3) * 2
      };
    });
    setBursts((prev) => [...prev, ...list]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => !list.includes(b))), 950);
  };

  const startXpRain = () => {
    setXpRain(true);
    for (let i = 0; i < 9; i++) setTimeout(() => playMcSfx('xp'), i * 260);
    setTimeout(() => setXpRain(false), 3800);
  };

  const unlockEgg = (id) => {
    if (foundRef.current.includes(id)) return false;
    const egg = SECRET_EGGS.find((e) => e.id === id);
    if (!egg) return false;
    const next = [...foundRef.current, id];
    foundRef.current = next;
    setFoundEggs(next);
    try { localStorage.setItem('mc_eggs', JSON.stringify(next)); } catch {}
    playMcSfx('achievement');
    pushToast({
      icon: egg.icon,
      title: egg.name,
      desc: `Secreto ${next.length}/${SECRET_EGGS.length} descubierto`,
      kind: 'challenge',
      label: '¡Secreto descubierto!'
    });
    if (next.length === SECRET_EGGS.length) {
      setTimeout(() => {
        startXpRain();
        pushToast({
          icon: 'dragon_egg',
          title: 'Completista',
          desc: 'Encontraste todos los secretos. Eres leyenda.',
          kind: 'challenge',
          label: '¡Desafío completado!'
        });
      }, 1600);
    }
    return true;
  };

  // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
  useEffect(() => {
    const onKey = (e) => {
      if (/^(input|textarea|select)$/i.test(e.target?.tagName || '')) return;
      const k = String(e.key).toLowerCase();
      if (k === KONAMI[konamiPos.current]) {
        konamiPos.current += 1;
        if (konamiPos.current === KONAMI.length) {
          konamiPos.current = 0;
          startXpRain();
          if (!unlockEgg('konami')) {
            pushToast({ icon: 'experience_bottle', title: '+30 vidas', desc: 'El código sigue funcionando.', kind: 'task', label: 'Konami' });
          }
        }
      } else {
        konamiPos.current = k === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleServerIconClick = () => {
    const now = Date.now();
    iconClicks.current = [...iconClicks.current.filter((t) => now - t < 3000), now];
    if (iconClicks.current.length >= 5 && !herobrineFx) {
      iconClicks.current = [];
      playMcSfx('herobrine');
      setHerobrineFx({
        left: Math.random() < 0.5 ? 8 + Math.random() * 14 : 78 + Math.random() * 14,
        top: 25 + Math.random() * 40
      });
      setTimeout(() => {
        setHerobrineFx(null);
        unlockEgg('herobrine');
      }, 2800);
    } else {
      playMcSfx('pop');
    }
  };

  const handleMobClick = () => {
    const r = creeperRef.current?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const cy = r ? r.top + r.height / 2 : 80;

    if (dimension === 'overworld') {
      if (creeperState !== 'idle') return;
      playMcSfx('creeper');
      setCreeperState('primed');
      setTimeout(() => {
        spawnBurstAt(cx, cy, {
          colors: ['#3aa63a', '#184d18', '#8fe08f', '#ffb020', '#555555', '#ffffff'],
          count: 36,
          spread: 180
        });
        playMcSfx('explode');
        setCreeperState('exploded');
        setFlash(true);
        setTimeout(() => setFlash(false), 450);
        unlockEgg('creeper');
        setTimeout(() => setCreeperState('idle'), 4500);
      }, 1200);
    } else if (dimension === 'nether') {
      if (ghastState !== 'idle') return;
      playMcSfx('ghast');
      setGhastState('shooting');
      setTimeout(() => {
        playMcSfx('fireball');
        spawnBurstAt(cx, cy, {
          colors: ['#ff4500', '#ffa500', '#ffff00', '#ffffff', '#555555'],
          count: 40,
          spread: 200
        });
        setGhastState('fired');
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
        unlockEgg('ghast');
        setTimeout(() => setGhastState('idle'), 4500);
      }, 700);
    } else if (dimension === 'end') {
      if (endermanState !== 'idle') return;
      playMcSfx('enderman');
      setEndermanState('staring');
      setTimeout(() => {
        playMcSfx('teleport');
        spawnBurstAt(cx, cy, {
          colors: ['#cc22ff', '#e673ff', '#6a0dad', '#ba55d3', '#ffffff'],
          count: 38,
          spread: 190
        });
        setEndermanState('teleported');
        unlockEgg('enderman');
        setTimeout(() => setEndermanState('idle'), 4500);
      }, 600);
    }
  };

  const handleNoteBlockClick = () => {
    playMcSfx('note', { semi: noteSemi });
    const symbols = ['♪', '♫', '♬'];
    const id = ++fxId.current;
    const color = `hsl(${Math.round((noteSemi / 24) * 330)} 100% 62%)`;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const x = Math.round(Math.random() * 30 - 15);
    setNoteParticles((prev) => [...prev.slice(-4), { id, color, symbol, x }]);
    setTimeout(() => setNoteParticles((prev) => prev.filter((n) => n.id !== id)), 900);
    if (noteSemi >= 24) {
      setNoteSemi(0);
      unlockEgg('note');
    } else {
      setNoteSemi(noteSemi + 1);
    }
  };

  const handleCakeClick = (e) => {
    if (cakeGone) return;
    playMcSfx('eat');
    const r = e.currentTarget.getBoundingClientRect();
    spawnBurstAt(r.left + r.width / 2, r.top + r.height * 0.65, {
      colors: ['#f5e6c8', '#d6402e', '#ffffff', '#f0d9a8'],
      count: 7,
      spread: 38
    });
    const next = cakeBites + 1;
    setCakeBites(next);
    if (next >= 7) {
      setCakeGone(true);
      unlockEgg('cake');
      setTimeout(() => {
        setCakeGone(false);
        setCakeBites(0);
      }, 4200);
    }
  };

  const handleAnchorClick = (e) => {
    if (anchorBlown) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    if (anchorCharges < 4) {
      const next = anchorCharges + 1;
      setAnchorCharges(next);
      playMcSfx('charge', { charge: next });
      spawnBurstAt(cx, cy, {
        colors: ['#ffff55', '#ffaa00', '#fff8a0', '#ffcc00'],
        count: 12 + next * 4,
        spread: 45 + next * 8
      });
    } else {
      playMcSfx('explode');
      spawnBurstAt(cx, cy, {
        colors: ['#800080', '#ba55d3', '#ffa500', '#ffff55', '#220022', '#ffffff'],
        count: 48,
        spread: 220
      });
      setAnchorBlown(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      unlockEgg('anchor');
      setTimeout(() => {
        setAnchorBlown(false);
        setAnchorCharges(0);
      }, 5000);
    }
  };

  const handleDragonEggClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    playMcSfx('teleport');
    spawnBurstAt(cx, cy, {
      colors: ['#bf00ff', '#e066ff', '#8a2be2', '#220033', '#ffffff'],
      count: 22,
      spread: 75
    });

    const nextTaps = eggTaps + 1;
    setEggTaps(nextTaps);

    if (nextTaps >= 3) {
      playMcSfx('achievement');
      spawnBurstAt(cx, cy, {
        colors: ['#bf00ff', '#e066ff', '#ffd700', '#ffffff', '#ff69b4'],
        count: 44,
        spread: 180
      });
      unlockEgg('dragon_egg');
      setTimeout(() => {
        setEggTaps(0);
        setEggOffset({ x: 0, y: 0 });
      }, 4500);
    } else {
      const dir = nextTaps === 1 ? -1 : 1;
      const newX = dir * (28 + Math.random() * 45);
      const newY = (Math.random() - 0.5) * 20;
      setEggOffset({ x: newX, y: newY });
    }
  };

  const goDimension = (target) => {
    if (portalFx || target === dimension) return;
    playMcSfx('lever');
    setTimeout(() => {
      playMcSfx(target === 'end' ? 'ender' : 'portal');
      if (target === 'end') setTimeout(() => playMcSfx('portal'), 200);
      setPortalFx(target);
    }, 160);
    setTimeout(() => setDimension(target), 900);
    setTimeout(() => {
      setPortalFx(null);
      if (target === 'nether') unlockEgg('portal');
      if (target === 'end') unlockEgg('end');
    }, 1850);
  };

  const handleWallLeverClick = () => {
    setLeverPulled((prev) => !prev);
    const next = DIMENSION_ORDER[(DIMENSION_ORDER.indexOf(dimension) + 1) % DIMENSION_ORDER.length];
    goDimension(next);
  };

  const handleOreClick = (ore, e) => {
    const st = oreStates[ore.id];
    if (!st || st.broken) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nextHits = st.hits + 1;
    if (nextHits >= 5) {
      playMcSfx('break');
      setTimeout(() => playMcSfx('xp'), 140);
      spawnBurstAt(cx, cy, { colors: ore.debris, count: 18, spread: 95 });
      spawnBurstAt(cx, cy, { colors: ['#7dff2e', '#d4ff3b'], count: 6, spread: 65 });
      setMinedTotal((m) => m + 1);
      setOreStates((prev) => ({
        ...prev,
        [ore.id]: { hits: 5, broken: true, toast: ore.reward }
      }));
      const firstTime = !brokenOres.current.has(ore.id);
      brokenOres.current.add(ore.id);
      if (firstTime && ore.id === 'diamond_ore') {
        pushToast({ icon: 'diamond', title: '¡DIAMANTES!', desc: 'Adquiere diamantes con tu pico de hierro', kind: 'task' });
      }
      if (brokenOres.current.size === BURIED_ORES.length) unlockEgg('miner');
      setTimeout(() => {
        setOreStates((prev) => ({
          ...prev,
          [ore.id]: { hits: 0, broken: false, toast: '' }
        }));
      }, 6000);
    } else {
      playMcSfx('mine', { hit: nextHits });
      spawnBurstAt(cx, cy, { colors: ore.debris, count: 4, spread: 40 });
      setOreStates((prev) => ({
        ...prev,
        [ore.id]: { ...prev[ore.id], hits: nextHits }
      }));
    }
  };

  const cycleDollEasterEgg = () => {
    playMcSfx('pop');
    const next = dollEasterEgg === 'normal' ? 'dinnerbone' : dollEasterEgg === 'dinnerbone' ? 'jeb' : 'normal';
    setDollEasterEgg(next);
    if (next === 'dinnerbone') {
      pushToast({ icon: 'name_tag', title: 'Dinnerbone', desc: '¡El mundo ahora está al revés!', kind: 'task', label: 'Etiqueta aplicada' });
    } else if (next === 'jeb') {
      if (!unlockEgg('doll')) {
        pushToast({ icon: 'name_tag', title: 'jeb_', desc: 'Las ovejas están celosas.', kind: 'task', label: 'Etiqueta aplicada' });
      }
    }
  };

  const renderMcSlot = ({ slotType, slotKey, item, placeholderUrl, labelTag, isHotbarActive = false }) => {
    const isSelected = selectedSlot?.slotType === slotType && String(selectedSlot?.slot) === String(slotKey);
    const hasEnchants = item?.enchantments && Object.keys(item.enchantments).length > 0;

    return (
      <div
        key={`${slotType}-${slotKey}`}
        className={`mc-slot ${slotType === 'enderchest' ? 'ender-slot' : ''} ${isSelected ? 'selected' : ''} ${isHotbarActive ? 'active-hotbar' : ''}`}
        onClick={() => handleSlotClick(slotType, slotKey, item)}
        onContextMenu={(e) => handleSlotRightClick(e, slotType, slotKey, item)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const raw = e.dataTransfer.getData('text/plain');
          if (!raw) return;
          try {
            const payload = JSON.parse(raw);
            if (payload.fromCatalog) {
              playMcSfx('pop');
              await callAdmin({
                action: 'set_slot',
                slotType,
                slot: slotKey,
                item: payload.id,
                count: payload.count || creativeQty
              });
              await inspectPlayer(selectedPlayer);
            } else if (payload.fromSlot !== undefined) {
              playMcSfx('pop');
              await callAdmin({
                action: 'move_slot',
                fromType: payload.fromType,
                fromSlot: payload.fromSlot,
                toType: slotType,
                toSlot: slotKey,
                toItem: item?.id || 'minecraft:air',
                toCount: item?.count || 1
              });
              setSelectedSlot(null);
              await inspectPlayer(selectedPlayer);
            }
          } catch {}
        }}
        draggable={Boolean(item?.id)}
        onDragStart={(e) => {
          if (!item?.id) return;
          e.dataTransfer.setData('text/plain', JSON.stringify({
            fromType: slotType,
            fromSlot: slotKey,
            id: item.id,
            count: item.count
          }));
        }}
      >
        {hasEnchants && <div className="mc-slot-enchant-glint" />}
        {item?.id ? (
          <>
            <McItemIcon id={item.id} size={34} />
            {item.count > 1 && <span className="mc-slot-count">{item.count}</span>}
            <button
              type="button"
              className="mc-slot-delete-btn"
              title="Eliminar ítem de esta casilla"
              onClick={async (e) => {
                e.stopPropagation();
                await handleSlotRightClick(e, slotType, slotKey, item);
              }}
            >
              ×
            </button>
          </>
        ) : (
          placeholderUrl && (
            <img src={placeholderUrl} alt="" className="mc-slot-placeholder" draggable={false} />
          )
        )}

        {/* Authentic #100010 Minecraft Hover Tooltip */}
        <div className="mc-tooltip">
          {item?.id ? (
            <>
              <div className={`mc-tooltip-title ${hasEnchants ? 'enchanted' : ''}`}>
                {formatItemName(item.id)} {item.count > 1 ? `x${item.count}` : ''}
              </div>
              {item.customName && (
                <div className="mc-tooltip-custom">&quot;{String(item.customName)}&quot;</div>
              )}
              {hasEnchants && (
                <div className="mc-tooltip-enchants">
                  {Object.entries(item.enchantments).map(([k, lvl]) => (
                    <div key={k}>✨ {formatItemName(k)} {lvl}</div>
                  ))}
                </div>
              )}
              <div className="mc-tooltip-id">
                {item.id} ({labelTag || `#${slotKey}`})
              </div>
              <div className="mc-tooltip-hint">
                Clic izq: Seleccionar/Mover | Clic der o [×]: Eliminar
              </div>
            </>
          ) : (
            <>
              <div className="mc-tooltip-title" style={{ color: '#aaaaaa' }}>
                Casilla Vacía ({labelTag || `#${slotKey}`})
              </div>
              <div className="mc-tooltip-hint">
                {heldCatalogItem
                  ? `Clic para colocar ${heldCatalogItem.count}x ${heldCatalogItem.name} aquí`
                  : selectedSlot
                  ? `Clic para mover ${formatItemName(selectedSlot.item?.id)} a esta casilla`
                  : 'Selecciona un ítem del catálogo o mueve otro objeto aquí'}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const filteredCatalogItems = useMemo(() => {
    const q = creativeSearch.trim().toLowerCase();
    if (!q) return CREATIVE_CATALOG[creativeTab]?.items || [];
    const all = Object.values(CREATIVE_CATALOG).flatMap((cat) => cat.items);
    return all.filter((it) => it.name.toLowerCase().includes(q) || it.id.toLowerCase().includes(q));
  }, [creativeTab, creativeSearch]);

  const spectateOnMap = (pObj) => {
    playMcSfx('ender');
    const loc = pObj?.location || (inspectData?.pos ? {
      x: inspectData.pos[0],
      y: inspectData.pos[1],
      z: inspectData.pos[2],
      dimension: inspectData.dimension
    } : null);
    if (!loc) return;
    const worldName = String(loc.dimension || '').toLowerCase().includes('nether')
      ? 'world_the_nether'
      : String(loc.dimension || '').toLowerCase().includes('end')
      ? 'world_the_end'
      : 'world';
    setMapUrl(`${API_BASE}/map/#${worldName}:${loc.x}:${loc.y || 64}:${loc.z}:30:0:0:0:0:perspective`);
    document.getElementById('mc-live-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyIp = () => {
    playMcSfx('pop');
    navigator.clipboard.writeText(data?.address || 'stamina-feeder.tun.ply.gg');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBedrockIp = () => {
    playMcSfx('pop');
    navigator.clipboard.writeText('stamina-smartness.tun.ply.gg:14898');
    setCopiedBedrock(true);
    setTimeout(() => setCopiedBedrock(false), 2000);
  };

  const totals = data?.totals || { playHours: 0, blocksMined: 0, diamonds: 0, mobKills: 0, advancements: 0, deaths: 0 };
  const players = data?.players || [];

  // Unified map of advancement ID -> array of player names who unlocked it
  const advUnlockedMap = useMemo(() => {
    const map = {};
    const rawGlobal = data?.unlockedAdvancements || {};
    for (const [advId, list] of Object.entries(rawGlobal)) {
      if (Array.isArray(list) && list.length > 0) {
        map[advId] = [...new Set(list)];
      }
    }
    for (const m of data?.milestones || []) {
      if (m.completed && m.unlockedBy) {
        if (!map[m.id]) map[m.id] = [];
        if (!map[m.id].includes(m.unlockedBy)) map[m.id].push(m.unlockedBy);
      }
    }
    for (const h of data?.hackathonMilestones || []) {
      const by = Array.isArray(h.unlockedBy) ? h.unlockedBy : h.unlockedBy ? [h.unlockedBy] : [];
      if (by.length > 0) {
        map[h.id] = [...new Set([...(map[h.id] || []), ...by])];
      }
    }
    for (const p of data?.players || []) {
      for (const advId of p.unlockedAdvancements || []) {
        if (!map[advId]) map[advId] = [];
        if (!map[advId].includes(p.name)) map[advId].push(p.name);
      }
    }
    return map;
  }, [data]);

  const getNodeUnlockers = (tabObj, node) => {
    const filterMatch = (list) =>
      advPlayerFilter === 'ALL'
        ? list
        : list.filter((n) => n === advPlayerFilter || n.replace(/^\./, '') === advPlayerFilter.replace(/^\./, ''));

    const direct = filterMatch(advUnlockedMap[node.id] || []);
    if (direct.length > 0) return direct;

    // Root node is automatically unlocked if any child node in the tab is unlocked
    if (!node.parent && tabObj) {
      const tabUnlockers = new Set();
      for (const child of tabObj.nodes) {
        if (child.id === node.id) continue;
        for (const u of filterMatch(advUnlockedMap[child.id] || [])) {
          tabUnlockers.add(u);
        }
      }
      return [...tabUnlockers];
    }
    return [];
  };

  const activeAdvTabObj = useMemo(
    () => ADVANCEMENT_TABS.find((t) => t.key === advTab) || ADVANCEMENT_TABS[0],
    [advTab]
  );

  const healthVal = Number(inspectData?.health ?? 20);
  const foodVal = Number(inspectData?.food ?? 20);
  const xpLevelVal = Number(inspectData?.xpLevel ?? 0);
  const xpPctVal = Math.min(100, Math.max(8, Math.round((inspectData?.xpP || 0.35) * 100)));

  return (
    <div className={`mc-page dim-${dimension} ${netherMode ? 'nether-mode' : ''}`}>
      {/* Capa de efectos de easter eggs (partículas, portal, Herobrine, lluvia de XP) */}
      <div className="mc-fx-layer" aria-hidden="true">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="mc-burst-particle"
            style={{ left: b.x, top: b.y, width: b.size, height: b.size, background: b.color, '--dx': `${b.dx}px`, '--dy': `${b.dy}px` }}
          />
        ))}
        {flash && <div className="mc-flash" />}
        {portalFx && (
          <div className={`mc-portal-fx ${portalFx}`}>
            <span>{DIMENSIONS[portalFx].portalText}</span>
          </div>
        )}
        {herobrineFx && (
          <div className="mc-herobrine-fx">
            <i style={{ left: `${herobrineFx.left}%`, top: `${herobrineFx.top}%` }} />
          </div>
        )}
        {xpRain &&
          Array.from({ length: 32 }, (_, i) => (
            <span
              key={i}
              className="mc-xp-orb"
              style={{ left: `${(i * 37 + 11) % 97}%`, animationDelay: `${(i % 8) * 0.14}s`, animationDuration: `${1.6 + (i % 5) * 0.25}s` }}
            />
          ))}
      </div>

      {/* Toasts estilo Advancements de Minecraft */}
      <div className="mc-toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`mc-adv-toast ${t.kind}`}>
            <div className="mc-adv-icon">
              <McItemIcon id={t.icon} size={28} />
            </div>
            <div className="mc-adv-text">
              <div className="mc-adv-label">{t.label}</div>
              <div className="mc-adv-title">{t.title}</div>
              <div className="mc-adv-desc">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ambient Floating Voxel Fireflies / XP Orbs & Falling Leaves */}
      <div className="mc-ambient-layer" aria-hidden="true">
        {Array.from({ length: 14 }, (_, idx) => (
          <span
            key={idx}
            className={`mc-firefly ${idx % 3 === 0 ? 'leaf' : ''}`}
            style={{
              left: `${(idx * 7.3 + 4) % 96}%`,
              top: `${(idx * 13.7 + 12) % 88}%`,
              animationDelay: `${(idx * 0.65).toFixed(2)}s`,
              animationDuration: `${5.5 + (idx % 4) * 1.4}s`
            }}
          />
        ))}
      </div>

      <div className="container">
        {/* =====================================================
            MULTIPLAYER SERVER LIST HEADER (OVERWORLD LUSH BANNER)
           ===================================================== */}
        <header className={`mc-server-banner ${creeperState === 'exploded' ? 'creeper-boom' : ''}`}>
          {/* Peeking Dimension Mob Easter Egg */}
          <div
            ref={creeperRef}
            role="button"
            tabIndex={0}
            aria-label="Entidad misteriosa"
            className={`mc-peeking-mob mob-${dimension} ${
              dimension === 'overworld' && creeperState === 'primed' ? 'primed' : ''
            } ${dimension === 'nether' && ghastState === 'shooting' ? 'shooting' : ''} ${
              dimension === 'end' && endermanState === 'staring' ? 'staring' : ''
            }`}
            onClick={handleMobClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMobClick();
              }
            }}
          >
            {dimension === 'overworld' && (
              creeperState === 'exploded' ? (
                <div className="mc-mob-drop">
                  <McItemIcon id="gunpowder" size={26} />
                </div>
              ) : (
                CREEPER_FACE_PIXELS.map((px, i) => (
                  <span
                    key={i}
                    style={{ background: px ? '#111111' : 'transparent', width: '100%', height: '100%' }}
                  />
                ))
              )
            )}
            {dimension === 'nether' && (
              ghastState === 'fired' ? (
                <div className="mc-mob-drop">
                  <McItemIcon id="ghast_tear" size={26} />
                </div>
              ) : (
                GHAST_FACE_PIXELS.map((px, i) => {
                  let bg = 'transparent';
                  if (px === 1) bg = ghastState === 'shooting' ? '#ff2020' : '#2b2b2b';
                  if (px === 2) bg = ghastState === 'shooting' ? '#ff6600' : '#888888';
                  return <span key={i} style={{ background: bg, width: '100%', height: '100%' }} />;
                })
              )
            )}
            {dimension === 'end' && (
              endermanState === 'teleported' ? (
                <div className="mc-mob-drop">
                  <McItemIcon id="ender_eye" size={26} />
                </div>
              ) : (
                ENDERMAN_FACE_PIXELS.map((px, i) => {
                  let bg = 'transparent';
                  if (px === 1) bg = endermanState === 'staring' ? '#ff40ff' : '#c52be6';
                  if (px === 2) bg = endermanState === 'staring' ? '#ffffff' : '#f68bff';
                  return <span key={i} style={{ background: bg, width: '100%', height: '100%' }} />;
                })
              )
            )}
          </div>

          <div className="mc-server-entry">
            <div className="mc-server-entry-left">
              <div className="mc-server-icon-box" onClick={handleServerIconClick}>
                <img
                  src={`${ASSET_BASE}/block/grass_block_side.png`}
                  alt=""
                  className="mc-server-icon-img"
                />
              </div>
              <div className="mc-server-motd-wrap">
                <div className="mc-server-title-row">
                  <h1 className="mc-server-name">Minecraft Homelab</h1>
                  <span className={`mc-status-tag ${data?.online !== false ? '' : 'offline'}`}>
                    {data?.online !== false ? '● EN LÍNEA' : '○ OFFLINE'}
                  </span>
                  <span
                    className="mc-splash-text"
                    onClick={() => {
                      playMcSfx('pop');
                      setSplashIdx((i) => (i + 1 + Math.floor(Math.random() * (SPLASH_PHRASES.length - 1))) % SPLASH_PHRASES.length);
                    }}
                    title="Cambiar frase"
                  >
                    {SPLASH_PHRASES[splashIdx]}
                  </span>
                </div>
                <p className="mc-motd-line1">
                  ✔ Survival entre amigos (Java y Bedrock)
                  <span className="mc-motd-aqua">🔊 Chat de voz por proximidad</span>
                </p>
                <p className="mc-motd-line2">
                  {creeperState === 'exploded'
                    ? '💥 ¡Pum! Soltó +1 de pólvora'
                    : '🌿 Sin perder cosas al morir (Tumbas) • /tpa • Mapa en vivo'}
                </p>
              </div>
            </div>

            <div className="mc-server-entry-right">
              <div className="mc-server-ping-row" title="Ping">
                <span>{data ? `${data.onlineCount}/${data.maxPlayers}` : '0/10'}</span>
                <img
                  src={`${ASSET_BASE}/gui/sprites/server_list/ping_5.png`}
                  alt=""
                  className="mc-ping-sprite"
                />
              </div>
              <span style={{ color: '#80ff20', fontSize: '1.08rem' }}>
                Java 26.2 / Bedrock 1.21+
              </span>
            </div>
          </div>

          <div className="mc-actions">
            <button type="button" onClick={copyIp} className="mc-ip-btn">
              <span className="mc-ip-label">Java IP:</span>
              <code>{data?.address || 'stamina-feeder.tun.ply.gg'}</code>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="mc-ip-hint">{copied ? '¡Copiada!' : 'Copiar'}</span>
            </button>

            <button type="button" onClick={copyBedrockIp} className="mc-ip-btn">
              <span className="mc-ip-label">Bedrock:</span>
              <code>stamina-smartness.tun.ply.gg : 14898</code>
              {copiedBedrock ? <Check size={16} /> : <Copy size={16} />}
              <span className="mc-ip-hint">{copiedBedrock ? '¡Copiada!' : 'Puerto 14898'}</span>
            </button>

            <a href={`${API_BASE}/api/minecraft/modpack/mrpack`} className="mc-dl-btn primary">
              <Download size={16} />
              <span>Modpack (.mrpack)</span>
            </a>

            <a href={`${API_BASE}/api/minecraft/modpack/zip`} className="mc-dl-btn">
              <Download size={16} />
              <span>Mods (.zip TLauncher)</span>
            </a>

            {playerUser ? (
              <div className="mc-user-actions">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      playMcSfx('pop');
                      const el = document.getElementById('mc-god-mode');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mc-dl-btn god-btn"
                  >
                    <Crown size={16} />
                    <span>👑 Modo Dios Activo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playMcSfx('pop');
                    setSettingsModalOpen(true);
                  }}
                  className="mc-dl-btn"
                  style={{ borderColor: '#55ff55', color: '#55ff55' }}
                >
                  <img
                    src={`https://mc-heads.net/avatar/${encodeURIComponent(playerUser.username.replace(/^\./, ''))}/20`}
                    alt=""
                    style={{ width: 18, height: 18, imageRendering: 'pixelated', verticalAlign: 'middle', marginRight: 4 }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `${ASSET_BASE}/item/player_head.png`;
                    }}
                  />
                  <span>👤 Mi Perfil ({playerUser.username})</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playMcSfx('pop');
                  setLoginModalOpen(true);
                }}
                className="mc-dl-btn"
              >
                <User size={16} />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </header>

        {/* =====================================================
            1:1 GOD MODE / SURVIVAL INVENTORY + CREATIVE SPAWNER
           ===================================================== */}
        {isAdmin && (
          <section className="mc-dark-panel" id="mc-god-mode">
            <div className="mc-section-header">
              <div>
                <h2 className="mc-section-title">
                  <McItemIcon id="command_block" size={26} />
                  <span>MODO DIOS — PANEL DE ADMINISTRADOR ({playerUser?.username})</span>
                </h2>
                <p className="mc-section-desc">
                  Edita el inventario de cualquiera, invoca jefes épicos, lanza eventos mundiales o haz bromas.
                </p>
              </div>
              {adminLog && <div className="mc-god-toast">{adminLog}</div>}
            </div>

            <div>
              {/* Top Operator Toolbar */}
                <div className="mc-god-toolbar">
                  <div className="mc-god-field">
                    <label>🎯 Jugador:</label>
                    <select
                      value={selectedPlayer}
                      onChange={(e) => {
                        setSelectedPlayer(e.target.value);
                        setSelectedSlot(null);
                        inspectPlayer(e.target.value);
                      }}
                      className="mc-god-select"
                    >
                      {players.map((p) => (
                        <option key={p.uuid} value={p.name}>
                          {p.online ? '🟢' : '⚪'} {p.name.replace(/^\./, '')} ({p.location ? `${p.location.dimension}: ${p.location.x}, ${p.location.z}` : 'Offline'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => inspectPlayer(selectedPlayer)}
                    className="mc-btn"
                  >
                    <RefreshCw size={15} className={inspectLoading ? 'spin' : ''} />
                    <span>Actualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playMcSfx('pop');
                      setShowEnderChest(!showEnderChest);
                    }}
                    className="mc-btn"
                  >
                    <McItemIcon id="ender_chest" size={18} />
                    <span>{showEnderChest ? 'Cerrar Cofre de Ender' : 'Cofre de Ender'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => spectateOnMap(currentPlayerObj)}
                    className="mc-btn aqua"
                  >
                    <McItemIcon id="spyglass" size={18} />
                    <span>Ver en el Mapa</span>
                  </button>

                  <div className="mc-god-field">
                    <input
                      type="text"
                      value={adminMe}
                      onChange={(e) => setAdminMe(e.target.value)}
                      placeholder="Tu nick (AntonioJara)"
                      className="mc-god-input small"
                    />
                    <button
                      type="button"
                      onClick={() => callAdmin({ action: 'god_action', godType: 'spectate_ingame', adminPlayer: adminMe })}
                      className="mc-btn aqua"
                    >
                      👻 Espectar en el juego
                    </button>
                    <button
                      type="button"
                      onClick={() => callAdmin({ action: 'god_action', godType: 'survival_ingame', adminPlayer: adminMe })}
                      className="mc-btn"
                    >
                      Volver a Survival
                    </button>
                  </div>
                </div>

                {/* Quick Vitals Actions */}
                <div className="mc-god-field" style={{ marginBottom: '1.1rem' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      playMcSfx('xp');
                      await callAdmin({ action: 'god_action', godType: 'heal' });
                      inspectPlayer(selectedPlayer);
                    }}
                    className="mc-btn emerald"
                  >
                    <McItemIcon id="golden_apple" size={18} />
                    <span>Curar y Alimentar</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      playMcSfx('xp');
                      await callAdmin({ action: 'god_action', godType: 'xp' });
                      inspectPlayer(selectedPlayer);
                    }}
                    className="mc-btn"
                  >
                    <McItemIcon id="experience_bottle" size={18} />
                    <span>+30 Niveles XP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => callAdmin({ action: 'god_action', godType: 'clear_effects' })}
                    className="mc-btn"
                  >
                    <McItemIcon id="milk_bucket" size={18} />
                    <span>Limpiar Efectos</span>
                  </button>
                  <button
                    type="button"
                    onClick={cycleDollEasterEgg}
                    className="mc-btn gold"
                    title="Easter Egg: Girar modelo 3D como Dinnerbone o arcoíris jeb_"
                  >
                    <McItemIcon id="name_tag" size={18} />
                    <span>
                      Tag: {dollEasterEgg === 'normal' ? 'Normal' : dollEasterEgg === 'dinnerbone' ? '🙃 Dinnerbone' : '🌈 jeb_'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => callAdmin({ action: 'god_action', godType: 'kill' })}
                    className="mc-btn red"
                  >
                    <McItemIcon id="netherite_sword" size={18} />
                    <span>Matar Jugador</span>
                  </button>
                </div>

                {/* =================================================
                    MAIN 2-COLUMN WORKSPACE:
                    LEFT: 1:1 SURVIVAL INVENTORY GUI + HUD + ENDERCHEST
                    RIGHT: 1:1 CREATIVE CATALOG & ITEM SPAWNER
                   ================================================= */}
                <div className="mc-god-workspace">
                  {/* LEFT PANEL: Authentic #c6c6c6 Survival Inventory */}
                  <div className="mc-survival-wrap">
                    <div className="mc-inv-scroll-hint" aria-hidden="true">
                      <span>↔ Desliza para explorar el inventario</span>
                    </div>
                    <div className="mc-gui-window">
                      {/* Top Area: 4 Armor Slots | Black 3D Player Doll | Offhand | 2x2 Crafting + Trash */}
                      <div className="mc-inv-top-area">
                        {/* 4 Armor Slots */}
                        <div className="mc-armor-col">
                          {['head', 'chest', 'legs', 'feet'].map((eqKey) =>
                            renderMcSlot({
                              slotType: 'equipment',
                              slotKey: eqKey,
                              item: inspectData?.equipment?.[eqKey] || null,
                              placeholderUrl: ARMOR_EMPTY_SPRITES[eqKey],
                              labelTag: `armor.${eqKey}`
                            })
                          )}
                        </div>

                        {/* Black 3D Player Doll Box (Click to toggle Dinnerbone / jeb_ Easter Egg!) */}
                        <div
                          className="mc-doll-box"
                          onClick={cycleDollEasterEgg}
                          title="Haz clic en el personaje para activar el Easter Egg Dinnerbone / jeb_"
                        >
                          <span className="mc-doll-nametag">
                            {dollEasterEgg === 'dinnerbone'
                              ? 'Dinnerbone'
                              : dollEasterEgg === 'jeb'
                              ? 'jeb_'
                              : (selectedPlayer || 'Steve').replace(/^\./, '')}
                          </span>
                          <img
                            src={`https://mc-heads.net/body/${encodeURIComponent((selectedPlayer || 'MHF_Steve').replace(/^\./, ''))}/128`}
                            alt=""
                            className={`mc-doll-img ${dollEasterEgg === 'dinnerbone' ? 'dinnerbone' : ''} ${dollEasterEgg === 'jeb' ? 'jeb-rainbow' : ''}`}
                            draggable={false}
                          />
                          <span className="mc-doll-coords">
                            {inspectData?.pos ? `${inspectData.pos[0]}, ${inspectData.pos[1]}, ${inspectData.pos[2]}` : '0, 64, 0'}
                          </span>
                        </div>

                        {/* Offhand Slot */}
                        <div className="mc-offhand-col">
                          {renderMcSlot({
                            slotType: 'equipment',
                            slotKey: 'offhand',
                            item: inspectData?.equipment?.offhand || null,
                            placeholderUrl: ARMOR_EMPTY_SPRITES.offhand,
                            labelTag: 'weapon.offhand'
                          })}
                        </div>

                        {/* 2x2 Crafting Area + Arrow + Lava Trash Slot */}
                        <div className="mc-craft-box">
                          <div>
                            <p className="mc-gui-title">Fabricación</p>
                            <div className="mc-craft-row">
                              <div className="mc-craft-2x2">
                                {[0, 1, 2, 3].map((i) => (
                                  <div key={i} className="mc-slot" title="Ranura decorativa de fabricación 2x2" />
                                ))}
                              </div>
                              <span className="mc-craft-arrow">➔</span>
                              <div
                                className="mc-slot trash-slot"
                                onClick={handleTrashClick}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={async (e) => {
                                  e.preventDefault();
                                  const raw = e.dataTransfer.getData('text/plain');
                                  if (!raw) return;
                                  try {
                                    const payload = JSON.parse(raw);
                                    if (payload.fromSlot !== undefined) {
                                      playMcSfx('break');
                                      await callAdmin({
                                        action: 'remove_slot',
                                        slotType: payload.fromType,
                                        slot: payload.fromSlot
                                      });
                                      setSelectedSlot(null);
                                      await inspectPlayer(selectedPlayer);
                                    }
                                  } catch {}
                                }}
                              >
                                <McItemIcon id="lava_bucket" size={30} />
                                <div className="mc-tooltip">
                                  <div className="mc-tooltip-title" style={{ color: '#ff5555' }}>
                                    🗑️ Eliminar Ítem (Basurero)
                                  </div>
                                  <div className="mc-tooltip-hint">
                                    Arrastra un objeto aquí o selecciónalo y haz clic para destruirlo
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              playMcSfx('break');
                              await callAdmin({ action: 'remove_slot', slotType: 'clear_all' });
                              setSelectedSlot(null);
                              inspectPlayer(selectedPlayer);
                            }}
                            className="mc-btn red"
                            style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '1.05rem' }}
                          >
                            🗑️ Vaciar Todo
                          </button>
                        </div>
                      </div>

                      {/* Middle Section: Main 3x9 Survival Inventory (Slots 9..35) */}
                      <p className="mc-gui-title">Inventario</p>
                      <div className="mc-inv-grid-9">
                        {Array.from({ length: 27 }, (_, idx) => idx + 9).map((slotNum) =>
                          renderMcSlot({
                            slotType: 'inventory',
                            slotKey: slotNum,
                            item: invMap[slotNum] || null,
                            labelTag: `container.${slotNum}`
                          })
                        )}
                      </div>

                      {/* 8px Gap + Bottom 1x9 Hotbar (Slots 0..8) */}
                      <div className="mc-hotbar-sep" />
                      <div className="mc-inv-grid-9">
                        {Array.from({ length: 9 }, (_, slotNum) =>
                          renderMcSlot({
                            slotType: 'inventory',
                            slotKey: slotNum,
                            item: invMap[slotNum] || null,
                            labelTag: `hotbar.${slotNum}`,
                            isHotbarActive: Number(inspectData?.selectedItemSlot ?? 0) === slotNum
                          })
                        )}
                      </div>

                      {/* Toggleable 3x9 EnderChest Window (Slots 0..26) */}
                      {showEnderChest && (
                        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '3px solid #888' }}>
                          <p className="mc-gui-title" style={{ color: '#1b4d3e' }}>
                            👁️ Cofre de Ender de {(selectedPlayer || '').replace(/^\./, '')} (27 Casillas)
                          </p>
                          <div className="mc-inv-grid-9">
                            {Array.from({ length: 27 }, (_, slotNum) =>
                              renderMcSlot({
                                slotType: 'enderchest',
                                slotKey: slotNum,
                                item: enderMap[slotNum] || null,
                                labelTag: `enderchest.${slotNum}`
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Authentic Minecraft HUD Bar: 10 Hearts, 10 Food Drumsticks & Green Segmented XP Bar */}
                    <div className="mc-hud-bars">
                      <div className="mc-hud-row">
                        {/* 10 Hearts */}
                        <div className="mc-hearts-row" title={`Salud: ${healthVal} / 20`}>
                          {Array.from({ length: 10 }, (_, i) => {
                            const heartThreshold = (i + 1) * 2;
                            const isFull = healthVal >= heartThreshold;
                            const isHalf = !isFull && healthVal >= heartThreshold - 1;
                            return (
                              <div key={i} className="mc-hud-sprite-wrap">
                                <img
                                  src={`${ASSET_BASE}/gui/sprites/hud/heart/container.png`}
                                  alt=""
                                  className="mc-hud-sprite-bg"
                                />
                                {(isFull || isHalf) && (
                                  <img
                                    src={`${ASSET_BASE}/gui/sprites/hud/heart/${isFull ? 'full' : 'half'}.png`}
                                    alt=""
                                    className="mc-hud-sprite-fg"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* 10 Food Drumsticks */}
                        <div className="mc-food-row" title={`Hambre: ${foodVal} / 20`}>
                          {Array.from({ length: 10 }, (_, i) => {
                            const foodThreshold = (i + 1) * 2;
                            const isFull = foodVal >= foodThreshold;
                            const isHalf = !isFull && foodVal >= foodThreshold - 1;
                            return (
                              <div key={i} className="mc-hud-sprite-wrap">
                                <img
                                  src={`${ASSET_BASE}/gui/sprites/hud/food_empty.png`}
                                  alt=""
                                  className="mc-hud-sprite-bg"
                                />
                                {(isFull || isHalf) && (
                                  <img
                                    src={`${ASSET_BASE}/gui/sprites/hud/food_${isFull ? 'full' : 'half'}.png`}
                                    alt=""
                                    className="mc-hud-sprite-fg"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Green Segmented XP Bar */}
                      <div className="mc-xp-wrap" title={`Nivel de Experiencia: ${xpLevelVal}`}>
                        <span className="mc-xp-level">{xpLevelVal}</span>
                        <div className="mc-xp-bar-bg">
                          <div className="mc-xp-bar-fill" style={{ width: `${xpPctVal}%` }} />
                          <div className="mc-xp-bar-segments" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT PANEL: 1:1 Creative Inventory Catalog & Spawner */}
                  <div>
                    {/* Folder Tabs */}
                    <div className="mc-creative-tabs">
                      {Object.entries(CREATIVE_CATALOG).map(([tabKey, tabObj]) => (
                        <button
                          key={tabKey}
                          type="button"
                          onClick={() => {
                            playMcSfx('pop');
                            setCreativeTab(tabKey);
                            setCreativeSearch('');
                          }}
                          className={`mc-creative-tab ${creativeTab === tabKey && !creativeSearch ? 'active' : ''}`}
                        >
                          {tabObj.label}
                        </button>
                      ))}
                    </div>

                    <div className="mc-gui-window">
                      <div className="mc-creative-header-row">
                        <span className="mc-gui-title" style={{ margin: 0 }}>
                          {creativeSearch ? '🔎 Resultados de Búsqueda' : CREATIVE_CATALOG[creativeTab]?.label}
                        </span>

                        <input
                          type="text"
                          value={creativeSearch}
                          onChange={(e) => setCreativeSearch(e.target.value)}
                          placeholder="Buscar ítem (ej. diamond, tnt)..."
                          className="mc-search-input"
                        />

                        <div className="mc-qty-pills">
                          {[1, 16, 32, 64].map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => {
                                playMcSfx('pop');
                                setCreativeQty(q);
                              }}
                              className={`mc-qty-btn ${creativeQty === q ? 'active' : ''}`}
                            >
                              x{q}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            playMcSfx('pop');
                            setPlaceMode(!placeMode);
                            setHeldCatalogItem(null);
                          }}
                          className={`mc-qty-btn ${placeMode ? 'active' : ''}`}
                          title="Alternar entre entregar directo al inventario o tomar en mano para elegir casilla exacta"
                        >
                          {placeMode ? '🖐️ Modo: Elegir Casilla' : '⚡ Modo: Dar Directo'}
                        </button>
                      </div>

                      {/* Creative Item Slots Grid */}
                      <div className="mc-creative-grid">
                        {filteredCatalogItems.map((catItem) => {
                          const isHeld = heldCatalogItem?.id === catItem.id;
                          return (
                            <div
                              key={catItem.id}
                              className={`mc-slot ${isHeld ? 'selected' : ''}`}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', JSON.stringify({
                                  fromCatalog: true,
                                  id: catItem.id,
                                  name: catItem.name,
                                  count: creativeQty
                                }));
                              }}
                              onClick={async () => {
                                playMcSfx('pop');
                                if (placeMode) {
                                  setHeldCatalogItem({
                                    id: catItem.id,
                                    name: catItem.name,
                                    count: creativeQty
                                  });
                                } else {
                                  await callAdmin({
                                    action: 'give',
                                    item: catItem.id,
                                    count: creativeQty
                                  });
                                  await inspectPlayer(selectedPlayer);
                                }
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                playMcSfx('pop');
                                setHeldCatalogItem({
                                  id: catItem.id,
                                  name: catItem.name,
                                  count: creativeQty
                                });
                              }}
                            >
                              <McItemIcon id={catItem.id} size={34} />
                              {creativeQty > 1 && <span className="mc-slot-count">{creativeQty}</span>}
                              <div className="mc-tooltip">
                                <div className="mc-tooltip-title">{catItem.name}</div>
                                <div className="mc-tooltip-id">{catItem.id}</div>
                                <div className="mc-tooltip-hint">
                                  Clic izq: {placeMode ? 'Tomar en mano' : `Dar x${creativeQty} a ${(selectedPlayer || '').replace(/^\./, '')}`} | Clic der o arrastrar: Colocar en casilla exacta
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Active Hand Cursor Banner */}
                      {(heldCatalogItem || selectedSlot) && (
                        <div className="mc-hand-banner">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <McItemIcon
                              id={heldCatalogItem ? heldCatalogItem.id : selectedSlot?.item?.id}
                              size={26}
                            />
                            <span>
                              {heldCatalogItem
                                ? `En mano: ${heldCatalogItem.count}x ${heldCatalogItem.name} — Haz clic en cualquier casilla del inventario para colocarlo.`
                                : `Seleccionado: ${formatItemName(selectedSlot?.item?.id)} (${selectedSlot?.slotType} #${selectedSlot?.slot}) — Haz clic en otra casilla para mover/intercambiar.`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setHeldCatalogItem(null);
                              setSelectedSlot(null);
                            }}
                            className="mc-btn red"
                            style={{ padding: '0.2rem 0.6rem', fontSize: '1rem' }}
                          >
                            Soltar [Esc]
                          </button>
                        </div>
                      )}

                      {/* Custom ID Give Row */}
                      <div className="mc-god-field" style={{ marginTop: '10px' }}>
                        <span style={{ fontWeight: 700 }}>ID Técnico:</span>
                        <input
                          type="text"
                          value={customItem}
                          onChange={(e) => setCustomItem(e.target.value)}
                          placeholder="minecraft:diamond_sword"
                          className="mc-search-input"
                          style={{ flex: 1 }}
                        />
                        <input
                          type="number"
                          min="1"
                          max="640"
                          value={customCount}
                          onChange={(e) => setCustomCount(e.target.value)}
                          className="mc-search-input"
                          style={{ width: '76px' }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            playMcSfx('xp');
                            await callAdmin({ action: 'give', item: customItem, count: customCount });
                            inspectPlayer(selectedPlayer);
                          }}
                          className="mc-btn emerald"
                        >
                          Dar Ítem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ELABORATE MULTI-STAGE PRANKS & GOD CONTROLS DECK
                   ================================================= */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '3px solid #2e6b34' }}>
                  <div className="mc-section-header" style={{ marginBottom: '0.85rem' }}>
                    <h3 className="mc-section-title" style={{ fontSize: '0.95rem' }}>
                      <McItemIcon id="tnt" size={24} />
                      <span>BROMAS Y CONTROL DEL MUNDO</span>
                    </h3>
                  </div>

                  {/* 4 Prank Category Tabs */}
                  <div className="mc-prank-tabs">
                    {Object.entries(PRANK_CATEGORIES).map(([catKey, catObj]) => (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => {
                          playMcSfx('pop');
                          setPrankTab(catKey);
                        }}
                        className={`mc-btn ${prankTab === catKey ? 'gold' : ''} ${catKey === 'lethal' ? 'red' : ''}`}
                      >
                        {catObj.label}
                      </button>
                    ))}
                  </div>

                  {prankTab === 'events' && (
                    <div style={{ marginBottom: '0.9rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          playMcSfx('totem');
                          callAdmin({ action: 'event', eventType: 'clear_events' });
                        }}
                        className="mc-btn emerald"
                        style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}
                      >
                        <McItemIcon id="milk_bucket" size={20} />
                        <span>🕊️ Limpiar Todos los Eventos</span>
                      </button>
                    </div>
                  )}

                  {/* Active Category Prank, Boss or Event Cards */}
                  <div className="mc-prank-grid">
                    {(PRANK_CATEGORIES[prankTab]?.items || []).map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => {
                          playMcSfx(pr.clear ? 'totem' : pr.type === 'boss' ? 'ender' : pr.type === 'event' ? 'xp' : 'creeper');
                          if (pr.type === 'boss') {
                            callAdmin({ action: 'boss', bossType: pr.id });
                          } else if (pr.type === 'event') {
                            callAdmin({ action: 'event', eventType: pr.id });
                          } else {
                            callAdmin({ action: 'prank', prankType: pr.id });
                          }
                        }}
                        className={`mc-prank-card ${pr.danger ? 'danger' : ''} ${pr.clear ? 'clear-event' : ''}`}
                      >
                        <McItemIcon id={pr.icon} size={32} />
                        <div>
                          <span className="mc-prank-title">{pr.label}</span>
                          <span className="mc-prank-desc">{pr.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Giant Title, Teleport, Time/Weather & Raw RCON Console */}
                  <div className="mc-god-toolbar" style={{ marginTop: '1.15rem', borderBottom: 'none', paddingBottom: 0 }}>
                    <div className="mc-god-field">
                      <span>📢 Mensaje en pantalla:</span>
                      <input
                        type="text"
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)}
                        placeholder="Texto grande..."
                        className="mc-god-input"
                      />
                      <input
                        type="text"
                        value={subText}
                        onChange={(e) => setSubText(e.target.value)}
                        placeholder="Subtítulo..."
                        className="mc-god-input"
                      />
                      <button
                        type="button"
                        onClick={() => callAdmin({ action: 'god_action', godType: 'title_msg', titleText, subText })}
                        className="mc-btn gold"
                      >
                        Mandar
                      </button>
                    </div>

                    <div className="mc-god-field">
                      <select
                        value={tpTarget}
                        onChange={(e) => setTpTarget(e.target.value)}
                        className="mc-god-select"
                      >
                        <option value="">-- Elegir destino TP --</option>
                        {players.map((p) => (
                          <option key={p.uuid} value={p.name}>{p.name.replace(/^\./, '')}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => tpTarget && callAdmin({ action: 'god_action', godType: 'tp_to', targetPlayer: tpTarget })}
                        className="mc-btn aqua"
                      >
                        🚀 TP {(selectedPlayer || '').replace(/^\./, '')} → {tpTarget ? tpTarget.replace(/^\./, '') : '...'}
                      </button>
                      <button type="button" onClick={() => callAdmin({ action: 'god_action', godType: 'time_day' })} className="mc-btn">☀️ Día</button>
                      <button type="button" onClick={() => callAdmin({ action: 'god_action', godType: 'time_night' })} className="mc-btn">🌙 Noche</button>
                      <button type="button" onClick={() => callAdmin({ action: 'god_action', godType: 'weather_clear' })} className="mc-btn">🌤️ Despejar</button>
                      <button type="button" onClick={() => callAdmin({ action: 'god_action', godType: 'weather_thunder' })} className="mc-btn">⛈️ Tormenta</button>
                    </div>

                    <div className="mc-god-field" style={{ width: '100%' }}>
                      <Terminal size={18} />
                      <input
                        type="text"
                        value={rawCmd}
                        onChange={(e) => setRawCmd(e.target.value)}
                        placeholder="Comando directo (ej. gamemode creative AntonioJara)"
                        className="mc-god-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => rawCmd && callAdmin({ action: 'god_action', godType: 'rcon', rawCmd })}
                        className="mc-btn emerald"
                      >
                        Ejecutar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </section>
        )}

        {/* =====================================================
            GLOBAL WORLD STATS BAR (PIXEL ART ICONS)
           ===================================================== */}
        <section className="mc-stats-grid">
          <div className="mc-stat-card">
            <McItemIcon id="clock" size={38} />
            <div>
              <p className="mc-stat-value">{totals.playHours} h</p>
              <p className="mc-stat-label">Horas jugadas</p>
            </div>
          </div>
          <div className="mc-stat-card">
            <McItemIcon id="diamond_pickaxe" size={38} />
            <div>
              <p className="mc-stat-value">{(totals.blocksMined + minedTotal).toLocaleString()}</p>
              <p className="mc-stat-label">Bloques picados</p>
            </div>
          </div>
          <div className="mc-stat-card">
            <McItemIcon id="diamond" size={38} />
            <div>
              <p className="mc-stat-value">{totals.diamonds + minedTotal}</p>
              <p className="mc-stat-label">Diamantes</p>
            </div>
          </div>
          <div className="mc-stat-card">
            <McItemIcon id="nether_star" size={38} />
            <div>
              <p className="mc-stat-value">{totals.advancements}</p>
              <p className="mc-stat-label">Logros</p>
            </div>
          </div>
          <div className="mc-stat-card">
            <McItemIcon id="totem_of_undying" size={38} />
            <div>
              <p className="mc-stat-value">{totals.deaths}</p>
              <p className="mc-stat-label">Muertes</p>
            </div>
          </div>
        </section>

        {/* =====================================================
            LIVE 3D BLUEMAP VIEWPORT
           ===================================================== */}
        <section id="mc-live-map" className="mc-dark-panel">
          <div className="mc-section-header">
            <div>
              <h2 className="mc-section-title">
                <McItemIcon id="compass" size={26} />
                <span>MAPA EN VIVO</span>
              </h2>
              <p className="mc-section-desc">
                Mira el mundo en 3D y por dónde anda cada quien.
              </p>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mc-btn emerald"
            >
              <span>Pantalla completa</span>
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="mc-map-frame-wrap">
            <iframe
              key={mapUrl}
              src={mapUrl}
              title="Mapa en vivo de Minecraft (BlueMap)"
              className="mc-map-iframe"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>

        {/* =====================================================
            1:1 MINECRAFT ADVANCEMENTS SCREEN (L MENU)
           ===================================================== */}
        <section className="mc-dark-panel">
          {(() => {
            const COL_STEP = 104;
            const ROW_STEP = 72;
            const PAD_X = 44;
            const PAD_Y = 44;

            const allNodesCount = ADVANCEMENT_TABS.reduce((acc, t) => acc + t.nodes.length, 0);
            const allUnlockedCount = ADVANCEMENT_TABS.reduce(
              (acc, t) => acc + t.nodes.filter((n) => getNodeUnlockers(t, n).length > 0).length,
              0
            );
            const allPct = allNodesCount > 0 ? Math.round((allUnlockedCount / allNodesCount) * 100) : 0;

            const tabNodes = activeAdvTabObj.nodes || [];
            const tabUnlockedCount = tabNodes.filter((n) => getNodeUnlockers(activeAdvTabObj, n).length > 0).length;
            const maxCol = Math.max(5, ...tabNodes.map((n) => n.col));
            const maxRow = Math.max(4, ...tabNodes.map((n) => n.row));
            const canvasWidth = Math.max(760, (maxCol + 1) * COL_STEP + PAD_X * 2 + 180);
            const canvasHeight = Math.max(440, (maxRow + 1) * ROW_STEP + PAD_Y * 2 + 60);

            const nodeMap = {};
            for (const n of tabNodes) nodeMap[n.id] = n;

            return (
              <>
                <div className="mc-section-header">
                  <div>
                    <h2 className="mc-section-title">
                      <McItemIcon id="knowledge_book" size={26} />
                      <span>LOGROS DEL SERVIDOR</span>
                    </h2>
                    <p className="mc-section-desc">
                      Todos los logros del juego. Arrastra con el mouse para moverte o filtra por jugador.
                    </p>
                  </div>
                  <div className="mc-adv-total-progress">
                    <span style={{ color: '#80ff20', fontFamily: "'Press Start 2P', monospace", fontSize: '0.72rem' }}>
                      {allUnlockedCount} / {allNodesCount} LOGROS ({allPct}%)
                    </span>
                    <div className="mc-xp-bar-bg" style={{ marginTop: '6px' }}>
                      <div className="mc-xp-bar-fill" style={{ width: `${allPct}%` }} />
                      <div className="mc-xp-bar-segments" />
                    </div>
                  </div>
                </div>

                <div className="mc-adv-gui-wrapper">
                  {/* Top Folder Tabs (tab_above_left / middle / right) */}
                  <div className="mc-adv-tabs-row" role="tablist" aria-label="Categorías de Avances">
                    {ADVANCEMENT_TABS.map((tab, idx) => {
                      const isSelected = tab.key === activeAdvTabObj.key;
                      const pos = idx === 0 ? 'left' : idx === ADVANCEMENT_TABS.length - 1 ? 'right' : 'middle';
                      const tabSprite = `${ASSET_BASE}/gui/sprites/advancements/tab_above_${pos}${isSelected ? '_selected' : ''}.png`;
                      const unlockedInTab = tab.nodes.filter((n) => getNodeUnlockers(tab, n).length > 0).length;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          className={`mc-adv-tab ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            playMcSfx('click');
                            setAdvTab(tab.key);
                            setFocusedAdvId(null);
                            if (advViewportRef.current) {
                              advViewportRef.current.scrollLeft = 0;
                              advViewportRef.current.scrollTop = 0;
                            }
                          }}
                        >
                          <McItemIcon id={tab.icon} size={22} />
                          <span className="mc-adv-tab-title">{tab.label}</span>
                          <span className="mc-adv-tab-count">
                            {unlockedInTab}/{tab.nodes.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* #c6c6c6 Beveled Advancements Window */}
                  <div className="mc-adv-window">
                    <div className="mc-adv-window-header">
                      <div className="mc-adv-window-title">
                        <McItemIcon id={activeAdvTabObj.icon} size={20} />
                        <span>{activeAdvTabObj.label}</span>
                        <span style={{ color: '#666', fontWeight: 400 }}>— {activeAdvTabObj.subtitle}</span>
                        <span className="mc-adv-progress-pill">
                          {tabUnlockedCount} / {tabNodes.length} completados
                        </span>
                      </div>

                      <div className="mc-adv-controls">
                        <select
                          className="mc-adv-filter-select"
                          value={advPlayerFilter}
                          onChange={(e) => {
                            playMcSfx('click');
                            setAdvPlayerFilter(e.target.value);
                          }}
                          aria-label="Filtrar avances por jugador"
                        >
                          <option value="ALL">🌐 Todos los jugadores (Global)</option>
                          {players.map((p) => (
                            <option key={p.uuid || p.name} value={p.name}>
                              👤 {p.name} ({p.advancements || 0} logros)
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className={`mc-adv-toggle-btn ${showAdvLabels ? 'active' : ''}`}
                          onClick={() => {
                            playMcSfx('click');
                            setShowAdvLabels((prev) => !prev);
                          }}
                        >
                          🏷️ Nombres: {showAdvLabels ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {/* Pan/Scroll Tiled Block Viewport */}
                    <div
                      ref={advViewportRef}
                      className={`mc-adv-viewport ${advDragging ? 'dragging' : ''}`}
                      style={{ backgroundImage: `url('${activeAdvTabObj.bg}')` }}
                      onMouseDown={(e) => {
                        if (e.target.closest('.mc-adv-node')) return;
                        setFocusedAdvId(null);
                        if (!advViewportRef.current) return;
                        setAdvDragging(true);
                        setAdvDragOrigin({
                          x: e.clientX,
                          y: e.clientY,
                          left: advViewportRef.current.scrollLeft,
                          top: advViewportRef.current.scrollTop
                        });
                      }}
                      onMouseMove={(e) => {
                        if (!advDragging || !advViewportRef.current) return;
                        e.preventDefault();
                        const dx = e.clientX - advDragOrigin.x;
                        const dy = e.clientY - advDragOrigin.y;
                        advViewportRef.current.scrollLeft = advDragOrigin.left - dx;
                        advViewportRef.current.scrollTop = advDragOrigin.top - dy;
                      }}
                      onMouseUp={() => setAdvDragging(false)}
                      onMouseLeave={() => setAdvDragging(false)}
                      onTouchStart={(e) => {
                        if (e.target.closest('.mc-adv-node')) return;
                        setFocusedAdvId(null);
                        if (!advViewportRef.current || e.touches.length !== 1) return;
                        setAdvDragging(true);
                        setAdvDragOrigin({
                          x: e.touches[0].clientX,
                          y: e.touches[0].clientY,
                          left: advViewportRef.current.scrollLeft,
                          top: advViewportRef.current.scrollTop
                        });
                      }}
                      onTouchMove={(e) => {
                        if (!advDragging || !advViewportRef.current || e.touches.length !== 1) return;
                        const dx = e.touches[0].clientX - advDragOrigin.x;
                        const dy = e.touches[0].clientY - advDragOrigin.y;
                        advViewportRef.current.scrollLeft = advDragOrigin.left - dx;
                        advViewportRef.current.scrollTop = advDragOrigin.top - dy;
                      }}
                      onTouchEnd={() => setAdvDragging(false)}
                      onTouchCancel={() => setAdvDragging(false)}
                    >
                      <div
                        className="mc-adv-canvas"
                        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
                      >
                        {/* Orthogonal Parent -> Child Elbow Connectors */}
                        <svg
                          className="mc-adv-svg"
                          width={canvasWidth}
                          height={canvasHeight}
                          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                        >
                          {tabNodes.map((node) => {
                            if (!node.parent || !nodeMap[node.parent]) return null;
                            const parentNode = nodeMap[node.parent];
                            const x1 = PAD_X + parentNode.col * COL_STEP + 26;
                            const y1 = PAD_Y + parentNode.row * ROW_STEP + 26;
                            const x2 = PAD_X + node.col * COL_STEP + 26;
                            const y2 = PAD_Y + node.row * ROW_STEP + 26;
                            const midX = Math.round((x1 + x2) / 2);
                            const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

                            const parentUnlocked = getNodeUnlockers(activeAdvTabObj, parentNode).length > 0;
                            const childUnlocked = getNodeUnlockers(activeAdvTabObj, node).length > 0;
                            const innerColor =
                              parentUnlocked && childUnlocked
                                ? '#55ff55'
                                : parentUnlocked || childUnlocked
                                  ? '#ffffff'
                                  : '#787878';

                            return (
                              <g key={`${node.parent}->${node.id}`}>
                                <path
                                  d={d}
                                  fill="none"
                                  stroke="#000000"
                                  strokeWidth="6"
                                  strokeLinecap="square"
                                  strokeLinejoin="miter"
                                />
                                <path
                                  d={d}
                                  fill="none"
                                  stroke={innerColor}
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                  strokeLinejoin="miter"
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Advancement Nodes (52x52 task / goal / challenge frames) */}
                        {tabNodes.map((node) => {
                          const unlockers = getNodeUnlockers(activeAdvTabObj, node);
                          const isUnlocked = unlockers.length > 0;
                          const frameType = node.frame || 'task';
                          const frameSprite = `${ASSET_BASE}/gui/sprites/advancements/${frameType}_frame_${
                            isUnlocked ? 'obtained' : 'unobtained'
                          }.png`;

                          const leftPx = PAD_X + node.col * COL_STEP;
                          const topPx = PAD_Y + node.row * ROW_STEP;
                          const popLeft = node.col >= Math.max(3, maxCol - 1);
                          const isFocused = focusedAdvId === node.id;
                          const frameLabel =
                            frameType === 'challenge'
                              ? '[DESAFÍO]'
                              : frameType === 'goal'
                                ? '[META]'
                                : '[AVANCE]';

                          return (
                            <div
                              key={node.id}
                              className={`mc-adv-node ${isUnlocked ? 'obtained' : 'unobtained'} frame-${frameType} ${
                                popLeft ? 'popout-left' : ''
                              } ${isFocused ? 'focused' : ''}`}
                              style={{ left: `${leftPx}px`, top: `${topPx}px` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                playMcSfx(isUnlocked ? 'xp' : 'pop');
                                setFocusedAdvId((prev) => (prev === node.id ? null : node.id));
                              }}
                            >
                              <div
                                className="mc-adv-node-frame"
                                style={{ backgroundImage: `url('${frameSprite}')` }}
                              >
                                <McItemIcon id={node.icon} size={26} />
                                {unlockers.length > 0 && (
                                  <span className="mc-adv-node-badge">{unlockers.length}</span>
                                )}
                              </div>

                              {showAdvLabels && (
                                <span className="mc-adv-node-mini-label">{node.title}</span>
                              )}

                              {/* 1:1 Java Edition Hover / Click Banner Popout */}
                              <div className="mc-adv-popout">
                                <div className={`mc-adv-popout-header ${isUnlocked ? 'obtained' : ''}`}>
                                  <div
                                    className="mc-adv-popout-frame-clone"
                                    style={{ backgroundImage: `url('${frameSprite}')` }}
                                  >
                                    <McItemIcon id={node.icon} size={26} />
                                  </div>
                                  <span className="mc-adv-popout-title">{node.title}</span>
                                </div>
                                <div className="mc-adv-popout-body">
                                  <span className="mc-adv-popout-type">{frameLabel}</span>
                                  <p className="mc-adv-popout-desc">{node.desc}</p>
                                  <div className="mc-adv-popout-meta">
                                    {isUnlocked ? (
                                      <span className="mc-adv-popout-unlocked">
                                        ✔ Completado por: {unlockers.join(', ')}
                                      </span>
                                    ) : (
                                      <span className="mc-adv-popout-locked">
                                        🔒 Aún sin desbloquear ({node.id})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Legend & Hint */}
                    <div className="mc-adv-footer-legend">
                      <div className="mc-adv-legend-items">
                        <span className="mc-adv-legend-chip">
                          <img
                            src={`${ASSET_BASE}/gui/sprites/advancements/task_frame_obtained.png`}
                            alt="Task"
                          />
                          Logro
                        </span>
                        <span className="mc-adv-legend-chip">
                          <img
                            src={`${ASSET_BASE}/gui/sprites/advancements/goal_frame_obtained.png`}
                            alt="Goal"
                          />
                          Meta
                        </span>
                        <span className="mc-adv-legend-chip">
                          <img
                            src={`${ASSET_BASE}/gui/sprites/advancements/challenge_frame_obtained.png`}
                            alt="Challenge"
                          />
                          Desafío
                        </span>
                      </div>
                      <span className="mc-adv-pan-hint">
                        🖱️ Arrastra para moverte • Pasa el mouse para ver quién lo tiene
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </section>

        {/* =====================================================
            FIXED PLAYERS TAB-LIST / SCOREBOARD TABLE
           ===================================================== */}
        <section className="mc-dark-panel">
          <div className="mc-section-header">
            <div>
              <h2 className="mc-section-title">
                <McItemIcon id="player_head" size={26} />
                <span>JUGADORES</span>
              </h2>
              <p className="mc-section-desc">
                Quién está conectado y sus estadísticas en el mundo.
              </p>
            </div>
          </div>

          {players.length === 0 ? (
            <p style={{ color: '#c8f5c8', fontSize: '1.2rem' }}>
              Aún no ha entrado nadie. Conéctate en <code>stamina-feeder.tun.ply.gg</code>
            </p>
          ) : (
            <div className="mc-table-wrap">
              <div className="mc-table-scroll-hint" aria-hidden="true">
                <span>↔ Desliza horizontalmente para ver todas las estadísticas</span>
              </div>
              <table className="mc-players-table">
                <thead>
                  <tr>
                    <th>JUGADOR</th>
                    <th>ESTADO / POSICIÓN</th>
                    <th>HACKATHON</th>
                    <th>HORAS</th>
                    <th>DIAMANTES</th>
                    <th>BLOQUES</th>
                    <th>MOBS</th>
                    <th>LOGROS</th>
                    <th>MUERTES</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => {
                    const isBedrock = p.name.startsWith('.');
                    const cleanName = p.name.replace(/^\./, '') || 'Steve';
                    return (
                      <tr key={p.uuid}>
                        <td className="mc-player-td">
                          <div className="mc-player-cell">
                            <img
                              src={`https://mc-heads.net/avatar/${encodeURIComponent(cleanName)}/36`}
                              alt=""
                              className="mc-avatar"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `${ASSET_BASE}/block/carved_pumpkin.png`;
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span className="mc-player-name">{cleanName}</span>
                                <span className={`mc-platform-badge ${isBedrock ? 'bedrock' : 'java'}`}>
                                  {isBedrock ? 'BEDROCK' : 'JAVA'}
                                </span>
                                {p.pvpMode === 'pvp_allowed' && <span className="mc-pvp-badge pvp-on" title="PvP Permitido">⚔️ PvP</span>}
                                {p.pvpMode === 'peaceful' && <span className="mc-pvp-badge pvp-peaceful" title="Modo Pacífico">🕊️ Paz</span>}
                                {p.pvpMode === 'pvp_off' && <span className="mc-pvp-badge pvp-shield" title="Defensivo">🛡️ Def</span>}
                              </div>
                              {p.tagline && <span className="mc-player-tagline">"{p.tagline}"</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          {p.online ? (
                            <span className="mc-online-tag">
                              <img
                                src={`${ASSET_BASE}/gui/sprites/server_list/ping_5.png`}
                                alt=""
                                style={{ width: 16, height: 12, marginRight: 6, verticalAlign: 'middle' }}
                              />
                              En línea {p.location ? (p.location.hidden ? `[${p.location.dimension}: 🔒 Oculto]` : `[${p.location.dimension}: ${p.location.x}, ${p.location.y}, ${p.location.z}]`) : ''}
                            </span>
                          ) : (
                            <span className="mc-offline-tag">
                              ○ Offline {p.location ? (p.location.hidden ? `[${p.location.dimension}: 🔒 Oculto]` : `[${p.location.dimension}: ${p.location.x}, ${p.location.z}]`) : ''}
                            </span>
                          )}
                        </td>
                        <td style={{ color: '#ffff55' }}>{p.hackathonCompleted ?? 0} / 5</td>
                        <td>{p.playHours} h</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#55ffff' }}>
                            <McItemIcon id="diamond" size={18} />
                            {p.diamonds}
                          </span>
                        </td>
                        <td>{p.blocksMined.toLocaleString()}</td>
                        <td>{p.mobKills}</td>
                        <td style={{ color: '#80ff20' }}>{p.advancements}</td>
                        <td style={{ color: '#ff5555' }}>{p.deaths}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =======================================================
          WALL-MOUNTED REDSTONE DIMENSION LEVER
         ======================================================= */}
      <aside className="mc-wall-lever-wrap">
        <button
          type="button"
          className={`mc-wall-bracket ${leverPulled ? 'lever-on' : ''}`}
          onClick={handleWallLeverClick}
          aria-label="Palanca en la pared"
        >
          <span className={`mc-wall-redstone-dot ${leverPulled ? 'active' : ''}`} />
          <div className={`mc-wall-lever-handle ${leverPulled ? 'down' : 'up'}`}>
            <McItemIcon id="lever" size={34} />
          </div>
        </button>
      </aside>

      {/* =======================================================
          AUTHENTIC 4-LAYER GEOLOGICAL GRASS & DIRT BLOCK FOOTER
         ======================================================= */}
      <footer className="mc-terrain-footer">
        {/* Layer 0: Surface Flora & Interactive Dimension Props */}
        <div className="mc-footer-flora-row">
          <img key={`f0-${dimension}`} src={`${ASSET_BASE}/block/${DIMENSIONS[dimension].flora[0]}.png`} alt="" className="mc-flora-sprite" />
          <img key={`f1-${dimension}`} src={`${ASSET_BASE}/block/${DIMENSIONS[dimension].flora[1]}.png`} alt="" className="mc-flora-sprite" />

          {/* Dimension-Specific Terrain Props */}
          {dimension === 'overworld' && (
            <>
              {/* Overworld Note Block */}
              <button
                type="button"
                className="mc-interactive-prop"
                onClick={handleNoteBlockClick}
                aria-label="Bloque musical"
              >
                {noteParticles.map((n) => (
                  <span key={n.id} className="mc-floating-note" style={{ color: n.color, left: `calc(50% + ${n.x}px)` }}>
                    {n.symbol}
                  </span>
                ))}
                <McItemIcon id="note_block" size={42} />
              </button>

              <img key={`f2-${dimension}`} src={`${ASSET_BASE}/block/${DIMENSIONS[dimension].flora[2]}.png`} alt="" className="mc-flora-sprite" />

              {/* Overworld Cake */}
              <button
                type="button"
                className="mc-interactive-prop"
                onClick={handleCakeClick}
                aria-label="Pastel"
              >
                <div
                  className="mc-cake-wrap"
                  style={{ clipPath: `inset(0 0 0 ${(cakeBites / 7) * 100}%)`, opacity: cakeGone ? 0 : 1 }}
                >
                  <McItemIcon id="cake" size={42} />
                </div>
              </button>
            </>
          )}

          {dimension === 'nether' && (
            <>
              {/* Nether Respawn Anchor */}
              <button
                type="button"
                className={`mc-interactive-prop mc-respawn-anchor ${anchorBlown ? 'blown' : ''}`}
                onClick={handleAnchorClick}
                aria-label="Nexo de reaparición"
              >
                <div className="mc-anchor-charges-bar">
                  {[0, 1, 2, 3].map((idx) => (
                    <span
                      key={idx}
                      className={`mc-anchor-charge-pip ${anchorCharges > idx ? 'charged' : ''}`}
                    />
                  ))}
                </div>
                <McItemIcon id={anchorBlown ? 'crying_obsidian' : 'respawn_anchor'} size={42} />
              </button>

              <img key={`f2-${dimension}`} src={`${ASSET_BASE}/block/${DIMENSIONS[dimension].flora[2]}.png`} alt="" className="mc-flora-sprite" />
            </>
          )}

          {dimension === 'end' && (
            <>
              {/* The End Dragon Egg */}
              <button
                type="button"
                className="mc-interactive-prop mc-dragon-egg-prop"
                onClick={handleDragonEggClick}
                style={{
                  transform: `translate(${eggOffset.x}px, ${eggOffset.y}px)`,
                  transition: 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)'
                }}
                aria-label="Huevo de la dragona"
              >
                <McItemIcon id="dragon_egg" size={42} />
              </button>

              <img key={`f2-${dimension}`} src={`${ASSET_BASE}/block/${DIMENSIONS[dimension].flora[2]}.png`} alt="" className="mc-flora-sprite" />
            </>
          )}

          <img key={`f3-${dimension}`} src={`${ASSET_BASE}/block/${DIMENSIONS[dimension].flora[3]}.png`} alt="" className="mc-flora-sprite" />
        </div>

        {/* Layer 1: Tiled 64px Grass Block Top Strip */}
        <div className="mc-footer-grass-strip" />

        {/* Layer 2: Tiled Dirt Block Body + Organic Subterranean Ores Stratum */}
        <div className="mc-footer-dirt-body">
          <div className="mc-footer-inner">
            {/* Organic Subterranean Ores: Natural Vein (no obvious tutorial text) */}
            <div className="mc-subterranean-stratum">
              <div className="mc-ores-row">
                {BURIED_ORES.map((ore) => {
                  const st = oreStates[ore.id] || { hits: 0, broken: false, toast: '' };
                  const bgTex = st.broken ? 'block/cobblestone.png' : ore.texture;
                  return (
                    <div
                      key={ore.id}
                      role="button"
                      tabIndex={0}
                      aria-label={st.broken ? 'Bloque regenerándose' : 'Mineral'}
                      className={`mc-ore-block ${ore.glow && !st.broken ? 'redstone-glow' : ''} ${
                        st.hits > 0 && !st.broken ? (st.hits % 2 ? 'shake-a' : 'shake-b') : ''
                      }`}
                      style={{ backgroundImage: `url('${ASSET_BASE}/${bgTex}')` }}
                      onClick={(e) => handleOreClick(ore, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOreClick(ore, e);
                        }
                      }}
                    >
                      {st.hits > 0 && !st.broken && (
                        <div
                          className="mc-ore-damage"
                          style={{
                            backgroundImage: `url('${ASSET_BASE}/block/destroy_stage_${Math.min(9, st.hits * 2 - 1)}.png')`
                          }}
                        />
                      )}
                      {st.toast && <span className="mc-ore-toast">{st.toast}</span>}
                      <McItemIcon id={st.broken ? 'cobblestone' : ore.dropIcon} size={26} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secret Tracker: colecciona los easter eggs */}
            <div className="mc-secrets">
              <div className="mc-secrets-head">
                🥚 SECRETOS <b>{foundEggs.length}/{SECRET_EGGS.length}</b>
              </div>
              <div className="mc-secrets-grid">
                {SECRET_EGGS.map((egg) => {
                  const ok = foundEggs.includes(egg.id);
                  return (
                    <div
                      key={egg.id}
                      className={`mc-secret-slot ${ok ? 'found' : ''}`}
                      tabIndex={0}
                      aria-label={ok ? `Secreto: ${egg.name}` : `Secreto sin descubrir`}
                    >
                      {ok ? <McItemIcon id={egg.icon} size={28} /> : <span className="mc-secret-q">?</span>}
                      <span className="mc-secret-tip" role="tooltip">
                        <b>{ok ? egg.name : '???'}</b>
                        {ok ? '¡Descubierto!' : 'Secreto sin descubrir'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Info & Navigation Columns */}
            <div className="mc-footer-cols">
              <div className="mc-footer-col">
                <h4>🌱 SERVIDOR HOMELAB</h4>
                <p>Survival entre amigos (Java y Bedrock) con chat de voz por proximidad.</p>
                <p>Tumbas al morir • /tpa • Mapa en vivo.</p>
              </div>

              <div className="mc-footer-col">
                <h4>🧭 ENLACES</h4>
                <div className="mc-footer-links">
                  <Link to="/" className="mc-btn">🏠 Inicio</Link>
                  <Link to="/server" className="mc-btn">🖥️ Estado del Server</Link>
                  <a href={mapUrl} target="_blank" rel="noreferrer" className="mc-btn emerald">🗺️ Mapa 3D</a>
                </div>
              </div>

              <div className="mc-footer-col">
                <h4>⚡ IPs DEL SERVER</h4>
                <p>Java: <code style={{ color: '#80ff20' }}>stamina-feeder.tun.ply.gg</code></p>
                <p>Bedrock: <code style={{ color: '#55ffff' }}>stamina-smartness.tun.ply.gg:14898</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: Bedrock Bottom Base */}
        <div className="mc-footer-bedrock">
          <div className="mc-bedrock-inner">
            <span className="mc-bedrock-text">
              🪨 Hector Antonio Jara • Minecraft Homelab
            </span>
            <button
              type="button"
              onClick={() => {
                playMcSfx('ender');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mc-btn emerald"
            >
              <McItemIcon id="ender_pearl" size={20} />
              <span>Subir ↑</span>
            </button>
          </div>
        </div>
      </footer>

      {/* =======================================================
          PLAYER LOGIN MODAL
         ======================================================= */}
      {loginModalOpen && (
        <div className="mc-modal-overlay" onClick={() => setLoginModalOpen(false)}>
          <div className="mc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modal-header">
              <h3 className="mc-modal-title">
                <McItemIcon id="player_head" size={22} />
                <span>INICIAR SESIÓN</span>
              </h3>
              <button
                type="button"
                className="mc-modal-close"
                onClick={() => setLoginModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePlayerLogin}>
              <div className="mc-modal-body">
                <p className="mc-modal-intro">
                  Inicia sesión con tu <strong>nickname</strong> y la <strong>contraseña</strong> que usas para entrar en el servidor de Minecraft (AuthMe <code>/login</code>).
                </p>

                {loginError && <div className="mc-modal-error">{loginError}</div>}

                <div className="mc-modal-field">
                  <label>👤 NICKNAME DE MINECRAFT:</label>
                  <input
                    type="text"
                    className="mc-modal-input"
                    placeholder="Ej. AntonioJara o .iPandaMex..."
                    value={loginForm.username}
                    onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
                    autoFocus
                    required
                  />
                </div>

                <div className="mc-modal-field">
                  <label>🔑 CONTRASEÑA EN EL SERVIDOR:</label>
                  <input
                    type="password"
                    className="mc-modal-input"
                    placeholder="Contraseña de /login"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="mc-modal-footer">
                <button
                  type="button"
                  className="mc-btn"
                  onClick={() => setLoginModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="mc-btn emerald"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Verificando...' : '🔓 Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          PLAYER PRIVACY & SETTINGS MODAL
         ======================================================= */}
      {settingsModalOpen && playerUser && (
        <div className="mc-modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="mc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(playerUser.username.replace(/^\./, ''))}/24`}
                  alt=""
                  style={{ width: 22, height: 22, imageRendering: 'pixelated' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `${ASSET_BASE}/item/player_head.png`;
                  }}
                />
                <h3 className="mc-modal-title">
                  <span>OPCIONES DE {playerUser.username}</span>
                </h3>
              </div>
              <button
                type="button"
                className="mc-modal-close"
                onClick={() => setSettingsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings}>
              <div className="mc-modal-body">
                {saveStatus && (
                  <div className={saveStatus.includes('éxito') ? 'mc-modal-success' : 'mc-modal-error'}>
                    {saveStatus}
                  </div>
                )}

                {/* Hide Coordinates */}
                <label className="mc-modal-toggle">
                  <input
                    type="checkbox"
                    checked={mySettings.hideLocation}
                    onChange={(e) => setMySettings((s) => ({ ...s, hideLocation: e.target.checked }))}
                  />
                  <div>
                    <div className="mc-toggle-title">📍 Ocultar coordenadas de mi base</div>
                    <div className="mc-toggle-desc">
                      Protege tu base de asaltos. En la web y mapa tus coordenadas X/Y/Z aparecerán como 🔒 Ocultas.
                    </div>
                  </div>
                </label>

                {/* Incognito / Hide Online */}
                <label className="mc-modal-toggle">
                  <input
                    type="checkbox"
                    checked={mySettings.hideOnline}
                    onChange={(e) => setMySettings((s) => ({ ...s, hideOnline: e.target.checked }))}
                  />
                  <div>
                    <div className="mc-toggle-title">👻 Modo incógnito (Ocultar conexión)</div>
                    <div className="mc-toggle-desc">
                      Aparecerás como "Offline" en la web para que juegues tranquilo sin que te vean.
                    </div>
                  </div>
                </label>

                {/* Custom Tagline */}
                <div className="mc-modal-field">
                  <label>💬 LEMA O ESTADO PERSONALIZADO:</label>
                  <input
                    type="text"
                    className="mc-modal-input"
                    maxLength={60}
                    placeholder="Ej. Explorador del Nether, Minero empedernido..."
                    value={mySettings.tagline}
                    onChange={(e) => setMySettings((s) => ({ ...s, tagline: e.target.value }))}
                  />
                  <span style={{ fontSize: '1rem', color: '#666' }}>
                    {mySettings.tagline?.length || 0}/60 caracteres. Se muestra debajo de tu nombre.
                  </span>
                </div>

                {/* Preferred PvP Mode */}
                <div className="mc-modal-field">
                  <label>⚔️ MODO DE JUEGO / DISPOSICIÓN PVP:</label>
                  <div className="mc-pvp-group">
                    <label className={`mc-pvp-option ${mySettings.pvpMode === 'peaceful' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="pvpMode"
                        value="peaceful"
                        checked={mySettings.pvpMode === 'peaceful'}
                        onChange={(e) => setMySettings((s) => ({ ...s, pvpMode: e.target.value }))}
                      />
                      <span>🕊️ <strong>Pacífico</strong> (Solo construcción y convivencia pacífica)</span>
                    </label>

                    <label className={`mc-pvp-option ${mySettings.pvpMode === 'pvp_off' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="pvpMode"
                        value="pvp_off"
                        checked={mySettings.pvpMode === 'pvp_off'}
                        onChange={(e) => setMySettings((s) => ({ ...s, pvpMode: e.target.value }))}
                      />
                      <span>🛡️ <strong>Defensivo</strong> (No ataco primero, pero me defiendo)</span>
                    </label>

                    <label className={`mc-pvp-option ${mySettings.pvpMode === 'pvp_allowed' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="pvpMode"
                        value="pvp_allowed"
                        checked={mySettings.pvpMode === 'pvp_allowed'}
                        onChange={(e) => setMySettings((s) => ({ ...s, pvpMode: e.target.value }))}
                      />
                      <span>⚔️ <strong>PvP Abierto</strong> (Dispuesto a duelos acordados)</span>
                    </label>
                  </div>
                </div>

                {/* Death alerts toggle */}
                <label className="mc-modal-toggle">
                  <input
                    type="checkbox"
                    checked={mySettings.notifyDeaths}
                    onChange={(e) => setMySettings((s) => ({ ...s, notifyDeaths: e.target.checked }))}
                  />
                  <div>
                    <div className="mc-toggle-title">⚰️ Recordatorio de tumbas y muertes</div>
                    <div className="mc-toggle-desc">
                      Tus tumbas duran 15 minutos para que tengas tiempo suficiente de recuperar tus objetos.
                    </div>
                  </div>
                </label>
              </div>

              <div className="mc-modal-footer">
                <button
                  type="button"
                  className="mc-btn red"
                  onClick={handlePlayerLogout}
                  title="Cerrar sesión en esta computadora"
                >
                  🚪 Cerrar Sesión
                </button>
                <button
                  type="submit"
                  className="mc-btn emerald"
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minecraft;
