import React from "react";

/**
 * Department Batch/Cohort Summary Table
 * Compact breakdown of graduates across historical academic completion cohorts.
 */
export default function BatchSummaryTable({ graduatesByYear = {}, totalGraduates = 0 }) {
  const entries = Object.entries(graduatesByYear || {}).sort((a, b) => Number(b[0]) - Number(a[0]));

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="report-section report-keep-together">
      <h2 className="report-section-title">4. Graduation Cohort Distribution</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th className="text-left" style={{ width: "45%" }}>Graduation Batch Year</th>
            <th className="text-center" style={{ width: "25%" }}>Recorded Graduates</th>
            <th className="text-center" style={{ width: "30%" }}>% of Department Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([year, count]) => {
            const numCount = Number(count || 0);
            const pct = totalGraduates > 0 ? ((numCount / totalGraduates) * 100).toFixed(1) : "0.0";
            return (
              <tr key={year}>
                <td className="text-left font-medium">Batch {year}</td>
                <td className="text-center">{numCount.toLocaleString()}</td>
                <td className="text-center">{pct}%</td>
              </tr>
            );
          })}
          <tr className="report-total-row">
            <td className="text-left font-bold">Total Recorded Across All Cohorts</td>
            <td className="text-center font-bold">{totalGraduates.toLocaleString()}</td>
            <td className="text-center font-bold">100.0%</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
