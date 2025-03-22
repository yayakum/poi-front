import React from 'react';
import { X } from 'lucide-react';

// Importar las mismas imágenes que en EditProfileModal
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

// Definir el mismo objeto de avatares
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

const ProfileModal = ({ closeModal, user }) => {
  // Encontrar la imagen correspondiente al nombre de avatar
  const getAvatarSrc = () => {
    if (user?.foto_perfil) {
      const avatar = avatarOptions.find(opt => opt.name === user.foto_perfil);
      return avatar ? avatar.src : null;
    }
    return null;
  };

  // Obtener la imagen de avatar
  const avatarSrc = getAvatarSrc();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) {
          closeModal();
        }
      }}
    >
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Perfil</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        <div className="text-center mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto overflow-hidden">
            {avatarSrc ? (
              <img 
                src={avatarSrc} 
                alt={user?.nombre || "Usuario"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold flex items-center justify-center h-full text-2xl">
                {user?.nombre?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <p className="mt-3 font-medium">{user?.nombre || "Usuario"}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold">Info</h3>
          <p className="text-gray-500">{user?.descripcion || "Hey! Estoy usando TextME"}</p>
        </div>
        <div>
          <h3 className="font-bold">Teléfono</h3>
          <p className="text-gray-500">{"+" + user?.telefono || "+1234567890"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;