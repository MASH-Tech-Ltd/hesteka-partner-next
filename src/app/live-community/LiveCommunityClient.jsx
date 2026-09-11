"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { io } from "socket.io-client";
import { PawPrint } from "lucide-react";
import axios from "axios";
import { Erica_One, Barlow_Condensed } from "next/font/google";

const ericaOne = Erica_One({
  weight: "400",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function LiveCommunityClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // For animated counting
  const countValue = useMotionValue(0);
  const displayCount = useTransform(countValue, (latest) => Math.round(latest));

  useEffect(() => {
    // Fetch initial data
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"}/api/v1/user/community/live-count`,
        );
        if (res.data && res.data.status === "ok") {
          setData(res.data.data);
          animate(countValue, res.data.data.count, {
            duration: 2,
            ease: "easeOut",
          }); // Animate from 0 to current count
        }
      } catch (error) {
        console.error("Failed to fetch initial count", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Socket setup
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
        query: { isGuest: "true" },
      },
    );

    setIsConnected(socket.connected);
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("communityCountUpdate", (newData) => {
      setData((prev) => {
        if (!prev) return newData;
        // Animate from prev.count to newData.count
        animate(countValue, newData.count, { duration: 1.5, ease: "easeOut" });
        return newData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [countValue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBE0CD]">
        <div className="w-12 h-12 border-4 border-[#B95B30] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { count, goal, partnersCount } = data || {
    count: 0,
    goal: 5000,
    partnersCount: 0,
  };
  const percentage = Math.min((count / goal) * 100, 100);
  const remaining = Math.max(goal - count, 0);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F3E6CC] relative overflow-hidden text-[#B95B30] ${barlowCondensed.className}`}
    >
      <div className="w-full max-w-[1500px] mx-auto flex flex-col min-h-screen relative z-10">
        {/* Top Header */}
        <div className="w-full flex justify-between items-center px-4 pt-8 pb-4">
          <div className="flex items-center">
            <Image
              src="/OrangeLogo.png"
              alt="Hesteka"
              width={120}
              height={25}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
          <div>
            <a
              href="https://hesteka.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full text-xl font-bold bg-[#B95B30] text-[#EBE0CD] transition-colors tracking-wide"
            >
              hesteka.com
            </a>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 -mt-10">
          <p className="text-[#A78B71] text-[15px] md:text-[17px] mb-2 tracking-wide">
            La communauté, en direct
          </p>

          {/* Animated Count */}
          <motion.h1
            className={`text-[120px] md:text-[170px] text-[#B95B30] tracking-widest leading-none mb-4 ${ericaOne.className}`}
            style={{
              textShadow: "5px 5px 0px rgba(0,0,0,0.08)",
            }}
          >
            <motion.span>{displayCount}</motion.span>
          </motion.h1>

          <div className="text-2xl md:text-3xl text-[#A78B71] font-bold text-center mb-10 leading-tight">
            <p>personnes réunies autour des animaux</p>
            <p>perdus, trouvés et blessés</p>
          </div>

          {/* Progress Section */}
          <div className="w-full max-w-[500px] mx-auto flex flex-col items-center">
            <p className="text-[15px] mb-3 text-[#343a40] tracking-wide flex items-center justify-center gap-1">
              Objectif :{" "}
              <span className="text-[#B95B30] font-semibold">
                {goal.toLocaleString("fr-FR")} membres
              </span>
              . Voici où on en est
              <span className="inline-flex relative items-center justify-center w-3 h-3 ml-1">
                {isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
                )}
              </span>
            </p>

            <div className="relative w-full h-[34px] bg-[#E8DAC2] rounded-full shadow-inner mb-2 flex items-center border border-[#D5C2A7]">
              {/* Progress Bar Fill */}
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #8C3913 0%, #C85C2B 100%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Paw Icon positioned at the end of progress */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                initial={{ left: 0 }}
                animate={{ left: `calc(${percentage}% - 22px)` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div className="bg-[#FDF5E6] rounded-full p-1.5 shadow-sm z-10 border-2 border-[#B95B30]">
                  <PawPrint
                    className="text-[#B95B30] w-7 h-7"
                    fill="currentColor"
                  />
                </div>
              </motion.div>
            </div>

            <div className="w-full flex justify-between text-[13px] font-bold text-[#B95B30] mb-8 px-1">
              <span>0</span>
              <span>{goal.toLocaleString("fr-FR")}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm text-[15px] font-bold border border-[#E8DAC2] mb-12">
              <PawPrint
                className="w-4 h-4 text-[#5C4D43]"
                fill="currentColor"
              />
              <span className="text-[#5C4D43]">Plus que</span>{" "}
              <span className="text-[#B95B30]">
                {remaining.toLocaleString("fr-FR")}
              </span>{" "}
              <span className="text-[#5C4D43]">avant l'objectif</span>
            </div>

            {/* Subtext info */}
            <div className="flex gap-4 text-[13px] font-semibold text-[#8A7A6E] tracking-wide">
              <span>{partnersCount} partenaires</span>
              <span>-</span>
              <span>Lancée le 26 juin 2026</span>
              <span>-</span>
              <span>Partout en France</span>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="w-full px-4 pb-8 pt-6 border-t border-[#D5C2A7]/50 flex justify-between items-end mt-auto">
          <div className="max-w-[400px] text-[12px] font-regular text-[#A78B71] leading-relaxed">
            <p>
              Tout a commencé avec la disparition d'Uggy. Aujourd'hui, c'est une
              communauté entière qui cherche, retrouve et veille les uns sur les
              autres.
            </p>
          </div>
          <button className="px-7 py-2.5 bg-[#B95B30] text-[#EBE0CD] rounded-full text-[15px] font-bold shadow-sm hover:bg-[#8C3913] transition-colors">
            Télécharge Hesteka
          </button>
        </div>
      </div>
    </div>
  );
}
