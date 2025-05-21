"use client"

import MiddlewareAdmin from "@/app/components/MiddlewareAdmin";
import Navbar from "@/app/components/navbar";
import * as React from 'react'
import { CalendarDays, Users, MapPin, Heart, Pencil, Trash2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeetings } from "@/app/actions/meetings/get";
import { delMeeting } from "@/app/actions/meetings/post";
import { error } from "console";
import { autoRenawalMeeting } from "@/app/actions/meetings/auto_renewal";

// Sample data for meetings
const meetings = [];

export default function AdminPage() {

    const [meetingsData, setMeetingsData] = useState(meetings);

    const handleEdit = (id: number) => {
        // Implement edit functionality
        console.log('Edit meeting with id:', id)
    }

    const handleDelete = (id: string) =>
    {
        delMeeting(id)
        .then(() =>
        {
            setMeetingsData(meetingsData.filter(meeting => meeting.id !== id));
            alert("Séance supprimée");
        })
        .catch((res) =>
        {
            alert(res.message);
        });
    }

    const router = useRouter();

    useEffect(() =>
    {
        getMeetings().then((res) =>
        {
            const datas = [];

            JSON.parse(res).map((m) =>
            {
                datas.push({ ...m, date: new Date(m.date) });
            });

            setMeetingsData(datas);
        });
    }, []);

  return (
    <MiddlewareAdmin>
        <div className="min-h-screen bg-pink-50">
            <Navbar />
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-pink-600">Admin: Gestion des séances</h1>
                    <div>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => router.push("/admin/meetings/add")}>
                            <Plus className="mr-2 h-4 w-4" /> Ajouter une séance
                        </Button>
                    </div>
                    <div>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={async () => await autoRenawalMeeting(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Activer le renouvellement automatique
                        </Button>
                    </div>
                    <div>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={async () => await autoRenawalMeeting(false)}>
                            <Plus className="mr-2 h-4 w-4" /> Désactiver le renouvellement automatique
                        </Button>
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Tranche d'âge</TableHead>
                            <TableHead>Orientation</TableHead>
                            <TableHead>Région</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meetingsData.map((meeting) => {
                            
                            let className: string = "";

                            if(meeting.date.getTime() < Date.now())
                            {
                                className = "text-gray-400";
                            }

                            return (
                                <TableRow key={meeting.id} className={className}>
                                    <TableCell className="font-medium">{meeting.id}</TableCell>
                                    <TableCell>
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-4 w-4 text-pink-500" />
                                        {meeting.age}
                                    </div>
                                    </TableCell>
                                    <TableCell>
                                    <div className="flex items-center">
                                        <Heart className="mr-2 h-4 w-4 text-pink-500" />
                                        {meeting.orientation}
                                    </div>
                                    </TableCell>
                                    <TableCell>
                                    <div className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4 text-pink-500" />
                                        {meeting.region}
                                    </div>
                                    </TableCell>
                                    <TableCell>
                                    <div className="flex items-center">
                                        <CalendarDays className="mr-2 h-4 w-4 text-pink-500" />
                                        {meeting.date.toLocaleDateString('fr-FR',
                                            { 
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                    </div>
                                    </TableCell>
                                    <TableCell>{meeting.participants}</TableCell>
                                    <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/admin/meetings/edit/${meeting.id}`)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleDelete(meeting.id)}>
                                            Delete
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    </MiddlewareAdmin>
  )
}