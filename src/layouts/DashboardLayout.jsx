"use client";

import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import FCMListener from "../components/common/FCMListener";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { SocketProvider } from "../context/SocketContext";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <SocketProvider>
        <div className="flex h-screen bg-[#fcfaf7] text-[#3a2a1a] overflow-hidden">
          {/* Background FCM Listener to auto-register token & reload notifications */}
          <FCMListener />

          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden transition-all duration-300"
            />
          )}

          {/* Main Content Pane */}
          <div className="flex-1 flex flex-col md:pl-64 h-full overflow-hidden transition-all duration-300">
            <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
              {children}
            </main>
          </div>
        </div>
      </SocketProvider>
    </ProtectedRoute>
  );
}

