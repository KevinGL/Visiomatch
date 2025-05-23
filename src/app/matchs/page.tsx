"use client"

import { useEffect, useState } from "react"
import Navbar from "../components/navbar"
import { getMatchs } from "../actions/meetings/get";
import { Button } from "@/components/ui/button";
import { CalendarDays, Globe, MapPin, User, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import AuthGuard from "../components/AuthGuard";

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
        <AuthGuard>
            <div className="min-h-screen bg-pink-50">
                <Navbar />

                <div className="container mx-auto p-4">
                    <h2 className="text-2xl font-bold text-pink-600 mb-6">Vos matchs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                
                {
                    matchs.map((match, index: number) =>
                    {
                        return(                    
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 w-1/2">
                                <CardHeader className="p-0">
                                    <div className="relative h-40">
                                        {
                                            match.photos.length === 0 &&

                                            <Image
                                                src={match.gender === "woman" ? "/img/icons/Woman.jpg" : "/img/icons/Man.jpg"}
                                                alt={match.gender === "woman" ? "Woman" : "Man"}
                                                layout="fill"
                                                objectFit="contain"
                                                className="rounded-t-lg"
                                            />
                                        }

                                        {
                                            match.photos.length !== 0 &&

                                            <div className="flex flex-start">
                                            
                                            {
                                                match.photos.map((photo: string) =>
                                                {
                                                    return (
                                                        <CldImage
                                                            src={photo}
                                                            alt={photo}
                                                            width="150"
                                                            height="150"
                                                            crop={{
                                                                type: "auto",
                                                                source: true
                                                            }}
                                                            className="mr-5"
                                                        />
                                                    )
                                                })
                                            }

                                            </div>
                                        }
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg font-semibold text-pink-600 mb-2">
                                        {match.name}
                                    </CardTitle>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CalendarDays className="mr-2 h-4 w-4 text-pink-500" />
                                            <span>{calculateAge(match.birthdate)} ans</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="mr-2 h-4 w-4 text-pink-500" />
                                            <span>{match.city}</span>
                                        </div>

                                        <div className="flex items-center justify-around">
                                            <Button 
                                                onClick={() =>
                                                    {}
                                                }
                                                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Envoyer un message
                                            </Button>

                                            <Button 
                                                onClick={() =>
                                                    {}
                                                }
                                                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Voir son profil
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                }
                </div>
            </div>
        </AuthGuard>
    )
}