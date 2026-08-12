import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Trash2, PlusCircle, Pencil } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-toastify";

export default function CreateDepartment() {
  const navigate = useNavigate();

  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setListLoading(true);
      const response = await api.get("/departments");
      setDepartments(response.data.data || []);
    } catch {
      toast.error("Failed to load departments.");
    } finally {
      setListLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) return;
    try {
      setLoading(true);
      await api.post("/super-admin/departments", {
        name: departmentName.trim(),
      });
      toast.success(`Department "${departmentName.trim()}" created.`);
      setDepartmentName("");
      fetchDepartments();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create department.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"? This cannot be undone.`))
      return;
    try {
      setDeletingId(id);
      await api.delete(`/super-admin/departments/${id}`);
      toast.success(`Department "${name}" deleted.`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete department.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-tpc-greenDeep/30 focus:border-tpc-greenDeep transition text-sm";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-tpc-greenDeep transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Department Head Management
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tpc-greenDeep/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-tpc-greenDeep" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Department
          </h1>
          <p className="text-sm text-gray-500">
            Add a new department to the system
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="e.g. College of Engineering"
            className={`flex-1 min-w-0 ${inputClass}`}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !departmentName.trim()}
            className="flex items-center gap-2 bg-tpc-greenDeep hover:bg-tpc-green disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Existing Departments
          </h2>
        </div>

        {listLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tpc-greenDeep" />
          </div>
        ) : departments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            No departments yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {departments.map((dept) => (
              <li
                key={dept.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition"
              >
                <span className="text-sm text-gray-800 font-medium">
                  {dept.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      navigate(`/president/departments/${dept.id}/edit`)
                    }
                    className="p-1.5 rounded-lg text-gray-400 hover:text-tpc-greenDeep hover:bg-tpc-greenDeep/10 transition"
                    title="Edit department"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    disabled={deletingId === dept.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition"
                    title="Delete department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button> */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
