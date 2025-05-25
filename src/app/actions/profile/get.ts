"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
//import { metadata } from "@/app/layout";

export const getProfile = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }

    const res =
    {
        birthdate: currentUser.data()?.birthdate,
        email: currentUser.data()?.email,
        gender: currentUser.data()?.gender,
        search: currentUser.data()?.search,
        name: currentUser.data()?.name,
        city: currentUser.data()?.city,
        zipcode: currentUser.data()?.zipcode,
        country: currentUser.data()?.country,
        phoneNumber: currentUser.data()?.phoneNumber,
        photos: currentUser.data()?.photos
    }

    return JSON.stringify(res);
}