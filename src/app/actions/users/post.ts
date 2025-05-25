"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';

export const genFakesUsers = async () =>
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

    if(!currentUser.data().admin)
    {
        return "";
    }

    const nbUsers: number = 40 + Math.floor(60 * Math.random());

    for(let i: number = 0 ; i < nbUsers ; i++)
    {
        const hashedPassword = await bcrypt.hash("1234", 10);

        const newUser = await db.collection("users").add({
            name: faker.internet.username(),
            email: faker.internet.email(),
            password: hashedPassword,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            gender: Math.random() > 0.5 ? "man" : "woman",
            search: Math.random() > 0.5 ? "man" : "woman",
            city: faker.location.city(),
            zipcode: faker.location.zipCode(),
            country: faker.location.country(),
            phoneNumber: faker.phone.number(),
            birthdate: faker.date.birthdate(),
            admin: false,
            description: "",
            participations: []
        });
    }

    return nbUsers;
}