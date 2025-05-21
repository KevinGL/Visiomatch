"use client"

import * as React from 'react'
import {useState, useEffect, useRef} from 'react'
import AllowTestMeeting from '../components/AllowTestMeeting'
import Navbar from '../components/navbar'
import { Button } from '@/components/ui/button'
import { MessageSquare, Mic, MicOff, Phone, Video, VideoOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getCurrentUser } from '../actions/users/get'
import AlertModal from '../components/alertModal'
import { connect, createAnswer, createOffer, createPeerConnection, mediaDevicesToStream, quit } from '../utils/WebRTC'

export default function TestMeeting()
{
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [message, setMessage] = useState("");
    
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

    if(socketRef.current)
    {
        socketRef.current.onmessage = async (res) =>
        {
            const resParsed = JSON.parse(res.data);

            if(resParsed.type === "open_session")
            {
                //console.log("Open session");
                
                if(resParsed.role === "caller")
                {
                    roleRef.current = "caller";

                    createPeerConnection(peerConnectionRef, socketRef, roleRef, remoteVideoRef);
                    await mediaDevicesToStream(localVideoRef, peerConnectionRef, streamRef);
                    await createOffer(peerConnectionRef, socketRef);
                }
            }

            else
            if(resParsed.type === "receive_offer")
            {
                //console.log("Receive offer");

                createPeerConnection(peerConnectionRef, socketRef, roleRef, remoteVideoRef);
                    
                const offer = resParsed.offer;
                createAnswer(offer, peerConnectionRef, localVideoRef, streamRef, socketRef);
            }

            else
            if(resParsed.type === "receive_answer")
            {
                //console.log("Receive answer");

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
            if (resParsed.type === "receive_ice_candidate")
            {
                //console.log("Received ICE candidate");
            
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
        <AllowTestMeeting>
            <div className="min-h-screen bg-pink-50">
                <Navbar />
                <div className="container mx-auto p-4 h-screen flex flex-col">
                    <h1 className="text-3xl font-bold text-pink-600 mb-4">Video Date with Sarah</h1>
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
        </AllowTestMeeting>
    )
}
