import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import alumniService from "../../services/alumniService";
import PrintableReport from "./PrintableReport";
import {
  Users,
  Briefcase,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  BriefcaseIcon,
  SlidersHorizontal,
  ChevronDown,
  Printer,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ── Approved Executive Body Visual Palette ─────────────────────────────────
const COLOR_PRIMARY_BLUE = "#0F3A5C";
const COLOR_SECONDARY_BLUE = "#2563EB";
const COLOR_GOLD_ACCENT = "#D4A72C";
const COLOR_MUTED_GRAY = "#94A3B8";
const COLOR_LIGHT_GRAY = "#CBD5E1";
const COLOR_DANGER = "#EF4444";

// Semantic Chart Tokens
const COLOR_REGISTERED = COLOR_PRIMARY_BLUE;
const COLOR_UNREGISTERED = COLOR_MUTED_GRAY;

const COLOR_EMPLOYED = COLOR_SECONDARY_BLUE;
const COLOR_SELF_EMPLOYED = COLOR_GOLD_ACCENT;
const COLOR_UNEMPLOYED = COLOR_DANGER;
const COLOR_NOT_SPECIFIED = COLOR_LIGHT_GRAY;

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
    color: "#0F172A",
    background: "#FFFFFF",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#E2E8F0",
    borderRadius: "10px",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const activeSelectStyle = (val) =>
    val
      ? {
          ...selectBase,
          borderColor: COLOR_PRIMARY_BLUE,
          color: COLOR_PRIMARY_BLUE,
          background: "#F8FAFC",
          fontWeight: 600,
        }
      : selectBase;

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-xs">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
        <SlidersHorizontal size={13} className="text-[#0F3A5C]" />
        Filters
      </span>

      <span className="w-px h-5 bg-slate-200 shrink-0" />

      {/* Department select */}
      <div className="relative min-w-0 max-w-full xs:w-auto">
        <select
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
          style={{ ...activeSelectStyle(filters.department), maxWidth: "100%" }}
          disabled={departmentLocked}
          aria-label="Filter by Department"
          className="max-w-[260px] xs:max-w-none truncate"
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
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        />
      </div>

      {/* Batch select */}
      <div className="relative min-w-0 max-w-full xs:w-auto">
        <select
          value={filters.batch}
          onChange={(e) => onChange({ ...filters, batch: e.target.value })}
          style={{ ...activeSelectStyle(filters.batch), maxWidth: "100%" }}
          aria-label="Filter by Graduation Batch"
          className="max-w-[200px] xs:max-w-none truncate"
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
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        />
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={() => onChange({ department: "", batch: "" })}
          className="ml-auto text-xs text-slate-500 hover:text-[#0F3A5C] underline underline-offset-2 px-1 cursor-pointer transition shrink-0 font-medium"
        >
          Reset filters
        </button>
      )}
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

// ── Executive KPI Card ────────────────────────────────────────────────────
function ExecutiveKpiCard({
  title,
  value,
  detail,
  icon,
  accentColor = "text-[#0F3A5C]",
  bgAccent = "bg-blue-50/70",
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className={`p-2.5 rounded-xl ${bgAccent} ${accentColor} shrink-0`}>
            {icon}
          </span>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </p>
        <p className="mt-1 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </p>
      </div>
      {detail && (
        <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          {detail}
        </p>
      )}
    </div>
  );
}

