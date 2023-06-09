import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const TopBar: React.FC = () => {
  const { data: session, status: loading } = useSession();

  return (
    <header className="bg-blue-500 text-white h-14 w-full flex fixed top-0 items-center justify-between px-4">
      <Link
        href="/"
        className="font-bold text-lg inline-flex items-center justify-start"
      >
        <Image
          src="/favicon.ico"
          alt="Logo"
          width={48}
          height={48}
          className="pr-2"
        />
        <span>Tweet Staff</span>
      </Link>
      <nav>
        <ul className="flex space-x-4">
          {session ? (
            <>
              <li>
                {session.user && session.user.image && (
                  <Link href="/profile">
                    <img
                      src={session.user.image}
                      alt="User avatar"
                      className="rounded-full h-8 w-8"
                    />
                  </Link>
                )}
              </li>
              <li>
                <button
                  className="bg-white text-blue-500 hover:bg-blue-700 hover:text-white font-bold py-2 px-4 rounded"
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                className="bg-white text-blue-500 hover:bg-blue-700 hover:text-white font-bold py-2 px-4 rounded"
                onClick={() => signIn("twitter")}
              >
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default TopBar;
