import { io, Socket } from "socket.io-client";
import { ref } from "vue";

export function useChat() {
  const socket = useState("socket", (): Socket => {});
  const conversation = useState("conversation", () => []);
  const chatKey = useState("chatKey", () => 0);
  const updateListKey = useState("updateListKey", () => 0);
  const socketEmitKey = useState("socketEmitKey", () => 0); // monitor any movement in the socket
  let listenersAttached = false;

  const { currentUser } = useLocalAuth();
  const config = useRuntimeConfig();
  const tenantCode = config.public.TENANT_CODE
  const tenantAPIKey = config.public.TENANT_API_KEY

  async function getMessages({ page = 1, limit = 10, room_id = "" } = {}) {
    // Example placeholder for useAPI function, replace with your actual API call
    return await useAPI("/v1/message-inbox", {
      query: { page, limit, room_id },
    });
  }

  async function connect(config: any, accessToken: string) {
    socket.value = io(config.API, {
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
        Tenant: tenantCode,
        "X-api-key": tenantAPIKey
      },
    });

    if (socket.value && !listenersAttached) {
      // Handle socket events
      socket.value.on("connect", () => {});

      addSocketListeners();
      listenersAttached = true;
      socket.value.on("disconnect", () => {
        location.reload(); // Reload the page on disconnect
      });
    }
  }

  function addSocketListeners() {
    if (socket.value) {
      socket.value.on(SOCKET_EVENTS.SEND_MESSAGE_ROOM, handleMessage);
      // socket.value.on(
      //   SOCKET_EVENTS.GENERATE_CUSTOM_OFFER,
      //   handleMessageCustomOffer,
      // );
      // socket.value.on(
      //   SOCKET_EVENTS.CUSTOM_OFFER_STATUS,
      //   handleMessageCustomStatus,
      // );
      // socket.value.on(
      //   SOCKET_EVENTS.REQUEST_PHONE_NUMBER,
      //   handleMessageRequestNumber,
      // );
    }
  }

  function handleMessage(data: any) {
    // Check if the message already exists in conversation

    if (!conversation.value.some((item) => item === data)) {
      conversation.value.push(data);
      if(currentUser.value?._id == data?.sender?._id){
        chatKey.value++
        
      }
      updateListKey.value++
      if (data.admin_generated) {
        socketEmitKey.value++;
      }
    }
  }

  function handleMessageCustomOffer(data: any) {
    // Check if the message already exists in conversation
    if (!conversation.value.some((item) => item === data)) {
      conversation.value.push(data);
      socket.value?.off(
        SOCKET_EVENTS.GENERATE_CUSTOM_OFFER,
        handleMessageCustomOffer,
      ); // Remove listener after emitting
    }
  }

  function handleMessageCustomStatus(data: any) {
    // Check if the message already exists in conversation
    if (!conversation.value.some((item) => item === data)) {
      conversation.value.push(data);
      socket.value?.off(
        SOCKET_EVENTS.CUSTOM_OFFER_STATUS,
        handleMessageCustomStatus,
      ); // Remove listener after emitting
    }
  }

  function handleMessageRequestNumber(data: any) {
    // Check if the message already exists in conversation

    if (!conversation.value.some((item) => item === data)) {
      conversation.value.push(data);
      socket.value?.off(
        SOCKET_EVENTS.REQUEST_PHONE_NUMBER,
        handleMessageRequestNumber,
      ); // Remove listener after emitting
    }
  }

  async function emitChat(event: string, data?: any) {
    if (socket.value) {
      switch (event) {
        case SOCKET_EVENTS.JOIN_ROOM:
          const { room_id } = data;
          socket.value.emit(SOCKET_EVENTS.JOIN_ROOM, { room_id });
          break;
        case SOCKET_EVENTS.SEND_MESSAGE_ROOM:
          socket.value.emit(SOCKET_EVENTS.SEND_MESSAGE_ROOM, data);
          break;
          break;
        case SOCKET_EVENTS.GENERATE_CUSTOM_OFFER:
          socket.value.emit(SOCKET_EVENTS.GENERATE_CUSTOM_OFFER, data);

          break;
        case SOCKET_EVENTS.CUSTOM_OFFER_STATUS:
          socket.value.emit(SOCKET_EVENTS.CUSTOM_OFFER_STATUS, data);

          break;
        case SOCKET_EVENTS.REQUEST_PHONE_NUMBER:
          socket.value.emit(SOCKET_EVENTS.REQUEST_PHONE_NUMBER, data);

          break;

        default:
        // Handle other cases as needed
      }
    }
  }

  function removeListener(event) {
    if (socket.value) {
      socket.value.removeListener(event);
    }
  }

  return {
    socket,
    conversation,
    chatKey,
    updateListKey,
    getMessages,
    connect,
    emitChat,
    removeListener,
    socketEmitKey,
  };
}
