"use client"

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin, Clock, Users, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Navbar from '@/app/components/navbar'
import { useEffect, useState } from 'react'
import { getMeetingById } from '@/app/actions/meetings/get'
import { imgPaths, orientations, regions } from '@/app/api/variables/meetings'
import { addCurrentuserToMeeting, delCurrentuserToMeeting } from '@/app/actions/meetings/post'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/app/components/AuthGuard'

export default function MeetingView({ meeting }: any)
{
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [isModalOpen3, setIsModalOpen3] = useState(false);
    const [messageModal3, setMessageModal3] = useState("");
    const { data: session, status } = useSession();

    useEffect(() =>
    {
        console.log(meeting);
    }, []);

  return (
    <AuthGuard>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96">
            <Image
                src={meeting.imageUrl}
                alt={meeting.name}
                layout="fill"
                objectFit="cover"
            />
            </div>
            <div className="p-6">
            <h1 className="text-3xl font-bold text-pink-600 mb-4">{meeting.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    {new Date(meeting.date).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })} 
                </div>
                <div className="flex items-center text-gray-600">
                    <Clock className="mr-2 h-5 w-5" />
                    {new Date(meeting.date).toLocaleTimeString('fr-FR')}
                </div>
                <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2 h-5 w-5" />
                    {meeting.region}
                </div>
                <div className="flex items-center text-gray-600">
                    <User className="mr-2 h-5 w-5" />
                    {meeting.ageRange}
                </div>
                <div className="flex items-center text-gray-600">
                    <Users className="mr-2 h-5 w-5" />
                    {meeting.participants.length}
                </div>
            </div>
            <Button 
                onClick={() =>
                    {
                        addCurrentuserToMeeting(meeting);
                    }
                }
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            >
                <>Réserver</>
            </Button>
            </div>
        </div>
    </AuthGuard>
  )
}