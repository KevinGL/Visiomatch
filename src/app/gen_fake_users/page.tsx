"use client"

import { Button } from "@/components/ui/button";
import Navbar from "../components/navbar";
import MiddlewareAdmin from "../components/MiddlewareAdmin";
import { useState } from "react";
import Image from 'next/image';
import { genFakesUsers } from "../actions/users/post";

export default function GenFakeUser()
{
    const [isWorking, setIsWorking] = useState(false);

    const handleGen = async () =>
    {
        setIsWorking(true);

        await genFakesUsers();

        setIsWorking(false);
    }

    return (
        <MiddlewareAdmin>
            <div className="min-h-screen bg-pink-50">
                <Navbar/>

                <div className="flex flex-col items-center mt-5 gap-8">
                    <Button
                        onClick={handleGen}
                        className="bg-pink-600 hover:bg-pink-700 text-white mt-5 px-60"
                    >
                        Générer les users
                    </Button>

                    {
                        isWorking &&

                        <Image
                            src="/img/icons/Loading.gif"
                            alt="Loading"
                            width="300"
                            height="300"
                            className="rounded-lg"
                        />
                    }
                </div>
            </div>
        </MiddlewareAdmin>
    )
}