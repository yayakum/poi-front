// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirección
import { MessageSquare } from 'lucide-react';
import RegisterModal from '../../components/modals/RegisterModal.jsx';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const navigate = useNavigate(); // Hook para redirección

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
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

    if (phone && password.length >= 6) {
      try {
        // Simular una llamada a la API de autenticación
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Guardar el token de autenticación en localStorage (o en un estado global)
          localStorage.setItem('token', data.token);

          // Redirigir al dashboard
          navigate('/dashboard');
        } else {
          // Mostrar un mensaje de error si la autenticación falla
          alert(data.mensaje || 'Error en la autenticación');
        }
      } catch (error) {
        console.error('Error en la autenticación:', error);
        alert('Error en la autenticación');
      }
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