// ── Chart Legend Component ────────────────────────────────────────────────
function ChartLegend({ data, total }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[210px] shrink-0">
      {data.map((item) => {
        const itemVal = Number(item.value || 0);
        const totalVal = Number(total || 0);
        const pct = totalVal > 0 ? Math.round((itemVal / totalVal) * 100) : 0;
        return (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-slate-800">{itemVal.toLocaleString()}</span>
              <span className="text-slate-400 text-[11px]">({pct}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Response / Attention Areas Section ────────────────────────────────────
function AttentionAreasSection({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Response / Attention Areas</h3>
              <p className="text-xs text-gray-400 mt-0.5">Programs prioritized by alignment survey response completeness</p>
            </div>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F3A5C]" />
          </div>
        </div>
        <p className="text-xs text-slate-400 py-12 text-center">No program alignment records available yet.</p>
      </div>
    );
  }

  // Ensure strict numeric values to prevent string concatenation bugs
  const sorted = [...rows]
    .map((row) => {
      const aligned = Number(row.aligned || 0);
      const notAligned = Number(row.not_aligned || 0);
      const total = Number(row.total_employed || 0);
      const pending = Number(row.no_response || 0);
      const answered = aligned + notAligned;
      const responseRate = total > 0 ? (answered / total) * 100 : 0;
      return {
        ...row,
        aligned,
        notAligned,
        answered,
        total,
        responseRate,
        pending,
        displayName: row.department?.name || `Dept ${row.department_id}`,
      };
    })
    .sort((a, b) => a.responseRate - b.responseRate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Response / Attention Areas</h3>
            <p className="text-xs text-gray-400 mt-0.5">Programs prioritized by alignment survey response completeness</p>
          </div>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F3A5C]" />
        </div>

        <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
          {sorted.map((item) => {
            const pct = Math.round(item.responseRate);
            const isAttention = pct < 50;
            const barColor = isAttention ? "bg-rose-500" : pct >= 80 ? "bg-[#0F3A5C]" : "bg-[#2563EB]";
            const badgeColor = isAttention
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : pct >= 80
              ? "bg-blue-50/70 text-[#0F3A5C] border-blue-200"
              : "bg-slate-50 text-slate-700 border-slate-200";

            return (
              <div key={item.department_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-medium text-slate-800 truncate" title={item.displayName}>
                    {item.displayName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {item.pending > 0 ? `${item.pending} pending` : "All declared"}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {pct}% Response
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
        Prioritizes programs with pending responses to assist leadership in coordinating follow-ups.
      </p>
    </div>
  );
}

// ── Job–Course Alignment Section ──────────────────────────────────────────
function JobCourseAlignmentSection({
  rows,
  filterDepartment,
  filterBatch,
  departments = [],
  onDrillDown,
}) {
  // Normalize row values to strict numbers to avoid string concatenation
  const normalizedRows = useMemo(() => {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map((r) => {
      const aligned = Number(r.aligned || 0);
      const notAligned = Number(r.not_aligned || 0);
      const pending = Number(r.no_response || 0);
      const totalEmployed = Number(r.total_employed || 0);
      const answered = aligned + notAligned;
      const rate =
        r.alignment_rate !== undefined && r.alignment_rate !== null && !isNaN(Number(r.alignment_rate))
          ? Number(r.alignment_rate)
          : answered > 0
          ? (aligned / answered) * 100
          : 0;
      return {
        ...r,
        aligned,
        not_aligned: notAligned,
        no_response: pending,
        total_employed: totalEmployed,
        alignment_rate: rate,
      };
    });
  }, [rows]);

  const tpcTotals = useMemo(() => {
    if (!normalizedRows || normalizedRows.length === 0) {
      return { totalEmployed: 0, aligned: 0, notAligned: 0, pending: 0, rate: 0 };
    }
    const totalEmployed = normalizedRows.reduce((s, r) => s + r.total_employed, 0);
    const aligned = normalizedRows.reduce((s, r) => s + r.aligned, 0);
    const notAligned = normalizedRows.reduce((s, r) => s + r.not_aligned, 0);
    const pending = normalizedRows.reduce((s, r) => s + r.no_response, 0);
    const answered = aligned + notAligned;
    const rate = answered > 0 ? (aligned / answered) * 100 : 0;
    return { totalEmployed, aligned, notAligned, pending, rate };
  }, [normalizedRows]);

  const selectedDept = useMemo(() => {
    if (!filterDepartment) return null;
    return (
      departments.find(
        (d) =>
          String(d.id) === String(filterDepartment) ||
          d.name?.toLowerCase() === String(filterDepartment).toLowerCase(),
      ) || null
    );
  }, [departments, filterDepartment]);

  const selectedRow = useMemo(() => {
    if (!filterDepartment || !normalizedRows || normalizedRows.length === 0) return null;
    return (
      normalizedRows.find(
        (r) =>
          String(r.department_id) === String(filterDepartment) ||
          (selectedDept &&
            (String(r.department_id) === String(selectedDept.id) ||
              r.department?.name?.toLowerCase() ===
                selectedDept.name?.toLowerCase())),
      ) || (normalizedRows.length === 1 && filterDepartment ? normalizedRows[0] : null)
    );
  }, [normalizedRows, filterDepartment, selectedDept]);

  const isProgramSpecific = Boolean(filterDepartment);

  const currentData = isProgramSpecific
    ? {
        title:
          selectedRow?.department?.name ||
          selectedDept?.name ||
          (typeof filterDepartment === "string" && isNaN(filterDepartment)
            ? filterDepartment
            : `Department ${filterDepartment}`),
        isProgramSpecific: true,
        departmentId:
          selectedRow?.department_id ||
          selectedDept?.id ||
          filterDepartment,
        totalEmployed: selectedRow?.total_employed || 0,
        aligned: selectedRow?.aligned || 0,
        notAligned: selectedRow?.not_aligned || 0,
        pending: selectedRow?.no_response || 0,
        rate: selectedRow ? selectedRow.alignment_rate : 0,
      }
    : {
        title: "All Departments",
        isProgramSpecific: false,
        departmentId: null,
        totalEmployed: tpcTotals.totalEmployed,
        aligned: tpcTotals.aligned,
        notAligned: tpcTotals.notAligned,
        pending: tpcTotals.pending,
        rate: tpcTotals.rate,
      };

  const answeredCount = currentData.aligned + currentData.notAligned;
  const rawRate = Number(currentData.rate || 0);
  const alignmentRateFormatted = rawRate % 1 === 0 ? rawRate.toFixed(0) : rawRate.toFixed(1);

  const displayDepartmentScope = isProgramSpecific
    ? currentData.title
    : "All Departments";
  const displayBatchScope = filterBatch
    ? `Batch ${filterBatch}`
    : "All Graduation Batches";

  const totalEmployedVal = currentData.totalEmployed;
  const alignedPct = totalEmployedVal > 0 ? (currentData.aligned / totalEmployedVal) * 100 : 0;
  const notAlignedPct = totalEmployedVal > 0 ? (currentData.notAligned / totalEmployedVal) * 100 : 0;
  const pendingPct = totalEmployedVal > 0 ? (currentData.pending / totalEmployedVal) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-gray-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0F3A5C]">
              <BriefcaseIcon size={16} />
            </span>
            <h3 className="text-base font-semibold text-gray-900">Job–Course Alignment</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Employment alignment based on reported alumni responses
          </p>
        </div>

        {/* Global Filter Context Tag (Read-only status indicator — No duplicate inputs) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#0F3A5C]" />
            <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs" title={displayDepartmentScope}>
              {displayDepartmentScope}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 shrink-0">{displayBatchScope}</span>
          </span>
        </div>
      </div>

      {/* Main Alignment Details Container */}
      <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0F3A5C]">
                {currentData.isProgramSpecific ? "Selected Department" : "Institutional Benchmark"}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {currentData.totalEmployed.toLocaleString()} Employed Alumni
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 truncate" title={currentData.title}>
              {currentData.title}
            </h4>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Alignment Rate</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F3A5C] tracking-tight">
                {alignmentRateFormatted}%
              </p>
            </div>
            {currentData.isProgramSpecific && onDrillDown && currentData.departmentId && (
              <button
                type="button"
                onClick={() => onDrillDown(currentData.departmentId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F3A5C] hover:bg-[#0A2A44] rounded-xl transition shadow-xs cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#0F3A5C]" />
                Aligned
              </span>
              <span className="text-lg font-bold text-gray-900">
                {currentData.aligned.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {answeredCount > 0 ? Math.round((currentData.aligned / answeredCount) * 100) : 0}% of declared
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-500" />
                Not Aligned
              </span>
              <span className="text-lg font-bold text-gray-900">
                {currentData.notAligned.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {answeredCount > 0 ? Math.round((currentData.notAligned / answeredCount) * 100) : 0}% of declared
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Pending Alignment Response
              </span>
              <span className="text-lg font-bold text-gray-700">
                {currentData.pending.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {currentData.totalEmployed > 0
                ? Math.round((currentData.pending / currentData.totalEmployed) * 100)
                : 0}
              % of employed
            </p>
          </div>
        </div>

        {/* Clean horizontal visualization */}
        {totalEmployedVal > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/60">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#0F3A5C] transition-all duration-500"
                style={{ width: `${alignedPct}%` }}
                title={`Aligned: ${currentData.aligned}`}
              />
              <div
                className="h-full bg-[#D4A72C] transition-all duration-500"
                style={{ width: `${notAlignedPct}%` }}
                title={`Not Aligned: ${currentData.notAligned}`}
              />
              <div
                className="h-full bg-slate-300 transition-all duration-500"
                style={{ width: `${pendingPct}%` }}
                title={`Pending: ${currentData.pending}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0F3A5C]" /> Aligned ({Math.round(alignedPct)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D4A72C]" /> Not Aligned ({Math.round(notAlignedPct)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Pending ({Math.round(pendingPct)}%)
                </span>
              </div>
              <span>Total: {totalEmployedVal.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function Analytics({ onDrillDown }) {
  const userRole = localStorage.getItem("userRole");
  const userDepartment = localStorage.getItem("userDepartment");
  const isDeptHead = userRole === "admin";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    department: isDeptHead && userDepartment ? userDepartment : "",
    batch: "",
  }));
  const [alignmentRows, setAlignmentRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showReport, setShowReport] = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const endpoint =
          userRole === "admin"
            ? "/department-head/dashboard"
            : "/admin/dashboard";
        const params = {};
        if (filters.department) params.department_id = filters.department;
        if (filters.batch) params.batch = filters.batch;
        const response = await api.get(endpoint, { params });
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

  // Fetch alignment summary once (re-fetches only when global batch/dept filter changes)
  useEffect(() => {
    const fetchAlignment = async () => {
      try {
        const params = {};
        if (filters?.department) params.department_id = filters.department;
        if (filters?.batch) params.batch = filters.batch;
        const data = await alumniService.getAlignmentSummary(params);
        const normalized = Array.isArray(data)
          ? data.map((r) => {
              const aligned = Number(r.aligned || 0);
              const notAligned = Number(r.not_aligned || 0);
              const pending = Number(r.no_response || 0);
              const totalEmployed = Number(r.total_employed || 0);
              const answered = aligned + notAligned;
              const rate =
                r.alignment_rate !== undefined && r.alignment_rate !== null && !isNaN(Number(r.alignment_rate))
                  ? Number(r.alignment_rate)
                  : answered > 0
                  ? (aligned / answered) * 100
                  : 0;
              return {
                ...r,
                aligned,
                not_aligned: notAligned,
                no_response: pending,
                total_employed: totalEmployed,
                alignment_rate: rate,
              };
            })
          : [];
        setAlignmentRows(normalized);
      } catch (err) {
        console.error("Failed to fetch alignment summary:", err);
      }
    };
    fetchAlignment();
  }, [filters]);

  // Re-fetch dashboard on filter change
  useEffect(() => {
    if (!stats) return;
    const fetchFiltered = async () => {
      try {
        const params = {};
        if (filters.department) params.department_id = filters.department;
        if (filters.batch) params.batch = filters.batch;
        const endpoint =
          userRole === "admin"
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

  // Department options for dropdown
  const departmentOptions =
    departments.length > 0
      ? departments.map((d) => ({ id: d.id, name: d.name }))
      : [];
  const batchOptions = stats?.graduates_by_year
    ? Object.keys(stats.graduates_by_year).sort((a, b) => b - a)
    : [];

  const filtered = applyFilters(stats, filters, departmentOptions);

  // ── KPI Calculations ───────────────────────────────────────────────────
  const totalGraduates = Number(filtered?.total_graduates ?? 0);
  const regAlumni = Number(filtered?.registered_alumni ?? 0);
  const unregGraduates = Number(filtered?.not_registered_graduates ?? 0);
  const rawRegCoverage =
    totalGraduates > 0 ? (regAlumni / totalGraduates) * 100 : 0;
  const regCoveragePct =
    rawRegCoverage % 1 === 0
      ? rawRegCoverage.toFixed(0)
      : rawRegCoverage.toFixed(1);

  const employed = Number(filtered?.employed_alumni ?? 0);
  const selfEmployed = Number(filtered?.self_employed_alumni ?? 0);
  const unemployed = Number(filtered?.unemployed_alumni ?? 0);
  const notSpecified = Number(filtered?.not_specified_alumni ?? 0);

  const workingTotal = employed + selfEmployed;
  const declaredTotal = workingTotal + unemployed;
  const rawEmploymentRate =
    declaredTotal > 0 ? (workingTotal / declaredTotal) * 100 : 0;
  const employmentRatePct =
    rawEmploymentRate % 1 === 0
      ? rawEmploymentRate.toFixed(0)
      : rawEmploymentRate.toFixed(1);

  const declaredCompletionPct =
    regAlumni > 0 ? Math.round((declaredTotal / regAlumni) * 100) : 0;

  // ── Registration Coverage Chart Data ───────────────────────────────────
  const registrationChartData = [
    { name: "Registered Alumni", value: regAlumni, color: COLOR_REGISTERED },
    { name: "Unregistered Graduates", value: unregGraduates, color: COLOR_UNREGISTERED },
  ].filter((d) => d.value > 0);

  // ── Employment Status Chart Data ───────────────────────────────────────
  const employmentChartData = [
    { name: "Employed", value: employed, color: COLOR_EMPLOYED },
    { name: "Self-Employed", value: selfEmployed, color: COLOR_SELF_EMPLOYED },
    { name: "Unemployed", value: unemployed, color: COLOR_UNEMPLOYED },
    { name: "Not Specified", value: notSpecified, color: COLOR_NOT_SPECIFIED },
  ].filter((d) => d.value > 0);

  // ── Graduation Trend Chart Data ────────────────────────────────────────
  const graduationTrendData = filtered?.graduates_by_year
    ? Object.entries(filtered.graduates_by_year).map(([year, count]) => ({
        year: `Batch ${year}`,
        graduates: Number(count || 0),
      }))
    : [];

  return (
    <>
      <div
        className={`min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 analytics-screen-ui ${
          showReport ? "hidden" : "block"
        } print:hidden`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ── Page Header (matching restored Department Head heading style — PRESERVED EXACTLY) ── */}
          <header className="rounded-2xl bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] p-4 sm:p-6 text-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-100">
                  Institutional Analytics
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white">
                  Employment & Alumni Analytics
                </h1>
                <p className="mt-1 text-sm text-green-50/90">
                  Executive monitoring of graduate registration coverage, employment outcomes, and curricular alignment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-green-50 text-[#006400] px-4 py-2.5 text-sm font-semibold transition shadow-sm w-full sm:w-auto shrink-0 cursor-pointer"
              >
                <Printer size={15} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </header>

          {/* ── Filter Bar (Single Global Filter) ── */}
          <FilterBar
            departments={departmentOptions}
            batches={batchOptions}
            filters={filters}
            onChange={setFilters}
            departmentLocked={isDeptHead}
          />

          {/* ── 1. EXECUTIVE KPI SUMMARY (3 CARDS ONLY) ── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ExecutiveKpiCard
              title="Total Graduates"
              value={totalGraduates.toLocaleString()}
              detail="Recorded institutional graduate database"
              icon={<GraduationCap className="w-5 h-5 text-[#0F3A5C]" />}
              accentColor="text-[#0F3A5C]"
              bgAccent="bg-blue-50/70"
            />
            <ExecutiveKpiCard
              title="Registration Coverage"
              value={`${regCoveragePct}%`}
              detail={`${regAlumni.toLocaleString()} of ${totalGraduates.toLocaleString()} graduates registered`}
              icon={<Users className="w-5 h-5 text-[#2563EB]" />}
              accentColor="text-[#2563EB]"
              bgAccent="bg-blue-50/70"
            />
            <ExecutiveKpiCard
              title="Employment Rate"
              value={`${employmentRatePct}%`}
              detail={`${workingTotal.toLocaleString()} employed/self-employed of ${declaredTotal.toLocaleString()} respondents`}
              icon={<Briefcase className="w-5 h-5 text-[#D4A72C]" />}
              accentColor="text-[#D4A72C]"
              bgAccent="bg-amber-50/70"
            />
          </section>

          {/* ── 2 & 3. REGISTRATION COVERAGE & EMPLOYMENT STATUS ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Registration Coverage Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Registration Coverage</h3>
                    <p className="text-xs text-gray-400">Graduates who created an alumni portal account</p>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F3A5C]" />
                </div>

                {registrationChartData.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                    <div className="w-44 h-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={registrationChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {registrationChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              fontSize: "12px",
                              boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                            }}
                            formatter={(val, name) => [Number(val).toLocaleString(), name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ChartLegend data={registrationChartData} total={totalGraduates} />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">No registration records found.</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Total Institutional Graduates:</span>
                <span className="font-semibold text-slate-800">{totalGraduates.toLocaleString()}</span>
              </div>
            </div>

            {/* Employment Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Employment Status</h3>
                    <p className="text-xs text-gray-400">Self-reported status distribution of registered alumni</p>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                </div>

                {employmentChartData.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                    <div className="w-44 h-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={employmentChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {employmentChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              fontSize: "12px",
                              boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                            }}
                            formatter={(val, name) => [Number(val).toLocaleString(), name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ChartLegend data={employmentChartData} total={regAlumni} />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">No employment records available.</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Status Completion:</span>
                <span className="font-semibold text-slate-800">
                  {declaredCompletionPct}% ({declaredTotal} of {regAlumni} declared)
                </span>
              </div>
            </div>
          </section>

          {/* ── 4. JOB–COURSE ALIGNMENT (Driven by Global Filter) ── */}
          <section>
            <JobCourseAlignmentSection
              rows={alignmentRows}
              filterDepartment={filters.department}
              filterBatch={filters.batch}
              departments={departmentOptions}
              onDrillDown={onDrillDown}
            />
          </section>

          {/* ── 5 & 6. RESPONSE / ATTENTION AREAS & GRADUATION TREND ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Attention Areas Section */}
            <AttentionAreasSection rows={alignmentRows} />

            {/* Graduation Trend by Year */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Graduation Trend by Year</h3>
                    <p className="text-xs text-gray-400">Total graduates recorded across academic batches</p>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F3A5C]" />
                </div>

                {graduationTrendData.length > 0 ? (
                  <div className="py-2">
                    <ResponsiveContainer width="100%" height={210}>
                      <LineChart
                        data={graduationTrendData}
                        margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                            boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                          }}
                          formatter={(v) => [`${Number(v).toLocaleString()} Graduates`, "Graduates"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="graduates"
                          stroke={COLOR_PRIMARY_BLUE}
                          strokeWidth={2.5}
                          dot={{ fill: COLOR_PRIMARY_BLUE, r: 4, stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: COLOR_PRIMARY_BLUE, stroke: "#fff", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">No graduation batch records available.</p>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                Displays the volume of institutional degree completions per academic year.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* ── Dedicated Printable Report View (sole printable document) ── */}
      <div
        className={`analytics-printable-report ${
          showReport ? "block" : "hidden"
        } print:block`}
      >
        <PrintableReport
          stats={filtered}
          filters={filters}
          departmentOptions={departmentOptions}
          alignmentRows={alignmentRows}
          preparedByName={localStorage.getItem("userName")}
          onClose={() => setShowReport(false)}
        />
      </div>
    </>
  );
}
