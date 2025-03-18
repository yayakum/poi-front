import React, { useState } from 'react';
import { MoreVertical, Search } from 'lucide-react';
import ChatList from '../chat/ChatList.jsx';

const Sidebar = ({ openModal, setProfileMenuActive, profileMenuActive, setOptionsMenuActive, optionsMenuActive }) => {
  return (
    <div className="w-1/3 border-r border-gray-200">
      <div className="bg-gray-100 p-4 flex items-center relative">
        <div className="w-10 h-10 rounded-full bg-emerald-700 mr-3 cursor-pointer"
              onClick={() => setProfileMenuActive(!profileMenuActive)}></div>
        <span>Mi Perfil</span>
        
        {profileMenuActive && (
          <div className="absolute top-14 left-3 bg-white shadow-md rounded z-50">
            <ul>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100" 
                  onClick={() => openModal('profile')}>Perfil</li>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100"
                  onClick={() => openModal('tasks')}>Tareas</li>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100">Cerrar sesión</li>
            </ul>
          </div>
        )}
        
        <button 
          className="ml-auto p-2 rounded-full hover:bg-gray-200" 
          onClick={(e) => {
            e.stopPropagation();
            setOptionsMenuActive(!optionsMenuActive);
          }}
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>
        
        {optionsMenuActive && (
          <div className="absolute top-14 right-3 bg-white shadow-md rounded z-50">
            <ul>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100"
                  onClick={() => openModal('editProfile')}>Editar perfil</li>
              <li className="py-3 px-5 cursor-pointer hover:bg-gray-100"
                  onClick={() => openModal('newGroup')}>Crear nuevo grupo</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="bg-gray-100 py-2 px-4 rounded-lg flex items-center">
          <Search size={16} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar o empezar nuevo chat" 
            className="w-full border-none bg-transparent outline-none ml-3 text-sm"
          />
        </div>
      </div>
      
      <ChatList />
    </div>
  );
};

export default Sidebar;