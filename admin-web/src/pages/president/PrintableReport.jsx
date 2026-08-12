import { Printer, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "../../assets/tpcL.jpg";
import api from "../../services/api";

// ── Theme tokens (kept local so this file has no dependency on Analytics.jsx) ──
const GREEN_DEEP = "#02451C";

/* ════════════════════════════════════════════════════════════════════════
   PRINTABLE REPORT
   ════════════════════════════════════════════════════════════════════════
   Self-contained printable/savable view of the analytics. Toggled in via
   `showReport` state in Analytics() — no route, no extra fetch,
   reuses the same `filtered` stats and `alignmentRows` already in memory
   there and passed down as props.

   ⚠ ACTION NEEDED: buildReportBreakdown() below reads
   `stats.employment_by_department`, a placeholder field name for the
   per-department employed/self-employed/unemployed split. Your backend
   doesn't return this yet under the /admin/dashboard response shape used
   elsewhere in Analytics.jsx. Once you confirm the real field name (or
   endpoint), update the single line marked below — everything else
   works as-is.
   ════════════════════════════════════════════════════════════════════════ */

export default function PrintableReport({
  stats,
  filters,
  departmentOptions,
  alignmentRows,
  onClose,
  preparedByName,
}) {
  const [freshStats, setFreshStats] = useState(null);
  const [freshAlignmentRows, setFreshAlignmentRows] = useState([]);

  // Fetch fresh data from backend at time of opening/printing
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const params = {};
        if (filters.department) params.department_id = filters.department;
        if (filters.batch) params.batch = filters.batch;

        const dashboardEndpoint =
          localStorage.getItem("userRole") === "admin"
            ? "/department-head/dashboard"
            : "/admin/dashboard";
        const [statsRes, alignRes] = await Promise.all([
          api.get(dashboardEndpoint, { params }),
          api.get("/admin/alumni/alignment/summary", { params }),
        ]);

        if (!mounted) return;
        if (statsRes.data?.status) setFreshStats(statsRes.data.data.stats);
        if (alignRes.data?.status)
          setFreshAlignmentRows(alignRes.data.data || []);
      } catch (e) {
        console.error("Failed to fetch fresh report data:", e);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const statsToUse = freshStats ?? stats;
  const alignmentToUse =
    freshAlignmentRows && freshAlignmentRows.length > 0
      ? freshAlignmentRows
      : alignmentRows;

  const overview = computeReportOverview(statsToUse, alignmentToUse);
  const breakdown = buildReportBreakdown(statsToUse, alignmentToUse);

  const deptLabel = filters.department
    ? (departmentOptions.find(
        (d) => String(d.id ?? d.name) === String(filters.department),
      )?.name ?? filters.department)
    : "All Departments";
  const batchLabel = filters.batch ? `Batch ${filters.batch}` : "All Batches";
  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="report-page">
      {/* Screen-only controls, hidden on print via .no-print */}
      <div className="no-print flex items-center justify-between max-w-3xl mx-auto px-6 pt-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={14} />
          Back to Analytics
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white"
          style={{ background: GREEN_DEEP }}
        >
          <Printer size={14} />
          Print / Save as PDF
        </button>
      </div>

      <div className="report-sheet">
        <header className="report-section report-header">
          <div className="report-logo-wrapper">
            <img
              src={logo}
              alt="Talibon Polytechnic College"
              className="report-logo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1>TPC Alumni Employability Report</h1>
          <p className="report-subtitle">AY 2026-2027</p>
          <p className="report-batch-subtitle">{batchLabel}</p>
        </header>

        <section className="report-section">
          <h2 className="report-section-title">Filters</h2>
          <div className="report-kv">
            <span>Department</span>
            <span>{deptLabel}</span>
          </div>
          <div className="report-kv">
            <span>Batch</span>
            <span>{batchLabel}</span>
          </div>
          <div className="report-kv">
            <span>Generated</span>
            <span>{generatedAt}</span>
          </div>
        </section>

        <section className="report-section">
          <h2 className="report-section-title">Overview</h2>
          <div className="report-overview-grid">
            <ReportStat
              label="Total Graduates"
              value={overview.totalGraduates}
            />
            <ReportStat label="Employed" value={overview.employed} />
            <ReportStat label="Self-employed" value={overview.selfEmployed} />
            <ReportStat label="Unemployed" value={overview.unemployed} />
            <ReportStat
              label="Employment Rate"
              value={`${overview.employmentRate.toFixed(1)}%`}
            />
            <ReportStat
              label="Alignment Rate"
              value={`${overview.alignmentRate.toFixed(1)}%`}
            />
          </div>
        </section>

        <section className="report-section report-avoid-break">
          <h2 className="report-section-title">Employment Status</h2>
          <ReportPieChart
            employed={overview.employed}
            unemployed={overview.unemployed}
            selfEmployed={overview.selfEmployed}
          />
        </section>

        <section className="report-section report-avoid-break">
          <h2 className="report-section-title">Job Alignment by Department</h2>
          <ReportBarChart rows={breakdown} />
        </section>

        <section className="report-section report-avoid-break">
          <h2 className="report-section-title">
            Job Alignment Detail by Department
          </h2>
          <ReportAlignmentTable rows={breakdown} />
        </section>

        <footer className="report-section report-footer report-avoid-break">
          <p>Prepared by</p>
          {/* ⚠ ACTION NEEDED: preparedByName isn't wired up from Analytics.jsx
              yet. It needs to come from whatever holds the logged-in user's
              name in your app (auth context, a `user` prop on Analytics, etc.)
              — pass it down from Analytics.jsx as a `preparedByName` prop on
              <PrintableReport />, e.g. preparedByName={user?.name}. Until
              that's wired up, this falls back to "Department Head" so the
              report still renders correctly. */}
          <p className="report-prepared-by">
            {preparedByName || "Department Head"}
          </p>
        </footer>
      </div>

      <style>{reportPrintStyles}</style>
    </div>
  );
}

