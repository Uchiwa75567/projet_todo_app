import { useState } from 'react';
import { taskService } from '../../services/taskService';
import Modal from '../ui/Modal';

const PermissionModal = ({ isOpen, onClose, taskId }) => {
  const [formData, setFormData] = useState({
    userId: '',
    canEdit: false,
    canDelete: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (!formData.userId.trim()) {
      setError('L\'ID de l\'utilisateur est obligatoire');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await taskService.grantPermission(taskId, parseInt(formData.userId), {
        canEdit: formData.canEdit,
        canDelete: formData.canDelete
      });
      setSuccess('Permissions accordées avec succès !');
      setFormData({
        userId: '',
        canEdit: false,
        canDelete: false
      });
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'attribution des permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      userId: '',
      canEdit: false,
      canDelete: false
    });
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gérer les permissions"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-alert">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            ID de l'utilisateur *
          </label>
          <input
            type="number"
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="input-field"
            placeholder="Entrez l'ID de l'utilisateur"
          />
          <p className="mt-1 text-sm text-gray-500">
            L'utilisateur doit connaître son ID pour que vous puissiez lui accorder des permissions.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Permissions à accorder :</h4>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="canEdit"
              name="canEdit"
              checked={formData.canEdit}
              onChange={handleChange}
              className="checkbox"
            />
            <label htmlFor="canEdit" className="ml-2 block text-sm text-gray-900">
              Peut modifier la tâche
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="canDelete"
              name="canDelete"
              checked={formData.canDelete}
              onChange={handleChange}
              className="checkbox"
            />
            <label htmlFor="canDelete" className="ml-2 block text-sm text-gray-900">
              Peut supprimer la tâche
            </label>
          </div>
        </div>

        <div className="yellow-alert">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Attention
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Une fois les permissions accordées, l'utilisateur pourra effectuer les actions sélectionnées sur cette tâche. Soyez prudent avec les permissions de suppression.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !formData.userId}
            className="btn-primary"
          >
            {loading ? 'Attribution...' : 'Accorder les permissions'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PermissionModal;