"use client"

import { useRouter } from "next/navigation";
import Disconnect from "../components/Disconnect";
import { getMeetings } from "../actions/getMeetings";
import { useEffect, useState } from "react";
import { Meeting } from "../types";

const Search = () =>
{
    const router = useRouter();
    
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    useEffect(() =>
    {
        getMeetings().then((res: string) =>
        {
            setMeetings(JSON.parse(res));
        });
    }, []);

    //console.log(sessions);
    
    return (
        <>
            <div>
                <button onClick={() => router.push("/") }>Accueil</button>
            </div>

            <ul>
                {
                    meetings?.map((s: Meeting) =>
                    {
                        return <li>{s.orientation} {s.age} {s.region}</li>
                    })
                }
            </ul>

            <Disconnect />
        </>
    );
}

export default Search;