/* ── Report data helpers ──────────────────────────────────────────────── */

function computeReportOverview(stats, alignmentRows) {
  const totalGraduates = stats?.total_graduates ?? 0;
  const employed = stats?.employed_alumni ?? 0;
  const selfEmployed = stats?.self_employed_alumni ?? 0;
  const unemployed = stats?.unemployed_alumni ?? 0;

  // employmentRate = (employed + selfEmployed) / totalGraduates.
  // Change to `employed / totalGraduates` if self-employed alumni
  // shouldn't count toward the headline employment rate.
  const employmentRate =
    totalGraduates > 0 ? ((employed + selfEmployed) / totalGraduates) * 100 : 0;

  // Overall alignment rate: weighted average across departments,
  // weighted by each department's employed count.
  const totalEmployedAcrossDepts = (alignmentRows || []).reduce(
    (sum, r) => sum + (r.total_employed || 0),
    0,
  );
  const alignmentRate =
    totalEmployedAcrossDepts > 0
      ? (alignmentRows || []).reduce(
          (sum, r) => sum + (r.alignment_rate || 0) * (r.total_employed || 0),
          0,
        ) / totalEmployedAcrossDepts
      : 0;

  return {
    totalGraduates,
    employed,
    selfEmployed,
    unemployed,
    employmentRate,
    alignmentRate,
  };
}

function buildReportBreakdown(stats, alignmentRows) {
  return (alignmentRows || []).map((row) => {
    const deptName = row.department?.name || `Department ${row.department_id}`;
    // ⚠ swap this field name once you confirm what your backend returns
    const empByDept = stats?.employment_by_department?.[deptName] || {};
    return {
      department: deptName,
      employed: empByDept.employed ?? 0,
      selfEmployed: empByDept.self_employed ?? 0,
      unemployed: empByDept.unemployed ?? 0,
      alignmentRate: row.alignment_rate ?? 0,
      // ── Job–course alignment counts (same fields AlignmentSummaryWidget
      // uses in Analytics.jsx) — carried through so the report can show
      // the actual "not aligned" figures, not just the alignment rate %.
      aligned: row.aligned ?? 0,
      notAligned: row.not_aligned ?? 0,
      noResponse: row.no_response ?? 0,
      totalEmployed: row.total_employed ?? 0,
    };
  });
}

/* ── Report sub-components & print-safe SVG charts ────────────────────────
   NOTE: these are plain SVG, not <canvas>. Canvas bitmaps aren't reliably
   flushed before the browser takes its print snapshot, so they can render
   blank in print/PDF output. SVG is part of the DOM and prints consistently. */

function ReportStat({ label, value }) {
  return (
    <div className="report-stat">
      <span className="report-stat-label">{label}</span>
      <span className="report-stat-value">{value}</span>
    </div>
  );
}

