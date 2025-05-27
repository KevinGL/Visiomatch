"use client"

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MiddlewareAdmin from "../components/MiddlewareAdmin";
import { getAllUsers } from "../actions/users/get";
import Navbar from "../components/navbar";

export default function CRUD()
{
    const [users, setUsers] = useState({});
    
    useEffect(() =>
    {
        const getUsers = async () =>
        {
            /*const res: string = await getAllUsers();

            if(JSON.parse(res).success)
            {
                setUsers(JSON.parse(res).users);

                console.log(JSON.parse(res).users);
            }*/
        }

        getUsers();
    }), [];

    return (
        <MiddlewareAdmin>
            <div className="min-h-screen bg-pink-50">
                <Navbar />
                <div className="container mx-auto p-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 px-auto">
                            
                        </div>
                    </div>
                </div>
            </div>
        </MiddlewareAdmin>
    )
}