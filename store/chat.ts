import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { useSessionStore } from "./session";
import { useInboxStore } from "./inbox";
import { SOCKET_EVENTS } from "~/utils/constant";

export const useChatStore = defineStore({
  id: "chat",
  state: () => ({
    socket: null as Socket | null,
    messages: [] as any,
    total_items: 0 as any,
  }),
  actions: {
    async init($axios: any, limit: number, room_id: string) {
      await this.updateMessagesFromInboxes($axios, { limit, room_id });
    },
    async updateMessagesFromInboxes(
      $axios: any,
      query: { limit: number; room_id: string },
    ) {
      try {
        this.messages = [];
        const messages = await useInboxStore().getInboxes($axios, query);
        const data = messages["data"]["data"];
        console.log("HELLO CHECK", messages);

        this.messages.push(...data);
        this.total_items = messages.data.total_items;
        console.log();
      } catch (error) {
        console.error("Error fetching inboxes:", error);
      }
    },
    connect(config: any) {
      // const config2 = useRuntimeConfig().public;
      const cookieOptions = {
        domain: config.DOMAIN,
        secure: true,
        maxAge: 30 * 24 * 60 * 60,
      };

      const accessToken = useCookie("accessToken", cookieOptions).value;
      this.socket = io(config.API, {
        extraHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      }) as Socket;

      if (this.socket) {
        this.socket.on("connect", () => {});
        this.addSocketListeners();
      }
      return this.socket;
    },
    addSocketListeners() {
      if (this.socket) {
        this.socket.on(SOCKET_EVENTS.SEND_MESSAGE_ROOM, (data: any) => {
          this.messages.unshift(data);
        });
      }
    },
    emitChat(event: string, data?: any) {
      if (this.socket) {
        if (event === SOCKET_EVENTS.JOIN_ROOM) {
          const { room_id } = data;
          this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, { room_id });
        } else if (event === SOCKET_EVENTS.SEND_MESSAGE_ROOM) {
          this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE_ROOM, data);
        }
      }
    },
  },
});
