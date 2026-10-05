import React, { useState, useEffect, useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import ReportPDFDocument from "../../components/reports/ReportPDFDocument";

import api from "../../services/api";
import alumniService from "../../services/alumniService";
import ReportToolbar from "../../components/reports/ReportToolbar";
import PresidentPrintableReport from "../../components/reports/PresidentPrintableReport";
import DepartmentHeadPrintableReport from "../../components/reports/DepartmentHeadPrintableReport";
import { getReportPrintStyles } from "../../components/reports/reportPrintStyles";

// ─── Timestamp helper: YYYYMMDD_HHmmss (24-hr, no colons) ─────────────────────
function buildTimestamp() {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM   = String(now.getMonth() + 1).padStart(2, "0");
  const DD   = String(now.getDate()).padStart(2, "0");
  const HH   = String(now.getHours()).padStart(2, "0");
  const mm   = String(now.getMinutes()).padStart(2, "0");
  const ss   = String(now.getSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
}

/**
 * Universal Printable Report Container
 * Provides dedicated, scope-aware, formal alumni tracking reports for both
 * the College President and Department Heads.
 *
 * Workflow:
 *   User configures → clicks "Preview & Print"
 *   → @react-pdf/renderer generates actual PDF blob
 *   → In-app preview modal opens showing the PDF
 *   → User can Print or Save PDF (same generated blob)
 */
export default function PrintableReport({
  stats: propStats,
  filters: propFilters,
  departmentOptions: propDepartmentOptions = [],
  alignmentRows: propAlignmentRows = [],
  onClose,
  preparedByName: propPreparedByName,
  alumniPresidentName: propAlumniPresidentName,
}) {
  const userRole           = localStorage.getItem("userRole") || "super_admin";
  const userDepartmentId   = localStorage.getItem("userDepartment") || "";
  const userDepartmentName = localStorage.getItem("userDepartmentName") || "";
  const isDeptHead         = userRole === "admin";

  // ── Filter & Scope State ────────────────────────────────────────────────────
  const [filters, setFilters] = useState(() => ({
    department: isDeptHead ? userDepartmentId : propFilters?.department || "",
    batch:      propFilters?.batch || "",
  }));

  // ── Report Configuration State ──────────────────────────────────────────────
  const [reportType,   setReportType]   = useState("summary");   // "summary" | "detailed"
  const [paperSize,    setPaperSize]    = useState("A4");         // "A4" | "Letter" | "Long" | "Legal"
  const [orientation,  setOrientation]  = useState("portrait");   // "portrait" | "landscape"

  // ── Data State ──────────────────────────────────────────────────────────────
  const [fetchedStats,         setFetchedStats]         = useState(null);
  const [fetchedAlignmentRows, setFetchedAlignmentRows] = useState([]);
  const [departments,          setDepartments]          = useState([]);
  const [alumniList,           setAlumniList]           = useState([]);
  const [loadingAlumni,        setLoadingAlumni]        = useState(false);

  // ── PDF Preview State ───────────────────────────────────────────────────────
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState(null);
  const [showPreview,    setShowPreview]    = useState(false);

  // ── Sync prop filters ───────────────────────────────────────────────────────
  useEffect(() => {
    if (propFilters) {
      setFilters((prev) => ({
        ...prev,
        department: isDeptHead ? userDepartmentId : propFilters.department || "",
        batch:      propFilters.batch || "",
      }));
    }
  }, [propFilters, isDeptHead, userDepartmentId]);

  // ── Fetch departments if not provided ───────────────────────────────────────
  useEffect(() => {
    if (propDepartmentOptions && propDepartmentOptions.length > 0) return;
    let mounted = true;
    api.get("/departments")
      .then((response) => {
        if (mounted && response.data?.status && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch departments for report:", err));
    return () => { mounted = false; };
  }, [propDepartmentOptions]);

  // ── Fetch stats when filters change ────────────────────────────────────────
  useEffect(() => {
    const isUsingPropData =
      propStats &&
      filters.department === (isDeptHead ? userDepartmentId : propFilters?.department || "") &&
      filters.batch === (propFilters?.batch || "");
    if (isUsingPropData) return;

    let mounted = true;
    const params = {};
    if (filters.department) params.department_id = filters.department;
    if (filters.batch)      params.batch         = filters.batch;
    const endpoint = isDeptHead ? "/department-head/dashboard" : "/admin/dashboard";

    Promise.all([
      api.get(endpoint, { params }),
      api.get("/admin/alumni/alignment/summary", { params }),
    ])
      .then(([statsRes, alignRes]) => {
        if (!mounted) return;
        if (statsRes.data?.status)                                   setFetchedStats(statsRes.data.data.stats);
        if (alignRes.data?.status && Array.isArray(alignRes.data.data)) setFetchedAlignmentRows(alignRes.data.data);
      })
      .catch((err) => console.error("Failed to fetch report data:", err));
    return () => { mounted = false; };
  }, [filters, propStats, propFilters, isDeptHead, userDepartmentId]);

  // ── Lazy fetch detailed alumni records ─────────────────────────────────────
  useEffect(() => {
    if (reportType !== "detailed") return;
    let mounted = true;
    setLoadingAlumni(true);

    const params = { per_page: 500 };
    if (isDeptHead) {
      params.department_id = userDepartmentId;
    } else if (filters.department) {
      params.department_id = filters.department;
    }
    if (filters.batch) params.batch_year = filters.batch;

    alumniService.getAll(params)
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAlumniList(list);
      })
      .catch((err) => console.error("Failed to fetch detailed alumni for report:", err))
      .finally(() => { if (mounted) setLoadingAlumni(false); });
    return () => { mounted = false; };
  }, [reportType, filters, isDeptHead, userDepartmentId]);

  // ── Active Data Source ──────────────────────────────────────────────────────
  const stats = fetchedStats || propStats;
  const alignmentRows =
    fetchedAlignmentRows.length > 0
      ? fetchedAlignmentRows
      : propAlignmentRows.length > 0
      ? propAlignmentRows
      : [];
  const departmentOptions =
    propDepartmentOptions.length > 0 ? propDepartmentOptions : departments;

  // ── Batch Options ───────────────────────────────────────────────────────────
  const batchOptions = useMemo(() => {
    if (stats?.graduates_by_year && Object.keys(stats.graduates_by_year).length > 0) {
      return Object.keys(stats.graduates_by_year).sort((a, b) => Number(b) - Number(a));
    }
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(currentYear - i));
  }, [stats?.graduates_by_year]);

  // ── Reconciled KPI Calculations ─────────────────────────────────────────────
  const overview = useMemo(() => {
    const totalGraduates  = Number(stats?.total_graduates ?? 0);
    const unregGraduates  = Number(stats?.not_registered_graduates ?? 0);
    const regAlumni       = Number(stats?.registered_alumni ?? Math.max(0, totalGraduates - unregGraduates));

    const rawRegCoverage  = totalGraduates > 0 ? (regAlumni / totalGraduates) * 100 : 0;
    const regCoveragePct  = rawRegCoverage % 1 === 0 ? rawRegCoverage.toFixed(0) : rawRegCoverage.toFixed(1);

    const employed     = Number(stats?.employed_alumni ?? 0);
    const selfEmployed = Number(stats?.self_employed_alumni ?? 0);
    const unemployed   = Number(stats?.unemployed_alumni ?? 0);
    const notSpecified = Number(stats?.not_specified_alumni ?? 0);

    const workingTotal  = employed + selfEmployed;
    const declaredTotal = workingTotal + unemployed;

    const rawEmploymentRate  = declaredTotal > 0 ? (workingTotal / declaredTotal) * 100 : 0;
    const employmentRatePct  = rawEmploymentRate % 1 === 0 ? rawEmploymentRate.toFixed(0) : rawEmploymentRate.toFixed(1);

    let aligned   = 0;
    let notAligned = 0;
    let pending    = 0;

    if (alignmentRows && alignmentRows.length > 0) {
      aligned    = alignmentRows.reduce((sum, r) => sum + Number(r.aligned    || 0), 0);
      notAligned = alignmentRows.reduce((sum, r) => sum + Number(r.not_aligned || 0), 0);
      pending    = alignmentRows.reduce((sum, r) => sum + Number(r.no_response || 0), 0);
    } else {
      aligned = workingTotal;
    }

    const alignmentDeclared = aligned + notAligned;
    const rawAlignmentRate  = alignmentDeclared > 0 ? (aligned / alignmentDeclared) * 100 : 0;
    const alignmentRatePct  = rawAlignmentRate % 1 === 0 ? rawAlignmentRate.toFixed(0) : rawAlignmentRate.toFixed(1);

    return {
      totalGraduates, regAlumni, unregGraduates, regCoveragePct,
      employed, selfEmployed, unemployed, notSpecified,
      workingTotal, declaredTotal, employmentRatePct,
      aligned, notAligned, pending, alignmentRatePct,
    };
  }, [stats, alignmentRows]);

  // ── Labels ──────────────────────────────────────────────────────────────────
  const departmentLabel = isDeptHead
    ? userDepartmentName || "Assigned Department"
    : filters.department
    ? departmentOptions.find((d) => String(d.id ?? d.name) === String(filters.department))?.name || filters.department
    : "All Departments";

  const batchLabel  = filters.batch ? `Batch ${filters.batch}` : "All Batches";
  const generatedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const preparedByName =
    propPreparedByName || localStorage.getItem("userName") || (isDeptHead ? "Department Head" : "Alumni President");

  // Alumni President name: from prop, then localStorage, then fallback
  const alumniPresidentName =
    propAlumniPresidentName ||
    localStorage.getItem("alumniPresidentName") ||
    localStorage.getItem("presidentName") ||
    "";

  // ── PDF Generation ──────────────────────────────────────────────────────────
  const buildPdfDoc = () => (
    <ReportPDFDocument
      role={isDeptHead ? "deptHead" : "president"}
      overview={overview}
      departmentLabel={departmentLabel}
      batchLabel={batchLabel}
      generatedAt={generatedAt}
      alignmentRows={alignmentRows}
      reportType={reportType}
      alumniList={alumniList}
      preparedByName={preparedByName}
      alumniPresidentName={alumniPresidentName}
      paperSize={paperSize}
      orientation={orientation}
      graduatesByYear={stats?.graduates_by_year || {}}
      filters={isDeptHead ? { department: userDepartmentId, batch: filters.batch } : filters}
    />
  );

  const generatePdfBlob = async () => {
    const blob = await pdf(buildPdfDoc()).toBlob();
    return blob;
  };

  // ── Preview Handler ─────────────────────────────────────────────────────────
  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    setShowPreview(true);  // Show modal immediately (with loading state)
    try {
      const blob = await generatePdfBlob();
      const url  = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      setPreviewError("Unable to generate report. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Close Preview ───────────────────────────────────────────────────────────
  const closePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewError(null);
  };

  // ── Save PDF ────────────────────────────────────────────────────────────────
  const savePdf = () => {
    if (!previewUrl) return;
    const ts   = buildTimestamp();
    const name = isDeptHead ? `DeptAlumniReport_${ts}.pdf` : `AlumniReport_${ts}.pdf`;
    const link = document.createElement("a");
    link.href     = previewUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Print PDF ───────────────────────────────────────────────────────────────
  const printPdf = () => {
    if (!previewUrl) return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = previewUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (_) {
        // Fallback: open in new tab so user can print from there
        window.open(previewUrl, "_blank");
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 2000);
    };
  };

  return (
    <div className="report-preview-container">
      {/* ── Configuration Toolbar ── */}
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
        onPrint={handlePreview}
        onClose={onClose}
        isDeptLocked={isDeptHead}
        lockedDeptName={userDepartmentName}
      />

      {/* ── PDF Preview Modal ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.72)" }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl flex flex-col"
            style={{ width: "min(960px, 96vw)", height: "min(92vh, 900px)" }}
          >
            {/* Modal Header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 gap-2.5 sm:gap-3 border-b border-slate-200 shrink-0"
              style={{ borderRadius: "16px 16px 0 0", background: "#f8fafc" }}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span
                  className="inline-flex items-center justify-center rounded-lg shrink-0"
                  style={{ background: "#02451C", width: 32, height: 32 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate">TPC Alumni Report Preview</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {isDeptHead ? "Department Alumni Report" : "President Alumni Report"} · {paperSize} {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                {!previewLoading && !previewError && previewUrl && (
                  <>
                    <button
                      type="button"
                      onClick={printPdf}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      style={{ background: "#02451C", color: "white" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="6 9 6 2 18 2 18 9"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={savePdf}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                      style={{ background: "#0F3A5C", color: "white" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Save PDF
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={closePreview}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden rounded-b-2xl" style={{ background: "#e5e7eb" }}>
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#02451C" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <p className="text-sm font-semibold text-slate-600">Generating report preview…</p>
                  <p className="text-xs text-slate-400">Building PDF document</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-sm font-semibold text-red-700">{previewError}</p>
                  <button
                    type="button"
                    onClick={() => { setPreviewError(null); setShowPreview(false); }}
                    className="text-xs text-slate-500 underline cursor-pointer"
                  >
                    Close and try again
                  </button>
                </div>
              ) : previewUrl ? (
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  style={{ borderRadius: "0 0 16px 16px" }}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                    <p className="text-sm text-slate-600 font-medium">
                      PDF preview is not supported in this browser.
                    </p>
                    <button
                      type="button"
                      onClick={savePdf}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer"
                      style={{ background: "#02451C" }}
                    >
                      Download PDF Instead
                    </button>
                  </div>
                </object>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── Screen HTML Report (display/analytics view — not for official printing) ── */}
      {isDeptHead ? (
        <DepartmentHeadPrintableReport
          overview={overview}
          departmentName={userDepartmentName}
          departmentId={userDepartmentId}
          batchLabel={batchLabel}
          batch={filters.batch}
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

      {/* ── Dynamic Print Stylesheet (screen preview layout only) ── */}
      <style>{getReportPrintStyles(paperSize, orientation)}</style>
    </div>
  );
}
