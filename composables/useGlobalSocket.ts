import { io, Socket } from "socket.io-client";
import { ref } from "vue";

export function useGlobalSocket() {
  const socket = useState("socket", (): Socket => {});
  const socketData = useState("socketData", () => []);
  let listenersAttached = false;

  const { currentUser, cookieOptions } = useLocalAuth();
  const config = useRuntimeConfig();
  const tenantCode = config.public.TENANT_CODE
  const tenantAPIKey = config.public.TENANT_API_KEY
  const accessToken = useCookie("accessToken", cookieOptions).value;
  const userRoomId = currentUser.value?.room_id



  async function connect() {
    if(!userRoomId) return;
    socket.value = io(`${config.public.API}/notifications`, {
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
        Tenant: tenantCode,
        "X-api-key": tenantAPIKey
      },
    });

    if (socket.value && !listenersAttached) {
      // Handle socket events
      socket.value.on("connect", () => {
        joinGlobalSocketRoom();
      });
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
      socket.value.emit(SOCKET_EVENTS.JOIN_NOTIFICATIONS_ROOM, { room_id: userRoomId });
    }
  }

  function addSocketListeners() {
    if (socket.value) {
      console.log('notification socket on executed!');
      socket.value.on(SOCKET_EVENTS.NOTIFICATION_COUNT, handleNotificationCount);
    }
  }


  function handleNotificationCount (data: any) {
    console.log('notification data', data);
  }


  function removeListener(event: any) {
    if (socket.value) {
      socket.value.removeListener(event);
    }
  }

  

  return {
    socket,
    connect
  };
}
