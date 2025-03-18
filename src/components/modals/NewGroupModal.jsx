import React from 'react';
import { X, Search } from 'lucide-react';

const NewGroupModal = ({ closeModal }) => {
  const contacts = [
    { name: "Juan Pérez", status: "Hey! Estoy usando TextME" },
    { name: "María García", status: "Disponible" },
    { name: "Luis Torres", status: "En una reunión" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Crear Nuevo Grupo</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-emerald-600">Nombre del Grupo</label>
          <input 
            type="text" 
            placeholder="Ej: Familia" 
            className="w-full p-2 border border-gray-200 rounded text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-emerald-600">Descripción (opcional)</label>
          <textarea 
            placeholder="Añade una descripción del grupo" 
            className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 text-emerald-600">Agregar participantes</label>
          <div className="bg-gray-100 py-2 px-4 rounded-lg flex items-center mb-4">
            <Search size={16} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar contactos" 
              className="w-full border-none bg-transparent outline-none ml-3 text-sm"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {contacts.map((contact, index) => (
              <div 
                key={index}
                className="flex items-center p-3 border-b border-gray-100 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-700 mr-4"></div>
                <div className="flex-1">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs text-gray-500">{contact.status}</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-emerald-600"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-emerald-600 text-sm my-4">
          Participantes seleccionados: 0
        </div>
        
        <button className="w-full bg-emerald-600 text-white py-3 px-5 rounded text-sm hover:bg-emerald-700">
          Crear Grupo
        </button>
      </div>
    </div>
  );
};

export default NewGroupModal;