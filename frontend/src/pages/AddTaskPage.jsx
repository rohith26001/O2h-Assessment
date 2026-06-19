import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';

const AddTaskPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    setLoading(true);
    try {
      await taskService.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
      });
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create task. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Add New Task</h1>
          <p>Create a task to keep track of your project progress</p>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Cancel
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ maxWidth: '600px' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g. Implement Login Page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Initial Status
            </label>
            <select
              id="status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="form-input form-textarea"
              placeholder="Provide a detailed description of the task requirements... (min 20 characters)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <small className="form-hint">
              Characters: {description.length} / 20 minimum
            </small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Task...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskPage;
