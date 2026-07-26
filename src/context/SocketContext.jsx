"use client";

import { getStorageItem, setStorageItem, removeStorageItem } from "@/utils/storage";

import React, { createContext, useEffect } from "react";
import { socket } from "../utils/socket";

export { socket };
export const SocketContext = createContext(socket);

export function SocketProvider({ children }) {
  useEffect(() => {
    // Add debugging listeners
    socket.on("connect", () => console.log("✅ Partner Socket Connected! ID:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Partner Socket Connection Error:", err.message));
    socket.on("disconnect", (reason) => console.log("⚠️ Partner Socket Disconnected. Reason:", reason));

    const token = getStorageItem("partnerAccessToken");
    if (token) {
      socket.auth = { token };
      socket.connect();
    } else {
      console.log("No partner token found, socket will not connect.");
    }

    const handleUpdate = () => {
      const updatedToken = getStorageItem("partnerAccessToken");
      if (updatedToken) {
        socket.auth = { token: updatedToken };
        if (!socket.connected) {
          socket.connect();
        }
      } else {
        socket.disconnect();
      }
    };

    window.addEventListener("partner-login", handleUpdate);
    window.addEventListener("partner-logout", handleUpdate);

    return () => {
      window.removeEventListener("partner-login", handleUpdate);
      window.removeEventListener("partner-logout", handleUpdate);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
