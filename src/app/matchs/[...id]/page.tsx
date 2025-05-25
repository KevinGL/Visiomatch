"use client"

import { getUserMatch } from "@/app/actions/users/get";
import { decodeId } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function getMatch(params)
{
    //console.log(params.params.id[0]);

    const [match, setMatch] = useState(null);
    const router = useRouter();

    useEffect(() =>
    {
        const getMatch = async () =>
        {
            const match = await getUserMatch(decodeId(params.params.id[0])[0]);
            //console.log(match);

            if(match === "")
            {
                router.push("/matchs");
            }

            else
            {
                setMatch(JSON.parse(match as string));
            }
        }

        getMatch();
    }, []);

    return (
        <>
            {
                match === null &&

                <div>Loading ...</div>
            }

            {
                match !== null &&

                <div>MATCHS</div>
            }
        </>
    )
}