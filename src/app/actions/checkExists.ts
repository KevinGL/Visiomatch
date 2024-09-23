"use server"

import { db } from "@/firebase/config";

export const checkExists = async (email: string) =>
{
    const usersSnapshot = await db.collection("users").get();
    const usersList = usersSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    const user: any = usersList.filter((u: any) => u.email == email)[0];

    if(user)
    {
        return true;
    }
    else
    {
        return false;
    }
}