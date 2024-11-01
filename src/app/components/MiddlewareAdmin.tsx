import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../actions/users/get";

export default function MiddlewareAdmin({ children }: { children: React.ReactNode })
{
  const { data: session, status } = useSession();
  const router = useRouter();

    useEffect(() =>
    {
        if (status === "unauthenticated")
        {
            router.push("/");
        }

        getCurrentUser()
        .then((res: any) =>
        {
            const currentUser = JSON.parse(res);

            if(!currentUser.admin)
            {
                router.push("/");
            }
        })
        .catch(() =>
        {
            router.push("/");
        });

    }, [status, router]);

    return session ? <>{children}</> : null;
}
