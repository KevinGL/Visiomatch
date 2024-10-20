"use client"

import { useRouter } from "next/navigation";
import Disconnect from "./Disconnect";
import Navbar from "./navbar";

export const Home = () =>
{
    const router = useRouter();
    
    return (
        <>
            <Navbar />
        </>
    );
}