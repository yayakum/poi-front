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
  const socketRef = useRef(null);
  const socketInitialized = useRef(false);

  // Helper function to get avatar source based on filename
  const getAvatarSrc = (filename) => {
    if (!filename) return null;
    const avatar = avatarOptions.find(opt => opt.name === filename);
    return avatar ? avatar.src : null;
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

        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Error al cargar datos');
        setLoading(false);
      }
    };

    fetchData();
    
    // Inicializar Socket.IO - Solo una vez
    const initSocket = () => {
      if (socketInitialized.current) return;
      
      try {
        socketRef.current = io('http://localhost:3000/private');
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
          socketRef.current.on('connect', () => {
            console.log('ChatList conectado a Socket.IO');
            // Solo emitimos 'authenticate' una vez cuando el socket se conecta
            socketRef.current.emit('authenticate', user.id);
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
        }
      } catch (socketError) {
        console.error('Error al inicializar socket:', socketError);
      }
    };
    
    if (!socketInitialized.current) {
      initSocket();
    }
    
    return () => {
      // Limpiar conexión al desmontar
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketInitialized.current = false;
      }
    };
  }, []);

  const handleSelection = (item, type) => {
    if (type === 'user') {
      setSelectedUser(item);
      setSelectedGroup(null);
    } else {
      setSelectedGroup(item);
      setSelectedUser(null);
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
              
              return (
                <div 
                  key={`user-${user.id}`}
                  className="p-4 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100"
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
                </div>
              );
            })}
            
            {/* Lista de grupos */}
            {filteredGroups.map((group) => {
              const groupAvatarSrc = getAvatarSrc(group.foto_grupo);
              
              return (
                <div 
                  key={`group-${group.id}`}
                  className="p-4 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-100"
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