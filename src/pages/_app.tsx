import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react"; // Add this import
import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <div className="flex flex-grow mt-14">
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

export default MyApp;
