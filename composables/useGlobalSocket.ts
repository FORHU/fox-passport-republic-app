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



  async function connect() {
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
        console.log('socket connected!', socket.value);
        // socket.value.emit("join_room", { room_id: currentUser.value._id });
      });
      addSocketListeners();
      listenersAttached = true;
      socket.value.on("disconnect", () => {
        // location.reload(); // Reload the page on disconnect
      });
    }
  }

  function addSocketListeners() {
    if (socket.value) {
      console.log('notification socket on executed!');
      socket.value.on(SOCKET_EVENTS.NOTIFICATION_COUNT, handleNotificationCount);
    }
  }


  function handleNotificationCount (data: any) {
    console.log('handleNotificationCount ran!!')
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
