import { useState } from "react";
import { useNavigate } from "react-router-dom";
import graduateService from "../../services/graduateService";
import { toast } from "react-toastify";

export default function CreateGraduate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    student_number: "",
    name: "",
    batch_year: "",
    block: "",
  });

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
      await graduateService.createAdminGraduate(formData);
      toast.success("Graduate added successfully.");
      navigate("/department-head/graduates");
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        toast.error(err.message || "Failed to add graduate");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/department-head/graduates")}
          className="text-tpc-green hover:text-tpc-greenDeep font-medium"
        >
          ← Back to Graduates
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          Add Department Graduate
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="e.g. 2024-001"
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
              placeholder="e.g. Maria Santos"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="e.g. 2026 or 2026-2027"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                  errors.batch_year ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.batch_year && (
                <p className="text-red-500 text-sm mt-1">{errors.batch_year}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block
              </label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleChange}
                placeholder="e.g. Block 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
              />
              {errors.block && (
                <p className="text-red-500 text-sm mt-1">{errors.block}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Graduate"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/department-head/graduates")}
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
