export const useVerify = () => {


    // verify email via activation link
       // verify email via OTP
   const verifyEmailToken = async (token: string) => {
    const {data, error} = await useAPI(`/v1/auth/verify-email/${token}`)

    if(data.value){
        return data.value
    }

    if(error.value){
        return Promise.reject(error.value?.data)
    }
   }
    

   // verify email via OTP
   const verifyEmail = async () => {
    const {data, error} = await useAPI(`/v1/auth/email-verification`)

    if(data.value){
        return data.value
    }

    if(error.value){
        return Promise.reject(error.value?.data)
    }
   }


   const validateOTP = async (otp_code: number) => {
    const {data, error} = await useAPI(`/v1/auth/validate-email-otp`,{
        method: 'PATCH',
        body: JSON.stringify({otp_code})
    })

    if(data.value){
        return data.value
    }

    if(error.value){
        return Promise.reject(error.value?.data)
    }
   }
   

   return {
    verifyEmail,
    validateOTP,
    verifyEmailToken
   }

}