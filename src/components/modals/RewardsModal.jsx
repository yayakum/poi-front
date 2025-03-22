import React, { useState, useEffect } from 'react';
import { X, Gift, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importamos la configuración centralizada de avatares
import { DEFAULT_AVATARS, REWARD_AVATARS, getAvatarByName, getAllAvatars } from '../../config/AvatarConfig.js';

const RewardsModal = ({ closeModal }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [view, setView] = useState('available'); // 'available' o 'history'
  const [userData, setUserData] = useState({ id: null, name: "Usuario", points: 0, foto_perfil: "" });
  const [userAvatarSrc, setUserAvatarSrc] = useState(null);
  
  const navigate = useNavigate();

  // Cargar los datos del usuario desde localStorage y luego de la API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener el ID del usuario desde localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || !storedUser.id) {
          console.error('No hay usuario en localStorage');
          navigate('/');
          return;
        }
        
        // Obtener datos actualizados del usuario desde la API
        const response = await axios.get(`http://localhost:3000/api/users/${storedUser.id}`, {
          withCredentials: true
        });
        
        if (response.data.ok && response.data.usuario) {
          const user = response.data.usuario;
          // Actualizar el estado con los datos del usuario
          setUserData({
            id: user.id,
            name: user.nombre,
            points: user.puntos_acumulados || 0,
            foto_perfil: user.foto_perfil || ""
          });
          
          // Establecer el avatar usando la función centralizada
          setUserAvatarSrc(getAvatarByName(user.foto_perfil));
          
          setUserPoints(user.puntos_acumulados || 0);
        } else {
          console.error('No se pudo obtener usuario de la API');
          navigate('/');
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setError('Error al cargar los datos del usuario.');
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Cargar las recompensas disponibles desde el backend
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/rewards`);
        
        if (response.data.ok && response.data.rewards) {
          // Ordenar las recompensas por costo (de menor a mayor)
          const sortedRewards = [...response.data.rewards].sort((a, b) => a.costo_puntos - b.costo_puntos);
          setAvailableRewards(sortedRewards);
        } else {
          setAvailableRewards([]);
          setError("No se pudieron cargar las recompensas.");
        }
      } catch (err) {
        console.error('Error al cargar recompensas:', err);
        setError('No se pudieron cargar las recompensas. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  // Cargar el historial de recompensas cuando el ID del usuario esté disponible
  useEffect(() => {
    if (userData.id) {
      const fetchRewardHistory = async () => {
        try {
          setLoading(true);
          // Obtener historial de recompensas canjeadas
          const historyResponse = await axios.get(`http://localhost:3000/api/rewards/user/${userData.id}`);
          
          if (historyResponse.data.redeemedRewards) {
            setRedeemedRewards(historyResponse.data.redeemedRewards);
          } else {
            setRedeemedRewards([]);
          }
        } catch (err) {
          console.error('Error al cargar historial de recompensas:', err);
          setError('Error al cargar el historial de recompensas.');
        } finally {
          setLoading(false);
        }
      };

      fetchRewardHistory();
    }
  }, [userData.id]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  const handleRedeemReward = async (rewardId, pointsCost) => {
    // Si no hay ID de usuario, no podemos proceder
    if (!userData.id) {
      setError('Error de sesión. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Verificar que el usuario tiene suficientes puntos
    if (userPoints < pointsCost) {
      setError('No tienes suficientes puntos para canjear esta recompensa.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      // Llamada al endpoint para canjear la recompensa
      const response = await axios.post(`http://localhost:3000/api/rewards/redeem`, {
        userId: userData.id,
        rewardId: rewardId
      });

      if (response.data && response.data.success) {
        // Actualizar los puntos del usuario después del canje exitoso
        setUserPoints(response.data.user.puntos_acumulados);
        
        // Actualizar el historial de recompensas
        const historyResponse = await axios.get(`http://localhost:3000/api/rewards/user/${userData.id}`);
        if (historyResponse.data.redeemedRewards) {
          setRedeemedRewards(historyResponse.data.redeemedRewards);
        }
        
        // Mostrar mensaje de éxito
        setSuccessMessage(`¡Recompensa "${response.data.redemption.rewardName}" canjeada exitosamente!`);
        
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      // Mostrar mensaje de error
      setError(err.response?.data?.message || 'Error al canjear la recompensa');
      
      // Ocultar el mensaje de error después de 5 segundos
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Formatear la fecha para el historial
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar el avatar del usuario
  const renderUserAvatar = () => {
    if (userAvatarSrc) {
      return (
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img 
            src={userAvatarSrc}
            alt={userData.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-bold">
          {userData.name.charAt(0)}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Recompensas</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>

        {/* User information header */}
        <div className="bg-blue-500 p-4 rounded-lg mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderUserAvatar()}
              <div>
                <h3 className="font-bold text-lg">{userData.name}</h3>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center">
              <Gift size={16} className="mr-2" />
              <span className="font-bold">{userPoints} puntos</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 ${view === 'available' ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-500'}`}
            onClick={() => setView('available')}
          >
            Recompensas Disponibles
          </button>
          <button 
            className={`px-4 py-2 ${view === 'history' ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-500'}`}
            onClick={() => setView('history')}
          >
            Historial de Canjes
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
            <Check size={20} className="mr-2" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {view === 'available' ? (
              /* Rewards section */
              <>
                <h3 className="font-bold text-lg mb-3">Canjear Recompensas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {availableRewards && availableRewards.length > 0 ? (
                    availableRewards.map((reward) => {
                      // Obtener la imagen correcta para la recompensa usando la función centralizada
                      const rewardImage = getAvatarByName(reward.recompensa);
                      
                      return (
                        <div 
                          key={reward.id} 
                          className={`bg-white rounded-lg p-4 shadow-md border ${userPoints >= reward.costo_puntos ? 'border-emerald-200' : 'border-gray-200 opacity-70'}`}
                        >
                          <h4 className="font-bold mb-2">{reward.nombre}</h4>
                          <p className="text-gray-600 text-sm mb-3">{reward.descripcion}</p>
                          
                          <div className="flex items-center gap-4">
                            {rewardImage ? (
                              <img 
                                src={rewardImage} 
                                alt={reward.nombre}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleImageClick(rewardImage)}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                No imagen
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-emerald-600 font-bold mb-1">{reward.costo_puntos} puntos</div>
                              <button
                                className={`px-3 py-1 rounded-full text-white text-sm ${userPoints < reward.costo_puntos ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                disabled={userPoints < reward.costo_puntos}
                                onClick={() => handleRedeemReward(reward.id, reward.costo_puntos)}
                              >
                                {userPoints < reward.costo_puntos ? 'Puntos insuficientes' : 'Canjear'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-4">
                      <p>No hay recompensas disponibles en este momento.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* History section */
              <>
                <h3 className="font-bold text-lg mb-3">Historial de Recompensas Canjeadas</h3>
                {redeemedRewards && redeemedRewards.length > 0 ? (
                  <div className="space-y-3">
                    {redeemedRewards.map((reward) => {
                      // Obtener la imagen correcta para la recompensa del historial
                      const rewardImage = getAvatarByName(reward.reward);
                      
                      return (
                        <div key={reward.id} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                          <div className="flex items-start gap-4">
                            {rewardImage ? (
                              <img 
                                src={rewardImage} 
                                alt={reward.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                No imagen
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold">{reward.name}</h4>
                                  <p className="text-gray-600 text-sm">{reward.description}</p>
                                  <div className="text-emerald-600 font-bold mt-1">{reward.cost} puntos</div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(reward.redeemedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No has canjeado ninguna recompensa todavía.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Image preview overlay */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeImagePreview}>
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
              <button 
                className="absolute top-4 right-4 bg-white/20 p-2 rounded-full"
                onClick={closeImagePreview}
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsModal;