import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Eye,
  X,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Building2,
  User,
  Mail,
  Badge,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  AlertCircle,
} from "lucide-react";
import alumniService from "../../services/alumniService";
import api from "../../services/api";
import { toast } from "react-toastify";

const EMPLOYMENT_STATUSES = ["employed", "unemployed", "self_employed"];

const formatBatchYear = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const year = Number(value);
  return Number.isFinite(year) ? `${year}–${year + 1}` : String(value);
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_PALETTES = [
  "bg-tpc-greenDeep/10 text-tpc-greenDeep",
  "bg-blue-100 text-blue-800",
  "bg-amber-100 text-amber-800",
  "bg-purple-100 text-purple-800",
  "bg-rose-100 text-rose-800",
];

function avatarPalette(name = "") {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTES[code % AVATAR_PALETTES.length];
}

function Avatar({ src, name = "", size = "md" }) {
  const initials = getInitials(name);
  const palette = avatarPalette(name);
  const sizeClass = size === "lg" ? "h-20 w-20 text-lg" : "h-8 w-8 text-xs";
  const shadowClass =
    size === "lg" ? "shadow-lg ring-4 ring-white" : "shadow-sm";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`flex-shrink-0 rounded-full object-cover border-2 border-tpc-greenDeep ${sizeClass} ${shadowClass}`}
      />
    );
  }

  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center rounded-full font-bold ${sizeClass} ${palette} ${shadowClass} border-2 border-opacity-20`}
    >
      {initials || <User className="h-5 w-5" />}
    </div>
  );
}

const BADGE_MAP = {
  employed: {
    dot: "bg-green-500",
    text: "text-green-800",
    bg: "bg-green-100",
    icon: Check,
    label: "Employed",
    borderColor: "border-green-300",
  },
  unemployed: {
    dot: "bg-red-500",
    text: "text-red-800",
    bg: "bg-red-100",
    icon: AlertCircle,
    label: "Unemployed",
    borderColor: "border-red-300",
  },
  self_employed: {
    dot: "bg-blue-500",
    text: "text-blue-800",
    bg: "bg-blue-100",
    icon: Briefcase,
    label: "Self-employed",
    borderColor: "border-blue-300",
  },
};

// Badge config for the job–course alignment pill (mirrors StudentProfile.jsx)
const ALIGNMENT_BADGE = {
  true: {
    label: "Aligned",
    icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  false: {
    label: "Not Aligned",
    icon: XCircle,
    cls: "bg-red-50 text-red-600 border-red-200",
  },
  null: {
    label: "Not Answered",
    icon: HelpCircle,
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

function StatusBadge({ status }) {
  const s = BADGE_MAP[status] ?? {
    dot: "bg-gray-400",
    text: "text-gray-700",
    bg: "bg-gray-100",
    icon: AlertCircle,
    borderColor: "border-gray-300",
    label: status ?? "Unknown",
  };
  const IconComponent = s.icon;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold border-2 ${s.bg} ${s.text} ${s.borderColor}`}
    >
      <IconComponent className="h-4 w-4" />
      {s.label}
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  const displayValue =
    children === null || children === undefined || children === ""
      ? "Data missing"
      : children;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </span>
      </div>
      <div className="text-sm font-medium text-gray-700">{displayValue}</div>
    </div>
  );
}

