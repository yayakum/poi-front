import React, { useState } from 'react';
import { 
  MoreVertical, 
  Paperclip, 
  MapPin, 
  Send, 
  Search, 
  Edit, 
  MessageSquare, 
  Users, 
  Video,
  X,
  Phone,
  MicOff,
  Mic,
  VideoOff,
  PhoneOff
} from 'lucide-react';

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [profileMenuActive, setProfileMenuActive] = useState(false);
  const [optionsMenuActive, setOptionsMenuActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callSettings, setCallSettings] = useState({
    micOn: true,
    videoOn: true
  });
  
  const closeAllMenus = () => {
    setProfileMenuActive(false);
    setOptionsMenuActive(false);
  };
  
  const openModal = (modalName) => {
    setActiveModal(modalName);
    closeAllMenus();
  };
  
  const closeModal = () => {
    setActiveModal(null);
  };
  
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  const simulateIncomingCall = () => {
    setIncomingCall({
      name: "Juan Pérez",
      video: true
    });
  };

  const acceptCall = () => {
    setIncomingCall(null);
    openModal('videoCall');
  };

  const declineCall = () => {
    setIncomingCall(null);
  };

  const endCall = () => {
    closeModal();
  };

  const toggleMic = () => {
    setCallSettings(prev => ({
      ...prev,
      micOn: !prev.micOn
    }));
  };

  const toggleVideo = () => {
    setCallSettings(prev => ({
      ...prev,
      videoOn: !prev.videoOn
    }));
  };

  // Sample data
  const chatList = [
    { name: "Juan Pérez", message: "¡Hola! ¿Cómo estás?", active: true },
    { name: "María García", message: "Ok, nos vemos mañana", active: false },
    { name: "Grupo Familia", message: "¿A qué hora es la reunión?", active: false }
  ];

  const messages = [
    { text: "¡Hola! ¿Cómo estás?", time: "10:30", sent: false },
    { text: "¡Muy bien! ¿Y tú?", time: "10:31", sent: true },
    { text: "Todo bien, gracias. ¿Nos vemos mañana?", time: "10:32", sent: false },
    { text: "¡Claro! A las 10:00 en el café", time: "10:33", sent: true }
  ];

  const tasks = [
    { 
      icon: <MessageSquare size={24} />, 
      title: "Primer Mensaje", 
      reward: "+50 puntos", 
      description: "Envía tu primer mensaje a un contacto", 
      progress: 100,
      status: "¡Completado!",
      completed: true
    },
    { 
      icon: <Users size={24} />, 
      title: "Primer Grupo", 
      reward: "+100 puntos", 
      description: "Crea tu primer grupo de chat", 
      progress: 0,
      status: "Pendiente",
      completed: false
    },
    { 
      icon: <Video size={24} />, 
      title: "Primera Videollamada", 
      reward: "+150 puntos", 
      description: "Realiza tu primera videollamada", 
      progress: 0,
      status: "Pendiente",
      completed: false
    }
  ];

  const contacts = [
    { name: "Juan Pérez", status: "Hey! Estoy usando TextME" },
    { name: "María García", status: "Disponible" },
    { name: "Luis Torres", status: "En una reunión" }
  ];

  return (
    <div className="bg-gray-200 h-screen flex items-center justify-center">
      <div className="w-11/12 max-w-7xl h-[90vh] bg-white flex shadow-md">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="bg-gray-100 p-4 flex items-center relative">
            <div className="w-10 h-10 rounded-full bg-emerald-700 mr-3 cursor-pointer"
                 onClick={() => setProfileMenuActive(!profileMenuActive)}></div>
            <span>Mi Perfil</span>
            
            {/* Profile dropdown menu */}
            {profileMenuActive && (
              <div className="absolute top-14 left-3 bg-white shadow-md rounded z-50">
                <ul>
                  <li className="py-3 px-5 cursor-pointer hover:bg-gray-100" 
                      onClick={() => openModal('profile')}>Perfil</li>
                  <li className="py-3 px-5 cursor-pointer hover:bg-gray-100"
                      onClick={() => openModal('tasks')}>Tareas</li>
                  <li className="py-3 px-5 cursor-pointer hover:bg-gray-100">Cerrar sesión</li>
                </ul>
              </div>
            )}
            
            {/* More options button */}
            <button 
              className="ml-auto p-2 rounded-full hover:bg-gray-200" 
              onClick={(e) => {
                e.stopPropagation();
                setOptionsMenuActive(!optionsMenuActive);
              }}
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>
            
            {/* Options dropdown menu */}
            {optionsMenuActive && (
              <div className="absolute top-14 right-3 bg-white shadow-md rounded z-50">
                <ul>
                  <li className="py-3 px-5 cursor-pointer hover:bg-gray-100"
                      onClick={() => openModal('editProfile')}>Editar perfil</li>
                  <li className="py-3 px-5 cursor-pointer hover:bg-gray-100"
                      onClick={() => openModal('newGroup')}>Crear nuevo grupo</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Search */}
          <div className="p-3">
            <div className="bg-gray-100 py-2 px-4 rounded-lg flex items-center">
              <Search size={16} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar o empezar nuevo chat" 
                className="w-full border-none bg-transparent outline-none ml-3 text-sm"
              />
            </div>
          </div>
          
          {/* Chat list */}
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
        </div>
        
        {/* Main chat */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="bg-gray-100 p-4 flex items-center border-b border-gray-200">
            <div className="w-10 h-10 rounded-full bg-emerald-700"></div>
            <span className="ml-3">Juan Pérez</span>
            
            {/* Call buttons - NEW */}
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
          
          {/* Messages */}
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
                {message.text}
                <div className="text-xs text-gray-500 text-right mt-1">{message.time}</div>
              </div>
            ))}
          </div>
          
          {/* Input area */}
          <div className="bg-gray-100 p-4 flex items-center gap-3">
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
            />
            <button className="p-2 rounded-full hover:bg-gray-200">
              <Send size={20} className="text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center z-50 modal-overlay"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Perfil</h2>
              <X 
                size={24} 
                className="cursor-pointer" 
                onClick={closeModal} 
              />
            </div>
            <div className="text-center mb-5">
              <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto"></div>
              <p className="mt-3">Mi Nombre</p>
            </div>
            <div className="mb-4">
              <h3 className="font-bold">Info</h3>
              <p className="text-gray-500">Hey! Estoy usando TextME</p>
            </div>
            <div>
              <h3 className="font-bold">Teléfono</h3>
              <p className="text-gray-500">+1234567890</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tasks Modal */}
      {activeModal === 'tasks' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-5 rounded-lg w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Tareas y Recompensas</h2>
              <X 
                size={24} 
                className="cursor-pointer" 
                onClick={closeModal} 
              />
            </div>
            <div>
              {tasks.map((task, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-4 mb-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      {task.icon}
                      <h3 className="font-bold">{task.title}</h3>
                    </div>
                    <div className="text-emerald-600 font-bold">{task.reward}</div>
                  </div>
                  <div className="text-gray-500 mb-3">{task.description}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${task.completed ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      {activeModal === 'editProfile' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Editar Perfil</h2>
              <X 
                size={24} 
                className="cursor-pointer" 
                onClick={closeModal} 
              />
            </div>
            <div className="text-center mb-5">
              <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto relative">
                <label className="absolute bottom-0 right-0 bg-yellow-400 text-white rounded-full p-2 cursor-pointer">
                  <Edit size={16} />
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Nombre</label>
              <input 
                type="text" 
                defaultValue="Mi Nombre" 
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Info</label>
              <textarea 
                defaultValue="Hey! Estoy usando TextME" 
                className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
              ></textarea>
            </div>
            <button className="w-full bg-emerald-600 text-white py-3 px-5 rounded text-sm hover:bg-emerald-700">
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
      
      {/* New Group Modal */}
      {activeModal === 'newGroup' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-5 rounded-lg w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Crear Nuevo Grupo</h2>
              <X 
                size={24} 
                className="cursor-pointer" 
                onClick={closeModal} 
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Nombre del Grupo</label>
              <input 
                type="text" 
                placeholder="Ej: Familia" 
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Descripción (opcional)</label>
              <textarea 
                placeholder="Añade una descripción del grupo" 
                className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Agregar participantes</label>
              <div className="bg-gray-100 py-2 px-4 rounded-lg flex items-center mb-4">
                <Search size={16} className="text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Buscar contactos" 
                  className="w-full border-none bg-transparent outline-none ml-3 text-sm"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {contacts.map((contact, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-3 border-b border-gray-100 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-700 mr-4"></div>
                    <div className="flex-1">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.status}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-emerald-600"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-emerald-600 text-sm my-4">
              Participantes seleccionados: 0
            </div>
            
            <button className="w-full bg-emerald-600 text-white py-3 px-5 rounded text-sm hover:bg-emerald-700">
              Crear Grupo
            </button>
          </div>
        </div>
      )}

      {/* Incoming Call Modal - NEW */}
      {incomingCall && (
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
      )}

      {/* Video Call Modal - NEW */}
      {activeModal === 'videoCall' && (
        <div className="fixed inset-0 bg-black flex flex-col z-50">
          {/* Main video area */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Remote video (big) */}
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-700"></div>
              <p className="text-white ml-3">Juan Pérez</p>
            </div>
            
            {/* Self video (small) */}
            <div className="absolute bottom-5 right-5 w-48 h-32 bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center">
              {callSettings.videoOn ? (
                <div className="w-10 h-10 rounded-full bg-emerald-700"></div>
              ) : (
                <VideoOff size={30} className="text-white" />
              )}
            </div>
          </div>
          
          {/* Call controls */}
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
      )}
    </div>
  );
};

export default Dashboard;