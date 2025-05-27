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
import { dateDuration, orientations } from '@/app/api/variables/meetings'
import { time } from 'console'
import { useFormState } from 'react-dom'
import { formatTime } from '@/app/utils'
import MessageModal from '@/app/components/messageModal'
import { addLike } from '@/app/actions/meetings/post'

export default function VideoConference({ params }: { params: { idMeeting: string[] } })
{
    const idMeeting = params.idMeeting?.[0];
    
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [message, setMessage] = useState("");
    const [interlocutor, setInterlocutor] = useState<string>("");
    const [timestamp, setTimestamp] = useState(0);
    const [now, setNow] = useState(Date.now());
    const [modalEnd, setModalEnd] = useState<boolean>(false);
    const [modalGhost, setModalGhost] = useState<boolean>(false);
    
    const socketRef = useRef<WebSocket | null>(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const roleRef = useRef<string>("callee");
    const streamRef = useRef<MediaStream>(null);

    const userIdRef = useRef<string>("");
    const usernameRef = useRef<string>("");

    const { data: session, status } = useSession();

    useEffect(() =>
    {
        const interval = setInterval(() =>
        {
            setNow(Date.now());
        }, 1000);

        return () => {
            clearInterval(interval);
            
            if(socketRef.current)
            {
                //socketRef.current.send(JSON.stringify({ type: "speed_dating_off", id: session.user.id, name: session.user.name, idMeeting }));
                //socketRef.current.send(JSON.stringify({ type: "speed_dating_off", id: "K8yfT2QqeF5fyiVAIjto", name: "Vinke013", idMeeting }));
                socketRef.current.send(JSON.stringify({ type: "speed_dating_off", userId: userIdRef.current, name: usernameRef.current, idMeeting }));
                socketRef.current.close();
            }
        };
    }, []);

    useEffect(() =>
    {
        if (timestamp !== 0 && now - timestamp >= dateDuration)
        {
            setIsConnected(false);
            setModalEnd(true);
            quit();
        }
    }, [now]);

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

    const connect = () =>
    {
        if(session)
        {
            if(!socketRef.current)
            {
                socketRef.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
            }
    
            socketRef.current.onopen = () =>
            {
                console.log('Connecté au serveur WebSocket');
    
                setIsConnected(true);

                //console.log(session.user);
    
                const message: string = JSON.stringify({ type: "speed_dating_on", userId: session.user.id, name: session.user.name, orientation: (session.user as any).orientation, gender: (session.user as any).gender, idMeeting });

                userIdRef.current = session.user.id;
                usernameRef.current = session.user.name;
            
                socketRef.current.send(message);
            };
        }
    }

    /*const closeConnection = () =>
    {
        const message: string = JSON.stringify({ type: "speed_dating_off", id: session.user.id, name: session.user.name, idMeeting });
    
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
        {
            socketRef.current.send(message);
            socketRef.current.close();

            socketRef.current = null;
        }
    }*/

    //const quit = (disconnect: boolean = true) =>
    const quit = () =>
    {
        setIsConnected(false);
            
        const message: string = JSON.stringify({ type: "speed_dating_off", userId: session.user.id, name: session.user.name, idMeeting });
    
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
        {
            socketRef.current.send(message);
            socketRef.current.close();

            socketRef.current = null;
        }
    
        if(streamRef.current)
        {
            streamRef.current.getTracks().forEach(function(track: MediaStreamTrack)
            {
                track.stop();
            });
    
            streamRef.current = null;
        }

        setTimestamp(0);
    }

    const handleLike = () =>
    {
        /*socketRef.current.send(JSON.stringify({ type: "speed_dating_like", value: true, userId: session.user.id, interlocutor }));

        closeConnection();*/

        addLike(interlocutor);

        setModalEnd(false);
    }

    const handleNoLike = () =>
    {
        /*socketRef.current.send(JSON.stringify({ type: "speed_dating_like", value: false, userId: session.user.id, interlocutor }));

        closeConnection();*/

        setModalEnd(false);
    }

    const createPeerConnection = (interlocutor: string) =>
    {
        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
    
        console.log("RTCPeerConnection created");
    
        peerConnectionRef.current.onicecandidate = (event) =>
        {
            console.log("onicecandidate fired", event.candidate, `"${interlocutor}"`);
    
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
                /*console.log("✅ Assigned remote stream", remoteVideoRef.current);
                console.log("Tracks:", event.streams[0]);*/
            }
        };
    }

    const mediaDevicesToStream = async () =>
    {
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
        console.log("🎥 getUserMedia() gave us", stream);
        
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
                console.error("Error add tracks : No peer connection");
            }
        });
    
        streamRef.current = stream;
    }
    
    const createOffer = async (interlocutorId: string) =>
    {
        if(peerConnectionRef.current)
        {
            /*peerConnectionRef.current.createOffer().then((offer) =>
            {
                console.log("Create offer ok");
    
                peerConnectionRef.current.setLocalDescription(offer).then(() =>
                {
                    console.log("Send offer");
                    
                    socketRef.current.send(JSON.stringify({ type: "speed_dating_offer", interlocutor: interlocutorId, offer, userId : session.user.id }));
                }).catch((error) =>
                {
                    alert(error);
                });
            }).catch((error) =>
            {
                alert(error);
            });*/

            const offer = await peerConnectionRef.current.createOffer();
            console.log("Create offer ok");
            await peerConnectionRef.current.setLocalDescription(offer);
            console.log("Send offer");
            socketRef.current.send(JSON.stringify({ type: "speed_dating_offer", interlocutor: interlocutorId, offer, userId : session.user.id }));
        }
    
        else
        {
            console.error("Error create offer : No peer connection");
        }
    }
    
    const createAnswer = async (offer, callerId) =>
    {
        if(peerConnectionRef.current)
        {
            peerConnectionRef.current.setRemoteDescription(offer)
            .then(async () =>
            {
                await mediaDevicesToStream();
                
                /*peerConnectionRef.current.createAnswer().then((answer) =>
                {
                    peerConnectionRef.current.setLocalDescription(answer)
                    .then(() =>
                    {
                        console.log("Send answer");
                        
                        socketRef.current.send(JSON.stringify({ type: "speed_dating_answer", answer, callerId }));
                    })
                    .catch((error) =>
                    {
                        alert(error);
                    });
                })*/

                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                console.log("Send answer");
                socketRef.current.send(JSON.stringify({ type: "speed_dating_answer", answer, callerId }));
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
                    setTimestamp(resParsed.timestamp);
                    //console.log(resParsed.timestamp);

                    console.log(`Interlocutor of caller : ${resParsed.interlocutor}`);

                    createPeerConnection(resParsed.interlocutor);
                    await mediaDevicesToStream();
                    await createOffer(resParsed.interlocutor);
                }
            }

            else
            if(resParsed.type === "speed_dating_receive_offer")
            {
                console.log("Receive offer");

                createPeerConnection(resParsed.callerId);

                console.log(`Interlocutor of callee : ${resParsed.callerId}`);

                setInterlocutor(resParsed.callerId);
                setTimestamp(resParsed.timestamp);
                //console.log(resParsed.timestamp);
                    
                const offer = resParsed.offer;
                await createAnswer(offer, resParsed.callerId);
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

                    console.log("Caller description answer");
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

            else
            if (resParsed.type === "speed_dating_ghost")
            {
                quit();
                setModalGhost(true);
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
                            <div className="flex gap-4 mb-2">
                                <div className="flex-1 flex flex-col">
                                    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mx-auto mb-4 lg:w-3/4 w-full">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <video
                                                ref={remoteVideoRef}
                                                loop
                                                autoPlay
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {
                                            timestamp !== 0 &&

                                            <div className="absolute top-4 left-4 text-white">
                                                { formatTime((dateDuration - (now - timestamp)) / 1000) }
                                            </div>
                                        }
                                        <div className="absolute bottom-4 right-4 lg:w-32 w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
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
                                        <Button onClick={() => quit()} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Quitter la conversation</Button>
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
                                    <Button onClick={connect} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Rejoindre la session</Button>
                                </div>
                            </div>
                        </div>
                    }

                    {
                        message != "" &&

                        <AlertModal message={message} onClose={() => setMessage("")} />
                    }

                    {
                        modalEnd &&

                        <MessageModal setter1={handleLike} setter2={handleNoLike} msg1="Like" msg2="No like" message="Le temps est écoulé !" />
                    }

                    {
                        modalGhost &&

                        <AlertModal message="Votre interlocuteur s'est déconnecté(e)" onClose={() => {setModalGhost(false)}} />
                    }

                </div>
            </div>
        </AllowDoMeeting>
    )
}
