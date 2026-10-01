import React from "react";

/**
 * Employment Status Distribution Table
 * Authoritative tabular breakdown of alumni employment declared against the registered alumni population.
 */
export default function EmploymentStatusTable({
  employed = 0,
  selfEmployed = 0,
  unemployed = 0,
  notSpecified = 0,
  registeredAlumni = 0,
}) {
  const calcPct = (val) => {
    if (!registeredAlumni || registeredAlumni <= 0) return "0.0%";
    const pct = (val / registeredAlumni) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const rows = [
    { label: "Employed (Full-time / Part-time)", count: employed, pct: calcPct(employed), isHighlight: false },
    { label: "Self-Employed (Freelance / Business)", count: selfEmployed, pct: calcPct(selfEmployed), isHighlight: false },
    { label: "Unemployed (Actively Seeking / In Transition)", count: unemployed, pct: calcPct(unemployed), isHighlight: false },
    { label: "Not Specified (Unreported Employment Status)", count: notSpecified, pct: calcPct(notSpecified), isHighlight: false },
  ];

  return (
    <section className="report-section report-keep-together">
      <h2 className="report-section-title">2. Employment Status Distribution</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th className="text-left" style={{ width: "55%" }}>Employment Status Classification</th>
            <th className="text-center" style={{ width: "20%" }}>Headcount</th>
            <th className="text-center" style={{ width: "25%" }}>% of Registered Alumni</th>
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
            <td className="text-left font-bold">Total Registered Alumni</td>
            <td className="text-center font-bold">{registeredAlumni.toLocaleString()}</td>
            <td className="text-center font-bold">100.0%</td>
          </tr>
        </tbody>
      </table>
      <div className="report-note-text">
        * Percentages are calculated relative to the total registered alumni cohort ({registeredAlumni.toLocaleString()} alumni).
      </div>
    </section>
  );
}
