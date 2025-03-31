import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegisterModal = ({ isOpen, onClose, onRegister }) => {
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    password: '',
    confirm: '',
    server: ''
  });
  
  // Añadimos un nuevo estado para manejar los errores visuales (bordes rojos)
  const [visualErrors, setVisualErrors] = useState({
    name: false,
    phone: false,
    password: false,
    confirm: false
  });

  // Efecto para controlar los errores visuales cuando cambien los errores de texto
  useEffect(() => {
    // Actualizar errores visuales basados en los errores de texto
    const newVisualErrors = {
      name: !!errors.name,
      phone: !!errors.phone,
      password: !!errors.password,
      confirm: !!errors.confirm
    };
    
    setVisualErrors(newVisualErrors);
    
    // Configurar temporizadores para eliminar los errores visuales después de 10 segundos
    const timers = [];
    
    if (errors.name) {
      const nameTimer = setTimeout(() => {
        setVisualErrors(prev => ({ ...prev, name: false }));
      }, 10000);
      timers.push(nameTimer);
    }
    
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
    
    if (errors.confirm) {
      const confirmTimer = setTimeout(() => {
        setVisualErrors(prev => ({ ...prev, confirm: false }));
      }, 10000);
      timers.push(confirmTimer);
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
      name: '',
      phone: '',
      password: '',
      confirm: '',
      server: ''
    };
    
    let isValid = true;

    // Validar nombre (mínimo 5 caracteres)
    if (registerName.trim().length < 5) {
      newErrors.name = 'El nombre debe tener al menos 5 caracteres';
      isValid = false;
    }

    // Validar teléfono (exactamente 10 caracteres)
    if (registerPhone.length !== 10 || !/^\d+$/.test(registerPhone)) {
      newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
      isValid = false;
    }

    // Validar contraseña (mínimo 6 caracteres y al menos un número)
    if (registerPassword.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    } else if (!/\d/.test(registerPassword)) {
      newErrors.password = 'La contraseña debe contener al menos un número';
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (registerPassword !== registerConfirm) {
      newErrors.confirm = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/users/', {
        nombre: registerName,
        telefono: registerPhone,
        password: registerPassword,
      });

      if (response.data.ok) {
        onRegister(response.data.usuario);
        onClose();
      } else {
        throw new Error(response.data.mensaje || 'Error al registrar el usuario');
      }
    } catch (error) {
      setErrors({
        ...errors,
        server: error.response?.data?.mensaje || error.message
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-green-600 text-xl font-medium">Crear cuenta</h2>
          <p className="text-gray-600">Ingresa tus datos para registrarte</p>
        </div>

        <div className="mb-4">
          <label htmlFor="register-name" className="block text-gray-600 text-sm mb-2">
            Nombre
          </label>
          <input
            type="text"
            id="register-name"
            className={`w-full px-4 py-3 border ${visualErrors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
            placeholder="Tu nombre (mínimo 5 caracteres)"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="register-phone" className="block text-gray-600 text-sm mb-2">
            Número de teléfono
          </label>
          <input
            type="text"
            id="register-phone"
            className={`w-full px-4 py-3 border ${visualErrors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
            placeholder="Ingrese 10 dígitos"
            value={registerPhone}
            onChange={(e) => {
              const value = e.target.value;
              // Solo permitir números
              if (value === '' || /^\d+$/.test(value)) {
                setRegisterPhone(value);
              }
            }}
            maxLength={10}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="register-password" className="block text-gray-600 text-sm mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="register-password"
            className={`w-full px-4 py-3 border ${visualErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
            placeholder="Mínimo 6 caracteres y un número"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="register-confirm" className="block text-gray-600 text-sm mb-2">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="register-confirm"
            className={`w-full px-4 py-3 border ${visualErrors.confirm ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
            placeholder="Confirma tu contraseña"
            value={registerConfirm}
            onChange={(e) => setRegisterConfirm(e.target.value)}
          />
          {errors.confirm && (
            <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
          )}
        </div>

        {errors.server && (
          <p className="text-red-500 text-sm mb-4">{errors.server}</p>
        )}

        <button
          onClick={handleRegister}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;