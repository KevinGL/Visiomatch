"use client"

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin, Users, Video, X } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { getUserNextMeetings } from '../actions/meetings/get'
import { imgPaths, meetingDuration, orientations, regions } from '../api/variables/meetings'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { delCurrentuserToMeeting } from '../actions/meetings/post'
import { useSession } from 'next-auth/react'
import { generateId } from '../utils'

export default function MeetingsList() {

  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>({});
  const [modalMessage, setModalMessage] = useState<string>("");
  const router = useRouter();
  const { data: session, status } = useSession();

    useEffect(() =>
    {
        getUserNextMeetings().then((res: any) =>
        {
            const datas: any[] = JSON.parse(res);
            let meetings2: any[] = [];

            datas.map((d: any) =>
            {
              const pathsArray: string[] = imgPaths.get(d.orientation) as string[];
              const indexPath: number = Math.floor(Math.random() * pathsArray?.length);
              const date = new Date(d.date);
              const imageUrl: string = `/img/meetings/${d.orientation}/${pathsArray[indexPath]}`;

              meetings2.push({ id: d.id, imageUrl, ageGroup: d.ageRange, participants: d.participants, orientation: d.orientation, title: `Le ${date.toLocaleDateString('fr-FR',
                { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}` , region: d.region, date });
            });
          
            setMeetings(meetings2);
        });
    }, []);

  return (
    <>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-pink-600 mb-6">Vos prochaines participations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative h-40">
                  <Image
                    src={meeting.imageUrl}
                    alt={meeting.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-pink-600 mb-2">
                  {meeting.title}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="mr-2 h-4 w-4 text-pink-500" />
                    <span>Tranche d'âge: {meeting.ageGroup}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4 text-pink-500" />
                    <span>{meeting.region}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4 text-pink-500" />
                    <span>{meeting.participants.length} participants</span>
                  </div>

                  <Button 
                      onClick={() =>
                          {
                            setSelectedMeeting({ ...meeting });
                          }
                      }
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  >
                      <>Annuler</>
                  </Button>
                </div>
              </CardContent>

              {
                Date.now() >= meeting.date?.getTime() && Date.now() <= meeting.date?.getTime() + meetingDuration &&

                <CardFooter>
                  <Button 
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    onClick={() =>
                      {
                        const values = [meeting.ageGroup, meeting.date?.getTime(), meeting.orientation, meeting.region];
                        const id: string = generateId(values);
                        router.push(`/do_meeting/${id}`);
                      }
                    }
                  >
                    <Video className="mr-2 h-4 w-4" />
                      Accéder à la séance !
                  </Button>
                </CardFooter>
              }
            </Card>
          ))}
        </div>
      </div>

      {
        Object.keys(selectedMeeting).length != 0 &&

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-pink-600">Annuler réservation</h2>
              <button onClick={() => setSelectedMeeting({})} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
              </button>
              </div>
              <p className="mb-4">Annuler la réservation pour : <strong>{selectedMeeting.name}</strong></p>
              <p className="mb-2"><strong>Date:</strong> {new Date(selectedMeeting.date).toLocaleDateString("fr-FR")}</p>
              <p className="mb-2"><strong>Time:</strong> {new Date(selectedMeeting.date).toLocaleTimeString('fr-FR')}</p>
              <p className="mb-4"><strong>Région: </strong>
                {selectedMeeting.region}
              </p>
              <div className="flex justify-end">
              <Button 
                  onClick={() => setSelectedMeeting({})}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                  Annuler
              </Button>
              <Button 
                  onClick={() => {
                      
                      delCurrentuserToMeeting(selectedMeeting)
                      .then((res) =>
                      {
                          const index: number = meetings.findIndex((m) =>
                          {
                            m.date === selectedMeeting.date &&
                            m.region === selectedMeeting.region &&
                            m.ageRange === selectedMeeting.ageRange &&
                            m.orientation === selectedMeeting.orientation
                          });

                          let meetings2 = meetings;

                          meetings2.splice(index, 1);

                          setMeetings(meetings2);
                        
                          setSelectedMeeting({});

                          setModalMessage(res.message);
                      })
                      .catch((error) =>
                      {
                        setSelectedMeeting({});
                        setModalMessage(error.message);
                      });
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
              >
                  Annuler réservation
              </Button>
              </div>
          </div>
      </div>
      }

      {
        modalMessage != "" &&

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-end mb-2">
                  <button onClick={() => setModalMessage("")} className="text-gray-500 hover:text-gray-700">
                      <X className="h-6 w-6" />
                  </button>
              </div>
              <p className="text-lg text-gray-700 mb-6 text-center">{modalMessage}</p>
              <div className="flex justify-center">
                  <Button 
                      onClick={() => setModalMessage("")}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  >
                      OK
                  </Button>
              </div>
          </div>
        </div>
      }
    </>
  )
}