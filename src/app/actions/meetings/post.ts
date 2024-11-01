"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
//import { metadata } from "@/app/layout";

export const addCurrentuserToMeeting = async (id: string) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }
        
        const ref = db.collection("meetings").doc(id);
        const meeting = (await ref.get()).data();
        
        const meetingsRef = db.collection("meetings");
        const querySnapshot = await meetingsRef.get();

        let sameTime = false;
        
        querySnapshot.forEach((doc) =>
        {
            if(doc.id != id && doc.data().participants.indexOf(session.user.id) != -1 && meeting?.date._seconds == doc.data().date._seconds)
            {
                sameTime = true;
            }
        });

        if(meeting)
        {
            if(meeting.participants.indexOf(session.user.id) != -1)
            {
                return { success: false, message: "Vous êtes déjà inscrit à cette séance" };
            }

            else
            if(sameTime)
            {
                return { success: false, message: "Vous ne pouvez pas vous inscrire à deux séances simultanées" };
            }

            else
            {
                meeting.participants.push(session.user.id);
                await ref.update({ participants: meeting.participants });
    
                return { success: true, message: "Confirmation de votre inscription" };
            }
        }
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}

export const delCurrentuserToMeeting = async (id: string) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }
        
        const ref = db.collection("meetings").doc(id);

        let meeting = (await ref.get()).data();

        const index: number = meeting?.participants.indexOf(id);

        if(meeting && index == -1)
        {
            meeting.participants.splice(index, 1);
            
            await ref.update({ participants: meeting.participants });

            return { success: true, message: "Confirmation de l'annulation" };
        }
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}

export const addMeeting = async (req) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }

        const userRef = db.collection("users").doc(session.user.id);
        const currentUser = await userRef.get();

        if(!currentUser.exists)
        {
            return { success: false, message: "User not found" };
        }

        if(!currentUser.data().admin)
        {
            return { success: false, message: "User not admin" };
        }
        
        const meetingsRef = db.collection("meetings");

        meetingsRef.add({
            age: req.ageGroup,
            date: new Date(req.date),
            orientation: req.orientation,
            region: req.region,
            participants: []
        });

        return { success: true, message: "Add ok" };
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}

export const delMeeting = async (id: string) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }

        const userRef = db.collection("users").doc(session.user.id);
        const currentUser = await userRef.get();

        if(!currentUser.exists)
        {
            return { success: false, message: "User not found" };
        }

        if(!currentUser.data().admin)
        {
            return { success: false, message: "User not admin" };
        }
        
        const ref = db.collection("meetings").doc(id);

        ref.delete();

        return { success: true, message: "Delete ok" };
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}

export const editMeeting = async (id: string, req) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }

        const userRef = db.collection("users").doc(session.user.id);
        const currentUser = await userRef.get();

        if(!currentUser.exists)
        {
            return { success: false, message: "User not found" };
        }

        if(!currentUser.data().admin)
        {
            return { success: false, message: "User not admin" };
        }
        
        const ref = db.collection("meetings").doc(id);

        ref.update({ ...req });

        //console.log(req);

        return { success: true, message: "Update ok" };
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}