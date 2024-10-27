'use client'

import * as React from 'react'
import { CalendarDays, MapPin, Mail, User, Hash, Globe, Phone, Edit2, Save, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AuthGuard from '../components/AuthGuard'
import Navbar from '../components/navbar'
import { useEffect } from 'react'
import { getProfile } from '../actions/profile/get'
import { updateProfile } from '../actions/profile/post'

export default function ProfileDisplayEdit() {
  const [isEditing, setIsEditing] = React.useState(false)
  const [userData, setUserData] = React.useState({
    email: 'john.doe@example.com',
    name: 'JohnD',
    dateOfBirth: "01-01-2000",
    city: 'New York',
    postalCode: '10001',
    country: 'United States',
    phoneNumber: '+1 (555) 123-4567',
    gender: 'male',
    search: 'female',
  })

    useEffect(() =>
    {
        getProfile().then((res: any) =>
        {
            const user = JSON.parse(res);

            setUserData({
                email: user.email,
                name: user.name,
                dateOfBirth: user.birthdate,
                city: user.city,
                postalCode: user.zipcode,
                country: user.country,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                search: user.search
            });
        });
    }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setUserData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting profile data:', userData);
    setIsEditing(false);

    updateProfile({ ...userData });
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <AuthGuard>
        <div className="min-h-screen bg-pink-50">
            <Navbar/>
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-pink-600">Votre profil</h1>
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-pink-600 hover:bg-pink-700 text-white"
                                >
                                {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}
                                {isEditing ? 'Masquer' : 'Modifier Profil'}
                            </Button>
                        </div>

                        <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <User className="w-5 h-5 text-pink-600 mr-2" />
                                <span className="font-semibold">Pseudo:</span>
                                <span className="ml-2">{userData.name}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarDays className="w-5 h-5 text-pink-600 mr-2" />
                                <span className="font-semibold">Age:</span>
                                <span className="ml-2">{calculateAge(userData.dateOfBirth)} ans</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 text-pink-600 mr-2" />
                                <span className="font-semibold">Ville:</span>
                                <span className="ml-2">{userData.city}</span>
                            </div>
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 text-pink-600 mr-2" />
                                <span className="font-semibold">Pays:</span>
                                <span className="ml-2">{userData.country}</span>
                            </div>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="email">Adresse email
                                    </Label>
                                    <div className="flex items-center mt-1">
                                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={userData.email}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="nickname">Pseudo</Label>
                                    <div className="flex items-center mt-1">
                                    <User className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="nickname"
                                        name="name"
                                        required
                                        value={userData.name}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                                    <div className="flex items-center mt-1">
                                    <CalendarDays className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        value={userData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="city">Ville</Label>
                                    <div className="flex items-center mt-1">
                                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="city"
                                        name="city"
                                        required
                                        value={userData.city}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="postalCode">Code postal</Label>
                                    <div className="flex items-center mt-1">
                                    <Hash className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        required
                                        value={userData.postalCode}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="country">Pays</Label>
                                    <div className="flex items-center mt-1">
                                    <Globe className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="country"
                                        name="country"
                                        required
                                        value={userData.country}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                                    <div className="flex items-center mt-1">
                                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        value={userData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="flex-grow"
                                    />
                                    </div>
                                </div>

                                <div>
                                    <Label>Genre</Label>
                                    <RadioGroup
                                        name="gender"
                                        onValueChange={handleSelectChange('gender')}
                                        defaultValue={userData.gender}
                                        className="flex space-x-4 mt-1"
                                        onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                                        >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="man" id="male" />
                                            <Label htmlFor="male">Homme</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="woman" id="female" />
                                            <Label htmlFor="female">Femme</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label>Recherche</Label>
                                    <RadioGroup
                                        name="seeking"
                                        onValueChange={handleSelectChange('seeking')}
                                        defaultValue={userData.search}
                                        className="flex space-x-4 mt-1"
                                        onChange={(e) => setUserData({ ...userData, search: e.target.value })}
                                        >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="man" id="seeking-male" />
                                            <Label htmlFor="seeking-male">Homme</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="woman" id="seeking-female" />
                                            <Label htmlFor="seeking-female">Femme</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                                    Sauvegarder
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <User className="w-5 h-5 text-pink-600 mr-2" />
                                    <span className="font-semibold">Genre:</span>
                                    <span className="ml-2">{userData.gender == "man" ? "Homme" : "Femme"}</span>
                                </div>
                                <div className="flex items-center">
                                    <Heart className="w-5 h-5 text-pink-600 mr-2" />
                                    <span className="font-semibold">Recherche:</span>
                                    <span className="ml-2">{userData.search == "man" ? "Homme" : "Femme"}</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-pink-600 mr-2" />
                                    <span className="font-semibold">Email:</span>
                                    <span className="ml-2">{userData.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-pink-600 mr-2" />
                                    <span className="font-semibold">Tél:</span>
                                    <span className="ml-2">{userData.phoneNumber}</span>
                                </div>
                                <div className="flex items-center">
                                    <Hash className="w-5 h-5 text-pink-600 mr-2" />
                                    <span className="font-semibold">Code postal:</span>
                                    <span className="ml-2">{userData.postalCode}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </AuthGuard>
  )
}