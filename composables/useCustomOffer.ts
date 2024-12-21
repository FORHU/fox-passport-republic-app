export const useCustomOffer = () => {


    const createCustomOffer = async (payload: TCreateCustomOfferPayload) => {
        return await useAPI("/v1/custom-offer", {
            method: "POST",
            body: JSON.stringify(payload),
          });
    }


    return {
        createCustomOffer
    }

}