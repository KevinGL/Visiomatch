"use client"

import { signOut } from "next-auth/react";

const Disconnect = () =>
{
    return (
        <div>
            <button onClick={() => signOut()}>Se déconnecter</button>
        </div>
    );
}

export default Disconnect;