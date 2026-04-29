// Stabilized — sourced data file.
// Every datum carries an explicit source URL so the dashboard can render
// click-through citations next to each number.

const SRC = {
  slatkin: "https://www.vitalcitynyc.org/the-rent-is-too-damn-high-but-also-too-low/",
  armlovich: "https://www.vitalcitynyc.org/a-housing-roadmap-for-new-yorks-next-mayor/",
  cpc_brief: "https://communityp.com/research-publications/",
  mamdani_appts: "https://www.nyc.gov/mayors-office/news/2026/02/mayor-mamdani-announces-six-appointees-to-the-rent-guidelines-bo",
  rgb_meetings: "https://rentguidelinesboard.cityofnewyork.us/2026-meetings/",
  rsl: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2019/08/appendixa.pdf",
  admincode: "https://nycadmincode.readthedocs.io/t26/c04/",
  pioc2026: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2026/04/2026-PIOC.pdf",
  pioc2025: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2025/04/2025-PIOC.pdf",
  pioc2024: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2024/04/2024-PIOC.pdf",
  pioc2023: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2023/04/2023-PIOC.pdf",
  pioc2022: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2022/04/2022-PIOC.pdf",
  pioc2021: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2021/04/2021-PIOC.pdf",
  pioc2020: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2020/04/2020-PIOC.pdf",
  pioc2019: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2019/04/2019-PIOC.pdf",
  aptchart: "https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2025/07/RGB-Apartment-Chart.pdf",
  order57: "https://rentguidelinesboard.cityofnewyork.us/2025-26-apartment-loft-order-57/",
  order56: "https://rentguidelinesboard.cityofnewyork.us/2024-25-apartment-loft-order-56/",
  order55: "https://rentguidelinesboard.cityofnewyork.us/2023-24-apartment-loft-order-55/",
  order54: "https://rentguidelinesboard.cityofnewyork.us/2022-23-apartment-loft-order-54/",
  order53: "https://rentguidelinesboard.cityofnewyork.us/2021-22-apartment-loft-order-53/",
  order52: "https://rentguidelinesboard.cityofnewyork.us/2020-21-apartment-loft-order-52/",
  order51: "https://rentguidelinesboard.cityofnewyork.us/2019-20-apartment-loft-order-51/",
  research: "https://rentguidelinesboard.cityofnewyork.us/research/",
  hstpa: "https://www.nysenate.gov/legislation/bills/2019/s6458",
  ie2025: "https://rentguidelinesboard.cityofnewyork.us/research/income-and-expense-study/",
  ia2025: "https://rentguidelinesboard.cityofnewyork.us/research/income-and-affordability-study/",
  hsr: "https://rentguidelinesboard.cityofnewyork.us/research/housing-supply-report/",
  ms: "https://rentguidelinesboard.cityofnewyork.us/research/mortgage-survey/",
  bls_cpi: "https://www.bls.gov/regions/new-york-new-jersey/news-release/consumerpriceindex_newyorkarea.htm",
  bls_qcew: "https://www.bls.gov/cew/",
  acs: "https://www.census.gov/programs-surveys/acs",
  taxbills: "https://github.com/talos/nyc-stabilization-unit-counts",
  hcr: "https://hcr.ny.gov/",
};

// Statutory criteria the board must consider (RSL §26-510(b)).
const STATUTORY = [
  { id: 1, label: "Real estate taxes and water/sewer rates", report: "Price Index of Operating Costs (PIOC)", source: SRC.rsl },
  { id: 2, label: "Gross operating and maintenance costs (insurance, fees, fuel, labor)", report: "PIOC + Income & Expense Study", source: SRC.rsl },
  { id: 3, label: "Cost and availability of financing (interest rates)", report: "Mortgage Survey Report", source: SRC.rsl },
  { id: 4, label: "Overall supply of housing and overall vacancy rates", report: "Housing Supply Report", source: SRC.rsl },
  { id: 5, label: "Cost of living indices", report: "Income & Affordability Study (CPI)", source: SRC.rsl },
  { id: 6, label: "Such other data as may be made available", report: "Public testimony, supplementary sources", source: SRC.rsl },
];

