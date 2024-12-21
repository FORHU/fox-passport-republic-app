export const useSubscription = () => {


    interface IPricingQuery {
        country: string;
    }

    const getPricing = async ({country}: IPricingQuery) => {
       const { data, error } =  await useAPI(`/v1/subscription/products/?country=${country}`);
       if (error.value){
        const message = error.value?.data?.message
        throw new Error(message as any);
       } return data as any;
    }


    interface ISubscriptionQuery {
        venue_id: string;
        price_id: string;
        space_number: number

    }
    const createSubscription = async (payload: ISubscriptionQuery) => {
        const { data, error } =  await useAPI('/v1/subscription', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
       if (error.value){
        const message = error.value?.data?.message
        throw new Error(message as any);
       } return data as any;

    }

    const getSubscription = async (venueId: string) => {
        const { data, error } =  await useAPI('/v1/subscription', {
            query: {venueId}
        });
       if (error.value){
        const message = error.value?.data?.message
        throw new Error(message as any);
       } return data as any;
    }


    const updateSubscription = async(subscriptionId: string, space_number: number) => {
        const { data, error } = await useAPI(`/v1/subscription/${subscriptionId}`, {
            method: 'PATCH',
            body: JSON.stringify({space_number})
        })

        if(error.value){
            const message = error.value?.data?.message
            if(message){
                throw new Error(message as any);
            } else {
                throw new Error('Something went wrong. Please try again later.');
            }
        } return data as any;

    }

    return {
        getPricing,
        createSubscription,
        getSubscription,
        updateSubscription
    }
}