import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import graduateService from "../../services/graduateService";
import { toast } from "react-toastify";

export default function EditGraduate() {
  const navigate = useNavigate();
  const id = sessionStorage.getItem("graduateEditId");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [originalName, setOriginalName] = useState("");
  const [formData, setFormData] = useState({
    student_number: "",
    name: "",
    batch_year: "",
    block: "",
  });

  useEffect(() => {
    if (id) {
      fetchGraduate();
    } else {
      navigate("/department-head/graduates", { replace: true });
    }
  }, [id, navigate]);

  const fetchGraduate = async () => {
    try {
      setFetching(true);
      const graduate = await graduateService.getAdminGraduateById(id);
      const registered = Boolean(
        graduate.is_registered || graduate.registration_status === "registered"
      );
      setIsRegistered(registered);
      setOriginalName(graduate.name ?? "");
      setFormData({
        student_number: graduate.student_number ?? "",
        name: graduate.name ?? "",
        batch_year: graduate.batch_year ?? "",
        block: graduate.block ?? "",
      });
    } catch (err) {
      toast.error("Failed to load graduate");
      navigate("/department-head/graduates");
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
    if (isRegistered) {
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      await graduateService.updateAdminGraduate(id, formData);
      toast.success("Graduate updated successfully.");
      sessionStorage.removeItem("graduateEditId");
      navigate("/department-head/graduates");
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
          Edit Department Graduate
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
              disabled={isRegistered}
              readOnly={isRegistered}
              required
              placeholder="e.g. 2024-001"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                isRegistered
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : errors.student_number
                  ? "border-red-500"
                  : "border-gray-300"
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
              disabled={isRegistered}
              readOnly={isRegistered}
              required
              placeholder="e.g. Maria Santos"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                isRegistered
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : errors.name
                  ? "border-red-500"
                  : "border-gray-300"
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
                disabled={isRegistered}
                readOnly={isRegistered}
                required
                placeholder="e.g. 2026 or 2026-2027"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                  isRegistered
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : errors.batch_year
                    ? "border-red-500"
                    : "border-gray-300"
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
                disabled={isRegistered}
                readOnly={isRegistered}
                placeholder="e.g. Block 1"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green ${
                  isRegistered
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : errors.block
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.block && (
                <p className="text-red-500 text-sm mt-1">{errors.block}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || isRegistered}
              className="flex-1 px-6 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
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
