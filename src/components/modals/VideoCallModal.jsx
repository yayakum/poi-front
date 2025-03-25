import React, { useEffect, useRef, useState } from 'react';
import { MicOff, Mic, VideoOff, Video, PhoneOff } from 'lucide-react';
import ZegoCloudService from '../../services/ZegoCloudService';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Importar los mapas de avatares
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

const VideoCallModal = ({ 
  callSettings, 
  toggleMic, 
  toggleVideo, 
  endCall,
  callData
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const zegoCloudSDK = useRef(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  
  useEffect(() => {
    if (!callData || !callData.roomId || !callData.token) {
      return;
    }
    
    const startVideoCall = async () => {
      try {
        console.log('Iniciando videollamada con datos:', callData);
        
        // Inicializar el SDK de ZegoCloud
        const kitToken = callData.token || await ZegoCloudService.generateToken(
          callData.roomId,
          callData.currentUserId,
          callData.partnerName || 'Usuario'
        );
        
        // Usar directamente ZegoUIKitPrebuilt para crear la instancia
        const zp = ZegoCloudService.zp || await ZegoUIKitPrebuilt.create(kitToken);
        zegoCloudSDK.current = zp;
        
        // Usar la interfaz simplificada de ZegoUIKitPrebuilt
        await zegoCloudSDK.current.joinRoom({
          container: document.getElementById('zegocloud-container') || document.body,
          sharedLinks: [{
            name: 'Copy link',
            url: window.location.href
          }],
          scenario: {
            mode: 'OneONoneCall', // 1v1 call
            config: {
              // Ocultar controles de UI pero mantener la funcionalidad
              turnOnCameraWhenJoining: true,
              turnOnMicrophoneWhenJoining: true,
              useFrontFacingCamera: true,
              showMyCameraToggleButton: false,
              showMyMicrophoneToggleButton: false,
              showAudioVideoSettingsButton: false,
              showScreenSharingButton: false,
              showTextChat: false,
              showUserList: false,
              showLeaveButton: false,
              showLayoutButton: false,
              layout: 'Auto', // 'Auto' | 'Grid' | 'Sidebar'
              showNonVideoUser: true,
              showOnlyAudioUser: true
            }
          },
          onJoinRoom: () => {
            console.log('Unido a la sala de videoconferencia');
            
            // Acceder a los elementos de video
            setTimeout(() => {
              // Vincular elemento de video local
              const localVideoElement = document.querySelector('.zego-prebuilt-local-video video');
              if (localVideoElement && localVideoRef.current) {
                // Clonar el stream y asignarlo
                if (localVideoElement.srcObject) {
                  localVideoRef.current.srcObject = localVideoElement.srcObject;
                }
              }
              
              // Vincular elemento de video remoto
              const remoteVideoElement = document.querySelector('.zego-prebuilt-remote-video video');
              if (remoteVideoElement && remoteVideoRef.current) {
                // Clonar el stream y asignarlo
                if (remoteVideoElement.srcObject) {
                  remoteVideoRef.current.srcObject = remoteVideoElement.srcObject;
                  setHasRemoteStream(true);
                  setConnectionState('connected');
                }
              }
              
              // Ocultar los elementos originales de ZegoCloud
              const zegoContainer = document.querySelector('.zego-uikit-prebuilt');
              if (zegoContainer) {
                zegoContainer.style.display = 'none';
              }
            }, 1000);
          },
          onLeaveRoom: () => {
            console.log('Saliendo de la sala de videoconferencia');
          },
          onUserJoin: (users) => {
            console.log('Usuario remoto conectado:', users);
            setHasRemoteStream(true);
            setConnectionState('connected');
          },
          onUserLeave: () => {
            console.log('Usuario remoto desconectado');
            setHasRemoteStream(false);
          }
        });
        
        // Actualizar estado de interfaz
        setConnectionState('waiting');
      } catch (error) {
        console.error("Error iniciando videollamada:", error);
        setConnectionState('error');
      }
    };
    
    startVideoCall();
    
    return () => {
      // Limpiar recursos al desmontar
      if (zegoCloudSDK.current) {
        zegoCloudSDK.current.leaveRoom();
        zegoCloudSDK.current = null;
      }
      
      // Eliminar contenedor oculto de ZegoCloud
      const zegoContainer = document.querySelector('.zego-uikit-prebuilt');
      if (zegoContainer) {
        zegoContainer.remove();
      }
    };
  }, [callData, endCall]);
  
  // Manejar cambios en configuración de micrófono
  useEffect(() => {
    if (zegoCloudSDK.current) {
      if (callSettings.micOn) {
        zegoCloudSDK.current.turnOnMicrophone();
      } else {
        zegoCloudSDK.current.turnOffMicrophone();
      }
    }
  }, [callSettings.micOn]);
  
  // Manejar cambios en configuración de cámara
  useEffect(() => {
    if (zegoCloudSDK.current) {
      if (callSettings.videoOn) {
        zegoCloudSDK.current.turnOnCamera();
      } else {
        zegoCloudSDK.current.turnOffCamera();
      }
    }
  }, [callSettings.videoOn]);
  
  // Renderiza la imagen de perfil correctamente
  const renderAvatar = (avatarPath) => {
    const avatarImage = getAvatarImage(avatarPath);
    
    if (avatarImage) {
      return <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    
    return null;
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex-1 flex items-center justify-center relative">
        {/* Video remoto principal */}
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          {connectionState === 'connected' && hasRemoteStream ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-emerald-700 flex items-center justify-center">
                {callData && callData.partnerImage ? (
                  renderAvatar(callData.partnerImage)
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {callData ? callData.partnerName.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <p className="text-white mt-3">{callData ? callData.partnerName : 'Usuario'}</p>
              
              {connectionState === 'connecting' && (
                <div className="mt-3 text-gray-400">
                  Conectando...
                  <div className="mt-2 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {connectionState === 'waiting' && (
                <div className="mt-3 text-gray-400">
                  Esperando a que {callData?.partnerName} se conecte...
                  <div className="mt-2 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {connectionState === 'error' && (
                <div className="mt-3 text-red-400">
                  Error al conectar la videollamada
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Video local (pequeño, en la esquina) */}
        <div className="absolute bottom-5 right-5 w-48 h-32 bg-gray-800 rounded-lg border-2 border-white overflow-hidden shadow-lg">
          {callSettings.videoOn ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <VideoOff size={24} className="mx-auto mb-1" />
                <p className="text-xs">Cámara apagada</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Controles */}
      <div className="bg-gray-900 p-4 flex items-center justify-center gap-5">
        <button 
          className={`p-4 ${callSettings.micOn ? 'bg-gray-700' : 'bg-red-500'} text-white rounded-full hover:opacity-90 transition-opacity`}
          onClick={toggleMic}
        >
          {callSettings.micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button 
          className={`p-4 ${callSettings.videoOn ? 'bg-gray-700' : 'bg-red-500'} text-white rounded-full hover:opacity-90 transition-opacity`}
          onClick={toggleVideo}
        >
          {callSettings.videoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button 
          className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          onClick={endCall}
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;