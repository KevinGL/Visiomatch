"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";

export const addCurrentuserToMeeting = async (id: string) =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return;
    }
    
    const ref = db.collection("meetings").doc(id);

    let meeting = (await ref.get()).data();

    if(meeting && meeting.participants.indexOf(session.user.id) == -1)
    {
        meeting.participants.push(session.user.id);
        await ref.update({ participants: meeting.participants });
    }
}