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
    searchSpace: string | null,
    status: string | null,
    rating: number | null,
    sort: string | null
  ) => {
    let params: any = {
      page,
      limit,
    };

    if(searchSpace){
      params.search = searchSpace;
    }

    if(status){
      params.status = status;
    }

    if(rating){
      params.rating = rating;
    }

    if(sort){
      params.sort = sort;
    }

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

  const updateRatingStatus = async (ratingID: string, status: string) => {
    try {
      const response = await useAPI(`/v1/admin/rating/${ratingID}`, {
        method: "PATCH",
        body: {
          status: status,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    getUserSpaceRating,
    getOverallSpaceRating,
    submitRating,
    averageRatingValue,
    getAdminRatingsList,
    updateRatingStatus
  };
};
