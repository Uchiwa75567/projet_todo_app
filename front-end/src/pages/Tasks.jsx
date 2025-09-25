import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import TaskList from '../components/tasks/TaskList';
import { useAuth } from '../context/AuthContext';
import { usePagination } from '../hooks/usePagination';

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Get values from URL params with defaults
  const statusFilter = searchParams.get('status') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      setError('Erreur lors du chargement des tâches');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId) => {
    // Optimistic update
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) return;

    // Mettre à jour l'UI immédiatement
    setTasks(prev => prev.filter(task => task.id !== taskId));

    // Afficher un message de succès temporaire
    setError('');
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    successMessage.textContent = 'Tâche supprimée avec succès';
    document.body.appendChild(successMessage);

    // Retirer le message après 3 secondes
    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  };

  // Filtering tasks based on search and statusFilter
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = !task.completed;
    else if (statusFilter === 'completed') matchesStatus = task.completed;
    else if (statusFilter === 'mine') matchesStatus = task.userId === user?.id;

    return matchesSearch && matchesStatus;
  });

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalItems: totalTasks,
    totalPages,
    paginatedItems: paginatedTasks,
    handlePageChange,
    handlePageSizeChange,
    setSearchParams: updateSearchParams,
  } = usePagination({ items: filteredTasks, searchParams, setSearchParams });

  // Handlers for filter and pagination changes
  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    updateSearchParams({ search: newSearch });
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    updateSearchParams({ status: newStatus });
  };

  const handlePageSizeSelect = (e) => {
    const newSize = Number(e.target.value);
    handlePageSizeChange(newSize);
  };

  const handlePageSelect = (newPage) => {
    handlePageChange(newPage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Tâches</h1>
          <p className="text-sm text-gray-600 mt-1">
            Page {currentPage} • {paginatedTasks.length} tâche{paginatedTasks.length !== 1 ? 's' : ''} sur {totalTasks}
          </p>
        </div>
        <button
          onClick={() => navigate('/tasks/create')}
          className="btn-primary"
        >
          Nouvelle Tâche
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par titre ou description..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center space-x-4 mb-4">
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Toutes les tâches</option>
          <option value="pending">En cours</option>
          <option value="completed">Terminées</option>
          <option value="mine">Mes tâches</option>
        </select>

        <select
          value={pageSize}
          onChange={handlePageSizeSelect}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value={6}>6 par page</option>
          <option value={12}>12 par page</option>
          <option value={24}>24 par page</option>
        </select>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="card">
          <TaskForm
            onTaskCreated={handleTaskCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Liste des tâches */}
      <TaskList
        tasks={paginatedTasks}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Pagination controls */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Tasks;