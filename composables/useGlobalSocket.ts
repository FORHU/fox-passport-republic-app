import { io, Socket } from "socket.io-client";
import { ref } from "vue";

export function useGlobalSocket() {
  const socket = useState("global_socket", (): Socket => {});
  const socketData = useState("socketData", () => []);
  let listenersAttached = false;

  const { currentUser, cookieOptions } = useLocalAuth();
  const { inquiryBadgeCount, inquiryTypesArr } = useNotification();
  const config = useRuntimeConfig();
  const tenantCode = config.public.TENANT_CODE
  const tenantAPIKey = config.public.TENANT_API_KEY
  const accessToken = useCookie("accessToken", cookieOptions).value;
  const userRoomId = currentUser.value?.room_id



  async function connect() {
    if(!userRoomId) return;
    socket.value = io(config.public.API, {
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
        Tenant: tenantCode,
        "X-api-key": tenantAPIKey
      },
    });

    if (socket.value && !listenersAttached) {
      // Handle socket events
      socket.value.on("connect", () => {
      });
      joinGlobalSocketRoom();
      addSocketListeners();
      listenersAttached = true;
      socket.value.on("disconnect", () => {
        // location.reload(); // Reload the page on disconnect
      });
    }
  }

  function joinGlobalSocketRoom () {
    if(!userRoomId) return;
    if(socket.value){   
      socket.value.emit(SOCKET_EVENTS.JOIN_ROOM, { room_id: userRoomId });
    }
  }

  function addSocketListeners() {
      // console.log('notification socket on executed!');
      socket.value.on(SOCKET_EVENTS.NOTIFICATION_COUNT, handleNotificationCount);
  }


  function handleNotificationCount (data: any) {
    const totalUnreadCount = data?.data?.totalUnreadCount || 0;    
    const totalInquiryUnreadCount = data?.data?.unreadCountsByType?.reduce((accumulator: any, currentItem: any) => {
      // Add condition before adding the count
        if (inquiryTypesArr.includes(currentItem?.type)) {
          return accumulator + (currentItem?.count || 0);
        }
        return accumulator;
    }, 0);
    inquiryBadgeCount.value = totalInquiryUnreadCount;
  }


  function removeAllListener() {
    if (socket.value) {
      socket.value.removeAllListeners();
    }
  }

  async function emitGlobalSocket(event: string, data?: any) {
    if (socket.value) {
      switch (event) {
        case SOCKET_EVENTS.NOTIFICATION_COUNT:
          const { custom_offer_id } = data;
          if(!custom_offer_id) return;
          socket.value.emit(SOCKET_EVENTS.NOTIFICATION_COUNT, { custom_offer_id });
          break;
        default:
        // Handle other cases as needed
      }
    }
  }

  

  return {
    socket,
    connect,
    removeAllListener,
    emitGlobalSocket
  };
}
