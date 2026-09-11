import { useState, useEffect, useCallback, useMemo } from "react";
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
  Check,
  AlertCircle,
} from "lucide-react";
import alumniService from "../../services/alumniService";
import departmentService from "../../services/departmentService";
import api from "../../services/api";
import { resolveStorageUrl } from "../../utils/media";

const EMPLOYMENT_STATUSES = ["employed", "unemployed", "self_employed"];
const VIEW_TABS = [
  { key: "all", label: "All" },
  { key: "department", label: "By Department" },
  { key: "batch", label: "By Batch Year" },
];

const formatBatchYear = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const year = Number(value);
  return Number.isFinite(year) ? `${year}-${year + 1}` : String(value);
};

const STATUS_BADGES = {
  employed: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    icon: Check,
  },
  unemployed: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    icon: AlertCircle,
  },
  self_employed: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    icon: Briefcase,
  },
};

function StatusBadge({ status }) {
  const label = {
    employed: "Employed",
    unemployed: "Unemployed",
    self_employed: "Self-Employed",
  };
  const config = STATUS_BADGES[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    icon: AlertCircle,
  };
  const IconComponent = config.icon;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold border-2 ${config.bg} ${config.text} ${config.border}`}
    >
      <IconComponent className="h-4 w-4" />
      {label[status] ?? status}
    </div>
  );
}

const statusBadge = (status) => <StatusBadge status={status} />;

function Avatar({ src, name, size = "md" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedSrc = resolveStorageUrl(src);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const dim = size === "lg" ? "h-20 w-20 text-lg" : "h-10 w-10 text-sm";
  const shadowClass =
    size === "lg" ? "shadow-lg ring-4 ring-white" : "shadow-sm";
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (resolvedSrc && !imageFailed) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        onError={() => setImageFailed(true)}
        className={`${dim} rounded-full object-cover flex-shrink-0 border-2 border-tpc-greenDeep ${shadowClass}`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-tpc-greenDeep/15 text-tpc-greenDeep font-bold flex items-center justify-center flex-shrink-0 border-2 border-tpc-greenDeep/30 ${shadowClass}`}
    >
      {initials}
    </div>
  );
}

