import api from "./api";

const reactionService = {
  reactToAnnouncement: async (id, type) => {
    const response = await api.post(`/announcements/${id}/reaction`, { type });
    return response.data.data;
  },

  reactToEvent: async (id, type) => {
    const response = await api.post(`/events/${id}/reaction`, { type });
    return response.data.data;
  },
};

export default reactionService;
