// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';
import RegisterModal from '../../components/modals/RegisterModal.jsx';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    phone: '',
    password: '',
    server: ''
  });
  const [visualErrors, setVisualErrors] = useState({
    phone: false,
    password: false
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  // Efecto para controlar los errores visuales cuando cambien los errores de texto
  useEffect(() => {
    // Actualizar errores visuales basados en los errores de texto
    const newVisualErrors = {
      phone: !!errors.phone,
      password: !!errors.password
    };
    
    setVisualErrors(newVisualErrors);
    
    // Configurar temporizadores para eliminar los errores visuales después de 10 segundos
    const timers = [];
    
    if (errors.phone) {
      const phoneTimer = setTimeout(() => {
        setVisualErrors(prev => ({ ...prev, phone: false }));
      }, 10000);
      timers.push(phoneTimer);
    }
    
    if (errors.password) {
      const passwordTimer = setTimeout(() => {
        setVisualErrors(prev => ({ ...prev, password: false }));
      }, 10000);
      timers.push(passwordTimer);
    }
    
    // Limpiar todos los temporizadores cuando el componente se desmonte o los errores cambien
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [errors]);

  // También configuramos un temporizador para el error del servidor
  useEffect(() => {
    let serverErrorTimer;
    
    if (errors.server) {
      serverErrorTimer = setTimeout(() => {
        setErrors(prev => ({ ...prev, server: '' }));
      }, 10000);
    }
    
    return () => {
      if (serverErrorTimer) clearTimeout(serverErrorTimer);
    };
  }, [errors.server]);

  const validateForm = () => {
    const newErrors = {
      phone: '',
      password: '',
      server: ''
    };
    
    let isValid = true;

    // Validaciones básicas
    if (!phone) {
      newErrors.phone = 'Este campo es obligatorio';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Este campo es obligatorio';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        telefono: phone,
        password,
      });

      if (response.data.ok) {
        // Almacenar la información del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
        navigate('/dashboard');
      } else {
        setErrors({
          ...errors,
          server: 'Credenciales incorrectas'
        });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrors({
        ...errors,
        server: error.response?.data?.mensaje || 'Error al iniciar sesión'
      });
    }
  };

  const handleRegister = (userData) => {
    console.log('Registrando usuario:', userData);
    // Aquí iría tu lógica de registro
  };

  return (
    <div className="bg-gray-200 min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <MessageSquare size={40} className="text-white" />
          </div>
          <h1 className="text-green-600 text-2xl font-medium">TextMe</h1>
        </div>
        
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-5">
            <label htmlFor="phone" className="block text-gray-600 text-sm mb-2">
              Número de teléfono
            </label>
            <input
              type="text"
              id="phone"
              className={`w-full px-4 py-3 border ${visualErrors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
              placeholder="Ingrese su número telefónico"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-600 text-sm mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className={`w-full px-4 py-3 border ${visualErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          {errors.server && (
            <p className="text-red-500 text-sm mb-4">{errors.server}</p>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300"
          >
            Iniciar sesión
          </button>
        </form>
        
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-gray-500 text-sm">O</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
        
        <div className="text-center">
          ¿No tienes una cuenta? 
          <button 
            onClick={() => setIsRegisterModalOpen(true)} 
            className="text-green-600 ml-1 hover:underline"
          >
            Regístrate
          </button>
        </div>
      </div>
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onRegister={handleRegister}
      />
    </div>
  );
};

export default Login;