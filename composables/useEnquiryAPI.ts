import { useAPI } from "./useAPI";

export const useEnquiryAPI = () => {
  const { setEnquiryData } = useEnquiryData();

  async function getEnquiryData(type: string) {
    const { data, error } = await useAPI(
      `/v1/enquiries${type != "" ? "?status=" + type : ""}`,
      {},
    );

    if (data.value) {
      setEnquiryData(data.value.data);
      return data.value.data;
    }
    if (error.value) {
      return error.value;
    }
  }

  return {
    getEnquiryData,
  };
};
