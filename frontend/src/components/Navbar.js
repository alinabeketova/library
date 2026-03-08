import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    const role = user.role?.toLowerCase() || '';
    
    if (role === 'админ') {
      return '/admin';
    }
    if (role === 'библиотекарь') {
      return '/librarian';
    }
    
    return '/profile';
  };

  const getDashboardText = () => {
    if (!user) return 'Вход';
    
    const role = user.role?.toLowerCase() || '';
    
    if (role === 'админ') {
      return 'Панель админа';
    } else if (role === 'библиотекарь') {
      return 'Панель библиотекаря';
    }
    return 'Профиль';
  };

  return (
    <nav className="Navbar">
      <div className="Navbar-container">
        <Link to="/" className="Navbar-logo">
          <i className="fas fa-book"></i> Библиотека
        </Link>
        <ul className="Navbar-menu">
          <li className="Navbar-item">
            <Link to="/" className="Navbar-link">Главная</Link>
          </li>
          <li className="Navbar-item">
            <Link to="/search" className="Navbar-link">Поиск книг</Link>
          </li>
          {!user && (
            <li className="Navbar-item">
              <Link to="/registration" className="Navbar-link Navbar-link--highlight">
                <i className="fas fa-user-plus"></i> Регистрация
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li className="Navbar-item">
                <Link to={getDashboardLink()} className="Navbar-link Navbar-link--active">
                  {getDashboardText()}
                </Link>
              </li>
              <li className="Navbar-item">
                <button onClick={handleLogout} className="Navbar-btnLogout">Выйти</button>
              </li>
            </>
          ) : (
            <li className="Navbar-item">
              <Link to="/login" className="Navbar-link Navbar-link--primary">Вход</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;