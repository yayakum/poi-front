import React from 'react';
import { PhoneOff } from 'lucide-react';

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

const WaitingCallModal = ({ 
  receiver, 
  cancelCall, 
  isVideo, 
  callId, 
  videoSocket,
  loggedInUser 
}) => {
  // Renderiza la imagen de perfil correctamente
  const renderAvatar = (avatarPath) => {
    const avatarImage = getAvatarImage(avatarPath);
    
    if (avatarImage) {
      return <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    
    return null;
  };

  const handleCancelCall = () => {
    // Notificar al servidor que cancelamos la llamada
    if (videoSocket && callId) {
      videoSocket.emit('endCall', {
        callId: callId,
        userId: loggedInUser.id,
        partnerId: receiver.id
      });
    }
    
    // Ejecutar la función de cancelar
    cancelCall();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md text-center">
        <div className="mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto flex items-center justify-center">
            {receiver.foto_perfil ? (
              renderAvatar(receiver.foto_perfil)
            ) : (
              <span className="text-white text-2xl font-bold">
                {receiver.nombre ? receiver.nombre.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold mt-3">{receiver.nombre}</h2>
          <p className="text-gray-500">
            {isVideo ? 'Videollamada' : 'Llamada'} en curso...
          </p>
          <div className="mt-3 text-gray-500">
            Esperando a que {receiver.nombre} conteste...
          </div>
          <div className="mt-3 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleCancelCall}
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <PhoneOff size={30} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingCallModal;