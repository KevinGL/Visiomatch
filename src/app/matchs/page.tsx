"use client"

import { useEffect, useState } from "react"
import Navbar from "../components/navbar"
import { getMatchs } from "../actions/meetings/get";
import { Button } from "@/components/ui/button";
import { CalendarDays, Globe, MapPin, User } from "lucide-react";

export default function Matchs()
{
    const [matchs, setMatchs] = useState([]);
    
    useEffect(() =>
    {
        const fetchMatchs = async () =>
        {
            const data = await getMatchs();
            setMatchs(data);
            //console.log(data);
        };

        fetchMatchs();
    }, []);

    const calculateAge = (birthDate: string) =>
    {
        //console.log(birthDate);
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
        {
            age--;
        }
        return age;
    }

    return(
        <>
            <Navbar />

            {
                matchs.map((m) =>
                {
                    return(                    
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 text-pink-600 mr-2" />
                                        <span className="font-semibold">Pseudo:</span>
                                        <span className="ml-2">{m.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CalendarDays className="w-5 h-5 text-pink-600 mr-2" />
                                        <span className="font-semibold">Age:</span>
                                        <span className="ml-2">{calculateAge(m.birthdate)} ans</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="w-5 h-5 text-pink-600 mr-2" />
                                        <span className="font-semibold">Ville:</span>
                                        <span className="ml-2">{m.city}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Globe className="w-5 h-5 text-pink-600 mr-2" />
                                        <span className="font-semibold">Pays:</span>
                                        <span className="ml-2">{m.country}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}