import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog, Eye, EyeOff } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-toastify";

const DEPARTMENT_HEAD_STATUS_ACTIVE = "active";

export default function CreateDepartmentHead() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      const allDepartments = response.data.data || [];
      const departmentHeadResponse = await api.get(
        "/super-admin/department-admins",
        {
          params: {
            status: DEPARTMENT_HEAD_STATUS_ACTIVE,
          },
        },
      );
      const activeHeads = departmentHeadResponse.data.data || [];
      const unavailableDepartmentIds = new Set(
        activeHeads
          .map((head) => head.department?.id ?? head.department_id)
          .filter(Boolean),
      );

      setDepartments(
        allDepartments.filter((dept) => !unavailableDepartmentIds.has(dept.id)),
      );
    } catch {
      toast.error("Failed to load departments.");
    }
  };

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/super-admin/department-admins", {
        ...form,
        password_confirmation: form.password,
      });
      toast.success(`Department head "${form.name}" created.`);
      setForm({ name: "", email: "", password: "", department_id: "" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create department head.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.department_id;

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-tpc-greenDeep/30 focus:border-tpc-greenDeep transition text-sm";

  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-tpc-greenDeep transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Department Head Management
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tpc-greenDeep/10 flex items-center justify-center">
          <UserCog className="w-5 h-5 text-tpc-greenDeep" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Department Head
          </h1>
          <p className="text-sm text-gray-500">
            Register a new department head account
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
      >
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Dr. Juan dela Cruz"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="e.g. jdelacruz@tpc.edu.ph"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Temporary Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
              required
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            The department head will be prompted to change this on first login.
          </p>
        </div>

        <div>
          <label className={labelClass}>Assign Department</label>
          <select
            value={form.department_id}
            onChange={set("department_id")}
            required
            className={inputClass}
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {departments.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              No departments are available for a new department head right now.
              Each department can have only one active head at a time.
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-2" />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="flex items-center gap-2 bg-tpc-greenDeep hover:bg-tpc-green disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Creating…" : "Create Department Head"}
          </button>
        </div>
      </form>
    </div>
  );
}
