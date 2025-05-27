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

export const getUserFromId = async (id: string) =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    const currentUserRef = db.collection("users").doc(session.user.id);
    const currentUser = await currentUserRef.get();

    if(!currentUser.exists)
    {
        return "";
    }

    const userRef = db.collection("users").doc(id);
    const user = await userRef.get();

    return JSON.stringify(user.data());
}

export const getUserMatch = async (id: string) =>
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

    const likesRef = db.collection("likes");
    const likesDocs = (await likesRef.get()).docs;

    let likes = [];

    likesDocs.map((l) =>
    {
        likes.push(l.data());
    });

    //console.log(likes);

    const index: number = likes.findIndex((l) => l.emit === session.user.id && l.recept === id || l.emit === id && l.recept === session.user.id);
    //console.log(index);

    if(index === -1)
    {
        return false;
    }

    return true;
}

export const getAllUsers = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return JSON.stringify({ success: false, message: "Unauthenticated" });
    }

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return JSON.stringify({ success: false, message: "User does not exist" });
    }

    if(!currentUser.data().admin)
    {
        return JSON.stringify({ success: false, message: "Not admin" });
    }

    const usersRef = db.collection("users");

    let users = [];

    (await usersRef.get()).docs.map((user) =>
    {
        users.push({
            id: user.data().id,
            birthdate: user.data().birthdate,
            city: user.data().city,
            country: user.data().country,
            createdAt: user.data().createdAt,
            gender: user.data().gender,
            search: user.data().search
        });
    });

    return JSON.stringify({ success: true, users });
}