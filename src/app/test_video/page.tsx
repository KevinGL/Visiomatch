"use client"

import { useEffect, useRef, useState } from "react";
import AuthGuard from "../components/AuthGuard";
import Navbar from "../components/navbar";
import { Button } from "@/components/ui/button";

export default function TestVideo()
{
    const [test, setTest] = useState<boolean>(false);
    
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream>(null);
    const audioContextRef = useRef<AudioContext>(null);

    const [volume, setVolume] = useState(0);
    const rafId = useRef<number | null>(null);

    useEffect(() =>
    { 
        if(test)
        {
            audioContextRef.current = new AudioContext();
            let analyser: AnalyserNode;
            let dataArray: Uint8Array;
            let source: MediaStreamAudioSourceNode;
            
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) =>
            {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                source = audioContextRef.current.createMediaStreamSource(stream);
                analyser = audioContextRef.current.createAnalyser();
                analyser.fftSize = 256;

                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                source.connect(analyser);

                const updateVolume = () =>
                {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    setVolume(average);
                    rafId.current = requestAnimationFrame(updateVolume);
                };

                updateVolume();
            });
        }

        else
        if(streamRef.current)
        {
            streamRef.current.getTracks().forEach(function(track: MediaStreamTrack)
            {
                track.stop();
            });
    
            streamRef.current = null;

            if (rafId.current)
            {
                cancelAnimationFrame(rafId.current);
            }

            audioContextRef.current.close();
        }
    }, [test]);
    
    return (
        <AuthGuard>
            <div className="min-h-screen bg-pink-50">
                <Navbar />
                <div className="container mx-auto p-4 h-screen flex flex-col">
                    <h1 className="text-3xl font-bold text-pink-600 mb-4">Test caméra et micro</h1>
                    <div className="flex gap-4 mb-2">
                        <div className="flex-1 flex flex-col">
                            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mx-auto mb-4 lg:w-3/4 w-full">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        loop
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />

                                    {
                                        test &&

                                        <div className="absolute bottom-4 right-4">
                                            <p className="text-white">Niveau sonore : {Math.round(volume)}</p>
                                            <div className={`h-[10px] bg-pink-500`} style={{ width: `${Math.round(volume)}px` }} />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                            <div className="space-y-4">
                                {
                                    !test && 

                                    <Button onClick={() => setTest(true)} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Lancer le test</Button>
                                }

                                {
                                    test && 

                                    <Button onClick={() => setTest(false)} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Quitter le test</Button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}