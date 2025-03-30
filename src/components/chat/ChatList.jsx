import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Import avatar images
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

// Define avatar options mapping
const avatarOptions = [
  { src: BonnibelBubblegum, name: 'assets/BonnibelBubblegum.jpg' },
  { src: Finn, name: 'assets/Finn.jpg' },
  { src: Jake, name: 'assets/Jake.jpg' },
  { src: Marcelline, name: 'assets/Marcelline.jpg' },
  { src: FlamePrincess, name: 'assets/FlamePrincess.jpg' },
  { src: BMO, name: 'assets/BMO.jpg' },
  { src: Gunter, name: 'assets/Gunter.jpg' },
  { src: IceKing, name: 'assets/IceKing.jpg' },
  { src: LadyRainicorn, name: 'assets/LadyRainicorn.jpg' },
  { src: Lemongrab, name: 'assets/Lemongrab.jpg' },
  { src: LumpySpacePrincess, name: 'assets/LumpySpacePrincess.jpg' }
];

const ChatList = ({ setSelectedUser, setSelectedGroup }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'groups'
  const [unreadMessages, setUnreadMessages] = useState({}); // Objeto para rastrear mensajes no leídos por usuario/grupo
  const socketRef = useRef(null);
  const socketInitialized = useRef(false);

  // Helper function to get avatar source based on filename
  const getAvatarSrc = (filename) => {
    if (!filename) return null;
    const avatar = avatarOptions.find(opt => opt.name === filename);
    return avatar ? avatar.src : null;
  };

  // Función mejorada para cargar el estado de mensajes no leídos
  const loadUnreadMessagesStatus = async (userId) => {
    try {
      console.log('Cargando estado de mensajes no leídos para usuario:', userId);
      const response = await axios.get(`http://localhost:3000/api/unread/${userId}`);
      
      const newUnreadMessages = {};
      
      // Procesar mensajes no leídos de chats privados
      if (response.data && response.data.unreadStatus) {
        response.data.unreadStatus.forEach(item => {
          if (item.senderId) {
            newUnreadMessages[item.senderId] = true;
          }
        });
      }
      
      // Procesar mensajes no leídos de grupos
      if (response.data && response.data.unreadGroupsStatus) {
        response.data.unreadGroupsStatus.forEach(item => {
          if (item.groupId) {
            newUnreadMessages[`group-${item.groupId}`] = true;
          }
        });
      }
      
      // Actualizar el estado con los nuevos datos
      setUnreadMessages(prev => ({
        ...prev,
        ...newUnreadMessages
      }));
      
      console.log('Estado de mensajes no leídos actualizado:', newUnreadMessages);
    } catch (error) {
      console.error('Error al cargar estado de mensajes no leídos:', error);
    }
  };

  // Función para inicializar y configurar el socket
  const initializeSocket = (userId) => {
    if (socketInitialized.current) return;
    
    try {
      console.log('Inicializando socket en ChatList para usuario:', userId);
      
      // Crear nueva conexión socket
      socketRef.current = io('http://localhost:3000/private');
      
      // Conectar y autenticar
      socketRef.current.on('connect', () => {
        console.log('ChatList conectado a Socket.IO con ID:', socketRef.current.id);
        socketRef.current.emit('authenticate', userId);
        socketInitialized.current = true;
      });
      
      // Escuchar cambios de estado de usuarios
      socketRef.current.on('userStatusChanged', ({ userId, status }) => {
        console.log(`Usuario ${userId} cambió estado a ${status}`);
        setUsers(prevUsers => {
          return prevUsers.map(u => 
            u.id === parseInt(userId) ? { ...u, estado: status } : u
          );
        });
      });
      
      // Escuchar actualizaciones de perfil de usuario
      socketRef.current.on('userProfileUpdated', (userData) => {
        console.log('Actualización de perfil recibida:', userData);
        
        // Actualizar la lista de usuarios
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.id === userData.id) {
              return {
                ...user,
                nombre: userData.nombre,
                foto_perfil: userData.foto_perfil,
                descripcion: userData.descripcion
              };
            }
            return user;
          });
        });
        
        // Si el usuario logueado es el mismo que se actualizó, actualizar también el localStorage
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (loggedUser && loggedUser.id === userData.id) {
          const updatedUser = {
            ...loggedUser,
            nombre: userData.nombre,
            foto_perfil: userData.foto_perfil,
            descripcion: userData.descripcion
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setLoggedInUser(updatedUser);
        }
        
        // Si hay un usuario seleccionado y es el mismo que se actualizó, actualizarlo también
        const selectedChat = JSON.parse(localStorage.getItem('selectedChat'));
        if (selectedChat && selectedChat.type === 'user' && selectedChat.id === userData.id) {
          setSelectedUser(prevSelected => {
            if (prevSelected && prevSelected.id === userData.id) {
              return {
                ...prevSelected,
                nombre: userData.nombre,
                foto_perfil: userData.foto_perfil,
                descripcion: userData.descripcion
              };
            }
            return prevSelected;
          });
        }
      });
      
      // Escuchar evento de creación de grupo
      socketRef.current.on('groupCreated', (data) => {
        console.log('Nuevo grupo creado:', data);
        
        // Añadir el nuevo grupo a la lista de grupos
        setGroups(prevGroups => {
          // Evitar duplicados verificando si el grupo ya existe
          if (prevGroups.some(g => g.id === data.group.id)) {
            return prevGroups;
          }
          return [...prevGroups, data.group];
        });
      });
      
      // Escuchar nuevas notificaciones de mensajes
      socketRef.current.on('newMessageNotification', (data) => {
        console.log('Nueva notificación de mensaje recibida en ChatList:', data);
        
        // Agregar el remitente a la lista de chats con mensajes no leídos
        setUnreadMessages(prev => ({
          ...prev,
          [data.senderId]: true
        }));
      });
      
      // Escuchar notificaciones de mensajes de grupo
      socketRef.current.on('newGroupMessageNotification', (data) => {
        console.log('Nueva notificación de mensaje de grupo recibida:', data);
        
        // Verificar si el usuario no está actualmente en este grupo
        const currentSelectedChat = JSON.parse(localStorage.getItem('selectedChat'));
        if (!currentSelectedChat || 
            currentSelectedChat.type !== 'group' || 
            currentSelectedChat.id !== data.groupId) {
          
          // Actualizar el estado de mensajes no leídos para este grupo
          setUnreadMessages(prev => ({
            ...prev,
            [`group-${data.groupId}`]: true
          }));
        }
      });
      
      // Escuchar mensajes privados directamente
      socketRef.current.on('privateMessage', (data) => {
        console.log('Mensaje privado recibido en ChatList:', data);
        
        // Si el mensaje es para el usuario actual y no fue enviado por él
        if (data.receiverId === userId && data.senderId !== userId) {
          // Verificar si el usuario no está actualmente en este chat
          const currentSelectedUser = JSON.parse(localStorage.getItem('selectedChat'));
          if (!currentSelectedUser || currentSelectedUser.id !== data.senderId) {
            // Actualizar estado de mensajes no leídos
            setUnreadMessages(prev => ({
              ...prev,
              [data.senderId]: true
            }));
          }
        }
      });
      
      // Escuchar cuando los mensajes son marcados como leídos
      socketRef.current.on('messagesRead', (data) => {
        console.log('Notificación de mensajes leídos recibida:', data);
        
        // Si todos los mensajes de un usuario específico son leídos, actualizamos
        if (data.readerId === userId) {
          // Actualizar estado para limpiar la notificación para este chat específico
          setUnreadMessages(prev => {
            const updated = { ...prev };
            delete updated[data.senderId];
            return updated;
          });
        }
      });
      
      console.log('Socket inicializado y listeners configurados para ChatList');
    } catch (error) {
      console.error('Error al inicializar socket en ChatList:', error);
      socketInitialized.current = false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.id) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }
        
        setLoggedInUser(user);

        // Obtener usuarios
        const usersResponse = await axios.get('http://localhost:3000/api/users/');
        if (usersResponse.data && usersResponse.data.usuarios) {
          const filteredUsers = usersResponse.data.usuarios.filter(u => u.id !== user.id);
          setUsers(filteredUsers);
        } else {
          console.error('Formato de respuesta de usuarios incorrecto:', usersResponse.data);
        }

        // Obtener grupos del usuario
        try {
          const groupsResponse = await axios.get(`http://localhost:3000/api/grupos/usuario/${user.id}`);
          if (groupsResponse.data && groupsResponse.data.grupos) {
            setGroups(groupsResponse.data.grupos);
          }
        } catch (groupError) {
          console.error('Error al obtener grupos:', groupError);
          // No interrumpimos la carga por error en grupos
        }

        // Inicializar el socket con el ID del usuario
        initializeSocket(user.id);
        
        // Cargar estado de mensajes no leídos
        await loadUnreadMessagesStatus(user.id);

        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Error al cargar datos');
        setLoading(false);
      }
    };

    fetchData();
    
    // Limpiar conexión al desmontar
    return () => {
      if (socketRef.current) {
        console.log('Desconectando socket de ChatList al desmontar componente');
        socketRef.current.disconnect();
        socketInitialized.current = false;
      }
    };
  }, []);

  // Escuchar el evento personalizado para nuevos grupos
