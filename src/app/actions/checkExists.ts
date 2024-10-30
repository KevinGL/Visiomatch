"use server"

import { db } from "@/firebase/config";
import { User } from "next-auth";

export const checkExists = async (email: string) =>
{
    const usersSnapshot = await db.collection("users").get();
    const usersList = usersSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    const user: User = usersList.filter((u: User) => u.email == email)[0];

    if(user)
    {
        return true;
    }
    else
    {
        return false;
    }
}