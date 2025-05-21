"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { ages, meetingDuration, orientations, regions } from "@/app/api/variables/meetings";
import { time } from "console";
import { decodeId } from "@/app/utils";

export const getMeetingsFiltered = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    //console.log(session.user.id);

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }

    const users = await db.collection("users").get();
    
    /*const meetingsSnapshot = await db.collection("meetings").get();

    const meetings: Meeting[] = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        age: doc.data().age,
        orientation: doc.data().orientation,
        participants: doc.data().participants,
        region: doc.data().region,
        date: new Date(doc.data().date._seconds * 1000)
    }));

    //console.log(currentUser.data());

    const meetingsFiltered = meetings.filter((m: Meeting) =>
    {
        let orientation: string = `${currentUser.data()?.gender}_${currentUser.data()?.search}`;

        if(orientation == "woman_man")
        {
            orientation = "man_woman";
        }

        const date = new Date(m.date);

        return m.orientation == orientation && date.getTime() > Date.now();
    });

    return JSON.stringify(meetingsFiltered);*/

    const date = new Date(Date.now());

    //console.log(date.getDay());

    let meetings = [];

    const currentDay: number = date.getDay() == 0 ? 7 : date.getDay();
    const currentDate: number = date.getDate();
    const currentMonth: number = date.getMonth() + 1;
    const currentYear: number = date.getFullYear();

    const currentDate2 = currentDate.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });

    const currentMonth2 = currentMonth.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });

    const today20: Date = new Date(`${currentYear}-${currentMonth2}-${currentDate2}T20:00:00`);

    //console.log(today.getTime());
    let timestamp = today20.getTime();

    for(let i = currentDay ; i <= 7 ; i++)
    {
        if(i == 2 || i == 4 || i == 7)
        {
            ages.forEach((age: string) =>
            {
                regions.forEach((region: string) =>
                {
                    let orientation: string = `${currentUser.data()?.gender}_${currentUser.data()?.search}`;

                    if(orientation == "woman_man")
                    {
                        orientation = "man_woman";
                    }

                    let participants = [];

                    getParticipants(users.docs, age, region, orientation, timestamp, participants);

                    //console.log(timestamp, new Date(timestamp), region);

                    if(Date.now() <= timestamp)
                    {
                        meetings.push({
                            age: age,
                            date: new Date(timestamp),
                            orientation: orientation,
                            region: region,
                            participants: participants
                        });
                    }
                });
            });
        }

        timestamp += 24 * 3600 * 1000;
    }

    for(let i = 1 ; i <= 7 ; i++)       //Next week
    {
        if(i == 2 || i == 4 || i == 7)
        {
            ages.forEach((age: string) =>
            {
                regions.forEach((region: string) =>
                {
                    let orientation: string = `${currentUser.data()?.gender}_${currentUser.data()?.search}`;

                    if(orientation == "woman_man")
                    {
                        orientation = "man_woman";
                    }

                    const date: Date = new Date(timestamp);

                    let participants = [];

                    getParticipants(users.docs, age, region, orientation, timestamp, participants);

                    //console.log(participants);

                    if(Date.now() <= timestamp)
                    {
                        meetings.push({
                            age: age,
                            date: date,
                            orientation: orientation,
                            region: region,
                            participants: participants
                        });
                    }
                });
            });
        }

        timestamp += 24 * 3600 * 1000;
    }

    return JSON.stringify(meetings);
}

//const getParticipants = async(users: any[], age: string, region: string, orientation: string, timestamp: number, currentUser: string, participants: string[]) =>
const getParticipants = (users: any[], age: string, region: string, orientation: string, timestamp: number, participants: string[]) =>
{
    users.map((user) =>
    {
        const participations = user.data().participations;

        participations.map((p) =>
        {
            //if(p.region == region && p.ageRange == age && p.orientation == orientation && new Date(p.date).getTime() == timestamp && user.id != currentUser)
            if(p.region == region && p.ageRange == age && p.orientation == orientation && new Date(p.date).getTime() == timestamp)
            {
                participants.push(user.id);
            }
        });
    });
}

const getNumParticipants = (users: any[], age: string, region: string, orientation: string, timestamp: number) =>
{
    let numParticipants: number = 0;
    
    users.map((user) =>
    {
        const participations = user.data().participations;

        participations.map((p) =>
        {
            if(p.region == region && p.ageRange == age && p.orientation == orientation && new Date(p.date).getTime() == timestamp)
            {
                numParticipants++;
            }
        });
    });

    return numParticipants;
}

export const getMeetingById = async (id: string) =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    //console.log(session.user.id);

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }
    
    const meetingsSnapshot = db.collection("meetings").doc(id);

    let meetings = [];

    //console.log((await meetingsSnapshot.get()).data());

    (await meetingsSnapshot.get()).data().map((m) =>
    {
        console.log(m);
    });

    return JSON.stringify((await meetingsSnapshot.get()).data());
}

export const getUserNextMeetings = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }

    const users = await db.collection("users").get();

    let meetings = [];

    currentUser.data().participations.map((p: any) =>
    {
        //console.log(new Date(p.date).getTime(), p.date, p.region);
        
        if(new Date(p.date).getTime() + meetingDuration > Date.now())
        {
            let participants = [];

            getParticipants(users.docs, p.ageRange, p.region, p.orientation, new Date(p.date).getTime(), participants);

            meetings.push({
                ...p,
                participants: participants
            });
        }
    });

    return JSON.stringify(meetings);
}

export const getMeetings = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    //console.log(session.user.id);

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = await userRef.get();

    if(!currentUser.exists)
    {
        return "";
    }

    if(!currentUser.data().admin)
    {
        return "";
    }
    
    const meetingsSnapshot = await db.collection("meetings").get();

    let meetings = meetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        age: doc.data().age,
        orientation: doc.data().orientation,
        participants: doc.data().participants.length,
        region: doc.data().region,
        date: doc.data().date._seconds * 1000
    }));

    meetings = meetings.sort((a, b) => { return a.date > b.date ? 1 : -1 });

    //console.log(currentUser.data());

    return JSON.stringify(meetings);
}

export const validDoMeeting = async (id) =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return { success: false, message: "Unauthenticated" };
    }

    const values = decodeId(id)[0].split(",");

    const meeting =
    {
        ageRange: values[0],
        date: parseInt(values[1]),
        orientation: values[2],
        region: values[3]
    };

    /*if(meeting.date + meetingDuration < Date.now())
    {
        //console.log("Séance expirée");
        return { success: false, message: "Séance expirée" };
    }

    if(meeting.date > Date.now())
    {
        //console.log("Séance non démarrée");
        return { success: false, message: "Séance non démarrée" };
    }*/

    const userRef = db.collection("users").doc(session.user.id);
    const currentUser = (await userRef.get()).data();

    const registered = currentUser.participations.some(p => 
        {
            //console.log((new Date(p.date)).getTime(), meeting.date, p.region, decodeURIComponent(meeting.region), p.ageRange, meeting.ageRange, p.orientation, meeting.orientation);

            return(
                (new Date(p.date)).getTime() === meeting.date &&
                p.region === decodeURIComponent(meeting.region) &&
                p.ageRange === decodeURIComponent(meeting.ageRange) &&
                p.orientation === decodeURIComponent(meeting.orientation)
            )
        }
    );

    if(!registered)
    {
        //console.log("Vous n'êtes pas inscrit à cette séance");
        return { success: false, message: "Vous n'êtes pas inscrit à cette séance" };
    }

    return { success: true, message: "OK" };
}