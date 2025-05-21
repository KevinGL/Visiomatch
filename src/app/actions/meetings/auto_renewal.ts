"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";

let intervalId: NodeJS.Timeout | undefined;

const renewal = async() =>
{
    const meetingsRef = db.collection("meetings").get();

    (await meetingsRef).docs.map(async (meeting: any) =>
    {
        const id: string = meeting.id;
        const docRef = db.collection("meetings").doc(id);

        const datas = (await docRef.get()).data();

        //console.log(id, (await docRef.get()).data());

        if(datas.date._seconds * 1000 < Date.now())
        {
            const newTimestamp = datas.date._seconds * 1000 + 7 * 24 * 3600 * 1000;
            
            const updatedData = { ...datas, date: new Date(newTimestamp) };

            try
            {
                await docRef.update(updatedData);
            }
            catch(error)
            {
                console.log(error);
            }
        }
    });
}

export const autoRenawalMeeting = async (activate: boolean) =>
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

    if(activate)
    {
        if(intervalId)
        {
            clearInterval(intervalId);
        }

        intervalId = setInterval(async () =>
        {
            await renewal();
        }, 10000);
    }

    else
    {
        console.log(intervalId);
        
        if (intervalId)
        {
            clearInterval(intervalId);
            intervalId = undefined;
        }
    }
}