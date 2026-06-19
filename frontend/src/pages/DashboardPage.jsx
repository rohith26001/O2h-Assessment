import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import DashboardStats from '../components/DashboardStats';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const limit = 5;

  const navigate = useNavigate();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Get stats
      const statsRes = await taskService.getStats();
      setStats(statsRes.data);

      // Get tasks
      const tasksRes = await taskService.getTasks({
        status: statusFilter,
        q: search,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      setTasks(tasksRes.data);
      setTotalPages(tasksRes.pagination.totalPages || 1);
      setTotalTasks(tasksRes.pagination.totalTasks || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task information');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    // Debounce search slightly to avoid excessive API requests
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchData]);

  // Handle status update
  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = 'In Progress';
    if (currentStatus === 'Pending') {
      nextStatus = 'In Progress';
    } else if (currentStatus === 'In Progress') {
      nextStatus = 'Completed';
    } else {
      return; // Already completed
    }

    try {
      await taskService.updateTaskStatus(id, nextStatus);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Handle delete
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(id);
      // Reset to page 1 if current page would be empty
      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Helpers for Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-completed">Completed</span>;
      case 'In Progress':
        return <span className="badge badge-progress">In Progress</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard</h1>
          <p>Track, manage, and complete your project activities</p>
        </div>
        <button onClick={() => navigate('/add-task')} className="btn btn-primary">
          + Add New Task
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Stats Section */}
      <DashboardStats stats={stats} />

      {/* Filter / Search Toolbar */}
      <div className="toolbar-card">
        <div className="toolbar-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="search-input">
              Search Tasks
            </label>
            <input
              id="search-input"
              type="text"
              className="form-input"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset page on filter change
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="status-filter">
              Filter by Status
            </label>
            <select
              id="status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="sort-by">
              Sort By
            </label>
            <select
              id="sort-by"
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
                setPage(1);
              }}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setSortBy('created_at');
              setSortOrder('desc');
              setPage(1);
            }}
            className="btn btn-secondary"
            style={{ height: '46px' }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Task List Section */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <p>Fetching your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No tasks found</h3>
          <p>
            {search || statusFilter !== 'All'
              ? 'Try modifying your filters or search keywords to find what you are looking for.'
              : 'You do not have any tasks created yet. Get started by clicking the button below.'}
          </p>
          {!search && statusFilter === 'All' && (
            <button onClick={() => navigate('/add-task')} className="btn btn-primary">
              Create Your First Task
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="tasks-container">
            {tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  {renderStatusBadge(task.status)}
                </div>
                <p className="task-desc">{task.description}</p>
                <div className="task-footer">
                  <div className="task-meta">
                    <span>
                      📅 Created: {new Date(task.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="task-actions">
                    {task.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(task._id, task.status)}
                        className="btn btn-secondary btn-sm"
                      >
                        {task.status === 'Pending' ? 'Start Progress ⚙️' : 'Complete Task ✅'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Showing {Math.min((page - 1) * limit + 1, totalTasks)} - {Math.min(page * limit, totalTasks)} of {totalTasks} tasks
            </div>
            <div className="pagination-buttons">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="page-btn"
                title="Previous Page"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setPage(idx + 1)}
                  className={`page-btn ${page === idx + 1 ? 'active' : ''}`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="page-btn"
                title="Next Page"
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
