"use client";

import Header from "./components/layout/header/Header";
import "./scss/main.scss";
import SmoothScrolling from "./components/layout/SmoothScrolling";
import { SessionProvider } from "next-auth/react";
import TransitionComponent from "./components/layout/TransitionComponent";
import { usePathname } from "next/navigation";
import ProtectedRoute from "./components/layout/ProtectedRoute";

export default function RootLayout({ children }) {

  const pathname = usePathname();
  const bodyClass = pathname === "/" ? "home" : pathname.replace(/\//g, "-").replace(/^-|-$/g, "");

  return (
    <html lang="en">
      <head></head>
      <body className={bodyClass}>
        <SessionProvider>
          <Header />
          <SmoothScrolling>
            <TransitionComponent>
              <ProtectedRoute>
                <main aria-label="Main content" className="position-relative">
                  {children}
                </main>
              </ProtectedRoute>
            </TransitionComponent>
          </SmoothScrolling>
          {/* <Footer /> */}
        </SessionProvider>
      </body>
    </html>
  );
}