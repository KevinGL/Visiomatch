"use client"

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin, Clock, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Navbar from '@/app/components/navbar'
import { useEffect, useState } from 'react'
import { getMeetingById } from '@/app/actions/meetings/get'
import { imgPaths, orientations, regions } from '@/app/api/variables/meetings'
import { addCurrentuserToMeeting, delCurrentuserToMeeting } from '@/app/actions/meetings/post'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/app/components/AuthGuard'

export default function aa({ params }: any)
{
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [isModalOpen3, setIsModalOpen3] = useState(false);
    const [messageModal3, setMessageModal3] = useState("");
    const [meeting, setMeeting] = useState<any>({ participants: [] });
    const { data: session, status } = useSession();

    useEffect(() =>
    {
        getMeetingById(params.id[0])
        .then((res) =>
        {
            const data = JSON.parse(res);

            const images = imgPaths.get(data.orientation);
            
            if(images)
            {
                const indexImg = Math.floor(Math.random() * images.length);
                const path = `/img/meetings/${data.orientation}/${images[indexImg]}`;

                const date = new Date(data.date._seconds * 1000);

                const meeting2 =
                {
                    age: data.age,
                    imageUrl: path,
                    date: date,
                    time: `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
                    name: orientations.get(data.orientation),
                    location: regions.get(data.region),
                    participants: data.participants
                };

                setMeeting(meeting2);
            }
        });
    }, []);

  return (
    <AuthGuard>
        <div className="min-h-screen bg-pink-50">
            <Navbar />
            <div className="container mx-auto p-4">
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
                    {meeting.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2 h-5 w-5" />
                    {meeting.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                    <Users className="mr-2 h-5 w-5" />
                    {meeting.participants.length} participants
                    </div>
                </div>
                <Button 
                    onClick={() =>
                        {
                            if(meeting.participants.indexOf(session?.user.id) == -1)
                            {
                                setIsModalOpen(true);
                            }

                            else
                            {
                                setIsModalOpen2(true);
                            }
                        }
                    }
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                >
                    {
                        meeting.participants.indexOf(session?.user.id) == -1 &&

                        <>Réserver</>
                    }

                    {
                        meeting.participants.indexOf(session?.user.id) != -1 &&

                        <>Annuler</>
                    }
                </Button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-pink-600">Confirmer réservation</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                    </div>
                    <p className="mb-4">Réservation pour : <strong>{meeting.name}</strong></p>
                    <p className="mb-2"><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
                    <p className="mb-2"><strong>Time:</strong> {meeting.time}</p>
                    <p className="mb-4"><strong>Région:</strong> {meeting.location}</p>
                    <div className="flex justify-end">
                    <Button 
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    >
                        Annuler
                    </Button>
                    <Button 
                        onClick={() => {
                            // Here you would typically handle the booking logic
                            addCurrentuserToMeeting(params.id[0])
                            .then((res) =>
                            {
                                if(res?.success)
                                {
                                    const meeting2 = meeting;
                                
                                    if(meeting2.participants.indexOf(session?.user.id) == -1)
                                    {
                                        meeting2.participants.push(session?.user.id);
                                    }
                                    
                                    setMeeting(meeting2);
                                }
                                //alert('Booking confirmed!');
                                setIsModalOpen(false);

                                //alert(res?.message);
                                setMessageModal3(res?.message);
                                setIsModalOpen3(true);
                            });
                        }}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Confirmer réservation
                    </Button>
                    </div>
                </div>
                </div>
            )}

            {isModalOpen2 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-pink-600">Annuler réservation</h2>
                    <button onClick={() => setIsModalOpen2(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                    </div>
                    <p className="mb-4">Annuler la réservation pour : <strong>{meeting.name}</strong></p>
                    <p className="mb-2"><strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}</p>
                    <p className="mb-2"><strong>Time:</strong> {meeting.time}</p>
                    <p className="mb-4"><strong>Région:</strong> {meeting.location}</p>
                    <div className="flex justify-end">
                    <Button 
                        onClick={() => setIsModalOpen2(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    >
                        Annuler
                    </Button>
                    <Button 
                        onClick={() => {
                            // Here you would typically handle the booking logic
                            delCurrentuserToMeeting(params.id[0])
                            .then((res) =>
                            {
                                const meeting2 = meeting;
                                
                                const index: number = meeting2?.participants.indexOf(params.id[0]);

                                if(index == -1)
                                {
                                    meeting2.participants.splice(index, 1);
                                    setMeeting(meeting2);
                                }

                                //alert('Booking confirmed!');
                                setIsModalOpen2(false);
                                setMessageModal3(res?.message);
                                setIsModalOpen3(true);
                            });
                        }}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Annuler réservation
                    </Button>
                    </div>
                </div>
                </div>
            )}

            {isModalOpen3 &&(
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <div className="flex justify-end mb-2">
                                <button onClick={() => setIsModalOpen3(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-lg text-gray-700 mb-6 text-center">{messageModal3}</p>
                            <div className="flex justify-center">
                                <Button 
                                    onClick={() => setIsModalOpen3(false)}
                                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    OK
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </AuthGuard>
  )
}