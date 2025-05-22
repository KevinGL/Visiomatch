"use client"

import * as React from 'react'
import {useState, useEffect, useRef} from 'react'
import Navbar from '../../components/navbar'
import { Button } from '@/components/ui/button'
import { MessageSquare, Mic, MicOff, Phone, Video, VideoOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getCurrentUser } from '../../actions/users/get'
import AlertModal from '../../components/alertModal'
import AllowDoMeeting from '@/app/components/AllowDoMeeting'
import { orientations } from '@/app/api/variables/meetings'

export default function VideoConference({ params }: { params: { idMeeting: string[] } })
{
    const idMeeting = params.idMeeting?.[0];
    
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [message, setMessage] = useState("");
    const [interlocutor, setInterlocutor] = useState("");
    
    const socketRef = useRef<WebSocket | null>(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const roleRef = useRef<string>("callee");
    const streamRef = useRef<MediaStream>(null);

    const { data: session, status } = useSession();

    const mute = () =>
    {
        setIsMuted((prev) =>
        {
            const newMuted = !prev;
    
            const audioTrack = streamRef.current?.getAudioTracks?.()[0];
            
            if (audioTrack)
            {
                audioTrack.enabled = !newMuted;
            }
    
            return newMuted;
        });
    };

    const videoOn = () =>
    {
        setIsVideoOn((prev) =>
        {
            const newOn = !prev;
    
            const videoTrack = streamRef.current?.getVideoTracks?.()[0];
            
            if (videoTrack)
            {
                videoTrack.enabled = newOn;
            }
    
            return newOn;
        });
    }

    const connect = (session, socketRef, setIsConnected) =>
    {
        if(session)
        {
            if(!socketRef.current)
            {
                socketRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
            }
    
            socketRef.current.onopen = () =>
            {
                //console.log('Connecté au serveur WebSocket');
    
                setIsConnected(true);
    
                const message: string = JSON.stringify({ type: "speed_dating_on", userId: session.user.id, name: session.user.name, orientation: session.user.orientation, gender: session.user.gender, idMeeting });
            
                socketRef.current.send(message);
            };
        }
    }

    const quit = (setIsConnected, session, socketRef, streamRef) =>
    {
        setIsConnected(false);
            
        const message: string = JSON.stringify({ type: "speed_dating_off", id: session.user.id, name: session.user.name, idMeeting });
    
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
        {
            socketRef.current.send(message);
            socketRef.current.close();
        }
    
        socketRef.current = null;
    
        if(streamRef.current)
        {
            streamRef.current.getTracks().forEach(function(track: MediaStreamTrack)
            {
                track.stop();
            });
    
            streamRef.current = null;
        }
    }

    const createPeerConnection = () =>
    {
        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
    
        console.log("RTCPeerConnection created");
    
        peerConnectionRef.current.onicecandidate = (event) =>
        {
            console.log("onicecandidate fired", event.candidate);
    
            if (event.candidate)
            {
                socketRef.current?.send(JSON.stringify({
                    type: "speed_dating_ice_candidates",
                    candidate: event.candidate,
                    interlocutor
                }));
            }
        };
    
        peerConnectionRef.current.ontrack = (event) =>
        {
            console.log("🎥 Track received on", roleRef.current, event.streams);
            
            if (remoteVideoRef.current)
            {
                remoteVideoRef.current.srcObject = event.streams[0];
                //console.log("✅ Assigned remote stream", remoteVideoRef.current);
                //console.log("Tracks:", event.streams[0]);
            }
        };
    }

    const mediaDevicesToStream = async () =>
    {
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
        //console.log("🎥 getUserMedia() gave us", stream);
        
        localVideoRef.current.srcObject = stream;
    
        stream.getTracks().forEach((track: MediaStreamTrack) =>
        {
            if(peerConnectionRef.current)
            {
                peerConnectionRef.current.addTrack(track, stream);
                //console.log("addTrack()");
            }
    
            else
            {
                //console.error("Error add tracks : No peer connection");
            }
        });
    
        streamRef.current = stream;
    }
    
    const createOffer = async () =>
    {
        if(peerConnectionRef.current)
        {
            peerConnectionRef.current.createOffer().then((offer) =>
            {
                //console.log("Create offer ok");
    
                peerConnectionRef.current.setLocalDescription(offer).then(() =>
                {
                    //console.log("Send offer");
                    
                    socketRef.current.send(JSON.stringify({ type: "speed_dating_offer", interlocutor, offer, userId : session.user.id }));
                }).catch((error) =>
                {
                    alert(error);
                });
            }).catch((error) =>
            {
                alert(error);
            });
        }
    
        else
        {
            console.error("Error create offer : No peer connection");
        }
    }
    
    const createAnswer = (offer, callerId) =>
    {
        if(peerConnectionRef.current)
        {
            peerConnectionRef.current.setRemoteDescription(offer)
            .then(async () =>
            {
                await mediaDevicesToStream();
                
                peerConnectionRef.current.createAnswer().then((answer) =>
                {
                    peerConnectionRef.current.setLocalDescription(answer)
                    .then(() =>
                    {
                        //console.log("Send answer");
                        
                        socketRef.current.send(JSON.stringify({ type: "speed_dating_answer", answer, callerId }));
                    })
                    .catch((error) =>
                    {
                        alert(error);
                    });
                })
                .catch((error) =>
                {
                    alert(error);
                });
            })
            .catch((error) =>
            {
                alert(error);
            });
        }
    
        else
        {
            console.error("Error create answer : No peer connection");
        }
    }

    if(socketRef.current)
    {
        socketRef.current.onmessage = async (res) =>
        {
            const resParsed = JSON.parse(res.data);

            if(resParsed.type === "speed_dating_open_session")
            {
                console.log("Open session");
                
                if(resParsed.role === "caller")
                {
                    roleRef.current = "caller";

                    setInterlocutor(resParsed.interlocutor);

                    createPeerConnection();
                    await mediaDevicesToStream();
                    await createOffer();
                }
            }

            else
            if(resParsed.type === "speed_dating_receive_offer")
            {
                console.log("Receive offer");

                createPeerConnection();

                setInterlocutor(resParsed.callerId);
                    
                const offer = resParsed.offer;
                createAnswer(offer, resParsed.callerId);
            }

            else
            if(resParsed.type === "speed_dating_receive_answer")
            {
                console.log("Receive answer");

                if(peerConnectionRef?.current &&
                    resParsed.answer &&
                    resParsed.answer.type &&
                    resParsed.answer.sdp)
                {
                    peerConnectionRef.current.setRemoteDescription(resParsed.answer).catch(error => alert(error));

                    //console.log("Caller description answer");
                }
            }

            else
            if (resParsed.type === "speed_dating_receive_ice_candidate")
            {
                console.log("Received ICE candidate");
            
                if (peerConnectionRef.current && resParsed.candidate)
                {
                    peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(resParsed.candidate))
                    .then(() =>
                    {
                        console.log("ICE candidate added");
                    })
                    .catch((error) =>
                    {
                        console.error("Error adding received ICE candidate", error);
                    });
                }
            }
        }
    }
    
    return (
        <AllowDoMeeting idMeeting={idMeeting}>
            <div className="min-h-screen bg-pink-50">
                <Navbar />
                <div className="container mx-auto p-4 h-screen flex flex-col">
                    <h1 className="text-3xl font-bold text-pink-600 mb-4">Video Date</h1>
                    {
                        isConnected &&

                        <>
                            <div className="flex flex-1 gap-4">
                                <div className="flex-1 flex flex-col">
                                    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <video
                                                ref={remoteVideoRef}
                                                loop
                                                autoPlay
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden">
                                            <video
                                                ref={localVideoRef}
                                                loop
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={mute}
                                            className={isMuted ? 'bg-pink-600 text-white' : ''}
                                            >
                                            {isMuted ? <MicOff /> : <Mic />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={videoOn}
                                            className={!isVideoOn ? 'bg-pink-600 text-white' : ''}
                                            >
                                            {isVideoOn ? <Video /> : <VideoOff />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                                    <div className="space-y-4">
                                        <Button onClick={() => quit(setIsConnected, session, socketRef, streamRef)} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Quitter la conversation</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    }

                    {
                        !isConnected &&

                        <div className="min-h-screen flex items-center justify-center bg-pink-50">
                            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                                <div className="space-y-4">
                                    <Button onClick={() => connect(session, socketRef, setIsConnected)} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Rejoindre la conversation</Button>
                                </div>
                            </div>
                        </div>
                    }

                    {
                        message != "" &&

                        <AlertModal message={message} onClose={() => setMessage("")} />
                    }
                </div>
            </div>
        </AllowDoMeeting>
    )
}
