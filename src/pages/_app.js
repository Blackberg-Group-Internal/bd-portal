import Header from "../app/components/Header";
import Footer from "../app/components/Footer";
import BootstrapClient from '../app/components/BootstrapClient';
import "../app/scss/main.scss";
import SmoothScrolling from "../app/components/SmoothScrolling";
import { SessionProvider } from "next-auth/react"


export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <>
      <SessionProvider session={session}>
      <Header />
      <SmoothScrolling>
          <main aria-label="Main content">
              <Component {...pageProps} />
          </main>
      </SmoothScrolling>
      <BootstrapClient />
      </SessionProvider>
      </>
  );
}