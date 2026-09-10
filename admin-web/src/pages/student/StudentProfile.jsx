import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import alumniService from "../../services/alumniService";
import EditProfileForm from "./EditProfileForm";
import {
  Camera,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  AlertCircle,
  X,
  Loader2,
  Activity,
  Building2,
  Info,
  Upload,
  Trash2,
  GraduationCap,
  BriefcaseIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-gray-100 text-gray-600 ring-gray-500/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  suspended: "bg-red-50 text-red-700 ring-red-600/20",
};

// Badge config for the alignment status pill
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

const MAX_AVATAR_BYTES = 10 * 1024 * 1024; // 10MB — matches Laravel's max:10240

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function StudentProfile() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const busy = uploading || removing;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/student/profile");
        const ok = response.data.status ?? response.data.success;
        if (ok) {
          const data = response.data.data;
          setProfile(data);
          localStorage.setItem("userAvatar", data.avatar || "");
        } else {
          setLoadError("We couldn't load your profile.");
        }
      } catch (err) {
        console.error(err);
        setLoadError("We couldn't load your profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/"))
      return "Please choose an image file (JPG, PNG, GIF, or WebP).";
    if (file.size > MAX_AVATAR_BYTES) return "Images must be 10 MB or smaller.";
    return "";
  };

  const uploadAvatar = async (file) => {
    const err = validateFile(file);
    if (err) {
      setActionError(err);
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      setUploading(true);
      setActionError("");
      setProgress(0);
      const response = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total)
            setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      if (response.data.status) {
        const updatedUser = response.data.data;
        setProfile((prev) => ({ ...prev, ...updatedUser }));
        localStorage.setItem("userAvatar", updatedUser.avatar || "");
      } else {
        setActionError(response.data.message || "Failed to upload photo.");
      }
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (file) uploadAvatar(file);
    event.target.value = "";
  };

  const handleRemoveAvatar = async () => {
    try {
      setRemoving(true);
      setActionError("");
      const response = await api.delete("/profile/avatar");
      if (response.data.status) {
        const updatedUser = response.data.data;
        setProfile((prev) => ({ ...prev, ...updatedUser }));
        localStorage.setItem("userAvatar", "");
      } else {
        setActionError(response.data.message || "Failed to remove photo.");
      }
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to remove photo.");
    } finally {
      setRemoving(false);
    }
  };

  const openModal = () => {
    setForm({
      name: profile?.name || "",
      email: profile?.email || "",
      avatar: null,
      contact_number: profile?.alumniProfile?.contact_number || "",
      location: profile?.alumniProfile?.location || "",
      batch_year: profile?.alumniProfile?.batch_year || "",
      employment_status: profile?.alumniProfile?.employment_status || "",
      // Pre-fill alignment from existing profile data
      is_work_aligned: profile?.alumniProfile?.is_work_aligned ?? null,
      work_aligned_reason: profile?.alumniProfile?.work_aligned_reason || "",
    });
    setPreviewUrl(profile?.avatar || "");
    setModalError("");
    setValidationErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPreviewUrl("");
  };

  const handleModalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((p) => ({ ...p, avatar: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError("");
    setValidationErrors({});

    try {
      // ── 1. Save main profile ───────────────────────────────────────────
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("contact_number", form.contact_number);
      formData.append("location", form.location);
      // batch_year is set automatically from the graduate record and is
      // no longer editable/accepted by the backend — do not send it.
      if (form.avatar instanceof File) formData.append("avatar", form.avatar);

      const response = await api.post("/student/profile", formData);
      const ok = response.data.status ?? response.data.success;

      if (!ok) {
        setModalError(response.data.message || "Failed to update profile.");
        return;
      }

      const data = response.data.data;

      // ── 2. Save alignment separately if employed and answered ──────────
      const isEmployed =
        form.employment_status === "employed" ||
        form.employment_status === "self_employed";

      if (
        isEmployed &&
        form.is_work_aligned !== null &&
        form.is_work_aligned !== undefined
      ) {
        try {
          await alumniService.updateAlignment(
            form.is_work_aligned,
            form.work_aligned_reason || null,
          );
        } catch (alignErr) {
          // Alignment errors are non-blocking — profile already saved
          // Surface as a soft warning rather than a hard failure
          const errMsg =
            alignErr?.message ||
            alignErr?.errors?.is_work_aligned?.[0] ||
            "Profile saved but alignment could not be updated.";
          setModalError(errMsg);
        }
      }

      // ── 3. Merge updated data back into profile state ──────────────────
      setProfile((prev) => ({
        ...prev,
        ...data,
        alumniProfile: {
          ...prev?.alumniProfile,
          ...data?.alumniProfile,
          // Reflect alignment answer locally even if API returned stale data
          is_work_aligned: form.is_work_aligned,
          work_aligned_reason: form.work_aligned_reason || null,
        },
      }));

      localStorage.setItem("userAvatar", data.avatar || "");
      closeModal();
    } catch (err) {
      const res = err.response;
      if (res?.data?.errors) {
        setValidationErrors(res.data.errors);
        setModalError(res.data.message || "Please fix the errors below.");
      } else {
        setModalError(res?.data?.message || "Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-tpc-greenDeep" />
          <p className="text-sm text-gray-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-1.5 text-xs font-semibold underline underline-offset-2 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusKey = profile?.status?.toLowerCase() || "";
  const statusClasses = STATUS_STYLES[statusKey] || STATUS_STYLES.inactive;

  // ── Alignment badge ──────────────────────────────────────────────────────
  const alignmentKey = String(profile?.alumniProfile?.is_work_aligned ?? null);
  const alignmentBadge =
    ALIGNMENT_BADGE[alignmentKey] ?? ALIGNMENT_BADGE["null"];
  const AlignIcon = alignmentBadge.icon;
  const isEmployed =
    profile?.alumniProfile?.employment_status === "employed" ||
    profile?.alumniProfile?.employment_status === "self_employed";

  const details = [
    { icon: User, label: "School ID", value: profile?.schoolId },
    { icon: Mail, label: "Email", value: profile?.email },
    { icon: Building2, label: "Department", value: profile?.department?.name },
    {
      icon: Phone,
      label: "Contact",
      value: profile?.alumniProfile?.contact_number,
    },
    {
      icon: MapPin,
      label: "Current Address",
      value: profile?.alumniProfile?.location,
    },
    {
      icon: GraduationCap,
      label: "Batch Year",
      value: (() => {
        const y = profile?.alumniProfile?.batch_year;
        if (!y) return null;
        const n = Number(y);
        return Number.isFinite(n) ? `${n}-${n + 1}` : String(y);
      })(),
    },
    { icon: Activity, label: "Status", value: profile?.status },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 pb-10 pt-6 sm:px-6 md:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Page header */}
          <div className="mb-5 sm:mb-6">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-tpc-greenDeep">
              Account
            </p>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Your profile
              </h1>
              <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:border-tpc-greenDeep hover:text-tpc-greenDeep active:scale-95 sm:px-4 sm:text-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
          </div>

          {/* Action error banner */}
          {actionError && (
            <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs">{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError("")}
                className="rounded-full p-1 hover:bg-red-100"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ── Identity card ─────────────────────────────────────────────── */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-16 bg-gradient-to-r from-tpc-greenDeep to-tpc-green sm:h-20" />

            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
              <div className="mb-3 flex items-end justify-between">
                {/* Avatar */}
                <div className="group relative -mt-10 h-[72px] w-[72px] overflow-hidden rounded-2xl border-4 border-white shadow-md sm:-mt-12 sm:h-24 sm:w-24">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-tpc-greenDeep/10 text-xl font-semibold text-tpc-greenDeep sm:text-2xl">
                      {getInitials(profile?.name)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                    aria-label="Change photo"
                    className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100 active:bg-black/35 active:opacity-100 disabled:cursor-not-allowed"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  {uploading && progress > 0 && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                      <div
                        className="h-full bg-tpc-greenDeep transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1.5 pb-1">
                  {profile?.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${statusClasses}`}
                  >
                    <Activity className="h-3 w-3" />
                    {profile?.status || "Unknown"}
                  </span>
                </div>
              </div>

              <p className="text-base font-semibold text-gray-900 leading-tight sm:text-lg">
                {profile?.name || "—"}
              </p>
              <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
                {profile?.department?.name || "No department"}
              </p>

              {/* Photo buttons */}
              <div className="mt-4 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-700 transition hover:border-tpc-greenDeep hover:text-tpc-greenDeep active:scale-95 disabled:opacity-50 sm:text-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload photo"}
                </button>
                {profile?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 active:scale-95 disabled:opacity-50 sm:text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {removing ? "Removing…" : "Remove photo"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Details card ──────────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Account details
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {details.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3.5 sm:px-6"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 sm:h-9 sm:w-9">
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="truncate text-sm font-semibold text-gray-900 capitalize">
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Work Alignment row — only for employed alumni ─────────── */}
            {isEmployed && (
              <div className="border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 sm:h-9 sm:w-9">
                    <BriefcaseIcon className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">
                      Job–Course Alignment
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${alignmentBadge.cls}`}
                      >
                        <AlignIcon className="h-3 w-3" />
                        {alignmentBadge.label}
                      </span>
                    </div>
                    {/* Show reason if they gave one */}
                    {profile?.alumniProfile?.work_aligned_reason && (
                      <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                        "{profile.alumniProfile.work_aligned_reason}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Prompt if they haven't answered yet */}
                {profile?.alumniProfile?.is_work_aligned === null && (
                  <div className="px-4 pb-3 sm:px-6">
                    <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                      <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        Let us know if your job is aligned with your course.{" "}
                        <button
                          type="button"
                          onClick={openModal}
                          className="font-semibold underline underline-offset-2 hover:text-amber-900"
                        >
                          Answer now
                        </button>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
              <div className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs text-gray-400">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Tap "Edit" to update your contact number or .
                </span>
              </div>
            </div>*/}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {showModal && (
        <EditProfileForm
          form={form}
          setForm={setForm}
          previewUrl={previewUrl}
          onFileChange={handleModalFileChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
          saving={saving}
          error={modalError}
          validationErrors={validationErrors}
        />
      )}
    </>
  );
}