// PIOC component breakdown for the most recent year (2026 PIOC, published April 9, 2026).
// Source: 2026 PIOC report.
const PIOC_2026_COMPONENTS = [
  { name: "Taxes", change: 2.6, weight: 27.9, source: SRC.pioc2026 },
  { name: "Labor costs", change: 3.0, weight: null, source: SRC.pioc2026 },
  { name: "Fuel", change: 11.0, weight: null, source: SRC.pioc2026 },
  { name: "Utilities", change: 5.6, weight: null, source: SRC.pioc2026 },
  { name: "Insurance costs", change: 10.5, weight: 9.5, source: SRC.pioc2026 },
  { name: "Maintenance", change: 6.0, weight: null, source: SRC.pioc2026 },
  { name: "Administrative costs", change: 4.8, weight: null, source: SRC.pioc2026 },
];

// Annual PIOC overall % change. Verified entries cite their specific PIOC report.
// Earlier years where a precise figure has not been independently verified in this
// build are marked verified=false and link to the RGB Research archive.
const PIOC_HISTORY = [
  { year: 2019, pct: 6.1, verified: false, source: SRC.research, note: "see 2019 PIOC report" },
  { year: 2020, pct: 3.3, verified: false, source: SRC.research, note: "see 2020 PIOC report" },
  { year: 2021, pct: 2.0, verified: false, source: SRC.research, note: "see 2021 PIOC report" },
  { year: 2022, pct: 4.2, verified: false, source: SRC.research, note: "see 2022 PIOC report" },
  { year: 2023, pct: 8.1, verified: false, source: SRC.research, note: "see 2023 PIOC report" },
  { year: 2024, pct: 3.9, verified: true, source: SRC.pioc2025, note: "stated in 2025 PIOC report context" },
  { year: 2025, pct: 6.3, verified: true, source: SRC.pioc2025, note: "2025 PIOC overall, page 1" },
  { year: 2026, pct: 5.3, verified: true, source: SRC.pioc2026, note: "2026 PIOC overall, page 3" },
];

// Core PIOC (excludes fuel oil, natural gas, steam) — newer alternative measure.
const CORE_PIOC = [
  { year: 2026, pct: 4.8, source: SRC.pioc2026 },
  { year: 2025, pct: null, source: SRC.pioc2025 },
];

// Commensurate inputs by year — these are the staff's published parameters used
// to translate PIOC into a recommended rent guideline. All come straight from the
// PIOC report endnotes / methodology section.
const COMMENSURATE_INPUTS = {
  2026: {
    pioc: 5.3,
    pioc_projected_next: 4.1,
    om_share: 63.6,           // % of revenue going to operating costs
    noi_share: 36.4,           // % of revenue going to NOI
    cpi_less_shelter: 2.7,
    cpi_all: 3.3,
    lease_one_year_share: 43.6,
    lease_two_year_share: 56.4,
    source: SRC.pioc2026,
  },
  2025: {
    pioc: 6.3,
    pioc_projected_next: null,
    om_share: 64.9,
    noi_share: 35.1,
    cpi_less_shelter: null,    // 2025 used full CPI of 4.0%
    cpi_all: 4.0,
    lease_one_year_share: 42.4,
    lease_two_year_share: 57.6,
    source: SRC.pioc2025,
  },
};

// Staff-published commensurate outputs, by year, by formula variant.
// Each entry = the headline numbers the RGB published, used to validate the calculator.
const COMMENSURATE_OUTPUTS = {
  2026: {
    net_revenue:    { one_year: 3.75, two_year: 6.25, revenue_change: 3.4, source: SRC.pioc2026 },
    cpi_adj_noi:    { one_year: 4.5,  two_year: 8.5,  revenue_change: 4.4, source: SRC.pioc2026 },
    traditional:    { one_year: 3.4,  two_year: 4.8,  revenue_change: null, source: SRC.pioc2026 },
  },
  2025: {
    net_revenue:    { one_year: null, two_year: null, revenue_change: 4.1, source: SRC.pioc2025 },
    cpi_adj_noi:    { one_year: null, two_year: null, revenue_change: 5.5, source: SRC.pioc2025 },
    traditional:    { one_year: null, two_year: null, revenue_change: null, source: SRC.pioc2025 },
  },
};

