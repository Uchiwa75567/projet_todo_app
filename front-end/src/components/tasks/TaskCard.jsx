import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import TaskForm from './TaskForm';
import Modal from '../ui/Modal';

const TaskCard = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modal, setModal] = useState({ open: false, type: '', message: '', onConfirm: null });
  const { user } = useAuth();

  // Détermination des droits : propriétaire ou permission
  const isOwner = user && task.userId === user.id;
  // Si le backend renvoie task.canEdit/canDelete OU task.permissions (array)
  // On privilégie la propriété directe si elle existe, sinon on cherche dans permissions
  const canEdit = isOwner || task.canEdit || (Array.isArray(task.permissions) && task.permissions.some(p => p.userId === user?.id && p.canEdit));
  const canDelete = isOwner || task.canDelete || (Array.isArray(task.permissions) && task.permissions.some(p => p.userId === user?.id && p.canDelete));

  const checkPermission = (action) => {
    if (action === 'delete' && !canDelete) {
      setModal({
        open: true,
        type: 'error',
        message: 'Vous n\'avez pas les permissions requises pour supprimer cette tâche.',
        onConfirm: () => setModal({ open: false, type: '', message: '', onConfirm: null })
      });
      return false;
    }
    if (action === 'edit' && !canEdit) {
      setModal({
        open: true,
        type: 'error',
        message: 'Vous n\'avez pas les permissions requises pour modifier cette tâche.',
        onConfirm: () => setModal({ open: false, type: '', message: '', onConfirm: null })
      });
      return false;
    }
    return true;
  };

  const handleDelete = () => {
    if (!checkPermission('delete')) return;

    setModal({
      open: true,
      type: 'confirm',
      message: 'Êtes-vous sûr de vouloir supprimer cette tâche ?',
      onConfirm: async () => {
        try {
          setLoading(true);
          await taskService.deleteTask(task.id);
          
          // Fermer le modal immédiatement après la suppression réussie
          setModal({ open: false, type: '', message: '', onConfirm: null });
          
          // Notifier le parent de la suppression avec un petit délai
          setTimeout(() => {
            onTaskDeleted?.(task.id);
          }, 100);

        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          // Afficher un nouveau modal d'erreur
          setModal({
            open: true,
            type: 'error',
            message: error.message || 'Erreur lors de la suppression de la tâche',
            onConfirm: () => setModal({ open: false, type: '', message: '', onConfirm: null })
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleToggleCompletion = async () => {
    if (!checkPermission('edit')) return;
    
    try {
      setLoading(true);
      const updatedTask = await taskService.toggleTaskCompletion(task.id, !task.completed);
      onTaskUpdated(updatedTask);
    } catch (error) {
      setModal({ 
        open: true, 
        type: 'error', 
        message: error.message || 'Erreur lors de la mise à jour du statut',
        onConfirm: () => setModal({ open: false, type: '', message: '', onConfirm: null })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    onTaskUpdated(updatedTask);
    setShowEditModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <Link to={`/tasks/${task.id}`} className="flex-1">
            <h3 className={`text-lg font-semibold hover:text-blue-600 transition-colors ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
          </Link>
          <div className="flex space-x-2 ml-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {task.completed ? 'Terminé' : 'En cours'}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {task.description}
          </p>
        )}

        {/* Fichiers joints */}
        <div className="mb-4">
          {task.image && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">📷 Image: </span>
              <span className="text-sm text-blue-600">{task.image}</span>
            </div>
          )}
          {task.file && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">📎 Fichier: </span>
              <span className="text-sm text-blue-600">{task.file}</span>
            </div>
          )}
          {task.voice && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">🔊 Message vocal: </span>
              <audio controls className="inline-block align-middle h-6">
                <source src={task.voice} type="audio/wav" />
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 mb-4">
          <div>Créé le: {formatDate(task.createdAt)}</div>
          {task.updatedAt !== task.createdAt && (
            <div>Modifié le: {formatDate(task.updatedAt)}</div>
          )}
          {task.startDate && (
            <div>Début: {new Date(task.startDate).toLocaleDateString('fr-FR')}</div>
          )}
          {task.endDate && (
            <div>Fin: {new Date(task.endDate).toLocaleDateString('fr-FR')}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={handleToggleCompletion}
              disabled={loading}
              className={`text-sm font-medium disabled:opacity-50 ${
                task.completed 
                  ? 'text-yellow-600 hover:text-yellow-800' 
                  : 'text-green-600 hover:text-green-800'
              }`}
            >
              {task.completed ? 'Marquer non terminé' : 'Marquer terminé'}
            </button>
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                disabled={loading}
                className="link-primary disabled:opacity-50"
              >
                Modifier
              </button>
            )}
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="link-danger disabled:opacity-50"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Modal de modification */}
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
    </>
  );
};

export default TaskCard;