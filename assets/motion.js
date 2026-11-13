/* ==========================================================================
   VOUCHRA MOTION & INTERACTION CONTROLLER (SWISS STYLE)
   - Scroll progress hairline
   - Mobile broadsheet drawer
   - Interactive ROI calculator
   - 3-Way Triptych scenario switcher
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMobileDrawer();
  initRoiCalculator();
  initTriptychSwitcher();
  initHeroSpecimenSwitcher();
  initScrollReveals();
  initHeroMetricsCountUp();
});

/* 1. Scroll Progress Hairline */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-line');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/* 2. Mobile Broadsheet Drawer */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-hamburger');
  const closeBtn = document.querySelector('.drawer-close');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-nav a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* 3. Mathematical ROI & Capital Leakage Calculator */
function initRoiCalculator() {
  const slider = document.getElementById('calc-slider');
  const sliderVal = document.getElementById('calc-bill-count');
  const nairasaved = document.getElementById('calc-naira-saved');
  const dollarsaved = document.getElementById('calc-dollar-saved');
  const hourssaved = document.getElementById('calc-hours-saved');

  if (!slider) return;

  function updateRoi() {
    const bills = parseInt(slider.value, 10);
    if (sliderVal) sliderVal.textContent = `${bills.toLocaleString()} bills / mo`;

    // Benchmark: ₦18,240 (~$12.16) average overbilling/shortfall prevented per bill
    const totalNaira = bills * 18240;
    const totalUsd = Math.round(totalNaira / 1500);
    const hours = Math.round(bills * 0.23);

    if (nairasaved) {
      if (totalNaira >= 1000000) {
        nairasaved.textContent = `₦${(totalNaira / 1000000).toFixed(1)}M`;
      } else {
        nairasaved.textContent = `₦${totalNaira.toLocaleString()}`;
      }
    }

    if (dollarsaved) {
      dollarsaved.textContent = `~$${totalUsd.toLocaleString()} saved each month`;
    }

    if (hourssaved) {
      hourssaved.textContent = `${hours.toLocaleString()} hrs / mo`;
    }
  }

  slider.addEventListener('input', updateRoi);
  updateRoi();
}

