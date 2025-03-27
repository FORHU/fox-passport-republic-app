export const useVerified = () => {

    const checkOwnerOnboardingStatus = async (userId: string) => {
        const {data, error} = await useAPI(`/v1/user/onboarding-status/${userId}`)

        if(data.value){
            const res = data.value as any;

            const objectData = res?.data as {is_email_verified: boolean, is_stripe_account_verified: boolean}
            // const isEmailVerified = objectData?.is_email_verified
            // const isStripeAccountVerified = objectData?.is_stripe_account_verified       
            return objectData  // Return true if both conditions are met. Otherwise, return false.
            
        }

        if(error.value){
            return Promise.reject(error.value)
        }
        
    }

    return {
        checkOwnerOnboardingStatus
    }
}