export const useRatings = () => {

  const getUserSpaceRating = async (spaceId: string) => {
    const { data, error } = await useAPI(`/v1/rating/${spaceId}`, {
      method: "GET",
    });
    if (data.value) {
      const res = data.value as any;
      return res?.data;
    }

    if (error.value) {
      return Promise.reject(error.value);
    }
  };

  const getOverallSpaceRating = async (spaceId: string) => {
    const { data, error } = await useAPI(`/v1/rating/overall/${spaceId}`, {
      method: "GET",
    });

    if (data.value) {
      const res = data.value as any;
      return res?.data;
    }

    if (error.value) {
      return Promise.reject(error.value);
    }
  };

  const submitRating = async ({spaceId, rating, privateNote, publicNote} : {spaceId: string, rating: number, privateNote: string, publicNote: string}) => {
    try {
      const response = await useAPI(`/v1/rating/${spaceId}`, {
        method: "POST",
        body: {
          rating,
          privateNote,
          publicNote,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // get averageRating value only in number
  const averageRatingValue = async (spaceId: string) => {
    const { data } = await getUserSpaceRating(spaceId);

    const res = data.value as any;
    if (!res) return null;
    const rating = res?.data?.[0]?.averageRating;
    return rating;
  };

  //get admin list of ratings
  const getAdminRatingsList = async (
    page: number,
    limit: number,
  ) => {
    let params: any = {
      page,
      limit,
    };

    const { data, error } = await useAPI(`/v1/admin/ratings`, {
      params,
    });
    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return error.value;
    }
  }

  return {
    getUserSpaceRating,
    getOverallSpaceRating,
    submitRating,
    averageRatingValue,
    getAdminRatingsList
  };
};
