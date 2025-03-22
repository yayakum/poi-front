import React, { useState, useEffect } from 'react';
import { X, ListTodo, Users } from 'lucide-react';
import axios from 'axios';

const CreateTaskModal = ({ closeModal, group, onTaskCreated }) => {
  const [taskText, setTaskText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskText.trim()) {
      setError('El texto de la tarea no puede estar vacío');
      return;
    }

    if (!group || !group.id) {
      setError('No se ha seleccionado un grupo');
      return;
    }

    if (!currentUserId) {
      setError('No se pudo identificar al usuario actual');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/tasks', {
        grupo_id: group.id,
        texto: taskText,
        creado_por: currentUserId
      });
      
      console.log('Tarea creada:', response.data);
      
      // Si hay una función de callback para actualizar la lista de tareas
      if (onTaskCreated && typeof onTaskCreated === 'function') {
        onTaskCreated(response.data.task);
      }
      
      // Mostrar mensaje de éxito
      alert('Tarea creada con éxito');
      
      // Cerrar el modal después de la creación exitosa
      closeModal();
    } catch (err) {
      console.error('Error al crear tarea:', err);
      setError(err.response?.data?.message || 'No se pudo crear la tarea. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ListTodo size={24} />
            Nueva Tarea
          </h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} />
              <span className="text-gray-600 font-medium">Para: </span>
              <span className="text-gray-800">{group?.nombre || 'Grupo no seleccionado'}</span>
            </div>
            
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taskText">
              Descripción de la tarea
            </label>
            <textarea
              id="taskText"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Describe la tarea a realizar..."
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              
            ></textarea>
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:bg-emerald-300"
              disabled={isSubmitting || !currentUserId || !group?.id}
            >
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;