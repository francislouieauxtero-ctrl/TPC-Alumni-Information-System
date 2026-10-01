import React from "react";

/**
 * Executive Summary Table
 * Clean, compact, authoritative representation of institutional/department KPIs.
 * Uses exact approved Analytics formulas.
 */
export default function ExecutiveSummaryTable({ overview }) {
  const {
    totalGraduates = 0,
    regAlumni = 0,
    unregGraduates = 0,
    regCoveragePct = "0.0",
    employed = 0,
    selfEmployed = 0,
    unemployed = 0,
    notSpecified = 0,
    employmentRatePct = "0.0",
    alignmentRatePct = "0.0",
  } = overview;

  return (
    <section className="report-section report-keep-together">
      <h2 className="report-section-title">1. Executive Summary</h2>

      {/* Registration & Cohort Metrics */}
      <table className="report-table report-kpi-table">
        <thead>
          <tr>
            <th className="text-center">Total Graduates</th>
            <th className="text-center">Registered Alumni</th>
            <th className="text-center">Unregistered Graduates</th>
            <th className="text-center">Registration Coverage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center font-bold text-base">{totalGraduates.toLocaleString()}</td>
            <td className="text-center font-bold text-base text-[#02451C]">{regAlumni.toLocaleString()}</td>
            <td className="text-center font-bold text-base text-slate-600">{unregGraduates.toLocaleString()}</td>
            <td className="text-center font-bold text-base text-[#02451C]">{regCoveragePct}%</td>
          </tr>
        </tbody>
      </table>

      {/* Employment Outcomes & Curricular Alignment Metrics */}
      <table className="report-table report-kpi-table mt-2">
        <thead>
          <tr>
            <th className="text-center">Employed</th>
            <th className="text-center">Self-Employed</th>
            <th className="text-center">Unemployed</th>
            <th className="text-center">Not Specified</th>
            <th className="text-center">Employment Rate</th>
            <th className="text-center">Alignment Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center font-bold">{employed.toLocaleString()}</td>
            <td className="text-center font-bold">{selfEmployed.toLocaleString()}</td>
            <td className="text-center font-bold text-rose-700">{unemployed.toLocaleString()}</td>
            <td className="text-center font-bold text-slate-500">{notSpecified.toLocaleString()}</td>
            <td className="text-center font-bold text-base text-[#02451C]">{employmentRatePct}%</td>
            <td className="text-center font-bold text-base text-[#02451C]">{alignmentRatePct}%</td>
          </tr>
        </tbody>
      </table>
      <div className="report-note-text">
        * Employment Rate = (Employed + Self-Employed) / (Employed + Self-Employed + Unemployed) × 100 | Alignment Rate = Aligned / (Aligned + Not Aligned) × 100.
      </div>
    </section>
  );
}
