"use client"

import { useRouter } from "next/navigation";
import Disconnect from "../components/Disconnect";
import { getMeetingsFiltered } from "../actions/meetings/get";
import { useEffect, useState } from "react";
import { Meeting } from "../types";
import { useSession } from "next-auth/react";
import AuthGuard from "../components/AuthGuard";
import Navbar from "../components/navbar";
import Image from 'next/image';
import { addCurrentuserToMeeting } from "../actions/meetings/post";

const Search = () =>
{
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    useEffect(() =>
    {
        if(meetings.length == 0)
        {
            getMeetingsFiltered().then((res: any) =>
            {
                setMeetings(JSON.parse(res as string));
            });
        }
    }, []);

    const handleMeeting = (index: number) =>
    {
        const meetings2 = [...meetings];
        
        meetings2[index].participants.push(session?.user?.id);

        setMeetings(meetings2);

        addCurrentuserToMeeting(meetings2[index].id);
    }

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

                                const date: Date = new Date(s.date);

                                const days: string[] =
                                [
                                    "dimanche",
                                    "lundi",
                                    "mardi",
                                    "mercredi",
                                    "jeudi",
                                    "vendredi",
                                    "samedi"
                                ];

                                const regions = new Map<string, string>();

                                regions.set("SE", "Sud-est");
                                regions.set("SO", "Sud-ouest");
                                regions.set("NO", "Nord-ouest");
                                regions.set("NE", "Nord-est");

                                //console.log(subscribed);
                                
                                return <div key={index} className="flex items-center w-full h-48 mt-10">
                                    <div className="w-1/3">
                                        <Image
                                            src={path}
                                            alt="Logo"
                                            width={300}
                                            height={300}
                                            layout="intrinsic"
                                            className="rounded-lg"
                                        />
                                    </div>
                                    
                                    <div className="w-1/3 pl-4 space-y-2">
                                        <h1 className="text-xl font-bold">{`Le ${days[date.getDay()]} ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")} à ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`}</h1>
                                        <p className="text-sm">{`Àge: ${s.age} ans`}</p>
                                        <p className="text-sm">{`Région: ${regions.get(s.region)}`}</p>
                                        {/* Ajoute d'autres informations ici si nécessaire */}
                                    </div>

                                    <div className="w-1/3">
                                        {
                                            s.participants.indexOf(session?.user?.id) == -1 &&
                                            
                                            <button className="bg-blue-500 block py-2 px-4 text-white hover:bg-blue-700 rounded" onClick={() => handleMeeting(index)}>Réserver</button>
                                        }

                                        {
                                            s.participants.indexOf(session?.user?.id) != -1 &&
                                            
                                            <button className="bg-gray-500 block py-2 px-4 text-white rounded cursor-auto">Soirée réservée</button>
                                        }
                                    </div>
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