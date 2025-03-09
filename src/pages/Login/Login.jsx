import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const Login = () => {
  // Estados para el formulario de inicio de sesión
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  
  // Estado para mostrar el modal de registro
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Estados para el formulario de registro
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [confirmError, setConfirmError] = useState(false);

  // Manejador de envío del formulario de inicio de sesión
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones simples
    if (!phone) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
    }
    
    if (password.length < 6) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
    
    // Aquí iría la lógica para enviar el formulario si pasa validaciones
    if (phone && password.length >= 6) {
      console.log('Iniciando sesión con:', { phone, password });
      // Aquí iría la llamada a tu API de autenticación
    }
  };
  
  // Manejador para el registro
  const handleRegister = () => {
    if (registerPassword !== registerConfirm) {
      setConfirmError(true);
      return;
    }
    
    setConfirmError(false);
    console.log('Registrando usuario:', { registerName, registerPhone, registerPassword });
    // Aquí iría tu lógica de registro
    
    // Cerrar el modal después del registro
    setIsRegisterModalOpen(false);
  };
  
  // Cerrar el modal si se hace clic fuera de él
  const handleModalClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      setIsRegisterModalOpen(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <MessageSquare size={40} className="text-white" />
          </div>
          <h1 className="text-green-600 text-2xl font-medium">TextMe</h1>
        </div>
        
        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-5">
            <label htmlFor="phone" className="block text-gray-600 text-sm mb-2">
              Número de teléfono
            </label>
            <input
              type="text"
              id="phone"
              className={`w-full px-4 py-3 border ${phoneError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
              placeholder="Ingrese su número telefónico"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">Por favor, introduce un número de teléfono válido</p>
            )}
          </div>
          
          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-600 text-sm mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className={`w-full px-4 py-3 border ${passwordError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">La contraseña debe tener al menos 6 caracteres</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300"
          >
            Iniciar sesión
          </button>
        </form>
        
        {/* Separador */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-gray-500 text-sm">O</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
        
        {/* Enlace de registro */}
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
      
      {/* Modal de registro */}
      {isRegisterModalOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 modal-backdrop"
          onClick={handleModalClick}
        >
          <div className="bg-white rounded-lg w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Tu nombre"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="register-phone" className="block text-gray-600 text-sm mb-2">
                Número de teléfono
              </label>
              <input
                type="text"
                id="register-phone"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Ingrese su número telefónico"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="register-password" className="block text-gray-600 text-sm mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="register-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Mínimo 6 caracteres"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>
            
            <div className="mb-5">
              <label htmlFor="register-confirm" className="block text-gray-600 text-sm mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="register-confirm"
                className={`w-full px-4 py-3 border ${confirmError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600`}
                placeholder="Confirma tu contraseña"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
              />
              {confirmError && (
                <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
            
            <button
              onClick={handleRegister}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300"
            >
              Registrarse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;