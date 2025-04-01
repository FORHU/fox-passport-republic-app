export const useAnnouncementAPI = () => {
  const addAnnouncement = async (payload: any) => {
    return await useAPI(`/v1/admin/announcements`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const updateAnnouncement = async (payload: any, id: string ) => {
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

  const fetchAnnouncementList = async (
    page: number = 1,
    limit: number = 10,
    search?: string | null,
    sort? : number | null
  ) => {
    let query: any = {
      page,
      limit,
    };

    if(search){
      query.search = search;
    }

    if(sort){
      query.sort = sort;
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
      return error.value;
    }
  }

  return {
    addAnnouncement,
    fetchAnnouncementList,
    fetchAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
  };
};
