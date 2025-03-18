import React from 'react';
import { MicOff, Mic, VideoOff, Video, PhoneOff } from 'lucide-react';

const VideoCallModal = ({ callSettings, toggleMic, toggleVideo, endCall }) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-700"></div>
          <p className="text-white ml-3">Juan Pérez</p>
        </div>
        
        <div className="absolute bottom-5 right-5 w-48 h-32 bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center">
          {callSettings.videoOn ? (
            <div className="w-10 h-10 rounded-full bg-emerald-700"></div>
          ) : (
            <VideoOff size={30} className="text-white" />
          )}
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 flex items-center justify-center gap-5">
        <button 
          className={`p-4 ${callSettings.micOn ? 'bg-gray-700' : 'bg-red-500'} text-white rounded-full`}
          onClick={toggleMic}
        >
          {callSettings.micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button 
          className={`p-4 ${callSettings.videoOn ? 'bg-gray-700' : 'bg-red-500'} text-white rounded-full`}
          onClick={toggleVideo}
        >
          {callSettings.videoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button 
          className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
          onClick={endCall}
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;