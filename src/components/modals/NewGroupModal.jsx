import React, { useState, useEffect, useRef } from 'react';
import { X, Search, CheckCircle, Users } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

// Importamos las imágenes de avatares
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

// Definimos el objeto de avatares
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

// Crear un evento personalizado para la creación de grupos
// const newGroupEvent = new CustomEvent('newGroupCreated');

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
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [createdGroup, setCreatedGroup] = useState(null);
  const socketRef = useRef(null);
  const socketInitialized = useRef(false);

  // Función para obtener la imagen del avatar
  const getAvatarSrc = (avatarName) => {
    if (avatarName) {
      const avatar = avatarOptions.find(opt => opt.name === avatarName);
      return avatar ? avatar.src : null;
    }
    return null;
  };

  // Efecto para cerrar el modal automáticamente después de mostrar el mensaje de éxito
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        // Antes de cerrar el modal, disparar evento para actualizar la lista de grupos
        if (createdGroup) {
          // Usar evento personalizado para notificar sobre el nuevo grupo
          window.dispatchEvent(new CustomEvent('newGroupCreated', { 
            detail: { group: createdGroup }
          }));
        }
        closeModal();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success, closeModal, createdGroup]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Obtener el usuario actual del localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        setLoggedInUser(currentUser);

        // Obtener todos los usuarios
        const response = await axios.get('https://poi-back.vercel.app/api/users/');
        
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

    // Inicializar Socket.IO para actualizaciones en tiempo real
    const initSocket = () => {
      if (socketInitialized.current) return;
      
      try {
        socketRef.current = io('https://poi-back.vercel.app/private');
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
          socketRef.current.on('connect', () => {
            console.log('NewGroupModal conectado a Socket.IO');
            socketRef.current.emit('authenticate', user.id);
            socketInitialized.current = true;
          });
          
          // Escuchar cambios de estado de usuarios
          socketRef.current.on('userStatusChanged', ({ userId, status }) => {
            console.log(`Usuario ${userId} cambió estado a ${status} en NewGroupModal`);
            setContacts(prevContacts => {
              return prevContacts.map(contact => 
                contact.id === parseInt(userId) ? { ...contact, estado: status } : contact
              );
            });
          });
        }
      } catch (socketError) {
        console.error('Error al inicializar socket en NewGroupModal:', socketError);
      }
    };
    
    if (!socketInitialized.current) {
      initSocket();
    }
    
    // Limpiar cuando se desmonte el componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketInitialized.current = false;
      }
    };
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

  // Validación del formulario
  const validateForm = () => {
    const errors = {};
    
    // Validar nombre del grupo (no puede estar vacío)
    if (!groupName.trim()) {
      errors.groupName = "El nombre del grupo no puede estar vacío";
    } else if (groupName.trim().length < 3) {
      errors.groupName = "El nombre debe tener al menos 3 caracteres";
    }
    
    // Validar selección de participantes
    if (selectedContacts.length < 2) {
      errors.participants = "Debes seleccionar al menos 2 participantes";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Devuelve true si no hay errores
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setError(null);
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Verificar que el usuario esté logueado
    if (!loggedInUser || !loggedInUser.id) {
      setError('Debes iniciar sesión para crear un grupo');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Llamada a la API para crear el grupo
      const response = await axios.post('https://poi-back.vercel.app/api/grupos', {
        nombre: groupName,
        descripcion: description,
        creador_id: loggedInUser.id,
        participantes: selectedContacts,
      });
      
      if (response.data && response.data.ok) {
        // Guardar el grupo creado para usarlo en el evento personalizado
        setCreatedGroup(response.data.grupo);
        
        // Si se proporciona la función callback, la llamamos con el grupo creado
        if (onGroupCreated && typeof onGroupCreated === 'function') {
          onGroupCreated(response.data.grupo);
        }
        
        // Mostrar mensaje de éxito
        setSuccess(true);
      } else {
        setError('Error al crear el grupo: ' + (response.data?.mensaje || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error al crear grupo:', err);
      setError(err.response?.data?.mensaje || err.message || 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar contactos según término de búsqueda
  const filteredContacts = contacts.filter(contact => 
    contact.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar el cierre del modal al hacer clic fuera
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Crear Nuevo Grupo</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        
        {success ? (
          <div className="mb-4 bg-emerald-100 border-l-4 border-emerald-500 p-4 rounded flex items-center animate-fadeIn">
            <CheckCircle size={24} className="text-emerald-500 mr-2" />
            <div>
              <p className="font-medium text-emerald-700">¡Grupo creado con éxito!</p>
              <p className="text-sm text-emerald-600">El grupo ha sido creado y los participantes han sido notificados.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateGroup}>
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Nombre del Grupo</label>
              <input 
                type="text" 
                placeholder="Ej: Familia" 
                className={`w-full p-2 border ${validationErrors.groupName ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (validationErrors.groupName) {
                    setValidationErrors({...validationErrors, groupName: null});
                  }
                }}
                disabled={isSubmitting || success}
              />
              {validationErrors.groupName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.groupName}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 text-emerald-600">Descripción (opcional)</label>
              <textarea 
                placeholder="Añade una descripción del grupo" 
                className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting || success}
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
                  disabled={isSubmitting || success}
                />
              </div>
              
              {validationErrors.participants && (
                <p className="text-xs text-red-500 mb-2">{validationErrors.participants}</p>
              )}
              
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
                    filteredContacts.map((contact) => {
                      const contactAvatarSrc = getAvatarSrc(contact.foto_perfil);
                      
                      return (
                        <div 
                          key={contact.id}
                          className="flex items-center p-3 border-b border-gray-100 cursor-pointer"
                          onClick={() => {
                            if (!isSubmitting && !success) {
                              handleContactSelection(contact.id);
                              if (validationErrors.participants) {
                                setValidationErrors({...validationErrors, participants: null});
                              }
                            }
                          }}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center overflow-hidden">
                              {contactAvatarSrc ? (
                                <img 
                                  src={contactAvatarSrc} 
                                  alt={contact.nombre} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold">
                                  {contact.nombre.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {/* Indicador de estado */}
                            <span 
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${contact.estado === 'online' ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`}
                            ></span>
                          </div>
                          <div className="flex-1 ml-4">
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
                              if (!isSubmitting && !success) {
                                handleContactSelection(contact.id);
                                if (validationErrors.participants) {
                                  setValidationErrors({...validationErrors, participants: null});
                                }
                              }
                            }}
                            disabled={isSubmitting || success}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            
            <div className="text-emerald-600 text-sm my-4">
              Participantes seleccionados: {selectedContacts.length}
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              className={`w-full ${isSubmitting || success ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3 px-5 rounded text-sm transition-colors`}
              disabled={isSubmitting || success}
            >
              {isSubmitting ? 'Creando...' : success ? 'Creado' : 'Crear Grupo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewGroupModal;