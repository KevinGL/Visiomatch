"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";

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

    const meetings: any[] = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        age: doc.data().age,
        orientation: doc.data().orientation,
        participants: doc.data().participants,
        region: doc.data().region,
        date: new Date(doc.data().date._seconds * 1000)
    }));

    //console.log(currentUser.data());

    const meetingsFiltered = meetings.filter((m: any) =>
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