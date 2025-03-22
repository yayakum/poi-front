import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const GroupInfoModal = ({ closeModal, group }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        setLoading(true);
        // Solo llamamos a la API si tenemos un ID de grupo válido
        if (group && group.id) {
          const response = await axios.get(`http://localhost:3000/api/grupos/miembro/${group.id}`);
          setMembers(response.data.usuarios || []);
        } else {
          // Si no hay grupo, usamos los usuarios que ya vengan en el prop
          setMembers(group?.grupo_usuarios || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener miembros del grupo:', err);
        setError('Error al cargar los miembros del grupo');
        setLoading(false);
      }
    };

    fetchGroupMembers();
  }, [group]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Información del Grupo</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        <div className="text-center mb-5">
          <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto overflow-hidden">
            {group?.foto_grupo ? (
              <img 
                src={group.foto_grupo} 
                alt={group.nombre} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold flex items-center justify-center h-full text-2xl">
                {group?.nombre?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-3 font-medium">{group?.nombre || "Grupo"}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold">Descripción</h3>
          <p className="text-gray-500">{group?.descripcion || "Hey estamos usando TextMe!"}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Participantes ({members.length})</h3>
          
          {loading ? (
            <div className="text-center p-4">Cargando participantes...</div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {members.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No hay participantes en este grupo
                </div>
              ) : (
                members.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center p-3 border-b border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-700 mr-3 flex items-center justify-center overflow-hidden">
                      {member.foto_perfil ? (
                        <img 
                          src={member.foto_perfil} 
                          alt={member.nombre} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {member.nombre.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{member.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {member.estado === 'online' ? (
                          <span className="text-green-500">● En línea</span>
                        ) : (
                          <span className="text-gray-400">● Desconectado</span>
                        )}
                      </div>
                    </div>
                    {member.id === group.creador_id && (
                      <span className="text-sm text-emerald-600">Admin</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;