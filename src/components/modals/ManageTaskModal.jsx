import React, { useState, useEffect } from 'react';
import { X, CircleCheck, CircleDashed, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ManageTaskModal = ({ closeModal, group }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(true);

  // Cargar tareas del grupo cuando se abre el modal
  useEffect(() => {
    if (group && group.id) {
      fetchTasks(group.id);
    } else {
      setIsLoading(false);
      setError('No se ha seleccionado un grupo válido');
    }
  }, [group]);

  // Función para obtener las tareas del grupo
  const fetchTasks = async (groupId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/tasks/${groupId}`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError('No se pudieron cargar las tareas. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "Pendiente";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completeTask = async (taskId) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      if (!loggedInUser) {
        setError('Debes estar autenticado para completar tareas');
        return;
      }

      await axios.put(`${API_URL}/api/tasks/${taskId}`, {
        finalizado_por: loggedInUser.id
      });

      // Actualizar la lista de tareas después de completar una
      if (group && group.id) {
        fetchTasks(group.id);
      }
    } catch (err) {
      console.error('Error al completar la tarea:', err);
      setError('No se pudo completar la tarea. Por favor, intenta de nuevo.');
    }
  };

  // Filtrar tareas pendientes y completadas
  const pendingTasks = tasks.filter(task => task.estatus !== 'completa');
  const completedTasks = tasks.filter(task => task.estatus === 'completa');

  // Componente para renderizar una tarea individual
  const TaskItem = ({ task }) => (
    <div 
      className={`bg-white rounded-lg p-4 mb-4 shadow-sm ${task.estatus === 'completa' ? 'border-l-4 border-emerald-500' : ''}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {task.estatus === 'completa' ? 
            <CircleCheck size={24} className="text-emerald-600" /> : 
            <CircleDashed size={24} className="text-amber-500" />
          }
          <h3 className="font-bold">{task.texto}</h3>
        </div>
        <div className={`font-medium ${task.estatus === 'completa' ? 'text-emerald-600' : 'text-amber-500'}`}>
          {task.estatus === 'completa' ? 'Completada' : 'Pendiente'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Creada por:</span> {task.usuarios_tareas_creado_porTousuarios?.nombre || 'Desconocido'}
        </div>
        <div>
          <span className="text-gray-500">Fecha de creación:</span> {formatDate(task.fecha_creacion)}
        </div>
        
        <div>
          <span className="text-gray-500">Finalizada por:</span> {
            task.usuarios_tareas_finalizado_porTousuarios?.nombre || 'Pendiente'
          }
        </div>
        <div>
          <span className="text-gray-500">Fecha de finalización:</span> {formatDate(task.fecha_finalizacion)}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-600" 
            style={{ width: task.estatus === 'completa' ? '100%' : '0%' }}
          ></div>
        </div>
        
        {task.estatus !== 'completa' && (
          <button 
            onClick={() => completeTask(task.id)}
            className="ml-4 bg-emerald-600 text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm hover:bg-emerald-700 transition-colors"
          >
            <CircleCheck size={16} />
            Finalizar
          </button>
        )}
      </div>
    </div>
  );

  // Componente para renderizar la sección de tareas con título colapsable
  const TaskSection = ({ title, tasks, expanded, toggleExpanded, bgColor = 'bg-gray-100' }) => (
    <div className="mb-6">
      <div 
        className={`${bgColor} p-3 rounded-lg flex justify-between items-center cursor-pointer mb-2`}
        onClick={toggleExpanded}
      >
        <h3 className="font-bold flex items-center">
          {title} <span className="ml-2 text-gray-500 text-sm">({tasks.length})</span>
        </h3>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {expanded && tasks.length > 0 && (
        <div className="pl-2">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
      
      {expanded && tasks.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay tareas disponibles en esta sección
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Tareas de {group?.nombre || 'Grupo'}</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No hay tareas en este grupo. ¡Crea una nueva tarea!
          </div>
        ) : (
          <div>
            <TaskSection 
              title="Tareas Pendientes" 
              tasks={pendingTasks}
              expanded={pendingExpanded}
              toggleExpanded={() => setPendingExpanded(!pendingExpanded)}
              bgColor="bg-amber-50"
            />
            
            <TaskSection 
              title="Tareas Completadas" 
              tasks={completedTasks}
              expanded={completedExpanded}
              toggleExpanded={() => setCompletedExpanded(!completedExpanded)}
              bgColor="bg-emerald-50"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTaskModal;