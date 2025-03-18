import React from 'react';
import { X, Edit } from 'lucide-react';

const EditProfileModal = ({ closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Editar Perfil</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        <div className="text-center mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto relative">
            <label className="absolute bottom-0 right-0 bg-yellow-400 text-white rounded-full p-2 cursor-pointer">
              <Edit size={16} />
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-emerald-600">Nombre</label>
          <input 
            type="text" 
            defaultValue="Mi Nombre" 
            className="w-full p-2 border border-gray-200 rounded text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-emerald-600">Info</label>
          <textarea 
            defaultValue="Hey! Estoy usando TextME" 
            className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
          ></textarea>
        </div>
        <button className="w-full bg-emerald-600 text-white py-3 px-5 rounded text-sm hover:bg-emerald-700">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;