"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { getUserMatch } from "../users/get";

export const sendMessage = async (message: string, interlocutorId: string) =>
{
    //console.log(message);

    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return JSON.stringify({ success: false, message: "Vous n'êtes pas authentifié" });
    }

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return JSON.stringify({ success: false, message: "Cet utilisateur n'existe pas" });
    }

    ///////////////////////////

    const match: boolean = await getUserMatch(interlocutorId);
    
    if(!match)
    {
        return JSON.stringify({ success: false, message: "Vous ne pouvez pas échanger avec cette personne" });
    }

    ///////////////////////////

    const talksRef = db.collection("talks");

    const query1 = talksRef
    .where("id1", "==", session.user.id)
    .where("id2", "==", interlocutorId);

    const query2 = talksRef
    .where("id1", "==", interlocutorId)
    .where("id2", "==", session.user.id);

    const [snapshot1, snapshot2] = await Promise.all([query1.get(), query2.get()]);

    const results = [...snapshot1.docs, ...snapshot2.docs];

    if(results.length === 0)
    {
        return JSON.stringify({ success: false, message: "Conversation non trouvée" });
    }

    const talkRef = results[0];
    const talk = talkRef.data();

    talk.messages.push({ id: session.user.id, content: message, createAt: Date.now() });

    talkRef.ref.update(talk);

    return JSON.stringify({ success: true, message: "Ok" });
}