
export const useNotification = () => {


  const inquiryBadgeCount = useState('inquiryBadgeCount', () => 0);
  const inquiryTypesArr = [
    "INQUIRY",
    "BOOKING_CONFIRMED",
    "BOOKING_CANCELLED",
    "CUSTOM_OFFER",
    "CUSTOM_OFFER_CANCELLED",
  ]

  const getNotifications = async () => {
    const {data, error} = await useAPI('/v1/notifications')

    if(data.value){
      const res = data.value as any;
      return res?.data
    } 

    if(error.value){
      return Promise.reject(error.value)
    }
  } 

  const computeBadgeCount = async () => {
    try {
      const res: any = await getNotifications();
      if(res){
        //  const totalUnreadCount = res?.totalUnreadCount || 0;
        const totalInquiryUnreadCount = res?.unreadCountsByType?.reduce((accumulator: any, currentItem: any) => {
        // Add condition before adding the count
          if (inquiryTypesArr.includes(currentItem?.type)) {
            return accumulator + (currentItem?.count || 0);
          }
          return accumulator;
      }, 0);
        inquiryBadgeCount.value = totalInquiryUnreadCount;
      }
      
   } catch (error) {
      console.log('error fetching notifications',  error);
   }
  }

  return {
    getNotifications,
    inquiryBadgeCount,
    computeBadgeCount,
    inquiryTypesArr
  }
}
