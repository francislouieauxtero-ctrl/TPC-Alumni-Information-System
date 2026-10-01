import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import alumniService from "../../services/alumniService";
import PrintableReport from "../president/PrintableReport";
import {
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  BriefcaseIcon,
  SlidersHorizontal,
  ChevronDown,
  Printer,
  Building2,
  RotateCcw,
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

// ── TPC Branding Theme Tokens ─────────────────────────────────────────────
const TPC_GREEN_DEEP = "#02451C";
const TPC_GREEN_MID = "#006400";
const TPC_GREEN_LIGHT = "#16a34a";
const TPC_AMBER = "#d97706";
const TPC_ROSE = "#ef4444";
const TPC_SLATE_MUTED = "#94a3b8";
const TPC_SLATE_LIGHT = "#cbd5e1";

// ── Semantic Chart Colors ──────────────────────────────────────────────────
const COLOR_REGISTERED = TPC_GREEN_DEEP;
const COLOR_UNREGISTERED = TPC_SLATE_MUTED;

const COLOR_EMPLOYED = TPC_GREEN_LIGHT;
const COLOR_SELF_EMPLOYED = TPC_AMBER;
const COLOR_UNEMPLOYED = TPC_ROSE;
const COLOR_NOT_SPECIFIED = TPC_SLATE_LIGHT;

// ── FilterBar Component (Department Locked) ───────────────────────────────
function FilterBar({
  departmentName,
  batches,
  selectedBatch,
  onBatchChange,
  onResetBatch,
}) {
  const hasBatchFilter = Boolean(selectedBatch);

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-xs">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
        <SlidersHorizontal size={13} className="text-[#02451C]" />
        Filter
      </span>

      <span className="w-px h-5 bg-slate-200 shrink-0" />

      {/* Locked Department Badge */}
      <div className="inline-flex items-center gap-2 bg-[#e8f4ed] border border-[#86c99a] text-[#02451C] px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
        <Building2 size={13} className="text-[#006400] shrink-0" />
        <span className="truncate max-w-[240px] sm:max-w-xs" title={departmentName}>
          {departmentName}
        </span>
      </div>

      {/* Batch Select */}
      <div className="relative shrink-0">
        <select
          value={selectedBatch}
          onChange={(e) => onBatchChange(e.target.value)}
          aria-label="Filter by Graduation Batch"
          className="appearance-none h-9 pl-3 pr-8 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl cursor-pointer outline-none transition focus:border-[#02451C] focus:ring-2 focus:ring-[#86c99a]/30"
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

      {/* Reset Batch Only */}
      {hasBatchFilter && (
        <button
          type="button"
          onClick={onResetBatch}
          className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#02451C] px-2 py-1 rounded-lg transition font-medium cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset batch</span>
        </button>
      )}
    </div>
  );
}

// ── Primary Executive KPI Card ────────────────────────────────────────────
function PrimaryKpiCard({ title, value, detail, icon, accentColor, bgAccent }) {
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

// ── Compact Supporting Metric Card ────────────────────────────────────────
function CompactMetricCard({ label, value, subtext, dotColor }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
      <div className="flex items-center gap-2">
        {dotColor && (
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
        )}
        <span className="text-xs font-medium text-slate-600 truncate">{label}</span>
      </div>
      <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtext}</p>
      )}
    </div>
  );
}

