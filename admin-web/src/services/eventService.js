import api from "./api";

const eventService = {
  /**
   * Get all visible events
   */
  getAll: async (filters = {}) => {
    try {
      const response = await api.get("/events", { params: filters });
      return response.data; // ✅ return the full { data, meta, links } object
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get single event
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create event
   */
  create: async (data) => {
    try {
      // If payload contains File/Array of Files, submit as multipart/form-data
      const hasFiles = Object.values(data).some((v) =>
        Array.isArray(v)
          ? v.some((i) => i instanceof File)
          : v instanceof File || v instanceof FileList,
      );

      if (hasFiles) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") return;

          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
            return;
          }

          if (value instanceof FileList) {
            Array.from(value).forEach((file) =>
              formData.append(`${key}[]`, file),
            );
            return;
          }

          if (value instanceof File) {
            formData.append(key, value);
            return;
          }

          formData.append(key, value);
        });

        const response = await api.post("/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
      }

      const response = await api.post("/events", data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update event
   */
  update: async (id, data) => {
    try {
      const hasFiles = Object.values(data).some((v) =>
        Array.isArray(v)
          ? v.some((i) => i instanceof File)
          : v instanceof File || v instanceof FileList,
      );

      if (hasFiles) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") return;

          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
            return;
          }

          if (value instanceof FileList) {
            Array.from(value).forEach((file) =>
              formData.append(`${key}[]`, file),
            );
            return;
          }

          if (value instanceof File) {
            formData.append(key, value);
            return;
          }

          formData.append(key, value);
        });

        const response = await api.post(`/events/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          params: { _method: "PATCH" },
        });
        return response.data.data;
      }

      const response = await api.patch(`/events/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete event
   */
  delete: async (id) => {
    try {
      await api.delete(`/events/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default eventService;
