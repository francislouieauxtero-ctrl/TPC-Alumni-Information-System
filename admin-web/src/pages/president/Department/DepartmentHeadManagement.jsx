import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import {
  Search,
  CheckCircle,
  XCircle,
  Building2,
  UserCog,
  Pencil,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

export default function DepartmentHeadManagement({ embedded = false }) {
  const currentRole = localStorage.getItem("userRole");
  const navigate = useNavigate();

  // Department heads state
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null); // the admin being edited
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department_id: "",
    status: "",
    password: "",
    password_confirmation: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, [search, filterVerified, filterStatus]);

  // ── Department heads ──────────────────────────────────────────
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterVerified) params.verified = filterVerified;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get("/super-admin/department-admins", {
        params,
      });

      if (response.data.status) {
        setDepartmentHeads(response.data.data || []);
      }
    } catch {
      toast.error("Failed to load department heads.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, name) => {
    try {
      setActionLoading(id);
      const response = await api.post(`/admin/staff/${id}/verify`);
      if (response.data.status) {
        toast.success(`${name} has been verified.`);
        fetchStaff();
      }
    } catch {
      toast.error("Failed to verify department head.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject the application of ${name}?`)) return;
    try {
      setActionLoading(id);
      const response = await api.post(`/admin/staff/${id}/reject`);
      if (response.data.status) {
        toast.success(`${name}'s application has been rejected.`);
        fetchStaff();
      }
    } catch {
      toast.error("Failed to reject department head.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (
      !window.confirm(
        `Deactivate ${name}? They will no longer be able to sign in.`,
      )
    )
      return;
    try {
      setActionLoading(id);
      const response = await api.post(
        `/super-admin/department-admins/${id}/deactivate`,
      );
      if (response.data.status) {
        toast.success(`${name} has been deactivated.`);
        fetchStaff();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to deactivate department head.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id, name) => {
    try {
      setActionLoading(id);
      const response = await api.post(
        `/super-admin/department-admins/${id}/activate`,
      );
      if (response.data.status) {
        toast.success(`${name} has been activated.`);
        fetchStaff();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to activate department head.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const hasActiveDepartmentHead = (departmentId, memberId = null) => {
    if (!departmentId) {
      return false;
    }

    return departmentHeads.some(
      (member) =>
        member.department?.id === departmentId &&
        member.status === "active" &&
        member.id !== memberId,
    );
  };

  const getActivationButtonLabel = (member) => {
    if (!member.department?.id) {
      return "Activate";
    }

    return hasActiveDepartmentHead(member.department.id, member.id)
      ? "Deactivated"
      : "Activate";
  };

  // ── Edit modal ────────────────────────────────────────────────
  const openEdit = (member) => {
    setEditTarget(member);
    setEditForm({
      name: member.name ?? "",
      email: member.email ?? "",
      department_id: member.department?.id ?? "",
      status: member.status ?? "active",
      password: "",
      password_confirmation: "",
    });
    setEditErrors({});
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditErrors({});

    try {
      // Only send password fields if the user filled them in
      const payload = {
        name: editForm.name,
        email: editForm.email,
        department_id: editForm.department_id,
        status: editForm.status,
      };

      if (editForm.password) {
        payload.password = editForm.password;
        payload.password_confirmation = editForm.password_confirmation;
      }

      const response = await api.put(
        `/super-admin/department-admins/${editTarget.id}`,
        payload,
      );

      if (response.data.status) {
        toast.success(`${editForm.name} updated successfully.`);
        closeEdit();
        fetchStaff();
      }
    } catch (err) {
      // Laravel validation errors come back as 422 with errors object
      const errors = err.response?.data?.errors;
      if (errors) {
        // Flatten first message per field
        const flat = {};
        Object.entries(errors).forEach(([key, msgs]) => {
          flat[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setEditErrors(flat);
      } else {
        toast.error(
          err.response?.data?.message || "Failed to update department head.",
        );
      }
    } finally {
      setEditLoading(false);
    }
  };

  // ── Departments ───────────────────────────────────────────────
  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const response = await api.get("/departments");
      setDepartments(response.data.data || []);
    } catch {
      toast.error("Failed to load departments.");
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeleteDepartment = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"? This cannot be undone.`))
      return;
    try {
      await api.delete(`/super-admin/departments/${id}`);
      toast.success(`Department "${name}" deleted.`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete department.",
      );
    }
  };

  const inputClass =
    "px-4 py-2 border border-gray-200 bg-white rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-tpc-greenDeep/30 focus:border-tpc-greenDeep transition text-sm";

  const fieldClass = (field) =>
    `w-full px-3 py-2 rounded-lg border text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-tpc-greenDeep/20 ${
      editErrors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-gray-200 focus:border-tpc-greenDeep"
    }`;

  return (
    <div className={embedded ? "mt-8" : "p-8"}>
      {!embedded && (
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Department Head Management
            </h1>
            <p className="text-gray-500 text-sm">
              Manage departments and verify department heads
            </p>
          </div>

          {currentRole === "super_admin" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/president/departments/create")}
                className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <Building2 className="w-4 h-4 text-tpc-greenDeep" />
                New Department
              </button>
              <button
                onClick={() => navigate("/president/department-heads/create")}
                className="flex items-center gap-2 bg-tpc-greenDeep hover:bg-tpc-green text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                <UserCog className="w-4 h-4" />
                New Department Head
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Departments Section ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-tpc-greenDeep" />
            <h2 className="text-sm font-semibold text-gray-700">
              Departments
              {!deptLoading && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({departments.length})
                </span>
              )}
            </h2>
          </div>
          {currentRole === "super_admin" && (
            <button
              onClick={() => navigate("/president/departments/create")}
              className="flex items-center gap-1.5 text-xs font-medium text-tpc-greenDeep hover:text-tpc-green transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Department
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {deptLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-tpc-greenDeep" />
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Building2 className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">No departments yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {departments.map((dept) => (
                <li
                  key={dept.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-tpc-greenDeep/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-tpc-greenDeep" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {dept.name}
                    </span>
                  </div>
                  {currentRole === "super_admin" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          navigate(`/president/departments/${dept.id}/edit`)
                        }
                        className="p-1.5 rounded-lg text-gray-400 hover:text-tpc-greenDeep hover:bg-tpc-greenDeep/10 transition"
                        title="Edit department"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteDepartment(dept.id, dept.name)
                        }
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Delete department"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Department Heads Section ────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <UserCog className="w-4 h-4 text-tpc-greenDeep" />
        <h2 className="text-sm font-semibold text-gray-700">
          Department Heads
          {!loading && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({departmentHeads.length})
            </span>
          )}
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Only one active department head is allowed per department. Deactivate
          the current head first before activating a replacement.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className={inputClass}
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Pending</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputClass}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tpc-greenDeep" />
            <p className="text-sm text-gray-400">Loading department heads…</p>
          </div>
        ) : departmentHeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <UserCog className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-400">No department heads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Department</th>
                  <th className="px-6 py-3 text-left">Verification</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departmentHeads.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{member.email}</td>
                    <td className="px-6 py-4">
                      {member.department?.name ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-tpc-greenDeep bg-tpc-greenDeep/10 px-2.5 py-1 rounded-full">
                          <Building2 className="w-3.5 h-3.5" />
                          {member.department.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          member.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {member.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Edit — always visible to super_admin */}
                        {currentRole === "super_admin" && (
                          <>
                            <button
                              onClick={() => openEdit(member)}
                              className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                          </>
                        )}
                        {!member.isVerified && (
                          <>
                            <button
                              onClick={() =>
                                handleVerify(member.id, member.name)
                              }
                              disabled={actionLoading === member.id}
                              className="bg-green-100 hover:bg-green-200 disabled:opacity-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() =>
                                handleReject(member.id, member.name)
                              }
                              disabled={actionLoading === member.id}
                              className="bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {member.isVerified &&
                          (member.status === "active" ? (
                            <button
                              onClick={() =>
                                handleDeactivate(member.id, member.name)
                              }
                              disabled={actionLoading === member.id}
                              className="bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleActivate(member.id, member.name)
                              }
                              disabled={
                                actionLoading === member.id ||
                                hasActiveDepartmentHead(
                                  member.department?.id,
                                  member.id,
                                )
                              }
                              title={
                                hasActiveDepartmentHead(
                                  member.department?.id,
                                  member.id,
                                )
                                  ? "Deactivate the current department head for this department before activating another one."
                                  : "Activate this department head"
                              }
                              className="bg-green-100 hover:bg-green-200 disabled:opacity-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              {getActivationButtonLabel(member)}
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="bg-tpc-greenDeep px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Department Head
                </p>
                <h2 className="mt-0.5 text-lg font-semibold text-white">
                  Edit {editTarget.name}
                </h2>
              </div>
              <button
                onClick={closeEdit}
                className="rounded-full border border-white/20 p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className={fieldClass("name")}
                />
                {editErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{editErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className={fieldClass("email")}
                />
                {editErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {editErrors.email}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={editForm.department_id}
                  onChange={handleEditChange}
                  className={fieldClass("department_id")}
                >
                  <option value="">— Select department —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {editErrors.department_id && (
                  <p className="mt-1 text-xs text-red-500">
                    {editErrors.department_id}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className={fieldClass("status")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {editErrors.status && (
                  <p className="mt-1 text-xs text-red-500">
                    {editErrors.status}
                  </p>
                )}
              </div>

              {/* Password — optional, only sent if filled */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3">
                  Leave password fields blank to keep the current password.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={editForm.password}
                      onChange={handleEditChange}
                      placeholder="••••••••"
                      className={fieldClass("password")}
                    />
                    {editErrors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {editErrors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={editForm.password_confirmation}
                      onChange={handleEditChange}
                      placeholder="••••••••"
                      className={fieldClass("password_confirmation")}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-tpc-greenDeep hover:bg-tpc-green text-white text-sm font-medium transition disabled:opacity-60"
                >
                  {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
