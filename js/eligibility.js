/* ============================================================
   NJ Army National Guard — Eligibility Checker
   js/eligibility.js
   ============================================================ */

let careersForElig = [];

/* ── Load careers data for MOS recommendations ──────────────── */
async function initEligibility() {
  try {
    const res  = await fetch('data/careers.json');
    careersForElig = await res.json();
  } catch (err) {
    console.warn('Eligibility: could not load careers.json for recommendations.');
  }

  // Wire up range sliders to display values
  const ageSlider   = document.getElementById('e-age');
  const asvabSlider = document.getElementById('e-asvab');
  const ageOut      = document.getElementById('age-display');
  const asvabOut    = document.getElementById('asvab-display');

  if (ageSlider && ageOut) {
    ageSlider.addEventListener('input', () => { ageOut.textContent = ageSlider.value; });
  }

  if (asvabSlider && asvabOut) {
    asvabSlider.addEventListener('input', () => { asvabOut.textContent = asvabSlider.value; });
  }

  // Wire up form
  const form = document.getElementById('elig-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateEligibility();
    });
  }
}

/* ── Calculate Score ─────────────────────────────────────────── */
function calculateEligibility() {
  const age   = parseInt(document.getElementById('e-age')?.value   || 25);
  const edu   = document.getElementById('e-edu')?.value   || 'hs';
  const cit   = document.getElementById('e-cit')?.value   || 'us';
  const asvab = parseInt(document.getElementById('e-asvab')?.value || 100);
  const prior = document.getElementById('e-prior')?.value || 'no';
  const cat   = document.getElementById('e-cat')?.value   || 'any';

  let score = 0;
  const notes = [];

  // ── Age ───────────────────────────────────────────────────────
  if (age >= 17 && age <= 35) {
    score += 25;
  } else if (age >= 36 && age <= 42) {
    score += 12;
    notes.push('Age waiver may be required (36–42). Talk to a recruiter.');
  } else {
    notes.push('Age outside the standard range (17–35). A waiver may be possible.');
  }

  // ── Education ─────────────────────────────────────────────────
  if (edu === 'hs' || edu === 'college') {
    score += 20;
  } else if (edu === 'ged') {
    score += 15;
    notes.push('GED is accepted with a qualifying ASVAB score.');
  } else {
    notes.push('A high school diploma or GED is required to enlist.');
  }

  // ── Citizenship ───────────────────────────────────────────────
  if (cit === 'us') {
    score += 20;
  } else if (cit === 'pr') {
    score += 15;
    notes.push('Permanent Residents may enlist. Some MOS require U.S. citizenship.');
  } else {
    notes.push('U.S. citizenship or Permanent Residency is required.');
  }

  // ── ASVAB ─────────────────────────────────────────────────────
  if (asvab >= 110) {
    score += 35;
    notes.push('Excellent score — qualifies for nearly every MOS, including Cyber and Special Forces.');
  } else if (asvab >= 100) {
    score += 28;
    notes.push('Strong score — qualifies for advanced Intelligence and Tech roles.');
  } else if (asvab >= 90) {
    score += 20;
    notes.push('Good score — qualifies for most MOS positions.');
  } else if (asvab >= 80) {
    score += 10;
    notes.push('Meets minimum threshold — qualifies for select Combat and Support roles.');
  } else {
    notes.push('Below the minimum ASVAB threshold. Consider ASVAB prep resources before testing.');
  }

  // ── Prior Service bonus ───────────────────────────────────────
  if (prior === 'active') {
    score = Math.min(100, score + 5);
    notes.push('Prior active duty service — rank and benefits may transfer directly to the Guard.');
  } else if (prior === 'ng' || prior === 'reserve') {
    score = Math.min(100, score + 3);
    notes.push('Prior Guard/Reserve service — your experience is a strong asset.');
  }

  const pct = Math.min(100, score);
  displayEligibilityResult(pct, notes, asvab, cat);
}

/* ── Display Results ─────────────────────────────────────────── */
function displayEligibilityResult(pct, notes, asvab, cat) {
  // Determine status
  let status, color;
  if (pct >= 80)      { status = 'Highly Eligible';       color = '#70c98b'; }
  else if (pct >= 60) { status = 'Likely Eligible';        color = 'var(--gold)'; }
  else if (pct >= 40) { status = 'Potentially Eligible';   color = '#c9a870'; }
  else                { status = 'May Need Waiver';         color = '#c97070'; }

  // Main message
  const mainMsg =
    pct >= 80 ? 'You meet the standard requirements for enlistment in the NJ Army National Guard. Connect with a recruiter to take the next step.' :
    pct >= 60 ? 'You likely qualify for enlistment. A recruiter can confirm your details and walk you through the next steps.' :
                'You may qualify with waivers or by improving your ASVAB score. A recruiter can help identify the best path forward.';

  // MOS recommendations
  const catFilter = (cat === 'any') ? null : cat;
  const recs = careersForElig.filter(c => {
    if (catFilter && c.cat !== catFilter) return false;
    const req = parseInt((c.asvab.match(/\d+/) || [0])[0]);
    return asvab >= req;
  }).sort((a, b) => b.bonus - a.bonus).slice(0, 3);

  // Update DOM
  const scoreEl  = document.getElementById('elig-score');
  const statusEl = document.getElementById('elig-status');
  const msgEl    = document.getElementById('elig-msg');
  const recsEl   = document.getElementById('elig-recs');
  const resultEl = document.getElementById('elig-result');

  if (scoreEl)  { scoreEl.textContent  = pct + '%'; scoreEl.style.color = color; }
  if (statusEl) { statusEl.textContent = status;    statusEl.style.color = color; }

  if (msgEl) {
    const note = notes.length ? ' ' + notes[0] : '';
    msgEl.textContent = mainMsg + note;
  }

  if (recsEl) {
    recsEl.innerHTML = recs.map(c => `
      <div class="elig-rec-card" onclick="showMOSModal('${c.mos}')" role="button" tabindex="0"
           aria-label="View MOS ${c.mos}">
        <div class="elig-rec-mos">MOS ${c.mos}</div>
        <div class="elig-rec-title">${c.title}</div>
      </div>
    `).join('');
  }

  if (resultEl) {
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ── Expose globally ─────────────────────────────────────────── */
window.initEligibility        = initEligibility;
window.calculateEligibility   = calculateEligibility;
