import { useState, useRef, useEffect } from 'react';
import { taskService } from '../../services/taskService';

const TaskForm = ({ task = null, onTaskCreated, onTaskUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    startDate: task?.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
    endDate: task?.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
    completed: task?.completed || false,
    image: task?.image || null,
    file: task?.file || null,
    voice: task?.voice || null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Log l'état initial du formulaire
  console.log('État initial du formulaire:', {
    taskId: task?.id,
    formData,
    isEdit: !!task
  });

  const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleChange = async (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (files && name === 'image') {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const resizedBlob = await resizeImage(file);
        setFormData({
          ...formData,
          [name]: resizedBlob
        });
      } else {
        setFormData({
          ...formData,
          [name]: file
        });
      }
    } else if (files) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });
        setFormData(prev => ({ ...prev, voice: file }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      setError('Erreur lors de l\'accès au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return false;
    }
    if (
      formData.image &&
      (formData.image instanceof Blob || formData.image instanceof File) &&
      !formData.image.type.startsWith('image/')
    ) {
      setError('Le fichier sélectionné n\'est pas une image valide');
      return false;
    }
    if (
      formData.voice &&
      (formData.voice instanceof Blob || formData.voice instanceof File) &&
      !formData.voice.type.startsWith('audio/')
    ) {
      setError('Le fichier audio sélectionné n\'est pas valide');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // 2. Préparation des données
      const dataToSend = {
        title: formData.title.trim(),
        description: (formData.description || '').trim(),
        completed: Boolean(formData.completed)
      };

      // Pour la création, envoyer tous les fichiers
      if (!task) {
        if (formData.image) dataToSend.image = formData.image;
        if (formData.file) dataToSend.file = formData.file;
        if (formData.voice) dataToSend.voice = formData.voice;
      } else {
        // Pour la modification, envoyer seulement les nouveaux fichiers (Blob/File) ou null pour supprimer
        if (formData.image instanceof Blob || formData.image instanceof File) {
          dataToSend.image = formData.image;
        } else if (formData.image === null && task.image) {
          dataToSend.image = null; // Supprimer l'image existante
        }

        if (formData.file instanceof Blob || formData.file instanceof File) {
          dataToSend.file = formData.file;
        } else if (formData.file === null && task.file) {
          dataToSend.file = null; // Supprimer le fichier existant
        }

        if (formData.voice instanceof Blob || formData.voice instanceof File) {
          dataToSend.voice = formData.voice;
        } else if (formData.voice === null && task.voice) {
          dataToSend.voice = null; // Supprimer le message vocal existant
        }
      }

      console.log('Données à envoyer:', {
        taskId: task?.id,
        data: {
          ...dataToSend,
          image: dataToSend.image?.name,
          file: dataToSend.file?.name
        }
      });

      // 3. Envoi au serveur
      let serverResponse;
      if (task) {
        console.log(`Mise à jour de la tâche ${task.id}...`);
        serverResponse = await taskService.updateTask(task.id, dataToSend);
      } else {
        console.log('Création d\'une nouvelle tâche...');
        serverResponse = await taskService.createTask(dataToSend);
      }

      // 4. Validation de la réponse
      console.log('Réponse du serveur:', serverResponse);
      
      if (!serverResponse?.id) {
        throw new Error('La réponse du serveur est incomplète ou invalide');
      }

      // 5. Notification du succès
      if (task) {
        console.log('Tâche mise à jour avec succès:', serverResponse);
        onTaskUpdated?.(serverResponse);
      } else {
        console.log('Nouvelle tâche créée avec succès:', serverResponse);
        onTaskCreated?.(serverResponse);
      }
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });

      // Utiliser le message d'erreur détaillé du backend si disponible
      const backendMessage = error.response?.data?.message || error.response?.data?.error;
      setError(backendMessage || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
      </h3>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* Titre */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Titre *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field"
          placeholder="Entrez le titre de la tâche"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
          placeholder="Décrivez votre tâche (optionnel)"
        />
      </div>

      {/* Date de début */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Date de début
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      {/* Date de fin */}
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
          Date de fin
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      {/* Statut de completion */}
      {/* <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          name="completed"
          checked={formData.completed}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
          Marquer comme terminé
        </label>
      </div> */}

      {/* Upload d'image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image
        </label>
        <div className="mt-1 flex flex-col border border-gray-300 rounded-md p-2">
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="file-input"
          />
          {formData.image && (
            <div className="mt-2 flex items-center justify-between">
              <img
                src={
                  formData.image instanceof Blob || formData.image instanceof File
                    ? URL.createObjectURL(formData.image)
                    : typeof formData.image === 'string'
                    ? formData.image
                    : ''
                }
                alt="Aperçu de l'image"
                className="image-preview"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                className="ml-2 btn-danger-small"
              >
                Supprimer
              </button>
            </div>
          )}
          {!formData.image && task?.image && (
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Image actuelle: {task.image.split('/').pop()}
              </p>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                className="btn-danger-small"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload de fichier */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Fichier joint
        </label>
        <div className="mt-1 flex flex-col border border-gray-300 rounded-md p-2">
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleChange}
            className="file-input"
          />
          {formData.file && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-700 break-all">
                {formData.file.name}
              </p>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                className="ml-2 btn-danger-small"
              >
                Supprimer
              </button>
            </div>
          )}
          {!formData.file && task?.file && (
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Fichier actuel: {task.file.split('/').pop()}
              </p>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                className="btn-danger-small"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enregistrement vocal */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Message vocal (max 30 secondes)
        </label>
        <div className="mt-1 flex flex-col border border-gray-300 rounded-md p-2">
          {!formData.voice ? (
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
              </button>
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">
                    Enregistrement: {recordingTime}s / 30s
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Message vocal enregistré</span>
                {(() => {
                  console.log('DEBUG formData.voice type:', typeof formData.voice, 'value:', formData.voice);
                  if (
                    formData.voice &&
                    (formData.voice instanceof Blob || formData.voice instanceof File)
                  ) {
                    return (
                      <audio controls className="audio-player">
                        <source src={URL.createObjectURL(formData.voice)} type="audio/wav" />
                      </audio>
                    );
                  } else if (typeof formData.voice === 'string' && formData.voice.trim() !== '') {
                    return (
                      <audio controls className="audio-player">
                        <source src={formData.voice} type="audio/wav" />
                      </audio>
                    );
                  } else {
                    return null;
                  }
                })()}
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, voice: null }))}
                className="btn-danger-small"
              >
                Supprimer
              </button>
            </div>
          )}
          {!formData.voice && task?.voice && (
            <p className="mt-1 text-sm text-gray-500">
              Message vocal actuel: {task.voice}
            </p>
          )}
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Sauvegarde...' : (task ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;