import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Save } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-toastify";

export default function EditDepartment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [departmentName, setDepartmentName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setFetchLoading(true);
        const response = await api.get(`/super-admin/departments/${id}`);
        const name = response.data.data?.name || "";
        setDepartmentName(name);
        setOriginalName(name);
      } catch {
        toast.error("Failed to load department.");
        navigate("/president/departments/create");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchDepartment();
  }, [id, navigate]);

  const hasChanged = departmentName.trim() !== originalName;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!departmentName.trim() || !hasChanged) return;

    try {
      setLoading(true);
      await api.put(`/super-admin/departments/${id}`, {
        name: departmentName.trim(),
      });
      toast.success(`Department renamed to "${departmentName.trim()}".`);
      navigate("/president/departments/create");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update department.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-tpc-greenDeep/30 focus:border-tpc-greenDeep transition text-sm";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate("/president/departments/create")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-tpc-greenDeep transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Department Management
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tpc-greenDeep/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-tpc-greenDeep" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Department</h1>
          <p className="text-sm text-gray-500">
            Update the department name below
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {fetchLoading ? (
          <div className="py-4 space-y-3">
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-32" />
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Department Name
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g. College of Engineering"
                className={`w-full ${inputClass}`}
                autoFocus
              />
              {!hasChanged && !fetchLoading && (
                <p className="text-xs text-gray-400">
                  Make a change to the name to enable saving.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || !departmentName.trim() || !hasChanged}
                className="flex items-center gap-2 bg-tpc-greenDeep hover:bg-tpc-green disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/president/departments/create")}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
