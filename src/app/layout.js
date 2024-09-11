"use client";

import Header from "./layout/Header";
import Footer from "./layout/Footer";
import "./scss/main.scss";
import SmoothScrolling from "./layout/SmoothScrolling";
import { SessionProvider } from "next-auth/react";
import TransitionComponent from "./layout/TransitionComponent";
import { usePathname } from "next/navigation";
import ProtectedRoute from "./layout/ProtectedRoute";
import { useEffect } from "react";

export default function RootLayout({ children }) {

  const pathname = usePathname();
  const bodyClass = pathname === "/" ? "home" : pathname.replace(/\//g, "-").replace(/^-|-$/g, "");

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
}, []);

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