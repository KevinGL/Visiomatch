import NextAuth from "next-auth";

export interface User
{
    id: string,
    birthdate: Date,
    createdAt: Date,
    email: string,
    gender: string,
    search: string
}

/*export interface Meeting
{
    id: string,
    date: Date,
    orientation: string,
    region: string,
    age: string,
    participants: User[]
}*/

export interface Session
{
  //
}

declare module "next-auth" {
    interface User {
      id: string;
      admin: boolean
    }
  
    interface Session {
      user: User;
    }
  }