function ProfileModal({ alumni, onClose, jobHistory, loading }) {
  if (!alumni) return null;

  const user = alumni.user ?? {};
  const batchYear = formatBatchYear(
    alumni.batch_year ??
      alumni.alumniProfile?.batch_year ??
      alumni.graduate?.batch_year ??
      alumni.user?.alumniProfile?.batch_year,
  );
  const employmentStatus =
    alumni.employment_status ??
    alumni.alumniProfile?.employment_status ??
    "unemployed";
  const currentJob = loading
    ? (alumni.current_job ?? alumni.alumniProfile?.current_job ?? "—")
    : (jobHistory?.find((j) => j.is_current)?.position ??
      alumni.current_job ??
      alumni.alumniProfile?.current_job ??
      "—");
  const company = loading
    ? (alumni.company ?? alumni.alumniProfile?.company ?? null)
    : (jobHistory?.find((j) => j.is_current)?.company ??
      alumni.company ??
      alumni.alumniProfile?.company ??
      null);
  const departmentName = alumni.department?.name ?? "Data missing";
  const emailAddress = user.email ?? "Data missing";
  const studentId = user.schoolId ?? user.school_id ?? "Data missing";
  const contactNumber =
    alumni.contact_number ??
    alumni.alumniProfile?.contact_number ??
    "Data missing";
  const locationValue =
    alumni.location ?? alumni.alumniProfile?.location ?? "Data missing";

  // ── Work alignment ────────────────────────────────────────────────────
  const isWorkAligned =
    alumni.is_work_aligned ?? alumni.alumniProfile?.is_work_aligned ?? null;
  const isEmployed =
    employmentStatus === "employed" || employmentStatus === "self_employed";
  const alignmentKey = String(isWorkAligned ?? null);
  const alignmentBadge =
    ALIGNMENT_BADGE[alignmentKey] ?? ALIGNMENT_BADGE["null"];
  const AlignIcon = alignmentBadge.icon;
  const workAlignedReason =
    alumni.work_aligned_reason ??
    alumni.alumniProfile?.work_aligned_reason ??
    alumni.user?.alumniProfile?.work_aligned_reason ??
    null;
  const jobFeedback =
    employmentStatus === "unemployed"
      ? (jobHistory?.find((job) => job.employment_type === "unemployed")
          ?.industry ?? null)
      : workAlignedReason;
  const sortedJobHistory = [...(jobHistory ?? [])].sort((first, second) => {
    if (first.is_current !== second.is_current) {
      return Number(second.is_current) - Number(first.is_current);
    }

    const firstDate = new Date(first.start_date || first.created_at).getTime();
    const secondDate = new Date(
      second.start_date || second.created_at,
    ).getTime();

    return secondDate - firstDate;
  });
  const feedbackStyle = "border-tpc-gold/20 bg-tpc-gold/5 text-gray-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header with green background */}
        <div className="sticky top-0 z-10 relative bg-tpc-greenDeep px-6 pt-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Alumni Profile
            </p>
            <h2 className="text-white text-2xl font-bold">
              {user.name || "—"}
            </h2>
          </div>
        </div>

        {/* Avatar below header */}
        <div className="flex items-end gap-4 px-6 mb-6 pt-6">
          <Avatar
            src={user.avatar || alumni.profile_photo_url}
            name={user.name}
            size="lg"
          />
          <div className="pb-2">
            <StatusBadge status={employmentStatus} />
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              {
                icon: <Mail className="h-4 w-4" />,
                label: "Email",
                value: emailAddress,
              },
              {
                icon: <GraduationCap className="h-4 w-4" />,
                label: "Student ID",
                value: studentId,
              },
              {
                icon: <Building2 className="h-4 w-4" />,
                label: "Department",
                value: departmentName,
              },
              {
                icon: <Phone className="h-4 w-4" />,
                label: "Contact",
                value: contactNumber,
              },
              {
                icon: <MapPin className="h-4 w-4" />,
                label: "Location",
                value: locationValue,
              },
              {
                icon: <Badge className="h-4 w-4" />,
                label: "Batch Year",
                value: batchYear || "Data missing",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  {item.icon}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {item.label}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 truncate">
                  {item.value === null ||
                  item.value === undefined ||
                  item.value === ""
                    ? "Data missing"
                    : item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Current Job Card */}
          {currentJob && currentJob !== "—" && (
            <div className="rounded-xl border border-tpc-gold/20 bg-tpc-gold/5 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="h-4 w-4 text-tpc-goldDeep" />
                <p className="text-xs font-semibold uppercase tracking-widest text-tpc-goldDeep">
                  Current Job
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    Position
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {currentJob}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    Company
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {company || "Data missing"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Employment history */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
              Employment History
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-tpc-greenDeep" />
                Loading…
              </div>
            ) : jobHistory && jobHistory.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {sortedJobHistory.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-tpc-greenDeep/10">
                          <Briefcase className="h-4 w-4 text-tpc-greenDeep" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">Position:</span>{" "}
                            {job.position || "—"}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            <span className="font-semibold">Company:</span>{" "}
                            {job.company || "—"}
                          </p>
                          {job.employment_type === "unemployed" &&
                            job.industry && (
                              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                                Current status feedback: {job.industry}
                              </p>
                            )}
                        </div>
                      </div>
                      {job.is_current && (
                        <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {job.start_date || "—"}
                      {job.end_date ? ` — ${job.end_date}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                No job history available
              </p>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${feedbackStyle}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Job Feedback
                </p>
              </div>
              {isEmployed && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${alignmentBadge.cls}`}
                >
                  <AlignIcon className="h-3 w-3" />
                  {alignmentBadge.label}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">
              {jobFeedback || "Feedback not provided by the alumni."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlumniList() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobSummaries, setJobSummaries] = useState({});
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [jobHistoryLoading, setJobHistoryLoading] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, per_page: 12 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (employmentFilter) params.employment_status = employmentFilter;

      const result = await alumniService.getAll(params);
      const list = result.data ?? [];
      setAlumni(list);
      setTotalPages(result.meta?.last_page ?? 1);

      const userIds = [
        ...new Set(
          list
            .map((item) => item.user?.id ?? item.user_id ?? item.userId)
            .filter(Boolean),
        ),
      ];

      if (userIds.length) {
        const settled = await Promise.all(
          userIds.map((id) =>
            api
              .get(`/admin/students/${id}/employment`)
              .then((res) => ({ id, jobs: res.data?.data ?? [] }))
              .catch(() => ({ id, jobs: [] })),
          ),
        );

        const map = {};
        settled.forEach(({ id, jobs }) => {
          map[String(id)] = jobs;
        });
        setJobSummaries((prev) => ({ ...prev, ...map }));

        // ✅ FIX: Only use job history to populate display fields (current_job, company).
        // Do NOT re-derive or override employment_status — trust what the backend returned.
        // Overriding it here was causing the filter to break (e.g. filtering by "unemployed"
        // would still show employed users because job history re-classified them client-side).
        setAlumni((prev) =>
          prev.map((item) => {
            const userId = item.user?.id ?? item.user_id ?? item.userId;
            const jobs = map[String(userId)] ?? [];
            const currentJob = jobs.find((j) => j.is_current);

            return {
              ...item,
              current_job:
                item.current_job ??
                currentJob?.position ??
                item.alumniProfile?.current_job,
              company:
                item.company ??
                currentJob?.company ??
                item.alumniProfile?.company,
              // employment_status intentionally left as-is from the API response
            };
          }),
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to load alumni");
      setError("Failed to load alumni.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [page, searchQuery, employmentFilter]);

  useEffect(() => {
    if (!selectedAlumni) {
      setJobHistory([]);
      return;
    }
    const userId =
      selectedAlumni.user?.id ??
      selectedAlumni.user_id ??
      selectedAlumni.userId;
    if (!userId) return;

    setJobHistoryLoading(true);
    api
      .get(`/admin/students/${userId}/employment`)
      .then((res) => setJobHistory(res.data?.data ?? []))
      .catch(() => setJobHistory([]))
      .finally(() => setJobHistoryLoading(false));
  }, [selectedAlumni]);

  const batchOptions = useMemo(
    () =>
      [
        ...new Set(
          alumni
            .map(
              (item) =>
                item.batch_year ??
                item.alumniProfile?.batch_year ??
                item.graduate?.batch_year ??
                item.user?.alumniProfile?.batch_year,
            )
            .filter((v) => v !== null && v !== undefined && v !== "")
            .map(String),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [alumni],
  );

  const visibleAlumni = useMemo(
    () =>
      alumni.filter((item) => {
        if (!batchFilter) return true;
        const value =
          item.batch_year ??
          item.alumniProfile?.batch_year ??
          item.graduate?.batch_year ??
          item.user?.alumniProfile?.batch_year;
        return String(value) === String(batchFilter);
      }),
    [alumni, batchFilter],
  );

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      setSearchQuery(search);
    }
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-5 p-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Alumni</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse approved alumni for your department.
        </p>
      </div>

      {/* Toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Name, email, or student number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-800 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
          />
        </div>

        {/* Employment filter */}
        <div>
          <select
            value={employmentFilter}
            onChange={(e) =>
              handleFilterChange(setEmploymentFilter, e.target.value)
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
          >
            <option value="">All statuses</option>
            {EMPLOYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BADGE_MAP[s]?.label ?? s}
              </option>
            ))}
          </select>
        </div>

        {/* Batch filter */}
        <div>
          <select
            value={batchFilter}
            onChange={(e) => handleFilterChange(setBatchFilter, e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
          >
            <option value="">All batch years</option>
            {batchOptions.map((year) => (
              <option key={year} value={year}>
                {formatBatchYear(year)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count strip */}
      <p className="text-xs text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-700">
          {visibleAlumni.length}
        </span>{" "}
        alumni
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-56">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-tpc-greenDeep" />
        </div>
      ) : visibleAlumni.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 w-64">
                  Alumni
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 w-28">
                  Batch
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 w-36">
                  Employment
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Current position
                </th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {visibleAlumni.map((item, i) => {
                const user = item.user ?? {};
                const batchYear = formatBatchYear(
                  item.batch_year ??
                    item.alumniProfile?.batch_year ??
                    item.graduate?.batch_year ??
                    item.user?.alumniProfile?.batch_year,
                );
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 transition hover:bg-gray-50 ${i === visibleAlumni.length - 1 ? "border-b-0" : ""}`}
                  >
                    {/* Name + email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar || item.profile_photo_url}
                          name={user.name}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {user.name || "—"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-700">{batchYear}</p>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.employment_status} />
                    </td>

                    {/* Current position */}
                    <td className="px-5 py-3.5">
                      {item.current_job || item.alumniProfile?.current_job ? (
                        <>
                          <p className="text-sm text-gray-800">
                            {item.current_job ??
                              item.alumniProfile?.current_job}
                          </p>
                          {(item.company ?? item.alumniProfile?.company) && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.company ?? item.alumniProfile?.company}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedAlumni(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-tpc-greenDeep/30 bg-transparent px-3 py-1.5 text-xs font-medium text-tpc-greenDeep transition hover:bg-tpc-greenDeep/8"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 py-16 text-center">
          <p className="text-sm text-gray-400">No alumni found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ProfileModal
        alumni={selectedAlumni}
        onClose={() => setSelectedAlumni(null)}
        jobHistory={jobHistory}
        loading={jobHistoryLoading}
      />
    </div>
  );
}
