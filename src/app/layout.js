"use client";

import Header from "@/app/components/layout/header/Header";
import "./scss/main.scss";
import SmoothScrolling from "@/app/components/layout/SmoothScrolling";
import { SessionProvider } from "next-auth/react";
import TransitionComponent from "@/app/components/layout/TransitionComponent";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/app/components/layout/ProtectedRoute";
import FileViewerModal from "@/app/components/dam/FileViewerModal";
import { createContext, useState } from "react";
import ChatBot from "./components/Chat";
import { FolderProvider } from "./context/FolderContext";
import { ToastProvider } from "./context/ToastContext";

export const FileViewerContext = createContext();

export default function RootLayout({ children }) {

  const pathname = usePathname();
  const bodyClass = pathname === "/" ? "home" : pathname.replace(/\//g, "-").replace(/^-|-$/g, "");

  const [show, setShow] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const openModal = (file) => {
    setCurrentFile(file);
    setShow(true);
  };
  
  const closeModal = () => {
    setShow(false);
    setCurrentFile(null);
  };

  return (
    <html lang="en">
      <head></head>
      <body className={bodyClass}>
        <SessionProvider>
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
        </SessionProvider>
      </body>
    </html>
  );
}