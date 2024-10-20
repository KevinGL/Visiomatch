"use client"

import { useRouter } from "next/navigation";
import Disconnect from "../components/Disconnect";
import { getMeetings } from "../actions/getMeetings";
import { useEffect, useState } from "react";
import { Meeting } from "../types";
import { useSession } from "next-auth/react";
import AuthGuard from "../components/AuthGuard";
import Navbar from "../components/navbar";
import Image from 'next/image';

const Search = () =>
{
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    useEffect(() =>
    {
        getMeetings().then((res: any) =>
        {
            setMeetings(JSON.parse(res as string));
        });
    }, []);

    let paths = new Map<string, Array<string>>();
                            
    paths.set("man_man",
    [
        "pexels-ketut-subiyanto-4746650.jpg",
        "pexels-ketut-subiyanto-4833656.jpg"
    ]);

    paths.set("man_woman",
    [
        "pexels-cottonbro-6789162.jpg",
        "pexels-jonathanborba-13780012.jpg",
        "pexels-leticiacurveloph-17463408.jpg"
    ]);

    paths.set("woman_woman",
    [
        "pexels-felipebalduino-2546885.jpg",
        "pexels-felipebalduino-2546890.jpg"
    ]);
    
    return (
        <AuthGuard>
            <div className="bg-blue-200 min-h-screen">
                <Navbar />
                <div className="container mx-auto p-4">
                    <div className="grid grid-cols-1 gap-6">
                        {
                            meetings?.map((s: Meeting, index: number) =>
                            {
                                const list = paths.get(s.orientation);
                                let path = "";

                                if(list)
                                {
                                    const indexMeeting: number = Math.floor(Math.random() * (list.length - 1));
                                    path = `/img/meetings/${s.orientation}/${list[indexMeeting]}`;
                                }
                                
                                return <div key={index} className="relative w-full h-48">
                                    <Image
                                        src={path}
                                        alt="Logo"
                                        width={300}
                                        height={300}
                                        layout="intrinsic"
                                        className="rounded-lg"
                                    />
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

export default Search;