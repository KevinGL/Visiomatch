"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
//import { metadata } from "@/app/layout";

export const getCurrentUser = async () =>
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
        admin: currentUser.data()?.admin
    }

    return JSON.stringify(res);
}

export const getIfSubscribed = async(meeting: any) =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return false;
    }

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return false;
    }

    let orientation: string = `${currentUser.data().gender}_${currentUser.data().search}`;

    if(orientation == "woman_man")
    {
        orientation = "man_woman";
    }

    const isAlreadyRegistered = currentUser.data().participations.some(p => 
        p.date === meeting.date &&
        p.region === meeting.region &&
        p.ageRange === meeting.ageRange &&
        p.orientation === orientation
    );

    return isAlreadyRegistered;
}