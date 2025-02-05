// const { loggedIn } = useLocalAuth();

export function useFavorites() {
  const addNewFavoriteFolder = async (
    space_id: string,
    folder_name: string
  ) => {
    return await useAPI("/v1/favorite", {
      method: "POST",
      body: JSON.stringify({
        space_id: space_id,
        folder_name: folder_name,
      }),
    });
  };

  const addNewFavoriteAToExistingFolder = async (
    space_id: string,
    favorite_folder_id: string
  ) => {
    return await useAPI("/v1/favorite", {
      method: "POST",
      body: JSON.stringify({
        space_id: space_id,
        favorite_folder_id: favorite_folder_id,
      }),
    });
  };

  const getListOfFolders = async (spaceId: string) => {
    return await useAPI(`/v1/favorite/folders`, {
      method: "GET",
      params: {
        // space_id: spaceId,
      },
    });
  };

  const getGroupOfFavorites = async (spaceId: string) => {
    return await useAPI(`/v1/favorite/group-favorite`, {
      method: "GET",
      params: {
        // space_id: spaceId,
      },
    });
  };

  const updateFavoritesFolder = async (
    favorite_folder_id: string,
    favoriteId: string
  ) => {
    return await useAPI(`/v1/favorite/assign-folder/${favoriteId}`, {
      method: "PATCH",
      body: JSON.stringify({
        // space_id: spaceId,
        favorite_folder_id: favorite_folder_id,
      }),
    });
  };

  const updateFavoritesFolderName = async (
    spaceId: string,
    folder_name: string,
    favoriteId: string
  ) => {
    return await useAPI(`/v1/favorite/assign-folder/${favoriteId}`, {
      method: "PATCH",
      body: JSON.stringify({
        space_id: spaceId,
        folder_name: folder_name,
      }),
    });
  };

  const getSpacesOnFolderFavorite = async (
    page: number,
    limit: number,
    folder_id: string
  ) => {
    const url = `/v1/favorite/folders/${folder_id}?page=${page}&limit=${limit}`;
    return await useAPI(url, {
      method: "GET",
    });
  };

  const getRecentlyViewed = async (page: number, limit: number) => {
    const action = "VIEW_SPACE";
    const url = `/v1/favorite/view-logs/?page=${page}&limit=${limit}?action=${action}`;
    return await useAPI(url, {
      method: "GET",
    });
  };

  const removeRecentlyViewed = async (user_log_id: string) => {
    // const action ="VIEW_SPACE"
    const url = `/v1/favorite/view-logs/${user_log_id}`;
    return await useAPI(url, {
      method: "DELETE",
      // params: {
      //   user_log_id: user_log_id,

      // }
    });
  };

  const renameFavoriteFolder = async (
    favorite_folder_id: string,
    folder_name: string
  ) => {
    const url = `/v1/favorite/folders/${favorite_folder_id}`;
    return await useAPI(url, {
      method: "PATCH",
      body: JSON.stringify({
        folder_name: folder_name,
      }),
    });
  };

  const deleteFavoriteFolder = async (favorite_folder_id: string) => {
    const url = `/v1/favorite/folders/${favorite_folder_id}`;
    return await useAPI(url, {
      method: "DELETE",
      // params: {
      //   folder_name: folder_name,

      // }
      // body: JSON.stringify({
      //   folder_name:folder_name
      // })
    });
  };

  const deselectFavorites = async (favoriteId: string) => {
    await useAPI(`/v1/favorite/${favoriteId}`, {
      method: "PATCH",
      body: JSON.stringify({
        marked_as_favorite: false,
      }),
    });
  };

  return {
    addNewFavoriteFolder,
    getListOfFolders,
    getGroupOfFavorites,
    updateFavoritesFolder,
    updateFavoritesFolderName,
    addNewFavoriteAToExistingFolder,
    getSpacesOnFolderFavorite,
    getRecentlyViewed,
    removeRecentlyViewed,
    renameFavoriteFolder,
    deleteFavoriteFolder,
    deselectFavorites,
  };
}
