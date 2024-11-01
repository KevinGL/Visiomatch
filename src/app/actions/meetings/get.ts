"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { meetingDuration } from "@/app/api/variables/meetings";
import { Meeting } from "@/app/types";

export const getMeetingsFiltered = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    //console.log(session.user.id);

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }
    
    const meetingsSnapshot = await db.collection("meetings").get();

    const meetings: Meeting[] = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        age: doc.data().age,
        orientation: doc.data().orientation,
        participants: doc.data().participants,
        region: doc.data().region,
        date: new Date(doc.data().date._seconds * 1000)
    }));

    //console.log(currentUser.data());

    const meetingsFiltered = meetings.filter((m: Meeting) =>
    {
        let orientation: string = `${currentUser.data()?.gender}_${currentUser.data()?.search}`;

        if(orientation == "woman_man")
        {
            orientation = "man_woman";
        }

        const date = new Date(m.date);

        return m.orientation == orientation && date.getTime() > Date.now();
    });

    return JSON.stringify(meetingsFiltered);
}

export const getMeetingById = async (id: string) =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    //console.log(session.user.id);

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }
    
    const meetingsSnapshot = db.collection("meetings").doc(id);

    return JSON.stringify((await meetingsSnapshot.get()).data());
}

export const getUserNextMeetings = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    const meetingsSnapshot = db.collection("meetings").where("participants", "array-contains", session.user.id);

    const meetings: Meeting[] = [];

    (await meetingsSnapshot.get()).docs.map((m: any) =>
    {
        console.log(Date.now(), m.data().date._seconds * 1000 + meetingDuration);

        if(Date.now() <= m.data().date._seconds * 1000 + meetingDuration)
        {
            meetings.push({...m.data(), id: m.id});
        }
    });

    return JSON.stringify(meetings);
}

export const getMeetings = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    //console.log(session.user.id);

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }

    if(!currentUser.data().admin)
    {
        return "";
    }
    
    const meetingsSnapshot = await db.collection("meetings").get();

    let meetings = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        age: doc.data().age,
        orientation: doc.data().orientation,
        participants: doc.data().participants.length,
        region: doc.data().region,
        date: doc.data().date._seconds * 1000
    }));

    meetings = meetings.sort((a, b) => { return a.date > b.date ? 1 : -1 });

    //console.log(currentUser.data());

    return JSON.stringify(meetings);
}