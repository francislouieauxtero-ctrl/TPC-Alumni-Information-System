import React from "react";

/**
 * Report Signatory and Institutional Endorsement Footer
 * Compact, formal signature blocks customized by user role.
 */
export default function ReportSignatory({
  role = "super_admin",
  preparedByName,
  departmentName,
  generatedAt,
}) {
  const isDeptHead = role === "admin";
  const name = preparedByName || (isDeptHead ? "Department Head" : "College President");
  const title = isDeptHead ? "Department Head" : "College President";
  const office = isDeptHead
    ? (departmentName || "Academic Department")
    : "Office of the College President";

  return (
    <div className="report-footer-section report-keep-together">
      <div className="report-signatory-grid">
        <div className="report-signatory-block">
          <p className="report-signatory-label">Prepared and Certified by:</p>
          <div className="report-signature-space" />
          <p className="report-signatory-name">{name}</p>
          <p className="report-signatory-title">{title}</p>
          <p className="report-signatory-office">{office}</p>
        </div>

        {isDeptHead && (
          <div className="report-signatory-block">
            <p className="report-signatory-label">Noted by:</p>
            <div className="report-signature-space" />
            <p className="report-signatory-name">Office of the College President</p>
            <p className="report-signatory-title">Talibon Polytechnic College</p>
            <p className="report-signatory-office">Executive Administration</p>
          </div>
        )}
      </div>

      <div className="report-document-footer">
        <span>Official Academic Report — Talibon Polytechnic College</span>
        <span>Generated: {generatedAt}</span>
      </div>
    </div>
  );
}
