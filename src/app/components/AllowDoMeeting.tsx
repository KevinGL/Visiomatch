import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeetingById, getUserNextMeetings, validDoMeeting } from "../actions/meetings/get";
import { meetingDuration, orientations } from "../api/variables/meetings";

export default function AllowDoMeeting({ children, idMeeting }: any)
{
    const { data: session, status } = useSession();
    const router = useRouter();
    const [valueReturn, setValueReturn] = useState(<>Loading ...</>);

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

                else
                {
                    setValueReturn(children);
                }
            })
            .catch(() =>
            {
                router.push("/");
            });
        }
    }, [status, router]);

    return valueReturn;
}
