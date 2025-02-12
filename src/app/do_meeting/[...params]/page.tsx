'use client'

import * as React from 'react'
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import Navbar from '@/app/components/navbar'
import AllowDoMeeting from '@/app/components/AllowDoMeeting'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { orientations } from '@/app/api/variables/meetings'
import { getCurrentUser } from '@/app/actions/users/get'
import { startWebRTC } from '@/app/utils'

// This is a mock function to simulate sending a message
const sendMessage = (message: string) =>
{
  console.log('Sending message:', message)
}

export default function VideoConference({ params }: any)
{
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'Sarah', text: 'Hi there! Excited for our video date!' },
    { sender: 'You', text: 'Hey Sarah! Me too, it\'s great to finally "meet" you!' },
  ])

    //const [socket, setSocket] = useState<WebSocket | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const peerConnection = useRef<RTCPeerConnection>(null);

  const { data: session, status } = useSession();
  const socketRef = useRef<WebSocket | null>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { sender: 'You', text: message }])
      sendMessage(message)
      setMessage('')
    }
  }

    useEffect(() =>
    {
        if (status === "authenticated" && session?.user.id && !socketRef.current)
        {
            const socket = new WebSocket('ws://localhost:8080');
            socketRef.current = socket;

            socket.onopen = () =>
            {
                console.log('Connecté au serveur WebSocket');

                getCurrentUser().then((res) =>
                {
                    const currentUser = JSON.parse(res);
                    const name: string = currentUser.name;
                    const gender: string = currentUser.gender;

                    socket.send(JSON.stringify({ type: "connect", user: { id: session?.user.id, name, gender, speak: false, already: [] }, session_id: params.params[0] }));
                });
            };

            socket.onmessage = (event) =>
            {
                const data = JSON.parse(event.data);
            
                if (data.type === "match")
                {
                    console.log("🎯 Match trouvé !");
                    console.log("Session ID :", data.sessionId);
                    console.log("Rôle :", data.role);
                    console.log("Votre Peer ID (Interlocuteur) :", data.peerId);

                    if(data.role == "caller")
                    {
                        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                        .then((res) =>
                        {
                            if (!peerConnection.current)
                            {
                                peerConnection.current = new RTCPeerConnection();
                            }
                            
                            peerConnection.current.createOffer()
                            .then((offer) => peerConnection.current.setLocalDescription(offer))
                            .then(() =>
                            {
                                socket.send(JSON.stringify({ type: "offer", offer: peerConnection.current.localDescription, peerId: data.peerId }));
                                //console.log("Envoi offre SDP");
                            })
                            .catch((err) =>
                            {
                                console.log(`Erreur création offre SDP : ${err}`);
                            });

                        })
                        .catch((err) =>
                        {
                            console.log(`Erreur accès caméra et micro : ${err}`);
                        });
                    }

                    else
                    if(data.role == "callee")
                    {
                        socket.onmessage = (event) =>
                        {
                            console.log(event.data);

                            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                            .then((res) =>
                            {
                                //
                            })
                            .catch((err) =>
                            {
                                console.log(`Erreur accès caméra et micro : ${err}`);
                            });
                        }
                    }
                }
            };
        }
    }, [session, status]);

  return (
    <AllowDoMeeting idMeeting={params}>
        <div className="min-h-screen bg-pink-50">
            <Navbar />
            <div className="container mx-auto p-4 h-screen flex flex-col">
                <h1 className="text-3xl font-bold text-pink-600 mb-4">Video Date with Sarah</h1>
                <div className="flex flex-1 gap-4">
                    <div className="flex-1 flex flex-col">
                        <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img src="/placeholder.svg?height=400&width=600" alt="Sarah" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden">
                                <img src="/placeholder.svg?height=100&width=150" alt="You" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsMuted(!isMuted)}
                                className={isMuted ? 'bg-pink-600 text-white' : ''}
                            >
                            {isMuted ? <MicOff /> : <Mic />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsVideoOn(!isVideoOn)}
                                className={!isVideoOn ? 'bg-pink-600 text-white' : ''}
                            >
                            {isVideoOn ? <Video /> : <VideoOff />}
                            </Button>
                            <Button variant="destructive" size="icon">
                            <Phone />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className={isChatOpen ? 'bg-pink-600 text-white' : ''}
                            >
                            <MessageSquare />
                            </Button>
                        </div>
                    </div>
                    {isChatOpen && (
                    <Card className="w-full max-w-sm flex flex-col">
                        <CardContent className="flex flex-col h-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-pink-600">Chat</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                            <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 mb-4">
                            {messages.map((msg, index) => (
                            <div key={index} className={`mb-2 ${msg.sender === 'You' ? 'text-right' : ''}`}>
                                <span className="font-semibold text-pink-600">{msg.sender}: </span>
                                <span>{msg.text}</span>
                            </div>
                            ))}
                        </ScrollArea>
                        <div className="flex gap-2">
                            <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button onClick={handleSendMessage}>Send</Button>
                        </div>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </div>
        </div>
    </AllowDoMeeting>
  )
}