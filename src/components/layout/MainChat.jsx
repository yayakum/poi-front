import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, MapPin, Send, Video, Phone, X, Clock, Check, CheckCheck, File, Image, Film } from 'lucide-react';
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

const MainChat = ({ openModal, initiateCall, selectedUser: initialSelectedUser, closeChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserState, setSelectedUserState] = useState(initialSelectedUser);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const loggedInUserRef = useRef(JSON.parse(localStorage.getItem('user')));

  // Actualizar el estado cuando cambia el prop
  useEffect(() => {
    setSelectedUserState(initialSelectedUser);
  }, [initialSelectedUser]);

  // Inicializar Socket.IO
  useEffect(() => {
    // Obtener el usuario actual desde localStorage
    const loggedInUser = loggedInUserRef.current;
    if (!loggedInUser) return;

    // Crear conexión con el servidor Socket.IO
    socketRef.current = io('https://poi-back.vercel.app/private');

    // Manejar eventos de conexión
    socketRef.current.on('connect', () => {
      console.log('Conectado al servidor Socket.IO');
      // Autenticar al usuario en el servidor de Socket.IO
      socketRef.current.emit('authenticate', loggedInUser.id);
    });

    // NUEVO: Escuchar cambios de estado de usuarios
  socketRef.current.on('userStatusChanged', ({ userId, status }) => {
    console.log(`Usuario ${userId} cambió estado a ${status}`);
    
    // Actualizar el estado del usuario seleccionado si es él quien cambió
    if (selectedUserState && selectedUserState.id === parseInt(userId)) {
      setSelectedUserState(prevUser => ({
        ...prevUser,
        estado: status
      }));
    }
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
        sender: data.senderName,
        status: data.status,
        type: data.type || 'texto',
        file: data.file
      };
      
      setMessages(prevMessages => {
        // Evitar duplicados
        if (prevMessages.some(msg => msg.id === data.id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });

      // Si recibimos un mensaje, lo marcamos como leído automáticamente
      if (!newMessage.sent) {
        markMessagesAsRead([data.id]);
      }
    }
  });

    // Manejar confirmación de mensaje enviado
socketRef.current.on('privateMessageConfirmation', (data) => {
  console.log('Mensaje confirmado:', data);
  
  // Versión corregida - buscar mensajes temporales por contenido en caso de que los IDs no coincidan
  setMessages(prevMessages => {
    // Primero tratemos de encontrar el mensaje por ID (método convencional)
    const foundByIdDirectly = prevMessages.some(msg => 
      msg.id === `temp-${data.id}` || msg.id === data.id);
    
    if (foundByIdDirectly) {
      return prevMessages.map(msg => 
        msg.id === `temp-${data.id}` || msg.id === data.id 
          ? { ...msg, id: data.id, status: data.status } 
          : msg
      );
    }
    
    // Si no encontramos el mensaje por ID, busquemos mensajes temporales recientes
    // que coincidan con el texto y el remitente
    return prevMessages.map(msg => {
      // Verificar si es un mensaje temporal, tiene el mismo texto y es enviado por el mismo usuario
      if (msg.id.toString().startsWith('temp-') && 
          msg.text === data.text && 
          msg.sent === true) {
        console.log('Encontrado mensaje temporal para actualizar:', msg.id, '→', data.id);
        return { 
          ...msg, 
          id: data.id, 
          status: data.status 
        };
      }
      return msg;
    });
  });
});

  // *** IMPORTANTE: Asegúrate de que estos eventos estén correctamente escuchados ***
  
  // Manejar actualización de mensajes entregados
  socketRef.current.on('messagesDelivered', (data) => {
    console.log('Mensajes entregados:', data);
    if (data.messageIds && data.messageIds.length > 0) {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, status: 'entregado' } 
            : msg
        )
      );
    }
  });

  // Manejar actualización de mensajes leídos
  socketRef.current.on('messagesRead', (data) => {
    console.log('Mensajes leídos:', data);
    if (data.messageIds && data.messageIds.length > 0) {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, status: 'leido' } 
            : msg
        )
      );
    }
  });

    // Manejar notificaciones de nuevos mensajes
    socketRef.current.on('newMessageNotification', (data) => {
      // Aquí podrías implementar notificaciones para el usuario
      console.log('Nuevo mensaje de:', data.senderName, data.preview);
    });

    socketRef.current.on('messagesStatusChanged', (data) => {
      console.log('Estado de mensajes cambiado:', data);
      if (data.messageIds && data.messageIds.length > 0) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            data.messageIds.includes(msg.id) 
              ? { ...msg, status: data.newStatus } 
              : msg
          )
        );
      }
    });

    return () => {
      // Limpiar conexión al desmontar
      if (socketRef.current) {
        console.log('Desconectando socket de MainChat al desmontar componente');
        socketRef.current.disconnect();
      }
    };
  }, [selectedUserState]); // Añadir selectedUserState como dependencia

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

  // Cargar mensajes desde la API
  useEffect(() => {
    if (selectedUserState) {
      setIsLoading(true);
      setMessages([]); // Limpiar mensajes al cambiar de usuario
      const loggedInUser = loggedInUserRef.current;
      
      if (!loggedInUser) {
        setIsLoading(false);
        return;
      }
      
      // Cargar mensajes desde la API
      axios.get(`https://poi-back.vercel.app/api/mensajes/${loggedInUser.id}/${selectedUserState.id}`)
        .then(response => {
          // Cargar los mensajes después de un pequeño retraso para permitir que el DOM se actualice
          setTimeout(() => {
            // Asegurarse de que todos los mensajes tengan un estado
            const messagesWithStatus = response.data.messages.map(msg => ({
              ...msg,
              status: msg.status || (msg.sent ? 'pendiente' : 'leido'),
              type: msg.type || 'texto',
              file: msg.attachments && msg.attachments.length > 0 ? {
                id: msg.attachments[0].id,
                name: msg.attachments[0].name,
                url: msg.attachments[0].url,
                type: msg.attachments[0].type,
                size: msg.attachments[0].size
              } : null
            }));
            setMessages(messagesWithStatus);
            setIsLoading(false);

            // Marcar como leídos los mensajes recibidos que no lo estén
            const unreadMessages = messagesWithStatus
              .filter(msg => !msg.sent && msg.status !== 'leido')
              .map(msg => msg.id);
              
            if (unreadMessages.length > 0) {
              markMessagesAsRead(unreadMessages);
            }
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

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    
    const loggedInUser = loggedInUserRef.current;
    if (!loggedInUser || !selectedUserState || !socketRef.current) return;
    
    socketRef.current.emit('markMessagesAsRead', {
      userId: loggedInUser.id,
      senderId: selectedUserState.id,
      messageIds: messageIds
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

  // Función para manejar el envío de mensajes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loggedInUser = loggedInUserRef.current;
    if (!loggedInUser || !selectedUserState) return;
    
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
      formData.append('destinatario_id', selectedUserState.id);
      
      // Modificación en MainChat.jsx - función handleSubmit para el manejo de archivos

// Reemplazar el bloque existente de actualización de mensaje después de la carga
try {
  const response = await axios.post('https://poi-back.vercel.app/api/mensajes/archivo', formData, {
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
    const serverUrl = 'https://poi-back.vercel.app'; // URL base del servidor
    
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
  socketRef.current.emit('fileMessageSent', {
    messageId: sentMessage.id,
    receiverId: selectedUserState.id
  });
  
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
    // Si no hay archivo pero hay mensaje de texto, enviamos el mensaje
    else if (message.trim() !== '') {
      // Preparar el mensaje para enviar
      const messageData = {
        senderId: loggedInUser.id,
        senderName: loggedInUser.nombre,
        receiverId: selectedUserState.id,
        text: message
      };
      
      // Crear un ID temporal para el mensaje
      const tempId = `temp-${Date.now()}`;
      
      // Mostrar mensaje inmediatamente en UI (optimistic UI)
      const newMessage = {
        id: tempId,
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: loggedInUser.nombre,
        status: 'pendiente', // Inicialmente pendiente
        type: 'texto'
      };

      console.log("ESTADO INICIAL DEL MENSAJE:", newMessage);
    
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Emitir mensaje a través de Socket.IO
      if (socketRef.current) {
        console.log("EMITIENDO EVENTO sendPrivateMessage");
        socketRef.current.emit('sendPrivateMessage', messageData);
        
        // Configurar un temporizador para comprobar si el evento de confirmación se recibe
        setTimeout(() => {
          // Comprobar si el mensaje aún tiene estado 'pendiente' después de 2 segundos
          setMessages(prevMessages => {
            const pendingMessage = prevMessages.find(msg => msg.id === tempId);
            if (pendingMessage && pendingMessage.status === 'pendiente') {
              console.warn("ATENCIÓN: Mensaje aún pendiente después de 2 segundos:", tempId);
            }
            return prevMessages;
          });
        }, 2000);
      } else {
        console.error("ERROR: socketRef.current es nulo");
      }
    }
  };

  // Función para manejar el compartir ubicación
  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Crear un formato especial que podamos reconocer después
        const locationText = `[UBICACION]${latitude},${longitude}[/UBICACION]`;
        
        // Establecer el mensaje con la ubicación
        setMessage(locationText);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación. Verifica los permisos de tu navegador.');
      }
    );
  };

  // Función para iniciar una videollamada
  const handleInitiateCall = (isVideo = true) => {
    if (!selectedUserState) return;
    
    // Usar la función proporcionada por el Dashboard
    initiateCall(selectedUserState, isVideo);
  };

  // Renderiza la imagen de perfil correctamente
  const renderAvatar = (avatarPath) => {
    const avatarImage = getAvatarImage(avatarPath);
    
    if (avatarImage) {
      return <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    
    return null;
  };

  

 // Asegúrate de que el renderizado de los iconos de estado sea correcto
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
  const locationRegex = /\[UBICACION\]([-\d.]+),([-\d.]+)\[\/UBICACION\]/;
  const locationMatch = message.text ? message.text.match(locationRegex) : null;
  
  if (locationMatch) {
    const [, latitude, longitude] = locationMatch;
    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    
    return (
      <div className="message-content">
        <div className="mb-1 flex items-center">
          <MapPin size={16} className="mr-1 text-blue-500" />
          <span className="text-sm text-gray-600">Ubicación compartida</span>
        </div>
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Ver en Google Maps
        </a>
      </div>
    );
  }

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
    case 'ubicacion':
      return (
        <div className="message-content">
          <div className="mb-1 flex items-center">
            <MapPin size={16} className="mr-1 text-blue-500" />
            <span className="text-sm text-gray-600">Ubicación compartida</span>
          </div>
          <a 
            href={message.text.split(': ')[1]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            Ver en Google Maps
          </a>
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
            onClick={() => handleInitiateCall(true)}
            title="Videollamada"
          >
            <Video size={20} className="text-emerald-600" />
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
      
      <div className="bg-gray-100 p-4">
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
          <button type="button" className="p-2 rounded-full hover:bg-gray-200" onClick={handleLocationShare}>
            <MapPin size={20} className="text-gray-600" />
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

export default MainChat;