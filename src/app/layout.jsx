import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ApiCacheProvider } from "@/context/ApiCacheContext";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "HESTEKA - Partner Dashboard",
  description: "Secure partner management portal for HESTEKA organization partners.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#fcfaf7] text-[#3a2a1a] antialiased">
        <LanguageProvider>
          <ApiCacheProvider>
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </ApiCacheProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
