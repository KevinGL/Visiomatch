"use client"

import Login from "./components/login";
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home()
{
  const { data: session, status } = useSession();

  return (
    <>
      {
        status != "authenticated" ?
        <div className="flex items-center justify-center h-screen">
          <Login />
        </div> :

        <>
          <button onClick={() => signOut()}>Se déconnecter</button>
        </>
      }
    </>
  );
}
