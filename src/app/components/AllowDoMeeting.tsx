import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeetingById, getUserNextMeetings, validDoMeeting } from "../actions/meetings/get";
import { Meeting } from "../types";
import { meetingDuration, orientations } from "../api/variables/meetings";

export default function AllowDoMeeting({ children, meeting }: any)
{
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
            validDoMeeting({ ageRange: meeting.params[0], date: parseInt(meeting.params[1]), orientation: meeting.params[2], region: meeting.params[3] })
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
