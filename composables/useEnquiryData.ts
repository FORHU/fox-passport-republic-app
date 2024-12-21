export const useEnquiryData = () => {
  const enquiryData = useState("enquiryData", () => {});
  function setEnquiryData(data: any) {
    enquiryData.value = data;
  }

  return {
    enquiryData,
    setEnquiryData,
  };
};
