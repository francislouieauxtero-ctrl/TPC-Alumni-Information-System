import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import eventService from "../../../services/eventService";
import { toast } from "react-toastify";

const EMPTY_FORM = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  scope: "school_wide",
  department_id: "",
};

export default function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const isAdmin = localStorage.getItem("userRole") === "admin";
  const basePath = isAdmin ? "/department-head/events" : "/president/events";

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit); // only load if editing
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [external_link, setExternalLink] = useState("");
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getById(id);
      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        // event_date comes back as ISO string; slice to YYYY-MM-DD for <input type="date">
        event_date: data.event_date ? data.event_date.slice(0, 10) : "",
        location: data.location ?? "",
        scope: data.scope ?? "school_wide",
        department_id: data.department_id ?? "",
        attachments: [],
        external_link: data.external_link ?? "",
      });
      setExternalLink(data.external_link ?? "");
      setExistingAttachments(data.attachments || []);
      if (isAdmin) {
        const myDept = localStorage.getItem("departmentId") || "";
        if (
          data.department_id &&
          String(data.department_id) !== String(myDept)
        ) {
          toast.error("You cannot edit events outside your department");
          navigate(-1);
          return;
        }
        // ensure department_id locked to admin's department
        setForm((prev) => ({ ...prev, department_id: myDept }));
      }
    } catch (err) {
      toast.error("Failed to load event");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFiles = (e) => {
    const files = e.target.files || [];
    setAttachments(Array.from(files));
    if (errors.attachments)
      setErrors((prev) => ({ ...prev, attachments: null }));
  };

  const handleChooseFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files || [];
    if (files.length) setAttachments(Array.from(files));
  };

  const removeExistingAttachment = (idx) => {
    const removed = existingAttachments[idx];
    const key =
      (removed && (removed.id || removed.name || removed.url || removed)) ||
      removed;
    setExistingAttachments((prev) => prev.filter((_, i) => i !== idx));
    setRemovedAttachments((prev) => [...prev, key]);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.event_date) errs.event_date = "Event date is required.";
    if (form.scope === "department_specific" && !form.department_id)
      errs.department_id =
        "Select a department for department-specific events.";
    // attachments and external_link are optional
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Don't send department_id when school_wide
    const payload = { ...form };
    if (payload.scope === "school_wide") delete payload.department_id;
    if (!payload.department_id) delete payload.department_id;

    // ✅ add this
    if (payload.event_date && !payload.event_date.includes(" ")) {
      payload.event_date = payload.event_date + " 00:00";
    }

    try {
      setSaving(true);
      payload.attachments = attachments;
      payload.external_link = external_link;
      if (isAdmin) {
        const myDept = localStorage.getItem("departmentId") || "";
        payload.department_id = myDept;
        payload.scope = "department_specific";
      }
      if (removedAttachments.length)
        payload.removed_attachments = removedAttachments;

      if (isEdit) {
        await eventService.update(id, payload);
        toast.success("Event updated successfully");
        navigate(`${basePath}/${id}`);
      } else {
        const created = await eventService.create(payload);
        toast.success("Event created successfully");
        navigate(`${basePath}/${created.id}`);
      }
    } catch (err) {
      // Handle Laravel validation errors (422)
      if (err.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        toast.error(err.message || "Failed to save event");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {isEdit ? "Edit Event" : "Create Event"}
          </h1>
          <p className="text-gray-600 mt-2">
            Create and publish events for your school or department
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Field label="Title" error={errors.title} required>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Alumni Homecoming 2025"
              className={inputClass(errors.title)}
            />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description}>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Event details, agenda, notes..."
              className={inputClass(errors.description)}
            />
          </Field>

          {/* Date + Location row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Event Date" error={errors.event_date} required>
              <input
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                className={inputClass(errors.event_date)}
              />
            </Field>

            <Field label="Location" error={errors.location}>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. TPC Gymnasium"
                className={inputClass(errors.location)}
              />
            </Field>
          </div>

          {/* Scope */}
          {/* {!isAdmin ? (
            <Field label="Visibility" error={errors.scope} required>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="school_wide"
                    checked={form.scope === "school_wide"}
                    onChange={handleChange}
                    className="w-4 h-4 text-tpc-green"
                  />
                  <span className="text-gray-700">
                    <strong>School-wide</strong> - Visible to all departments
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="department_specific"
                    checked={form.scope === "department_specific"}
                    onChange={handleChange}
                    className="w-4 h-4 text-tpc-green"
                  />
                  <span className="text-gray-700">
                    <strong>Department-specific</strong> - Visible only to the
                    selected department
                  </span>
                </label>
              </div>
            </Field>
          ) : (
            <Field label="Scope" error={errors.scope} required>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                Department-specific
              </div>
            </Field>
          )}

          {!isAdmin && form.scope === "department_specific" && (
            <Field
              label="Department ID"
              error={errors.department_id}
              required
              hint="Enter the department ID. You can wire this to a department dropdown later."
            >
              <input
                type="number"
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                placeholder="Department ID"
                className={inputClass(errors.department_id)}
              />
            </Field>
          )} */}

          <Field
            label="Image upload (single or multiple)"
            error={errors.attachments}
          >
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              multiple
              onChange={handleFiles}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />

            {existingAttachments && existingAttachments.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {existingAttachments.map((att, idx) => {
                  const url = (att && (att.url || att)) || "";
                  const name =
                    (att && (att.name || url.split("/").pop())) || "file";
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                  const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                  return (
                    <div key={idx} className="relative border rounded p-1">
                      {isImage ? (
                        <img
                          src={url}
                          alt={name}
                          className="object-cover h-20 w-full rounded"
                        />
                      ) : isVideo ? (
                        <video
                          src={url}
                          className="h-20 w-full object-cover rounded"
                          controls
                          muted
                        />
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 underline"
                        >
                          {name}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(idx)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                        aria-label="Remove attachment"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              onClick={handleChooseFilesClick}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-full border-dashed border-2 border-gray-200 rounded p-4 text-center cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                name="attachments"
                onChange={handleFiles}
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                className="hidden"
              />
              <div className="text-sm text-gray-600">
                Click to choose files or drag & drop here
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Accepted: images, videos, PDFs, docs
              </div>
            </div>
          </Field>

          {/* <Field label="External URL" error={errors.external_link}>
            <input
              type="url"
              name="external_link"
              value={external_link}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://example.com/resource"
              className={inputClass(errors.external_link)}
            />
          </Field> */}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="px-6 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function inputClass(hasError) {
  return [
    "w-full px-4 py-2 border rounded-lg text-gray-800 text-sm",
    "focus:outline-none focus:ring-2",
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-gray-300 focus:ring-tpc-green",
  ].join(" ");
}

function Field({ label, children, error, required, hint }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
