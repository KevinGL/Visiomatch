"use client"

import { getMeetingById } from "@/app/actions/meetings/get";
import { addCurrentuserToMeeting, delCurrentuserToMeeting } from "@/app/actions/meetings/post";
import AuthGuard from "@/app/components/AuthGuard";
import Navbar from "@/app/components/navbar";
import { useSession } from "next-auth/react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

const view_meeting = ({ params }: any) =>
{
    let [meeting, setMeeting] = useState({} as any);
    let [displayModal1, setDisplayModal1] = useState(false);
    let [displayModal2, setDisplayModal2] = useState(false);
    let [msgModal1, setMsgModal1] = useState("");
    let [msgModal2, setMsgModal2] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() =>
    {
        getMeetingById(params.id[0]).then((res) =>
        {
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

            if(!res)
            {
                router.push("/");
            }
            
            else
            {
                const data = JSON.parse(res);

                const list = paths.get(data.orientation);
                let path = "";

                if(list)
                {
                    const indexMeeting: number = Math.floor(Math.random() * (list.length - 1));
                    path = `/img/meetings/${data.orientation}/${list[indexMeeting]}`;
                }

                const date: Date = new Date(data.date._seconds * 1000);

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

                const months: string[] =
                [
                    "janvier",
                    "février",
                    "mars",
                    "avril",
                    "mai",
                    "juin",
                    "juillet",
                    "août",
                    "septembre",
                    "octobre",
                    "novembre",
                    "décembre"
                ];

                const regions = new Map<string, string>();

                regions.set("SE", "sud-est");
                regions.set("SO", "sud-ouest");
                regions.set("NO", "nord-ouest");
                regions.set("NE", "nord-est");

                const orientations = new Map<string, string>();

                orientations.set("man_woman", "Homme femme");
                orientations.set("man_man", "Homme homme");
                orientations.set("woman_woman", "Femme femme");
                
                setMeeting({
                    age: `${data.age} ans`,
                    date: `le ${days[date.getDay()]} ${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]} à ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
                    img: path,
                    region: regions.get(data.region),
                    orientation: orientations.get(data.orientation),
                    participants: data.participants
                });
            }
        });
    }, []);
    
    return (
        <AuthGuard>
            <div className="bg-blue-200 min-h-screen">
                <Navbar />
                <div className="container mx-auto p-4">
                    <div className="grid grid-cols-1 gap-6">
                        <Image
                            src={meeting.img}
                            alt="Logo"
                            width={400}
                            height={400}
                            layout="intrinsic"
                            className="rounded-lg mx-auto"
                        />
                        <div className="mx-auto">
                            <h1 className="sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-center">Séance visio {meeting.date}</h1>
                            <h2 className="sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-center">Région {meeting.region}</h2>
                            <h2 className="sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-center">{meeting.orientation}</h2>
                            <h2 className="sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-center">{meeting.age}</h2>
                        </div>
                        {
                            meeting.participants && meeting.participants.indexOf(session?.user?.id) == -1 &&
                            
                            <button onClick={() =>{
                                addCurrentuserToMeeting(params.id[0])
                                    .then(() =>
                                    {
                                        setDisplayModal1(true);
                                        setMsgModal1("Réservation effectuée avec succès !");
                                        setMsgModal2(`RDV ${meeting.date} pour un échange convivial !`);

                                        let meeting2 = meeting;
                                        meeting2.participants.push(session?.user?.id);
                                        setMeeting(meeting2);
                                    })
                                    .catch(() =>
                                    {
                                        setDisplayModal1(true);
                                        setMsgModal1("Une erreur s'est produite ...");
                                    });
                                }}
                                className="w-full max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mx-auto">Réserver ma séance
                            </button>
                        }
                        {
                            meeting.participants && meeting.participants.indexOf(session?.user?.id) != -1 &&

                            <button
                                onClick={() => setDisplayModal2(true)}
                                className="w-full max-w-md px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mx-auto text-center">Annuler ma réservation
                            </button>
                        }
                    </div>
                </div>
            </div>
            {
                displayModal1 &&
                
                <div className="absolute sm:w-3/4 md:w-3/4 lg:w-1/2 xl:w-1/2 w-full max-w-full left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2 h-64 bg-sky-100 rounded-lg">
                    <h1 className="sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-center pt-4">{msgModal1}</h1>
                    <h1 className="sm:text-lg md:text-xl lg:text-1xl xl:text-2xl font-bold text-center pt-4 px-4">{msgModal2}</h1>
                    <button className="w-auto max-w-md px-4 py-2 mt-10 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mx-auto block" onClick={() => setDisplayModal1(false)}>OK</button>
                </div>
            }
            {
                displayModal2 &&
                
                <div className="absolute sm:w-3/4 md:w-3/4 lg:w-1/2 xl:w-1/2 w-full max-w-full left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2 h-36 bg-sky-100 rounded-lg">
                    <h1 className="sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-center pt-4">Annuler la réservation ?</h1>
                    <div className="flex justify-center space-x-4 mt-10">
                        <button
                            className="w-1/4 max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() =>
                            {
                                setDisplayModal2(false);

                                let meeting2 = meeting;
                                const index: number = meeting2.participants.indexOf(session?.user?.id);

                                if (index > -1)
                                {
                                    meeting.participants.splice(index, 1);
                                }

                                delCurrentuserToMeeting(params.id[0]);
                            }}
                            >
                            Oui
                        </button>
                        <button
                            className="w-1/4 max-w-md px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => setDisplayModal2(false)}
                            >
                            Non
                        </button>
                    </div>
                </div>
            }
        </AuthGuard>
    )
}

export default view_meeting;