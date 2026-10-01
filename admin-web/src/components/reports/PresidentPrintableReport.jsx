import React from "react";
import PrintableReportHeader from "./PrintableReportHeader";
import ReportMetadata from "./ReportMetadata";
import ExecutiveSummaryTable from "./ExecutiveSummaryTable";
import EmploymentStatusTable from "./EmploymentStatusTable";
import JobAlignmentTable from "./JobAlignmentTable";
import DepartmentComparisonTable from "./DepartmentComparisonTable";
import BatchSummaryTable from "./BatchSummaryTable";
import DetailedAlumniTable from "./DetailedAlumniTable";
import ReportSignatory from "./ReportSignatory";

/**
 * President Printable Report View
 * Formal institutional alumni tracking and employment document for the College President.
 */
export default function PresidentPrintableReport({
  overview,
  filters = {},
  departmentLabel = "All Departments",
  batchLabel = "All Batches",
  generatedAt,
  alignmentRows = [],
  reportType = "summary",
  alumniList = [],
  loadingAlumni = false,
  preparedByName,
  isLandscape = false,
  graduatesByYear = {},
}) {
  const isAllDepts = !filters.department || filters.department === "";
  const isAllBatches = !filters.batch || filters.batch === "" || filters.batch === "all";

  const title = "TPC ALUMNI TRACKING AND EMPLOYMENT REPORT";
  const subtitle = isAllDepts
    ? "Institutional Alumni Monitoring Summary"
    : `Department Alumni Monitoring Summary — ${departmentLabel}`;

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
                departmentLabel={departmentLabel}
                batchLabel={batchLabel}
                generatedAt={generatedAt}
                classification="Official Academic Report"
                reportTypeLabel={reportType === "detailed" ? "Detailed Alumni Roster" : "Institutional Summary"}
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

                  {/* 5. Job–Course Alignment Analysis */}
                  <JobAlignmentTable
                    aligned={overview.aligned}
                    notAligned={overview.notAligned}
                    pending={overview.pending}
                    totalEmployed={overview.workingTotal}
                    alignmentRatePct={overview.alignmentRatePct}
                  />

                  {/* 6. Department Comparison (Institutional) OR Graduation Cohort (Single Dept, All Batches ONLY) */}
                  {isAllDepts ? (
                    <DepartmentComparisonTable
                      rows={alignmentRows}
                      isLandscape={isLandscape}
                    />
                  ) : isAllBatches ? (
                    <BatchSummaryTable
                      graduatesByYear={graduatesByYear}
                      totalGraduates={overview.totalGraduates}
                    />
                  ) : null}
                </>
              ) : (
                /* Detailed Alumni Roster */
                <DetailedAlumniTable
                  alumniList={alumniList}
                  loading={loadingAlumni}
                />
              )}

              {/* 7. Signatory */}
              <ReportSignatory
                role="super_admin"
                preparedByName={preparedByName}
                generatedAt={generatedAt}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
