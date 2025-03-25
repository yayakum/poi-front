import React, { useEffect, useRef } from 'react';
import { PhoneOff, Video, Phone } from 'lucide-react';

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

const IncomingCallModal = ({ incomingCall, declineCall, acceptCall }) => {
  const callRingtone = useRef(null);
  
  // Inicializar tono de llamada
  useEffect(() => {
    try {
      callRingtone.current = new Audio('/sounds/call-ringtone.mp3');
      callRingtone.current.loop = true;
      callRingtone.current.play().catch(err => console.log('Error al reproducir sonido:', err));
    } catch (error) {
      console.log('No se pudo cargar el sonido de llamada:', error);
    }
    
    return () => {
      // Detener el sonido al desmontar el componente
      if (callRingtone.current) {
        callRingtone.current.pause();
        callRingtone.current.currentTime = 0;
      }
    };
  }, []);
  
  const handleAcceptCall = () => {
    // Detener el sonido
    if (callRingtone.current) {
      callRingtone.current.pause();
      callRingtone.current.currentTime = 0;
    }
    
    // Ejecutar la función para aceptar la llamada
    acceptCall();
  };
  
  const handleDeclineCall = () => {
    // Detener el sonido
    if (callRingtone.current) {
      callRingtone.current.pause();
      callRingtone.current.currentTime = 0;
    }
    
    // Ejecutar la función para rechazar la llamada
    declineCall();
  };
  
  // Renderiza la imagen de perfil correctamente
  const renderAvatar = (avatarPath) => {
    const avatarImage = getAvatarImage(avatarPath);
    
    if (avatarImage) {
      return <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    
    return null;
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md text-center">
        <div className="mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto flex items-center justify-center">
            {incomingCall.callerImage ? (
              renderAvatar(incomingCall.callerImage)
            ) : (
              <span className="text-white text-2xl font-bold">
                {incomingCall.callerName ? incomingCall.callerName.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold mt-3">
            {incomingCall.callerName || 'Usuario'}
          </h2>
          <p className="text-gray-500">
            {incomingCall.isVideo ? 'Videollamada entrante' : 'Llamada entrante'}
          </p>
        </div>
        
        <div className="flex justify-center gap-8">
          <button 
            onClick={handleDeclineCall}
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={30} />
          </button>
          <button 
            onClick={handleAcceptCall}
            className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            {incomingCall.isVideo ? <Video size={30} /> : <Phone size={30} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;