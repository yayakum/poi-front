import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import MainChat from '../../components/layout/MainChat.jsx';
import GroupChat from '../../components/layout/GroupMainChat.jsx';
import ProfileModal from '../../components/modals/ProfileModal.jsx';
import RewardsModal from '../../components/modals/RewardsModal.jsx';
import EditProfileModal from '../../components/modals/EditProfileModal.jsx';
import NewGroupModal from '../../components/modals/NewGroupModal.jsx';
import IncomingCallModal from '../../components/modals/IncomingCallModal.jsx';
import VideoCallModal from '../../components/modals/VideoCallModal.jsx';
import GroupInfoModal from '../../components/modals/GroupInfoModal.jsx';
import CreateTaskModal from '../../components/modals/CreateTaskModal.jsx'
import ManageTaskModal from '../../components/modals/ManageTaskModal.jsx'

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [profileMenuActive, setProfileMenuActive] = useState(false);
  const [optionsMenuActive, setOptionsMenuActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callSettings, setCallSettings] = useState({
    micOn: true,
    videoOn: true
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

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

  const simulateIncomingCall = () => {
    setIncomingCall({
      name: selectedUser ? selectedUser.nombre : "Usuario",
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
    <div className="bg-gray-200 h-screen flex items-center justify-center">
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
            simulateIncomingCall={simulateIncomingCall}
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
      {incomingCall && (
        <IncomingCallModal 
          incomingCall={incomingCall} 
          declineCall={declineCall} 
          acceptCall={acceptCall} 
        />
      )}
      {activeModal === 'videoCall' && (
        <VideoCallModal 
          callSettings={callSettings} 
          toggleMic={toggleMic} 
          toggleVideo={toggleVideo} 
          endCall={endCall} 
        />
      )}
    </div>
  );
};

export default Dashboard;