"use client";

import Header from "./layout/Header";
import Footer from "./layout/Footer";
import "./scss/main.scss";
import SmoothScrolling from "./layout/SmoothScrolling";
import { SessionProvider } from "next-auth/react";
import TransitionComponent from "./layout/TransitionComponent";

export default function RootLayout({ children, session }) {

  return (
    <html lang="en">
      <head></head>
      <body>
        <SessionProvider session={session}>
          <Header />
          <SmoothScrolling>
                <TransitionComponent>
                <main aria-label="Main content">
                  {children}
                </main>
                </TransitionComponent>
          </SmoothScrolling>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}