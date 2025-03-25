
export const useNotification = () => {


  const inquiryBadgeCount = useState('inquiryBadgeCount', () => 0);

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
       const totalInquiryUnreadCount = res?.unreadCountsByType?.find((x: any) => x.type =="INQUIRY")?.count || 0;
       inquiryBadgeCount.value = totalInquiryUnreadCount;
      }
      
   } catch (error) {
      console.log('error fetching notifications',  error);
   }
  }

  return {
    getNotifications,
    inquiryBadgeCount,
    computeBadgeCount
  }
}
