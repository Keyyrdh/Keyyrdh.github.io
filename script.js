/* ---------- Custom cursor: pixel cat ---------- */
const cursorCat = document.getElementById('cursorCat');
const catCanvas = document.getElementById('cursorCatCanvas');

if (cursorCat && catCanvas && window.matchMedia('(pointer: fine)').matches) {
  const ctx = catCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let catX = mouseX, catY = mouseY;
  let lastMoveTime = Date.now();
  let lastMoveForSpin = Date.now();
  let lastAngle = null;
  let spinAccum = 0;
  let tempState = null;
  let tempUntil = 0;

  const IDLE_MS = 2500;           // no movement for this long -> quack
  const SPIN_THRESHOLD = Math.PI * 4; // ~720 degrees of accumulated turning -> dizzy
  const DIZZY_DURATION = 1200;
  const HAPPY_DURATION = 500;

  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX, ny = e.clientY;
    const dx = nx - mouseX, dy = ny - mouseY;
    const dist = Math.hypot(dx, dy);

    if (dist > 1.5) {
      const angle = Math.atan2(dy, dx);
      if (lastAngle !== null) {
        let delta = angle - lastAngle;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        spinAccum += Math.abs(delta);
      }
      lastAngle = angle;
    }

    mouseX = nx;
    mouseY = ny;
    lastMoveTime = Date.now();
    lastMoveForSpin = Date.now();

    if (spinAccum > SPIN_THRESHOLD) {
      tempState = 'dizzy';
      tempUntil = Date.now() + DIZZY_DURATION;
      spinAccum = 0;
    }
  });

  // Decay the spin accumulator if the mouse pauses mid-turn, so slow
  // deliberate movement doesn't eventually false-trigger dizziness.
  setInterval(() => {
    if (Date.now() - lastMoveForSpin > 400) {
      spinAccum *= 0.5;
      if (spinAccum < 0.05) spinAccum = 0;
    }
  }, 300);

  document.addEventListener('click', () => {
    tempState = 'happy';
    tempUntil = Date.now() + HAPPY_DURATION;
  });

  function drawArcEye(x, y, upward) {
    ctx.beginPath();
    if (upward) ctx.arc(x, y, 1.4, Math.PI, 0);
    else ctx.arc(x, y, 1.4, 0, Math.PI);
    ctx.stroke();
  }

  function drawXEye(x, y) {
    ctx.beginPath();
    ctx.moveTo(x - 1.2, y - 1.2);
    ctx.lineTo(x + 1.2, y + 1.2);
    ctx.moveTo(x + 1.2, y - 1.2);
    ctx.lineTo(x - 1.2, y + 1.2);
    ctx.stroke();
  }

  function duckPath() {
    ctx.moveTo(14.5, 9.3);
    ctx.arc(8, 9.3, 6.5, 0, Math.PI * 2);
  }

  function drawSilhouette(dx, dy, color) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = color;
    ctx.beginPath();
    duckPath();
    ctx.fill();
    ctx.restore();
  }

  function drawDuck(state) {
    const body = '#ffd447';
    const shadow = '#f3c05f';
    const beak = '#ff9f1c';
    const outline = '#1a1a1a';
    const blush = '#f4a0ac';

    ctx.clearRect(0, 0, 18, 18);

    // warm shadow copy, offset down-right (the "sticker" look)
    drawSilhouette(1, 1, shadow);

    // true-position yellow fill + black outline
    drawSilhouette(0, 0, body);
    ctx.beginPath();
    duckPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = outline;
    ctx.stroke();

    // small feather tuft on top
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(8.5, 3);
    ctx.quadraticCurveTo(9.5, 0.5, 11, 1);
    ctx.quadraticCurveTo(9.5, 2, 9, 3.6);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = outline;
    ctx.stroke();

    ctx.fillStyle = outline;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1;

    if (state === 'happy') {
      drawArcEye(5.2, 8.5, true);
      drawArcEye(10.8, 8.5, true);
      // open beak
      ctx.fillStyle = beak;
      ctx.beginPath();
      ctx.ellipse(8, 11.4, 3.2, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, 13, 2.6, 1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = blush;
      ctx.fillRect(2.4, 10.2, 1.6, 1.2);
      ctx.fillRect(12, 10.2, 1.6, 1.2);
    } else if (state === 'dizzy') {
      drawXEye(5.2, 8.5);
      drawXEye(10.8, 8.5);
      ctx.fillStyle = beak;
      ctx.beginPath();
      ctx.ellipse(8, 12, 3, 1.4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else if (state === 'quack') {
      drawArcEye(5.2, 8.5, true);
      drawArcEye(10.8, 8.5, true);
      // wide-open quacking beak
      ctx.fillStyle = beak;
      ctx.beginPath();
      ctx.ellipse(8, 11.2, 3.4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, 13.4, 2.8, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#c96b3a';
      ctx.beginPath();
      ctx.ellipse(8, 12.3, 1.6, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // resting state: plain black dot eyes + closed flat beak
      ctx.fillRect(4.4, 7.4, 1.6, 1.6);
      ctx.fillRect(10, 7.4, 1.6, 1.6);
      ctx.fillStyle = beak;
      ctx.beginPath();
      ctx.ellipse(8, 12, 3.2, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4.8, 12);
      ctx.lineTo(11.2, 12);
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  function loop() {
    catX += (mouseX - catX) * 0.25;
    catY += (mouseY - catY) * 0.25;
    cursorCat.style.left = catX + 'px';
    cursorCat.style.top = catY + 'px';

    const now = Date.now();
    let state;
    if (now < tempUntil) {
      state = tempState;
    } else if (now - lastMoveTime > IDLE_MS) {
      state = 'quack';
    } else {
      state = 'normal';
    }

    drawDuck(state);
    cursorCat.classList.toggle('is-quacking', state === 'quack');

    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- Scroll progress bar ---------- */
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress);
updateProgress();

/* ---------- Live clock ---------- */
const clockEl = document.getElementById('clock');
function updateClock() {
  if (!clockEl) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ---------- Typing effect ---------- */
const typedEl = document.getElementById('typed');
const roles = ['code.', 'design.', 'edit videos.', 'figure things out.'];
let roleIndex = 0, charIndex = 0, isDeleting = false;

function typeLoop() {
  if (!typedEl) return;
  const currentRole = roles[roleIndex];

  if (!isDeleting) {
    typedEl.textContent = currentRole.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    typedEl.textContent = currentRole.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, isDeleting ? 45 : 85);
}
typeLoop();

/* ---------- Particle background (hero canvas) ---------- */
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let hero = canvas.parentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function initParticles() {
    const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.18 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  initParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });
}

/* ---------- Scroll-reveal for sections ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------- Active nav link tracking ---------- */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(sec => navObserver.observe(sec));

/* ---------- Animated stat counters ---------- */
const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const duration = 1200;
      const startTime = performance.now();

      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        current = Math.floor(progress * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObserver.observe(el));

/* ---------- Animated skill rings ---------- */
const ringFills = document.querySelectorAll('.ring-fill');
const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

const ringObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const circle = entry.target;
      const pct = parseFloat(circle.dataset.pct);
      const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
      circle.style.strokeDasharray = `${CIRCUMFERENCE}`;
      circle.style.strokeDashoffset = `${offset}`;
      ringObserver.unobserve(circle);
    }
  });
}, { threshold: 0.5 });
ringFills.forEach(circle => ringObserver.observe(circle));

/* ---------- 3D tilt effect on project cards ---------- */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
});

/* ---------- Copy to clipboard (email, phone, etc.) ---------- */
document.querySelectorAll('.copy-btn').forEach(btn => {
  const hint = btn.querySelector('.copy-btn__hint');
  const originalHint = hint ? hint.textContent : '';

  btn.addEventListener('click', async () => {
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      btn.classList.add('is-copied');
      if (hint) hint.textContent = 'copied!';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        if (hint) hint.textContent = originalHint;
      }, 1800);
    } catch (err) {
      if (hint) hint.textContent = 'copy failed — select manually';
    }
  });
});