"use server"

import { db } from "@/firebase/config";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
})

export const updateProfile = async (req: any) =>
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

    /*const res =
    {
        birthdate: currentUser.data()?.birthdate,
        email: currentUser.data()?.email,
        gender: currentUser.data()?.gender,
        search: currentUser.data()?.search,
        name: currentUser.data()?.name,
        city: currentUser.data()?.city,
        zipcode: currentUser.data()?.zipcode,
        country: currentUser.data()?.country,
        phoneNumber: currentUser.data()?.phoneNumber,
    }

    return JSON.stringify(res);*/

    //console.log(req);

    userRef.update({
        email: req.email,
        name: req.name,
        birthdate: req.dateOfBirth,
        city: req.city,
        zipcode: req.postalCode,
        country: req.country,
        phoneNumber: req.phoneNumber,
        gender: req.gender,
        search: req.search
    });

    return JSON.stringify(currentUser.data());
}

export const addImage = async (name: string) =>
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

    userRef.update({ photos: [ ...currentUser.data().photos, name ] });

    return JSON.stringify(currentUser.data());
}

export const deleteImage =  async (id: string) =>
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

    //console.log(id);

    let photos = currentUser.data().photos;
    photos.splice(photos.indexOf(id), 1);

    userRef.update({ photos });

    try
    {
        const result = await cloudinary.v2.uploader.destroy(id);
        return JSON.stringify({ success: true, result });
    }
    catch (error)
    {
        return JSON.stringify({ success: false, error });
    }
}

export const sortUserImages = async (idFirst: string) =>
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

    let photos = currentUser.data().photos;
    photos.splice(photos.indexOf(idFirst), 1);

    photos = [idFirst, ...photos];

    userRef.update({ photos });

    try
    {
        return JSON.stringify(currentUser.data());
    }
    catch (error)
    {
        return "";
    }
}