"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { orientations } from "@/app/api/variables/meetings";
//import { metadata } from "@/app/layout";

export const addCurrentuserToMeeting = async (meeting: any) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }

        //meeting.date = "2025-01-09T19:00:00.000Z";

        if(new Date(meeting.date).getTime() < Date.now())
        {
            return { success: false, message: "Séance expirée" };
        }
        
        const userRef = db.collection("users").doc(session.user.id);
        const currentUser = (await userRef.get()).data();

        //console.log(meeting);

        let orientation: string = `${currentUser.gender}_${currentUser.search}`;

        if(orientation == "woman_man")
        {
            orientation = "man_woman";
        }

        const isAlreadyRegistered = currentUser.participations.some(p => 
            p.date === meeting.date &&
            p.region === meeting.region &&
            p.ageRange === meeting.ageRange &&
            p.orientation === orientation
        );

        if(isAlreadyRegistered)
        {
            return { success: false, message: "Vous êtes déjà inscrit à cette séance" };
        }

        currentUser.participations.push({ date: meeting.date, region: meeting.region, ageRange: meeting.ageRange, orientation: orientation });
        //console.log(currentUser.participations);
        await userRef.update({ participations: currentUser.participations });

        return { success: true, message: "Séance réservée" };
    }
    catch (error: any)
    {
        return { success: false, message: error.message };
    }
}

export const delCurrentuserToMeeting = async (meeting) =>
{
    try
    {
        const session = await getServerSession(authOptions);
    
        if(!session)
        {
            return { success: false, message: "Unauthenticated" };
        }

        const userRef = db.collection("users").doc(session.user.id);
        const currentUser = (await userRef.get()).data();

        let orientation: string = `${currentUser.gender}_${currentUser.search}`;

        if(orientation == "woman_man")
        {
            orientation = "man_woman";
        }
        
        const index = currentUser.participations.findIndex(p => 
            p.date === meeting.date &&
            p.region === meeting.region &&
            p.ageRange === meeting.ageRange &&
            p.orientation === orientation
        );

        currentUser.participations.splice(index, 1);

        await userRef.update({ participations: currentUser.participations });

        return { success: true, message: "Séance annulée" };
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
