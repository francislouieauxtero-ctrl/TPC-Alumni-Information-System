import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import alumniService from "../../services/alumniService";
import ReportToolbar from "../../components/reports/ReportToolbar";
import PresidentPrintableReport from "../../components/reports/PresidentPrintableReport";
import DepartmentHeadPrintableReport from "../../components/reports/DepartmentHeadPrintableReport";
import { getReportPrintStyles } from "../../components/reports/reportPrintStyles";

/**
 * Universal Printable Report Container
 * Provides dedicated, scope-aware, formal alumni tracking reports for both
 * the College President and Department Heads.
 */
export default function PrintableReport({
  stats: propStats,
  filters: propFilters,
  departmentOptions: propDepartmentOptions = [],
  alignmentRows: propAlignmentRows = [],
  onClose,
  preparedByName: propPreparedByName,
}) {
  const userRole = localStorage.getItem("userRole") || "super_admin";
  const userDepartmentId = localStorage.getItem("userDepartment") || "";
  const userDepartmentName = localStorage.getItem("userDepartmentName") || "";
  const isDeptHead = userRole === "admin";

  // Filter & Scope state
  const [filters, setFilters] = useState(() => ({
    department: isDeptHead ? userDepartmentId : propFilters?.department || "",
    batch: propFilters?.batch || "",
  }));

  // Report configuration state
  const [reportType, setReportType] = useState("summary"); // "summary" | "detailed"
  const [paperSize, setPaperSize] = useState("A4"); // "A4" | "Letter" | "Long" | "Legal"
  const [orientation, setOrientation] = useState("portrait"); // "portrait" | "landscape"

  // Fresh data state for standalone route or filter updates inside report preview
  const [fetchedStats, setFetchedStats] = useState(null);
  const [fetchedAlignmentRows, setFetchedAlignmentRows] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Detailed Alumni Roster state (lazy loaded only when detailed report is selected)
  const [alumniList, setAlumniList] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);

  // Sync prop filters if they change from parent
  useEffect(() => {
    if (propFilters) {
      setFilters((prev) => ({
        ...prev,
        department: isDeptHead ? userDepartmentId : propFilters.department || "",
        batch: propFilters.batch || "",
      }));
    }
  }, [propFilters, isDeptHead, userDepartmentId]);

  // Fetch departments if not provided
  useEffect(() => {
    if (propDepartmentOptions && propDepartmentOptions.length > 0) return;
    let mounted = true;
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments");
        if (mounted && response.data?.status && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch departments for report:", err);
      }
    };
    fetchDepartments();
    return () => {
      mounted = false;
    };
  }, [propDepartmentOptions]);

  // Standalone / Filter fetch: fetch dashboard & alignment if not provided by parent or when user changes filters in toolbar
  useEffect(() => {
    // If stats were provided and filters haven't changed from props, don't duplicate request
    const isUsingPropData =
      propStats &&
      filters.department === (isDeptHead ? userDepartmentId : propFilters?.department || "") &&
      filters.batch === (propFilters?.batch || "");

    if (isUsingPropData) {
      return;
    }

    let mounted = true;
    const fetchData = async () => {
      try {
        const params = {};
        if (filters.department) params.department_id = filters.department;
        if (filters.batch) params.batch = filters.batch;

        const endpoint = isDeptHead ? "/department-head/dashboard" : "/admin/dashboard";

        const [statsRes, alignRes] = await Promise.all([
          api.get(endpoint, { params }),
          api.get("/admin/alumni/alignment/summary", { params }),
        ]);

        if (!mounted) return;
        if (statsRes.data?.status) {
          setFetchedStats(statsRes.data.data.stats);
        }
        if (alignRes.data?.status && Array.isArray(alignRes.data.data)) {
          setFetchedAlignmentRows(alignRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [filters, propStats, propFilters, isDeptHead, userDepartmentId]);

  // Lazy fetch detailed alumni records ONLY when reportType === "detailed"
  useEffect(() => {
    if (reportType !== "detailed") return;
    let mounted = true;
    setLoadingAlumni(true);

    const fetchDetailedAlumni = async () => {
      try {
        const params = {
          per_page: 500, // Fetch comprehensive dataset for print roster
        };
        if (isDeptHead) {
          params.department_id = userDepartmentId;
        } else if (filters.department) {
          params.department_id = filters.department;
        }
        if (filters.batch) {
          params.batch_year = filters.batch;
        }

        const res = await alumniService.getAll(params);
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAlumniList(list);
      } catch (err) {
        console.error("Failed to fetch detailed alumni for report:", err);
      } finally {
        if (mounted) setLoadingAlumni(false);
      }
    };

    fetchDetailedAlumni();
    return () => {
      mounted = false;
    };
  }, [reportType, filters, isDeptHead, userDepartmentId]);

  // Determine active data source
  const stats = fetchedStats || propStats;
  const alignmentRows =
    fetchedAlignmentRows.length > 0
      ? fetchedAlignmentRows
      : propAlignmentRows.length > 0
      ? propAlignmentRows
      : [];
  const departmentOptions =
    propDepartmentOptions.length > 0 ? propDepartmentOptions : departments;

  // Batch options derived from stats or standard sequence
  const batchOptions = useMemo(() => {
    if (stats?.graduates_by_year && Object.keys(stats.graduates_by_year).length > 0) {
      return Object.keys(stats.graduates_by_year).sort((a, b) => Number(b) - Number(a));
    }
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(currentYear - i));
  }, [stats?.graduates_by_year]);

  // ─── Reconciled Authoritative KPI Calculations (Exact Analytics Alignment) ───
  const overview = useMemo(() => {
    const totalGraduates = Number(stats?.total_graduates ?? 0);
    const unregGraduates = Number(stats?.not_registered_graduates ?? 0);
    const regAlumni = Number(stats?.registered_alumni ?? Math.max(0, totalGraduates - unregGraduates));

    const rawRegCoverage = totalGraduates > 0 ? (regAlumni / totalGraduates) * 100 : 0;
    const regCoveragePct =
      rawRegCoverage % 1 === 0 ? rawRegCoverage.toFixed(0) : rawRegCoverage.toFixed(1);

    const employed = Number(stats?.employed_alumni ?? 0);
    const selfEmployed = Number(stats?.self_employed_alumni ?? 0);
    const unemployed = Number(stats?.unemployed_alumni ?? 0);
    const notSpecified = Number(stats?.not_specified_alumni ?? 0);

    const workingTotal = employed + selfEmployed;
    const declaredTotal = workingTotal + unemployed;

    const rawEmploymentRate = declaredTotal > 0 ? (workingTotal / declaredTotal) * 100 : 0;
    const employmentRatePct =
      rawEmploymentRate % 1 === 0 ? rawEmploymentRate.toFixed(0) : rawEmploymentRate.toFixed(1);

    // Curricular Alignment (Aggregated from alignment rows)
    let aligned = 0;
    let notAligned = 0;
    let pending = 0;

    if (alignmentRows && alignmentRows.length > 0) {
      aligned = alignmentRows.reduce((sum, r) => sum + Number(r.aligned || 0), 0);
      notAligned = alignmentRows.reduce((sum, r) => sum + Number(r.not_aligned || 0), 0);
      pending = alignmentRows.reduce((sum, r) => sum + Number(r.no_response || 0), 0);
    } else {
      aligned = workingTotal; // default fallback if no rows
    }

    const alignmentDeclared = aligned + notAligned;
    const rawAlignmentRate = alignmentDeclared > 0 ? (aligned / alignmentDeclared) * 100 : 0;
    const alignmentRatePct =
      rawAlignmentRate % 1 === 0 ? rawAlignmentRate.toFixed(0) : rawAlignmentRate.toFixed(1);

    return {
      totalGraduates,
      regAlumni,
      unregGraduates,
      regCoveragePct,
      employed,
      selfEmployed,
      unemployed,
      notSpecified,
      workingTotal,
      declaredTotal,
      employmentRatePct,
      aligned,
      notAligned,
      pending,
      alignmentRatePct,
    };
  }, [stats, alignmentRows]);

  // Labels
  const departmentLabel = isDeptHead
    ? userDepartmentName || "Assigned Department"
    : filters.department
    ? departmentOptions.find((d) => String(d.id ?? d.name) === String(filters.department))?.name ||
      filters.department
    : "All Departments";

  const batchLabel = filters.batch ? `Batch ${filters.batch}` : "All Batches";
  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const preparedByName =
    propPreparedByName || localStorage.getItem("userName") || (isDeptHead ? "Department Head" : "College President");

  return (
    <div className="report-preview-container">
      {/* ── Screen-Only Configuration Toolbar ── */}
      <ReportToolbar
        role={userRole}
        reportType={reportType}
        onReportTypeChange={setReportType}
        department={filters.department}
        onDepartmentChange={(dept) => setFilters((prev) => ({ ...prev, department: dept }))}
        departmentOptions={departmentOptions}
        batch={filters.batch}
        onBatchChange={(b) => setFilters((prev) => ({ ...prev, batch: b }))}
        batchOptions={batchOptions}
        paperSize={paperSize}
        onPaperSizeChange={setPaperSize}
        orientation={orientation}
        onOrientationChange={setOrientation}
        onPrint={() => window.print()}
        onClose={onClose}
        isDeptLocked={isDeptHead}
        lockedDeptName={userDepartmentName}
      />

      {/* ── Role-Specific Report Document ── */}
      {isDeptHead ? (
        <DepartmentHeadPrintableReport
          overview={overview}
          departmentName={userDepartmentName}
          departmentId={userDepartmentId}
          batchLabel={batchLabel}
          generatedAt={generatedAt}
          reportType={reportType}
          alumniList={alumniList}
          loadingAlumni={loadingAlumni}
          preparedByName={preparedByName}
          graduatesByYear={stats?.graduates_by_year || {}}
        />
      ) : (
        <PresidentPrintableReport
          overview={overview}
          filters={filters}
          departmentLabel={departmentLabel}
          batchLabel={batchLabel}
          generatedAt={generatedAt}
          alignmentRows={alignmentRows}
          reportType={reportType}
          alumniList={alumniList}
          loadingAlumni={loadingAlumni}
          preparedByName={preparedByName}
          isLandscape={orientation === "landscape"}
          graduatesByYear={stats?.graduates_by_year || {}}
        />
      )}

      {/* ── Dynamic Injected Print Stylesheet ── */}
      <style>{getReportPrintStyles(paperSize, orientation)}</style>
    </div>
  );
}
