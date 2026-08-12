import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import eventService from "../../../services/eventService";
import api from "../../../services/api";
import { toast } from "react-toastify";

export default function EventCreate() {
  const navigate = useNavigate();
  const basePath =
    localStorage.getItem("userRole") === "admin"
      ? "/department-head/events"
      : "/president/events";
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isAdmin = localStorage.getItem("userRole") === "admin";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    scope: isAdmin ? "department_specific" : "school_wide",
    department_id: "",
    attachments: [],
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
    if (isAdmin) {
      const deptId = localStorage.getItem("departmentId") || "";
      const deptName = localStorage.getItem("departmentName") || "Department";
      setFormData((prev) => ({
        ...prev,
        department_id: deptId,
        scope: "department_specific",
      }));
      setDepartments((prev) =>
        prev && prev.length
          ? prev
          : deptId
            ? [{ id: deptId, name: deptName }]
            : prev,
      );
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data.data || []);
    } catch (err) {
      toast.error("Failed to load departments");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFiles = (e) => {
    const files = e.target.files || [];
    setFormData((prev) => ({ ...prev, attachments: Array.from(files) }));
    if (errors.attachments)
      setErrors((prev) => ({ ...prev, attachments: null }));
  };

  const handleChooseFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files || [];
    if (files.length)
      setFormData((prev) => ({ ...prev, attachments: Array.from(files) }));
  };

  const removeSelectedAttachment = (idx) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== idx),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title || !formData.title.trim())
      errs.title = "Title is required.";
    if (!formData.event_date) errs.event_date = "Event date is required.";
    if (formData.scope === "department_specific" && !formData.department_id)
      errs.department_id =
        "Select a department for department-specific events.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setLoading(false);
      return;
    }

    try {
      // Format date for API (replace T with space if datetime-local used)
      const dateTime = formData.event_date
        ? formData.event_date.replace("T", " ")
        : "";
      const payload = { ...formData, event_date: dateTime };

      if (isAdmin) {
        payload.scope = "department_specific";
        // department_id should already be set for admin flow
      }
      if (isAdmin) {
        payload.department_id =
          localStorage.getItem("departmentId") || payload.department_id;
      }

      const created = await eventService.create(payload);
      toast.success("Event created successfully");
      navigate(basePath + (created?.id ? `/${created.id}` : ""));
    } catch (err) {
      if (err && err.errors) setErrors(err.errors);
      else toast.error(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(basePath)}
          className="text-tpc-green hover:text-tpc-greenDeep font-medium flex items-center gap-2"
        >
          ← Back to Events
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Event</h1>
          <p className="text-gray-600 mt-2">
            Create and publish events for your school or department
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Alumni Reunion 2024"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Event details and agenda..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Event Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                  errors.event_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.event_date && (
                <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Main Auditorium"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Location */}
          {/* Scope */}
          {!isAdmin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibility <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="school_wide"
                    checked={formData.scope === "school_wide"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scope: e.target.value,
                      }))
                    }
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
                    checked={formData.scope === "department_specific"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scope: e.target.value,
                        department_id: prev.department_id || null,
                      }))
                    }
                    className="w-4 h-4 text-tpc-green"
                  />
                  <span className="text-gray-700">
                    <strong>Department-specific</strong> - Visible only to the
                    selected department
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                Department-specific
              </div>
            </div>
          )}

          {formData.scope === "department_specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              {isAdmin ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {departments.find(
                    (d) => String(d.id) === String(formData.department_id),
                  )?.name ||
                    localStorage.getItem("departmentName") ||
                    "Department"}
                </div>
              ) : (
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                    errors.department_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.department_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.department_id}
                </p>
              )}
            </div>
          )}

          {/* Attachments (available to all creators) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image upload (single or multiple)
            </label>
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              multiple
              onChange={handleFiles}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />

            {(formData.attachments || []).length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(formData.attachments || []).map((att, idx) => {
                  const url = att
                    ? att.preview || URL.createObjectURL(att)
                    : "";
                  const name = att.name || url.split("/").pop();
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
                  const isVideo = /\.(mp4|webm|ogg)$/i.test(name);
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
                        <div className="text-sm text-gray-700 px-2 py-3">
                          {name}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSelectedAttachment(idx)}
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
            {errors.attachments && (
              <p className="text-red-500 text-sm mt-1">{errors.attachments}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-tpc-gold hover:bg-tpc-goldDeep text-black font-semibold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
