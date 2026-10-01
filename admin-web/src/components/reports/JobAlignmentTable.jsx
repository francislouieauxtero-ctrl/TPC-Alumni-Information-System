import React from "react";

/**
 * Job–Course Alignment Table
 * Compact formal presentation of curricular alignment outcomes for employed alumni.
 * Strict compliance: Excludes unregistered graduates, uses "Pending Alignment Response".
 */
export default function JobAlignmentTable({
  aligned = 0,
  notAligned = 0,
  pending = 0,
  totalEmployed = 0,
  alignmentRatePct = "0.0",
}) {
  const calcPct = (val) => {
    if (!totalEmployed || totalEmployed <= 0) return "0.0%";
    const pct = (val / totalEmployed) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const rows = [
    { label: "Aligned (Work directly aligns with college degree / field)", count: aligned, pct: calcPct(aligned), note: "Curricularly aligned" },
    { label: "Not Aligned (Work does not directly align with degree)", count: notAligned, pct: calcPct(notAligned), note: "Non-aligned" },
    { label: "Pending Alignment Response (Employed; pending confirmation)", count: pending, pct: calcPct(pending), note: "Pending declaration" },
  ];

  const declaredCount = aligned + notAligned;

  return (
    <section className="report-section report-keep-together">
      <div className="flex items-center justify-between">
        <h2 className="report-section-title">3. Job–Course Alignment Analysis</h2>
        <div className="report-badge-rate">
          Alignment Rate: <strong>{alignmentRatePct}%</strong>
        </div>
      </div>
      <table className="report-table">
        <thead>
          <tr>
            <th className="text-left" style={{ width: "55%" }}>Alignment Classification</th>
            <th className="text-center" style={{ width: "20%" }}>Headcount</th>
            <th className="text-center" style={{ width: "25%" }}>% of Total Employed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="text-left font-medium">{row.label}</td>
              <td className="text-center">{row.count.toLocaleString()}</td>
              <td className="text-center font-medium">{row.pct}</td>
            </tr>
          ))}
          <tr className="report-total-row">
            <td className="text-left font-bold">Total Employed / Working Alumni Cohort</td>
            <td className="text-center font-bold">{totalEmployed.toLocaleString()}</td>
            <td className="text-center font-bold">100.0%</td>
          </tr>
        </tbody>
      </table>
      <div className="report-note-text">
        * Alignment Rate ({alignmentRatePct}%) is evaluated exclusively among the {declaredCount.toLocaleString()} employed alumni who formally declared alignment: Aligned / (Aligned + Not Aligned) × 100.
        <br />
        * Pending Alignment Response represents employed alumni who have yet to complete the alignment confirmation survey.
      </div>
    </section>
  );
}
