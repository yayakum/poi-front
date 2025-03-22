import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import axios from 'axios';

const NewGroupModal = ({ closeModal, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Obtener el usuario actual del localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        setLoggedInUser(currentUser);

        // Obtener todos los usuarios
        const response = await axios.get('http://localhost:3000/api/users/');
        
        // Filtrar para excluir al usuario actual
        const filteredContacts = response.data.usuarios.filter(user => user.id !== currentUser?.id);
        setContacts(filteredContacts);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener contactos:', err);
        setError('Error al cargar contactos');
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Por favor, ingresa un nombre para el grupo');
      return;
    }

    if (selectedContacts.length === 0) {
      alert('Por favor, selecciona al menos un participante');
      return;
    }

    // Verificar que el usuario esté logueado
    if (!loggedInUser || !loggedInUser.id) {
      alert('Debes iniciar sesión para crear un grupo');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Llamada a la API para crear el grupo
      const response = await axios.post('http://localhost:3000/api/grupos', {
        nombre: groupName,
        descripcion: description,
        creador_id: loggedInUser.id,
        participantes: selectedContacts
      });
      
      setIsSubmitting(false);
      
      if (response.data && response.data.ok) {
        // Si se proporciona la función callback, la llamamos con el grupo creado
        if (onGroupCreated && typeof onGroupCreated === 'function') {
          onGroupCreated(response.data.grupo);
        }
        
        alert('Grupo creado exitosamente');
        closeModal();
      } else {
        alert('Error al crear el grupo: ' + (response.data?.mensaje || 'Error desconocido'));
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error al crear grupo:', err);
      alert('Error al crear el grupo: ' + (err.response?.data?.mensaje || err.message || 'Error desconocido'));
    }
  };

  // Filtrar contactos según término de búsqueda
  const filteredContacts = contacts.filter(contact => 
    contact.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay">
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
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-emerald-600">Descripción (opcional)</label>
          <textarea 
            placeholder="Añade una descripción del grupo" 
            className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="text-center p-4">Cargando contactos...</div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  No se encontraron contactos
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="flex items-center p-3 border-b border-gray-100 cursor-pointer"
                    onClick={() => handleContactSelection(contact.id)}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-700 mr-4 flex items-center justify-center overflow-hidden">
                      {contact.foto_perfil ? (
                        <img 
                          src={contact.foto_perfil} 
                          alt={contact.nombre} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {contact.nombre.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{contact.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {contact.estado === 'online' ? (
                          <span className="text-green-500">● En línea</span>
                        ) : (
                          <span className="text-gray-400">● Desconectado</span>
                        )}
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-emerald-600"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => {
                        // Esto evita la propagación del evento al div padre
                        e.stopPropagation();
                        handleContactSelection(contact.id);
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="text-emerald-600 text-sm my-4">
          Participantes seleccionados: {selectedContacts.length}
        </div>
        
        <button 
          className={`w-full bg-emerald-600 text-white py-3 px-5 rounded text-sm hover:bg-emerald-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleCreateGroup}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Grupo'}
        </button>
      </div>
    </div>
  );
};

export default NewGroupModal;