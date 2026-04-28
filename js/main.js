/* ============================================================
   NJ Army National Guard — Main JS
   js/main.js
   ============================================================ */

/* ── Scroll Progress ────────────────────────────────────────── */
function updateScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = Math.min(pct, 100) + '%';
}

/* ── Mobile Nav ─────────────────────────────────────────────── */
function toggleMobileMenu() {
  const mm = document.getElementById('mobile-menu');
  if (mm) mm.classList.toggle('open');
}

function closeMobileMenu() {
  const mm = document.getElementById('mobile-menu');
  if (mm) mm.classList.remove('open');
}

/* ── Modals ─────────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id + '-modal') || document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id + '-modal') || document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

/* ── Toast Notification ─────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Smooth Scroll for anchor links ─────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Contact Form ───────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    const success = document.getElementById('contact-success');
    if (success) success.style.display = 'block';
  });
}

/* ── Image Lazy Load helper ─────────────────────────────────── */
function initLazyImages() {
  // Auto-detects images with data-src and loads them on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.onload = () => img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  }, { rootMargin: '100px' });

  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

/* ── Reveal animations ──────────────────────────────────────── */
function initRevealAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    [data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
    [data-reveal].revealed { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateScrollProgress();
  initSmoothScroll();
  initContactForm();
  initLazyImages();
  initRevealAnimations();

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    closeMobileMenu();
  }, { passive: true });
});

/* ── FAQ Toggle ─────────────────────────────────────────────── */
function toggleFAQ(btn) {
  const answer = btn.nextElementSibling;
  const arrow  = btn.querySelector('.faq-arrow');
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    const prevArrow = a.previousElementSibling.querySelector('.faq-arrow');
    if (prevArrow) prevArrow.style.transform = '';
  });
  if (!isOpen) {
    answer.classList.add('open');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
}

// Expose globally for inline onclick handlers
window.openModal        = openModal;
window.closeModal       = closeModal;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu  = closeMobileMenu;
window.showToast        = showToast;
window.toggleFAQ        = toggleFAQ;
