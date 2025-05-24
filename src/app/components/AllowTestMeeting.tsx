import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeetingById, getUserNextMeetings, validDoMeeting } from "../actions/meetings/get";
import { meetingDuration, orientations } from "../api/variables/meetings";
import { getCurrentUser } from "../actions/users/get";

export default function AllowTestMeeting({ children }: { children: React.ReactNode })
{
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() =>
    {
        if(status === "unauthenticated")
        {
            router.push("/");
        }

        getCurrentUser().then((res) =>
        {
            if(!JSON.parse(res).admin)
            {
                router.push("/");
            }

            return session ? <>{children}</> : null;
        });
    }, [status, session]);

    return <div>Loading ...</div>;
}