"use client";

import { getStorageItem, setStorageItem, removeStorageItem } from "@/utils/storage";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getStorageItem("partnerAccessToken");
    let user = null;
    try {
      user = JSON.parse(getStorageItem("partnerUser"));
    } catch (e) {}

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "partners") {
      removeStorageItem("partnerAccessToken");
      removeStorageItem("partnerRefreshToken");
      removeStorageItem("partnerUser");
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcfaf7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a2a1a]"></div>
      </div>
    );
  }

  return children;
}
