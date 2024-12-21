import { useAPI } from "./useAPI";

export const useSettingAPI = () => {

  const showSettingDrawer = useState('showSettingDrawer', (): boolean => false);
  const supportedCountriesArray = useState('supportedCountriesArray', (): any[] => []);

  async function getCountrySetting() {
    const { data, error } = await useAPI(`/v1/country-settings`);

    if (data.value) {
      const res = data.value as any;
      return res.data;
    }
    if (error.value) {
      return error.value;
    }
  }

  // country list with pagination
  async function getCountryList(page: number = 1, limit: number = 10, search: string | null = null) {

    let query: any = {
      page, limit
    }

    if(search){
      query.search = search;
    }

    const { data, error } = await useAPI(`/v1/country-settings/list`, {
      query
    });

    if (data.value) {
      return data.value;
    }
    if (error.value) {
      return error.value;
    }
  }

  async function getCountry(country: string) {
    const { data, error } = await useAPI(`/v1/country-settings/${country}`);

    if (data.value) {
      const res = data.value as any;
      return res.data;
    }
    if (error.value) {
      return error.value;
    }
  }

  const addCountry = async (payload: any) => {
    return await useAPI(`/v1/country-settings`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const editCountry = async (payload: any, id: string) => {
    return await useAPI(`/v1/country-settings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  const deleteCountry = async (id: any) => {
    return await useAPI(`/v1/country-settings/${id}`, {
      method: "DELETE",
    });
  };





  return {
    supportedCountriesArray,
    showSettingDrawer,
    getCountrySetting,
    addCountry,
    getCountry,
    editCountry,
    deleteCountry,
    getCountryList
  };
};
