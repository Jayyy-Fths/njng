/* ============================================================
   NJ Army National Guard — Armories & Map
   js/armories.js
   ============================================================ */

let allArmories  = [];
let activeArmory = null;

/* ── NJ Map SVG Coordinates (pre-computed for the SVG viewBox) ── */
// viewBox: "0 0 320 520"
// These are pixel positions for each armory on the NJ outline SVG
const MAP_COORDS = {
  morristown:  { x: 118, y: 115 },
  teaneck:     { x: 155, y: 82  },
  hackettstown:{ x: 80,  y: 92  },
  flemington:  { x: 95,  y: 168 },
  trenton:     { x: 120, y: 225 },
  lakewood:    { x: 165, y: 270 },
  jbmdl:       { x: 130, y: 295 },
  fortdix:     { x: 138, y: 300 },
  seagirt:     { x: 180, y: 258 },
  vineland:    { x: 125, y: 370 },
  eggharbor:   { x: 175, y: 390 },
};

/* ── Load & Init ─────────────────────────────────────────────── */
async function initArmories() {
  try {
    const res  = await fetch('data/armories.json');
    allArmories = await res.json();
    renderArmoryList();
    renderArmoryMap();
  } catch (err) {
    console.error('Failed to load armories.json:', err);
    const list = document.getElementById('armory-list');
    if (list) list.innerHTML = '<p style="color:var(--tan)">Could not load armory data.</p>';
  }
}

/* ── Render Armory List ──────────────────────────────────────── */
function renderArmoryList() {
  const list = document.getElementById('armory-list');
  if (!list) return;

  list.innerHTML = allArmories.map(a => `
    <li class="armory-item" id="armory-item-${a.id}"
        onclick="selectArmory('${a.id}')"
        role="button" tabindex="0"
        aria-label="Select ${a.name}">
      <div class="armory-item-head">
        <span class="armory-name">${a.name}</span>
        <span class="armory-drill-badge">${a.drill}</span>
      </div>
      <p class="armory-addr">📍 ${a.address}</p>
      <p class="armory-recruiter">Recruiter: ${a.recruiter}</p>
      <a class="armory-phone" href="tel:${a.phone}" onclick="event.stopPropagation()">${a.phone}</a>
    </li>
  `).join('');

  // Keyboard support
  list.querySelectorAll('.armory-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') item.click();
    });
  });
}

/* ── Render SVG Map ──────────────────────────────────────────── */
function renderArmoryMap() {
  const mapEl = document.getElementById('armory-map');
  if (!mapEl) return;

  // NJ outline path (approximated polygon)
  const njPath = `M 195 22
    L 210 28 L 228 55 L 240 98 L 248 135 L 250 172
    L 244 208 L 232 242 L 215 278 L 195 312 L 168 342
    L 142 368 L 112 388 L 82 400 L 60 392 L 48 362
    L 56 332 L 75 298 L 80 260 L 68 218 L 64 178
    L 72 138 L 92 100 L 116 65 L 145 36 Z`;

  // Generate dots for each armory
  const dots = allArmories.map(a => {
    const coord = MAP_COORDS[a.id];
    if (!coord) return '';
    return `
      <g class="map-dot-group" onclick="selectArmory('${a.id}')"
         style="cursor:pointer" id="map-dot-${a.id}">
        <circle cx="${coord.x}" cy="${coord.y}" r="8"
                fill="rgba(201,160,42,0.15)"
                class="map-dot-pulse"/>
        <circle cx="${coord.x}" cy="${coord.y}" r="5"
                fill="rgba(201,160,42,0.7)"
                class="map-dot"
                stroke="rgba(201,160,42,0.4)" stroke-width="1"/>
        <title>${a.name}</title>
      </g>`;
  }).join('');

  mapEl.innerHTML = `
    <svg viewBox="0 0 320 520" xmlns="http://www.w3.org/2000/svg"
         style="width:100%;display:block" role="img"
         aria-label="Map of New Jersey showing armory locations">

      <defs>
        <style>
          .map-dot-group:hover .map-dot { fill: var(--gold); r: 7; }
          .map-dot { transition: all 0.2s; }
          .map-dot-group.active-dot .map-dot { fill: var(--gold); }
          .map-dot-group.active-dot .map-dot-pulse {
            fill: rgba(201,160,42,0.25);
            r: 12;
          }
          @keyframes pulse {
            0%,100% { r: 8; opacity: 0.3; }
            50%      { r: 14; opacity: 0.1; }
          }
          .active-dot .map-dot-pulse { animation: pulse 1.5s infinite; }
        </style>
      </defs>

      <!-- NJ state outline -->
      <path d="${njPath}"
            fill="rgba(74,92,58,0.22)"
            stroke="rgba(201,160,42,0.35)"
            stroke-width="1.5"
            stroke-linejoin="round"/>

      <!-- State label -->
      <text x="155" y="195"
            font-family="Oswald, sans-serif"
            font-size="16" font-weight="700"
            fill="rgba(201,160,42,0.1)"
            text-anchor="middle"
            letter-spacing="3">NJ</text>

      <!-- Armory dots -->
      ${dots}
    </svg>
  `;

  // Default detail text
  const detail = document.getElementById('armory-map-detail');
  if (detail) {
    detail.innerHTML = `
      <p class="map-detail-info" style="text-align:center;opacity:.6">
        Click an armory on the list or map dot to see details
      </p>`;
  }
}

/* ── Select Armory ───────────────────────────────────────────── */
function selectArmory(id) {
  const a = allArmories.find(x => x.id === id);
  if (!a) return;

  activeArmory = a;

  // Update list active state
  document.querySelectorAll('.armory-item').forEach(el => el.classList.remove('active'));
  const listItem = document.getElementById(`armory-item-${id}`);
  if (listItem) {
    listItem.classList.add('active');
    listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Update map dot active state
  document.querySelectorAll('.map-dot-group').forEach(el => el.classList.remove('active-dot'));
  const dot = document.getElementById(`map-dot-${id}`);
  if (dot) dot.classList.add('active-dot');

  // Update map detail panel
  const detail = document.getElementById('armory-map-detail');
  if (detail) {
    const units = (a.units || []).join(', ');
    detail.innerHTML = `
      <div class="map-detail-name">${a.name}</div>
      <div class="map-detail-info">
        <div>📍 ${a.address}</div>
        <div style="margin-top:.25rem">🕐 Drill: ${a.drill}</div>
        <div style="margin-top:.25rem">👤 Recruiter: ${a.recruiter}</div>
        ${units ? `<div style="margin-top:.25rem">🏷️ ${units}</div>` : ''}
        <div style="margin-top:.5rem">
          <a href="tel:${a.phone}" class="armory-phone">${a.phone}</a>
        </div>
      </div>
    `;
  }
}

/* ── Region Filter ───────────────────────────────────────────── */
function filterArmories(region) {
  const items = document.querySelectorAll('.armory-item');
  items.forEach(item => {
    const id  = item.id.replace('armory-item-', '');
    const arm = allArmories.find(a => a.id === id);
    if (!arm) return;
    item.style.display = (region === 'all' || arm.region === region) ? '' : 'none';
  });
}

/* ── Expose globally ─────────────────────────────────────────── */
window.initArmories    = initArmories;
window.selectArmory    = selectArmory;
window.filterArmories  = filterArmories;
