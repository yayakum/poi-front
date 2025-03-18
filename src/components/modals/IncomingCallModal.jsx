import React from 'react';
import { PhoneOff, Video, Phone } from 'lucide-react';

const IncomingCallModal = ({ incomingCall, declineCall, acceptCall }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md text-center">
        <div className="mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto"></div>
          <h2 className="text-xl font-bold mt-3">{incomingCall.name}</h2>
          <p className="text-gray-500">
            {incomingCall.video ? 'Videollamada entrante' : 'Llamada entrante'}
          </p>
        </div>
        
        <div className="flex justify-center gap-8">
          <button 
            onClick={declineCall}
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <PhoneOff size={30} />
          </button>
          <button 
            onClick={acceptCall}
            className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            {incomingCall.video ? <Video size={30} /> : <Phone size={30} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;