// ── Chart Legend Component ────────────────────────────────────────────────
function ChartLegend({ data, total }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-[230px] shrink-0">
      {data.map((item) => {
        const itemVal = Number(item.value || 0);
        const totalVal = Number(total || 0);
        const pct = totalVal > 0 ? Math.round((itemVal / totalVal) * 100) : 0;
        return (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-slate-800">
                {itemVal.toLocaleString()}
              </span>
              <span className="text-slate-400 text-[11px]">({pct}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Job–Course Alignment Section (Department-Scoped) ──────────────────────
function DepartmentJobCourseAlignment({
  alignmentRow,
  departmentName,
  batchScope,
  onDrillDown,
}) {
  const navigate = useNavigate();

  const aligned = Number(alignmentRow?.aligned || 0);
  const notAligned = Number(alignmentRow?.not_aligned || 0);
  const pending = Number(alignmentRow?.no_response || 0);
  const totalEmployed = Number(alignmentRow?.total_employed || 0);
  const answeredCount = aligned + notAligned;

  // Real Alignment Rate: aligned / (aligned + not_aligned) * 100
  const rawRate =
    alignmentRow?.alignment_rate !== undefined &&
    alignmentRow?.alignment_rate !== null &&
    !isNaN(Number(alignmentRow.alignment_rate))
      ? Number(alignmentRow.alignment_rate)
      : answeredCount > 0
      ? (aligned / answeredCount) * 100
      : 0;

  const alignmentRateFormatted =
    rawRate % 1 === 0 ? rawRate.toFixed(0) : rawRate.toFixed(1);

  const alignedPct = totalEmployed > 0 ? (aligned / totalEmployed) * 100 : 0;
  const notAlignedPct = totalEmployed > 0 ? (notAligned / totalEmployed) * 100 : 0;
  const pendingPct = totalEmployed > 0 ? (pending / totalEmployed) * 100 : 0;

  const handleViewDetails = () => {
    if (onDrillDown && alignmentRow?.department_id) {
      onDrillDown(alignmentRow.department_id);
    } else {
      navigate("/department-head/alumni");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-gray-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e8f4ed] text-[#02451C]">
              <BriefcaseIcon size={16} />
            </span>
            <h3 className="text-base font-semibold text-gray-900">
              Job–Course Alignment
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Employment alignment based on reported alumni responses
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#02451C]" />
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
              {departmentName}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 shrink-0">{batchScope}</span>
          </span>
        </div>
      </div>

      {/* Main Alignment Details Container */}
      <div className="bg-[#f8fafc] border border-slate-200/70 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#02451C]">
                Department Employment Alignment
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {totalEmployed.toLocaleString()} Employed Alumni
              </span>
            </div>
            <h4
              className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 truncate"
              title={departmentName}
            >
              {departmentName}
            </h4>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Alignment Rate</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#02451C] tracking-tight">
                {alignmentRateFormatted}%
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewDetails}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#02451C] hover:bg-[#035c25] rounded-xl transition shadow-xs cursor-pointer"
            >
              <span>View Department Alumni Details</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 Breakdown Badges */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#02451C]" />
                Aligned
              </span>
              <span className="text-lg font-bold text-gray-900">
                {aligned.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {answeredCount > 0
                ? Math.round((aligned / answeredCount) * 100)
                : 0}
              % of declared responses
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-500" />
                Not Aligned
              </span>
              <span className="text-lg font-bold text-gray-900">
                {notAligned.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {answeredCount > 0
                ? Math.round((notAligned / answeredCount) * 100)
                : 0}
              % of declared responses
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Pending Alignment Response
              </span>
              <span className="text-lg font-bold text-gray-700">
                {pending.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {totalEmployed > 0
                ? Math.round((pending / totalEmployed) * 100)
                : 0}
              % of employed alumni
            </p>
          </div>
        </div>

        {/* 3-segment stacked horizontal progress bar */}
        {totalEmployed > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/60">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#02451C] transition-all duration-500"
                style={{ width: `${alignedPct}%` }}
                title={`Aligned: ${aligned}`}
              />
              <div
                className="h-full bg-[#d97706] transition-all duration-500"
                style={{ width: `${notAlignedPct}%` }}
                title={`Not Aligned: ${notAligned}`}
              />
              <div
                className="h-full bg-slate-300 transition-all duration-500"
                style={{ width: `${pendingPct}%` }}
                title={`Pending: ${pending}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#02451C]" /> Aligned (
                  {Math.round(alignedPct)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#d97706]" /> Not Aligned (
                  {Math.round(notAlignedPct)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Pending (
                  {Math.round(pendingPct)}%)
                </span>
              </div>
              <span>Total: {totalEmployed.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main DeptAnalytics Component ──────────────────────────────────────────
export default function DeptAnalytics({ onDrillDown }) {
  const userDepartmentId = localStorage.getItem("userDepartment") || "";
  const storedDeptName = localStorage.getItem("userDepartmentName") || "My Department";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [alignmentRow, setAlignmentRow] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Fetch Dashboard Stats & Alignment Summary once per filter change
  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      try {
        const params = {};
        if (userDepartmentId) params.department_id = userDepartmentId;
        if (selectedBatch) params.batch = selectedBatch;

        const [dashboardRes, alignmentRes] = await Promise.all([
          api.get("/department-head/dashboard", { params }),
          alumniService.getAlignmentSummary(params),
        ]);

        if (!mounted) return;

        if (dashboardRes.data?.status) {
          setStats(dashboardRes.data.data.stats);
        }

        if (Array.isArray(alignmentRes) && alignmentRes.length > 0) {
          setAlignmentRow(alignmentRes[0]);
        } else {
          setAlignmentRow(null);
        }
      } catch (error) {
        console.error("Failed to load department analytics:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, [userDepartmentId, selectedBatch]);

  // Derived Department Name
  const departmentName = useMemo(() => {
    if (stats?.by_department) {
      const keys = Object.keys(stats.by_department);
      if (keys.length > 0) return keys[0];
    }
    return storedDeptName;
  }, [stats, storedDeptName]);

  // Available Batch Years from Graduates Data
  const batchOptions = useMemo(() => {
    if (!stats?.graduates_by_year) return [];
    return Object.keys(stats.graduates_by_year).sort((a, b) => Number(b) - Number(a));
  }, [stats?.graduates_by_year]);

  // ── Calculation of Core Metrics ─────────────────────────────────────────
  const totalGraduates = Number(stats?.total_graduates ?? 0);
  const regAlumni = Number(stats?.registered_alumni ?? 0);
  const unregGraduates = Number(stats?.not_registered_graduates ?? 0);

  // Registration Coverage %: registered / total_graduates * 100
  const rawRegCoverage = totalGraduates > 0 ? (regAlumni / totalGraduates) * 100 : 0;
  const regCoveragePct =
    rawRegCoverage % 1 === 0 ? rawRegCoverage.toFixed(0) : rawRegCoverage.toFixed(1);

  const employed = Number(stats?.employed_alumni ?? 0);
  const selfEmployed = Number(stats?.self_employed_alumni ?? 0);
  const unemployed = Number(stats?.unemployed_alumni ?? 0);
  const notSpecified = Number(stats?.not_specified_alumni ?? 0);

  const workingTotal = employed + selfEmployed;
  const declaredTotal = workingTotal + unemployed;

  // Employment Rate %: (employed + self_employed) / declared_total * 100
  const rawEmploymentRate = declaredTotal > 0 ? (workingTotal / declaredTotal) * 100 : 0;
  const employmentRatePct =
    rawEmploymentRate % 1 === 0 ? rawEmploymentRate.toFixed(0) : rawEmploymentRate.toFixed(1);

  const declaredCompletionPct =
    regAlumni > 0 ? Math.round((declaredTotal / regAlumni) * 100) : 0;

  // ── Chart Data ─────────────────────────────────────────────────────────
  const registrationChartData = useMemo(() => {
    return [
      { name: "Registered Alumni", value: regAlumni, color: COLOR_REGISTERED },
      { name: "Unregistered Graduates", value: unregGraduates, color: COLOR_UNREGISTERED },
    ].filter((d) => d.value > 0);
  }, [regAlumni, unregGraduates]);

  const employmentChartData = useMemo(() => {
    return [
      { name: "Employed", value: employed, color: COLOR_EMPLOYED },
      { name: "Self-Employed", value: selfEmployed, color: COLOR_SELF_EMPLOYED },
      { name: "Unemployed", value: unemployed, color: COLOR_UNEMPLOYED },
      { name: "Not Specified", value: notSpecified, color: COLOR_NOT_SPECIFIED },
    ].filter((d) => d.value > 0);
  }, [employed, selfEmployed, unemployed, notSpecified]);

  const graduationTrendData = useMemo(() => {
    if (!stats?.graduates_by_year) return [];
    return Object.entries(stats.graduates_by_year).map(([year, count]) => ({
      year: `Batch ${year}`,
      graduates: Number(count || 0),
    }));
  }, [stats?.graduates_by_year]);

  const batchScopeLabel = selectedBatch ? `Batch ${selectedBatch}` : "All Batches";

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#02451C] mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading department analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-full bg-[#f8fafc] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 analytics-screen-ui ${
          showReport ? "hidden" : "block"
        } print:hidden`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ── Page Header (Approved Department Head Green Gradient Heading) ── */}
          <header className="rounded-2xl bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] p-4 sm:p-6 text-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-100">
                  DEPARTMENT ANALYTICS
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white">
                  Department Alumni & Employment Analytics
                </h1>
                <p className="mt-1 text-sm text-green-50/90 truncate" title={departmentName}>
                  Monitoring graduate records and employment outcomes for {departmentName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-green-50 text-[#006400] px-4 py-2.5 text-sm font-semibold transition shadow-sm self-start sm:self-auto shrink-0 cursor-pointer"
              >
                <Printer size={15} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </header>

          {/* ── Global Filter Bar (Locked Department, Selectable Batch) ── */}
          <FilterBar
            departmentName={departmentName}
            batches={batchOptions}
            selectedBatch={selectedBatch}
            onBatchChange={setSelectedBatch}
            onResetBatch={() => setSelectedBatch("")}
          />

          {/* ── 1. PRIMARY EXECUTIVE KPI SUMMARY (3 CARDS ONLY) ── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PrimaryKpiCard
              title="Total Department Graduates"
              value={totalGraduates.toLocaleString()}
              detail="Recorded institutional graduate database"
              icon={<GraduationCap className="w-5 h-5 text-[#02451C]" />}
              accentColor="text-[#02451C]"
              bgAccent="bg-[#e8f4ed]"
            />
            <PrimaryKpiCard
              title="Registration Coverage"
              value={`${regCoveragePct}%`}
              detail={`${regAlumni.toLocaleString()} of ${totalGraduates.toLocaleString()} graduates registered`}
              icon={<Users className="w-5 h-5 text-[#16a34a]" />}
              accentColor="text-[#16a34a]"
              bgAccent="bg-emerald-50"
            />
            <PrimaryKpiCard
              title="Employment Rate"
              value={`${employmentRatePct}%`}
              detail={`${workingTotal.toLocaleString()} employed/self-employed of ${declaredTotal.toLocaleString()} respondents`}
              icon={<Briefcase className="w-5 h-5 text-[#d97706]" />}
              accentColor="text-[#d97706]"
              bgAccent="bg-amber-50"
            />
          </section>

          {/* ── 2. DETAILED STATUS BREAKDOWN (6 COMPACT CARDS) ── */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <CompactMetricCard
              label="Employed"
              value={employed.toLocaleString()}
              subtext={regAlumni > 0 ? `${Math.round((employed / regAlumni) * 100)}% of registered` : "0%"}
              dotColor={COLOR_EMPLOYED}
            />
            <CompactMetricCard
              label="Self-Employed"
              value={selfEmployed.toLocaleString()}
              subtext={regAlumni > 0 ? `${Math.round((selfEmployed / regAlumni) * 100)}% of registered` : "0%"}
              dotColor={COLOR_SELF_EMPLOYED}
            />
            <CompactMetricCard
              label="Unemployed"
              value={unemployed.toLocaleString()}
              subtext={regAlumni > 0 ? `${Math.round((unemployed / regAlumni) * 100)}% of registered` : "0%"}
              dotColor={COLOR_UNEMPLOYED}
            />
            <CompactMetricCard
              label="Not Specified"
              value={notSpecified.toLocaleString()}
              subtext={regAlumni > 0 ? `${Math.round((notSpecified / regAlumni) * 100)}% of registered` : "0%"}
              dotColor={COLOR_NOT_SPECIFIED}
            />
            <CompactMetricCard
              label="Registered Alumni"
              value={regAlumni.toLocaleString()}
              subtext={`${regCoveragePct}% of graduates`}
              dotColor={COLOR_REGISTERED}
            />
            <CompactMetricCard
              label="Unregistered Graduates"
              value={unregGraduates.toLocaleString()}
              subtext={totalGraduates > 0 ? `${Math.round((unregGraduates / totalGraduates) * 100)}% of graduates` : "0%"}
              dotColor={COLOR_UNREGISTERED}
            />
          </section>

          {/* ── 3. REGISTRATION COVERAGE & EMPLOYMENT STATUS CHARTS ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Registration Coverage Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Registration Coverage
                    </h3>
                    <p className="text-xs text-gray-400">
                      Department graduates who created an alumni portal account
                    </p>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#02451C]" />
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
                            formatter={(val, name) => [
                              Number(val).toLocaleString(),
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ChartLegend
                      data={registrationChartData}
                      total={totalGraduates}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">
                    No registration records found for this cohort.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Total Department Graduates:</span>
                <span className="font-semibold text-slate-800">
                  {totalGraduates.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Employment Status Distribution Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Employment Status Distribution
                    </h3>
                    <p className="text-xs text-gray-400">
                      Status distribution of registered department alumni
                    </p>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#16a34a]" />
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
                            formatter={(val, name) => [
                              Number(val).toLocaleString(),
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ChartLegend
                      data={employmentChartData}
                      total={regAlumni}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">
                    No employment status records available.
                  </p>
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

          {/* ── 4. JOB–COURSE ALIGNMENT (Department-Scoped) ── */}
          <section>
            <DepartmentJobCourseAlignment
              alignmentRow={alignmentRow}
              departmentName={departmentName}
              batchScope={batchScopeLabel}
              onDrillDown={onDrillDown}
            />
          </section>

          {/* ── 5. GRADUATION TREND BY YEAR (Department Cohort Trend) ── */}
          <section>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Graduation Trend by Year
                    </h3>
                    <p className="text-xs text-gray-400">
                      Graduates recorded across academic batches for {departmentName}
                    </p>
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#02451C]" />
                </div>

                {graduationTrendData.length > 0 ? (
                  <div className="py-2">
                    <ResponsiveContainer width="100%" height={210}>
                      <LineChart
                        data={graduationTrendData}
                        margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f1f5f9"
                          vertical={false}
                        />
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
                          formatter={(v) => [
                            `${Number(v).toLocaleString()} Graduates`,
                            "Graduates",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="graduates"
                          stroke={TPC_GREEN_DEEP}
                          strokeWidth={2.5}
                          dot={{
                            fill: TPC_GREEN_DEEP,
                            r: 4,
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          activeDot={{
                            r: 6,
                            fill: TPC_GREEN_DEEP,
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">
                    No graduation batch records available.
                  </p>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                Displays the volume of degree completions per academic year for {departmentName}.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* ── Dedicated Printable Report View (shares existing cached stats) ── */}
      <div
        className={`analytics-printable-report ${
          showReport ? "block" : "hidden"
        } print:block`}
      >
        <PrintableReport
          stats={stats}
          filters={{ department: userDepartmentId, batch: selectedBatch }}
          departmentOptions={[{ id: userDepartmentId, name: departmentName }]}
          alignmentRows={alignmentRow ? [alignmentRow] : []}
          preparedByName={localStorage.getItem("userName")}
          onClose={() => setShowReport(false)}
        />
      </div>
    </>
  );
}
