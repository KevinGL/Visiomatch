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
    const [valueReturn, setValueReturn] = useState(<div>Loading ...</div>)

    useEffect(() =>
    {
        //console.log(session, status);
        
        if(status === "unauthenticated")
        {
            router.push("/");
        }

        /*getCurrentUser().then((res: string) =>
        {
            if(!JSON.parse(res).admin)
            {
                router.push("/");
            }

            else
            {
                setValueReturn(<>{children}</>);
            }
        });*/

        else
        if(status === "authenticated")
        {
            if(session.user.admin)
            {
                setValueReturn(<>{children}</>);
            }

            else
            {
                router.push("/");
            }
        }
    }, [status, session]);

    return valueReturn;
}