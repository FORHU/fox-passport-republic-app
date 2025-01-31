export const useRatings = () => {

    const rates = useState((): number => 1);
    const privateNote = useState((): string => "");
    const publicNote = useState((): string => "");

    const getUserSpaceRating = async (spaceId: string) => {
        const { data, error } = await useAPI(`/v1/rating/${spaceId}`, {
          method: "GET",
        });
        if(data.value){
            const res = data.value as any;
            return res?.data
        }

        if(error.value){
            return Promise.reject(error.value)
        }
      };
    
      const getOverallSpaceRating = async (spaceId: string) => {
        const {data, error} = await useAPI(`/v1/rating/overall/${spaceId}`, {
          method: "GET",
        });

        if(data.value){
            const res = data.value as any;
            return res?.data
        }

        if(error.value){
            return Promise.reject(error.value)
        }
      };
    
      const submitRating = async (spaceId: string) => {
        try {
          const response = await useAPI(`/v1/rating/${spaceId}`, {
            method: "POST",
            body: {
              rating: rates.value,
              privateNote: privateNote.value,
              publicNote: publicNote.value,
            },
          });
          rates.value = 1;
          privateNote.value = "";
          publicNote.value = "";
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

      return {
        getUserSpaceRating,
        getOverallSpaceRating,
        submitRating,
        averageRatingValue
      }
}