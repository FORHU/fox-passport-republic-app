export const useAnnouncementAPI = () => {
  const { teamAdmin, teamLister, isUser } = useAccess();
  
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

  const computedTargetRecipients = () => {
    if(isUser){
      return "ALL,USERS_ONLY";
    } else if (teamLister) {
      return "ALL,VENUE_OWNERS_ONLY";
    } else if (teamAdmin) {
      return null
    } else {
      return null;
    }
  }

  const fetchAnnouncementList = async ({
    page = 1,
    limit = 10,
    search,
    sort,
    active_only,
    target_device,
    target
  }: {
    page: number;
    limit: number;
    search?: string | null;
    sort?: number;
    active_only?: boolean;
    target_device?: string | null;
    target?: string | null;
  }) => {

    const query = {
      page, limit,
      ...(search && {search}),
      ...(sort && {sort}),
      ...(active_only && {active_only}),
      ...(target_device && {target_device}),
      ...(target && {target}),
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
  };

  return {
    addAnnouncement,
    fetchAnnouncementList,
    fetchAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    addAnnouncementLog,
    computedTargetRecipients
  };
};
