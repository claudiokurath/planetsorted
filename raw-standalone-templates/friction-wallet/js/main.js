// ===== Header scroll state =====
const header = document.getElementById('site-header');
function updateHeader() {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
updateHeader();
window.addEventListener('scroll', updateHeader);

// ===== Mobile menu =====
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  const icon = menuToggle.querySelector('i');
  if (mobileMenu.classList.contains('hidden')) {
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  } else {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-xmark');
  }
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    const icon = menuToggle.querySelector('i');
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  });
});

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Heart-rate demo simulation =====
const hrSlider = document.getElementById('hr-slider');
const hrValue = document.getElementById('hr-value');
const statusBadge = document.getElementById('demo-status-badge');
const demoIcon = document.getElementById('demo-icon');
const demoTitle = document.getElementById('demo-title');
const demoDesc = document.getElementById('demo-desc');
const breathingWrap = document.getElementById('breathing-wrap');
const THRESHOLD = 110;

function renderSliderTrack(val) {
  const min = parseInt(hrSlider.min, 10);
  const max = parseInt(hrSlider.max, 10);
  const pct = ((val - min) / (max - min)) * 100;
  hrSlider.style.background = `linear-gradient(to right, #14b8a6, #14b8a6 ${pct}%, rgba(255,92,92,0.35) ${pct}%, rgba(255,92,92,0.35) 100%)`;
}

function updateDemo() {
  const val = parseInt(hrSlider.value, 10);
  hrValue.textContent = val + ' bpm';
  renderSliderTrack(val);

  if (val > THRESHOLD) {
    statusBadge.textContent = 'Paused';
    statusBadge.classList.remove('status-ok');
    statusBadge.classList.add('status-paused');

    demoIcon.classList.remove('bg-teal-400/15', 'text-teal-300');
    demoIcon.classList.add('bg-coral-500/15', 'text-coral-400');
    demoIcon.innerHTML = '<i class="fa-solid fa-heart-pulse"></i>';

    demoTitle.textContent = 'Transaction Paused: Complete 1-minute breathing to unlock.';
    demoDesc.textContent = 'Stress marker detected above your ' + THRESHOLD + ' bpm threshold. Take a breath before you spend.';
    breathingWrap.classList.remove('hidden');
  } else {
    statusBadge.textContent = 'Authorized';
    statusBadge.classList.remove('status-paused');
    statusBadge.classList.add('status-ok');

    demoIcon.classList.remove('bg-coral-500/15', 'text-coral-400');
    demoIcon.classList.add('bg-teal-400/15', 'text-teal-300');
    demoIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

    demoTitle.textContent = 'Transaction Authorized';
    demoDesc.textContent = 'Your heart rate is within range — spend with confidence.';
    breathingWrap.classList.add('hidden');
  }
}

hrSlider.addEventListener('input', updateDemo);
updateDemo();

// ===== FAQ accordion =====
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      }
    });
    if (isOpen) {
      item.classList.remove('open');
      answer.style.maxHeight = null;
    } else {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});