/* 4. Three-Way Reconciliation Triptych Switcher */
function initTriptychSwitcher() {
  const buttons = document.querySelectorAll('.triptych-tab-btn');
  const invLine = document.getElementById('triptych-inv-line');
  const grnLine = document.getElementById('triptych-grn-line');
  const engineResult = document.getElementById('triptych-engine-result');

  if (!buttons.length || !invLine || !grnLine || !engineResult) return;

  const scenarios = {
    shortfall: {
      invText: 'All-Purpose Flour 50kg — 100 Bags @ ₦42,000',
      invSub: 'Total Invoiced: ₦4,200,000',
      invClass: 'cleared',
      grnText: 'Signed Goods Received Note — 92 Bags Counted',
      grnSub: 'Store Gate Stamp #04: -8 Bags Short',
      grnClass: 'flagged',
      engineTitle: 'Quantity Shortfall Detected',
      engineDesc: 'Supplier billed for 100 bags, but receiving gate only signed for 92 bags. Auto-generating Debit Note DN-8821 for ₦336,000 deduction.'
    },
    price: {
      invText: 'Vegetable Cooking Oil 25L — 50 Cans @ ₦47,500',
      invSub: 'Total Invoiced: ₦2,375,000',
      invClass: 'flagged',
      grnText: 'Goods Received Note — 50 Cans Verified',
      grnSub: 'Approved Contract PO Rate: ₦42,000 / Can',
      grnClass: 'cleared',
      engineTitle: 'Price Variance Flagged (+13.1%)',
      engineDesc: 'Billed unit rate exceeds approved purchase contract by ₦5,500/can. Total unauthorized variance: ₦275,000 blocked.'
    },
    duplicate: {
      invText: 'Fresh Bread Yeast 10kg — Inv #GPN-9014',
      invSub: 'Dated: Oct 28 — ₦680,000',
      invClass: 'flagged',
      grnText: 'Waybill #WB-4410 — Matched to Voucher #PV-3011',
      grnSub: 'Already Paid via Stanbic IBTC on Nov 02',
      grnClass: 'flagged',
      engineTitle: 'Duplicate Invoice Claim Blocked',
      engineDesc: 'This supplier bill was submitted and settled 10 days ago. 100% duplicate claim blocked from payment schedule.'
    },
    clean: {
      invText: 'Granulated Sugar 50kg — 40 Bags @ ₦52,000',
      invSub: 'Total Invoiced: ₦2,080,000',
      invClass: 'cleared',
      grnText: 'Gate Waybill #WB-8120 — 40 Bags Received',
      grnSub: 'PO #PO-9022 Matched — Zero Variance',
      grnClass: 'cleared',
      engineTitle: '3-Way Match Verification Complete',
      engineDesc: 'Quantities, unit prices, VAT, and store receiving signatures all match perfectly. Cleared for ERP release.'
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scenarioKey = btn.dataset.scenario;
      const s = scenarios[scenarioKey];
      if (!s) return;

      invLine.innerHTML = `
        <div style="font-size: 13px; font-weight: 700;">${s.invText}</div>
        <div class="mono" style="font-size: 11.5px; color: var(--ink-muted);">${s.invSub}</div>
      `;
      invLine.className = `triptych-card-item ${s.invClass}`;

      grnLine.innerHTML = `
        <div style="font-size: 13px; font-weight: 700;">${s.grnText}</div>
        <div class="mono" style="font-size: 11.5px; color: var(--swiss-red);">${s.grnSub}</div>
      `;
      grnLine.className = `triptych-card-item ${s.grnClass}`;

      engineResult.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: var(--swiss-red); text-transform: uppercase; margin-bottom: 4px;">
          ${s.engineTitle}
        </div>
        <div style="font-size: 12px; color: var(--ink-secondary); line-height: 1.5;">
          ${s.engineDesc}
        </div>
      `;
    });
  });
}

/* 5. Interactive Hero Specimen Switcher */
function initHeroSpecimenSwitcher() {
  const tabs = document.querySelectorAll('.hero-tab-pill');
  if (!tabs.length) return;

  const packetCode = document.getElementById('hero-packet-code');
  const invTag = document.getElementById('hero-inv-tag');
  const invTitle = document.getElementById('hero-spec-inv-title');
  const invVal = document.getElementById('hero-spec-inv-val');
  const invVendor = document.getElementById('hero-spec-inv-vendor');
  const grnTag = document.getElementById('hero-grn-tag');
  const grnVal = document.getElementById('hero-spec-grn-val');
  const grnReceiver = document.getElementById('hero-spec-grn-receiver');
  const badge = document.getElementById('hero-spec-badge');
  const headline = document.getElementById('hero-spec-headline');
  const breakdown = document.getElementById('hero-spec-breakdown');
  const approved = document.getElementById('hero-spec-approved');
  const laser = document.querySelector('.swiss-laser-sweep');

  const heroScenarios = {
    flour: {
      code: 'DOCUMENT MATRIX [ REF: VCH-8821 ]',
      invTag: 'Supplier Bill #99042',
      invTitle: 'Golden Penny Flour 50kg',
      invVal: '100 Bags @ ₦47,500',
      invVendor: 'Vendor: Flour Mills of Nig Plc',
      grnTag: 'Gate Goods Received',
      grnVal: '92 Bags (-8 SHORT)',
      grnReceiver: 'Receiver: Gate Dock #04 (Ibadan)',
      badge: '■ 2 Exceptions Detected Before Release',
      headline: '₦886,000 Unearned Overbilling Blocked',
      breakdown: '<strong>1. Shortfall:</strong> 92/100 bags received (-₦380,000)<br><strong>2. Price Creep:</strong> ₦47,500 billed vs. ₦42,000 PO (-₦506,000)',
      approved: '₦3,864,000'
    },
    sugar: {
      code: 'DOCUMENT MATRIX [ REF: VCH-7104 ]',
      invTag: 'Supplier Bill #DSR-4401',
      invTitle: 'Dangote Refined Sugar 50kg',
      invVal: '200 Bags @ ₦78,000',
      invVendor: 'Vendor: Dangote Sugar Refinery Plc',
      grnTag: 'Gate Goods Received',
      grnVal: '180 Bags (-20 SHORT)',
      grnReceiver: 'Receiver: Central Bulk Depot #01 (Apapa)',
      badge: '■ Delivery Deficit & Discrepancy Flagged',
      headline: '₦1,560,000 Unearned Overbilling Blocked',
      breakdown: '<strong>1. Shortfall:</strong> 180/200 bags offloaded (-₦1,560,000)<br><strong>2. Contract Check:</strong> Unit rate ₦78,000 verified.',
      approved: '₦14,040,000'
    },
    poultry: {
      code: 'DOCUMENT MATRIX [ REF: VCH-9302 ]',
      invTag: 'Cold-Chain Bill #CHI-8119',
      invTitle: 'Frozen Whole Broiler (KG)',
      invVal: '1,500 KG @ ₦3,900/kg',
      invVendor: 'Vendor: Chi Farms Limited (Ajanla)',
      grnTag: 'Weighbridge Gate Note',
      grnVal: '1,280 KG (-220 KG SHORT)',
      grnReceiver: 'Receiver: Cold Storage Dock #02 (Lagos)',
      badge: '■ Net Weighbridge Shortfall Flagged',
      headline: '₦858,000 Weight Variance Blocked',
      breakdown: '<strong>1. Weight Deficit:</strong> 1,280/1,500 kg recorded (-₦858,000)<br><strong>2. Cold Chain:</strong> -18°C core temp verified.',
      approved: '₦4,992,000'
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const scenario = heroScenarios[tab.dataset.heroScenario];
      if (!scenario) return;

      // Trigger a laser pulse
      if (laser) {
        laser.style.animation = 'none';
        laser.offsetHeight; // trigger reflow
        laser.style.animation = 'laserScan 2.5s ease-in-out';
      }

      if (packetCode) packetCode.textContent = scenario.code;
      if (invTag) invTag.textContent = scenario.invTag;
      if (invTitle) invTitle.textContent = scenario.invTitle;
      if (invVal) invVal.textContent = scenario.invVal;
      if (invVendor) invVendor.textContent = scenario.invVendor;
      if (grnTag) grnTag.textContent = scenario.grnTag;
      if (grnVal) grnVal.textContent = scenario.grnVal;
      if (grnReceiver) grnReceiver.textContent = scenario.grnReceiver;
      if (badge) badge.textContent = scenario.badge;
      if (headline) headline.textContent = scenario.headline;
      if (breakdown) breakdown.innerHTML = scenario.breakdown;
      if (approved) approved.textContent = scenario.approved;
    });
  });
}

/* 6. Swiss Architectural Scroll Reveals */
function initScrollReveals() {
  const selectors = [
    '.section-head',
    '.proof-cell',
    '.split-story-text-cell',
    '.split-story-img-cell',
    '.triptych-column',
    '.photo-phase-card',
    '.leakage-module',
    '.calc-box',
    '.pricing-cell',
    '.team-cell',
    '.kpi-box',
    '.faq-cell'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    return; // Graceful fallback: keep visible
  }

  elements.forEach((el, idx) => {
    el.classList.add('reveal-pending');
    // Subtle sibling stagger within grid rows
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).indexOf(el);
      el.style.transitionDelay = `${Math.min(siblings * 70, 280)}ms`;
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* 7. Hero Metrics Count-Up */
function initHeroMetricsCountUp() {
  const metrics = document.querySelectorAll('.hero-metrics-matrix .metric-num');
  if (!metrics.length) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  metrics.forEach(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
    if (!match) return;

    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseFloat(numStr);
    const hasDecimals = numStr.includes('.');
    const hasCommas = match[2].includes(',');

    if (isNaN(target)) return;

    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Expo ease out
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * eased;

      let formatted;
      if (hasDecimals) {
        formatted = current.toFixed(1);
      } else {
        const rounded = Math.round(current);
        formatted = hasCommas ? rounded.toLocaleString() : String(rounded);
      }

      el.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = raw;
      }
    }

    requestAnimationFrame(tick);
  });
}
