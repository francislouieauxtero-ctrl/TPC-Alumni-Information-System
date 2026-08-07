import api from "./api";

const announcementService = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get("/announcements", { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          return;
        }

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

      const response = await api.post("/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          return;
        }

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

      const response = await api.post(`/announcements/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { _method: "PATCH" },
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default announcementService;