// Adopted board votes — full apartment-order chart. Source: 2025 RGB Apartment Chart PDF.
// post_hstpa flag marks orders adopted after HSTPA 2019.
const BOARD_VOTES = [
  { order: 57, year: 2025, period: "Oct 1, 2025 – Sept 30, 2026", one_year: 3.0,  two_year: 4.5,  post_hstpa: true,  source: SRC.order57 },
  { order: 56, year: 2024, period: "Oct 1, 2024 – Sept 30, 2025", one_year: 2.75, two_year: 5.25, post_hstpa: true,  source: SRC.order56 },
  { order: 55, year: 2023, period: "Oct 1, 2023 – Sept 30, 2024", one_year: 3.0,  two_year: 2.975, post_hstpa: true, two_year_note: "split: 2.75% year 1, 3.20% year 2", source: SRC.order55 },
  { order: 54, year: 2022, period: "Oct 1, 2022 – Sept 30, 2023", one_year: 3.25, two_year: 5.0,  post_hstpa: true,  source: SRC.order54 },
  { order: 53, year: 2021, period: "Oct 1, 2021 – Sept 30, 2022", one_year: 0.75, two_year: 2.5,  post_hstpa: true,  one_year_note: "split: 0% first 6 mo, 1.5% last 6 mo (avg 0.75%)", source: SRC.order53 },
  { order: 52, year: 2020, period: "Oct 1, 2020 – Sept 30, 2021", one_year: 0.0,  two_year: 0.5,  post_hstpa: true,  two_year_note: "split: 0% year 1, 1.0% year 2", source: SRC.order52 },
  { order: 51, year: 2019, period: "Oct 1, 2019 – Sept 30, 2020", one_year: 1.5,  two_year: 2.5,  post_hstpa: true,  source: SRC.order51 },
  { order: 50, year: 2018, period: "Oct 1, 2018 – Sept 30, 2019", one_year: 1.5,  two_year: 2.5,  post_hstpa: false, source: SRC.aptchart },
  { order: 49, year: 2017, period: "Oct 1, 2017 – Sept 30, 2018", one_year: 1.25, two_year: 2.0,  post_hstpa: false, source: SRC.aptchart },
  { order: 48, year: 2016, period: "Oct 1, 2016 – Sept 30, 2017", one_year: 0.0,  two_year: 2.0,  post_hstpa: false, source: SRC.aptchart, freeze_one_year: true },
  { order: 47, year: 2015, period: "Oct 1, 2015 – Sept 30, 2016", one_year: 0.0,  two_year: 2.0,  post_hstpa: false, source: SRC.aptchart, freeze_one_year: true, note: "first 1-yr freeze in RGB history" },
  { order: 46, year: 2014, period: "Oct 1, 2014 – Sept 30, 2015", one_year: 1.0,  two_year: 2.75, post_hstpa: false, source: SRC.aptchart },
  { order: 45, year: 2013, period: "Oct 1, 2013 – Sept 30, 2014", one_year: 4.0,  two_year: 7.75, post_hstpa: false, source: SRC.aptchart },
];

// Estimated rent-stabilized housing stock (citywide), used for the freeze module
// scaling. These are aggregate counts owners file with HCR/DOF.
const STOCK = {
  total_units: 1010000,        // approx ~1 million stabilized units citywide
  median_legal_rent_2024: 1500, // approx; placeholder for editable input
  source_count: SRC.taxbills,
  source_rent: SRC.research,
  note: "User can adjust median rent; default is an editable approximation. Replace with verified RGB Housing NYC figure before publication.",
};

// Income & Expense study summary (most recent published RGB I&E figures).
// O&M to revenue ratio drives the commensurate; NOI margin governs how a freeze
// compresses landlord cash flow.
const IE_SUMMARY = {
  om_to_revenue_pct: 63.6,   // matches 2026 PIOC commensurate input
  noi_margin_pct: 36.4,
  distressed_share_pct: null, // RGB defines distressed as O&M > revenue; latest figure to insert from current I&E
  source: SRC.ie2025,
};

// ACS / BLS supporting data. Stub values — editable in the dashboard inputs.
const SUPPORTING = {
  cpi_ny_recent_pct: 3.3,            // CPI-U NY-Newark-Jersey City annual, latest
  cpi_ex_shelter_pct: 2.7,
  qcew_nyc_wage_growth_pct: 4.6,     // approx recent NYC private-sector avg wage growth
  acs_median_renter_income_growth_pct: 3.8,
  acs_median_gross_rent_growth_pct: 4.0,
  source_cpi: SRC.bls_cpi,
  source_qcew: SRC.bls_qcew,
  source_acs: SRC.acs,
};

