/* ============================================================
   NJ Army National Guard — MOS Explorer
   js/mos.js
   ============================================================ */

let allCareers  = [];
let currentCat  = 'all';
let currentSearch = '';
let currentMOS  = null;

/* ── Load & Init ────────────────────────────────────────────── */
async function initMOS() {
  try {
    const res = await fetch('data/careers.json');
    allCareers = await res.json();
    renderMOS();
  } catch (err) {
    console.error('Failed to load careers.json:', err);
    document.getElementById('mos-grid').innerHTML =
      '<p style="color:var(--tan);font-size:.85rem">Could not load career data. Make sure careers.json is in the /data/ folder.</p>';
  }

  // Search input
  const searchInput = document.getElementById('mos-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      renderMOS();
    });
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCat = btn.dataset.cat || 'all';
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMOS();
    });
  });
}

/* ── Render MOS Grid ────────────────────────────────────────── */
function renderMOS() {
  const grid  = document.getElementById('mos-grid');
  const count = document.getElementById('mos-count');
  if (!grid) return;

  const q = currentSearch.toLowerCase();

  const filtered = allCareers.filter(c => {
    const catOk    = currentCat === 'all' || c.cat === currentCat;
    const searchOk = !q || (
      c.mos.toLowerCase().includes(q)   ||
      c.title.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)  ||
      c.cat.toLowerCase().includes(q)
    );
    return catOk && searchOk;
  });

  if (count) {
    count.textContent = `Showing ${filtered.length} of ${allCareers.length} careers`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--tan);">
        <div style="font-size:2rem;margin-bottom:1rem;opacity:.3">🔍</div>
        <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase">No results found</p>
        <p style="font-size:.82rem;margin-top:.5rem;font-weight:300">Try a different search term or category</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => `
    <div class="mos-card" onclick="showMOSModal('${c.mos}')" role="button" tabindex="0"
         aria-label="View details for MOS ${c.mos} ${c.title}">
      <div class="mos-card-head">
        <span class="mos-code">${c.mos}</span>
        ${c.bonus ? '<span class="bonus-badge">BONUS</span>' : ''}
      </div>
      <span class="cat-badge cat-${c.cat}">${c.cat}</span>
      <h4>${c.title}</h4>
      <p>${c.desc}</p>
      <div class="mos-card-meta">
        <span>ASVAB: ${c.asvab}</span>
        <span>${c.training}</span>
      </div>
    </div>
  `).join('');

  // Keyboard support
  grid.querySelectorAll('.mos-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });
}

/* ── MOS Detail Modal ───────────────────────────────────────── */
function showMOSModal(mosCode) {
  const c = allCareers.find(x => x.mos === mosCode);
  if (!c) return;

  currentMOS = c;

  // Populate modal fields
  document.getElementById('mos-modal-cat').innerHTML =
    `<span class="cat-badge cat-${c.cat}">${c.cat}</span>`;
  document.getElementById('mos-modal-title').textContent    = c.title;
  document.getElementById('mos-modal-code').textContent     = `MOS ${c.mos}`;
  document.getElementById('mos-modal-desc').textContent     = c.desc;
  document.getElementById('mos-modal-asvab').textContent    = c.asvab;
  document.getElementById('mos-modal-training').textContent = c.training;

  const bonusBar = document.getElementById('mos-modal-bonus');
  if (bonusBar) {
    bonusBar.style.display = c.bonus ? 'block' : 'none';
  }

  openModal('mos');
}

// Expose globally
window.initMOS      = initMOS;
window.showMOSModal = showMOSModal;
window.filterMOS    = filterMOS;

function filterMOS(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMOS();
}
