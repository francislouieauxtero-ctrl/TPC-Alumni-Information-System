import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import graduateService from "../../../services/graduateService";
import api from "../../../services/api";
import { toast } from "react-toastify";

export default function GraduateEdit() {
  const navigate = useNavigate();
  const id = sessionStorage.getItem("graduateEditId");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    department_id: "",
    student_number: "",
    name: "",
    batch_year: "",
    block: "",
  });

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchGraduate();
    } else {
      navigate("/president/graduates", { replace: true });
    }
  }, [id, navigate]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data.data);
    } catch (err) {
      toast.error("Failed to load departments");
    }
  };

  const fetchGraduate = async () => {
    try {
      setFetching(true);
      const graduate = await graduateService.getById(id);
      setFormData({
        department_id: graduate.department_id ?? "",
        student_number: graduate.student_number ?? "",
        name: graduate.name ?? "",
        batch_year: graduate.batch_year ?? "",
        block: graduate.block ?? "",
      });
    } catch (err) {
      toast.error("Failed to load graduate");
      navigate("/president/graduates");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await graduateService.update(id, formData);
      toast.success("Graduate updated successfully");
      sessionStorage.removeItem("graduateEditId");
      navigate("/president/graduates");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        toast.error(err.message || "Failed to update graduate");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/president/graduates")}
          className="text-tpc-green hover:text-tpc-greenDeep font-medium flex items-center gap-2"
        >
          ← Back to Graduates
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Graduate</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
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
            {errors.department_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.department_id}
              </p>
            )}
          </div>

          {/* Student Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Number *
            </label>
            <input
              type="text"
              name="student_number"
              value={formData.student_number}
              onChange={handleChange}
              required
              placeholder="e.g., 2021-001"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                errors.student_number ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.student_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.student_number}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Batch Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Year *
            </label>
            <input
              type="text"
              name="batch_year"
              value={formData.batch_year}
              onChange={handleChange}
              required
              placeholder="e.g., 2026 or 2026-2027"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                errors.batch_year ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.batch_year && (
              <p className="text-red-500 text-sm mt-1">{errors.batch_year}</p>
            )}
          </div>

          {/* Block */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block
            </label>
            <input
              type="text"
              name="block"
              value={formData.block}
              onChange={handleChange}
              placeholder="e.g., Block 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
            />
            {errors.block && (
              <p className="text-red-500 text-sm mt-1">{errors.block}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/president/graduates")}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
