import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, logout, theme, toggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span>⚡</span> o2h Portal
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className="btn btn-secondary btn-sm">
                Dashboard
              </Link>
              <Link to="/add-task" className="btn btn-primary btn-sm">
                + Add Task
              </Link>
              <div className="nav-user">
                <span className="username-tag">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
