"use client";

import Header from "@/app/components/layout/header/Header";
import "./scss/main.scss";
import SmoothScrolling from "@/app/components/layout/SmoothScrolling";
import { SessionProvider } from "next-auth/react";
import TransitionComponent from "@/app/components/layout/TransitionComponent";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/app/components/layout/ProtectedRoute";
import FileViewerModal from "@/app/components/dam/FileViewerModal";
import { createContext, useEffect, useState } from "react";
import ChatBot from "./components/Chat";
import { FolderProvider } from "./context/FolderContext";
import { ToastProvider } from "./context/ToastContext";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Analytics } from '@vercel/analytics/next';

export const FileViewerContext = createContext();

const queryClient = new QueryClient();



export default function RootLayout({ children }) {


  const pathname = usePathname();
  const bodyClass = pathname === "/" ? "home" : pathname.replace(/\//g, "-").replace(/^-|-$/g, "");

  const [show, setShow] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const openModal = (file) => {
    setCurrentFile(file);
    setShow(true);
  };
  
  const closeModal = () => {
    setShow(false);
    setCurrentFile(null);
  };

    useEffect(() => {
      if (typeof window !== "undefined" && !window.MusicKit) {
        const script = document.createElement("script");
        script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
        script.async = true;
        script.onload = () => {
          window.MusicKit.configure({
            developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_TOKEN,
            app: { name: "HoverPlay", build: "1.0.0" },
          });
        };
        document.body.appendChild(script);
      }
    }, []);

  return (
    <html lang="en">
      <head>
        <title>Business Development Portal | Blackberg Group</title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={bodyClass}>
        <SessionProvider>
        <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <FolderProvider>
          <FileViewerContext.Provider value={{ openModal, closeModal }}>
            <Header />
          
              <TransitionComponent>
                <ProtectedRoute>
                  <main aria-label="Main content" className="position-relative">
                    {children}
                  </main>
                </ProtectedRoute>
              </TransitionComponent>
   
            {show && currentFile && (
              <FileViewerModal show={show} handleClose={closeModal} fileData={currentFile} />
            )}
          </FileViewerContext.Provider>
          {pathname.includes("/dev") && (
              <div className="position-fixed end-0 bottom-0 me-6">
                <ChatBot />
              </div>
            )}
            </FolderProvider>
            </ToastProvider>
            </QueryClientProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}