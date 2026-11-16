/* Love 420 Timeclock — simulated promo demo. No network, no backend, no real data.
   Pure SVG + requestAnimationFrame. */
(() => {
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 960;
const H = 540;
const FLOOR_Y = 432;
const GREEN = '#34d399';
const LEAF = '#22c55e';
const LEAF_DARK = '#16a34a';
const GOLD = '#f0b429';
const AMBER = '#f0b429';
const INK = '#f5f3ee';
const MUTED = '#b0aa9b';
const PANEL = '#191713';

// ---------- helpers ----------
const $ = (id) => document.getElementById(id);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => {
  const k = clamp01((t - a) / (b - a));
  return k * k * (3 - 2 * k);
};

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

function el(tag, attrs, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const k of Object.keys(attrs || {})) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

function text(parent, x, y, str, attrs) {
  const n = el('text', Object.assign({
    x, y, fill: INK, 'font-size': 20,
    'font-family': '"Avenir Next","Segoe UI",system-ui,sans-serif',
  }, attrs || {}), parent);
  n.textContent = str;
  return n;
}

function roundRect(parent, x, y, w, h, r, fill, stroke, sw) {
  return el('rect', {
    x, y, width: w, height: h, rx: r,
    fill: fill || PANEL, stroke: stroke || 'none', 'stroke-width': sw || 2,
  }, parent);
}

// Faithful vector Love 420 mark: green "42" + gold heart + cannabis leaf + gold "L[swirl]VE"
function love420Mark(parent, cx, cy, scale) {
  const g = el('g', { transform: `translate(${cx} ${cy}) scale(${scale || 1})` }, parent);

  // Stacked green "4" / "2" forming the left lobe of the heart
  text(g, -22, -12, '4', { 'font-size': 24, 'font-weight': 900, fill: LEAF, 'text-anchor': 'middle' });
  text(g, -22, 10, '2', { 'font-size': 24, 'font-weight': 900, fill: LEAF_DARK, 'text-anchor': 'middle' });

  // Gold right heart curve
  el('path', {
    d: 'M-8,-22 C-2,-40 28,-40 30,-14 C32,4 10,13 -6,13',
    fill: 'none', stroke: GOLD, 'stroke-width': 5, 'stroke-linecap': 'round',
  }, g);

  // Cannabis leaf tucked inside heart
  const leaf = el('g', { transform: 'translate(9 -11) scale(0.95)' }, g);
  el('path', { d: 'M0,-13 C2,-6 2,-1 0,3 C-2,-1 -2,-6 0,-13 Z', fill: LEAF }, leaf);
  el('path', { d: 'M0,2 C-5,-4 -9,-8 -11,-11 C-7,-9 -3,-5 0,2 Z', fill: LEAF }, leaf);
  el('path', { d: 'M0,2 C5,-4 9,-8 11,-11 C7,-9 3,-5 0,2 Z', fill: LEAF }, leaf);
  el('path', { d: 'M0,3 C-6,0 -11,-1 -14,-2 C-10,-3 -5,-2 0,3 Z', fill: LEAF_DARK }, leaf);
  el('path', { d: 'M0,3 C6,0 11,-1 14,-2 C10,-3 5,-2 0,3 Z', fill: LEAF_DARK }, leaf);

  // Bold gold serif "L [swirl O] V E"
  const serif = 'Georgia, "Times New Roman", serif';
  text(g, -46, 42, 'L', { 'font-family': serif, 'font-size': 30, 'font-weight': 700, fill: GOLD, 'text-anchor': 'middle' });
  const swirl = el('g', { transform: 'translate(-16 31)' }, g);
  for (let i = 0; i < 6; i++) {
    el('path', {
      d: 'M0,-11 C4,-9 5,-4 1,-2 C3,-5 2,-8 0,-11 Z',
      fill: i % 2 === 0 ? LEAF : LEAF_DARK,
      transform: `rotate(${i * 60})`,
    }, swirl);
  }
  text(g, 15, 42, 'V', { 'font-family': serif, 'font-size': 30, 'font-weight': 700, fill: GOLD, 'text-anchor': 'middle' });
  text(g, 45, 42, 'E', { 'font-family': serif, 'font-size': 30, 'font-weight': 700, fill: GOLD, 'text-anchor': 'middle' });
  return g;
}

// Lit Love 420 sign mounted on the signature green plant wall inside the dispensary
function plantWallSign(g, x, y) {
  const w = 178;
  const h = 92;
  const root = el('g', {}, g);
  roundRect(root, x, y, w, h, 12, '#0c2115', '#3d331d', 2);

  // Subtle living plant-wall foliage clusters inside frame
  const clusters = [
    [18, 18, 12, '#143b24'], [46, 14, 14, '#18472b'], [88, 16, 13, '#133721'],
    [134, 18, 14, '#18472b'], [162, 22, 11, '#143b24'], [20, 52, 14, '#18472b'],
    [158, 56, 13, '#133721'], [24, 76, 11, '#133721'], [64, 76, 13, '#164228'],
    [122, 76, 13, '#143b24'], [158, 76, 11, '#18472b'],
  ];
  clusters.forEach(([cx, cy, r, fill]) => {
    el('circle', { cx: x + cx, cy: y + cy, r, fill, opacity: 0.78 }, root);
  });

  // Soft warm glow behind the lit sign
  el('ellipse', { cx: x + w / 2, cy: y + h / 2, rx: 56, ry: 32, fill: '#f0b429', opacity: 0.1 }, root);
  roundRect(root, x + 5, y + 5, w - 10, h - 10, 8, 'none', '#284a34', 1);
  love420Mark(root, x + w / 2, y + h / 2 - 2, 0.76);
  return root;
}

function backdrop(g, title, sub, badge) {
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#0f0e0c' }, g);
  for (let gx = 80; gx < W; gx += 80) {
    el('line', { x1: gx, y1: 96, x2: gx, y2: FLOOR_Y, stroke: '#171511', 'stroke-width': 1 }, g);
  }
  for (let gy = 140; gy < FLOOR_Y; gy += 70) {
    el('line', { x1: 0, y1: gy, x2: W, y2: gy, stroke: '#171511', 'stroke-width': 1 }, g);
  }
  el('rect', { x: 0, y: FLOOR_Y, width: W, height: H - FLOOR_Y, fill: '#0b0a08' }, g);
  el('line', { x1: 0, y1: FLOOR_Y, x2: W, y2: FLOOR_Y, stroke: '#2b261d', 'stroke-width': 2 }, g);

  text(g, 44, 52, title, { 'font-size': 28, 'font-weight': 700, fill: GOLD });
  if (sub) text(g, 44, 78, sub, { 'font-size': 15, fill: MUTED });

  // Top-right mini Love 420 DC badge + scene counter
  roundRect(g, W - 284, 28, 150, 30, 15, '#141310', '#3d331d', 1.5);
  love420Mark(g, W - 262, 43, 0.21);
  text(g, W - 242, 48, 'LOVE 420 DC', { 'font-size': 12, 'font-weight': 700, fill: GOLD, 'letter-spacing': '0.04em' });

  if (badge) {
    roundRect(g, W - 122, 28, 78, 30, 15, '#171512', '#2d291f', 1.5);
    text(g, W - 83, 48, badge, { 'font-size': 13, 'font-weight': 700, fill: MUTED, 'text-anchor': 'middle' });
  }
}

// ---------- stick figure ----------
function stick(g, x, y, s, color) {
  const root = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
  const c = color || INK;
  const head = el('circle', { cx: 0, cy: -95, r: 12, fill: '#0f0e0c', stroke: c, 'stroke-width': 5 }, root);
  el('line', { x1: 0, y1: -83, x2: 0, y2: -45, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, root);
  const armL = el('line', { x1: 0, y1: -75, x2: -2, y2: -48, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, root);
  const armR = el('line', { x1: 0, y1: -75, x2: 2, y2: -48, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, root);
  const legL = el('line', { x1: 0, y1: -45, x2: -2, y2: -4, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, root);
  const legR = el('line', { x1: 0, y1: -45, x2: 2, y2: -4, stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' }, root);
  return {
    root, head,
    move(nx, ny) { root.setAttribute('transform', `translate(${nx} ${ny}) scale(${s})`); },
    pose(aL, aR, lL, lR) {
      armL.setAttribute('transform', `rotate(${aL} 0 -75)`);
      armR.setAttribute('transform', `rotate(${aR} 0 -75)`);
      legL.setAttribute('transform', `rotate(${lL} 0 -45)`);
      legR.setAttribute('transform', `rotate(${lR} 0 -45)`);
    },
    walk(phase, amp) {
      const a = amp || 26;
      const s1 = Math.sin(phase);
      this.pose(-22 * s1, 22 * s1, 26 * s1 * (a / 26), -26 * s1 * (a / 26));
    },
    wave(phase) {
      this.pose(0, -150 + Math.sin(phase) * 18, 0, 0);
    },
  };
}

// ---------- props ----------
function kioskProp(g, x, y) {
  const root = el('g', {}, g);
  el('rect', { x: x - 14, y: y - 118, width: 28, height: 118, fill: '#2c2820' }, root);
  el('rect', { x: x - 34, y: y - 8, width: 68, height: 8, rx: 4, fill: '#3d372b' }, root);
  el('rect', { x: x - 82, y: y - 304, width: 164, height: 190, rx: 16, fill: '#191713', stroke: GOLD, 'stroke-width': 3 }, root);
  el('circle', { cx: x, cy: y - 284, r: 5, fill: '#0b0a08', stroke: MUTED, 'stroke-width': 2 }, root);
  const camRing = el('circle', { cx: x, cy: y - 284, r: 10, fill: 'none', stroke: GREEN, 'stroke-width': 2, opacity: 0 }, root);

  const dots = [];
  for (let i = 0; i < 4; i++) {
    dots.push(el('circle', {
      cx: x - 45 + i * 30, cy: y - 258, r: 8,
      fill: 'none', stroke: MUTED, 'stroke-width': 2.5,
    }, root));
  }

  const scanBox = el('g', { opacity: 0 }, root);
  const bx = x - 26;
  const by = y - 236;
  const bw = 52;
  const bh = 52;
  const bPath = [
    `M${bx},${by + 12} V${by} H${bx + 12}`,
    `M${bx + bw - 12},${by} H${bx + bw} V${by + 12}`,
    `M${bx},${by + bh - 12} V${by + bh} H${bx + 12}`,
    `M${bx + bw - 12},${by + bh} H${bx + bw} V${by + bh - 12}`,
  ].join(' ');
  el('path', { d: bPath, fill: 'none', stroke: GREEN, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, scanBox);
  el('circle', { cx: x, cy: by + 20, r: 9, fill: 'none', stroke: INK, 'stroke-width': 2 }, scanBox);
  el('path', { d: `M${x - 13},${by + 42} Q${x},${by + 30} ${x + 13},${by + 42}`, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }, scanBox);
  const laser = el('line', { x1: bx + 4, y1: by + 6, x2: bx + bw - 4, y2: by + 6, stroke: GREEN, 'stroke-width': 2 }, scanBox);

  const screen = text(root, x, y - 156, 'Enter PIN', { 'font-size': 15, 'font-weight': 600, fill: MUTED, 'text-anchor': 'middle' });
  const subScreen = text(root, x, y - 134, 'Love 420 · ABCA-129942', { 'font-size': 10.5, fill: '#8a8475', 'text-anchor': 'middle' });
  const flash = el('rect', { x: x - 82, y: y - 304, width: 164, height: 190, rx: 16, fill: '#ffffff', opacity: 0 }, root);
  return { root, dots, camRing, scanBox, laser, by, bh, screen, subScreen, flash };
}

function phoneProp(g, x, y, w, h, headerLabel) {
  const root = el('g', {}, g);
  roundRect(root, x, y, w, h, 22, '#0b0a08', MUTED, 2.5);
  el('rect', { x: x + w / 2 - 28, y: y + 10, width: 56, height: 7, rx: 3.5, fill: '#2c2820' }, root);
  if (headerLabel) {
    text(root, x + w / 2, y + 36, headerLabel, { 'font-size': 12, 'font-weight': 600, fill: GOLD, 'text-anchor': 'middle' });
    el('line', { x1: x + 12, y1: y + 46, x2: x + w - 12, y2: y + 46, stroke: '#25211a', 'stroke-width': 1.5 }, root);
  }
  return root;
}

function bubble(parent, x, y, w, lines, opts) {
  const o = opts || {};
  const lh = o.lh || 22;
  const fs = o.fs || 15;
  const h = 22 + lines.length * lh;
  const g = el('g', {}, parent);
  roundRect(g, x, y, w, h, 14, o.fill || '#152b1f', o.stroke || GREEN, 1.8);
  lines.forEach((ln, i) => text(g, x + 14, y + 25 + i * lh, ln, {
    'font-size': fs, fill: o.color || INK, 'font-weight': o.bold ? 600 : 400,
  }));
  return g;
}

function wallClock(g, x, y, r) {
  const root = el('g', {}, g);
  el('circle', { cx: x, cy: y, r, fill: '#0b0a08', stroke: GOLD, 'stroke-width': 3.5 }, root);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = r - 10;
    const r2 = r - 4;
    el('line', {
      x1: x + Math.sin(a) * r1, y1: y - Math.cos(a) * r1,
      x2: x + Math.sin(a) * r2, y2: y - Math.cos(a) * r2,
      stroke: i % 3 === 0 ? INK : '#524b3d', 'stroke-width': i % 3 === 0 ? 3 : 1.5,
    }, root);
  }
  const hour = el('line', { x1: x, y1: y, x2: x, y2: y - r * 0.45, stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, root);
  const min = el('line', { x1: x, y1: y, x2: x, y2: y - r * 0.72, stroke: GREEN, 'stroke-width': 4, 'stroke-linecap': 'round' }, root);
  el('circle', { cx: x, cy: y, r: 5, fill: GOLD }, root);
  return {
    set(hDeg, mDeg) {
      hour.setAttribute('transform', `rotate(${hDeg} ${x} ${y})`);
      min.setAttribute('transform', `rotate(${mDeg} ${x} ${y})`);
    },
  };
}

function cloudProp(g, x, y, label) {
  const root = el('g', { opacity: 0 }, g);
  el('ellipse', { cx: x, cy: y, rx: 84, ry: 46, fill: PANEL, stroke: GREEN, 'stroke-width': 3 }, root);
  el('ellipse', { cx: x - 48, cy: y + 14, rx: 36, ry: 26, fill: PANEL, stroke: GREEN, 'stroke-width': 3 }, root);
  el('ellipse', { cx: x + 48, cy: y + 14, rx: 36, ry: 26, fill: PANEL, stroke: GREEN, 'stroke-width': 3 }, root);
  el('ellipse', { cx: x, cy: y + 6, rx: 78, ry: 38, fill: PANEL }, root);
  text(root, x, y + 12, label || 'AI', { 'font-size': label && label.length > 3 ? 22 : 32, 'font-weight': 700, fill: GREEN, 'text-anchor': 'middle' });
  return root;
}

function statusPill(g, x, y, label, color, w) {
  const pw = w || 230;
  const p = el('g', {}, g);
  roundRect(p, x, y, pw, 42, 21, '#0b0a08', color, 2);
  text(p, x + pw / 2, y + 27, label, { 'font-size': 15, 'font-weight': 700, fill: color, 'text-anchor': 'middle' });
  return p;
}

// ---------- scenes ----------
const scenes = [
  {
    name: 'Remote schedule',
    dur: 11,
    vo: 'From anywhere, a Love 420 manager uploads the weekly schedule. Shift times and break rules sync across the dispensary floor, walk-up window, and private rooms.',
    caption: '<strong>Anytime — Remote schedule upload.</strong> Upload a CSV or edit from anywhere — shifts push live to Love 420’s floor, walk-up window, and lounge.',
    setup(g) {
      backdrop(g, '1 · Upload schedules remotely', '39 Q St SW · Dispensary, Lounge & Walk-Up Window (10 AM–10 PM)', '01 / 05');

      const mgr = stick(g, 82, FLOOR_Y, 1.45, INK);
      mgr.pose(0, -60, 0, 0);

      el('rect', { x: 142, y: 300, width: 156, height: 12, rx: 4, fill: '#2c2820' }, g);
      el('rect', { x: 162, y: 312, width: 14, height: FLOOR_Y - 312, fill: '#211d17' }, g);
      el('rect', { x: 264, y: 312, width: 14, height: FLOOR_Y - 312, fill: '#211d17' }, g);
      roundRect(g, 152, 286, 136, 14, 4, '#3d372b', 'none');
      roundRect(g, 162, 184, 116, 102, 8, '#0b0a08', GOLD, 2);
      text(g, 220, 206, 'Love 420 Portal', { 'font-size': 11, 'font-weight': 600, fill: GOLD, 'text-anchor': 'middle' });
      roundRect(g, 178, 256, 84, 8, 4, PANEL, 'none');
      const upBar = el('rect', { x: 178, y: 256, width: 0, height: 8, rx: 4, fill: GREEN }, g);

      const chip = el('g', {}, g);
      roundRect(chip, 172, 218, 96, 28, 8, '#152b1f', GREEN, 1.5);
      text(chip, 220, 237, 'schedule.csv', { 'font-size': 12, 'font-weight': 700, fill: INK, 'text-anchor': 'middle' });

      const connIn = el('line', { x1: 282, y1: 218, x2: 376, y2: 190, stroke: '#3a3428', 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 }, g);
      const connOut1 = el('line', { x1: 540, y1: 184, x2: 642, y2: 164, stroke: '#3a3428', 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 }, g);
      const connOut2 = el('line', { x1: 540, y1: 196, x2: 642, y2: 286, stroke: '#3a3428', 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 }, g);

      const cloud = cloudProp(g, 458, 188, 'CLOUD');
      const ruleCard = el('g', { opacity: 0 }, g);
      roundRect(ruleCard, 354, 258, 208, 66, 12, '#171512', GOLD, 1.5);
      text(ruleCard, 458, 284, 'Maya R. · 10:00–6:00', { 'font-size': 14, 'font-weight': 700, fill: INK, 'text-anchor': 'middle' });
      text(ruleCard, 458, 306, '30m Break · Dispensary', { 'font-size': 13, fill: MUTED, 'text-anchor': 'middle' });

      function zoneCard(y, name, detail) {
        const c = el('g', { opacity: 0 }, g);
        roundRect(c, 646, y, 256, 94, 14, '#141310', '#2d291f', 2);
        text(c, 666, y + 32, name, { 'font-size': 15.5, 'font-weight': 700, fill: INK });
        text(c, 666, y + 54, detail, { 'font-size': 12.5, fill: MUTED });
        const badge = text(c, 666, y + 78, 'Syncing...', { 'font-size': 13, 'font-weight': 700, fill: GOLD });
        return { c, badge };
      }

      const loc1 = zoneCard(118, 'Dispensary & Walk-Up', 'Door Kiosk + Mobile Geofence');
      const loc2 = zoneCard(238, 'Lounge & 4 Private Rooms', 'Haze · Kush · Chronic · Ganja');

      const pill = statusPill(g, 646, 354, 'ALL ZONES SYNCED ✓', GREEN, 256);
      pill.setAttribute('opacity', 0);

      return { upBar, chip, connIn, connOut1, connOut2, cloud, ruleCard, loc1, loc2, pill };
    },
    frame(s, k) {
      const up = seg(k, 0.04, 0.22);
      s.upBar.setAttribute('width', (84 * up).toFixed(1));

      const fly = seg(k, 0.22, 0.44);
      s.chip.setAttribute('transform', `translate(${lerp(0, 190, fly)} ${lerp(0, -44, fly)})`);
      s.chip.setAttribute('opacity', 1 - seg(k, 0.36, 0.46));

      s.connIn.setAttribute('opacity', seg(k, 0.20, 0.32));
      s.cloud.setAttribute('opacity', seg(k, 0.32, 0.42));
      s.ruleCard.setAttribute('opacity', seg(k, 0.42, 0.54));

      s.connOut1.setAttribute('opacity', seg(k, 0.48, 0.58));
      s.connOut2.setAttribute('opacity', seg(k, 0.52, 0.62));
      s.loc1.c.setAttribute('opacity', seg(k, 0.50, 0.62));
      s.loc2.c.setAttribute('opacity', seg(k, 0.56, 0.68));

      if (k >= 0.64) {
        s.loc1.badge.textContent = 'Schedule Active ✓';
        s.loc1.badge.setAttribute('fill', GREEN);
      }
      if (k >= 0.72) {
        s.loc2.badge.textContent = 'Schedule Active ✓';
        s.loc2.badge.setAttribute('fill', GREEN);
      }
      s.pill.setAttribute('opacity', seg(k, 0.76, 0.86));
    },
  },
  {
    name: 'Biometric clock-in',
    dur: 12,
    vo: 'At ten A.M., Maya clocks in at Love 420 on Q Street—at the door kiosk or from a geofenced mobile device. A biometric face scan stops buddy-punching, and her station tags 280E labor.',
    caption: '<strong>10:00 AM — Biometric &amp; geofenced clock-in.</strong> Face-match biometrics stop buddy-punching; station selection tags 280E labor.',
    setup(g) {
      backdrop(g, '2 · Biometric & geofenced clock-in', '39 Q St SW, DC 20024 · License ABCA-129942', '02 / 05');
      plantWallSign(g, 462, 114);
      const k = kioskProp(g, 735, FLOOR_Y);
      const emp = stick(g, -60, FLOOR_Y, 1.5, INK);

      const card = el('g', { opacity: 0 }, g);
      roundRect(card, 72, 128, 368, 154, 16, '#141915', GREEN, 2);
      text(card, 96, 164, 'Biometric Match ✓  99.4%', { 'font-size': 20, 'font-weight': 700, fill: GREEN });
      text(card, 96, 192, 'Anti-buddy-punch verified · 10:00 AM', { 'font-size': 14, fill: INK });
      text(card, 96, 218, 'Geofence: 39 Q St SW (Kiosk / Mobile) ✓', { 'font-size': 14, fill: MUTED });
      roundRect(card, 96, 234, 286, 30, 15, '#0b0a08', GOLD, 1.5);
      text(card, 239, 254, 'Station: Dispensary Floor → 280E Retail', { 'font-size': 13, 'font-weight': 600, fill: GOLD, 'text-anchor': 'middle' });

      return { k, emp, card };
    },
    frame(s, k) {
      const x = lerp(-60, 560, seg(k, 0, 0.22));
      s.emp.move(x, FLOOR_Y + (k < 0.22 ? -Math.abs(Math.sin(k * 42)) * 4 : 0));

      if (k < 0.22) s.emp.walk(k * 42);
      else if (k < 0.40) s.emp.pose(-10, -76 + Math.sin(k * 65) * 8, 0, 0);
      else if (k < 0.84) s.emp.pose(-15, 15, 0, 0);
      else s.emp.wave(k * 28);

      s.k.dots.forEach((d, i) => {
        const on = seg(k, 0.23 + i * 0.04, 0.27 + i * 0.04);
        d.setAttribute('fill', on > 0.5 ? GREEN : 'none');
        d.setAttribute('stroke', on > 0.5 ? GREEN : MUTED);
      });

      const scanOn = k >= 0.40 && k < 0.70 ? 1 : 0;
      s.k.scanBox.setAttribute('opacity', scanOn);
      if (scanOn) {
        const sweep = 0.5 - 0.5 * Math.cos(((k - 0.40) / 0.18) * Math.PI * 2);
        const ly = s.k.by + 8 + sweep * (s.k.bh - 16);
        s.k.laser.setAttribute('y1', ly.toFixed(1));
        s.k.laser.setAttribute('y2', ly.toFixed(1));
      }

      const camPulse = k > 0.42 && k < 0.56 ? Math.sin(((k - 0.42) / 0.14) * Math.PI) : 0;
      s.k.camRing.setAttribute('opacity', camPulse.toFixed(2));

      const fl = k > 0.55 && k < 0.63 ? Math.sin(((k - 0.55) / 0.08) * Math.PI) : 0;
      s.k.flash.setAttribute('opacity', (fl * 0.85).toFixed(2));

      if (k >= 0.68) {
        s.k.screen.textContent = 'Dispensary Floor ✓';
        s.k.screen.setAttribute('fill', GREEN);
        s.k.subScreen.textContent = 'Geofence + Face Match ✓';
      } else if (k >= 0.56) {
        s.k.screen.textContent = 'Match 99.4% ✓';
        s.k.screen.setAttribute('fill', GREEN);
        s.k.subScreen.textContent = 'Biometric verified';
      } else if (k >= 0.40) {
        s.k.screen.textContent = 'Scanning face...';
        s.k.screen.setAttribute('fill', INK);
      }

      const cardK = seg(k, 0.64, 0.76);
      s.card.setAttribute('opacity', cardK);
      s.card.setAttribute('transform', `translate(0 ${(1 - cardK) * 14})`);
    },
  },
  {
    name: 'Breaks & watchdog',
    dur: 13,
    vo: 'Her thirty-minute meal break logs cleanly for compliance. Later, fifteen minutes past her six P.M. shift, the watchdog texts her. She just replies: Left at 6:04.',
    caption: '<strong>Breaks &amp; 6:15 PM Watchdog.</strong> Meal breaks stay compliant, and if Maya forgets to punch out, she replies via SMS — no app needed.',
    setup(g) {
      backdrop(g, '3 · Break compliance + safety net', 'Meal breaks logged automatically · SMS watchdog catches missed outs', '03 / 05');
      plantWallSign(g, 376, 114);

      const clock = wallClock(g, 190, 204, 70);
      const timePill = el('g', {}, g);
      roundRect(timePill, 118, 290, 144, 34, 17, '#0b0a08', MUTED, 1.5);
      const timeTxt = text(timePill, 190, 313, '1:30 PM', { 'font-size': 16, 'font-weight': 700, fill: INK, 'text-anchor': 'middle' });

      const breakPill = el('g', { opacity: 0 }, g);
      roundRect(breakPill, 72, 338, 236, 36, 18, '#141915', GREEN, 1.8);
      text(breakPill, 190, 361, '30m Meal Break Logged ✓', { 'font-size': 14, 'font-weight': 700, fill: GREEN, 'text-anchor': 'middle' });

      const shiftWarn = text(g, 190, 398, 'Shift ended 6:00 PM (+15m)', { 'font-size': 14, fill: GOLD, 'text-anchor': 'middle', opacity: 0 });

      const emp = stick(g, 410, FLOOR_Y, 1.5, INK);
      emp.pose(0, 0, 0, 0);

      const phone = el('g', { opacity: 0 }, g);
      phoneProp(phone, 610, 114, 270, 304, 'Messages · Love 420');
      const inMsg = bubble(phone, 626, 172, 224, ['Love 420: Still clocked', 'in? Reply with the', 'time you left.'], { fill: '#22201b', stroke: MUTED });
      inMsg.setAttribute('opacity', 0);

      const outMsg = bubble(phone, 712, 278, 152, ['Left at 6:04'], { fill: '#152b1f', stroke: GREEN, bold: true });
      outMsg.setAttribute('opacity', 0);

      roundRect(phone, 626, 356, 192, 40, 20, '#141310', '#2d291f', 1.5);
      const draft = text(phone, 642, 381, 'Left at 6:04', { 'font-size': 14, fill: INK, opacity: 0 });
      el('circle', { cx: 844, cy: 376, r: 15, fill: GOLD }, phone);
      text(phone, 844, 381, '↑', { 'font-size': 16, 'font-weight': 700, fill: '#0b0a08', 'text-anchor': 'middle' });

      const tap = el('circle', { cx: 844, cy: 376, r: 16, fill: 'none', stroke: GOLD, 'stroke-width': 3, opacity: 0 }, g);
      return { clock, timeTxt, breakPill, shiftWarn, emp, phone, inMsg, outMsg, draft, tap };
    },
    frame(s, k) {
      if (k < 0.22) {
        const bk = seg(k, 0.0, 0.16);
        s.clock.set(45 + bk * 15, 180 + bk * 180);
        s.timeTxt.textContent = bk > 0.75 ? '2:00 PM' : '1:30 PM';
        s.timeTxt.setAttribute('fill', GREEN);
      } else {
        const spin = seg(k, 0.22, 0.42);
        s.clock.set(60 + spin * 127.5, spin * 90);
        if (spin < 0.7) {
          s.timeTxt.textContent = '6:00 PM';
          s.timeTxt.setAttribute('fill', INK);
        } else {
          const mins = Math.round(lerp(0, 15, (spin - 0.7) / 0.3));
          s.timeTxt.textContent = `6:${mins < 10 ? '0' : ''}${mins} PM`;
          s.timeTxt.setAttribute('fill', mins >= 15 ? GOLD : INK);
        }
      }

      s.breakPill.setAttribute('opacity', seg(k, 0.10, 0.18));
      s.shiftWarn.setAttribute('opacity', seg(k, 0.36, 0.44));

      s.phone.setAttribute('opacity', seg(k, 0.36, 0.46));
      s.inMsg.setAttribute('opacity', seg(k, 0.46, 0.56));

      const walkK = seg(k, 0.48, 0.62);
      s.emp.move(lerp(410, 520, walkK), FLOOR_Y);
      if (k < 0.48) s.emp.pose(0, 0, 0, 0);
      else if (k < 0.62) s.emp.walk(k * 42);
      else s.emp.pose(-15, -72, 0, 0);

      s.draft.setAttribute('opacity', k < 0.80 ? seg(k, 0.62, 0.72) : 0);

      const tapK = k > 0.72 && k < 0.82 ? Math.sin(((k - 0.72) / 0.10) * Math.PI) : 0;
      s.tap.setAttribute('opacity', (tapK * 0.95).toFixed(2));
      s.tap.setAttribute('r', 12 + tapK * 14);

      s.outMsg.setAttribute('opacity', seg(k, 0.80, 0.90));
    },
  },
  {
    name: 'AI approval',
    dur: 11,
    vo: 'AI parses her plain-English text into a structured punch, queues it for review, and the manager approves with one tap—every edit logged for ABCA compliance.',
    caption: '<strong>6:16 PM — AI parse + one-tap approval.</strong> Natural language becomes a verified punch — every edit logged for ABCA-129942.',
    setup(g) {
      backdrop(g, '4 · AI parse + one-tap approval', 'Plain-English SMS → structured punch · ABCA-129942 audit log', '04 / 05');

      const conn1 = el('line', { x1: 230, y1: 215, x2: 365, y2: 200, stroke: '#3a3428', 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 }, g);
      const conn2 = el('line', { x1: 550, y1: 200, x2: 645, y2: 240, stroke: '#3a3428', 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0 }, g);

      const chip = bubble(g, 56, 192, 180, ['“Left at 6:04”'], { fill: '#152b1f', stroke: GREEN, bold: true });
      const cloud = cloudProp(g, 460, 198, 'AI');

      const pending = statusPill(g, 345, 104, 'PENDING APPROVAL', GOLD, 230);
      pending.setAttribute('opacity', 0);

      const parsed = el('g', { opacity: 0 }, g);
      roundRect(parsed, 340, 266, 240, 74, 14, PANEL, GREEN, 1.8);
      text(parsed, 460, 296, 'Clock-out: 6:04 PM ✓', { 'font-size': 16, 'font-weight': 700, fill: INK, 'text-anchor': 'middle' });
      text(parsed, 460, 322, 'Confidence 99% · Audit #418', { 'font-size': 13, fill: MUTED, 'text-anchor': 'middle' });

      const approved = statusPill(g, 345, 358, 'APPROVED ✓', GREEN, 230);
      approved.setAttribute('opacity', 0);

      const phone = el('g', { opacity: 0 }, g);
      phoneProp(phone, 646, 168, 162, 224, 'Love 420 Manager');
      text(phone, 727, 240, 'Maya R.', { 'font-size': 16, 'font-weight': 700, fill: INK, 'text-anchor': 'middle' });
      text(phone, 727, 264, 'Clock-out 6:04 PM', { 'font-size': 13, fill: MUTED, 'text-anchor': 'middle' });
      const btnBg = roundRect(phone, 668, 304, 118, 42, 12, GOLD, 'none');
      const btnTxt = text(phone, 727, 331, 'Approve', { 'font-size': 15, 'font-weight': 700, fill: '#0b0a08', 'text-anchor': 'middle' });

      const mgr = stick(g, 1020, FLOOR_Y, 1.5, INK);
      mgr.pose(0, 0, 0, 0);

      const tap = el('circle', { cx: 727, cy: 325, r: 12, fill: 'none', stroke: GOLD, 'stroke-width': 3, opacity: 0 }, g);
      return { conn1, conn2, chip, cloud, pending, parsed, approved, phone, btnBg, btnTxt, mgr, tap };
    },
    frame(s, k) {
      const cx = lerp(0, 310, seg(k, 0.02, 0.24));
      s.chip.setAttribute('transform', `translate(${cx} 0)`);
      s.chip.setAttribute('opacity', 1 - seg(k, 0.18, 0.26));

      s.conn1.setAttribute('opacity', seg(k, 0.12, 0.22));
      s.cloud.setAttribute('opacity', seg(k, 0.20, 0.30));
      s.parsed.setAttribute('opacity', seg(k, 0.30, 0.42));
      s.conn2.setAttribute('opacity', seg(k, 0.42, 0.52));
      s.phone.setAttribute('opacity', seg(k, 0.46, 0.56));

      const mx = lerp(1020, 880, seg(k, 0.52, 0.68));
      s.mgr.move(mx, FLOOR_Y);
      if (k > 0.52 && k < 0.68) s.mgr.walk(k * 42);
      else if (k >= 0.68) s.mgr.pose(20, -76, 0, 0);

      const tapK = k > 0.70 && k < 0.82 ? Math.sin(((k - 0.70) / 0.12) * Math.PI) : 0;
      s.tap.setAttribute('opacity', (tapK * 0.95).toFixed(2));
      s.tap.setAttribute('r', 10 + tapK * 14);

      const ap = seg(k, 0.82, 0.91);
      s.approved.setAttribute('opacity', ap);
      s.pending.setAttribute('opacity', (seg(k, 0.42, 0.50) * (1 - ap)).toFixed(3));

      if (ap > 0.5) {
        s.btnBg.setAttribute('fill', '#152b1f');
        s.btnBg.setAttribute('stroke', GREEN);
        s.btnTxt.textContent = 'Approved ✓';
        s.btnTxt.setAttribute('fill', GREEN);
      } else {
        s.btnBg.setAttribute('fill', GOLD);
        s.btnBg.setAttribute('stroke', 'none');
        s.btnTxt.textContent = 'Approve';
        s.btnTxt.setAttribute('fill', '#0b0a08');
      }
    },
  },
  {
    name: 'Payroll & 280E',
    dur: 13,
    vo: 'Come payday, one click exports dispensary, lounge, and inventory hours—with D.C. overtime, sick leave, and 280E COGS buckets—straight to Payroll CSV.',
    caption: '<strong>Payday — One-click payroll.</strong> Dispensary, Lounge/Rooms &amp; Inventory hours, breaks, D.C. overtime, sick leave, and 280E export cleanly.',
    setup(g) {
      backdrop(g, '5 · One-click payroll & 280E', 'D.C. overtime · Breaks · Sick leave · 280E COGS split', '05 / 05');

      const badge = statusPill(g, 60, 108, '280E COGS SPLIT ✓', GREEN, 224);
      badge.setAttribute('opacity', 0);

      const csv = el('g', { opacity: 0 }, g);
      roundRect(csv, 730, 104, 170, 48, 12, GOLD, 'none');
      text(csv, 815, 134, 'Payroll.csv ↓', { 'font-size': 17, 'font-weight': 700, fill: '#0b0a08', 'text-anchor': 'middle' });

      const totals = text(g, 480, 182, 'Love 420 DC · 62h · 40 reg · 22 OT · Breaks ✓ · +1.4h sick', {
        'font-size': 18, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: 0,
      });

      const BASE_Y = 400;
      el('line', { x1: 180, y1: BASE_Y, x2: 780, y2: BASE_Y, stroke: '#2d291f', 'stroke-width': 2 }, g);

      const bars = [];
      const defs = [
        ['Dispensary', 30, 220],
        ['Lounge & Rooms', 20, 420],
        ['Inventory', 12, 620],
      ];
      defs.forEach(([label, hrs, x]) => {
        text(g, x + 60, 422, label, { 'font-size': 15, fill: MUTED, 'text-anchor': 'middle' });
        if (label === 'Inventory') {
          text(g, x + 60, 440, '(280E COGS)', { 'font-size': 12, fill: GOLD, 'text-anchor': 'middle' });
        }
        const h0 = hrs * 5;
        const rect = el('rect', {
          x, y: BASE_Y, width: 120, height: 0, rx: 6, fill: GREEN, opacity: 0.9,
          stroke: label === 'Inventory' ? GOLD : 'none', 'stroke-width': 3, 'stroke-dasharray': '8 5',
        }, g);
        const val = text(g, x + 60, BASE_Y - 12, '', {
          'font-size': 19, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: 0,
        });
        bars.push({ rect, val, hrs, h0, baseY: BASE_Y });
      });

      const locked = el('g', { opacity: 0 }, g);
      roundRect(locked, 355, 218, 250, 46, 23, '#0b0a08', GOLD, 2);
      text(locked, 480, 248, 'Period locked ✓', { 'font-size': 22, 'font-weight': 700, fill: GOLD, 'text-anchor': 'middle' });

      const conf = [];
      const colors = [GOLD, GREEN, '#f5f3ee', LEAF_DARK];
      for (let i = 0; i < 80; i++) {
        conf.push({
          n: el('rect', { x: 0, y: -20, width: 8, height: 12, fill: colors[i % 4], opacity: 0 }, g),
          x: Math.random() * W, v: 130 + Math.random() * 160, ph: Math.random() * 6.28, spin: 2 + Math.random() * 5,
        });
      }
      return { bars, badge, totals, csv, locked, conf, t: 0 };
    },
    frame(s, k, dt) {
      s.bars.forEach((b, i) => {
        const gk = seg(k, 0.03 + i * 0.07, 0.18 + i * 0.07);
        const h = b.h0 * gk;
        b.rect.setAttribute('height', h.toFixed(1));
        b.rect.setAttribute('y', (b.baseY - h).toFixed(1));
        b.val.setAttribute('opacity', gk > 0.85 ? 1 : 0);
        b.val.textContent = `${b.hrs}h`;
        b.val.setAttribute('y', b.baseY - h - 10);
      });

      s.totals.setAttribute('opacity', seg(k, 0.34, 0.46));
      s.badge.setAttribute('opacity', seg(k, 0.48, 0.58));
      s.csv.setAttribute('opacity', seg(k, 0.58, 0.68));
      s.locked.setAttribute('opacity', seg(k, 0.72, 0.82));

      s.t += dt;
      const tAnim = s.t > 0 ? s.t : k * 4;
      const ck = seg(k, 0.84, 0.91);
      s.conf.forEach((c) => {
        if (ck <= 0) {
          c.n.setAttribute('opacity', 0);
          return;
        }
        const y = ((tAnim * c.v + c.ph * 60) % (H + 40)) - 20;
        c.n.setAttribute('opacity', (ck * 0.92).toFixed(2));
        c.n.setAttribute('transform', `translate(${c.x + Math.sin(tAnim * 2 + c.ph) * 24} ${y}) rotate(${(tAnim * c.spin * 60 + c.ph * 57) % 360})`);
      });
    },
  },
];

// ---------- audio + UI foley ----------
let audioCtx = null;
function ensureCtx() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function tone(freq, durSec, gainVal, type) {
  if (!soundOn || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(gainVal || 0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durSec);
}

function runSceneFoley(i, prevK, k) {
  if (!soundOn || !playing || k <= prevK) return;
  const crossed = (t) => prevK < t && k >= t;
  if (i === 0) {
    if (crossed(0.22)) tone(620, 0.07, 0.025, 'sine');
    if (crossed(0.64)) tone(784, 0.08, 0.025, 'triangle');
    if (crossed(0.72)) tone(880, 0.11, 0.025, 'triangle');
  } else if (i === 1) {
    [523.25, 587.33, 659.25, 783.99].forEach((f, idx) => {
      if (crossed(0.24 + idx * 0.04)) tone(f, 0.06, 0.025, 'triangle');
    });
    if (crossed(0.42)) tone(1046, 0.05, 0.02, 'sine');
    if (crossed(0.56)) tone(1200, 0.035, 0.03, 'square');
    if (crossed(0.64)) tone(880, 0.14, 0.03, 'sine');
  } else if (i === 2) {
    if (crossed(0.16)) tone(698, 0.08, 0.02, 'sine');
    if (crossed(0.46)) tone(740, 0.09, 0.025, 'sine');
    if (crossed(0.80)) tone(988, 0.08, 0.025, 'triangle');
  } else if (i === 3) {
    if (crossed(0.82)) {
      tone(659.25, 0.09, 0.025, 'sine');
      setTimeout(() => tone(880, 0.14, 0.03, 'sine'), 80);
    }
  } else if (i === 4) {
    if (crossed(0.72)) tone(587.33, 0.1, 0.03, 'triangle');
  }
}

const clips = scenes.map((_, i) => {
  const src = (window.__VO_DATA__ && window.__VO_DATA__[i]) || `audio/vo-${i}.mp3`;
  const a = new Audio(src);
  a.preload = 'metadata';
  const entry = { audio: a, ready: false, duration: 0 };
  a.addEventListener('loadedmetadata', () => {
    entry.ready = true;
    entry.duration = Number.isFinite(a.duration) ? a.duration : 0;
  });
  a.addEventListener('error', () => {
    entry.ready = false;
  });
  return entry;
});

function effectiveDur(i) {
  const c = clips[i];
  return (soundOn && c && c.ready && c.duration > 0)
    ? Math.max(scenes[i].dur, c.duration + 0.9)
    : scenes[i].dur;
}

function getTotalDur() {
  return scenes.reduce((a, _, i) => a + effectiveDur(i), 0);
}

function stopAllClips() {
  clips.forEach((c) => {
    c.audio.pause();
    c.audio.currentTime = 0;
  });
}

function syncClip(i, offsetSec) {
  stopAllClips();
  if (!soundOn || !playing) return;
  const c = clips[i];
  if (!c || !c.ready) return;
  if (offsetSec < c.duration - 0.1) {
    c.audio.currentTime = Math.max(0, offsetSec);
    c.audio.play().catch(() => {});
  }
}

// ---------- player ----------
const stage = $('stage');
const captionBox = $('caption');
const progressEl = $('progress');
const bar = $('bar');
const timerEl = $('timer');
const dotsBox = $('dots');
const btnPlay = $('btnPlay');
const btnReplay = $('btnReplay');
const btnVoice = $('btnVoice');

let current = -1;
let state = null;
let sceneT = 0;
let playing = true;
let lastTs = 0;
let soundOn = false;

if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  playing = false;
}

const dots = scenes.map((s, i) => {
  const d = document.createElement('button');
  d.type = 'button';
  d.title = s.name;
  d.setAttribute('aria-label', `Go to scene: ${s.name}`);
  d.addEventListener('click', () => jumpTo(i));
  dotsBox.appendChild(d);
  return d;
});

function mount(i) {
  current = i;
  sceneT = 0;
  while (stage.firstChild) stage.removeChild(stage.firstChild);
  state = scenes[i].setup(stage);
  state.lastK = 0;
  captionBox.innerHTML = scenes[i].caption;
  dots.forEach((d, j) => d.classList.toggle('on', j === i));
  syncClip(i, 0);
}

function render(dt) {
  const dur = effectiveDur(current);
  const k = clamp01(sceneT / dur);
  scenes[current].frame(state, k, dt);
  if (dt > 0) runSceneFoley(current, state.lastK || 0, k);
  state.lastK = k;

  let elapsed = sceneT;
  for (let i = 0; i < current; i++) elapsed += effectiveDur(i);
  const total = getTotalDur();

  bar.style.width = `${(elapsed / total) * 100}%`;
  if (timerEl) timerEl.textContent = `${fmtTime(elapsed)} / ${fmtTime(total)}`;
  if (progressEl) {
    progressEl.setAttribute('aria-valuemax', Math.round(total));
    progressEl.setAttribute('aria-valuenow', Math.round(elapsed));
  }
}

function jumpTo(i, customT) {
  mount(i);
  sceneT = typeof customT === 'number' ? customT : (playing ? 0 : effectiveDur(i) * 0.92);
  state.lastK = clamp01(sceneT / effectiveDur(i));
  if (playing) syncClip(i, sceneT);
  render(0);
}

function seekRatio(r) {
  const target = clamp01(r) * getTotalDur();
  let acc = 0;
  for (let i = 0; i < scenes.length; i++) {
    const d = effectiveDur(i);
    if (target <= acc + d || i === scenes.length - 1) {
      jumpTo(i, target - acc);
      return;
    }
    acc += d;
  }
}

function tick(ts) {
  requestAnimationFrame(tick);
  if (current < 0) {
    mount(0);
    if (!playing) {
      sceneT = effectiveDur(0) * 0.92;
      state.lastK = 0.92;
    }
  }
  if (!lastTs) lastTs = ts;
  const dt = Math.min((ts - lastTs) / 1000, 0.1);
  lastTs = ts;
  if (playing) {
    sceneT += dt;
    if (sceneT >= effectiveDur(current)) {
      mount(current + 1 >= scenes.length ? 0 : current + 1);
    }
  }
  render(playing ? dt : 0);
}

function setPlaying(p) {
  playing = p;
  lastTs = 0;
  btnPlay.textContent = playing ? 'Pause' : 'Play';
  if (!playing) stopAllClips();
  else if (current >= 0) syncClip(current, sceneT);
}

btnPlay.addEventListener('click', () => setPlaying(!playing));
btnReplay.addEventListener('click', () => { mount(0); setPlaying(true); });

if (btnVoice) {
  btnVoice.addEventListener('click', () => {
    soundOn = !soundOn;
    btnVoice.setAttribute('aria-pressed', String(soundOn));
    btnVoice.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
    if (soundOn) {
      ensureCtx();
      if (current >= 0 && playing) syncClip(current, sceneT);
    } else {
      stopAllClips();
    }
  });
}

if (progressEl) {
  progressEl.addEventListener('click', (e) => {
    const rect = progressEl.getBoundingClientRect();
    seekRatio((e.clientX - rect.left) / rect.width);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.code === 'Space') {
    e.preventDefault();
    setPlaying(!playing);
  } else if (e.code === 'ArrowRight') {
    jumpTo((current + 1) % scenes.length);
  } else if (e.code === 'ArrowLeft') {
    jumpTo((current - 1 + scenes.length) % scenes.length);
  }
});

setPlaying(playing);
requestAnimationFrame(tick);

})();
