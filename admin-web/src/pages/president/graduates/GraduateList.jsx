import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import graduateService from "../../../services/graduateService";
import departmentService from "../../../services/departmentService";
import { toast } from "react-toastify";

export default function GraduateList() {
  const navigate = useNavigate();
  const [graduates, setGraduates] = useState({ data: [], meta: null });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department_id: "",
    batch_year: "",
    block: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchGraduates();
  }, [currentPage, filters]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      // departmentService.getAll() already returns { success, message, data: [...] }
      // so the array lives at response.data, not response.data.data
      setDepartments(response.data || []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
      toast.error("Failed to load departments");
    }
  };

  const fetchGraduates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await graduateService.getAll({
        ...filters,
        page: currentPage,
      });
      setGraduates(data);
    } catch (err) {
      setError(err.message || "Failed to fetch graduates");
      toast.error("Failed to load graduates");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  if (loading && !graduates.meta) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] p-4 sm:p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-100">
              GRADUATE MANAGEMENT
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white">
              Graduates
            </h1>
            <p className="mt-1 text-sm text-green-50/90">
              View and manage recorded graduate information.
            </p>
          </div>

          <button
            onClick={() => navigate("create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-green-50 text-[#006400] px-4 py-2.5 text-sm font-semibold transition shadow-sm self-start sm:self-auto shrink-0"
          >
            + Add Graduate
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search name / student no..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
          <select
            name="department_id"
            value={filters.department_id}
            onChange={handleFilterChange}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="batch_year"
            placeholder="Batch year"
            value={filters.batch_year}
            onChange={handleFilterChange}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
          <input
            type="text"
            name="block"
            placeholder="Block"
            value={filters.block}
            onChange={handleFilterChange}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
        </div>
      </div>

      {graduates.data && graduates.data.length > 0 ? (
        <div
          className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-opacity ${loading ? "opacity-50" : "opacity-100"
            }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Student Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Batch Year
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {graduates.data.map((graduate) => (
                  <tr
                    key={graduate.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {graduate.student_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {graduate.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {graduate.batch_year}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {graduate.block || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {graduate.department?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${graduate.registration_status === "registered"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {graduate.registration_status === "registered"
                          ? "Registered"
                          : "Unregistered"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">No graduates found</p>
          </div>
        )
      )}

      {/* Pagination */}
      {graduates.meta?.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          {currentPage < graduates.meta?.last_page && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
