import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeetingById, getUserNextMeetings, validDoMeeting } from "../actions/meetings/get";
import { meetingDuration, orientations } from "../api/variables/meetings";

export default function AllowDoMeeting({ children, idMeeting }: any)
{
    return children;
    
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() =>
    {
        if(status === "unauthenticated")
        {
            router.push("/");
        }

        //console.log(meeting.params);
        
        if(status === "authenticated" && session?.user)
        {
            //console.log(idMeeting.params[0]);
            
            validDoMeeting(idMeeting)
            .then((res) =>
            {
                if(!res.success)
                {
                    router.push("/");
                }
            })
            .catch(() =>
            {
                router.push("/");
            });
        }
    }, [status, router]);

    if (status === "loading")
    {
        return <div>Loading...</div>;
    }

    return session ? <>{children}</> : null;
}
