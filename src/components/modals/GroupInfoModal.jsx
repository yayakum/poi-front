import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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

const GroupInfoModal = ({ closeModal, group }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const socketInitialized = useRef(false);

  // Helper function to get avatar source based on filename
  const getAvatarSrc = (filename) => {
    if (!filename) return null;
    const avatar = avatarOptions.find(opt => opt.name === filename);
    return avatar ? avatar.src : null;
  };

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        setLoading(true);
        // Solo llamamos a la API si tenemos un ID de grupo válido
        if (group && group.id) {
          const response = await axios.get(`https://poi-back.vercel.app/api/grupos/miembro/${group.id}`);
          setMembers(response.data.usuarios || []);
        } else {
          // Si no hay grupo, usamos los usuarios que ya vengan en el prop
          setMembers(group?.grupo_usuarios || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener miembros del grupo:', err);
        setError('Error al cargar los miembros del grupo');
        setLoading(false);
      }
    };

    fetchGroupMembers();

    // Inicializar Socket.IO para actualizaciones en tiempo real
    const initSocket = () => {
      if (socketInitialized.current) return;
      
      try {
        socketRef.current = io('https://poi-back.vercel.app/private');
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
          socketRef.current.on('connect', () => {
            console.log('GroupInfoModal conectado a Socket.IO');
            socketRef.current.emit('authenticate', user.id);
            socketInitialized.current = true;
          });
          
          // Escuchar cambios de estado de usuarios
          socketRef.current.on('userStatusChanged', ({ userId, status }) => {
            console.log(`Usuario ${userId} cambió estado a ${status} en GroupInfoModal`);
            setMembers(prevMembers => {
              return prevMembers.map(member => 
                member.id === parseInt(userId) ? { ...member, estado: status } : member
              );
            });
          });
        }
      } catch (socketError) {
        console.error('Error al inicializar socket en GroupInfoModal:', socketError);
      }
    };
    
    if (!socketInitialized.current) {
      initSocket();
    }
    
    // Limpiar cuando se desmonte el componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketInitialized.current = false;
      }
    };
  }, [group]);

  const groupAvatarSrc = getAvatarSrc(group?.foto_grupo);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Información del Grupo</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        <div className="text-center mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto overflow-hidden">
            {groupAvatarSrc ? (
              <img 
                src={groupAvatarSrc} 
                alt={group?.nombre} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold flex items-center justify-center h-full text-2xl">
                {group?.nombre?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-3 font-medium">{group?.nombre || "Grupo"}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold">Descripción</h3>
          <p className="text-gray-500">{group?.descripcion || "Hey estamos usando TextMe!"}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Participantes ({members.length})</h3>
          
          {loading ? (
            <div className="text-center p-4">Cargando participantes...</div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {members.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No hay participantes en este grupo
                </div>
              ) : (
                members.map((member) => {
                  const memberAvatarSrc = getAvatarSrc(member.foto_perfil);
                  
                  return (
                    <div 
                      key={member.id}
                      className="flex items-center p-3 border-b border-gray-100"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center overflow-hidden">
                          {memberAvatarSrc ? (
                            <img 
                              src={memberAvatarSrc} 
                              alt={member.nombre} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {member.nombre.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Indicador de estado */}
                        <span 
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${member.estado === 'online' ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`}
                        ></span>
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="font-medium">{member.nombre}</div>
                        <div className="text-xs text-gray-500">
                          {member.estado === 'online' ? (
                            <span className="text-green-500">● En línea</span>
                          ) : (
                            <span className="text-gray-400">● Desconectado</span>
                          )}
                        </div>
                      </div>
                      {member.id === group.creador_id && (
                        <span className="text-sm text-emerald-600">Admin</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;