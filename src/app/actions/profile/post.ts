"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
//import { metadata } from "@/app/layout";

export const updateProfile = async (req: any) =>
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

    /*const res =
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
    }

    return JSON.stringify(res);*/

    //console.log(req);

    userRef.update({
        email: req.email,
        name: req.name,
        birthdate: req.dateOfBirth,
        city: req.city,
        zipcode: req.postalCode,
        country: req.country,
        phoneNumber: req.phoneNumber,
        gender: req.gender,
        search: req.search
    });

    return JSON.stringify(currentUser.data());
}

export const addImage = async (name: string) =>
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

    userRef.update({ photos: [ ...currentUser.data().photos, name ] });

    return JSON.stringify(currentUser.data());
}