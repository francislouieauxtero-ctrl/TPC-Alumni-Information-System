import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import alumniService from "../../services/alumniService";
import PrintableReport from "./PrintableReport";
import {
  Users,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  BriefcaseIcon,
  SlidersHorizontal,
  X,
  ChevronDown,
  Printer,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Theme tokens ──────────────────────────────────────────────────────────
const GREEN_DEEP = "#02451C";
const GREEN_MID = "#035c25";
const GREEN_SOFT = "#e8f4ed"; // tinted bg for pills / banners
const GREEN_RING = "#86c99a"; // focus ring

// ── Color palettes ────────────────────────────────────────────────────────
const STATUS_COLORS = [GREEN_DEEP, "#d97706", "#ef4444", "#8b5cf6"];
const EMPLOY_COLORS = [GREEN_DEEP, "#ef4444", "#2563eb"];
const EMPLOY_LABEL_COLORS = ["#16a34a", "#ef4444", "#3b82f6"];
const ALIGNMENT_LINE_COLOR = "#3b9b6d";
const ALIGNMENT_LINE2_COLOR = "#60a5fa";
const ALIGNMENT_CHART_BACKGROUND = "#ffffff";

// ── FilterBar ─────────────────────────────────────────────────────────────
function FilterBar({
  departments,
  batches,
  filters,
  onChange,
  departmentLocked = false,
}) {
  const hasFilters = filters.department !== "" || filters.batch !== "";

  const selectBase = {
    appearance: "none",
    height: "36px",
    paddingLeft: "12px",
    paddingRight: "32px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#1a2e1f",
    background: "white",
    border: `1.5px solid #c8ddd0`,
    borderRadius: "8px",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const activeSelectStyle = (val) =>
    val
      ? {
          ...selectBase,
          borderColor: GREEN_DEEP,
          color: GREEN_DEEP,
          background: GREEN_SOFT,
          fontWeight: 600,
        }
      : selectBase;

  const clearOne = (key) => onChange({ ...filters, [key]: "" });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px",
        background: "white",
        border: "1.5px solid #dce8e0",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(2,69,28,0.06)",
      }}
    >
      {/* Label */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: 700,
          color: GREEN_DEEP,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          flexShrink: 0,
        }}
      >
        <SlidersHorizontal size={13} />
        Filter
      </span>

      {/* Divider */}
      <span
        style={{ width: 1, height: 20, background: "#dce8e0", flexShrink: 0 }}
      />

      {/* Department select */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
          style={activeSelectStyle(filters.department)}
          onFocus={(e) =>
            (e.target.style.boxShadow = `0 0 0 3px ${GREEN_RING}55`)
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
          disabled={departmentLocked}
        >
          {!departmentLocked ? (
            <option value="">All Departments</option>
          ) : (
            <option value={filters.department || ""}>
              {localStorage.getItem("userDepartmentName") || "My Department"}
            </option>
          )}
          {!departmentLocked &&
            departments.map((dept) => (
              <option key={dept.id ?? dept.name} value={dept.id ?? dept.name}>
                {dept.name}
              </option>
            ))}
        </select>
        <ChevronDown
          size={13}
          style={{
            position: "absolute",
            right: 9,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: filters.department ? GREEN_DEEP : "#9ca3af",
          }}
        />
      </div>

      {/* Batch select */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={filters.batch}
          onChange={(e) => onChange({ ...filters, batch: e.target.value })}
          style={activeSelectStyle(filters.batch)}
          onFocus={(e) =>
            (e.target.style.boxShadow = `0 0 0 3px ${GREEN_RING}55`)
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        >
          <option value="">All Batches</option>
          {batches.map((year) => (
            <option key={year} value={year}>
              Batch {year}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          style={{
            position: "absolute",
            right: 9,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: filters.batch ? GREEN_DEEP : "#9ca3af",
          }}
        />
      </div>

      {/* Active pills */}
      {filters.department && (
        <ActivePill
          label={
            departments.find(
              (d) => String(d.id ?? d.name) === String(filters.department),
            )?.name ?? filters.department
          }
          prefix="Dept"
          onRemove={() => clearOne("department")}
        />
      )}
      {filters.batch && (
        <ActivePill
          label={`Batch ${filters.batch}`}
          onRemove={() => clearOne("batch")}
        />
      )}

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={() => onChange({ department: "", batch: "" })}
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            padding: "2px 4px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.target.style.color = GREEN_DEEP)}
          onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function ActivePill({ label, prefix, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: GREEN_SOFT,
        border: `1px solid ${GREEN_RING}`,
        color: GREEN_DEEP,
        borderRadius: "999px",
        padding: "3px 10px 3px 10px",
        fontSize: "12px",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {prefix && (
        <span style={{ fontWeight: 400, opacity: 0.65, fontSize: "11px" }}>
          {prefix}:{" "}
        </span>
      )}
      {label}
      <button
        onClick={onRemove}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: GREEN_MID,
          marginLeft: "2px",
        }}
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  );
}

// ── Filter notice banner ──────────────────────────────────────────────────
function FilterBanner({ filters, departments }) {
  const parts = [];
  if (filters.department) {
    const name =
      departments.find(
        (d) => String(d.id ?? d.name) === String(filters.department),
      )?.name ?? filters.department;
    parts.push(`Department: ${name}`);
  }
  if (filters.batch) parts.push(`Batch ${filters.batch}`);
  if (parts.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: GREEN_SOFT,
        border: `1px solid ${GREEN_RING}`,
        borderRadius: "8px",
        padding: "9px 14px",
        fontSize: "12.5px",
        color: GREEN_DEEP,
        fontWeight: 500,
      }}
    >
      <SlidersHorizontal size={13} style={{ flexShrink: 0 }} />
      <span>
        Showing filtered results —{" "}
        {parts.map((p, i) => (
          <span key={i}>
            {i > 0 && <span style={{ opacity: 0.4, margin: "0 6px" }}>·</span>}
            <strong>{p}</strong>
          </span>
        ))}
      </span>
    </div>
  );
}

// ── Donut chart (Canvas) ─────────────────────────────────────────────────
function DonutChart({ data, colors, size = 130, thickness = 28 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    let startAngle = -Math.PI / 2;
    data.forEach((segment, i) => {
      const sweep = (segment.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, r - thickness, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sweep;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r + 2, startAngle - 0.01, startAngle + 0.01);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    ctx.fillStyle = "#111827";
    ctx.font = `600 ${Math.round(size * 0.18)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy);
  }, [data, colors, size, thickness]);

  return <canvas ref={canvasRef} style={{ flexShrink: 0 }} />;
}

// ── Pie Chart (Canvas) ────────────────────────────────────────────────────
// Canvas width is now computed dynamically from the actual label text widths
// (via an offscreen measuring context) so leader-line labels like
// "Self-employed 100%" can never get clipped by a fixed canvas boundary,
// regardless of how long a department/status name is.
function PieChartWithLabels({ data, colors, labelColors }) {
  const canvasRef = useRef(null);
  const H = 260;
  const pieR = 80;
  const labelR = pieR + 34;
  const tailLen = 16;
  const font = "600 11px sans-serif";
  const minHalfWidth = 170; // keeps the pie itself from getting too small

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const total = data.reduce((s, d) => s + d.value, 0);

    // ── Pass 1: measure label widths with an offscreen context ──────────
    const measureCtx = document.createElement("canvas").getContext("2d");
    measureCtx.font = font;
    let maxLabelWidth = 0;
    if (total > 0) {
      data.forEach((segment) => {
        const pct = Math.round((segment.value / total) * 100);
        const text = `${segment.name} ${pct}%`;
        const w = measureCtx.measureText(text).width;
        if (w > maxLabelWidth) maxLabelWidth = w;
      });
    }

    // Half-width needed = pie radius + leader tail + gap + longest label text
    const neededHalfWidth = Math.max(
      minHalfWidth,
      labelR + 2 + tailLen + 6 + maxLabelWidth,
    );
    const W = Math.ceil(neededHalfWidth * 2);
    const cx = W / 2;
    const cy = H / 2;

    // ── Pass 2: actually draw at the computed size ───────────────────────
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    if (total === 0) return;

    let startAngle = -Math.PI / 2;
    data.forEach((segment, i) => {
      const sweep = (segment.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, pieR, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      startAngle += sweep;
    });

    startAngle = -Math.PI / 2;
    data.forEach((segment, i) => {
      const sweep = (segment.value / total) * 2 * Math.PI;
      const midAngle = startAngle + sweep / 2;
      const pct = Math.round((segment.value / total) * 100);
      const x1 = cx + Math.cos(midAngle) * (pieR + 4);
      const y1 = cy + Math.sin(midAngle) * (pieR + 4);
      const x2 = cx + Math.cos(midAngle) * (labelR + 2);
      const y2 = cy + Math.sin(midAngle) * (labelR + 2);
      const isRight = Math.cos(midAngle) >= 0;
      const x3 = x2 + (isRight ? tailLen : -tailLen);
      const y3 = y2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.textAlign = isRight ? "left" : "right";
      ctx.textBaseline = "bottom";
      ctx.font = font;
      ctx.fillStyle = labelColors[i % labelColors.length];
      ctx.fillText(`${segment.name} ${pct}%`, x3 + (isRight ? 3 : -3), y3 - 1);
      startAngle += sweep;
    });
  }, [data, colors, labelColors]);

  return <canvas ref={canvasRef} style={{ flexShrink: 0, display: "block" }} />;
}

// ── Alignment Line Chart ──────────────────────────────────────────────────
function AlignmentLineChart({ rows }) {
  if (!rows || rows.length === 0) return null;
  const chartData = rows.map((row) => ({
    name:
      row.department?.name?.length > 8
        ? row.department.name.slice(0, 8) + "…"
        : row.department?.name || `Dept ${row.department_id}`,
    rate:
      row.total_employed > 0
        ? ((row.no_response ?? 0) / row.total_employed) * 100
        : 0,
    employed: row.total_employed ?? 0,
  }));

  return (
    <div
      style={{
        background: ALIGNMENT_CHART_BACKGROUND,
        borderRadius: "12px",
        padding: "20px 20px 8px",
      }}
    >
      <p
        style={{
          color: "#1f2937",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        No-Response Rate by Department
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "12px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: 24,
              height: 2,
              background: ALIGNMENT_LINE_COLOR,
              display: "inline-block",
              borderRadius: 2,
            }}
          />
          <span style={{ fontSize: "11px", color: "#4b5563" }}>
            No-Response %
          </span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: 24,
              height: 2,
              background: ALIGNMENT_LINE2_COLOR,
              display: "inline-block",
              borderRadius: 2,
              borderTop: "2px dashed " + ALIGNMENT_LINE2_COLOR,
            }}
          />
          <span style={{ fontSize: "11px", color: "#4b5563" }}>
            Employed count
          </span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 12, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: `1px solid ${GREEN_RING}33`,
              borderRadius: "8px",
              fontSize: "11px",
              color: "#1f2937",
              boxShadow: "0 4px 16px rgba(15,23,42,0.12)",
            }}
            labelStyle={{ color: "#4b5563", marginBottom: "4px" }}
            formatter={(value, name) =>
              name === "rate"
                ? [`${value}%`, "No-response rate"]
                : [value, "Employed"]
            }
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="rate"
            stroke={ALIGNMENT_LINE_COLOR}
            strokeWidth={2.5}
            dot={{
              fill: ALIGNMENT_LINE_COLOR,
              r: 4,
              strokeWidth: 2,
              stroke: GREEN_DEEP,
            }}
            activeDot={{
              r: 6,
              fill: ALIGNMENT_LINE_COLOR,
              stroke: GREEN_DEEP,
              strokeWidth: 2,
            }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="employed"
            stroke={ALIGNMENT_LINE2_COLOR}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{
              fill: ALIGNMENT_LINE2_COLOR,
              r: 3,
              strokeWidth: 2,
              stroke: GREEN_DEEP,
            }}
            activeDot={{
              r: 5,
              fill: ALIGNMENT_LINE2_COLOR,
              stroke: GREEN_DEEP,
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Filter helpers ────────────────────────────────────────────────────────
function applyFilters(stats, filters, departments = []) {
  if (!stats || (!filters.department && !filters.batch)) return stats;
  const result = { ...stats };

  if (result.by_department && filters.department) {
    const selectedDepartment = departments.find(
      (department) => String(department.id) === String(filters.department),
    );
    const selectedDepartmentName =
      selectedDepartment?.name || filters.department;
    result.by_department = Object.fromEntries(
      Object.entries(result.by_department).filter(
        ([name]) =>
          name === selectedDepartmentName ||
          name?.toLowerCase() === selectedDepartmentName?.toLowerCase(),
      ),
    );
  }

  if (result.graduates_by_year && filters.batch) {
    result.graduates_by_year = Object.fromEntries(
      Object.entries(result.graduates_by_year).filter(
        ([year]) => String(year) === String(filters.batch),
      ),
    );
  }

  return result;
}

// ── Main component ────────────────────────────────────────────────────────
export default function Analytics({ onDrillDown }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: "", batch: "" });
  const [alignmentRows, setAlignmentRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showReport, setShowReport] = useState(false);

  // "admin" = department head (single-department scope).
  // Anything else reaching this page (e.g. "super_admin") is the president,
  // who is the only role allowed to see the cross-department breakdown.
  const userRole = localStorage.getItem("userRole");
  const isDeptHead = userRole === "admin";

  // Initial fetch
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const endpoint =
          localStorage.getItem("userRole") === "admin"
            ? "/department-head/dashboard"
            : "/admin/dashboard";
        const response = await api.get(endpoint);
        if (response.data.status) setStats(response.data.data.stats);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments");
        if (response.data?.status && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Pre-lock department filter for department-head role using stored auth info
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const deptId = localStorage.getItem("userDepartment");
    if (role === "admin" && deptId) {
      setFilters((f) => ({ ...f, department: deptId }));
    }
  }, []);

  // Re-fetch on filter change (pass params if backend supports them)
  useEffect(() => {
    if (!stats) return;
    const fetchFiltered = async () => {
      try {
        const params = {};
        if (filters.department) params.department_id = filters.department;
        if (filters.batch) params.batch = filters.batch;
        const endpoint =
          localStorage.getItem("userRole") === "admin"
            ? "/department-head/dashboard"
            : "/admin/dashboard";
        const response = await api.get(endpoint, { params });
        if (response.data.status) setStats(response.data.data.stats);
      } catch (error) {
        console.error("Failed to fetch filtered analytics:", error);
      }
    };
    fetchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-greenDeep mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Build dropdown options from raw stats
  const departmentOptions =
    departments.length > 0
      ? departments.map((department) => ({
          id: department.id,
          name: department.name,
        }))
      : stats?.by_department
        ? Object.keys(stats.by_department)
            .filter((name) => name !== "No department assigned")
            .map((name) => ({ name }))
        : [];
  const batchOptions = stats?.graduates_by_year
    ? Object.keys(stats.graduates_by_year).sort((a, b) => b - a)
    : [];

  // Client-side filter overlay (graceful fallback if API ignores params)
  const filtered = applyFilters(stats, filters, departmentOptions);

  // ── Printable report view ──
  // Swaps the entire page into the print-friendly layout. Reuses the same
  // `filtered` stats and `alignmentRows` already loaded above — no extra
  // fetch, no route change.
  if (showReport) {
    return (
      <PrintableReport
        stats={filtered}
        filters={filters}
        departmentOptions={departmentOptions}
        alignmentRows={alignmentRows}
        preparedByName={localStorage.getItem("userName")}
        onClose={() => setShowReport(false)}
      />
    );
  }

  // Derived chart data
  const studentStatusData = [
    {
      name: "Registered Graduates",
      value: filtered?.registered_alumni || 0,
    },
    {
      name: "Not Registered Graduates",
      value: filtered?.not_registered_graduates || 0,
    },
  ].filter((d) => d.value > 0);

  const employmentData = [
    { name: "Employed", value: filtered?.employed_alumni || 0 },
    { name: "Unemployed", value: filtered?.unemployed_alumni || 0 },
    { name: "Self-employed", value: filtered?.self_employed_alumni || 0 },
  ].filter((d) => d.value > 0);

  const departmentData = filtered?.by_department
    ? Object.entries(filtered.by_department)
        .filter(([name]) => name !== "No department assigned")
        .map(([name, count]) => ({ name, count }))
    : [];

  const graduationTrend = filtered?.graduates_by_year
    ? Object.entries(filtered.graduates_by_year).map(([year, count]) => ({
        year,
        graduates: count,
      }))
    : [];

  const maxDeptCount = Math.max(...departmentData.map((d) => d.count), 1);
  const isFiltered = filters.department !== "" || filters.batch !== "";

  return (
    <div className="min-h-full bg-gray-50 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-tpc-greenDeep">
              Insights dashboard
            </p>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Analytics
            </h1>
            <p className="text-sm text-gray-400">
              Overview of alumni, employment, and student data
            </p>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 sm:w-auto"
            style={{ background: GREEN_DEEP }}
          >
            <Printer size={14} />
            Print Report
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <FilterBar
          departments={departmentOptions}
          batches={batchOptions}
          filters={filters}
          onChange={setFilters}
          departmentLocked={isDeptHead}
        />

        {/* ── Active filter notice ── */}
        {isFiltered && (
          <FilterBanner filters={filters} departments={departmentOptions} />
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Total Alumni"
            value={filtered?.total_students ?? "—"}
            icon={<Users className="w-4 h-4" />}
            accent="bg-tpc-greenDeep"
          />
          <StatCard
            title="Verified"
            value={filtered?.verified_students ?? "—"}
            icon={<GraduationCap className="w-4 h-4" />}
            accent="bg-green-500"
          />
          <StatCard
            title="Inactive Accounts"
            value={filtered?.not_registered_graduates ?? "—"}
            icon={<Clock className="w-4 h-4" />}
            accent="bg-amber-500"
          />
          <StatCard
            title="Employed"
            value={filtered?.employed_alumni ?? "—"}
            icon={<Briefcase className="w-4 h-4" />}
            accent="bg-blue-500"
          />
          <StatCard
            title="Graduates"
            value={filtered?.total_graduates ?? "—"}
            icon={<TrendingUp className="w-4 h-4" />}
            accent="bg-purple-500"
          />
          <StatCard
            title="Departments"
            value={filtered?.total_departments ?? "—"}
            icon={<Building2 className="w-4 h-4" />}
            accent="bg-tpc-greenDeep"
          />
        </div>

        {/* ── Row 1: Donut + Pie ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Alumni Status Breakdown">
            {studentStatusData.length > 0 ? (
              <div className="flex items-center gap-6">
                <DonutChart
                  data={studentStatusData}
                  colors={STATUS_COLORS}
                  size={130}
                  thickness={30}
                />
                <div className="flex flex-col gap-3 flex-1">
                  {studentStatusData.map((d, i) => (
                    <LegendRow
                      key={d.name}
                      color={STATUS_COLORS[i % STATUS_COLORS.length]}
                      label={d.name}
                      value={d.value}
                      total={studentStatusData.reduce((s, x) => s + x.value, 0)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard title="Employment Status">
            {employmentData.length > 0 ? (
              <div className="flex flex-col items-center gap-4 overflow-x-auto">
                <PieChartWithLabels
                  data={employmentData}
                  colors={EMPLOY_COLORS}
                  labelColors={EMPLOY_LABEL_COLORS}
                />
                <div className="flex items-center justify-center gap-5 flex-wrap">
                  {employmentData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: EMPLOY_COLORS[i % EMPLOY_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-gray-500">{d.name}</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        </div>

        {/* ── Row 2: Department Bars (super admin only) + Graduation Line ── */}
        <div
          className={`grid grid-cols-1 gap-4 ${isDeptHead ? "" : "lg:grid-cols-2"}`}
        >
          {!isDeptHead && (
            <ChartCard title="Alumni per Department">
              {departmentData.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {departmentData.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 break-words text-xs leading-5 text-gray-500 sm:w-52">
                        {d.name}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-tpc-greenDeep transition-all duration-500"
                          style={{
                            width: `${(d.count / maxDeptCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart label="No department data available yet" />
              )}
            </ChartCard>
          )}

          <ChartCard
            title={
              filters.batch
                ? `Graduation Trend — Batch ${filters.batch}`
                : "Graduation Trend by Year"
            }
          >
            {graduationTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={graduationTrend}
                  margin={{ top: 4, right: 12, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="graduates"
                    stroke={GREEN_DEEP}
                    strokeWidth={2.5}
                    dot={{
                      fill: GREEN_DEEP,
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: GREEN_DEEP,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No graduation trend data available yet" />
            )}
          </ChartCard>
        </div>

        {/* ── Row 3: Job–Course Alignment ── */}
        <AlignmentSummaryWidget
          onDrillDown={onDrillDown}
          filters={filters}
          onRowsLoaded={setAlignmentRows}
        />
      </div>
    </div>
  );
}

/* ── AlignmentSummaryWidget ─────────────────────────────────────────────── */

function AlignmentSummaryWidget({ onDrillDown, filters, onRowsLoaded }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (filters?.department) params.department_id = filters.department;
        if (filters?.batch) params.batch = filters.batch;
        const data = await alumniService.getAlignmentSummary(params);
        setRows(data);
        onRowsLoaded?.(data);
      } catch (err) {
        setError(err?.message || "Failed to load alignment data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-8">
        <Loader2 className="h-5 w-5 animate-spin text-tpc-greenDeep" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
        <div className="bg-tpc-greenDeep/10 p-1.5 rounded-lg">
          <BriefcaseIcon className="h-4 w-4 text-tpc-greenDeep" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Job–Course Alignment
          </p>
          <p className="text-xs text-gray-400">
            Self-reported by employed alumni per department
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No alignment data yet.
        </div>
      ) : (
        <div className="p-5 space-y-5">
          <AlignmentLineChart rows={rows} />
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
            {rows.map((row) => {
              const rate =
                row.total_employed > 0
                  ? ((row.no_response ?? 0) / row.total_employed) * 100
                  : 0;
              const hasData = row.total_employed > 0;
              return (
                <button
                  key={row.department_id}
                  type="button"
                  onClick={() => onDrillDown?.(row.department_id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-gray-800">
                      {row.department?.name ||
                        `Department ${row.department_id}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        {row.aligned} aligned
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        <XCircle className="h-3 w-3" />
                        {row.not_aligned} not aligned
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        <HelpCircle className="h-3 w-3" />
                        {row.not_registered ?? 0} not registered graduates
                      </span>
                    </div>
                    {hasData && (
                      <div className="mt-2.5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-tpc-greenDeep transition-all"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          {rate.toFixed(1)}% inactive / no-response rate
                          <span className="ml-1 text-gray-300">
                            ({row.total_employed} employed)
                          </span>
                        </p>
                      </div>
                    )}
                    {!hasData && (
                      <p className="mt-1 text-xs text-gray-400">
                        No responses yet — {row.total_employed} employed
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────── */

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="mb-2 truncate text-[11px] font-medium text-gray-400 sm:text-xs">
            {title}
          </p>
          <p className="text-2xl font-extrabold leading-none tracking-tight text-gray-900 sm:text-4xl">
            {value}
          </p>
        </div>
        <div
          className={`${accent} flex-shrink-0 rounded-lg p-2 text-white sm:p-2.5`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <h3 className="min-w-0 text-sm font-semibold text-gray-800">{title}</h3>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tpc-greenDeep" />
      </div>
      {children}
    </div>
  );
}

function LegendRow({ color, label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="text-xs text-gray-500 flex-1 min-w-0 truncate">
        {label}
      </span>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

function EmptyChart({ label = "No data available yet" }) {
  return (
    <div className="h-44 flex flex-col items-center justify-center text-gray-300 gap-2">
      <TrendingUp className="w-8 h-8 opacity-40" />
      <p className="text-xs">{label}</p>
    </div>
  );
}
