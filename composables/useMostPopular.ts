export const useMostPopular = () => {

    const getMostPopular = async ({ location = 'SG', status = 'PUBLISHED', limit = 10, page = 1 }) => {


        const {data, error} =  await useAPI('/v2/space/most-popular', {
            query: {
                status,
                location,
                page,
                limit,
                fully_verified: true,
              },
        })
        if(data.value){
            const res = data.value as any;
            return res?.data
        }

        if(error.value){
            return Promise.reject(error.value)
        }
    }

    return {
        getMostPopular
    }
}