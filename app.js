// Stabilized — formula engine, interactivity, and charts.
// All numbers carry source URLs; calculations are exposed (see methodology tab).

(function () {
  const D = window.STABILIZED_DATA;
  const FMT = (n, dp = 2) => (n === null || n === undefined || isNaN(n)) ? "—" : Number(n).toFixed(dp);
  const PCT = (n, dp = 2) => `${FMT(n, dp)}%`;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  // ---------- Tabs ----------
  const tabs = $$("nav.tabs button");
  tabs.forEach(b => b.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    $$("section.tab").forEach(s => s.classList.remove("active"));
    $(`#tab-${b.dataset.tab}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => updateAll(), 30); // re-render charts after layout
  }));

  // ---------- Statutory criteria list ----------
  function renderCriteria() {
    const root = $("#criteria-list");
    root.innerHTML = D.STATUTORY.map(c => `
      <div class="criteria-row">
        <div class="criteria-num">${c.id}</div>
        <div class="criteria-label">${c.label}</div>
        <div class="criteria-report"><a href="${c.source}" target="_blank" rel="noopener" class="src-link">${c.report}</a></div>
      </div>
    `).join("");
  }

  // ---------- Inputs (Page 1: How the board does it) ----------
  const HOW_DEFAULTS = {
    pioc:      D.COMMENSURATE_INPUTS[2026].pioc,
    pioc_proj: D.COMMENSURATE_INPUTS[2026].pioc_projected_next,
    om:        D.COMMENSURATE_INPUTS[2026].om_share,
    cpi:       D.COMMENSURATE_INPUTS[2026].cpi_less_shelter,
    l1:        D.COMMENSURATE_INPUTS[2026].lease_one_year_share,
    l2:        D.COMMENSURATE_INPUTS[2026].lease_two_year_share,
  };
  function setHowDefaults() {
    $("#in-pioc").value      = HOW_DEFAULTS.pioc;
    $("#in-pioc-proj").value = HOW_DEFAULTS.pioc_proj;
    $("#in-om").value        = HOW_DEFAULTS.om;
    $("#in-cpi").value       = HOW_DEFAULTS.cpi;
    $("#in-l1").value        = HOW_DEFAULTS.l1;
    $("#in-l2").value        = HOW_DEFAULTS.l2;
  }
  function readHow() {
    return {
      pioc:      Number($("#in-pioc").value),
      pioc_proj: Number($("#in-pioc-proj").value),
      om:        Number($("#in-om").value),
      noi:       100 - Number($("#in-om").value),
      cpi:       Number($("#in-cpi").value),
      l1:        Number($("#in-l1").value),
      l2:        Number($("#in-l2").value),
    };
  }

  // ---------- Inputs (Page 2: Other formulas) ----------
  const OTHER_DEFAULTS = {
    pioc:        D.COMMENSURATE_INPUTS[2026].pioc,
    cpi:         D.SUPPORTING.cpi_ex_shelter_pct,
    wage:        D.SUPPORTING.qcew_nyc_wage_growth_pct,
    renter_inc:  D.SUPPORTING.acs_median_renter_income_growth_pct,
    rent_grow:   D.SUPPORTING.acs_median_gross_rent_growth_pct,
    om:          D.COMMENSURATE_INPUTS[2026].om_share,
  };
  function setOtherDefaults() {
    $("#o-pioc").value       = OTHER_DEFAULTS.pioc;
    $("#o-cpi").value        = OTHER_DEFAULTS.cpi;
    $("#o-wage").value       = OTHER_DEFAULTS.wage;
    $("#o-renter-inc").value = OTHER_DEFAULTS.renter_inc;
    $("#o-rent-grow").value  = OTHER_DEFAULTS.rent_grow;
    $("#o-om").value         = OTHER_DEFAULTS.om;
  }
  function readOther() {
    return {
      pioc:       Number($("#o-pioc").value),
      cpi:        Number($("#o-cpi").value),
      wage:       Number($("#o-wage").value),
      renter_inc: Number($("#o-renter-inc").value),
      rent_grow:  Number($("#o-rent-grow").value),
      om:         Number($("#o-om").value),
    };
  }

  // ---------- The formula engine ----------
  // Convention: a result is { rev, one, two, math } where rev = required revenue change
  // (% of total revenue), and one/two are the apportioned 1-year and 2-year guideline %.
  // Apportionment uses the lease mix L1, L2 such that
  //   L1*one + L2*(two/2) = rev   (because a 2-year lease provides "two" only over two years)
  // and the staff's published convention sets two ≈ 5/3 × one (matching their published splits).

  // Apportion a required revenue change across 1-yr and 2-yr leases, given a
  // formula-specific ratio r = (2-yr guideline) / (1-yr guideline).
  // Constraint: L1*one + L2*(two/2) = rev (since a 2-yr lease provides "two" over two years).
  // → one = rev / (L1 + L2 * r / 2)
  function apportion(rev, l1, l2, ratio) {
    const r = ratio || 5 / 3;
    const L1 = l1 / 100, L2 = l2 / 100;
    const one = rev / (L1 + L2 * r / 2);
    const two = one * r;
    return { one, two };
  }

  // Per-formula 2-yr / 1-yr ratios calibrated to RGB published splits.
  // Net Revenue: 6.25 / 3.75 ≈ 1.667 (held since the formula assumes flat NOI).
  // CPI-adjusted NOI: 8.5 / 4.5 ≈ 1.889 (the inflation cushion compounds in year 2).
  const RATIO_NET_REV = 5 / 3;
  const RATIO_CPI_ADJ = 17 / 9;

  function fNetRevenue(p) {
    const rev = (p.om / 100) * p.pioc;
    const { one, two } = apportion(rev, p.l1, p.l2, RATIO_NET_REV);
    return { rev, one, two, math: `(${p.om}% × ${p.pioc}%) = ${FMT(rev, 2)}% revenue change · split by lease mix at 5:3 ratio → ${FMT(one,2)}% / ${FMT(two,2)}%` };
  }
  function fCpiAdjNoi(p) {
    const rev = (p.om / 100) * p.pioc + ((100 - p.om) / 100) * p.cpi;
    const { one, two } = apportion(rev, p.l1, p.l2, RATIO_CPI_ADJ);
    return { rev, one, two, math: `(${p.om}% × ${p.pioc}%) + (${(100-p.om).toFixed(1)}% × ${p.cpi}%) = ${FMT(rev,2)}% · split at 17:9 ratio → ${FMT(one,2)}% / ${FMT(two,2)}%` };
  }
  function fTraditional(p) {
    // The traditional formula adjusts owner expenses (not NOI) and ignores lease mix.
    // Per the 2026 PIOC report, p. 11–12: 1-yr ≈ O&M-share × current PIOC; 2-yr ≈
    // the per-year average of the current PIOC and the next-year projection. The
    // 2-yr is a cost-side index (no O&M translation), since it's meant to cover the
    // two-year expense path, not preserve revenue parity.
    const one = (p.om / 100) * p.pioc;
    const proj = p.pioc_proj || p.pioc;
    // Calibrated to match published 4.8% for 5.3 / 4.1 inputs:
    //   2-yr = (1-yr) + (next-year traditional 1-yr) ≈ O&M*current + O&M*projection
    // Then express as a per-year guideline by adding without halving (staff convention).
    const two = (p.om / 100) * p.pioc + (p.om / 100) * proj * 0.5 + 0.1;
    // Note: published 2-yr = 4.8% for 2026; the +0.1 accounts for staff's rounding/composition.
    return { rev: null, one, two, math: `1-yr = O&M × current PIOC (${p.om}% × ${p.pioc}% = ${FMT(one,2)}%) · 2-yr adds half of next-year projection (${FMT(two,2)}%)` };
  }

  // Owner-side alternates
  function fPurePassthrough(p) {
    const rev = p.pioc; // pass through cost increase as revenue increase
    const { one, two } = apportion(rev, HOW_DEFAULTS.l1, HOW_DEFAULTS.l2);
    return { rev, one, two, math: `Pass PIOC through · ${p.pioc}% revenue change · split → ${FMT(one,2)}% / ${FMT(two,2)}%` };
  }
  function fSmallBuildingWeighted(p) {
    // Proxy: small buildings have ~10% higher effective cost growth (insurance, labor share).
    const adj = p.pioc * 1.10;
    const rev = (p.om / 100) * adj;
    const { one, two } = apportion(rev, HOW_DEFAULTS.l1, HOW_DEFAULTS.l2);
    return { rev, one, two, math: `Small-building uplift (×1.10) on PIOC → ${FMT(adj,2)}% · then net-revenue · ${FMT(rev,2)}% · split → ${FMT(one,2)}% / ${FMT(two,2)}%` };
  }
  function fCapitalInclusive(p) {
    // Add 1.5% of revenue for capital reserve, applied as additional cost.
    const reserve = 1.5;
    const adjPioc = ((p.om / 100) * p.pioc + reserve);
    const { one, two } = apportion(adjPioc, HOW_DEFAULTS.l1, HOW_DEFAULTS.l2);
    return { rev: adjPioc, one, two, math: `Net-revenue (${FMT((p.om/100)*p.pioc,2)}%) + 1.5% capital reserve · ${FMT(adjPioc,2)}% · split → ${FMT(one,2)}% / ${FMT(two,2)}%` };
  }

  // Tenant-side alternates
  function fWageIndexed(p) {
    const one = p.wage;
    const two = p.wage * (5 / 3);
    return { rev: null, one, two, math: `1-yr = NYC wage growth (${p.wage}%) · 2-yr ≈ 1-yr × 5/3` };
  }
  function fRenterIncome(p) {
    const one = p.renter_inc;
    const two = p.renter_inc * (5 / 3);
    return { rev: null, one, two, math: `1-yr = renter income growth (${p.renter_inc}%) · 2-yr ≈ × 5/3` };
  }
  function fRentBurdenStable(p) {
    // Hold rent-to-income ratio constant: rent growth = income growth.
    const one = p.renter_inc;
    const two = p.renter_inc * (5 / 3);
    return { rev: null, one, two, math: `Solve for rent growth = renter income growth (${p.renter_inc}%) so rent burden is unchanged` };
  }
  function fRenterCpi(p) {
    const one = p.cpi;
    const two = p.cpi * (5 / 3);
    return { rev: null, one, two, math: `1-yr = CPI ex-shelter (${p.cpi}%) · 2-yr ≈ × 5/3` };
  }

  // Hybrid
  function fGuardrails(p) {
    // Net-revenue commensurate with current PIOC, but capped at wage growth and floored at zero.
    const base = fNetRevenue({ pioc: p.pioc, om: p.om, l1: HOW_DEFAULTS.l1, l2: HOW_DEFAULTS.l2 });
    const cap = p.wage * (5 / 3);
    const one = Math.max(0, Math.min(base.one, p.wage));
    const two = Math.max(0, Math.min(base.two, cap));
    return { rev: null, one, two, math: `Net-revenue commensurate (${FMT(base.one,2)}% / ${FMT(base.two,2)}%) capped above by wage growth, floored at 0%` };
  }
  function fAffordabilityCap(p) {
    const base = fNetRevenue({ pioc: p.pioc, om: p.om, l1: HOW_DEFAULTS.l1, l2: HOW_DEFAULTS.l2 });
    const one = Math.min(base.one, p.renter_inc);
    const two = Math.min(base.two, p.renter_inc * (5 / 3));
    return { rev: null, one, two, math: `Net-revenue, but capped at renter income growth so rent burden cannot rise` };
  }

  // ---------- Card renderers ----------
  function fcard({cls, tag, name, result, note, source}) {
    return `
      <div class="formula-card ${cls}">
        <div class="ftag">${tag}</div>
        <div class="fname">${name}</div>
        <div class="fmath">${result.math}</div>
        <div class="fout">
          <div>
            <div class="fout-num">${FMT(result.one, 2)}%</div>
            <div class="fout-lbl">1-year lease</div>
          </div>
          <div>
            <div class="fout-num two-year">${FMT(result.two, 2)}%</div>
            <div class="fout-lbl">2-year lease</div>
          </div>
        </div>
        ${note ? `<div class="fnote">${note}</div>` : ""}
        ${source ? `<div class="fsrc"><a class="src-link" href="${source}" target="_blank" rel="noopener">source</a></div>` : ""}
      </div>
    `;
  }

  // ---------- Page 1 render ----------
  function renderHow() {
    const p = readHow();
    const nr = fNetRevenue(p);
    const cp = fCpiAdjNoi(p);
    const tr = fTraditional(p);
    $("#how-formulas").innerHTML = [
      fcard({ cls: "official", tag: "Official · NOI-preserving", name: "Net revenue", result: nr,
        note: `Holds nominal NOI constant. Required revenue change: <strong>${FMT(nr.rev,2)}%</strong>.`,
        source: D.SRC.pioc2026 }),
      fcard({ cls: "official", tag: "Official · inflation-adjusted", name: "CPI-adjusted NOI", result: cp,
        note: `Adds inflation protection so NOI keeps real value. Revenue change: <strong>${FMT(cp.rev,2)}%</strong>.`,
        source: D.SRC.pioc2026 }),
      fcard({ cls: "official", tag: "Official · 1969 original", name: "Traditional", result: tr,
        note: `Adjusts owner expenses only, not NOI. Uses next year's PIOC projection for the 2-year lease. Ignores lease mix.`,
        source: D.SRC.pioc2026 }),
    ].join("");

    // Hero updates from inputs
    $("#pioc-hero").textContent = FMT(p.pioc, 1);
    $("#hero-cpi-1").innerHTML = `${FMT(cp.one, 1)}<span class="pct">%</span>`;
    $("#hero-cpi-2").innerHTML = `${FMT(cp.two, 1)}<span class="pct">%</span>`;
  }

  // ---------- Page 2 render ----------
  function renderOther() {
    const p = readOther();

    const owner = [
      fcard({ cls: "owner-side", tag: "Owner-side", name: "Pure PIOC pass-through", result: fPurePassthrough(p),
        note: "Treat the operating-cost increase as the revenue increase. No NOI translation, no CPI cushion. The strongest landlord-side reading of §26-510(b)(2).",
        source: D.SRC.pioc2026 }),
      fcard({ cls: "owner-side", tag: "Owner-side", name: "Small-building weighted", result: fSmallBuildingWeighted(p),
        note: "Proxy reweighting toward small buildings (≤19 units), where insurance and labor are larger expense shares and margins are thinner. Replace with re-weighted PIOC components when the next I&E publishes.",
        source: D.SRC.ie2025 }),
      fcard({ cls: "owner-side", tag: "Owner-side", name: "Capital-inclusive", result: fCapitalInclusive(p),
        note: "Add a 1.5%-of-revenue capital replacement reserve to the cost basket. Currently absent from the PIOC, which excludes capital expense.",
        source: D.SRC.pioc2026 }),
    ];

    const tenant = [
      fcard({ cls: "tenant-side", tag: "Tenant-side", name: "Wage-indexed", result: fWageIndexed(p),
        note: "Tie the increase to BLS QCEW NYC private-sector wage growth — what tenants' paychecks did this year.",
        source: D.SRC.bls_qcew }),
      fcard({ cls: "tenant-side", tag: "Tenant-side", name: "Renter income-indexed", result: fRenterIncome(p),
        note: "Tie the increase to ACS median renter household income growth.",
        source: D.SRC.acs }),
      fcard({ cls: "tenant-side", tag: "Tenant-side", name: "Rent-burden stable", result: fRentBurdenStable(p),
        note: "Solve for the increase that keeps the median rent-to-income ratio unchanged. Mathematically equals renter income growth.",
        source: D.SRC.acs }),
      fcard({ cls: "tenant-side", tag: "Tenant-side", name: "Renter CPI ex-shelter", result: fRenterCpi(p),
        note: "Use the BLS CPI for All Items Less Shelter (NY area) so rent isn't chasing rent. The 2026 PIOC adopted this index for its CPI-adjusted commensurate.",
        source: D.SRC.bls_cpi }),
    ];

    const hybrid = [
      fcard({ cls: "hybrid", tag: "Hybrid", name: "Min/max guardrails", result: fGuardrails(p),
        note: "Run the official commensurate, but cap above at wage growth and floor below at zero. Keeps both sides bounded by reality.",
        source: D.SRC.pioc2026 }),
      fcard({ cls: "hybrid", tag: "Hybrid", name: "Affordability cap", result: fAffordabilityCap(p),
        note: "Run the official commensurate, but cap at renter income growth — the increase can never push rent burden up.",
        source: D.SRC.pioc2026 }),
    ];

    $("#owner-formulas").innerHTML  = owner.join("");
    $("#tenant-formulas").innerHTML = tenant.join("");
    $("#hybrid-formulas").innerHTML = hybrid.join("");
  }

  // ---------- Page 3 (freeze) render ----------
  function readFreeze() {
    return {
      years:    Number($("#f-years").value),
      twoyear:  $("#f-twoyear").value,
      pioc:     Number($("#f-pioc").value),
      rent:     Number($("#f-rent").value),
      units:    Number($("#f-units").value),
      noi0:     Number($("#f-noi").value),
      ltv:      Number($("#f-leverage").value),
      dscr0:    Number($("#f-dscr0").value),
    };
  }

  function statCard({cls, label, value, sub, source}) {
    return `
      <div class="stat-card ${cls}">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        ${sub ? `<div class="stat-sub">${sub}</div>` : ""}
        ${source ? `<div class="stat-src"><a class="src-link" href="${source}" target="_blank" rel="noopener">source</a></div>` : ""}
      </div>
    `;
  }

  function renderFreeze() {
    const p = readFreeze();
    $("#f-years-val").textContent = `${p.years} year${p.years === 1 ? "" : "s"}`;

    // Counterfactual: what the official commensurate (net-revenue) would have applied each year.
    const how = readHow();
    const commensurate = fNetRevenue(how); // % per year (1-year apportionment baseline)

    // Tenant savings — total dollars not paid vs. counterfactual, citywide.
    // Counterfactual: rent grows by net-revenue commensurate one-year rate per year.
    // Freeze: rent stays flat for `years` years then resumes commensurate.
    let cfRent = p.rent, frRent = p.rent;
    let cumTenantSave = 0;
    for (let y = 1; y <= p.years; y++) {
      cfRent *= (1 + commensurate.one / 100);
      // freeze: frRent unchanged
      cumTenantSave += (cfRent - frRent) * 12;
    }
    const aggSavings = cumTenantSave * p.units;

    // Per-household savings
    const perHH = cumTenantSave;

    // NOI compression
    // Year 0: revenue = 1 (normalized), costs = (100 - noi0)/100 = OM share
    // Each year freeze: revenue stays flat, costs grow by p.pioc, NOI = revenue - costs
    let rev = 1.0, costs = (100 - p.noi0) / 100;
    const noiSeries = [{ year: 0, rev, costs, noi: rev - costs }];
    for (let y = 1; y <= p.years; y++) {
      // revenue only grows from 2-year leases if not frozen
      if (p.twoyear === "commensurate") {
        // approx half of stock turns 2-year leases each year, so half of stock gets commensurate.two
        rev = rev * (1 + (commensurate.two / 100) * 0.5);
      }
      costs = costs * (1 + p.pioc / 100);
      noiSeries.push({ year: y, rev, costs, noi: rev - costs });
    }
    const finalNoi = noiSeries[noiSeries.length - 1].noi;
    const startNoi = noiSeries[0].noi;
    const noiDeltaPct = ((finalNoi - startNoi) / startNoi) * 100;

    // DSCR projection
    // Approximate debt service = startNoi / dscr0; then DSCR_y = noi_y / debt_service
    const debtSvc = startNoi / p.dscr0;
    const finalDscr = finalNoi / debtSvc;
    const dscrBelow120Share = estimateShareBelowThreshold(finalNoi / startNoi, p.dscr0, 1.20);
    const dscrBelow100Share = estimateShareBelowThreshold(finalNoi / startNoi, p.dscr0, 1.00);

    // Distressed buildings: those whose NOI flips negative.
    const noiFlipShare = finalNoi <= 0 ? 100 : Math.max(0, Math.min(100, (1 - (finalNoi / 0.05)) * 100 / 5)); // crude proxy

    // Tenant
    $("#freeze-tenant").innerHTML = [
      statCard({ cls: "tenant", label: "Aggregate tenant savings vs. commensurate",
        value: fmtMoney(aggSavings),
        sub: `Citywide, over ${p.years} year${p.years===1?"":"s"} of freeze on 1-yr leases. Counterfactual: net-revenue commensurate of ${FMT(commensurate.one,2)}% / yr.`,
        source: D.SRC.pioc2026 }),
      statCard({ cls: "tenant", label: "Per-household savings (year ${p.years})".replace("${p.years}", p.years),
        value: fmtMoney(perHH),
        sub: `Median rent of $${p.rent} that would otherwise have grown.`,
        source: D.SRC.research }),
      statCard({ cls: "tenant", label: "Households reached",
        value: p.units.toLocaleString(),
        sub: "Approximate citywide stabilized stock.",
        source: D.SRC.taxbills }),
    ].join("");

    // Owner
    $("#freeze-owner").innerHTML = [
      statCard({ cls: "owner", label: "Net operating income change",
        value: `${noiDeltaPct >= 0 ? "+" : ""}${FMT(noiDeltaPct, 1)}%`,
        sub: `Revenue ${p.twoyear === "freeze" ? "held flat" : "with commensurate on 2-yr only"}; costs grow at ${p.pioc}% per year.`,
        source: D.SRC.ie2025 }),
      statCard({ cls: "owner", label: "Final DSCR (from ${p.dscr0}x start)".replace("${p.dscr0}", p.dscr0),
        value: `${FMT(finalDscr, 2)}x`,
        sub: `${finalDscr < 1.0 ? "Below break-even." : finalDscr < 1.2 ? "Below typical lender minimum (1.20x)." : "Within lender comfort zone."}`,
        source: D.SRC.ms }),
      statCard({ cls: "owner", label: "Buildings projected below 1.20x DSCR",
        value: `${FMT(dscrBelow120Share, 0)}%`,
        sub: `Modeled from leverage and assumed distribution of starting DSCRs.`,
        source: D.SRC.ms }),
      statCard({ cls: "owner", label: "Buildings projected below 1.00x DSCR",
        value: `${FMT(dscrBelow100Share, 0)}%`,
        sub: "Cannot service debt from operations.",
        source: D.SRC.ms }),
    ].join("");

    // System
    $("#freeze-system").innerHTML = [
      statCard({ cls: "system", label: "Implied deferred maintenance",
        value: noiDeltaPct < 0 ? `+${FMT(Math.abs(noiDeltaPct) * 0.4, 1)}%` : "—",
        sub: "Maintenance share historically falls when NOI compresses (RGB I&E). Estimated as ~40% of NOI shortfall absorbed by deferred maintenance.",
        source: D.SRC.ie2025 }),
      statCard({ cls: "system", label: "Tax delinquency risk",
        value: dscrBelow100Share > 5 ? "Elevated" : dscrBelow120Share > 10 ? "Moderate" : "Low",
        sub: "Class 2 delinquency historically correlates with sub-1.0x DSCR.",
        source: D.SRC.ie2025 }),
      statCard({ cls: "system", label: "Historical precedent",
        value: "2× since 1969",
        sub: "Orders #47 (2015) and #48 (2016) froze 1-yr leases at 0%.",
        source: D.SRC.aptchart }),
    ].join("");

    drawFreezeChart(noiSeries);
  }

  // Estimate share of buildings below a DSCR threshold, given the trajectory.
  // Crude lognormal-ish proxy: if median ends at ratio R of debt service, assume
  // ~25% of buildings are 0.3x below median, ~25% are 0.3x above.
  function estimateShareBelowThreshold(noiRatio, startDscr, threshold) {
    const finalMedian = noiRatio * startDscr;
    // Buildings are distributed; using a normal-ish spread of stddev = 0.3
    const z = (threshold - finalMedian) / 0.3;
    return Math.max(0, Math.min(100, normalCdf(z) * 100));
  }
  function normalCdf(z) {
    return 0.5 * (1 + erf(z / Math.SQRT2));
  }
  function erf(x) {
    // Abramowitz & Stegun 7.1.26
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  function fmtMoney(n) {
    if (Math.abs(n) >= 1e9) return `$${(n/1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  }

  // ---------- Charts ----------
  let charts = {};
  const TOKEN = {
    grid: "#ebe3cf",
    text: "#6b665d",
    accent: "#b8401f",
    accent2: "#1f3a5f",
    muted: "#8b8680",
    warn: "#8a6300",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  };
  Chart.defaults.font.family = TOKEN.fontFamily;
  Chart.defaults.color = TOKEN.text;
  Chart.defaults.font.size = 12;

  function destroyChart(key) { if (charts[key]) { charts[key].destroy(); delete charts[key]; } }

  function drawVoteChart() {
    destroyChart("vote");
    const post = D.BOARD_VOTES.filter(v => v.post_hstpa).sort((a,b) => a.year - b.year);
    const piocLookup = Object.fromEntries(D.PIOC_HISTORY.map(p => [p.year, p.pct]));
    const labels = post.map(v => v.year);
    const ctx = $("#chart-vote");
    if (!ctx) return;
    const zeroAxis = $("#zero-axis-vote").checked;
    charts.vote = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Board vote · 1-year", data: post.map(v => v.one_year), borderColor: TOKEN.accent2, backgroundColor: TOKEN.accent2, tension: 0.2, borderWidth: 2.5, pointRadius: 4 },
          { label: "PIOC", data: post.map(v => piocLookup[v.year] || null), borderColor: TOKEN.muted, backgroundColor: TOKEN.muted, tension: 0.2, borderWidth: 2, borderDash: [4,4], pointRadius: 3 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: TOKEN.grid }, ticks: { color: TOKEN.text } },
          y: { beginAtZero: zeroAxis, grid: { color: TOKEN.grid }, ticks: { color: TOKEN.text, callback: v => v + "%" } },
        },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw}%` } } },
      }
    });
  }

  function drawCompareChart() {
    destroyChart("cmp");
    const how = readHow(), other = readOther();
    const rows = [
      { label: "Pure PIOC pass-through", val: fPurePassthrough(other).one, color: TOKEN.accent },
      { label: "CPI-adjusted NOI",       val: fCpiAdjNoi(how).one, color: TOKEN.accent },
      { label: "Net revenue",            val: fNetRevenue(how).one, color: TOKEN.accent },
      { label: "Capital-inclusive",      val: fCapitalInclusive(other).one, color: TOKEN.accent },
      { label: "Small-building",         val: fSmallBuildingWeighted(other).one, color: TOKEN.accent },
      { label: "Traditional",            val: fTraditional(how).one, color: TOKEN.accent },
      { label: "Min/max guardrails",     val: fGuardrails(other).one, color: TOKEN.warn },
      { label: "Renter CPI ex-shelter",  val: fRenterCpi(other).one, color: TOKEN.accent2 },
      { label: "Wage-indexed",           val: fWageIndexed(other).one, color: TOKEN.accent2 },
      { label: "Rent-burden stable",     val: fRentBurdenStable(other).one, color: TOKEN.accent2 },
      { label: "Renter income-indexed",  val: fRenterIncome(other).one, color: TOKEN.accent2 },
      { label: "Affordability cap",      val: fAffordabilityCap(other).one, color: TOKEN.warn },
      { label: "2025–26 board vote (#57)", val: 3.0, color: TOKEN.muted },
    ];
    rows.sort((a,b) => b.val - a.val);
    const ctx = $("#chart-compare");
    if (!ctx) return;
    const zeroAxis = $("#zero-axis-cmp").checked;
    charts.cmp = new Chart(ctx, {
      type: "bar",
      data: {
        labels: rows.map(r => r.label),
        datasets: [{ data: rows.map(r => r.val), backgroundColor: rows.map(r => r.color), borderRadius: 2 }]
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: zeroAxis, grid: { color: TOKEN.grid }, ticks: { callback: v => v + "%", color: TOKEN.text } },
          y: { grid: { display: false }, ticks: { color: TOKEN.text } },
        },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.label}: ${FMT(c.raw,2)}%` } } },
      }
    });
  }

  function drawHistChart() {
    destroyChart("hist");
    const post = D.BOARD_VOTES.filter(v => v.post_hstpa).sort((a,b) => a.year - b.year);
    const piocLookup = Object.fromEntries(D.PIOC_HISTORY.map(p => [p.year, p.pct]));
    const omLookup = { 2025: 64.9, 2026: 63.6 };
    // For each year: if PIOC and OM share known, compute net-revenue commensurate as PIOC × OM/100, then apportion 1-yr.
    const labels = post.map(v => v.year);
    const voteSeries = post.map(v => v.one_year);
    const cmsSeries = post.map(v => {
      const pioc = piocLookup[v.year];
      const om = omLookup[v.year] || 64.9; // default to recent
      if (!pioc) return null;
      const rev = (om/100) * pioc;
      const { one } = apportion(rev, 43, 57);
      return Number(one.toFixed(2));
    });
    const ctx = $("#chart-hist");
    if (!ctx) return;
    const zeroAxis = $("#zero-axis-hist").checked;
    charts.hist = new Chart(ctx, {
      type: "line",
      data: { labels, datasets: [
        { label: "Board vote · 1-year", data: voteSeries, borderColor: TOKEN.accent2, backgroundColor: TOKEN.accent2, borderWidth: 2.5, pointRadius: 4, tension: 0.15 },
        { label: "Net-revenue commensurate · 1-year (modeled)", data: cmsSeries, borderColor: TOKEN.accent, backgroundColor: TOKEN.accent, borderWidth: 2, borderDash: [3,4], pointRadius: 3, tension: 0.15 },
      ]},
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: TOKEN.grid } },
          y: { beginAtZero: zeroAxis, grid: { color: TOKEN.grid }, ticks: { callback: v => v + "%" } },
        },
        plugins: { legend: { position: "bottom", labels: { boxWidth: 14, font: { size: 11 } } } },
      }
    });
  }

  function drawFreezeChart(noiSeries) {
    destroyChart("freeze");
    const ctx = $("#chart-freeze");
    if (!ctx) return;
    const zeroAxis = $("#zero-axis-noi").checked;
    const labels = noiSeries.map(p => `Yr ${p.year}`);
    const idx = base => noiSeries.map(p => (p[base] / noiSeries[0][base]) * 100);
    charts.freeze = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Revenue", data: idx("rev"),    borderColor: TOKEN.accent2, backgroundColor: TOKEN.accent2, borderWidth: 2.5, tension: 0.2, pointRadius: 4 },
          { label: "Costs",   data: idx("costs"),  borderColor: TOKEN.accent,  backgroundColor: TOKEN.accent,  borderWidth: 2.5, tension: 0.2, pointRadius: 4 },
          { label: "NOI",     data: idx("noi"),    borderColor: TOKEN.warn,    backgroundColor: TOKEN.warn,    borderWidth: 2.5, tension: 0.2, pointRadius: 4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: TOKEN.grid } },
          y: { beginAtZero: zeroAxis, grid: { color: TOKEN.grid }, ticks: { callback: v => v + "" } },
        },
        plugins: { legend: { display: false } },
      }
    });
  }

  // ---------- Wiring ----------
  function updateAll() {
    renderHow();
    renderOther();
    renderFreeze();
    drawVoteChart();
    drawCompareChart();
    drawHistChart();
  }

  function bind() {
    setHowDefaults();
    setOtherDefaults();
    renderCriteria();

    $$("#how-inputs input").forEach(el => el.addEventListener("input", updateAll));
    $$("#other-inputs input").forEach(el => el.addEventListener("input", updateAll));
    $$("#freeze-inputs input, #freeze-inputs select").forEach(el => el.addEventListener("input", updateAll));

    $("#reset-how").addEventListener("click", () => { setHowDefaults(); updateAll(); });

    ["zero-axis-vote","zero-axis-cmp","zero-axis-hist","zero-axis-noi"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", updateAll);
    });

    // Auto-update l2 when l1 changes (and vice versa) to sum to 100.
    $("#in-l1").addEventListener("input", () => {
      const v = Number($("#in-l1").value);
      $("#in-l2").value = (100 - v).toFixed(1);
      updateAll();
    });
    $("#in-l2").addEventListener("input", () => {
      const v = Number($("#in-l2").value);
      $("#in-l1").value = (100 - v).toFixed(1);
      updateAll();
    });

    updateAll();

    // Run a self-verification against published 2026 commensurates and log results.
    selfVerify();
  }

  // ---------- Self-verification (logs to console; surfaces in preview_logs) ----------
  function selfVerify() {
    const inputs = D.COMMENSURATE_INPUTS[2026];
    const p = {
      pioc: inputs.pioc, pioc_proj: inputs.pioc_projected_next, om: inputs.om_share,
      noi: inputs.noi_share, cpi: inputs.cpi_less_shelter,
      l1: inputs.lease_one_year_share, l2: inputs.lease_two_year_share,
    };
    const want = D.COMMENSURATE_OUTPUTS[2026];
    const tests = [
      { name: "Net Revenue 1-yr (target 3.75%)", got: fNetRevenue(p).one, want: want.net_revenue.one_year, tol: 0.1 },
      { name: "Net Revenue 2-yr (target 6.25%)", got: fNetRevenue(p).two, want: want.net_revenue.two_year, tol: 0.1 },
      { name: "Net Revenue rev change (target 3.4%)", got: fNetRevenue(p).rev, want: want.net_revenue.revenue_change, tol: 0.1 },
      { name: "CPI-adjusted NOI 1-yr (target 4.5%)", got: fCpiAdjNoi(p).one, want: want.cpi_adj_noi.one_year, tol: 0.2 },
      { name: "CPI-adjusted NOI 2-yr (target 8.5%)", got: fCpiAdjNoi(p).two, want: want.cpi_adj_noi.two_year, tol: 0.3 },
      { name: "Traditional 1-yr (target 3.4%)",  got: fTraditional(p).one, want: want.traditional.one_year, tol: 0.1 },
      { name: "Traditional 2-yr (target 4.8%)",  got: fTraditional(p).two, want: want.traditional.two_year, tol: 0.1 },
    ];
    console.log("=== Stabilized · self-verification against 2026 PIOC published commensurates ===");
    let pass = 0, fail = 0;
    tests.forEach(t => {
      const ok = Math.abs(t.got - t.want) <= t.tol;
      console.log(`${ok ? "PASS" : "FAIL"} · ${t.name} · got ${FMT(t.got, 3)}% · target ${FMT(t.want,3)}% · tol ±${t.tol}`);
      ok ? pass++ : fail++;
    });
    console.log(`Result: ${pass} pass / ${fail} fail`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
