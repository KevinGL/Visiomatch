"use server"

import { NextResponse } from 'next/server';
import { db } from "@/firebase/config";

export async function POST()
{
  const usersSnapshot = await db.collection("users").get();

  const usersList = usersSnapshot.docs.map(doc => doc.data());

  console.log(usersList);

  return NextResponse.json({ message: 'Liste des utilisateurs', usersList }, { status: 200 });
}