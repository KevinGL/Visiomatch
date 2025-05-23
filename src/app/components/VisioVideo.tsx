export const VisioVideo = () =>
{
    return(
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
                    {
                        timestamp !== 0 &&

                        <div className="absolute top-4 left-4 text-white">
                            { formatTime((dateDuration - (now - timestamp)) / 1000) }
                        </div>
                    }
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
                    <Button onClick={() => quit()} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Quitter la conversation</Button>
                </div>
            </div>
        </div>
    )
}