// Freeze natural experiment — 1-year leases were frozen in 2015-16 (Order #47) and
// 2016-17 (Order #48). The dashboard surfaces these as the only U.S. precedent for
// a board-imposed rent freeze on the renewal stock and links readers to the
// Income & Expense and Income & Affordability follow-up reports for those years.
const FREEZE_PRECEDENT = {
  years: [2015, 2016],
  one_year_pct: 0.0,
  two_year_pct: 2.0,
  followup_reports: SRC.ie2025,
  source: SRC.aptchart,
};

// ---- Bifurcation: the stock isn't homogeneous (Slatkin, Vital City, 2025) ----
// Buildings with mostly market-rate units (concentrated in core Manhattan) are
// doing fine financially; 100%-stabilized prewar buildings (Bronx, outer
// boroughs) face a long-running cost-vs-revenue squeeze. The "average" hides
// both ends.
const BIFURCATION = {
  core_manhattan_pct_majority_market: 67,   // ~2/3 of core-Manhattan stabilized buildings are mostly market-rate
  core_manhattan_pct_fully_stabilized: 16,  // only 16% are 100% rent-stabilized
  bronx_pct_fully_stabilized: 75,
  outside_core_manhattan_pct_fully_stabilized: 61, // % of stabilized UNITS in 100% stabilized buildings
  core_2022_2023_revenue_growth: 12.2,
  core_2022_2023_cost_growth: 3.4,
  bronx_2022_2023_revenue_growth: 3.8,
  bronx_2022_2023_cost_growth: 4.6,
  decade_outside_core_expense_lead_pct: 26,  // 2013-2023, expenses grew 26% faster than income outside core Manhattan
  source: "https://www.vitalcitynyc.org/the-rent-is-too-damn-high-but-also-too-low/",
};

// ---- Distress threshold (RGB Income & Expense Study, Table 8) ----
// Buildings with operating costs >= rental income, before debt service.
// Per Armlovich (Vital City, 2025), this share is ~10% of regulated buildings,
// concentrated in fully rent-stabilized prewar buildings outside core Manhattan.
const DISTRESS = {
  share_at_or_below_breakeven: 10,         // % of regulated buildings with O&M ≥ rental income
  scaled_units_at_risk: 100000,            // approx units across distressed buildings
  cost_to_rehab_per_unit_low: 250000,      // $ per unit rehab cost (after deferred maintenance)
  cost_to_rehab_per_unit_high: 500000,
  one_year_increases_below_inflation: 10,  // 10 straight 1-yr increases below inflation per Armlovich
  source_table8: "https://rentguidelinesboard.cityofnewyork.us/research/income-and-expense-study/",
  source_armlovich: "https://www.vitalcitynyc.org/a-housing-roadmap-for-new-yorks-next-mayor/",
};

// ---- The 2026 cycle (the upcoming June 2026 vote, Order #58) ----
const CYCLE_2026 = {
  order_number: 58,
  lease_period: "Oct 1, 2026 – Sept 30, 2027",
  pioc_published: "April 9, 2026",
  preliminary_range_one_year: [2, 5],
  preliminary_range_two_year: [4, 7],
  expected_final_vote: "Late June 2026",
  mayor: "Mamdani (took office Jan 2026)",
  appointees_announced: "February 2026",
  source_meetings: "https://rentguidelinesboard.cityofnewyork.us/2026-meetings/",
  source_appointees: "https://www.nyc.gov/mayors-office/news/2026/02/mayor-mamdani-announces-six-appointees-to-the-rent-guidelines-bo",
};

window.STABILIZED_DATA = {
  SRC, STATUTORY, PIOC_2026_COMPONENTS, PIOC_HISTORY, CORE_PIOC,
  COMMENSURATE_INPUTS, COMMENSURATE_OUTPUTS, BOARD_VOTES, STOCK,
  IE_SUMMARY, SUPPORTING, FREEZE_PRECEDENT,
  BIFURCATION, DISTRESS, CYCLE_2026,
};
