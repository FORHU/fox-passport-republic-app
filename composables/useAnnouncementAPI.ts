import { useAPI } from "./useAPI";

export const useAnnouncementAPI = () => {
  const addAnnouncement = async (payload: any) => {
    return await useAPI(`/v1/admin/announcements`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const fetchAnnouncementList = async (
    page: number = 1,
    limit: number = 10
  ) => {
    let query: any = {
      page,
      limit,
    };

    const { data, error } = await useAPI(`/v1/admin/announcements`, {
      query,
    });

    if (data.value) {
      const res = data.value as any;
      return res.data;
    }
    if (error.value) {
      return error.value;
    }
  };

  return {
    addAnnouncement,
    fetchAnnouncementList,
  };
};
