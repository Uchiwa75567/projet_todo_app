import React from 'react';
import Layout from '../components/layout/Layout';
import TaskForm from '../components/tasks/TaskForm';
import { useNavigate } from 'react-router-dom';

const TaskCreate = () => {
  const navigate = useNavigate();

  const handleTaskCreated = (newTask) => {
    // After creation, navigate to the tasks list or task detail page
    navigate('/tasks');
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Créer une nouvelle tâche</h1>
        <TaskForm onTaskCreated={handleTaskCreated} onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default TaskCreate;
