import React, { useState, useEffect } from 'react';
import { X, Edit, Check, Lock } from 'lucide-react';
import axios from 'axios';

// Importamos nuestra configuración centralizada de avatares
import { DEFAULT_AVATARS, REWARD_AVATARS, getAvatarByName, getAllAvatars } from '../../config/AvatarConfig.js';

const EditProfileModal = ({ closeModal, userId }) => {
  const [userData, setUserData] = useState({
    nombre: "",
    descripcion: "Hey! Estoy usando TextME",
    telefono: "",
    foto_perfil: "",
    password: ""
  });
  const [selectedAvatarSrc, setSelectedAvatarSrc] = useState(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  
  // Obtener todos los avatares disponibles considerando las recompensas
  const allAvatars = getAllAvatars(redeemedRewards);

  // Función para cargar los datos del usuario desde la API
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      // Obtener el ID del usuario desde props o localStorage
      const id = userId || JSON.parse(localStorage.getItem('user'))?.id;
      
      if (!id) {
        setError("No se pudo identificar al usuario");
        setIsLoading(false);
        return;
      }
      
      // Hacer la petición a la API para datos del usuario
      const response = await axios.get(`http://localhost:3000/api/users/${id}`, {
        withCredentials: true
      });
      
      if (response.data.ok && response.data.usuario) {
        const user = response.data.usuario;
        setUserData({
          nombre: user.nombre || "",
          descripcion: user.descripcion || "Hey! Estoy usando TextME",
          telefono: user.telefono || "",
          foto_perfil: user.foto_perfil || "",
          password: ""
        });
        
        // Establecer el avatar seleccionado usando la función centralizada
        if (user.foto_perfil) {
          setSelectedAvatarSrc(getAvatarByName(user.foto_perfil));
        }
        
        // También cargar las recompensas canjeadas por el usuario
        await fetchUserRewards(id);
      } else {
        setError("No se pudieron obtener los datos del usuario");
      }
    } catch (error) {
      setError(
        error.response?.data?.mensaje || 
        "Error al conectar con el servidor. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para cargar las recompensas canjeadas por el usuario
  const fetchUserRewards = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/rewards/user/${userId}`);
      if (response.data && response.data.redeemedRewards) {
        setRedeemedRewards(response.data.redeemedRewards);
      }
    } catch (error) {
      console.error("Error al cargar recompensas del usuario:", error);
      // No establecemos error para no interrumpir el flujo principal
    }
  };

  useEffect(() => {
    // Cargar datos del usuario desde la API al montar el componente
    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const selectAvatar = (avatar) => {
    // Solo permite seleccionar si está disponible
    if (!avatar.reward || avatar.available) {
      setUserData({
        ...userData,
        foto_perfil: avatar.name
      });
      setSelectedAvatarSrc(avatar.src);
      setShowAvatarSelector(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    
    try {
      // Obtener ID del usuario desde props o localStorage
      const id = userId || JSON.parse(localStorage.getItem('user'))?.id;
      
      if (!id) {
        setError("No se pudo identificar al usuario");
        setIsSubmitting(false);
        return;
      }
      
      // Preparar datos para enviar a la API
      const dataToUpdate = {
        nombre: userData.nombre,
        descripcion: userData.descripcion,
        foto_perfil: userData.foto_perfil
      };
      
      // Solo incluir contraseña si se ha ingresado una nueva
      if (userData.password) {
        dataToUpdate.password = userData.password;
      }
      
      // Llamada a la API
      const response = await axios.put(
        `http://localhost:3000/api/${id}`, 
        dataToUpdate,
        { withCredentials: true }
      );
      
      if (response.data.ok) {
        // Si hay un usuario en localStorage, actualizarlo también
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser = {
            ...parsedUser,
            nombre: userData.nombre,
            descripcion: userData.descripcion,
            foto_perfil: userData.foto_perfil
          };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setSuccess("Perfil actualizado correctamente");
        
        // Cerrar el modal después de un breve tiempo
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setError(response.data.mensaje || "Error al actualizar el perfil");
      }
    } catch (error) {
      setError(
        error.response?.data?.mensaje || 
        "Error al conectar con el servidor. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAvatar = () => {
    if (selectedAvatarSrc) {
      return (
        <img 
          src={selectedAvatarSrc} 
          alt="Avatar" 
          className="w-24 h-24 rounded-full object-cover"
        />
      );
    } else {
      return (
        <div className="w-24 h-24 rounded-full bg-emerald-700 mx-auto flex items-center justify-center text-white text-3xl font-bold">
          {userData.nombre ? userData.nombre.charAt(0).toUpperCase() : ""}
        </div>
      );
    }
  };

  // Maneja el cierre del modal al hacer clic fuera
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay overflow-y-auto p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Editar Perfil</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        
        <div className="overflow-y-auto flex-grow px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="text-center my-5">
                <div className="relative mx-auto w-24 h-24">
                  {renderAvatar()}
                  <button 
                    type="button"
                    className="absolute bottom-0 right-0 bg-yellow-400 text-white rounded-full p-2 cursor-pointer"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  >
                    <Edit size={16} />
                  </button>
                </div>
                
                {showAvatarSelector && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Selecciona un avatar</h3>
                    <div className="max-h-48 overflow-y-auto p-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {/* Avatares por defecto y recompensas desbloqueadas */}
                        {allAvatars.map((avatar, index) => (
                          <div 
                            key={index} 
                            className={`relative cursor-pointer p-1 rounded-lg ${
                              avatar.reward && !avatar.available 
                                ? 'opacity-50 cursor-not-allowed' 
                                : selectedAvatarSrc === avatar.src ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'hover:bg-gray-200'
                            }`}
                            onClick={() => avatar.reward && !avatar.available ? null : selectAvatar(avatar)}
                          >
                            <img 
                              src={avatar.src} 
                              alt={`Avatar ${index + 1}`} 
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto"
                            />
                            {selectedAvatarSrc === avatar.src && (
                              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1">
                                <Check size={12} />
                              </div>
                            )}
                            {avatar.reward && !avatar.available && (
                              <div className="absolute top-0 right-0 bg-gray-500 text-white rounded-full p-1">
                                <Lock size={12} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Algunos avatares están bloqueados. Puedes desbloquearlos mediante recompensas.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 text-emerald-600">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={userData.nombre}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="Tu nombre"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 text-emerald-600">Info</label>
                <textarea 
                  name="descripcion"
                  value={userData.descripcion}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-200 rounded text-sm h-20 resize-y"
                  placeholder="Hey! Estoy usando TextME"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 text-emerald-600">Teléfono</label>
                <input 
                  type="tel" 
                  name="telefono"
                  value={userData.telefono}
                  disabled={true}
                  className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-100"
                  placeholder="Tu número de teléfono (no modificable)"
                />
                <p className="text-xs text-gray-500 mt-1">El número de teléfono no puede modificarse</p>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 text-emerald-600">Nueva Contraseña</label>
                <input 
                  type="password" 
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="Deja en blanco para mantener tu contraseña actual"
                />
                <p className="text-xs text-gray-500 mt-1">Al menos 6 caracteres, incluyendo un número</p>
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-2 bg-green-100 border border-green-300 text-green-800 rounded">
                  {success}
                </div>
              )}
            </form>
          )}
        </div>
        
        <div className="p-4 border-t mt-auto">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className={`w-full ${isSubmitting || isLoading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3 px-5 rounded text-sm transition-colors`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;