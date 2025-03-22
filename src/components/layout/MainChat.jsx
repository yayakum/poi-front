import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, MapPin, Send, Video, Phone, X } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

// Importamos los mismos avatares que en EditProfileModal
import BMO from '../../assets/BMO.jpg';
import BonnibelBubblegum from '../../assets/BonnibelBubblegum.jpg';
import Finn from '../../assets/Finn.jpg';
import FlamePrincess from '../../assets/FlamePrincess.jpg';
import Gunter from '../../assets/Gunter.jpg';
import IceKing from '../../assets/IceKing.jpg';
import Jake from '../../assets/Jake.jpg';
import LadyRainicorn from '../../assets/LadyRainicorn.jpg';
import Lemongrab from '../../assets/Lemongrab.jpg';
import LumpySpacePrincess from '../../assets/LumpySpacePrincess.jpg';
import Marcelline from '../../assets/Marcelline.jpg';

// Creamos un mapa para relacionar los nombres de archivo con las imágenes importadas
const avatarMap = {
  'assets/BonnibelBubblegum.jpg': BonnibelBubblegum,
  'assets/Finn.jpg': Finn,
  'assets/Jake.jpg': Jake,
  'assets/Marcelline.jpg': Marcelline,
  'assets/FlamePrincess.jpg': FlamePrincess,
  'assets/BMO.jpg': BMO,
  'assets/Gunter.jpg': Gunter,
  'assets/IceKing.jpg': IceKing,
  'assets/LadyRainicorn.jpg': LadyRainicorn,
  'assets/Lemongrab.jpg': Lemongrab,
  'assets/LumpySpacePrincess.jpg': LumpySpacePrincess
};

// Función auxiliar para obtener la imagen correcta según la ruta
const getAvatarImage = (avatarPath) => {
  if (!avatarPath) return null;
  return avatarMap[avatarPath] || null;
};

const MainChat = ({ openModal, simulateIncomingCall, selectedUser: initialSelectedUser, closeChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Agregar estado local para selectedUser
  const [selectedUserState, setSelectedUserState] = useState(initialSelectedUser);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Actualizar el estado cuando cambia el prop
  useEffect(() => {
    setSelectedUserState(initialSelectedUser);
  }, [initialSelectedUser]);

  // Inicializar Socket.IO
  useEffect(() => {
    // Obtener el usuario actual desde localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) return;

    // Crear conexión con el servidor Socket.IO
    socketRef.current = io('http://localhost:3000');

    // Manejar eventos de conexión
    socketRef.current.on('connect', () => {
      console.log('Conectado al servidor Socket.IO');
      // Autenticar al usuario en el servidor de Socket.IO
      socketRef.current.emit('authenticate', loggedInUser.id);
    });

    // Manejar mensajes entrantes
    socketRef.current.on('privateMessage', (data) => {
      if (
        (data.senderId === selectedUserState?.id && data.receiverId === loggedInUser.id) || 
        (data.receiverId === selectedUserState?.id && data.senderId === loggedInUser.id)
      ) {
        const newMessage = {
          id: data.id,
          text: data.text,
          sent: data.senderId === loggedInUser.id,
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: data.senderName
        };
        
        setMessages(prevMessages => {
          // Evitar duplicados
          if (prevMessages.some(msg => msg.id === data.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      }
    });

    // Manejar notificaciones de nuevos mensajes
    socketRef.current.on('newMessageNotification', (data) => {
      // Aquí podrías implementar notificaciones para el usuario
      console.log('Nuevo mensaje de:', data.senderName, data.preview);
    });

    // Manejar cambios de estado de usuarios
    socketRef.current.on('userStatusChanged', (data) => {
      console.log('Estado de usuario cambiado:', data);
      if (selectedUserState && parseInt(selectedUserState.id) === parseInt(data.userId)) {
        // Actualizar el estado del usuario seleccionado
        setSelectedUserState(prev => ({
          ...prev,
          estado: data.status
        }));
      }
    });

    return () => {
      // Limpiar conexión al desmontar
      socketRef.current.disconnect();
    };
  }, [selectedUserState]); // Añadir selectedUserState como dependencia

  // Auto-scroll al último mensaje - CORREGIDO
  useEffect(() => {
    // Solo hacer scroll si hay mensajes
    if (messages.length > 0) {
      // Usar scrollTo con behavior: 'instant' en lugar de scrollIntoView
      const messagesContainer = messagesEndRef.current?.parentElement;
      if (messagesContainer) {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'auto' // Usar 'auto' en lugar de 'smooth' para evitar la animación
        });
      }
    }
  }, [messages]);

  // Cargar mensajes desde la API - CORREGIDO
  useEffect(() => {
    if (selectedUserState) {
      setIsLoading(true);
      setMessages([]); // Limpiar mensajes al cambiar de usuario
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      
      if (!loggedInUser) {
        setIsLoading(false);
        return;
      }
      
      // Cargar mensajes desde la API
      axios.get(`http://localhost:3000/api/mensajes/${loggedInUser.id}/${selectedUserState.id}`)
        .then(response => {
          // Cargar los mensajes después de un pequeño retraso para permitir que el DOM se actualice
          setTimeout(() => {
            setMessages(response.data.messages);
            setIsLoading(false);
          }, 50);
        })
        .catch(error => {
          console.error('Error cargando mensajes:', error);
          setIsLoading(false);
        });

      // Informar al servidor que estamos en una conversación con este usuario
      socketRef.current.emit('joinChat', {
        userId: loggedInUser.id,
        targetId: selectedUserState.id
      });
    }
  }, [selectedUserState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() === '') return;
    
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser || !selectedUserState) return;
    
    // Preparar el mensaje para enviar
    const messageData = {
      senderId: loggedInUser.id,
      senderName: loggedInUser.nombre,
      receiverId: selectedUserState.id,
      text: message
    };
    
    // Mostrar mensaje inmediatamente en UI (optimistic UI)
    const newMessage = {
      id: `temp-${Date.now()}`,
      text: message,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: loggedInUser.nombre
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Emitir mensaje a través de Socket.IO
    socketRef.current.emit('sendPrivateMessage', messageData);
  };

  // Renderiza la imagen de perfil correctamente
  const renderAvatar = (avatarPath) => {
    const avatarImage = getAvatarImage(avatarPath);
    
    if (avatarImage) {
      return <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    
    return null;
  };

  if (!selectedUserState) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Selecciona un chat para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="bg-gray-100 p-4 flex items-center border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-emerald-700 cursor-pointer flex items-center justify-center" onClick={() => openModal('profile', selectedUserState)}>
          {renderAvatar(selectedUserState.foto_perfil) || (
            <span className="text-white font-bold">
              {selectedUserState.nombre.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="ml-3">
          <div className="font-medium">{selectedUserState.nombre}</div>
          <div className="text-xs text-gray-500">
            {selectedUserState.estado === 'online' ? (
              <span className="text-green-500">● En línea</span>
            ) : (
              <span className="text-gray-400">● Desconectado</span>
            )}
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <button 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => openModal('videoCall', selectedUserState)}
          >
            <Video size={20} className="text-emerald-600" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={simulateIncomingCall}
          >
            <Phone size={20} className="text-emerald-600" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={closeChat}
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto bg-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No hay mensajes aún. ¡Comienza la conversación!
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={message.id || index}
              className={`max-w-[65%] p-3 rounded-lg mb-2 relative ${
                message.sent 
                  ? 'bg-green-100 ml-auto' 
                  : 'bg-white'
              }`}
            >
              {!message.sent && (
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 mr-2 flex items-center justify-center">
                    {renderAvatar(selectedUserState.foto_perfil) || (
                      <span className="text-white text-xs font-bold">
                        {selectedUserState.nombre.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{message.sender}</div>
                </div>
              )}
              <div>{message.text}</div>
              <div className="text-xs text-gray-500 text-right mt-1">{message.time}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="bg-gray-100 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef}
          />
          <button 
            type="button" 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => fileInputRef.current.click()}
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-gray-200">
            <MapPin size={20} className="text-gray-600" />
          </button>
          <input 
            type="text"
            placeholder="Escribe un mensaje aquí" 
            className="flex-1 py-3 px-4 rounded-lg border-none outline-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button 
            type="submit" 
            className={`p-2 rounded-full hover:bg-gray-200 ${
              !message.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!message.trim()}
          >
            <Send size={20} className="text-emerald-600" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainChat;