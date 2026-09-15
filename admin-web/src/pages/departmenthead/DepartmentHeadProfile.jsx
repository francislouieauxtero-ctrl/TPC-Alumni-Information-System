import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { resolveStorageUrl } from "../../utils/media";
import {
  Camera,
  Mail,
  Building2,
  ShieldCheck,
  Activity,
  Loader2,
  AlertCircle,
  X,
  User,
  Key,
  Upload,
  Trash2,
} from "lucide-react";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-gray-100 text-gray-600 ring-gray-500/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  suspended: "bg-red-50 text-red-700 ring-red-600/20",
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function DepartmentHeadProfile() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profile?.avatar]);

  const busy = uploading || removing;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/user");
        if (response.data.status) {
          setProfile(response.data.data);
          setName(response.data.data.name || "");
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

  const handleNameSave = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setActionError("Please enter your name.");
      return;
    }

    try {
      setSavingName(true);
      setActionError("");
      const response = await api.put("/profile", { name: trimmedName });
      if (response.data.status) {
        const updatedUser = response.data.data;
        setProfile(updatedUser);
        setName(updatedUser.name || "");
        localStorage.setItem("userName", updatedUser.name || "");
        if (updatedUser.email) localStorage.setItem("userEmail", updatedUser.email);
        window.dispatchEvent(new Event("user-profile-updated"));
      } else {
        setActionError(response.data.message || "Failed to update your name.");
      }
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Failed to update your name.",
      );
    } finally {
      setSavingName(false);
    }
  };

  const validateFile = (file) => {
    if (!file.type.startsWith("image/"))
      return "Please choose an image file (JPG, PNG, GIF, or WebP).";
    if (file.size > MAX_AVATAR_BYTES) return "Images must be 5 MB or smaller.";
    return "";
  };

  const uploadAvatar = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setActionError(validationError);
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
        setProfile(updatedUser);
        localStorage.setItem("userAvatar", updatedUser.avatar || "");
        window.dispatchEvent(new Event("user-profile-updated"));
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

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      setRemoving(true);
      setActionError("");
      const response = await api.delete("/profile/avatar");
      if (response.data.status) {
        const updatedUser = response.data.data;
        setProfile(updatedUser);
        localStorage.setItem("userAvatar", updatedUser.avatar || "");
        window.dispatchEvent(new Event("user-profile-updated"));
      } else {
        setActionError(response.data.message || "Failed to remove photo.");
      }
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to remove photo.");
    } finally {
      setRemoving(false);
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
      <div className="p-8">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
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

  const details = [
    { icon: User, label: "Full name", value: profile?.name },
    { icon: Mail, label: "Email", value: profile?.email },
    { icon: Building2, label: "Department", value: profile?.department?.name },
    { icon: Key, label: "Role", value: "Department head" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-6 w-full">
      {/* Page header */}
      <div className="mb-5 sm:mb-7 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-tpc-greenDeep">
          Account
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Your profile</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-400">
          Review your department head account details here.
        </p>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{actionError}</span>
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

      {/* Profile card */}
      <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* ── Left pane: identity + photo actions ── */}
          <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 px-6 sm:px-8 py-6 sm:py-10">
            {/* Avatar */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`group relative mb-4 h-22 w-22 flex-shrink-0 overflow-hidden rounded-2xl ${
                isDragging ? "ring-2 ring-tpc-greenDeep ring-offset-2" : ""
              }`}
              style={{ width: 120, height: 120 }}
            >
              {profile?.avatar && !imageFailed ? (
                <img
                  src={resolveStorageUrl(profile.avatar)}
                  alt={profile.name}
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-tpc-greenDeep/10 text-4xl font-semibold text-tpc-greenDeep">
                  {getInitials(profile?.name)}
                </div>
              )}

              {/* Hover overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                aria-label="Change profile photo"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100 focus-visible:bg-black/35 focus-visible:opacity-100 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>

              {/* Upload progress bar */}
              {uploading && progress > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                  <div
                    className="h-full bg-tpc-greenDeep transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Name + dept */}
            <p className="text-center text-base font-semibold text-gray-900">
              {profile?.name || "—"}
            </p>
            <p className="mt-1 text-center text-sm text-gray-400">
              {profile?.department?.name || "No department"}
            </p>

            {/* Badges */}
            <div className="mt-4 flex w-full flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Department head
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize ring-1 ring-inset ${statusClasses}`}
              >
                <Activity className="h-3.5 w-3.5" />
                {profile?.status || "Unknown"}
              </span>
            </div>

            {/* Photo action buttons */}
            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-tpc-greenDeep hover:text-tpc-greenDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tpc-greenDeep focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Upload photo"}
              </button>

              {profile?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={busy}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {removing ? "Removing…" : "Remove photo"}
                </button>
              )}
            </div>
          </div>

          {/* ── Right pane: account details ── */}
          <div className="px-10 py-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Account details
            </p>

            <form
              onSubmit={handleNameSave}
              className="mb-5 rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <label
                htmlFor="department-head-name"
                className="mb-2 block text-xs font-medium text-gray-500"
              >
                Display name
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="department-head-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
                  maxLength={255}
                  disabled={savingName}
                />
                <button
                  type="submit"
                  disabled={savingName}
                  className="rounded-lg bg-tpc-greenDeep px-4 py-2 text-sm font-medium text-white transition hover:bg-tpc-green disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingName ? "Saving..." : "Save name"}
                </button>
              </div>
            </form>

            <div className="divide-y divide-gray-100">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 py-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-base font-semibold text-gray-900">
                      {value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}
