"use client"

import { useRouter } from "next/navigation";
import Disconnect from "./Disconnect";

export const Home = () =>
{
    const router = useRouter();
    
    return (
        <>
            <div>
                <button onClick={() => router.push("/search") }>Trouver une séance visio</button>
            </div>

            <Disconnect />
        </>
    );
}