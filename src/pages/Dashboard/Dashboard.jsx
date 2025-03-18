import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar.jsx';
import MainChat from '../../components/layout/MainChat.jsx';
import ProfileModal from '../../components/modals/ProfileModal.jsx';
import TasksModal from '../../components/modals/TasksModal.jsx';
import EditProfileModal from '../../components/modals/EditProfileModal.jsx';
import NewGroupModal from '../../components/modals/NewGroupModal.jsx';
import IncomingCallModal from '../../components/modals/IncomingCallModal.jsx';
import VideoCallModal from '../../components/modals/VideoCallModal.jsx';

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [profileMenuActive, setProfileMenuActive] = useState(false);
  const [optionsMenuActive, setOptionsMenuActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callSettings, setCallSettings] = useState({
    micOn: true,
    videoOn: true
  });

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
      name: "Juan Pérez",
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

  return (
    <div className="bg-gray-200 h-screen flex items-center justify-center">
      <div className="w-11/12 max-w-7xl h-[90vh] bg-white flex shadow-md">
        <Sidebar 
          openModal={openModal} 
          setProfileMenuActive={setProfileMenuActive} 
          profileMenuActive={profileMenuActive} 
          setOptionsMenuActive={setOptionsMenuActive} 
          optionsMenuActive={optionsMenuActive} 
        />
        <MainChat 
          openModal={openModal} 
          simulateIncomingCall={simulateIncomingCall} 
        />
      </div>
      
      {activeModal === 'profile' && <ProfileModal closeModal={closeModal} />}
      {activeModal === 'tasks' && <TasksModal closeModal={closeModal} />}
      {activeModal === 'editProfile' && <EditProfileModal closeModal={closeModal} />}
      {activeModal === 'newGroup' && <NewGroupModal closeModal={closeModal} />}
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