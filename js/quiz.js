/* ============================================================
   NJ Army National Guard — Mission Match Quiz
   js/quiz.js
   ============================================================ */

let quizData    = null;
let quizScores  = {};
let currentQ    = 0;

/* ── Load & Init ────────────────────────────────────────────── */
async function initQuiz() {
  try {
    const res = await fetch('data/quiz.json');
    quizData  = await res.json();
    renderQuiz();
  } catch (err) {
    console.error('Failed to load quiz.json:', err);
    const w = document.getElementById('quiz-wrapper');
    if (w) w.innerHTML = '<p style="color:var(--tan)">Could not load quiz data.</p>';
  }
}

/* ── Render Quiz ────────────────────────────────────────────── */
function renderQuiz() {
  const wrapper = document.getElementById('quiz-wrapper');
  if (!wrapper || !quizData) return;

  // Reset scores
  quizScores = {};
  Object.keys(quizData.results).forEach(k => quizScores[k] = 0);
  currentQ = 0;

  // Build HTML
  const stepsHTML = quizData.questions.map((q, i) => `
    <div class="quiz-step ${i === 0 ? 'active' : ''}" id="quiz-step-${i}">
      <span class="quiz-q-icon">${q.icon}</span>
      <div class="quiz-q-num">Question ${i + 1} of ${quizData.questions.length}</div>
      <div class="quiz-q-text">${q.text}</div>
      <div class="quiz-answers">
        ${q.answers.map((a, ai) => `
          <button class="quiz-answer-btn"
                  onclick="selectAnswer(${i}, ${ai})"
                  data-q="${i}" data-a="${ai}">
            ${a.text}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  const resultCats = Object.entries(quizData.results).map(([key, r]) => `
    <div class="quiz-step" id="quiz-result-${key}">
      <div class="quiz-result-icon">${r.icon}</div>
      <div class="quiz-result-label">Your Best Match</div>
      <div class="quiz-result-title" style="color:${r.color}">${r.label}</div>
      <p class="quiz-result-desc">${r.desc}</p>
      <div class="quiz-result-mos">
        ${r.topMOS.map(m => `<button class="quiz-mos-pill" onclick="showMOSModal('${m}')">${m}</button>`).join('')}
      </div>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <button class="btn-primary" onclick="openModal('contact')">Talk to a Recruiter →</button>
        <button class="btn-outline" onclick="resetQuiz()">Retake Quiz</button>
      </div>
    </div>
  `).join('');

  wrapper.innerHTML = `
    <div class="quiz-progress-bar">
      <div class="quiz-progress-fill" id="quiz-progress" style="width:0%"></div>
    </div>
    ${stepsHTML}
    ${resultCats}
  `;
}

/* ── Answer Selection ───────────────────────────────────────── */
function selectAnswer(qIndex, aIndex) {
  const q = quizData.questions[qIndex];
  const a = q.answers[aIndex];

  // Highlight selected
  document.querySelectorAll(`[data-q="${qIndex}"]`).forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-q="${qIndex}"][data-a="${aIndex}"]`).classList.add('selected');

  // Add scores
  if (a.scores) {
    Object.entries(a.scores).forEach(([cat, pts]) => {
      quizScores[cat] = (quizScores[cat] || 0) + pts;
    });
  }

  // Short delay for visual feedback, then advance
  setTimeout(() => advanceQuiz(qIndex), 350);
}

/* ── Advance Quiz ───────────────────────────────────────────── */
function advanceQuiz(qIndex) {
  // Hide current step
  const currentStep = document.getElementById(`quiz-step-${qIndex}`);
  if (currentStep) currentStep.classList.remove('active');

  currentQ = qIndex + 1;

  if (currentQ < quizData.questions.length) {
    // Next question
    const nextStep = document.getElementById(`quiz-step-${currentQ}`);
    if (nextStep) nextStep.classList.add('active');

    // Update progress bar
    const pct = (currentQ / quizData.questions.length) * 100;
    const bar = document.getElementById('quiz-progress');
    if (bar) bar.style.width = pct + '%';
  } else {
    // Show result
    const bar = document.getElementById('quiz-progress');
    if (bar) bar.style.width = '100%';

    const topCat = Object.entries(quizScores).sort((a, b) => b[1] - a[1])[0][0];
    const resultEl = document.getElementById(`quiz-result-${topCat}`);
    if (resultEl) resultEl.classList.add('active');
  }
}

/* ── Reset Quiz ─────────────────────────────────────────────── */
function resetQuiz() {
  renderQuiz();
}

/* ── Expose globally ────────────────────────────────────────── */
window.initQuiz      = initQuiz;
window.selectAnswer  = selectAnswer;
window.advanceQuiz   = advanceQuiz;
window.resetQuiz     = resetQuiz;