function ProfileModal({ alumni, onClose, jobHistory, jobHistoryLoading }) {
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
    alumni.user?.alumniProfile?.employment_status;
  // Prefer explicit profile fields, but fall back to fetched jobHistory when available
  const profileCurrentJob =
    alumni.current_job ??
    alumni.alumniProfile?.current_job ??
    alumni.user?.alumniProfile?.current_job;

  // derive current job from jobHistory if profile doesn't have it
  const currentJobFromHistory =
    (jobHistory && jobHistory.find && jobHistory.find((j) => j.is_current)) ??
    null;

  const currentJob = jobHistoryLoading
    ? profileCurrentJob
    : (currentJobFromHistory?.position ?? profileCurrentJob);

  let inferredEmploymentStatus = employmentStatus ?? null;

  if (!inferredEmploymentStatus) {
    // if jobHistory is loaded, use it as authoritative for the modal
    if (jobHistory && jobHistoryLoading === false) {
      if (jobHistory.find((j) => j.is_current))
        inferredEmploymentStatus = "employed";
      else if (jobHistory.length > 0)
        inferredEmploymentStatus = "self_employed";
      else inferredEmploymentStatus = "unemployed";
    } else {
      if (profileCurrentJob) inferredEmploymentStatus = "employed";
      else if (alumni.has_job_history || alumni.user?.has_job_history)
        inferredEmploymentStatus = "self_employed";
      else inferredEmploymentStatus = "unemployed";
    }
  }
  const company = jobHistoryLoading
    ? (alumni.company ??
      alumni.alumniProfile?.company ??
      alumni.user?.alumniProfile?.company)
    : (currentJobFromHistory?.company ??
      alumni.company ??
      alumni.alumniProfile?.company ??
      alumni.user?.alumniProfile?.company);
  const workAlignedReason =
    alumni.work_aligned_reason ??
    alumni.alumniProfile?.work_aligned_reason ??
    alumni.user?.alumniProfile?.work_aligned_reason ??
    null;
  const jobFeedback =
    inferredEmploymentStatus === "unemployed"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 bg-tpc-greenDeep px-6 pt-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Alumni Profile
            </p>
            <h2 className="text-white text-2xl font-bold">
              {user.name ?? "—"}
            </h2>
          </div>
        </div>

        <div className="flex items-end gap-4 px-6 mb-6 pt-6">
          <Avatar
            src={user.avatar || alumni.profile_photo_url}
            name={user.name}
            size="lg"
          />
          <div className="pb-2">{statusBadge(inferredEmploymentStatus)}</div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <InfoCard
              icon={<User className="h-4 w-4" />}
              label="Email"
              value={user.email}
            />
            <InfoCard
              icon={<GraduationCap className="h-4 w-4" />}
              label="Student ID"
              value={
                user.schoolId ||
                user.school_id ||
                alumni.student_number ||
                alumni.graduate?.student_number
              }
            />
            <InfoCard
              icon={<Building2 className="h-4 w-4" />}
              label="Department"
              value={alumni.department?.name}
            />
            <InfoCard
              icon={<Phone className="h-4 w-4" />}
              label="Contact"
              value={alumni.contact_number}
            />
            <InfoCard
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={alumni.location}
            />
            <InfoCard
              icon={<GraduationCap className="h-4 w-4" />}
              label="Batch Year"
              value={batchYear}
            />
          </div>

          {/* Current Job Card */}
          {currentJob && (
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

          <div className={`rounded-xl border p-4 ${feedbackStyle}`}>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-widest">
                Job Feedback
              </p>
            </div>
            <p className="text-sm leading-relaxed">
              {jobFeedback || "Feedback not provided by the alumni."}
            </p>
          </div>

          {/* Employment history */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
              Employment History
            </p>
            {jobHistoryLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-tpc-greenDeep" />
                Loading…
              </div>
            ) : jobHistory && jobHistory.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {sortedJobHistory.map((j) => (
                  <div
                    key={j.id}
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
                            {j.position || "—"}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            <span className="font-semibold">Company:</span>{" "}
                            {j.company || "—"}
                          </p>
                          {j.employment_type === "unemployed" && j.industry && (
                            <p className="mt-2 text-xs leading-relaxed text-gray-600">
                              Current status feedback: {j.industry}
                            </p>
                          )}
                        </div>
                      </div>
                      {j.is_current && (
                        <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {j.start_date || "—"}
                      {j.end_date ? ` — ${j.end_date}` : ""}
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
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-gray-700 truncate">
        {value ?? <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-sm font-medium text-gray-800 truncate">
        {value ?? <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  );
}

export default function StudentManagement() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [jobHistoryLoading, setJobHistoryLoading] = useState(false);
  const [jobSummaries, setJobSummaries] = useState({});

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = { page, per_page: 12 };
      const normalizedSearch = search.trim();
      if (normalizedSearch) filters.search = normalizedSearch;
      if (employmentFilter) filters.employment_status = employmentFilter;
      if (departmentFilter) filters.department_id = departmentFilter;
      if (batchFilter) filters.batch_year = batchFilter;

      const result = await alumniService.getAll(filters);
      const list = result.data ?? [];
      setAlumni(list);

      // Fetch job-history summaries for the loaded alumni to keep list badges accurate
      const userIds = list
        .map((a) => a.user?.id ?? a.user_id ?? null)
        .filter(Boolean);

      if (userIds.length) {
        const jobsPromises = userIds.map((id) =>
          api
            .get(`/admin/students/${id}/employment`)
            .then((r) => ({ id, jobs: r.data?.data ?? [] }))
            .catch(() => ({ id, jobs: [] })),
        );

        const settled = await Promise.all(jobsPromises);

        // build lookup map and update alumni entries
        const map = {};
        settled.forEach((s) => {
          map[String(s.id)] = s.jobs;
        });
        setJobSummaries((prev) => ({ ...prev, ...map }));

        setAlumni((prev) =>
          prev.map((a) => {
            const aUserId = a.user?.id ?? a.user_id ?? a.userId;
            const found = settled.find((s) => String(s.id) === String(aUserId));
            if (!found) return a;
            const current = found.jobs.find((j) => j.is_current);
            const derivedStatus =
              a.employment_status ??
              a.alumniProfile?.employment_status ??
              a.user?.alumniProfile?.employment_status ??
              (current
                ? "employed"
                : found.jobs.length > 0
                  ? "self_employed"
                  : "unemployed");
            return {
              ...a,
              has_job_history: found.jobs.length > 0,
              employment_status: derivedStatus,
              current_job: a.current_job ?? (current ? current.position : null),
              company: a.company ?? (current ? current.company : null),
            };
          }),
        );
      }
      setTotalPages(result.meta?.last_page ?? 1);
    } catch {
      setError("Failed to load alumni.");
    } finally {
      setLoading(false);
    }
  }, [page, search, employmentFilter, departmentFilter, batchFilter]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  // Fetch job history for selected alumni when modal opens
  useEffect(() => {
    const fetchJobHistory = async (userId) => {
      if (!userId) return setJobHistory([]);
      setJobHistoryLoading(true);
      try {
        const res = await api.get(`/admin/students/${userId}/employment`);
        setJobHistory(res.data?.data ?? []);
      } catch (e) {
        setJobHistory([]);
      } finally {
        setJobHistoryLoading(false);
      }
    };

    if (selectedAlumni) {
      const userId =
        selectedAlumni.user?.id ??
        selectedAlumni.user_id ??
        selectedAlumni.userId;
      fetchJobHistory(userId);
    } else {
      setJobHistory([]);
    }
  }, [selectedAlumni]);

  // When jobHistory is loaded for a selected user, update the alumni list entry
  useEffect(() => {
    if (!selectedAlumni || jobHistoryLoading) return;

    const userId =
      selectedAlumni.user?.id ??
      selectedAlumni.user_id ??
      selectedAlumni.userId;
    const current = jobHistory.find((j) => j.is_current);

    setAlumni((prev) =>
      prev.map((a) => {
        const aUserId = a.user?.id ?? a.user_id ?? a.userId;
        if (String(aUserId) !== String(userId)) return a;
        const savedStatus =
          a.employment_status ??
          a.alumniProfile?.employment_status ??
          a.user?.alumniProfile?.employment_status;
        return {
          ...a,
          has_job_history: jobHistory.length > 0,
          employment_status:
            savedStatus ??
            (current
              ? "employed"
              : jobHistory.length > 0
                ? "self_employed"
                : "unemployed"),
          current_job: current?.position ?? null,
          company: current?.company ?? null,
        };
      }),
    );
  }, [jobHistory, jobHistoryLoading, selectedAlumni]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentService.getAll();
        const list = Array.isArray(response?.data) ? response.data : [];
        setDepartments(list);
      } catch {
        setDepartments([]);
      }
    };

    loadDepartments();
  }, []);

  const batchOptions = useMemo(() => {
    const values = alumni
      .map(
        (item) =>
          item.batch_year ??
          item.alumniProfile?.batch_year ??
          item.graduate?.batch_year ??
          item.user?.alumniProfile?.batch_year ??
          item.user?.batch_year,
      )
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map(String);

    return [...new Set(values)].sort((a, b) => Number(b) - Number(a));
  }, [alumni]);

  const visibleAlumni = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return alumni.filter((alum) => {
      const user = alum.user ?? {};
      const matchesSearch =
        !normalizedSearch ||
        [
          user.name,
          user.email,
          user.schoolId,
          user.school_id,
          user.student_number,
          alum.student_number,
          alum.school_id,
          alum.graduate?.student_number,
          alum.contact_number,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          );

      const matchesDepartment =
        !departmentFilter ||
        String(alum.department_id) === String(departmentFilter) ||
        String(alum.department?.id) === String(departmentFilter);

      const matchesBatch =
        !batchFilter ||
        String(
          alum.batch_year ??
            alum.alumniProfile?.batch_year ??
            alum.graduate?.batch_year ??
            alum.user?.alumniProfile?.batch_year ??
            alum.user?.batch_year,
        ) === String(batchFilter);

      return matchesSearch && matchesDepartment && matchesBatch;
    });
  }, [alumni, batchFilter, departmentFilter, search]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchAlumni();
    }
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">Alumni</h1>
        <p className="text-gray-500">
          Browse and manage all approved alumni records
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setViewMode(tab.key);
                if (tab.key === "all") {
                  setDepartmentFilter("");
                  setBatchFilter("");
                }
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === tab.key
                  ? "bg-tpc-greenDeep text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) =>
                  handleFilterChange(setDepartmentFilter, e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Employment Status
              </label>
              <select
                value={employmentFilter}
                onChange={(e) =>
                  handleFilterChange(setEmploymentFilter, e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
              >
                <option value="">All Statuses</option>
                {EMPLOYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "self_employed"
                      ? "Self-Employed"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Batch Year
              </label>
              <select
                value={batchFilter}
                onChange={(e) =>
                  handleFilterChange(setBatchFilter, e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
              >
                <option value="">All Batch Years</option>
                {batchOptions.map((year) => (
                  <option key={year} value={year}>
                    {formatBatchYear(year)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, or student number"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={handleSearch}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-tpc-greenDeep" />
          <p className="text-gray-500">Loading alumni...</p>
        </div>
      ) : visibleAlumni.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No alumni found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleAlumni.map((alum) => {
            const user = alum.user ?? {};
            const userId = user.id ?? alum.user_id ?? alum.userId;
            const summary = userId ? jobSummaries[String(userId)] : null;

            // Prefer jobSummaries if available (authoritative for the page)
            const currentJob =
              summary && summary.find((j) => j.is_current)
                ? summary.find((j) => j.is_current).position || null
                : (alum.current_job ??
                  alum.alumniProfile?.current_job ??
                  alum.user?.alumniProfile?.current_job);

            const savedEmploymentStatus =
              alum.employment_status ??
              alum.alumniProfile?.employment_status ??
              alum.user?.alumniProfile?.employment_status;
            const inferredEmploymentStatus =
              savedEmploymentStatus ??
              (summary && summary.length > 0
                ? summary.find((j) => j.is_current)
                  ? "employed"
                  : "self_employed"
                : "unemployed");

            const company =
              alum.company ??
              alum.alumniProfile?.company ??
              alum.user?.alumniProfile?.company;

            const employmentDetailsText =
              inferredEmploymentStatus === "unemployed"
                ? "Unemployed"
                : currentJob || company
                  ? [currentJob, company].filter(Boolean).join(" · ")
                  : "No employment details yet";

            const batchYear = (function () {
              const y =
                alum.batch_year ??
                alum.alumniProfile?.batch_year ??
                alum.graduate?.batch_year ??
                alum.user?.alumniProfile?.batch_year;
              if (!y) return "—";
              const n = Number(y);
              return Number.isFinite(n) ? `${n}-${n + 1}` : String(y);
            })();
            return (
              <div
                key={alum.id}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <Avatar
                  src={user.avatar || alum.profile_photo_url}
                  name={user.name}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold text-gray-800">
                      {user.name ?? "—"}
                    </h3>
                    {(user.schoolId ||
                      user.school_id ||
                      alum.student_number ||
                      alum.graduate?.student_number) && (
                      <span className="flex-shrink-0 text-[11px] font-mono font-medium text-tpc-greenDeep bg-tpc-greenDeep/10 px-2 py-0.5 rounded">
                        ID: {user.schoolId ||
                          user.school_id ||
                          alum.student_number ||
                          alum.graduate?.student_number}
                      </span>
                    )}
                  </div>
                  <p className="mb-1 truncate text-xs text-gray-400">
                    {user.email ?? "—"}
                  </p>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {alum.department?.name && (
                      <span className="inline-block max-w-[140px] truncate rounded-full bg-tpc-greenDeep/10 px-2 py-0.5 text-xs font-medium text-tpc-greenDeep">
                        {alum.department.name}
                      </span>
                    )}
                    {statusBadge(inferredEmploymentStatus)}
                  </div>

                  <div className="space-y-1">
                    <p className="truncate text-xs text-gray-500">
                      {employmentDetailsText}
                    </p>
                    <p className="text-xs text-gray-400">Batch {batchYear}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAlumni(alum)}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-tpc-greenDeep/10 px-3 py-2 text-xs font-medium text-tpc-greenDeep transition hover:bg-tpc-greenDeep/20"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ProfileModal
        alumni={selectedAlumni}
        onClose={() => setSelectedAlumni(null)}
        jobHistory={jobHistory}
        jobHistoryLoading={jobHistoryLoading}
      />
    </div>
  );
}
