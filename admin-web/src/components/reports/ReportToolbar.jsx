import React from "react";
import { Printer, ArrowLeft, FileText, SlidersHorizontal } from "lucide-react";

/**
 * Report Configuration Toolbar (Screen only, hidden in print)
 * Allows customizing report scope, paper dimensions, and orientation before printing.
 */
export default function ReportToolbar({
  role = "super_admin",
  reportType = "summary",
  onReportTypeChange,
  department = "",
  onDepartmentChange,
  departmentOptions = [],
  batch = "",
  onBatchChange,
  batchOptions = [],
  paperSize = "A4",
  onPaperSizeChange,
  orientation = "portrait",
  onOrientationChange,
  onPrint,
  onClose,
  isDeptLocked = false,
  lockedDeptName = "",
}) {
  const isSuperAdmin = role === "super_admin";

  return (
    <div className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#02451C] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex p-1.5 bg-[#02451C]/10 text-[#02451C] rounded-lg">
              <FileText size={16} />
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Print Configuration
            </span>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Report Type Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onReportTypeChange("summary")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                reportType === "summary"
                  ? "bg-white text-[#02451C] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Summary Report
            </button>
            <button
              type="button"
              onClick={() => onReportTypeChange("detailed")}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                reportType === "detailed"
                  ? "bg-white text-[#02451C] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Detailed Roster
            </button>
          </div>

          {/* Department Selector (President only) */}
          {isSuperAdmin && !isDeptLocked ? (
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700 hover:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#02451C]"
              aria-label="Department Scope"
            >
              <option value="">All Departments (Institutional)</option>
              {departmentOptions.map((dept) => (
                <option key={dept.id ?? dept.name} value={dept.id ?? dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium">
              {lockedDeptName || "My Department"}
            </div>
          )}

          {/* Batch Selector */}
          <select
            value={batch}
            onChange={(e) => onBatchChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700 hover:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#02451C]"
            aria-label="Graduation Cohort"
          >
            <option value="">All Batches</option>
            {batchOptions.map((b) => (
              <option key={b} value={b}>
                Batch {b}
              </option>
            ))}
          </select>

          {/* Paper Size Selector */}
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700 hover:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#02451C]"
            aria-label="Paper Size"
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">Short / Letter (8.5 × 11 in)</option>
            <option value="Long">Long Bond (8.5 × 13 in)</option>
            <option value="Legal">US Legal (8.5 × 14 in)</option>
          </select>

          {/* Orientation Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onOrientationChange("portrait")}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                orientation === "portrait"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Portrait
            </button>
            <button
              type="button"
              onClick={() => onOrientationChange("landscape")}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                orientation === "landscape"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Landscape
            </button>
          </div>
        </div>

        {/* Right: Print Action Button */}
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 bg-[#02451C] hover:bg-[#035a25] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer"
        >
          <Printer size={15} />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
}
