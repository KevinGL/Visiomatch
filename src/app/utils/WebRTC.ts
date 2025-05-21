export const createPeerConnection = (peerConnectionRef, socketRef, roleRef, remoteVideoRef) =>
{
    peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    //console.log("RTCPeerConnection created");

    peerConnectionRef.current.onicecandidate = (event) =>
    {
        //console.log("onicecandidate fired", event.candidate);

        if (event.candidate)
        {
            socketRef.current?.send(JSON.stringify({
                type: "ice_candidate",
                candidate: event.candidate,
                role: roleRef.current
            }));
        }
    };

    peerConnectionRef.current.ontrack = (event) =>
    {
        //console.log("🎥 Track received on", roleRef.current, event.streams);
        
        if (remoteVideoRef.current)
        {
            remoteVideoRef.current.srcObject = event.streams[0];
            //console.log("✅ Assigned remote stream", remoteVideoRef.current);
            //console.log("Tracks:", event.streams[0]);
        }
    };
}

export const connect = (session, socketRef, setIsConnected) =>
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

            const message: string = JSON.stringify({ type: "visio_on", id: session.user.id, name: session.user.name });
        
            socketRef.current.send(message);
        };
    }
}

export const quit = (setIsConnected, session, socketRef, streamRef) =>
{
    setIsConnected(false);
        
    const message: string = JSON.stringify({ type: "visio_off", id: session.user.id, name: session.user.name });

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

export const mediaDevicesToStream = async (localVideoRef, peerConnectionRef, streamRef) =>
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

export const createOffer = async (peerConnectionRef, socketRef) =>
{
    if(peerConnectionRef.current)
    {
        peerConnectionRef.current.createOffer().then((offer) =>
        {
            //console.log("Create offer ok");

            peerConnectionRef.current.setLocalDescription(offer).then(() =>
            {
                //console.log("Send offer");
                
                socketRef.current.send(JSON.stringify({ type: "offer", offer }));
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

export const createAnswer = (offer, peerConnectionRef, localVideoRef, streamRef, socketRef) =>
{
    if(peerConnectionRef.current)
    {
        peerConnectionRef.current.setRemoteDescription(offer)
        .then(async () =>
        {
            await mediaDevicesToStream(localVideoRef, peerConnectionRef, streamRef);
            
            peerConnectionRef.current.createAnswer().then((answer) =>
            {
                peerConnectionRef.current.setLocalDescription(answer)
                .then(() =>
                {
                    //console.log("Send answer");
                    
                    socketRef.current.send(JSON.stringify({ type: "answer", answer }));
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