"use client"

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin, Clock, Users, User, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import Navbar from '@/app/components/navbar'
import { useEffect, useState } from 'react'
import { getMeetingById } from '@/app/actions/meetings/get'
import { imgPaths, orientations, regions } from '@/app/api/variables/meetings'
import { addCurrentuserToMeeting, delCurrentuserToMeeting } from '@/app/actions/meetings/post'
import { useSession } from 'next-auth/react'
import AuthGuard from '@/app/components/AuthGuard'
import { getIfSubscribed } from "@/app/actions/users/get";

export default function MeetingView({ meeting }: any)
{
    const [localMeeting, setLocalMeeting] = useState({ date: "2000-01-01T00:00:00Z", ageRange: "18-25", region: "NO", imageUrl: "", name: "", participants: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [isModalOpen3, setIsModalOpen3] = useState(false);
    const [messageModal3, setMessageModal3] = useState("");
    const { data: session, status } = useSession();

    useEffect(() =>
    {
        setLocalMeeting(meeting);
        
        getIfSubscribed(meeting).then((res: boolean) =>
        {
            setAlreadyRegistered(res);
        });
    }, []);

  return (
    <AuthGuard>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96">
            <Image
                src={localMeeting.imageUrl}
                alt={localMeeting.imageUrl}
                layout="fill"
                objectFit="cover"
            />
            </div>
            <div className="p-6">
                <h1 className="text-3xl font-bold text-pink-600 mb-4">{localMeeting.name}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                        <CalendarDays className="mr-2 h-5 w-5" />
                        {new Date(localMeeting.date).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })} 
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Clock className="mr-2 h-5 w-5" />
                        {new Date(localMeeting.date).toLocaleTimeString('fr-FR')}
                    </div>
                    <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-5 w-5" />
                        {localMeeting.region}
                    </div>
                    <div className="flex items-center text-gray-600">
                        <User className="mr-2 h-5 w-5" />
                        {localMeeting.ageRange}
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Users className="mr-2 h-5 w-5" />
                        {localMeeting.participants.length}
                    </div>
                </div>
                
                {
                    !alreadyRegistered &&
                    <>
                        <Button 
                            onClick={() =>
                                {
                                    setIsModalOpen(true);
                                }
                            }
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <>Réserver</>
                        </Button>
                    </>
                }

                {
                    alreadyRegistered &&
                    <>
                        <Button 
                            onClick={() =>
                                {
                                    setIsModalOpen2(true);
                                }
                            }
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <>Annuler</>
                        </Button>
                    </>
                }
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
                    <p className="mb-4">Réservation pour : <strong>{localMeeting.name}</strong></p>
                    <p className="mb-2"><strong>Date:</strong> {new Date(localMeeting.date).toLocaleDateString("fr-FR")}</p>
                    <p className="mb-2"><strong>Time:</strong> {new Date(localMeeting.date).toLocaleTimeString('fr-FR')}</p>
                    <p className="mb-4"><strong>Région: </strong>
                        {localMeeting.region == "NO" && <>Nord-ouest</>}
                        {localMeeting.region == "NE" && <>Nord-est</>}
                        {localMeeting.region == "SE" && <>Sud-est</>}
                        {localMeeting.region == "SO" && <>Sud-ouest</>}
                    </p>
                    <div className="flex justify-end">
                    <Button 
                        onClick={() =>
                            {
                                setIsModalOpen(false);
                            }
                        }
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    >
                        Annuler
                    </Button>
                    
                    <Button 
                        onClick={() => {
                            // Here you would typically handle the booking logic
                            addCurrentuserToMeeting(localMeeting)
                            .then((res) =>
                            {
                                if(res?.success)
                                {
                                    const meeting2 = localMeeting;
                                
                                    if(meeting2.participants.indexOf(session?.user.id) == -1)
                                    {
                                        meeting2.participants.push(session?.user.id);
                                    }
                                    
                                    setLocalMeeting(meeting2);
                                    setAlreadyRegistered(true);
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
                    <p className="mb-4">Annuler la réservation pour : <strong>{localMeeting.name}</strong></p>
                    <p className="mb-2"><strong>Date:</strong> {new Date(localMeeting.date).toLocaleDateString("fr-FR")}</p>
                    <p className="mb-2"><strong>Time:</strong> {new Date(localMeeting.date).toLocaleTimeString('fr-FR')}</p>
                    <p className="mb-4"><strong>Région: </strong>
                        {localMeeting.region == "NO" && <>Nord-ouest</>}
                        {localMeeting.region == "NE" && <>Nord-est</>}
                        {localMeeting.region == "SE" && <>Sud-est</>}
                        {localMeeting.region == "SP" && <>Sud-ouest</>}
                    </p>
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
                            delCurrentuserToMeeting(localMeeting)
                            .then((res) =>
                            {
                                const meeting2 = localMeeting;
                                
                                const index: number = meeting.participants.indexOf(session?.user.id);

                                if(index != -1)
                                {
                                    meeting2.participants.splice(index, 1);
                                    setLocalMeeting(meeting2);
                                }

                                //alert('Booking confirmed!');
                                setIsModalOpen2(false);
                                setMessageModal3(res?.message);
                                setIsModalOpen3(true);
                                setAlreadyRegistered(false);
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
    </AuthGuard>
  )
}
