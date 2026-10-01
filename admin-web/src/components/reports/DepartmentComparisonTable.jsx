import React from "react";

/**
 * President Department Comparison Table
 * Cross-departmental comparative performance table for institutional monitoring.
 * Supports clean multi-page pagination with repeating table headers.
 */
export default function DepartmentComparisonTable({ rows = [], isLandscape = false }) {
  if (!rows || rows.length === 0) {
    return (
      <section className="report-section">
        <h2 className="report-section-title">4. Academic Department Performance Comparison</h2>
        <p className="report-empty-message">No department breakdown records available.</p>
      </section>
    );
  }

  // Calculate Institutional Totals
  const totals = rows.reduce(
    (acc, r) => {
      const tg = Number(r.total_graduates || 0);
      const reg = Number(r.registered || 0);
      const unreg = Number(r.not_registered || 0);
      const emp = Number(r.employed || 0);
      const self = Number(r.self_employed || 0);
      const unemp = Number(r.unemployed || 0);
      const notSpec = Number(r.not_specified || 0);
      const aligned = Number(r.aligned || 0);
      const notAligned = Number(r.not_aligned || 0);
      const pending = Number(r.no_response || 0);

      acc.total_graduates += tg;
      acc.registered += reg;
      acc.not_registered += unreg;
      acc.employed += emp;
      acc.self_employed += self;
      acc.unemployed += unemp;
      acc.not_specified += notSpec;
      acc.aligned += aligned;
      acc.not_aligned += notAligned;
      acc.pending += pending;
      return acc;
    },
    {
      total_graduates: 0,
      registered: 0,
      not_registered: 0,
      employed: 0,
      self_employed: 0,
      unemployed: 0,
      not_specified: 0,
      aligned: 0,
      not_aligned: 0,
      pending: 0,
    }
  );

  const totalDeclared = totals.employed + totals.self_employed + totals.unemployed;
  const totalWorking = totals.employed + totals.self_employed;
  const overallEmpRate = totalDeclared > 0 ? ((totalWorking / totalDeclared) * 100).toFixed(1) : "0.0";
  const totalAlignmentDeclared = totals.aligned + totals.not_aligned;
  const overallAlignRate =
    totalAlignmentDeclared > 0 ? ((totals.aligned / totalAlignmentDeclared) * 100).toFixed(1) : "0.0";
  const overallCoverage =
    totals.total_graduates > 0 ? ((totals.registered / totals.total_graduates) * 100).toFixed(1) : "0.0";

  return (
    <section className="report-section">
      <div className="flex items-center justify-between">
        <h2 className="report-section-title">4. Departmental Comparative Performance</h2>
        <span className="text-[9pt] font-semibold text-slate-500">
          {rows.length} Academic Program{rows.length !== 1 ? "s" : ""} Monitored
        </span>
      </div>

      <table className="report-table report-comparison-table">
        <thead>
          <tr>
            <th className="text-left" style={{ width: isLandscape ? "24%" : "28%" }}>Department / Academic Program</th>
            <th className="text-center">Grads</th>
            <th className="text-center">Reg.</th>
            <th className="text-center">Unreg.</th>
            <th className="text-center">Coverage</th>
            <th className="text-center">Employed</th>
            {isLandscape && <th className="text-center">Self-Emp</th>}
            <th className="text-center">Unemp.</th>
            {isLandscape && <th className="text-center">Not Spec</th>}
            <th className="text-center">Emp. Rate</th>
            <th className="text-center">Aligned</th>
            <th className="text-center">Not Aligned</th>
            {isLandscape && <th className="text-center">Pending</th>}
            <th className="text-center">Align. Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const deptName = row.department?.name || `Department ${row.department_id}`;
            const tg = Number(row.total_graduates || 0);
            const reg = Number(row.registered || 0);
            const unreg = Number(row.not_registered || 0);
            const cov = row.registration_coverage !== undefined ? `${Number(row.registration_coverage).toFixed(1)}%` : tg > 0 ? `${((reg / tg) * 100).toFixed(1)}%` : "0.0%";
            const emp = Number(row.employed || 0);
            const self = Number(row.self_employed || 0);
            const unemp = Number(row.unemployed || 0);
            const notSpec = Number(row.not_specified || 0);
            const empRate = row.employment_rate !== undefined ? `${Number(row.employment_rate).toFixed(1)}%` : "0.0%";
            const aligned = Number(row.aligned || 0);
            const notAligned = Number(row.not_aligned || 0);
            const pending = Number(row.no_response || 0);
            const alignRate = row.alignment_rate !== undefined ? `${Number(row.alignment_rate).toFixed(1)}%` : "0.0%";

            return (
              <tr key={row.department_id || deptName}>
                <td className="text-left font-medium">{deptName}</td>
                <td className="text-center">{tg.toLocaleString()}</td>
                <td className="text-center">{reg.toLocaleString()}</td>
                <td className="text-center text-slate-500">{unreg.toLocaleString()}</td>
                <td className="text-center font-medium">{cov}</td>
                <td className="text-center">{emp.toLocaleString()}</td>
                {isLandscape && <td className="text-center">{self.toLocaleString()}</td>}
                <td className="text-center">{unemp.toLocaleString()}</td>
                {isLandscape && <td className="text-center text-slate-500">{notSpec.toLocaleString()}</td>}
                <td className="text-center font-bold text-[#02451C]">{empRate}</td>
                <td className="text-center">{aligned.toLocaleString()}</td>
                <td className="text-center text-rose-700">{notAligned.toLocaleString()}</td>
                {isLandscape && <td className="text-center text-slate-500">{pending.toLocaleString()}</td>}
                <td className="text-center font-bold text-[#02451C]">{alignRate}</td>
              </tr>
            );
          })}
          <tr className="report-total-row">
            <td className="text-left font-bold">Institutional Total / Overall Average</td>
            <td className="text-center font-bold">{totals.total_graduates.toLocaleString()}</td>
            <td className="text-center font-bold">{totals.registered.toLocaleString()}</td>
            <td className="text-center font-bold">{totals.not_registered.toLocaleString()}</td>
            <td className="text-center font-bold">{overallCoverage}%</td>
            <td className="text-center font-bold">{totals.employed.toLocaleString()}</td>
            {isLandscape && <td className="text-center font-bold">{totals.self_employed.toLocaleString()}</td>}
            <td className="text-center font-bold">{totals.unemployed.toLocaleString()}</td>
            {isLandscape && <td className="text-center font-bold">{totals.not_specified.toLocaleString()}</td>}
            <td className="text-center font-bold text-[#02451C]">{overallEmpRate}%</td>
            <td className="text-center font-bold">{totals.aligned.toLocaleString()}</td>
            <td className="text-center font-bold">{totals.not_aligned.toLocaleString()}</td>
            {isLandscape && <td className="text-center font-bold">{totals.pending.toLocaleString()}</td>}
            <td className="text-center font-bold text-[#02451C]">{overallAlignRate}%</td>
          </tr>
        </tbody>
      </table>
      <div className="report-note-text">
        * Multi-department comparative metrics reflect institutional database snapshots within the selected graduation scope.
      </div>
    </section>
  );
}
