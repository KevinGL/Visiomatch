"use client"

import * as React from 'react'
import Image from 'next/image'
import { CalendarDays, MapPin, Users, Video } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { getUserNextMeetings } from '../actions/meetings/get'
import { imgPaths, meetingDuration, regions } from '../api/variables/meetings'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// Sample data for meetings
const meetings = [
  {
    id: 1,
    title: "Coffee and Chat",
    ageGroup: "25-35",
    region: "New York, USA",
    participants: 8,
    imageUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 2,
    title: "Hiking Adventure",
    ageGroup: "30-40",
    region: "Colorado, USA",
    participants: 12,
    imageUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 3,
    title: "Book Club Meetup",
    ageGroup: "20-30",
    region: "London, UK",
    participants: 6,
    imageUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 4,
    title: "Wine Tasting Evening",
    ageGroup: "35-45",
    region: "Paris, France",
    participants: 10,
    imageUrl: "/placeholder.svg?height=100&width=200",
  },
  // Add more meetings as needed
]

export default function MeetingsList() {

  const [meetings, setMeetings] = useState<any[]>([]);
  const router = useRouter();

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
              const date = new Date(d.date._seconds * 1000);
              const imageUrl: string = `/img/meetings/${d.orientation}/${pathsArray[indexPath]}`;

              meetings2.push({ id: d.id, imageUrl, ageGroup: d.age, participants: d.participants.length, title: `Le ${date.toLocaleDateString('fr-FR',
                { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}` , region: regions.get(d.region), date });
            });
          
            setMeetings(meetings2);
        });
    }, []);

  return (
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
                  <span>{meeting.participants} participants</span>
                </div>
              </div>
            </CardContent>
            {
              Date.now() >= meeting.date?.getTime() && Date.now() <= meeting.date?.getTime() + meetingDuration &&

              <CardFooter>
                <Button 
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={() => router.push(`/do_meeting/${meeting.id}`)}
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
  )
}