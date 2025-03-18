import React, { useState } from 'react';
import { Paperclip, MapPin, Send, Video, Phone } from 'lucide-react';

const MainChat = ({ openModal, simulateIncomingCall }) => {
  const [message, setMessage] = useState('');
  const messages = [
    { text: "¡Hola! ¿Cómo estás?", time: "10:30", sent: false, sender: "Juan Pérez" },
    { text: "¡Muy bien! ¿Y tú?", time: "10:31", sent: true, sender: "Tú" },
    { text: "Todo bien, gracias. ¿Nos vemos mañana?", time: "10:32", sent: false, sender: "Juan Pérez" },
    { text: "¡Claro! A las 10:00 en el café", time: "10:33", sent: true, sender: "Tú" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(message);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="bg-gray-100 p-4 flex items-center border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-emerald-700"></div>
        <span className="ml-3">Juan Pérez</span>
        
        <div className="ml-auto flex items-center gap-3">
          <button 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => openModal('videoCall')}
          >
            <Video size={20} className="text-emerald-600" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={simulateIncomingCall}
          >
            <Phone size={20} className="text-emerald-600" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto bg-gray-200">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`max-w-[65%] p-3 rounded-lg mb-2 relative ${
              message.sent 
                ? 'bg-green-100 ml-auto' 
                : 'bg-white'
            }`}
          >
            {!message.sent && (
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 rounded-full bg-emerald-700 mr-2"></div>
                <div className="text-xs text-gray-500">{message.sender}</div>
              </div>
            )}
            {message.text}
            <div className="text-xs text-gray-500 text-right mt-1">{message.time}</div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-100 p-4 flex items-center gap-3">
        <form onSubmit={handleSubmit}>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <MapPin size={20} className="text-gray-600" />
          </button>
          <input 
            type="text"
            placeholder="Escribe un mensaje aquí" 
            className="flex-1 py-3 px-4 rounded-lg border-none outline-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Send size={20} className="text-emerald-600" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainChat;