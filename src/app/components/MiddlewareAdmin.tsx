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
        if(status === "unauthenticated")
        {
            router.push("/");
        }

        /*const getUser = async () =>
        {
            const res: string = await getCurrentUser();
            
            if(!JSON.parse(res).admin)
            {
                router.push("/");
            }

            else
            {
                setValueReturn(<>{children}</>);
            }
        }

        getUser();*/

        getCurrentUser().then((res: string) =>
        {
            if(!JSON.parse(res).admin)
            {
                router.push("/");
            }

            else
            {
                setValueReturn(<>{children}</>);
            }
        });
    }, [status, session]);

    return valueReturn;
}