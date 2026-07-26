import { io } from "socket.io-client";

const isBrowser = typeof window !== "undefined";
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const socket = io(socketUrl, {
  autoConnect: isBrowser,
});
