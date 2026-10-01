import React from "react";

/**
 * Detailed Alumni Roster Table
 * Explicit report type displaying granular alumni records under the selected scope.
 * Supports multi-page print continuation with repeating table headers.
 */
export default function DetailedAlumniTable({ alumniList = [], loading = false }) {
  if (loading) {
    return (
      <section className="report-section">
        <h2 className="report-section-title">Detailed Alumni Roster</h2>
        <div className="py-8 text-center text-sm text-slate-500 font-medium">
          Loading detailed alumni roster records...
        </div>
      </section>
    );
  }

  if (!alumniList || alumniList.length === 0) {
    return (
      <section className="report-section">
        <h2 className="report-section-title">Detailed Alumni Roster</h2>
        <div className="py-8 text-center text-sm text-slate-400">
          No detailed alumni records found under the current department and cohort filters.
        </div>
      </section>
    );
  }

  const formatEmployment = (status) => {
    switch (status) {
      case "employed":
        return "Employed";
      case "self_employed":
        return "Self-Employed";
      case "unemployed":
        return "Unemployed";
      default:
        return "Not Specified";
    }
  };

  const formatAlignment = (aligned, status) => {
    if (status === "unemployed" || status === "not_specified") {
      return "N/A";
    }
    if (aligned === true || aligned === 1 || aligned === "1") {
      return "Aligned";
    }
    if (aligned === false || aligned === 0 || aligned === "0") {
      return "Not Aligned";
    }
    return "Pending";
  };

  return (
    <section className="report-section">
      <div className="flex items-center justify-between mb-2">
        <h2 className="report-section-title">Detailed Alumni Roster</h2>
        <span className="text-[9pt] font-semibold text-slate-500">
          Total Records Listed: {alumniList.length.toLocaleString()}
        </span>
      </div>

      <table className="report-table report-detailed-table">
        <thead>
          <tr>
            <th className="text-center" style={{ width: "4%" }}>#</th>
            <th className="text-left" style={{ width: "12%" }}>Student ID</th>
            <th className="text-left" style={{ width: "20%" }}>Graduate Name</th>
            <th className="text-left" style={{ width: "22%" }}>Program / Department</th>
            <th className="text-center" style={{ width: "8%" }}>Batch</th>
            <th className="text-center" style={{ width: "12%" }}>Employment</th>
            <th className="text-left" style={{ width: "12%" }}>Current Work</th>
            <th className="text-center" style={{ width: "10%" }}>Alignment</th>
          </tr>
        </thead>
        <tbody>
          {alumniList.map((alumnus, idx) => {
            const studentId =
              alumnus.student_number ||
              alumnus.school_id ||
              alumnus.user?.school_id ||
              alumnus.graduate?.student_number ||
              "N/A";
            const name =
              alumnus.user?.name ||
              alumnus.name ||
              [alumnus.first_name, alumnus.last_name].filter(Boolean).join(" ") ||
              "Unnamed Alumni";
            const program =
              alumnus.department?.name ||
              alumnus.graduate?.course ||
              "Department Not Specified";
            const batch = alumnus.batch_year || alumnus.graduate?.batch_year || "—";
            const status = alumnus.employment_status || "not_specified";
            const work =
              alumnus.current_job ||
              alumnus.company ||
              (status === "unemployed" ? "None" : "—");
            const alignment = formatAlignment(alumnus.is_work_aligned, status);

            return (
              <tr key={alumnus.id || `${studentId}-${idx}`}>
                <td className="text-center text-slate-400">{idx + 1}</td>
                <td className="text-left font-mono font-medium">{studentId}</td>
                <td className="text-left font-medium">{name}</td>
                <td className="text-left">{program}</td>
                <td className="text-center">{batch}</td>
                <td className="text-center">
                  <span
                    className={
                      status === "employed" || status === "self_employed"
                        ? "text-[#02451C] font-medium"
                        : status === "unemployed"
                        ? "text-rose-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    {formatEmployment(status)}
                  </span>
                </td>
                <td className="text-left truncate max-w-[130px]" title={work}>
                  {work}
                </td>
                <td className="text-center">
                  <span
                    className={
                      alignment === "Aligned"
                        ? "text-[#02451C] font-bold"
                        : alignment === "Not Aligned"
                        ? "text-rose-700 font-bold"
                        : alignment === "Pending"
                        ? "text-amber-700 font-medium"
                        : "text-slate-400"
                    }
                  >
                    {alignment}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