useEffect(() => {
  const handleNewGroup = (e) => {
    console.log('Evento de nuevo grupo recibido en ChatList:', e.detail);
    
    if (e.detail && e.detail.group) {
      // Añadir el nuevo grupo a la lista local
      setGroups(prevGroups => {
        // Verificar si el grupo ya existe para evitar duplicados
        if (prevGroups.some(g => g.id === e.detail.group.id)) {
          return prevGroups;
        }
        return [...prevGroups, e.detail.group];
      });
    }
  };
  
  // Agregar el listener para el evento personalizado
  window.addEventListener('newGroupCreated', handleNewGroup);
  
  // Limpiar al desmontar
  return () => {
    window.removeEventListener('newGroupCreated', handleNewGroup);
  };
}, []);

  // Escuchar periódicamente las actualizaciones de mensajes no leídos como respaldo
  useEffect(() => {
    if (!loggedInUser) return;
    
    // Actualizar el estado cada 30 segundos como respaldo (por si el socket falla)
    const intervalId = setInterval(() => {
      loadUnreadMessagesStatus(loggedInUser.id);
    }, 30000); // 30 segundos
    
    return () => clearInterval(intervalId);
  }, [loggedInUser]);

  // Función mejorada para manejar la selección de un chat
  const handleSelection = (item, type) => {
    if (type === 'user') {
      // Guardar el usuario seleccionado en localStorage para referencias cruzadas
      localStorage.setItem('selectedChat', JSON.stringify({id: item.id, type: 'user'}));
      
      setSelectedUser(item);
      setSelectedGroup(null);
      
      // Limpiar indicador de mensajes no leídos para este usuario
      setUnreadMessages(prev => {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      });
      
      // Enviar evento al servidor para marcar los mensajes como leídos
      if (socketRef.current && loggedInUser) {
        console.log(`Notificando al servidor que ${loggedInUser.id} se unió al chat con ${item.id}`);
        socketRef.current.emit('joinChat', {
          userId: loggedInUser.id,
          targetId: item.id
        });
      }
    } else {
      // Guardar el grupo seleccionado en localStorage para referencias cruzadas
      localStorage.setItem('selectedChat', JSON.stringify({id: item.id, type: 'group'}));
      
      setSelectedGroup(item);
      setSelectedUser(null);
      
      // Limpiar indicador de mensajes no leídos para este grupo
      setUnreadMessages(prev => {
        const updated = { ...prev };
        delete updated[`group-${item.id}`];
        return updated;
      });
    }
  };

  const getFilteredItems = () => {
    if (activeTab === 'users') return { users, groups: [] };
    if (activeTab === 'groups') return { users: [], groups };
    return { users, groups }; // 'all'
  };

  const { users: filteredUsers, groups: filteredGroups } = getFilteredItems();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando conversaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(90vh-120px)] flex flex-col">
      {/* Pestañas de navegación */}
      <div className="flex border-b border-gray-200 mb-2">
        <button
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          Todos
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${activeTab === 'groups' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('groups')}
        >
          Grupos
        </button>
      </div>

      {/* Contenido de chats */}
      <div className="overflow-y-auto flex-1">
        {filteredUsers.length === 0 && filteredGroups.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No se encontraron conversaciones
          </div>
        ) : (
          <div>
            {/* Lista de usuarios */}
            {filteredUsers.map((user) => {
              const avatarSrc = getAvatarSrc(user.foto_perfil);
              const hasUnreadMessages = unreadMessages[user.id] === true;
              
              return (
                <div 
                  key={`user-${user.id}`}
                  className="p-4 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100 relative"
                  onClick={() => handleSelection(user, 'user')}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center overflow-hidden">
                      {avatarSrc ? (
                        <img 
                          src={avatarSrc} 
                          alt={user.nombre} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {user.nombre.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Indicador de estado */}
                    <span 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${user.estado === 'online' ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`}
                    ></span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-medium">{user.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {user.estado === 'online' ? (
                        <span className="text-green-500"> En línea</span>
                      ) : (
                        <span className="text-gray-400"> Desconectado</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Indicador de mensajes no leídos - Notemos el diseño más visible */}
                  {hasUnreadMessages && (
                    <div className="absolute mt-4 top-4 right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Lista de grupos */}
            {filteredGroups.map((group) => {
              const groupAvatarSrc = getAvatarSrc(group.foto_grupo);
              const hasUnreadMessages = unreadMessages[`group-${group.id}`] === true;
              
              return (
                <div 
                  key={`group-${group.id}`}
                  className="p-4 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100 relative"
                  onClick={() => handleSelection(group, 'group')}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden">
                    {groupAvatarSrc ? (
                      <img 
                        src={groupAvatarSrc} 
                        alt={group.nombre} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {group.nombre.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-medium">{group.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {group.grupo_usuarios?.length || 0} participantes
                    </div>
                  </div>
                  
                  {/* Indicador de mensajes no leídos para grupos */}
                  {hasUnreadMessages && (
                    <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;