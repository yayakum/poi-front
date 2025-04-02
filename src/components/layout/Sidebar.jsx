import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import ChatList from '../chat/ChatList.jsx';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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

// Define avatar mapping
const avatarMap = {
  'assets/BMO.jpg': BMO,
  'assets/BonnibelBubblegum.jpg': BonnibelBubblegum,
  'assets/Finn.jpg': Finn,
  'assets/FlamePrincess.jpg': FlamePrincess,
  'assets/Gunter.jpg': Gunter,
  'assets/IceKing.jpg': IceKing,
  'assets/Jake.jpg': Jake,
  'assets/LadyRainicorn.jpg': LadyRainicorn,
  'assets/Lemongrab.jpg': Lemongrab,
  'assets/LumpySpacePrincess.jpg': LumpySpacePrincess,
  'assets/Marcelline.jpg': Marcelline
};

const Sidebar = ({ 
  openModal, 
  setProfileMenuActive, 
  profileMenuActive, 
  setOptionsMenuActive, 
  optionsMenuActive, 
  setSelectedUser,
  setSelectedGroup 
}) => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const socketInitialized = useRef(false);

  // Función para inicializar el socket y configurar listeners
  const initializeSocket = (userId) => {
    if (socketInitialized.current) return;
    
    try {
      // Crear nueva conexión socket
      socketRef.current = io(`${API_URL}/private`);
      
      // Conectar y autenticar
      socketRef.current.on('connect', () => {
        console.log('Sidebar conectado a Socket.IO con ID:', socketRef.current.id);
        socketRef.current.emit('authenticate', userId);
        socketInitialized.current = true;
      });
      
      // Escuchar actualizaciones de perfil de usuario
      socketRef.current.on('userProfileUpdated', (userData) => {
        console.log('Actualización de perfil recibida en Sidebar:', userData);
        
        // Si la actualización es para el usuario logueado, actualizar el estado
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser && loggedInUser.id === userData.id) {
          // Actualizar el estado para mostrar los cambios inmediatamente
          setUser(prevUser => {
            if (prevUser && prevUser.id === userData.id) {
              return {
                ...prevUser,
                nombre: userData.nombre,
                foto_perfil: userData.foto_perfil,
                descripcion: userData.descripcion
              };
            }
            return prevUser;
          });
        }
      });
      
      console.log('Socket inicializado en Sidebar para usuario:', userId);
    } catch (error) {
      console.error('Error al inicializar socket en Sidebar:', error);
      socketInitialized.current = false;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user ID from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || !storedUser.id) {
          navigate('/');
          return;
        }
        
        // Fetch fresh user data from API
        const response = await axios.get(`${API_URL}/api/users/${storedUser.id}`, {
          withCredentials: true
        });
        
        if (response.data.ok && response.data.usuario) {
          // Use fresh data from API instead of localStorage
          setUser(response.data.usuario);
          
          // Inicializar el socket para recibir actualizaciones en tiempo real
          initializeSocket(storedUser.id);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
      }
    };
    
    fetchUserData();
    
    // Limpiar el socket al desmontar el componente
    return () => {
      if (socketRef.current) {
        console.log('Desconectando socket de Sidebar');
        socketRef.current.disconnect();
        socketInitialized.current = false;
      }
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Get user ID from state
      if (user && user.id) {
        // Call API to update offline status
        await axios.post(`${API_URL}/api/logout`, {
          id: user.id
        });
        
        // Desconectar el socket antes de cerrar sesión
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketInitialized.current = false;
        }
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('selectedChat');
        
        // Redirect to login page
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error al cerrar sesión');
    }
  };

  // Get the correct avatar image based on the path
  const getAvatarImage = (path) => {
    return path && avatarMap[path] ? avatarMap[path] : null;
  };

  return (
    <div className="w-1/3 border-r border-gray-200">
      <div className="bg-gray-100 p-4 flex items-center relative">
        <div 
          className="w-10 h-10 rounded-full bg-emerald-700 mr-3 cursor-pointer overflow-hidden" 
          onClick={(e) => {
            e.stopPropagation();
            setProfileMenuActive(!profileMenuActive);
            setOptionsMenuActive(false);
          }}
        >
          {user?.foto_perfil ? (
            <img 
              src={getAvatarImage(user.foto_perfil)} 
              alt={user.nombre} 
              className="w-full h-full object-cover rounded-full" 
            />
          ) : (
            <span className="text-white font-bold flex items-center justify-center h-full">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span>{user?.nombre}</span>
        
        {profileMenuActive && (
          <div className="absolute top-14 left-3 bg-white shadow-md rounded z-50">
            <ul>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100" onClick={() => openModal('rewards')}>Recompensas</li>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100" onClick={handleLogout}>Cerrar sesión</li>
            </ul>
          </div>
        )}
        
        <button 
          className="ml-auto p-2 rounded-full hover:bg-gray-200" 
          onClick={(e) => {
            e.stopPropagation();
            setOptionsMenuActive(!optionsMenuActive);
            setProfileMenuActive(false);
          }}
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>
        
        {optionsMenuActive && (
          <div className="absolute top-14 right-3 bg-white shadow-md rounded z-50">
            <ul>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100" onClick={() => openModal('editProfile')}>Editar perfil</li>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100" onClick={() => openModal('newGroup')}>Crear nuevo grupo</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="bg-gray-100 py-2 px-4 rounded-lg flex items-center">
          <Search size={16} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar o empezar nuevo chat" 
            className="w-full border-none bg-transparent outline-none ml-3 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ChatList 
        setSelectedUser={setSelectedUser} 
        setSelectedGroup={setSelectedGroup} 
      />
    </div>
  );
};

export default Sidebar;