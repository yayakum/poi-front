import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Send, X, ListChecks, BadgePlus, Clock, Check, CheckCheck, File, Image, Film } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

// Importamos los mismos avatares que en MainChat
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

// Renderiza la imagen de perfil correctamente
const renderAvatar = (avatarPath) => {
  const avatarImage = getAvatarImage(avatarPath);
  
  if (avatarImage) {
    return <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
  }
  
  return null;
};

const GroupChat = ({ openModal, selectedGroup, closeChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [hasPendingTasks, setHasPendingTasks] = useState(false);
  const [lastTaskCheck, setLastTaskCheck] = useState(null);
  // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Inicializar Socket.IO
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) return;

    // Conectar al namespace de grupo
    // socketRef.current = io(`${API_URL}/group`);
    socketRef.current = io('https://poi-back-xi.vercel.app/group');

    socketRef.current.on('connect', () => {
      console.log('Conectado al servidor Socket.IO (grupo)');
      socketRef.current.emit('authenticate', loggedInUser.id);
    });

    // Manejar mensajes entrantes
    socketRef.current.on('groupMessage', (data) => {
      if (data.groupId === selectedGroup.id) {
        setMessages(prevMessages => {
          // Verificar si el mensaje ya existe por ID
          if (prevMessages.some(msg => msg.id === data.id)) {
            return prevMessages;
          }
          
          const newMessage = {
            id: data.id,
            text: data.text,
            sent: data.senderId === loggedInUser.id,
            time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: data.senderName,
            senderName: data.senderName,
            senderId: data.senderId,
            senderImage: data.senderImage,
            type: data.type || 'texto',
            status: data.status || 'entregado',
            file: data.file
          };
          
          return [...prevMessages, newMessage];
        });
      }
    });

    // Manejar confirmación de mensajes enviados
    socketRef.current.on('groupMessageConfirmation', (data) => {
      if (data.groupId === selectedGroup.id) {
        setMessages(prevMessages => {
          // Si el mensaje confirmado ya existe por ID, no hacer nada
          if (prevMessages.some(msg => msg.id === data.id)) {
            return prevMessages;
          }
          
          // Buscar el mensaje temporal y reemplazarlo
          return prevMessages.map(msg => {
            // Si es un mensaje temporal con el mismo contenido, reemplazarlo
            if (msg.id.toString().startsWith('temp-') && msg.text === data.text && msg.sent) {
              return {
                ...msg,
                id: data.id, // Reemplazar el ID temporal con el ID real
                status: data.status || 'pendiente'
              };
            }
            return msg;
          });
        });
      }
    });

    // Nuevo manejador para actualizaciones de estado de mensajes individuales
    socketRef.current.on('messageStatusUpdate', (data) => {
      if (data.groupId === selectedGroup.id) {
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, status: data.status } 
            : msg
        ));
      }
    });

    // Nuevo manejador para actualizaciones múltiples de estado de mensajes
    socketRef.current.on('messagesStatusUpdate', (data) => {
      if (data.groupId === selectedGroup.id) {
        setMessages(prevMessages => prevMessages.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, status: data.status } 
            : msg
        ));
      }
    });

    // Manejar eventos de tareas actualizadas
    socketRef.current.on('taskUpdated', () => {
      if (selectedGroup) {
        checkPendingTasks();
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedGroup]);

  // Función para verificar tareas pendientes
  const checkPendingTasks = async () => {
    if (!selectedGroup || !selectedGroup.id) return;
    
    try {
      // const response = await axios.get(`${API_URL}/api/tasks/${selectedGroup.id}`);
      const response = await axios.get(`https://poi-back-xi.vercel.app/api/tasks/${selectedGroup.id}`);
      const pendingTasks = response.data.filter(task => task.estatus !== 'completa');
      
      // Establecer el estado de notificación si hay tareas pendientes
      setHasPendingTasks(pendingTasks.length > 0);
      
      // Actualizar la marca de tiempo de la última verificación
      setLastTaskCheck(new Date());
    } catch (error) {
      console.error('Error al verificar tareas pendientes:', error);
    }
  };

  // Verificar tareas pendientes cuando se selecciona un grupo
  useEffect(() => {
    if (selectedGroup) {
      checkPendingTasks();
    }
  }, [selectedGroup]);

  // Auto-scroll al último mensaje
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

  // Cargar mensajes iniciales
  useEffect(() => {
    if (selectedGroup) {
      setIsLoading(true);
      const loggedInUser = JSON.parse(localStorage.getItem('user'));

      if (!loggedInUser) {
        setIsLoading(false);
        return;
      }

      // Cargar mensajes del grupo
      // axios.get(`${API_URL}/api/messages/grupo/${selectedGroup.id}?userId=${loggedInUser.id}`)
      axios.get(`https://poi-back-xi.vercel.app/api/messages/grupo/${selectedGroup.id}?userId=${loggedInUser.id}`)
        .then(response => {
          setMessages(response.data.messages.map(msg => ({
            ...msg,
            sent: msg.senderId === loggedInUser.id,
            type: msg.type || 'texto',
            status: msg.status || 'pendiente'
          })));

          // Si hay mensajes no leídos, marcarlos como leídos
          if (response.data.unreadMessageIds && response.data.unreadMessageIds.length > 0) {
            markMessagesAsRead(response.data.unreadMessageIds);
          }
        })
        .catch(error => {
          console.error('Error cargando mensajes:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });

      // Unirse al grupo en el socket
      socketRef.current.emit('joinGroupChat', {
        groupId: selectedGroup.id,
        userId: loggedInUser.id
      });
    }
  }, [selectedGroup]);

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = (messageIds) => {
    if (!messageIds || messageIds.length === 0 || !selectedGroup) return;
    
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) return;

    // Evitar marcar mensajes enviados por el usuario actual
    const filteredIds = messageIds.filter(id => {
      const message = messages.find(msg => msg.id === id);
      return message && message.senderId !== loggedInUser.id;
    });

    if (filteredIds.length === 0) return;

    // Notificar al servidor sobre los mensajes leídos
    socketRef.current.emit('markGroupMessagesAsRead', {
      userId: loggedInUser.id,
      groupId: selectedGroup.id,
      messageIds: filteredIds
    });

    // También enviar solicitud HTTP para respaldo/sincronización
    // axios.post(`${API_URL}/api/messages/grupo/read`, {
      axios.post(`https://poi-back-xi.vercel.app/api/messages/grupo/read`, {
      userId: loggedInUser.id,
      groupId: selectedGroup.id,
      messageIds: filteredIds
    }).catch(error => {
      console.error('Error al marcar mensajes como leídos:', error);
    });
  };

  // Función para manejar la selección de archivos
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Por ahora manejamos un archivo a la vez
    
    // Determinar el tipo de archivo
    let fileType = 'archivo';
    if (file.type.startsWith('image/')) fileType = 'imagen';
    if (file.type.startsWith('video/')) fileType = 'video';
    
    // Crear objeto de vista previa
    const fileData = {
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      fileType: fileType,
      previewUrl: fileType === 'imagen' ? URL.createObjectURL(file) : null
    };
    
    // Guardar la información del archivo en el estado
    setSelectedFile(fileData);
    setFilePreview(fileData);
    
    // Limpiar el mensaje de texto si había alguno
    setMessage('');
  };

  // Enviar mensaje
  const handleSubmit = async (e) => {
    e.preventDefault();

    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser || !selectedGroup) return;

    // Si hay un archivo seleccionado, lo enviamos
    if (selectedFile) {
      setFileUploading(true);
      setUploadProgress(0);
      
      // Crear un ID temporal para el mensaje
      const tempId = `temp-${Date.now()}`;
      
      // Mostrar mensaje con archivo para dar feedback instantáneo
      const newMessage = {
        id: tempId,
        text: selectedFile.name,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: loggedInUser.nombre,
        senderName: loggedInUser.nombre,
        senderId: loggedInUser.id,
        senderImage: loggedInUser.foto_perfil,
        status: 'pendiente',
        type: selectedFile.fileType,
        file: {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          url: selectedFile.previewUrl
        }
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Crear objeto FormData
      const formData = new FormData();
      formData.append('file', selectedFile.file);
      formData.append('remitente_id', loggedInUser.id);
      formData.append('grupo_id', selectedGroup.id);
      
      try {
        // const response = await axios.post(`${API_URL}/api/mensajes/archivo`, formData, {
          const response = await axios.post('https://poi-back-xi.vercel.app/api/mensajes/archivo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        // Actualizar el mensaje temporal con la información real
        const sentMessage = response.data.data;
        
        // Asegurarnos de que la URL sea completa con el servidor base
        if (sentMessage.file && sentMessage.file.url) {
          // const serverUrl = `${API_URL}`; // URL base del servidor
          const serverUrl = 'https://poi-back-xi.vercel.app'; // URL base del servidor
          
          // Si la URL no comienza con http, agregarle el servidor base
          if (!sentMessage.file.url.startsWith('http')) {
            sentMessage.file.url = `${serverUrl}${sentMessage.file.url}`;
          }
        }
        
        // Actualizar el mensaje en el estado local con la URL completa
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? {
            ...msg,
            id: sentMessage.id,
            file: sentMessage.file,
            status: sentMessage.status
          } : msg
        ));
        
        // Notificar al servidor de socket sobre el nuevo mensaje con archivo
        if (socketRef.current) {
          socketRef.current.emit('fileGroupMessageSent', {
            messageId: sentMessage.id,
            groupId: selectedGroup.id
          });
        }
        
      } catch (error) {
        console.error('Error al subir archivo:', error);
        // Marcar el mensaje como fallido
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        ));
      } finally {
        setFileUploading(false);
        setUploadProgress(0);
        // Limpiar el input de archivos y el estado
        fileInputRef.current.value = '';
        setSelectedFile(null);
        setFilePreview(null);
      }
    } 
    // Si hay mensaje de texto, lo enviamos
    else if (message.trim() !== '') {
      // Crear un ID temporal único para el mensaje
      const tempId = `temp-${Date.now()}`;
      
      const newMessage = {
        id: tempId,
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: loggedInUser.nombre,
        senderName: loggedInUser.nombre,
        senderId: loggedInUser.id,
        senderImage: loggedInUser.foto_perfil,
        status: 'pendiente',
        type: 'texto'
      };

      // Actualizar el estado local con el mensaje temporal
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Emitir mensaje a través del socket
      socketRef.current.emit('sendGroupMessage', {
        senderId: loggedInUser.id,
        senderName: loggedInUser.nombre,
        senderImage: loggedInUser.foto_perfil,
        groupId: selectedGroup.id,
        text: message,
        timestamp: new Date()
      });
    }
  };

  // Renderiza el icono de estado de mensaje
  const renderMessageStatus = (status) => {
    switch (status) {
      case 'pendiente':
        return <Clock size={14} className="text-gray-400" />;
      case 'entregado':
        return <Check size={14} className="text-gray-400" />;
      case 'leido':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'error':
        return <X size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  // Renderiza el contenido del mensaje según su tipo
  const renderMessageContent = (message) => {
    if (!message.type || message.type === 'texto') {
      // Si es un mensaje de texto normal
      return <div>{message.text}</div>;
    }
    
    // Si es un tipo de archivo pero no tenemos información de archivo
    if (!message.file) return <div>{message.text}</div>;
    
    // Según el tipo de archivo
    switch (message.type) {
      case 'imagen':
        return (
          <div className="message-content">
            <div className="mb-1 flex items-center">
              <Image size={16} className="mr-1 text-blue-500" />
              <span className="text-sm text-gray-600">{message.file.name}</span>
            </div>
            <img 
              src={message.file.url} 
              alt={message.file.name} 
              className="max-w-full rounded-md max-h-60 object-contain cursor-pointer"
              onClick={() => window.open(message.file.url, '_blank')}
            />
          </div>
        );
      case 'video':
        return (
          <div className="message-content">
            <div className="mb-1 flex items-center">
              <Film size={16} className="mr-1 text-blue-500" />
              <span className="text-sm text-gray-600">{message.file.name}</span>
            </div>
            <video 
              src={message.file.url} 
              controls 
              className="max-w-full rounded-md max-h-60" 
            />
          </div>
        );
      case 'archivo':
      default:
        return (
          <div className="file-attachment p-3 bg-gray-50 rounded-md flex items-center">
            <File size={24} className="mr-3 text-blue-500" />
            <div className="flex-1">
              <div className="text-sm font-medium">{message.file.name}</div>
              <div className="text-xs text-gray-500">
                {(message.file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <a 
              href={message.file.url} 
              download={message.file.name}
              className="ml-2 p-2 rounded-full hover:bg-gray-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </a>
          </div>
        );
    }
  };

  // Componente para mostrar la vista previa del archivo seleccionado
  const FilePreviewComponent = ({ filePreview, onCancel }) => {
    if (!filePreview) return null;
    
    return (
      <div className="bg-gray-200 p-3 border-t border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {filePreview.fileType === 'imagen' && <Image size={20} className="mr-2 text-blue-500" />}
            {filePreview.fileType === 'video' && <Film size={20} className="mr-2 text-blue-500" />}
            {filePreview.fileType === 'archivo' && <File size={20} className="mr-2 text-blue-500" />}
            <div>
              <div className="font-medium text-sm">{filePreview.name}</div>
              <div className="text-xs text-gray-500">{(filePreview.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-300"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
        
        {filePreview.fileType === 'imagen' && filePreview.previewUrl && (
          <div className="mt-2 max-h-40 overflow-hidden">
            <img 
              src={filePreview.previewUrl} 
              alt="Vista previa" 
              className="max-w-full max-h-40 object-contain mx-auto rounded"
            />
          </div>
        )}
      </div>
    );
  };

  // Marcar mensajes como leídos cuando el usuario los ve
  useEffect(() => {
    if (messages.length && selectedGroup) {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      if (!loggedInUser) return;

      // Filtrar mensajes recibidos (no enviados por el usuario actual) y no marcados como leídos
      const unreadMessageIds = messages
        .filter(msg => !msg.sent && msg.senderId !== loggedInUser.id && !msg.id.toString().startsWith('temp-'))
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    }
  }, [messages, selectedGroup]);

  // Abrir información del grupo
  const handleOpenGroupInfo = () => {
    openModal('groupInfo');
  };

  // Abrir gestión de tareas
  const handleOpenManageTask = () => {
    openModal('manageTasks');
  };

  // Abrir creación de tareas
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
          {renderAvatar(selectedGroup.foto_grupo) || (
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
            className="p-2 rounded-full hover:bg-gray-200 mr-2 relative"
            onClick={handleOpenManageTask}
            title="Lista de tareas"
          >
            <ListChecks size={20} className="text-gray-600" />
            {hasPendingTasks && (
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></span>
            )}
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
                    {renderAvatar(message.senderImage) || (
                      <span className="text-white text-xs font-bold">
                        {message.sender.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{message.sender}</div>
                </div>
              )}
              {renderMessageContent(message)}
              <div className="flex justify-end items-center gap-1 mt-1">
                <div className="text-xs text-gray-500">{message.time}</div>
                {message.sent && (
                  <div className="ml-1">
                    {renderMessageStatus(message.status)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {filePreview && (
        <FilePreviewComponent 
          filePreview={filePreview} 
          onCancel={() => {
            setSelectedFile(null);
            setFilePreview(null);
            fileInputRef.current.value = '';
          }}
        />
      )}
      
      {fileUploading && (
        <div className="bg-gray-200 p-2 mb-2 rounded">
          <div className="flex items-center">
            <div className="mr-2 text-sm">Subiendo archivo...</div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="ml-2 text-sm">{uploadProgress}%</div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-100 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input 
            type="file" 
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
            placeholder={selectedFile ? "Presiona enviar para compartir archivo" : "Escribe un mensaje aquí"} 
            className="flex-1 py-3 px-4 rounded-lg border-none outline-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={selectedFile !== null}
          />
          <button 
            type="submit" 
            className={`p-2 rounded-full hover:bg-gray-200 ${
              (!message.trim() && !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!message.trim() && !selectedFile}
          >
            <Send size={20} className="text-emerald-600" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;