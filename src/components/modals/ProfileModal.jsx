import React from 'react';
import { X } from 'lucide-react';

const ProfileModal = ({ closeModal }) => {
  return (
    <div className="fixed inset-0 bg-green-700 flex items-center justify-center z-50 modal-overlay">
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
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto"></div>
          <p className="mt-3">Mi Nombre</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold">Info</h3>
          <p className="text-gray-500">Hey! Estoy usando TextME</p>
        </div>
        <div>
          <h3 className="font-bold">Teléfono</h3>
          <p className="text-gray-500">+1234567890</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;