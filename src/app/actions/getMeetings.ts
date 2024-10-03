"use server"

import { db } from "@/firebase/config";

export const getMeetings = async () =>
{
    const meetingsSnapshot = await db.collection("meetings").get();

    const meetings: any[] = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return JSON.stringify(meetings);
}