(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); btn.setAttribute('aria-expanded', false);
  }));

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (el.closest('.hero') ? i * 70 : 0) + 'ms';
    io.observe(el);
  });

  /* ---------- lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('.zoomable').forEach(f => f.addEventListener('click', () => {
    const img = f.querySelector('img'); lbImg.src = img.src; lbImg.alt = img.alt; lb.hidden = false;
  }));
  const close = () => { lb.hidden = true; };
  lb.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* ---------- point-cloud building ---------- */
  const cv = document.getElementById('cloud');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const pts = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  // building dims (x: width, y: height, z: depth)
  const W = 1.5, D = 1.0, H = 0.95, R = 0.62; // R = roof rise
  const edge = (a, b, n, k) => { for (let i = 0; i < n; i++) { const t = Math.random(); pts.push([a[0] + (b[0] - a[0]) * t + rand(-.008, .008), a[1] + (b[1] - a[1]) * t + rand(-.008, .008), a[2] + (b[2] - a[2]) * t + rand(-.008, .008), k]); } };
  const box = []; for (const x of [-W, W]) for (const z of [-D, D]) box.push([x, z]);
  // vertical corners + base + eaves
  for (const [x, z] of box) edge([x, 0, z], [x, H, z], 70, 0);
  for (const y of [0, H]) { edge([-W, y, D], [W, y, D], 150, 0); edge([-W, y, -D], [W, y, -D], 150, 0); edge([W, y, -D], [W, y, D], 100, 0); edge([-W, y, -D], [-W, y, D], 100, 0); }
  // gable + ridge
  for (const x of [-W, W]) { edge([x, H, D], [x, H + R, 0], 80, 1); edge([x, H, -D], [x, H + R, 0], 80, 1); }
  edge([-W, H + R, 0], [W, H + R, 0], 170, 1);
  // windows + door outlines on front face
  const rect = (x0, x1, y0, y1, z) => { edge([x0, y0, z], [x1, y0, z], 18, 0); edge([x0, y1, z], [x1, y1, z], 18, 0); edge([x0, y0, z], [x0, y1, z], 18, 0); edge([x1, y0, z], [x1, y1, z], 18, 0); };
  for (const c of [-1.0, -0.45, 0.45, 1.0]) { rect(c - .14, c + .14, .5, .78, D); rect(c - .14, c + .14, .5, .78, -D); }
  rect(-.15, .15, 0, .45, D);
  for (const c of [-0.5, 0.5]) { const z0 = c - .14, z1 = c + .14; for (const x of [-W, W]) { edge([x, .5, z0], [x, .5, z1], 14, 0); edge([x, .78, z0], [x, .78, z1], 14, 0); edge([x, .5, z0], [x, .78, z0], 14, 0); edge([x, .5, z1], [x, .78, z1], 14, 0); } }
  // sparse wall surfaces
  for (let i = 0; i < 900; i++) {
    const f = Math.floor(Math.random() * 4), v = rand(0, H);
    if (f < 2) pts.push([rand(-W, W), v, f ? D : -D, 3]); else pts.push([f === 2 ? W : -W, v, rand(-D, D), 3]);
  }
  // roof surfaces (denser, warm)
  for (let i = 0; i < 1400; i++) {
    const s = Math.random() < .5 ? 1 : -1, t = rand(0, 1);
    pts.push([rand(-W, W), H + R * (1 - t), s * t * D, 1]);
  }
  // chimney
  const ch = [.8, .4], cw = .1;
  for (const [dx, dz] of [[-cw, -cw], [cw, -cw], [cw, cw], [-cw, cw]]) edge([ch[0] + dx, H + .18, ch[1] + dz], [ch[0] + dx, H + .72, ch[1] + dz], 22, 1);
  // ground scatter
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * Math.PI * 2; const r = Math.sqrt(Math.random()) * 2.2;
    pts.push([Math.cos(a) * r, 0, Math.sin(a) * r * 0.9, 2]);
  }
  // center vertically
  pts.forEach(p => { p[1] -= 0.7; });

  let w, h, dpr;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize(); window.addEventListener('resize', resize);

  let yaw = 0.6, pitch = 0.28, vel = reduce ? 0 : 0.0028, dragging = false, lx = 0, ly = 0;
  cv.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    yaw += (e.clientX - lx) * 0.008; pitch = Math.max(-0.1, Math.min(1.1, pitch + (e.clientY - ly) * 0.005));
    lx = e.clientX; ly = e.clientY;
  });
  const up = () => { dragging = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  // colour ramps
  const sand = [216, 195, 160], cyan = [124, 196, 216], slate = [90, 100, 120];
  const mix = (a, b, t) => `${a[0] + (b[0] - a[0]) * t | 0},${a[1] + (b[1] - a[1]) * t | 0},${a[2] + (b[2] - a[2]) * t | 0}`;

  const proj = new Array(pts.length);
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);

  const frame = () => {
    if (visible) {
      if (!dragging) yaw += vel;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(w, h) * 0.19, cx = w / 2, cyy = h / 2 + h * 0.04;
      for (let i = 0; i < pts.length; i++) {
        const [x, y, z, k] = pts[i];
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const persp = 4.2 / (4.2 + z2);
        proj[i] = [cx + x1 * scale * persp, cyy - y2 * scale * persp, z2, k, y];
      }
      proj.sort((a, b) => b[2] - a[2]);
      ctx.clearRect(0, 0, w, h);
      for (const [px, py, z, k, y] of proj) {
        const depth = Math.max(0, Math.min(1, (z + 2.2) / 4.4)); // 0 near, 1 far
        const alpha = 0.95 - depth * 0.7;
        const t = Math.max(0, Math.min(1, (y + 0.7) / 2.2));
        const col = k === 2 ? mix(slate, cyan, 0.15) : k === 1 ? mix(sand, cyan, depth * .25) : mix(cyan, sand, t * .6);
        const size = (k === 2 || k === 3 ? 1.3 : 1.9) * (1.3 - depth * .5);
        ctx.fillStyle = `rgba(${col},${k === 2 ? alpha * .4 : k === 3 ? alpha * .35 : alpha})`;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
