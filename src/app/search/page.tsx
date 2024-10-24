'use client'

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin } from 'lucide-react'
import AuthGuard from '../components/AuthGuard'
import Navbar from '../components/navbar'
import { useEffect, useState } from 'react'
import { getMeetingsFiltered } from '../actions/meetings/get'
import { useRouter } from "next/navigation";

export default function ProfileList() {
    const [meetings, setMeetings] = useState<any>([]);
    const router = useRouter();

    useEffect(() =>
    {
        getMeetingsFiltered().then((res) =>
        {
            const data = JSON.parse(res);
            let meetings2: any[] = [];

            const regions = new Map<string, string>();

            regions.set("SE", "Sud-est");
            regions.set("NE", "Nord-est");
            regions.set("NO", "Nord-ouest");
            regions.set("SO", "Sud-ouest");

            const paths = new Map<string, string[]>();

            paths.set("man_woman", ["pexels-cottonbro-6789162.jpg", "pexels-jonathanborba-13780012.jpg", "pexels-leticiacurveloph-17463408.jpg"]);
            paths.set("man_man", ["pexels-ketut-subiyanto-4746650.jpg", "pexels-ketut-subiyanto-4833656.jpg"]);
            paths.set("woman_woman", ["pexels-felipebalduino-2546885.jpg", "pexels-felipebalduino-2546890.jpg"]);
            
            data.map((d: any) =>
            {
                const indexImg = Math.floor(Math.random() * paths.get(d.orientation)?.length);
                const path = `/img/meetings/${d.orientation}/${paths.get(d.orientation)[indexImg]}`;
                
                meetings2.push({
                    id: d.id,
                    date: d.date,
                    ageRange: d.age,
                    region: regions.get(d.region),
                    imageUrl: path
                });
            });

            setMeetings(meetings2);
        });
    }, []);
  
  return (
    <AuthGuard>
        <Navbar />
        <div className="min-h-screen bg-pink-50">
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">Prochaines séances disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.map((m: any) => (
                    <div key={m.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => router.push(`view_meeting/${m.id}`)}>
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
            </div>
        </div>
    </AuthGuard>
  )
}