function ReportPieChart({ employed, unemployed, selfEmployed }) {
  const data = [
    { name: "Employed", value: employed, color: "#02451C" },
    { name: "Unemployed", value: unemployed, color: "#ef4444" },
    { name: "Self-employed", value: selfEmployed, color: "#2563eb" },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="report-empty">No data available.</p>;

  const cx = 100,
    cy = 100,
    r = 80;
  let startAngle = -Math.PI / 2;

  // A single category at 100% produces start/end angles that land on the
  // same coordinate (cos/sin are periodic over 2π), so the arc path below
  // degenerates to a zero-area line and nothing renders. Draw a plain
  // circle for that one case instead of an arc path.
  const isFullCircle = data.length === 1;

  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const endAngle = startAngle + sweep;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    startAngle = endAngle;
    return { ...d, path, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div className="report-chart-row">
      <svg viewBox="0 0 200 200" width="200" height="200">
        {isFullCircle ? (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={slices[0].color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        ) : (
          slices.map((s) => (
            <path
              key={s.name}
              d={s.path}
              fill={s.color}
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))
        )}
      </svg>
      <ul className="report-legend">
        {slices.map((s) => (
          <li key={s.name}>
            <span
              className="report-legend-dot"
              style={{ background: s.color }}
            />
            {s.name}: {s.value} ({s.pct}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportBarChart({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="report-empty">No alignment data available.</p>;
  }

  const barHeight = 22,
    gap = 10,
    chartWidth = 480,
    labelWidth = 110;
  const maxBarWidth = chartWidth - labelWidth - 50;
  const height = rows.length * (barHeight + gap);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${height}`}
      width="100%"
      style={{ maxWidth: chartWidth }}
    >
      {rows.map((row, i) => {
        const y = i * (barHeight + gap);
        const rate = Math.max(0, Math.min(100, row.alignmentRate || 0));
        const width = (rate / 100) * maxBarWidth;
        return (
          <g key={row.department}>
            <text x={0} y={y + barHeight / 2 + 4} fontSize="11" fill="#374151">
              {row.department}
            </text>
            <rect
              x={labelWidth}
              y={y}
              width={maxBarWidth}
              height={barHeight}
              fill="#f3f4f6"
              rx="3"
            />
            <rect
              x={labelWidth}
              y={y}
              width={width}
              height={barHeight}
              fill="#02451C"
              rx="3"
            />
            <text
              x={labelWidth + maxBarWidth + 8}
              y={y + barHeight / 2 + 4}
              fontSize="11"
              fill="#374151"
            >
              {rate}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Per-department alignment detail table ─────────────────────────────────
// Shows the actual Aligned / Not Aligned / No Response counts behind each
// department's alignment rate — the bar chart above only shows the rate %,
// this makes the "not aligned" figures explicit in the printed report.
function ReportAlignmentTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="report-empty">No alignment data available.</p>;
  }

  return (
    <table className="report-align-table">
      <thead>
        <tr>
          <th>Department</th>
          <th>Employed</th>
          <th>Aligned</th>
          <th>Not Aligned</th>
          <th>No Response</th>
          <th>Alignment Rate</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.department}>
            <td>{row.department}</td>
            <td>{row.totalEmployed}</td>
            <td>{row.aligned}</td>
            <td className="report-align-not">{row.notAligned}</td>
            <td>{row.noResponse}</td>
            <td>{row.alignmentRate}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Report print stylesheet ──────────────────────────────────────────── */

const reportPrintStyles = `
  .report-page {
    background: #f3f4f6;
    min-height: 100vh;
    padding-bottom: 48px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .report-sheet {
    max-width: 720px;
    margin: 24px auto 0;
    background: #ffffff;
    color: #111827;
    padding: 48px 56px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    border-radius: 4px;
  }
  .report-section { margin-bottom: 28px; }
  .report-header {
    text-align: center;
    border-bottom: 2px solid #02451C;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .report-header h1 { font-size: 20px; font-weight: 700; color: #02451C; margin: 0 0 4px; }
  .report-subtitle { font-size: 13px; color: #6b7280; margin: 0; }
  .report-batch-subtitle { font-size: 14px; font-weight: 700; color: #02451C; margin: 6px 0 0; }
  .report-section-title {
    font-size: 13px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.04em; color: #02451C;
    border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 0 0 12px;
  }
    .report-logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.report-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}
  .report-kv {
    display: flex; justify-content: space-between; font-size: 13px;
    padding: 3px 0; border-bottom: 1px dotted #e5e7eb;
  }
  .report-kv span:first-child { color: #6b7280; }
  .report-kv span:last-child { font-weight: 600; }
  .report-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .report-stat { display: flex; flex-direction: column; gap: 2px; }
  .report-stat-label { font-size: 11px; color: #6b7280; }
  .report-stat-value { font-size: 18px; font-weight: 700; color: #111827; }
  .report-chart-row { display: flex; align-items: center; gap: 24px; }
  .report-legend { list-style: none; margin: 0; padding: 0; font-size: 12px; color: #374151; }
  .report-legend li { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .report-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .report-empty { font-size: 12px; color: #9ca3af; }
  .report-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; }
  .report-prepared-by { margin-top: 24px; font-weight: 600; }
  .report-avoid-break { break-inside: avoid; page-break-inside: avoid; }
  .report-align-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .report-align-table th {
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
    padding: 6px 8px;
  }
  .report-align-table td {
    padding: 6px 8px;
    border-bottom: 1px dotted #e5e7eb;
    color: #374151;
  }
  .report-align-table tr:last-child td { border-bottom: none; }
  .report-align-not { color: #b91c1c; font-weight: 600; }

  @media print {
    /* Chrome/Edge still print the browser's default URL/date header/footer
       unless the page is isolated and the print margins are adjusted. We keep
       the report as the only visible content and set a long bond-paper page. */
    html, body {
      margin: 0 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body * { visibility: hidden !important; }
    .report-page, .report-page *:not(.no-print):not(.no-print *) {
      visibility: visible !important;
    }
    .no-print, .no-print * {
      visibility: hidden !important;
      display: none !important;
    }

    .report-page {
      position: static !important;
      top: auto !important;
      left: auto !important;
      width: 100% !important;
      background: #fff !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
    }

    .report-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      max-width: none !important;
      width: 100% !important;
      padding: 0.25in 0.35in !important;
      border: none !important;
      border-radius: 0 !important;
    }

    @page {
      size: legal portrait;
      margin: 10mm 12mm;
    }
  }
`;
