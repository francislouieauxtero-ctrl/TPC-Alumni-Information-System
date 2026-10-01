import React from "react";

/**
 * Report Signatory and Institutional Endorsement Footer
 * 
 * President report:  single column — Alumni President
 * Department Head:   two columns — Department Head (left) + Alumni President (right)
 *
 * IMPORTANT: Does NOT show department name, program name, or office label
 * under the Department Head signatory block.
 */
export default function ReportSignatory({
  role = "super_admin",
  preparedByName,
  departmentName,  // kept for backward compatibility but NOT displayed
  generatedAt,
  alumniPresidentName,
}) {
  const isDeptHead = role === "admin";

  // Authenticated user's display name
  const userName = preparedByName || (isDeptHead ? "Department Head" : "Alumni President");

  // Alumni President's name (different from the authenticated dept head user)
  const presidentName =
    alumniPresidentName ||
    (isDeptHead ? "" : userName); // For president role, userName IS the president

  if (isDeptHead) {
    // ── Department Head: two-column signatory ────────────────────────────────
    return (
      <div className="report-footer-section report-keep-together">
        <div className="report-signatory-grid" style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
          {/* Left: Department Head */}
          <div className="report-signatory-block">
            <p className="report-signatory-label">Prepared by:</p>
            <div className="report-signature-space" />
            <p className="report-signatory-name">{userName}</p>
            <p className="report-signatory-title">Department Head</p>
            {/* NOTE: Do NOT show department name / program under signatory */}
          </div>

          {/* Right: Alumni President */}
          <div className="report-signatory-block">
            <p className="report-signatory-label">Certified by:</p>
            <div className="report-signature-space" />
            <p className="report-signatory-name">{presidentName || "Alumni President"}</p>
            <p className="report-signatory-title">Alumni President</p>
          </div>
        </div>
      </div>
    );
  }

  // ── President: single-column signatory ──────────────────────────────────────
  return (
    <div className="report-footer-section report-keep-together">
      <div className="report-signatory-grid">
        <div className="report-signatory-block">
          <p className="report-signatory-label">Prepared and Certified by:</p>
          <div className="report-signature-space" />
          <p className="report-signatory-name">{userName}</p>
          <p className="report-signatory-title">Alumni President</p>
        </div>
      </div>
    </div>
  );
}
