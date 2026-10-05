/* ════════════════════════════════════════════════
   ANIMATION 1 — Pb–Pb collision
   ════════════════════════════════════════════════ */
(function pbpb() {
  const canvas = document.getElementById('pbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const CW = 560, CH = 300;
  canvas.width = CW * dpr; canvas.height = CH * dpr;
  ctx.scale(dpr, dpr);
  const CX = CW / 2, CY = CH / 2;
  const CYCLE = 280;

  /* Seeded RNG for deterministic tracks */
  let _s = 42;
  const rnd = () => { _s = (_s * 1664525 + 1013904223) & 0xffffffff; return (_s >>> 0) / 4294967296; };

  const photons = Array.from({length: 5}, () => ({ angle: rnd() * Math.PI * 2, woff: rnd() * 6.28 }));
  const hadrons = Array.from({length: 22}, () => ({ angle: rnd() * Math.PI * 2, frac: 0.55 + rnd() * 0.42 }));

  _s = 137;
  const nucs = Array.from({length: 30}, () => ({ r: rnd() * 0.78, a: rnd() * Math.PI * 2 }));

  function tok(v) { return getComputedStyle(canvas.closest('.pcm-work')).getPropertyValue(v).trim(); }

  function wavy(ctx, cx, cy, angle, len, amp, freq, off) {
    const C = Math.cos(angle), S = Math.sin(angle), PC = -S, PS = C;
    ctx.beginPath();
    for (let d = 0; d <= len; d += 1.5) {
      const w = Math.sin(d / freq * Math.PI * 2 + off) * amp;
      d < 1 ? ctx.moveTo(cx+C*d+PC*w, cy+S*d+PS*w)
            : ctx.lineTo(cx+C*d+PC*w, cy+S*d+PS*w);
    }
    ctx.stroke();
  }

  function drawNucleus(cx, cy, alpha) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 26, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx - 2, cy - 7, 0, cx, cy, 26);
    g.addColorStop(0, '#7faace'); g.addColorStop(1, tok('--nuc'));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (const n of nucs) {
      ctx.beginPath();
      ctx.arc(cx + n.r * 6.5 * Math.cos(n.a), cy + n.r * 23 * Math.sin(n.a), 1.8, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = 'bold 9px "Quattrocento Sans",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('²⁰⁸Pb', cx, cy);
    ctx.restore();
  }

  let t = 0, raf = null;

  function frame(f) {
    const ph = (f % CYCLE) / CYCLE;
    const surf = tok('--surface') || '#f7f7f7';
    const muted = tok('--muted');
    const phCol = tok('--ph');
    const APPROACH_END = 0.27, FLASH_END = 0.37,
          QGP_END = 0.68, TRACK_START_PH = 0.37,
          TRACK_START_HAD = 0.55, FADE_START = 0.88;

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = surf; ctx.fillRect(0, 0, CW, CH);

    /* beam axis guide */
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(100,100,100,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(CW, CY); ctx.stroke();
    ctx.setLineDash([]);

    /* ── Approaching nuclei ── */
    if (ph < FLASH_END) {
      const t_a = Math.min(ph / APPROACH_END, 1);
      const ease = 1 - (1 - t_a) * (1 - t_a);
      const dist = 142 * (1 - ease);
      const nucA = ph > APPROACH_END ? Math.max(0, 1 - (ph - APPROACH_END) / (FLASH_END - APPROACH_END) * 1.4) : 1;
      drawNucleus(CX - dist, CY, nucA);
      drawNucleus(CX + dist, CY, nucA);

      if (ph < 0.14) {
        const la = Math.min(1, (0.14 - ph) / 0.06);
        ctx.globalAlpha = la * 0.7;
        ctx.fillStyle = muted;
        ctx.font = '10px "Source Code Pro",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Pb–Pb collision (schematic)', CX, CH - 10);
        ctx.globalAlpha = 1;
      }
    }

    /* ── Flash ── */
    if (ph >= APPROACH_END && ph < FLASH_END + 0.06) {
      const tf = (ph - APPROACH_END) / (FLASH_END - APPROACH_END + 0.06);
      const fR = tf * 58;
      const fA = Math.max(0, 1 - tf * 1.05);
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, fR);
      g.addColorStop(0, `rgba(255,245,200,${fA})`);
      g.addColorStop(0.4, `rgba(255,175,60,${fA*0.75})`);
      g.addColorStop(1, 'rgba(220,90,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    }

    /* ── QGP Fireball ── */
    if (ph >= FLASH_END && ph < QGP_END) {
      const tq = (ph - FLASH_END) / (QGP_END - FLASH_END);
      const fA = tq < 0.72 ? 1 : 1 - (tq - 0.72) / 0.28;
      const fR = 16 + tq * 80;
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, fR);
      g.addColorStop(0, `rgba(255,145,15,${fA*0.78})`);
      g.addColorStop(0.5, `rgba(210,70,0,${fA*0.48})`);
      g.addColorStop(1, 'rgba(170,30,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);

      if (tq > 0.08 && tq < 0.92) {
        const lA = tq < 0.2 ? (tq - 0.08) / 0.12 : tq > 0.8 ? (0.92 - tq) / 0.12 : 1;
        ctx.globalAlpha = lA * 0.72;
        ctx.fillStyle = 'rgba(155,60,0,1)';
        ctx.font = 'bold 13px "Quattrocento Sans",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QGP', CX, CY - fR * 0.38);
        ctx.font = '10px "Source Code Pro",monospace';
        ctx.fillText('deconfined matter', CX, CY - fR * 0.38 + 16);
        ctx.globalAlpha = 1;
      }
    }

    /* ── Particle tracks ── */
    if (ph >= TRACK_START_PH) {
      const edgeR = Math.min(CX, CY) * 0.9;
      const fadeA = ph > FADE_START ? Math.max(0, 1 - (ph - FADE_START) / (1 - FADE_START)) : 1;

      /* Photons */
      const pprog = Math.min((ph - TRACK_START_PH) / (FADE_START - TRACK_START_PH), 1);
      ctx.strokeStyle = phCol; ctx.lineWidth = 1.5;
      for (const p of photons) {
        const len = pprog * edgeR;
        ctx.globalAlpha = fadeA;
        wavy(ctx, CX, CY, p.angle, len, 4.5, 13, p.woff);
        if (len > 32) {
          ctx.fillStyle = phCol;
          ctx.font = '12px "Source Code Pro",monospace';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText('γ',
            CX + Math.cos(p.angle) * (len + 9),
            CY + Math.sin(p.angle) * (len + 9));
          ctx.textBaseline = 'alphabetic';
        }
      }

      /* Hadrons */
      if (ph >= TRACK_START_HAD) {
        const hprog = Math.min((ph - TRACK_START_HAD) / (FADE_START - TRACK_START_HAD), 1);
        ctx.strokeStyle = 'rgba(140,140,140,0.9)'; ctx.lineWidth = 0.9;
        for (const h of hadrons) {
          const len = hprog * edgeR * h.frac;
          ctx.globalAlpha = fadeA;
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.lineTo(CX + Math.cos(h.angle) * len, CY + Math.sin(h.angle) * len);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    /* ── Fade to bg ── */
    if (ph > FADE_START) {
      const fA = Math.min(1, (ph - FADE_START) / (1 - FADE_START));
      ctx.fillStyle = surf;
      ctx.globalAlpha = fA; ctx.fillRect(0, 0, CW, CH); ctx.globalAlpha = 1;
    }
  }

  function tick() { frame(t++); raf = requestAnimationFrame(tick); }
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const stillFrame = Math.floor(CYCLE * 0.62);
  const io = new IntersectionObserver(e => {
    visible = e[0].isIntersecting;
    if (motionQuery.matches) {
      cancelAnimationFrame(raf); raf = null; frame(stillFrame); return;
    }
    if (e[0].isIntersecting) { if (!raf) tick(); }
    else { cancelAnimationFrame(raf); raf = null; }
  });
  io.observe(canvas);
  frame(motionQuery.matches ? stillFrame : 0);
  motionQuery.addEventListener('change', () => {
    cancelAnimationFrame(raf); raf = null;
    if (motionQuery.matches) frame(stillFrame);
    else if (visible) tick();
  });
})();


/* ════════════════════════════════════════════════
   ANIMATION 2 — Photon Conversion (PCM), transverse projection
   Schematic geometry and trajectories; not to scale.
   Shows IP → ITS material → TPC tracking volume
   ════════════════════════════════════════════════ */
(function pcm() {
  const canvas = document.getElementById('pcmCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const CW = 560, CH = 220;
  canvas.width = CW * dpr; canvas.height = CH * dpr;
  ctx.scale(dpr, dpr);
  const CY = CH / 2;
  const CYCLE = 220;

  /* Layout constants */
  const IP_X    = 52;    // interaction point
  const MAT_X   = 186;   // illustrative detector material region
  const MAT_W   = 11;    // material band width
  const TPC_END = 510;   // TPC outer edge

  function tok(v) { return getComputedStyle(canvas.closest('.pcm-work')).getPropertyValue(v).trim(); }

  function wavy(ctx, x1, y1, x2, dir, len, amp, freq, off) {
    /* dir unused, kept for signature parity */
    if (len <= 0) return;
    const C = (x2 - x1) / len, S = 0, PC = 0, PS = -1;
    ctx.beginPath();
    for (let d = 0; d <= len; d += 1.5) {
      const w = Math.sin(d / freq * Math.PI * 2 + off) * amp;
      const x = x1 + C * d + PC * w;
      const y = y1 + S * d + PS * w;
      d < 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* Quadratic bezier progress helper */
  function bezierPoint(p0, p1, p2, t) {
    const mt = 1 - t;
    return [
      mt*mt*p0[0] + 2*mt*t*p1[0] + t*t*p2[0],
      mt*mt*p0[1] + 2*mt*t*p1[1] + t*t*p2[1],
    ];
  }

  /* Track control points (e+: curves up-right, e-: curves down-right) */
  const CONV = [MAT_X + MAT_W / 2, CY];
  const CTRL_EP = [340, CY - 72];  const END_EP = [TPC_END, CY - 105];
  const CTRL_EM = [340, CY + 72];  const END_EM = [TPC_END, CY + 105];

  let t = 0, raf = null;

  function frame(f) {
    const ph = (f % CYCLE) / CYCLE;
    const surf   = tok('--surface') || '#f7f7f7';
    const border = tok('--border');
    const muted  = tok('--muted');
    const fgD    = tok('--fg-dark');
    const phCol  = tok('--ph');
    const epCol  = tok('--ep');
    const emCol  = tok('--em');

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = surf; ctx.fillRect(0, 0, CW, CH);

    /* ── Detector layers ── */
    /* TPC volume (shaded region) */
    ctx.fillStyle = `rgba(0,0,0,${surf.startsWith('#f') ? 0.03 : 0.12})`;
    ctx.fillRect(MAT_X + MAT_W, 0, TPC_END - MAT_X - MAT_W, CH);

    /* Illustrative detector material band, not a material-budget map */
    ctx.fillStyle = border;
    ctx.fillRect(MAT_X, 0, MAT_W, CH);

    /* Layer labels */
    ctx.font = '10px "Quattrocento Sans",sans-serif';
    ctx.textAlign = 'center'; ctx.fillStyle = muted;
    ctx.fillText('Detector material', MAT_X + MAT_W / 2, 14);
    ctx.textAlign = 'right';
    ctx.fillText('TPC tracking volume', TPC_END - 6, 14);
    ctx.textAlign = 'left';
    ctx.fillText('IP', IP_X - 12, CY + 4);

    /* IP marker */
    ctx.beginPath();
    ctx.arc(IP_X, CY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = fgD; ctx.fill();

    /* horizontal axis guide */
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(0,0,0,${surf.startsWith('#f') ? 0.08 : 0.18})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(IP_X, CY); ctx.lineTo(TPC_END, CY); ctx.stroke();
    ctx.setLineDash([]);

    /* ── Phase gates ── */
    const PH_END = 0.36;   // photon reaches material
    const CONV_END = 0.46; // conversion flash
    const TRACK_END = 0.96;

    /* ── Photon travels ── */
    const phProg = Math.min(ph / PH_END, 1);
    const photonEndX = IP_X + phProg * (MAT_X - IP_X);
    const photonAlpha = ph > PH_END ? Math.max(0, 1 - (ph - PH_END) / 0.08) : 1;

    ctx.globalAlpha = photonAlpha;
    ctx.strokeStyle = phCol; ctx.lineWidth = 1.8;
    wavy(ctx, IP_X, CY, photonEndX, 0, photonEndX - IP_X, 5, 16, 0);

    ctx.fillStyle = phCol;
    ctx.font = 'bold 13px "Source Code Pro",monospace';
    ctx.textAlign = 'right';
    ctx.fillText('γ', IP_X - 8, CY + 5);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;

    /* ── Conversion flash ── */
    if (ph >= PH_END && ph < CONV_END) {
      const tf = (ph - PH_END) / (CONV_END - PH_END);
      const fR = tf * 20;
      const fA = Math.max(0, 1 - tf * 1.1);
      const g = ctx.createRadialGradient(CONV[0], CONV[1], 0, CONV[0], CONV[1], fR);
      g.addColorStop(0, `rgba(255,235,170,${fA})`);
      g.addColorStop(0.5, `rgba(220,160,50,${fA*0.6})`);
      g.addColorStop(1, 'rgba(200,120,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    }

    /* ── Conversion vertex dot ── */
    if (ph >= PH_END) {
      const vA = Math.min((ph - PH_END) / 0.06, 1);
      ctx.globalAlpha = vA;
      ctx.beginPath();
      ctx.arc(CONV[0], CONV[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = fgD; ctx.fill();
      ctx.globalAlpha = 1;
    }

    /* ── e⁺ / e⁻ tracks ── */
    if (ph >= CONV_END) {
      const tProg = Math.min((ph - CONV_END) / (TRACK_END - CONV_END), 1);

      function drawBezierPartial(p0, p1, p2, prog, color, label) {
        ctx.strokeStyle = color; ctx.lineWidth = 1.7;
        ctx.beginPath();
        const steps = 80;
        for (let i = 0; i <= steps * prog; i++) {
          const [x, y] = bezierPoint(p0, p1, p2, i / steps);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (prog > 0.25) {
          const [ex, ey] = bezierPoint(p0, p1, p2, Math.min(prog, 1));
          ctx.fillStyle = color;
          ctx.font = '12px "Source Code Pro",monospace';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(label, ex + 7, ey);
          ctx.textBaseline = 'alphabetic';
        }
      }

      drawBezierPartial(CONV, CTRL_EP, END_EP, tProg, epCol, 'e⁺');
      drawBezierPartial(CONV, CTRL_EM, END_EM, tProg, emCol, 'e⁻');
    }

    /* B-field label */
    ctx.fillStyle = muted;
    ctx.font = '10px "Quattrocento Sans",sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('B = 0.5 T  ⊗', CW - 8, CH - 8);
    ctx.textAlign = 'left';
    ctx.fillText('Schematic · not to scale', 8, CH - 8);
  }

  function tick() { frame(t++); raf = requestAnimationFrame(tick); }
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const stillFrame = Math.floor(CYCLE * 0.72);
  const io = new IntersectionObserver(e => {
    visible = e[0].isIntersecting;
    if (motionQuery.matches) {
      cancelAnimationFrame(raf); raf = null; frame(stillFrame); return;
    }
    if (e[0].isIntersecting) { if (!raf) tick(); }
    else { cancelAnimationFrame(raf); raf = null; }
  });
  io.observe(canvas);
  frame(motionQuery.matches ? stillFrame : 0);
  motionQuery.addEventListener('change', () => {
    cancelAnimationFrame(raf); raf = null;
    if (motionQuery.matches) frame(stillFrame);
    else if (visible) tick();
  });
})();
