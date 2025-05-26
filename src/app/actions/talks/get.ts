"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import cloudinary from 'cloudinary';
import { getUserMatch } from "../users/get";

export const getTalk = async (interlocutorId: string) =>
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
        return JSON.stringify({ success: false, message: "User does not exit" });
    }

    ///////////////////////////

    const match: boolean = await getUserMatch(interlocutorId);

    if(!match)
    {
        return JSON.stringify({ success: false, message: "No match" });
    }

    ///////////////////////////

    const talksRef = db.collection("talks").get();
    const talks = (await talksRef).docs;

    //console.log(interlocutorId);

    const indexTalk: number = talks.findIndex((talk) => talk.data().id1 === session.user.id && talk.data().id2 === interlocutorId || talk.data().id1 === interlocutorId && talk.data().id2 === session.user.id);

    if(indexTalk === -1)
    {
        await db.collection("talks").add({ id1: session.user.id, id2: interlocutorId, messages: [] });
        
        return JSON.stringify({ success: true, message: "Ok", messages: [] });
    }

    return JSON.stringify({ success: true, message: "Ok", messages: talks[indexTalk].data().messages });
}