import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Wrench, Plus } from 'lucide-react';
import { MaintenanceTask, Equipment } from '../types';

interface MaintenancePanelProps {
  tasks: MaintenanceTask[];
  equipment: Equipment[];
}

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ tasks, equipment }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('pending');
  const [showAddTask, setShowAddTask] = useState(false);

  const filters = [
    { id: 'all', label: 'All Tasks', count: tasks.length },
    { id: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
    { id: 'overdue', label: 'Overdue', count: tasks.filter(t => !t.completed && t.dueDate < new Date()).length },
    { id: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length }
  ];

  const filteredTasks = tasks.filter(task => {
    switch (selectedFilter) {
      case 'pending': return !task.completed;
      case 'overdue': return !task.completed && task.dueDate < new Date();
      case 'completed': return task.completed;
      default: return true;
    }
  });

  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'amber'
    };
    return colors[priority];
  };

  const getTaskTypeIcon = (type: MaintenanceTask['type']) => {
    const icons = {
      routine: Calendar,
      preventive: Wrench,
      repair: AlertTriangle
    };
    return icons[type];
  };

  const isOverdue = (dueDate: Date) => dueDate < new Date();
  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (dueDate: Date) => {
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map(filter => (
          <div 
            key={filter.id}
            className={`bg-white/70 backdrop-blur-md rounded-xl p-4 border cursor-pointer transition-all duration-200 ${
              selectedFilter === filter.id 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-white/50 hover:border-blue-200'
            }`}
            onClick={() => setSelectedFilter(filter.id as any)}
          >
            <div className="text-2xl font-bold text-gray-900">{filter.count}</div>
            <div className={`text-sm ${
              selectedFilter === filter.id ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {filter.label}
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Tasks */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h3>
              <p className="text-sm text-gray-600">Equipment care and upkeep</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tasks found for the selected filter</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const TaskIcon = getTaskTypeIcon(task.type);
              const priorityColor = getPriorityColor(task.priority);
              const overdue = !task.completed && isOverdue(task.dueDate);
              
              return (
                <div
                  key={task.id}
                  className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-md ${
                    task.completed
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : overdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        task.completed
                          ? 'bg-emerald-100'
                          : overdue
                          ? 'bg-red-100'
                          : `bg-${priorityColor}-100`
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <TaskIcon className={`w-4 h-4 ${
                            overdue ? 'text-red-600' : `text-${priorityColor}-600`
                          }`} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${
                            task.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          <div className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${
                            task.completed
                              ? 'bg-gray-100 text-gray-600'
                              : `bg-${priorityColor}-100 text-${priorityColor}-700`
                          }`}>
                            {task.priority}
                          </div>
                          <div className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                            task.completed
                              ? 'bg-gray-100 text-gray-600'
                              : task.type === 'routine'
                              ? 'bg-blue-100 text-blue-700'
                              : task.type === 'preventive'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {task.type}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Equipment: {task.equipment}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedDuration}min</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${
                            overdue ? 'text-red-600 font-medium' : 'text-gray-500'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!task.completed && (
                        <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-200 text-sm font-medium">
                          Complete
                        </button>
                      )}
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Equipment Health Overview */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-3">Equipment Health Overview</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {equipment.map(eq => {
              const healthScore = eq.status === 'online' ? 95 : eq.status === 'maintenance' ? 70 : 45;
              const healthColor = healthScore > 90 ? 'emerald' : healthScore > 70 ? 'amber' : 'red';
              
              return (
                <div key={eq.id} className="bg-white/70 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-1">{eq.name}</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 bg-${healthColor}-500 rounded-full transition-all duration-500`}
                        style={{ width: `${healthScore}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium text-${healthColor}-600`}>
                      {healthScore}%
                    </span>
                  </div>
                  {eq.nextMaintenance && (
                    <div className="text-xs text-gray-500 mt-1">
                      Next: {eq.nextMaintenance.toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Task Modal would go here */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddTask(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Maintenance Task</h3>
            <p className="text-sm text-gray-600 mb-4">Task creation form would go here...</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePanel;