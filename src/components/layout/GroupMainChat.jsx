import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Send, X, ListChecks,BadgePlus  } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

const GroupChat = ({ openModal, selectedGroup, closeChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) return;

    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('connect', () => {
      console.log('Conectado al servidor Socket.IO');
      socketRef.current.emit('authenticate', loggedInUser.id);
    });

    socketRef.current.on('groupMessage', (data) => {
      if (data.groupId === selectedGroup.id) {
        const newMessage = {
          id: data.id,
          text: data.text,
          sent: data.senderId === loggedInUser.id,
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: data.senderName,
          attachments: data.attachments || []
        };

        setMessages(prevMessages => {
          if (prevMessages.some(msg => msg.id === data.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedGroup) {
      setIsLoading(true);
      const loggedInUser = JSON.parse(localStorage.getItem('user'));

      if (!loggedInUser) {
        setIsLoading(false);
        return;
      }

      axios.get(`http://localhost:3000/api/grupos/mensajes/${selectedGroup.id}`)
        .then(response => {
          setMessages(response.data.messages);
        })
        .catch(error => {
          console.error('Error cargando mensajes:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });

      socketRef.current.emit('joinGroup', {
        groupId: selectedGroup.id,
        userId: loggedInUser.id
      });
    }
  }, [selectedGroup]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim() === '' && attachments.length === 0) return;

    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser || !selectedGroup) return;

    const messageData = {
      senderId: loggedInUser.id,
      senderName: loggedInUser.nombre,
      groupId: selectedGroup.id,
      text: message,
      attachments: attachments
    };

    const newMessage = {
      id: `temp-${Date.now()}`,
      text: message,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: loggedInUser.nombre,
      attachments: attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        tempUrl: URL.createObjectURL(file)
      }))
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setAttachments([]);

    socketRef.current.emit('sendGroupMessage', messageData);

    if (attachments.length > 0) {
      const formData = new FormData();
      attachments.forEach(file => {
        formData.append('files', file);
      });
      formData.append('remitente_id', loggedInUser.id);
      formData.append('grupo_id', selectedGroup.id);

      axios.post('http://localhost:3000/api/archivos/grupo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).catch(error => {
        console.error('Error al enviar archivos:', error);
      });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenGroupInfo = () => {
    openModal('groupInfo');
  };

  const handleOpenManageTask = () => {
    openModal('manageTasks');
  };

  const handleOpenCreateTask = () => {
    openModal('createTask');
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Selecciona un grupo para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <div className="bg-gray-100 p-4 flex items-center border-b border-gray-200">
        <div 
          className="w-10 h-10 rounded-full bg-emerald-700 cursor-pointer flex items-center justify-center"
          onClick={handleOpenGroupInfo}
        >
          {selectedGroup.foto_grupo ? (
            <img src={selectedGroup.foto_grupo} alt={selectedGroup.nombre} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="text-white font-bold">
              {selectedGroup.nombre.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div 
          className="ml-3 cursor-pointer"
          onClick={handleOpenGroupInfo}
        >
          <div className="font-medium">{selectedGroup.nombre}</div>
          <div className="text-xs text-gray-500">
            {selectedGroup.grupo_usuarios?.length || 0} participantes
          </div>
        </div>
        <div className="ml-auto flex items-center">
        <button 
            className="p-2 rounded-full hover:bg-gray-200 mr-2"
            onClick={handleOpenCreateTask} 
            title="Crear tarea"
          >
            <BadgePlus size={20} className="text-gray-600" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200 mr-2"
            onClick={handleOpenManageTask}
            title="Lista de tareas"
          >
            <ListChecks size={20} className="text-gray-600" />
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
                    {message.sender.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">{message.sender}</div>
                </div>
              )}
              <div>{message.text}</div>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((file, idx) => (
                    <div key={idx} className="text-sm flex items-center p-1 bg-gray-50 rounded">
                      <Paperclip size={12} className="mr-1 text-gray-500" />
                      <span className="truncate">{file.name}</span>
                      {file.url && (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ml-2 text-emerald-600 hover:underline"
                        >
                          Ver
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-right mt-1">{message.time}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {attachments.length > 0 && (
        <div className="bg-white p-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-100 p-2 rounded flex items-center">
                <Paperclip size={16} className="mr-1 text-gray-500" />
                <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                <button 
                  className="ml-1 text-red-500 hover:text-red-700"
                  onClick={() => removeAttachment(index)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-gray-100 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
          />
          <button 
            type="button" 
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => fileInputRef.current.click()}
          >
            <Paperclip size={20} className="text-gray-600" />
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
              !message.trim() && attachments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!message.trim() && attachments.length === 0}
          >
            <Send size={20} className="text-emerald-600" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;