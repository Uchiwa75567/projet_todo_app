import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await taskService.getHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        setError('Erreur lors du chargement de l\'historique');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return (
          <div className="action-icon-green">
            <svg className="icon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'update':
      case 'updated':
        return (
          <div className="action-icon-blue">
            <svg className="icon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'delete':
      case 'deleted':
        return (
          <div className="action-icon-red">
            <svg className="icon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'read':
      case 'viewed':
        return (
          <div className="action-icon-gray">
            <svg className="icon-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="action-icon-purple">
            <svg className="icon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActionText = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'a créé';
      case 'update':
      case 'updated':
        return 'a modifié';
      case 'delete':
      case 'deleted':
        return 'a supprimé';
      case 'read':
      case 'viewed':
        return 'a consulté';
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Historique des actions</h1>
        <p className="text-gray-600 mt-2">
          Consultez toutes vos actions sur les tâches depuis la création de votre compte.
        </p>
      </div>

      {error && (
        <div className="error-alert mb-6">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5m4-7v7a2 2 0 01-2 2h-9M9 5l2 2 4-4m6 5v6a2 2 0 01-2 2h-7" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune action trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Votre historique d'actions apparaîtra ici au fur et à mesure que vous utilisez l'application.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {history.map((entry) => (
              <li key={entry.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  {getActionIcon(entry.action)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">
                        {user?.id === entry.user.id ? 'Vous' : entry.user.name} {getActionText(entry.action)} 
                        {entry.taskId ? (
                          <span className="font-medium"> la tâche #{entry.taskId}</span>
                        ) : (
                          <span className="font-medium text-gray-500"> une tâche</span>
                        )}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>
                    
                    {entry.task && (
                      <p className="mt-1 text-sm text-gray-600">
                        "{entry.task.title}"
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {history.length} action{history.length > 1 ? 's' : ''} trouvée{history.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default History;