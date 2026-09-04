import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import graduateService from "../../services/graduateService";
import { toast } from "react-toastify";

export default function GraduateList() {
  const navigate = useNavigate();
  const [graduates, setGraduates] = useState({ data: [], meta: null });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    batch_year: "",
    block: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchGraduates();
  }, [currentPage, filters]);

  const fetchGraduates = async () => {
    try {
      setLoading(true);
      // graduateService.getAdminGraduates() is already scoped server-side
      // to the logged-in department head's own department, so no
      // department_id filter is needed on the frontend here.
      const data = await graduateService.getAdminGraduates({
        ...filters,
        page: currentPage,
      });
      setGraduates(data);
    } catch (err) {
      toast.error(err.message || "Failed to load graduates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this graduate?"))
      return;

    try {
      await graduateService.deleteAdminGraduate(id);
      toast.success("Graduate deleted successfully");
      fetchGraduates();
    } catch (err) {
      toast.error(err.message || "Failed to delete graduate");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Graduates</h1>
          <p className="text-gray-600 mt-1">
            Manage graduates for your department.
          </p>
        </div>

        <button
          onClick={() => navigate("create")}
          className="px-6 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition"
        >
          + Add Graduate
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by name or student number..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
          <input
            type="text"
            name="batch_year"
            placeholder="Batch year"
            value={filters.batch_year}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
          <input
            type="text"
            name="block"
            placeholder="Block"
            value={filters.block}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
        </div>
      </div>

      {graduates.data && graduates.data.length > 0 ? (
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-opacity ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          <table className="w-full">
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
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Actions
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
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        graduate.registration_status === "registered"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {graduate.registration_status === "registered"
                        ? "Registered"
                        : "Not Registered"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => navigate(`${graduate.id}/edit`)}
                      className="text-tpc-green hover:text-tpc-greenDeep text-sm font-medium"
                    >
                      Edit
                    </button>
                    {/* <button
                      onClick={() => handleDelete(graduate.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">No graduates found.</p>
          </div>
        )
      )}

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
          {currentPage < graduates.meta.last_page && (
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
