"use client"

import { getTalk } from "@/app/actions/talks/get";
import AuthGuard from "@/app/components/AuthGuard";
import { decodeId } from "@/app/utils";
import { useEffect, useRef, useState } from "react"
import {useRouter} from "next/navigation";
import Navbar from "@/app/components/navbar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { getUserFromId } from "@/app/actions/users/get";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/app/actions/talks/post";
import AlertModal from "@/app/components/alertModal";

export default function Talk(params)
{
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [interlocutorName, setInterlocutorName] = useState<string>("");
    const [messageToSend, setMessageToSend] = useState<string>("");
    const [messageModal, setMessageModal] = useState<string>("");

    const router = useRouter();
    const { data: session, status } = useSession();
    const socketRef = useRef(null);
    
    useEffect(() =>
    {
        const getTalkFromInterlocutor = async () =>
        {
            //console.log(params.params.id[0]);

            const res: string = await getTalk(decodeId(params.params.id[0])[0]);
            //console.log(JSON.parse(res));

            if(!JSON.parse(res).success)
            {
                router.push("/");
            }

            setMessages(JSON.parse(res).messages);
            setIsLoading(false);

            setInterlocutorName(JSON.parse(await getUserFromId(decodeId(params.params.id[0])[0])).name);

            ////////////////////

            socketRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
        }

        getTalkFromInterlocutor();

        return () => {
            if(socketRef.current)
            {
                //console.log("Closing WebSocket...");
                socketRef.current.send(JSON.stringify({ type: "talk_off", id: session.user.id }));
                //socketRef.current.close();
            }
        };
    }, []);

    useEffect(() =>
    {
        if(session && socketRef.current)
        {
            socketRef.current.onopen = () =>
            {
                socketRef.current.send(JSON.stringify({ type: "talk_connect", id: session.user.id }));
            }

            socketRef.current.onmessage = async (res) =>
            {
                //console.log(JSON.parse(res.data));
                
                const datas = JSON.parse(res.data);

                if(datas.type === "talk_res")
                {
                    //console.log(datas.author, decodeId(params.params.id[0])[0]);
                    
                    if(datas.author === decodeId(params.params.id[0])[0])
                    {
                        const localMessages = messages;
                        localMessages.push({ id: datas.author, content: datas.content, updateAt: Date.now() });
                        setMessages(localMessages);
                    }
                }
            }

            ///////////////////////////////////////////

            /*setInterval(() =>
            {
                socketRef.current.send(JSON.stringify({ type: "talk_ping", id: session.user.id }));
            }, 5000);*/
        }
    }, [session, socketRef.current]);

    const send = async () =>
    {
        if(messageToSend !== "")
        {
            const res: string = await sendMessage(messageToSend, decodeId(params.params.id[0])[0]);

            if(JSON.parse(res).success)
            {
                setMessageToSend("");

                const localMessages = messages;
                localMessages.push({ id: session.user.id, content: messageToSend, updateAt: Date.now() });
                setMessages(localMessages);

                if(socketRef.current)
                {
                    socketRef.current.send(JSON.stringify({ type: "talk", id: session.user.id, content: messageToSend, updateAt: Date.now(), interlocutorId: decodeId(params.params.id[0])[0] }));
                }
            }

            else
            {
                setMessageModal(JSON.parse(res).message);
            }
        }
    }

    return (
        <AuthGuard>
            {
                isLoading &&

                <div>Loading ...</div>
            }

            {
                !isLoading &&

                <div className="min-h-screen bg-pink-50">
                    <Navbar/>
                    <div className="container mx-auto p-4">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6 px-auto">
                                <Button
                                    onClick={() => router.push(`/users/${params.params.id[0]}`)}
                                    className="bg-pink-600 hover:bg-pink-700 text-white mb-6"
                                    >
                                    <User className="mr-2 h-4 w-4" />
                                    Retour sur profil
                                </Button>

                                <div className="flex flex-col">
                                    {
                                        messages.map((message: any) =>
                                        {
                                            return (
                                                <>
                                                    {
                                                        message.id === session.user.id &&

                                                        <div className="bg-pink-600 rounded-lg text-white mb-6 p-3 lg:w-1/4 w-1/2 relative self-end">
                                                            {message.content}
                                                            <div className="absolute top-0 right-4 text-sm">
                                                                {session.user.name}
                                                            </div>
                                                        </div>
                                                    }

                                                    {
                                                        message.id !== session.user.id &&

                                                        <div className="bg-purple-500 rounded-lg text-white mb-6 p-3 lg:w-1/4 w-1/2 relative">
                                                            {message.content}
                                                            <div className="absolute top-0 right-4 text-sm">
                                                                {interlocutorName}
                                                            </div>
                                                        </div>
                                                    }
                                                </>
                                            )
                                        })
                                    }
                                </div>
                                
                                <Textarea
                                    id="content"
                                    name="content"
                                    value={messageToSend}
                                    onChange={(e) => {setMessageToSend(e.target.value)}}
                                    className="flex-grow w-1/2 min-h-[60px]"
                                />

                                <Button
                                    onClick={send}
                                    className={messageToSend !== "" ? "bg-pink-600 hover:bg-pink-700 text-white mt-4 mb-6" : "bg-gray-300 hover:bg-gray-300 text-white mt-4 mb-6 cursor-default"}
                                    >
                                    Envoyer
                                </Button>
                            </div>
                        </div>
                    </div>

                    {
                        messageModal !== "" &&

                        <AlertModal message={messageModal} onClose={() => setMessageModal("")} />
                    }

                </div>
            }
        </AuthGuard>
    )
}