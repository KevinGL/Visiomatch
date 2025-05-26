"use client"

import { getUserFromId, getUserMatch } from "@/app/actions/users/get";
import AuthGuard from "@/app/components/AuthGuard";
import { Carousel } from "@/app/components/Carousel";
import Navbar from "@/app/components/navbar";
import { decodeId } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays, Camera, MessageCircle, Globe, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

export default function DisplayUser(params)
{
    //console.log(params.params.id[0]);

    const [userData, setUserData] = useState(null);
    const [isMatch, setIsMatch] = useState<boolean>(false);
    const [displayPhotos, setDisplayPhotos] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() =>
    {
        const getUser = async () =>
        {
            const user = await getUserFromId(decodeId(params.params.id[0])[0]);
            //console.log(match);

            if(user === "")
            {
                router.push("/");
            }

            else
            {
                setUserData(JSON.parse(user as string));
            }

            const match: boolean = await getUserMatch(decodeId(params.params.id[0])[0]);

            setIsMatch(match);
        }

        getUser();
    }, []);

    const calculateAge = (birthDate: string) =>
    {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
        {
            age--;
        }

        return age;
    }

    return (
        <AuthGuard>
            {
                userData === null &&

                <div>Loading ...</div>
            }

            {
                userData !== null &&

                <div className="min-h-screen bg-pink-50">
                    <Navbar/>

                    {
                        !displayPhotos &&
                
                        <div className="container mx-auto p-4 max-w-2xl">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex flex-col items-center">
                                            <h1 className="text-3xl font-bold text-pink-600 mb-4">{ userData.name }</h1>
                                            {
                                                userData.photos.length > 0 &&

                                                <CldImage
                                                    src={userData.photos[0]}
                                                    alt={userData.photos[0]}
                                                    width="300"
                                                    height="300"
                                                    crop={{
                                                        type: "auto",
                                                        source: true
                                                    }}
                                                    className="rounded-lg"
                                                />
                                            }

                                            {
                                                userData.photos.length === 0 &&

                                                <Image
                                                        src={userData.gender === "woman" ? "/img/icons/Woman.jpg" : "/img/icons/Man.jpg"}
                                                        alt={userData.gender}
                                                        width="135"
                                                        height="300"
                                                        className="rounded-lg"
                                                    />
                                            }
                                        </div>
                                    </div>

                                    <div className="flex flex-row-reverse justify-between items-center mb-6">
                                        {
                                            userData.photos.length > 0 &&
                                            
                                            <Button
                                                onClick={() => { setDisplayPhotos(true) }}
                                                className="bg-pink-600 hover:bg-pink-700 text-white"
                                                >
                                                <Camera className="mr-2 h-4 w-4" />
                                                Voir les photos
                                            </Button>
                                        }

                                        {
                                            isMatch &&

                                            <Button
                                                onClick={() => {}}
                                                className="bg-pink-600 hover:bg-pink-700 text-white"
                                                >
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                Discuter
                                            </Button>
                                        }
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
                                                <span className="ml-2">{calculateAge(userData.birthdate)} ans</span>
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

                                    <div className="space-y-6">
                                        <div className="flex flex-col">
                                            <div className="flex items-center mb-4">
                                                <User className="w-5 h-5 text-pink-600 mr-2" />
                                                <span className="font-semibold">À propos de { userData.name }:</span>
                                            </div>
                                            <span className="ml-2">{userData.describe}</span>
                                        </div>
                                    </div>
                                </div>                   
                            </div>
                        </div>
                    }

                    {
                        displayPhotos &&

                        <div className="container mx-auto p-4">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6 px-auto">
                                    <Button
                                        onClick={() => setDisplayPhotos(false)}
                                        className="bg-pink-600 hover:bg-pink-700 text-white mb-6"
                                        >
                                        <User className="mr-2 h-4 w-4" />
                                        Retour sur profil
                                    </Button>
                                    
                                    <Carousel images={userData.photos} />
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
        </AuthGuard>
    )
}