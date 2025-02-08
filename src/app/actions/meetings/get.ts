"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { meetingDuration } from "@/app/api/variables/meetings";
import { Meeting } from "@/app/types";
import { time } from "console";

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

    const ages: string[] =
    [
        "18 - 25",
        "26 - 35",
        "36 - 45",
        "46 - 55",
        "> 56"
    ];

    const regions: string[] =
    [
        "NO",
        "NE",
        "SE",
        "SO"
    ];

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

    const today: Date = new Date(`${currentYear}-${currentMonth2}-${currentDate2}T20:00:00`);

    //console.log(today.getTime());
    let timestamp = today.getTime();

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

                    getParticipants(users.docs, age, region, orientation, timestamp, session.user.id, participants);

                    //console.log(participants);

                    meetings.push({
                        age: age,
                        date: new Date(timestamp),
                        orientation: orientation,
                        region: region,
                        participants: participants
                    });
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

                    getParticipants(users.docs, age, region, orientation, timestamp, session.user.id, participants);

                    //console.log(participants);
                    
                    meetings.push({
                        age: age,
                        date: date,
                        orientation: orientation,
                        region: region,
                        participants: participants
                    });
                });
            });
        }

        timestamp += 24 * 3600 * 1000;
    }

    return JSON.stringify(meetings);
}

const getParticipants = async(users: any[], age: string, region: string, orientation: string, timestamp: number, currentUser: string, participants: string[]) =>
{
    /*db.collection("users").get().then((users) =>
    {
        users.docs.map((user) =>
        {
            const participations = user.data().participations;

            participations.map((p) =>
            {
                //console.log(p.region, region, p.ageRange, age, p.orientation, orientation, new Date(p.date).getTime(), timestamp);
                
                if(p.region == region && p.ageRange == age && p.orientation == orientation && new Date(p.date).getTime() == timestamp && user.id != currentUser)
                {
                    participants.push(user.id);

                    //console.log(p.region, p.ageRange, p.orientation);
                }
            });
        });
    });*/

    users.map((user) =>
    {
        const participations = user.data().participations;

        participations.map((p) =>
        {
            //console.log(p.region, region, p.ageRange, age, p.orientation, orientation, new Date(p.date).getTime(), timestamp);
            
            //if(p.region == region && p.ageRange == age && p.orientation == orientation && new Date(p.date).getTime() == timestamp && user.id != currentUser)
            if(p.region == region && p.ageRange == age && p.orientation == orientation && new Date(p.date).getTime() == timestamp)
            {
                participants.push(user.id);

                //console.log(p.region, p.ageRange, p.orientation);
            }
        });
    });
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

    return JSON.stringify((await meetingsSnapshot.get()).data());
}

export const getUserNextMeetings = async () =>
{
    const session = await getServerSession(authOptions);
    
    if(!session)
    {
        return "";
    }

    const meetingsSnapshot = db.collection("meetings").where("participants", "array-contains", session.user.id);

    const meetings: Meeting[] = [];

    (await meetingsSnapshot.get()).docs.map((m: any) =>
    {
        //console.log(Date.now(), m.data().date._seconds * 1000 + meetingDuration);

        if(Date.now() <= m.data().date._seconds * 1000 + meetingDuration)
        {
            meetings.push({...m.data(), id: m.id});
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