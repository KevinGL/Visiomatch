"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";

export const addCurrentuserToMeeting = async (id: string) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }
        
        const ref = db.collection("meetings").doc(id);

        let meeting = (await ref.get()).data();

        if(meeting && meeting.participants.indexOf(session.user.id) == -1)
        {
            meeting.participants.push(session.user.id);
            await ref.update({ participants: meeting.participants });

            return { success: true, message: "User added to meeting successfully." };
        }
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}

export const delCurrentuserToMeeting = async (id: string) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }
        
        const ref = db.collection("meetings").doc(id);

        let meeting = (await ref.get()).data();

        const index: number = meeting?.participants.indexOf();

        if(meeting && index == -1)
        {
            meeting.participants.splice(index, 1);
            
            await ref.update({ participants: meeting.participants });

            return { success: true, message: "User added to meeting successfully." };
        }
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}