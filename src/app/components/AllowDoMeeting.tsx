import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeetingById } from "../actions/meetings/get";
import { Meeting } from "../types";
import { meetingDuration } from "../api/variables/meetings";

export default function AllowDoMeeting({ children, id }: any)
{
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() =>
    {
        if(status === "unauthenticated")
        {
            router.push("/");
        }
        
        getMeetingById(id).then((res: string) =>
        {
            const meeting = JSON.parse(res);
            
            if (meeting.participants.indexOf(session?.user.id) == -1 || Date.now() < meeting.date._seconds * 1000 || Date.now() > meeting.date._seconds * 1000 + meetingDuration)
            {
                router.push("/");
            }
        });
    }, [status, router]);

    if (status === "loading")
    {
        return <div>Loading...</div>;
    }

    return session ? <>{children}</> : null;
}
