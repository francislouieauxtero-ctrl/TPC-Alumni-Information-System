import api from "./api";

const alumniService = {
  /**
   * Get pending alumni (returns array)
   */
  getPending: async () => {
    try {
      const response = await api.get("/admin/alumni/pending");
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get rejected alumni registrations
   */
  getRejected: async () => {
    try {
      const response = await api.get("/admin/alumni/rejected");
      const payload = response.data?.data ?? [];

      if (Array.isArray(payload)) {
        return payload;
      }

      return payload.data ?? [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteRejected: async (rejectionId) => {
    try {
      const response = await api.delete(
        `/admin/alumni/rejected/${rejectionId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all alumni (returns paginated collection)
   */
  getAll: async (filters = {}) => {
    try {
      const response = await api.get("/admin/alumni", { params: filters });
      const raw = response.data.data;

      if (Array.isArray(raw)) {
        return {
          data: raw,
          meta: { last_page: 1, current_page: 1, total: raw.length },
        };
      }

      return raw;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Approve alumni
   */
  approve: async (alumniId) => {
    try {
      const response = await api.patch(`/admin/alumni/${alumniId}/approve`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reject alumni
   */
  reject: async (alumniId, reason = "") => {
    try {
      const response = await api.patch(`/admin/alumni/${alumniId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ─── Work Alignment ──────────────────────────────────────────────────────

  /**
   * Alumni self-reports whether their job is aligned with their course.
   * POST /employment/alignment
   *
   * @param {boolean}     isAligned  - true = yes, false = no
   * @param {string|null} reason     - optional elaboration (max 500 chars)
   */
  updateAlignment: async (isAligned, reason = null) => {
    try {
      const response = await api.post("/employment/alignment", {
        is_work_aligned: isAligned,
        work_aligned_reason: reason || null,
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Alignment summary grouped by department — for admin dashboard.
   * GET /admin/alumni/alignment/summary
   */
  getAlignmentSummary: async () => {
    try {
      const response = await api.get("/admin/alumni/alignment/summary");
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Per-alumni alignment detail for a specific department — drill-down.
   * GET /admin/alumni/alignment/detail/{departmentId}
   *
   * @param {number} departmentId
   * @param {number} page
   */
  getAlignmentDetail: async (departmentId, page = 1) => {
    try {
      const response = await api.get(
        `/admin/alumni/alignment/detail/${departmentId}`,
        { params: { page } },
      );
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default alumniService;
