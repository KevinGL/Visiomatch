export const createPeerConnection = (peerConnectionRef, socketRef, roleRef, remoteVideoRef) =>
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
                type: "ice_candidate",
                candidate: event.candidate,
                role: roleRef.current
            }));
        }
    };

    peerConnectionRef.current.ontrack = (event) =>
    {
        console.log("🎥 Track received on", roleRef.current, event.streams);
        
        if (remoteVideoRef.current)
        {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log("✅ Assigned remote stream", remoteVideoRef.current);
            console.log("Tracks:", event.streams[0]);
        }
    };
}
