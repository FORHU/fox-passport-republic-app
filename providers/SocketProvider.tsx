"use client";

import {useEffect} from "react";
import {useAuthStore} from "../store/useAuthStore";
import {disconnectSocket, connectSocket} from "../lib/socket";
import {useNotificationStore} from "../features/notifications/store/useNotificationStore";
import {toast} from "sonner";

export function SocketProvider({children}: {children: React.ReactNode}) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            disconnectSocket(); 
            return;
        }

        const socket = connectSocket(accessToken);
        socket.connect();

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("new_notification", (notification) => {
            console.log("Received notification:", notification);
            addNotification(notification);
            toast.info(notification.message, {
                description: notification.description,
            });
        });

        socket.on("disconnect", (reason: string) => {
            console.log("Socket disconnected:", reason);
        });

        return () => {
            socket.off("connect");
            socket.off("new_notification");
            socket.off("disconnect");
            disconnectSocket();
        }
    }, [isAuthenticated, accessToken, addNotification]);

    return <>{children}</>;
}   
