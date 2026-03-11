import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ email, password });
      const response = await fetch(`http://127.0.0.1:8001/login?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('Неверный формат данных');
        }
        throw new Error('Неверный email или пароль');
      }

      const data = await response.json();
      
      login(data.token, data.role, email);
      
      switch(data.role) {
        case 'библиотекарь':
          navigate('/librarian');
          break;
        case 'студент':
          navigate('/profile');
          break;
        case 'админ':
          navigate('/admin');
          break;
        default:
          navigate('/profile');
      }
      
    } catch (err) {
      setError(err.message || 'Ошибка входа в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="LoginPage">
      <div className="LoginPage-container">
        <div className="LoginPage-header">
          <h2 className="LoginPage-title">Вход в систему</h2>
          <p className="LoginPage-subtitle">Библиотечная информационная система</p>
        </div>
        
        {error && (
          <div className="LoginPage-error">
            <i className="fas fa-exclamation-circle"></i>
            <span className="LoginPage-errorText">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="LoginPage-form">
          <div className="LoginPage-formGroup">
            <label htmlFor="email" className="LoginPage-label">Email</label>
            <div className="LoginPage-inputWrapper">
              <i className="fas fa-envelope LoginPage-inputIcon"></i>
              <input
                type="email"
                id="email"
                className="LoginPage-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="LoginPage-formGroup">
            <label htmlFor="password" className="LoginPage-label">Пароль</label>
            <div className="LoginPage-inputWrapper">
              <i className="fas fa-lock LoginPage-inputIcon"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="LoginPage-input LoginPage-input--password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите ваш пароль"
                disabled={loading}
              />
              <button 
                type="button" 
                className="LoginPage-togglePassword"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="LoginPage-btn LoginPage-btn--primary LoginPage-btn--block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="LoginPage-spinner"></span>
                Вход...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Войти
              </>
            )}
          </button>
        </form>
        
        <div className="LoginPage-footer">
          <p className="LoginPage-hint">
            Нет аккаунта? <a href="/register" className="LoginPage-link">Зарегистрироваться</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;