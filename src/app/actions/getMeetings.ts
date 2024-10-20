"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";

export const getMeetings = async () =>
{
    const session = await getServerSession();
    
    if(!session)
    {
        return null;
    }
    
    const meetingsSnapshot = await db.collection("meetings").get();

    const meetings: any[] = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return JSON.stringify(meetings);
}