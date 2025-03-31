import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import MainChat from '../../components/layout/MainChat.jsx';
import GroupChat from '../../components/layout/GroupMainChat.jsx';
import ProfileModal from '../../components/modals/ProfileModal.jsx';
import RewardsModal from '../../components/modals/RewardsModal.jsx';
import EditProfileModal from '../../components/modals/EditProfileModal.jsx';
import NewGroupModal from '../../components/modals/NewGroupModal.jsx';
import IncomingCallModal from '../../components/modals/IncomingCallModal.jsx';
import VideoCallModal from '../../components/modals/VideoCallModal.jsx';
import WaitingCallModal from '../../components/modals/WaitingCallModal.jsx';
import GroupInfoModal from '../../components/modals/GroupInfoModal.jsx';
import CreateTaskModal from '../../components/modals/CreateTaskModal.jsx';
import ManageTaskModal from '../../components/modals/ManageTaskModal.jsx';
import io from 'socket.io-client';
import ZegoCloudService from '../../services/ZegoCloudService';
import axios from 'axios';

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [profileMenuActive, setProfileMenuActive] = useState(false);
  const [optionsMenuActive, setOptionsMenuActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callSettings, setCallSettings] = useState({
    micOn: true,
    videoOn: true
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Referencias para mantener sockets y usuario actual
  const videoSocketRef = useRef(null);
  const loggedInUserRef = useRef(null);

  // Cerrar menús cuando se hace clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileMenuActive || optionsMenuActive) {
        setProfileMenuActive(false);
        setOptionsMenuActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [profileMenuActive, optionsMenuActive]);

  // Inicializar socket de video y autenticar usuario
  useEffect(() => {
    try {
      // Obtener usuario del localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        window.location.href = '/';
        return;
      }
      
      loggedInUserRef.current = user;
      
      // Inicializar socket para videollamadas
      videoSocketRef.current = io('http://localhost:3000/video');
      
      // Autenticar al usuario en el socket
      videoSocketRef.current.on('connect', () => {
        console.log('Conectado al servidor de video', videoSocketRef.current.id);
        videoSocketRef.current.emit('authenticate', user.id);
      });
      
      // Escuchar eventos de llamadas entrantes
      videoSocketRef.current.on('incomingCall', async (data) => {
        console.log('Llamada entrante recibida:', data);
        
        // Si ya hay una llamada activa, rechazar automáticamente
        if (incomingCall || outgoingCall || activeCall) {
          videoSocketRef.current.emit('rejectCall', {
            callId: data.callId,
            receiverId: user.id,
            callerId: data.callerId,
            reason: 'Usuario ocupado en otra llamada'
          });
          return;
        }
        
        try {
          // Buscar información del llamante si no viene completa
          let callerInfo = {
            id: data.callerId,
            nombre: data.callerName || 'Usuario',
            foto_perfil: null
          };
          
          // Si no tenemos el nombre del llamante, intentar obtenerlo
          if (!data.callerName) {
            try {
              const response = await axios.get(`http://localhost:3000/api/usuarios/${data.callerId}`);
              if (response.data && response.data.ok) {
                callerInfo = response.data.data;
              }
            } catch (error) {
              console.error('Error al obtener información del llamante:', error);
            }
          }
          
          // Establecer estado de llamada entrante
          setIncomingCall({
            callId: data.callId,
            callerId: data.callerId,
            callerName: callerInfo.nombre,
            callerImage: callerInfo.foto_perfil,
            roomId: data.roomId,
            isVideo: data.isVideo
          });
        } catch (error) {
          console.error('Error al procesar llamada entrante:', error);
        }
      });
      
      // Escuchar eventos de llamada aceptada
      videoSocketRef.current.on('callAccepted', async (data) => {
        console.log('Llamada aceptada:', data);
        
        // Si tenemos una llamada saliente, convertirla en llamada activa
        if (outgoingCall && outgoingCall.callId === data.callId) {
          try {
            // Establecer estado de llamada activa
            setActiveCall({
              callId: outgoingCall.callId,
              roomId: outgoingCall.roomId,
              token: outgoingCall.token,
              currentUserId: user.id,
              callerId: user.id,
              receiverId: outgoingCall.receiverId,
              partnerName: outgoingCall.receiverName,
              partnerImage: outgoingCall.receiverImage,
              isInitiator: true
            });
            
            // Limpiar estado de llamada saliente
            setOutgoingCall(null);
            
            // Abrir modal de videollamada
            setActiveModal('videoCall');
          } catch (error) {
            console.error('Error al procesar llamada aceptada:', error);
          }
        }
      });
      
      // Escuchar eventos de llamada rechazada
      videoSocketRef.current.on('callRejected', (data) => {
        console.log('Llamada rechazada:', data);
        
        // Si tenemos una llamada saliente, limpiarla
        if (outgoingCall && outgoingCall.callId === data.callId) {
          setOutgoingCall(null);
        }
      });
      
      // Escuchar eventos de llamada cancelada
      videoSocketRef.current.on('callCancelled', (data) => {
        console.log('Llamada cancelada:', data);
        
        // Si tenemos una llamada entrante, limpiarla
        if (incomingCall && incomingCall.callId === data.callId) {
          setIncomingCall(null);
        }
      });
      
      // Escuchar eventos de fin de llamada
      videoSocketRef.current.on('callEnded', (data) => {
        console.log('Llamada finalizada:', data);
        
        // Limpiar todos los estados de llamada
        if (activeCall && activeCall.callId === data.callId) {
          setActiveCall(null);
          closeModal();
        }
      });
      
      return () => {
        // Desconectar socket al desmontar componente
        if (videoSocketRef.current) {
          videoSocketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Error al inicializar socket de video:', error);
    }
  }, [incomingCall, outgoingCall, activeCall]);

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

  // Función para iniciar una videollamada
  const initiateCall = async (receiver, isVideoCall = true) => {
    if (!receiver || !receiver.id) {
      console.error('Receptor inválido');
      return;
    }
    
    try {
      const user = loggedInUserRef.current;
      if (!user) {
        console.error('Usuario no autenticado');
        return;
      }
      
      // Verificar que no haya una llamada activa
      if (incomingCall || outgoingCall || activeCall) {
        console.warn('Ya hay una llamada en curso');
        return;
      }
      
      // Generar un ID único para la sala
      const roomId = `room_${user.id}_${receiver.id}_${Date.now()}`;
      
      // Registrar la llamada en la base de datos
      const callResponse = await axios.post('http://localhost:3000/api/calls/create', {
        iniciador_id: user.id,
        receptor_id: receiver.id
      });
      
      if (!callResponse.data.ok) {
        throw new Error('Error al registrar la llamada en la base de datos');
      }
      
      const callId = callResponse.data.data.id;
      
      // Preparar datos para unirse a la llamada
      const token = await ZegoCloudService.generateToken(roomId, user.id, user.nombre);
      
      // Configurar estado de llamada saliente
      setOutgoingCall({
        callId: callId,
        callerId: user.id,
        callerName: user.nombre,
        receiverId: receiver.id,
        receiverName: receiver.nombre,
        receiverImage: receiver.foto_perfil,
        roomId: roomId,
        token: token,
        isVideo: isVideoCall
      });
      
      // Abrir modal de espera
      setActiveModal('waitingCall');
      
      // Enviar evento al servidor para iniciar la llamada
      videoSocketRef.current.emit('initiateCall', {
        callerId: user.id,
        callerName: user.nombre,
        receiverId: receiver.id,
        roomId: roomId,
        isVideo: isVideoCall,
        callId: callId
      });
      
    } catch (error) {
      console.error('Error al iniciar videollamada:', error);
      setOutgoingCall(null);
    }
  };

  // Aceptar una llamada entrante
  const acceptCall = async () => {
    if (!incomingCall) return;
    
    try {
      const user = loggedInUserRef.current;
      if (!user) return;
      
      // Generar token para la llamada
      const token = await ZegoCloudService.generateToken(
        incomingCall.roomId,
        user.id,
        user.nombre
      );
      
      // Notificar al servidor que aceptamos la llamada
      videoSocketRef.current.emit('acceptCall', {
        callId: incomingCall.callId,
        receiverId: user.id,
        callerId: incomingCall.callerId,
        roomId: incomingCall.roomId
      });
      
      // Establecer estado de llamada activa
      setActiveCall({
        callId: incomingCall.callId,
        roomId: incomingCall.roomId,
        token: token,
        currentUserId: user.id,
        callerId: incomingCall.callerId,
        receiverId: user.id,
        partnerName: incomingCall.callerName,
        partnerImage: incomingCall.callerImage,
        isInitiator: false
      });
      
      // Limpiar estado de llamada entrante
      setIncomingCall(null);
      
      // Abrir modal de videollamada
      setActiveModal('videoCall');
    } catch (error) {
      console.error('Error al aceptar llamada:', error);
      declineCall();
    }
  };

  // Rechazar una llamada entrante
  const declineCall = () => {
    if (!incomingCall) return;
    
    try {
      const user = loggedInUserRef.current;
      if (!user) return;
      
      // Notificar al servidor que rechazamos la llamada
      videoSocketRef.current.emit('rejectCall', {
        callId: incomingCall.callId,
        receiverId: user.id,
        callerId: incomingCall.callerId,
        reason: 'Llamada rechazada por el usuario'
      });
      
      // Limpiar estado de llamada entrante
      setIncomingCall(null);
    } catch (error) {
      console.error('Error al rechazar llamada:', error);
      setIncomingCall(null);
    }
  };

  // Cancelar una llamada saliente
  const cancelCall = () => {
    if (!outgoingCall) return;
    
    try {
      const user = loggedInUserRef.current;
      if (!user) return;
      
      // Notificar al servidor que cancelamos la llamada
      videoSocketRef.current.emit('cancelCall', {
        callId: outgoingCall.callId,
        callerId: user.id,
        receiverId: outgoingCall.receiverId
      });
      
      // Limpiar estado de llamada saliente
      setOutgoingCall(null);
      
      // Cerrar modal de espera
      closeModal();
    } catch (error) {
      console.error('Error al cancelar llamada:', error);
      setOutgoingCall(null);
      closeModal();
    }
  };

  // Finalizar una llamada activa
  const endCall = () => {
    if (!activeCall) return;
    
    try {
      const user = loggedInUserRef.current;
      if (!user) return;
      
      // Notificar al servidor que finalizamos la llamada
      videoSocketRef.current.emit('endCall', {
        callId: activeCall.callId,
        userId: user.id,
        partnerId: activeCall.isInitiator ? activeCall.receiverId : activeCall.callerId
      });
      
      // Limpiar estado de llamada activa
      setActiveCall(null);
      
      // Cerrar modal de videollamada
      closeModal();
    } catch (error) {
      console.error('Error al finalizar llamada:', error);
      setActiveCall(null);
      closeModal();
    }
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

  const closeChat = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  // Verificar si hay un usuario autenticado en localStorage
  useEffect(() => {
    const checkAuthUser = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          // Redirigir a la página de login si no hay usuario autenticado
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/';
      }
    };
    
    checkAuthUser();
  }, []);

  return (
    <div className="bg-linear-to-b from-gray-300 via-gray-400 to-gray-600 h-screen flex items-center justify-center">
      <div className="w-11/12 max-w-7xl h-[90vh] bg-white flex shadow-md">
        <Sidebar 
          openModal={openModal} 
          setProfileMenuActive={setProfileMenuActive} 
          profileMenuActive={profileMenuActive} 
          setOptionsMenuActive={setOptionsMenuActive} 
          optionsMenuActive={optionsMenuActive}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
        />
        
        {selectedUser ? (
          <MainChat 
            openModal={openModal} 
            initiateCall={initiateCall}
            selectedUser={selectedUser}
            closeChat={closeChat}
          />
        ) : selectedGroup ? (
          <GroupChat 
            openModal={openModal}
            selectedGroup={selectedGroup}
            closeChat={closeChat}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <p className="text-xl mb-2">¡Bienvenido a tu chat!</p>
              <p>Selecciona un usuario o grupo para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
      
      {activeModal === 'profile' && <ProfileModal closeModal={closeModal} user={selectedUser} />}
      {activeModal === 'rewards' && <RewardsModal closeModal={closeModal} />}
      {activeModal === 'editProfile' && <EditProfileModal closeModal={closeModal} />}
      {activeModal === 'newGroup' && <NewGroupModal closeModal={closeModal} />}
      {activeModal === 'groupInfo' && <GroupInfoModal closeModal={closeModal} group={selectedGroup} />}
      {activeModal === 'createTask' && <CreateTaskModal closeModal={closeModal} group={selectedGroup} />}
      {activeModal === 'manageTasks' && <ManageTaskModal closeModal={closeModal} group={selectedGroup} />}
      
      {/* Modal de llamada entrante */}
      {incomingCall && (
        <IncomingCallModal 
          incomingCall={incomingCall} 
          declineCall={declineCall} 
          acceptCall={acceptCall} 
        />
      )}
      
      {/* Modal de videollamada activa */}
      {activeModal === 'videoCall' && activeCall && (
        <VideoCallModal 
          callSettings={callSettings} 
          toggleMic={toggleMic} 
          toggleVideo={toggleVideo} 
          endCall={endCall}
          callData={activeCall}
        />
      )}
      
      {/* Modal de espera mientras se establece la llamada */}
      {activeModal === 'waitingCall' && outgoingCall && (
        <WaitingCallModal 
          receiver={{
            id: outgoingCall.receiverId,
            nombre: outgoingCall.receiverName,
            foto_perfil: outgoingCall.receiverImage
          }}
          cancelCall={cancelCall}
          isVideo={outgoingCall.isVideo}
          callId={outgoingCall.callId}
          videoSocket={videoSocketRef.current}
          loggedInUser={loggedInUserRef.current}
        />
      )}
    </div>
  );
};

export default Dashboard;