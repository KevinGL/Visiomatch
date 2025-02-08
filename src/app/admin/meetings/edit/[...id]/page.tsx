'use client'

import * as React from 'react'
import { CalendarDays, Users, MapPin, Heart, } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MiddlewareAdmin from '@/app/components/MiddlewareAdmin'
import { useEffect, useState } from 'react'
import Navbar from '@/app/components/navbar'
import { getMeetingById } from '@/app/actions/meetings/get'
import { editMeeting } from '@/app/actions/meetings/post'

const formatDateToLocal = (date) =>
{
    console.log(date);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditMeetingForm({ params }: any) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ageGroup: '',
    orientation: '',
    region: '',
    date: null
  })

    useEffect(() =>
    {
        getMeetingById(params.id[0])
        .then((res) =>
        {
            const meeting = JSON.parse(res);

            setFormData({
                ageGroup: meeting.age,
                orientation: meeting.orientation,
                region: meeting.region,
                date: new Date(meeting.date._seconds * 1000)
            });
        });
    }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        setFormData({ ...formData, date: new Date(e.target.value) });
    }

  const valid = () =>
  {
    editMeeting(params.id[0], formData)
    .then(() =>
    {
        alert("Séance mise à jour");
        router.push("/admin/meetings");
    })
    .catch((res) =>
    {
        alert(res.message);
    });
  }

  return (
    <MiddlewareAdmin>
        <div className="min-h-screen bg-pink-50">
            <Navbar />
            <div className="container mx-auto p-4">
                <div className="container mx-auto p-4"></div>
                <div className="container mx-auto p-4 max-w-md">
                    <h1 className="text-3xl font-bold text-pink-600 mb-6">Modifier séance</h1>
                    <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
                        <div>
                            <Label htmlFor="ageGroup">Tranche d'âge</Label>
                            <div className="flex items-center mt-1">
                                <Users className="w-5 h-5 text-gray-400 mr-2" />
                                <Input
                                    id="ageGroup"
                                    name="ageGroup"
                                    value={formData.ageGroup}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 25-35"
                                    className="flex-grow"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="orientation">Orientation</Label>
                            <div className="flex items-center mt-1">
                                <Heart className="w-5 h-5 text-gray-400 mr-2" />
                                <Select name="orientation" value={formData.orientation} onValueChange={handleSelectChange('orientation')} >
                                    <SelectTrigger className="flex-grow">
                                        <SelectValue placeholder="Sélectionner orientation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="man_woman">Homme femme</SelectItem>
                                        <SelectItem value="man_man">Homme homme</SelectItem>
                                        <SelectItem value="woman_woman">Femme femme</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="region">Région</Label>
                            <div className="flex items-center mt-1">
                                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                                <Input
                                    id="region"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleInputChange}
                                    placeholder="e.g. SE"
                                    className="flex-grow"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="date">Date</Label>
                            <div className="flex items-center mt-1">
                                <CalendarDays className="w-5 h-5 text-gray-400 mr-2" />
                                <Input
                                    id="date"
                                    name="date"
                                    type="datetime-local"
                                    value={formData.date ? formatDateToLocal(formData.date) : ""}
                                    onChange={handleDateChange}
                                    className="flex-grow"
                                />
                            </div>
                        </div>

                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={valid}>
                            Valider
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </MiddlewareAdmin>
  )
}