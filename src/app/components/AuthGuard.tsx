import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode })
{
  const { data: session, status } = useSession();
  const router = useRouter();

    useEffect(() =>
    {
        if (status === "unauthenticated")
        {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading")
    {
        return <div>Loading...</div>;
    }

    return session ? <>{children}</> : null;
}
