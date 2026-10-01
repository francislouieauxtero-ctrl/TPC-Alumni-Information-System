import React from "react";

/**
 * Report Scope Metadata Section
 * Formal academic document classification, department scope, cohort batch, and generation timestamp.
 */
export default function ReportMetadata({
  departmentLabel,
  batchLabel,
  generatedAt,
  classification = "Official Academic Report",
  reportTypeLabel,
}) {
  return (
    <div className="report-metadata-bar">
      <div className="report-meta-item">
        <span className="report-meta-label">Department Scope:</span>
        <span className="report-meta-value">{departmentLabel}</span>
      </div>
      <div className="report-meta-item">
        <span className="report-meta-label">Graduation Cohort:</span>
        <span className="report-meta-value">{batchLabel}</span>
      </div>
      {reportTypeLabel && (
        <div className="report-meta-item">
          <span className="report-meta-label">Report Type:</span>
          <span className="report-meta-value">{reportTypeLabel}</span>
        </div>
      )}
      <div className="report-meta-item">
        <span className="report-meta-label">Document Classification:</span>
        <span className="report-meta-value">{classification}</span>
      </div>
      <div className="report-meta-item">
        <span className="report-meta-label">Date Generated:</span>
        <span className="report-meta-value">{generatedAt}</span>
      </div>
    </div>
  );
}
