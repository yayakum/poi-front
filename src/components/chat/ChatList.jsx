import React from 'react';

const ChatList = () => {
  const chatList = [
    { name: "Juan Pérez", message: "¡Hola! ¿Cómo estás?", active: true },
    { name: "María García", message: "Ok, nos vemos mañana", active: false },
    { name: "Grupo Familia", message: "¿A qué hora es la reunión?", active: false }
  ];

  return (
    <div className="overflow-y-auto h-[calc(90vh-120px)]">
      {chatList.map((chat, index) => (
        <div 
          key={index}
          className="p-4 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-700"></div>
          <div className="ml-4 flex-1">
            <div className="font-medium">{chat.name}</div>
            <div className="text-sm text-gray-500">{chat.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;