import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import announcementService from "../../../services/announcementService";
import departmentService from "../../../services/departmentService";
import { toast } from "react-toastify";

export default function AnnouncementCreate({
  basePath = "/president/announcements",
}) {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "school_wide",
    department_id: null,
    images: [],
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, images: files });
  };

  const handleScopeChange = (e) => {
    const scope = e.target.value;
    setFormData({
      ...formData,
      scope,
      department_id:
        scope === "department_specific" ? formData.department_id : null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    if (formData.scope === "department_specific" && !formData.department_id) {
      toast.error(
        "Please select a department for department-specific announcements",
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim() || null,
        content: formData.content.trim() || null,
        scope: formData.scope,
        images: formData.images,
      };

      if (formData.scope === "department_specific") {
        payload.department_id = parseInt(formData.department_id);
      }

      await announcementService.create(payload);
      toast.success("Announcement created successfully");
      navigate(basePath);
    } catch (err) {
      toast.error(err.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Announcement
          </h1>
          <p className="text-gray-600 mt-2">
            Create and publish announcements for your school or departments
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Announcement title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Announcement content"
              rows="8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (images, videos, documents)
            </label>
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              multiple
              onChange={handleFiles}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Scope */}
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
                  onChange={handleScopeChange}
                  className="w-4 h-4 text-tpc-green"
                />
                <span className="text-gray-700">
                  <strong>School-wide</strong> - All alumni and departments can
                  see this
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="department_specific"
                  checked={formData.scope === "department_specific"}
                  onChange={handleScopeChange}
                  className="w-4 h-4 text-tpc-green"
                />
                <span className="text-gray-700">
                  <strong>Department-specific</strong> - Only selected
                  department alumni see this
                </span>
              </label>
            </div>
          </div>

          {/* Department Select (conditional) */}
          {formData.scope === "department_specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-tpc-gold hover:bg-tpc-goldDeep text-black font-semibold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Announcement"}
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
