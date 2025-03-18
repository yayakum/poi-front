import React from 'react';
import { X, MessageSquare, Users, Video } from 'lucide-react';

const TasksModal = ({ closeModal }) => {
  const tasks = [
    { 
      icon: <MessageSquare size={24} />, 
      title: "Primer Mensaje", 
      reward: "+50 puntos", 
      description: "Envía tu primer mensaje a un contacto", 
      progress: 100,
      status: "¡Completado!",
      completed: true
    },
    { 
      icon: <Users size={24} />, 
      title: "Primer Grupo", 
      reward: "+100 puntos", 
      description: "Crea tu primer grupo de chat", 
      progress: 0,
      status: "Pendiente",
      completed: false
    },
    { 
      icon: <Video size={24} />, 
      title: "Primera Videollamada", 
      reward: "+150 puntos", 
      description: "Realiza tu primera videollamada", 
      progress: 0,
      status: "Pendiente",
      completed: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-5 rounded-lg w-11/12 max-w-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Tareas y Recompensas</h2>
          <X 
            size={24} 
            className="cursor-pointer" 
            onClick={closeModal} 
          />
        </div>
        <div>
          {tasks.map((task, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {task.icon}
                  <h3 className="font-bold">{task.title}</h3>
                </div>
                <div className="text-emerald-600 font-bold">{task.reward}</div>
              </div>
              <div className="text-gray-500 mb-3">{task.description}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600" 
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <span className={`text-xs ${task.completed ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksModal;