export const useAnnouncementAPI = () => {
  const addAnnouncement = async (payload: any) => {
    return await useAPI(`/v1/admin/announcements`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const addAnnouncementLog = async (payload: any) => {
    return await useAPI(`/v1/admin/announcement-logs`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const updateAnnouncement = async (payload: any, id: string) => {
    return await useAPI(`/v1/admin/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  const deleteAnnouncement = async (id: any) => {
    return await useAPI(`/v1/admin/announcements/${id}`, {
      method: "DELETE",
    });
  };


  const fetchAnnouncementList = async ({
    page = 1,
    limit = 10,
    search,
    sort,
    active_only,
  }: {page: number, limit: number, search: string | null, sort: number | null, active_only?: boolean}) => {
    const query: any = {
      page,
      limit,
    };
  
    if (search) {
      query.search = search;
    }
  
    if (sort) {
      query.sort = sort;
    }
  
    if (active_only !== undefined) {
      query.active_only = active_only;
    }
  
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

  const fetchAnnouncementById = async (id: string) => {
    let query: any = {
      _id: id,
    };

    const { data, error } = await useAPI(`/v1/admin/announcements`, {
      query,
    });

    if (data.value) {
      const res = data.value as any;
      return res.data;
    }
    if (error.value) {
      return Promise.reject(error.value);
    }
  };

  return {
    addAnnouncement,
    fetchAnnouncementList,
    fetchAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    addAnnouncementLog,
  };
};
