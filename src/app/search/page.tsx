'use client'

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin } from 'lucide-react'
import AuthGuard from '../components/AuthGuard'
import Navbar from '../components/navbar'
import { useEffect, useState } from 'react'
import { getMeetingsFiltered } from '../actions/meetings/get'
import { useRouter } from "next/navigation";
import { imgPaths, regions } from '../api/variables/meetings'
import MeetingView from '../components/MeetingView'

export default function ProfileList() {
    const [meetings, setMeetings] = useState<any>([]);
    const [idMeeting, setIdMeeting] = useState<number>(-1);
    const router = useRouter();

    useEffect(() =>
    {
        getMeetingsFiltered().then((res) =>
        {
            const data = JSON.parse(res);
            let meetings2: any[] = [];
            
            data.map((d: any) =>
            {
                const images = imgPaths.get(d.orientation);

                if (images && images.length > 0)
                {
                    const indexImg = Math.floor(Math.random() * images.length);
                    const path = `/img/meetings/${d.orientation}/${images[indexImg]}`;
                    
                    meetings2.push({
                        //id: d.id,
                        date: d.date,
                        ageRange: d.age,
                        region: d.region,
                        imageUrl: path,
                        participants: d.participants
                    });
                }
            });

            setMeetings(meetings2);
        });
    }, []);
  
  return (
    <AuthGuard>
        <Navbar />
        <div className="min-h-screen bg-pink-50">
            <div className="container mx-auto p-4">
                {
                    idMeeting == -1 &&
                    
                    <>
                        <h2 className="text-2xl font-bold text-pink-600 mb-6">Prochaines séances disponibles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meetings.map((m: any, index:number) => (
                            <div key={m.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setIdMeeting(index)}>
                                <div className="relative h-48">
                                <Image
                                    src={m.imageUrl}
                                    alt={`Profile for ${m.date}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-t-lg"
                                />
                                </div>
                                <div className="p-4">
                                <h3 className="text-lg font-semibold text-pink-600 mb-2 flex items-center">
                                    <CalendarDays className="mr-2 h-5 w-5" />
                                    {new Date(m.date).toLocaleDateString('fr-FR', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </h3>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Tranche d'âge :</span> {m.ageRange}
                                </p>
                                <p className="text-gray-600 flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {m.region}
                                </p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </>
                }

                {
                    idMeeting != -1 &&

                    <>
                        <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mb-10" onClick={ () => setIdMeeting(-1) }>Retour</button>
                        <MeetingView meeting={meetings[idMeeting]} />
                    </>
                }
            </div>
        </div>
    </AuthGuard>
  )
}