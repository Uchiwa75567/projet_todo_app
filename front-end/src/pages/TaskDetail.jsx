import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/tasks/TaskForm';
import PermissionModal from '../components/tasks/PermissionModal';
import Modal from '../components/ui/Modal';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [modal, setModal] = useState({ open: false, type: '', message: '', onConfirm: null });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTaskById(id);
        setTask(data);
      } catch (error) {
        setError('Erreur lors du chargement de la tâche');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleTaskUpdated = (updatedTask) => {
    setTask(updatedTask);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    setModal({
      open: true,
      type: 'confirm',
      message: 'Êtes-vous sûr de vouloir supprimer cette tâche ?',
      onConfirm: async () => {
        setModal({ ...modal, open: false });
        try {
          await taskService.deleteTask(task.id);
          navigate('/tasks');
        } catch (error) {
          setModal({ open: true, type: 'error', message: error.message || 'Erreur lors de la suppression de la tâche', onConfirm: null });
        }
      }
    });
  };

  const handleToggleCompletion = async () => {
    try {
      const updatedTask = await taskService.toggleTaskCompletion(task.id, !task.completed);
      setTask(updatedTask);
    } catch (error) {
      setModal({ open: true, type: 'error', message: error.message || 'Erreur lors de la mise à jour du statut', onConfirm: null });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Tâche non trouvée'}</p>
        <button
          onClick={() => navigate('/tasks')}
          className="btn-primary"
        >
          Retour aux tâches
        </button>
      </div>
    );
  }

  // Vérifier si l'utilisateur est le propriétaire de la tâche
  const isOwner = task.userId === user?.id;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="link-primary mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux tâches
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header avec titre et statut */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className={`text-3xl font-bold mb-2 ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {task.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.completed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.completed ? 'Terminé' : 'En cours'}
                  </span>
                  {isOwner && (
                    <span className="badge-owner">
                      Propriétaire
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleToggleCompletion}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    task.completed 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {task.completed ? 'Marquer non terminé' : 'Marquer terminé'}
                </button>
                
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-primary"
                >
                  Modifier
                </button>

                {isOwner && (
                  <button
                    onClick={() => setShowPermissionModal(true)}
                    className="btn-purple"
                  >
                    Permissions
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h3 className="section-title">Description</h3>
                <p className="desc-text">
                  {task.description}
                </p>
              </div>
            )}

            {/* Fichiers */}
            {(task.image || task.file || task.voice) && (
              <div className="file-section">
                <h3 className="section-title">Fichiers joints</h3>
                <div className="space-y-4">
                  {task.image && (
                    <div className="mb-2">
                      <img
                        src={task.image}
                        alt="Image jointe"
                        className="file-img"
                      />
                    </div>
                  )}
                  {task.file && (
                    task.file.endsWith('.pdf') ? (
                      <embed
                        src={task.file}
                        type="application/pdf"
                        width="100%"
                        height="250px"
                        className="border rounded"
                      />
                    ) : (
                      <a
                        href={task.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        {task.file}
                      </a>
                    )
                  )}
                  {task.voice && (
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Message vocal :</h4>
                      <audio controls className="w-full max-w-xs rounded-md">
                        <source src={task.voice} type="audio/wav" />
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="border-t pt-6 mt-6">
              <div className="info-grid">
                <div>
                  <span className="font-medium">Créé le :</span>
                  <p>{formatDate(task.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Modifié le :</span>
                  <p>{formatDate(task.updatedAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Créé par :</span>
                  <p>{task.user?.name || 'Utilisateur'}</p>
                </div>
                <div>
                  <span className="font-medium">ID de la tâche :</span>
                  <p>#{task.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier la tâche"
        size="large"
      >
        <TaskForm
          task={task}
          onTaskUpdated={handleTaskUpdated}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Modal d'information/erreur/confirmation */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.type === 'confirm' ? 'Confirmation' : 'Information'}
        size="small"
      >
        <div className="space-y-4">
          <div>{modal.message}</div>
          <div className="flex justify-end space-x-2">
            {modal.type === 'confirm' ? (
              <>
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setModal({ ...modal, open: false })}
                >
                  Annuler
                </button>
                <button
                  className="btn-danger"
                  onClick={modal.onConfirm}
                >
                  Confirmer
                </button>
              </>
            ) : (
              <button
                className="btn-primary"
                onClick={() => setModal({ ...modal, open: false })}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de gestion des permissions */}
      {isOwner && (
        <PermissionModal
          isOpen={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          taskId={task.id}
        />
      )}
    </>
  );
};

export default TaskDetail;
