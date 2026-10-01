import React from "react";
import PrintableReportHeader from "./PrintableReportHeader";
import ReportMetadata from "./ReportMetadata";
import ExecutiveSummaryTable from "./ExecutiveSummaryTable";
import EmploymentStatusTable from "./EmploymentStatusTable";
import JobAlignmentTable from "./JobAlignmentTable";
import BatchSummaryTable from "./BatchSummaryTable";
import DetailedAlumniTable from "./DetailedAlumniTable";
import ReportSignatory from "./ReportSignatory";

/**
 * Department Head Printable Report View
 * Formal department-scoped alumni tracking and employment document.
 * Strictly locked to assigned department — zero cross-department data leakage.
 */
export default function DepartmentHeadPrintableReport({
  overview,
  departmentName = "",
  departmentId,
  batchLabel = "All Batches",
  batch = "",
  generatedAt,
  reportType = "summary",
  alumniList = [],
  loadingAlumni = false,
  preparedByName,
  graduatesByYear = {},
}) {
  const isAllBatches = !batch || batch === "" || batch === "all" || batchLabel === "All Batches";

  // Fail-safe guard: If no assigned department, never fall back to institution-wide statistics.
  if (!departmentId && !departmentName) {
    return (
      <div className="report-sheet">
        <PrintableReportHeader
          title="TPC DEPARTMENT ALUMNI TRACKING AND EMPLOYMENT REPORT"
          subtitle="Department Alumni Monitoring Summary"
        />
        <div className="py-12 text-center">
          <p className="text-rose-700 font-bold text-sm">
            Access Restricted: No academic department assignment detected.
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Department Head reports are strictly scoped to verified department assignments.
          </p>
        </div>
      </div>
    );
  }

  const title = "TPC DEPARTMENT ALUMNI TRACKING AND EMPLOYMENT REPORT";
  const subtitle = `Department Alumni Monitoring Summary — ${departmentName}`;

  return (
    <div className="report-sheet">
      <table className="report-page-table">
        <thead>
          <tr>
            <td>
              {/* 1. Official TPC Header (repeats at top of each printed page) */}
              <PrintableReportHeader title={title} subtitle={subtitle} />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {/* 2. Scope Metadata */}
              <ReportMetadata
                departmentLabel={departmentName}
                batchLabel={batchLabel}
                generatedAt={generatedAt}
                classification="Official Academic Report"
                reportTypeLabel={reportType === "detailed" ? "Detailed Alumni Roster" : "Department Summary"}
              />

              {reportType === "summary" ? (
                <>
                  {/* 3. Executive Summary */}
                  <ExecutiveSummaryTable overview={overview} />

                  {/* 4. Employment Status Distribution */}
                  <EmploymentStatusTable
                    employed={overview.employed}
                    selfEmployed={overview.selfEmployed}
                    unemployed={overview.unemployed}
                    notSpecified={overview.notSpecified}
                    registeredAlumni={overview.regAlumni}
                  />

                  {/* 5. Department Job–Course Alignment Analysis */}
                  <JobAlignmentTable
                    aligned={overview.aligned}
                    notAligned={overview.notAligned}
                    pending={overview.pending}
                    totalEmployed={overview.workingTotal}
                    alignmentRatePct={overview.alignmentRatePct}
                  />

                  {/* 6. Graduation Cohort Distribution ONLY if All Batches */}
                  {isAllBatches && (
                    <BatchSummaryTable
                      graduatesByYear={graduatesByYear}
                      totalGraduates={overview.totalGraduates}
                    />
                  )}
                </>
              ) : (
                /* Detailed Alumni Roster for Assigned Department */
                <DetailedAlumniTable
                  alumniList={alumniList}
                  loading={loadingAlumni}
                />
              )}

              {/* 7. Signatory */}
              <ReportSignatory
                role="admin"
                preparedByName={preparedByName}
                departmentName={departmentName}
                generatedAt={generatedAt}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
