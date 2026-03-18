// pages/Registration.js
import React, { useState } from 'react';
import './Registration.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    address: '',
    email: '',
    passport_number: '',
    password: '',
    confirm_password: '',
    role_id: 1,
    secret_code: ''  // Поле для секретного кода от администратора
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Функция проверки кода (загружает коды из localStorage)
  const validateSecretCode = (code) => {
    try {
      const savedCodes = localStorage.getItem('registration_codes');
      if (!savedCodes) return false;
      
      const codes = JSON.parse(savedCodes);
      const foundCode = codes.find(c => c.code === code && !c.used);
      
      if (!foundCode) return false;
      
      // Проверяем срок действия
      const now = new Date();
      const expiresAt = new Date(foundCode.expires_at);
      
      if (expiresAt < now) return false;
      
      return true;
    } catch (err) {
      console.error('Ошибка проверки кода:', err);
      return false;
    }
  };

  // Функция пометки кода как использованного
  const markCodeAsUsed = (code) => {
    try {
      const savedCodes = localStorage.getItem('registration_codes');
      if (!savedCodes) return;
      
      const codes = JSON.parse(savedCodes);
      const updatedCodes = codes.map(c => 
        c.code === code && !c.used
          ? { 
              ...c, 
              used: true, 
              used_at: new Date().toISOString(),
              used_by: formData.email // Запоминаем, кто использовал
            }
          : c
      );
      
      localStorage.setItem('registration_codes', JSON.stringify(updatedCodes));
    } catch (err) {
      console.error('Ошибка обновления кода:', err);
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 4 || password.length > 16) {
      errors.push('Пароль должен содержать от 4 до 16 символов');
    }
    
    const forbiddenChars = /[*&{}|+]/;
    if (forbiddenChars.test(password)) {
      errors.push('Пароль не должен содержать символы: * & { } | +');
    }
    
    const hasUpperCase = /[A-ZА-ЯЁ]/;
    if (!hasUpperCase.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }
    
    const hasDigit = /\d/;
    if (!hasDigit.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру');
    }
    
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Имя обязательно';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Фамилия обязательна';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Дата рождения обязательна';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        newErrors.date_of_birth = 'Вам должно быть не менее 16 лет';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.passport_number.trim()) {
      newErrors.passport_number = 'Номер паспорта обязателен';
    } else if (!/^\d{10}$/.test(formData.passport_number.replace(/\s/g, ''))) {
      newErrors.passport_number = 'Введите 10 цифр паспорта';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors;
      }
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }

    // Проверка секретного кода
    if (!formData.secret_code) {
      newErrors.secret_code = 'Введите секретный код, полученный от администратора';
    } else if (!validateSecretCode(formData.secret_code)) {
      newErrors.secret_code = 'Недействительный или уже использованный код';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        email: formData.email,
        passport_number: formData.passport_number.replace(/\s/g, ''),
        password: formData.password,
        role_id: formData.role_id
      });
      
      if (formData.middle_name.trim()) {
        params.append('middle_name', formData.middle_name);
      }
      
      if (formData.address.trim()) {
        params.append('address', formData.address);
      }
      
      const response = await fetch(`http://127.0.0.1:8001/user?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Ошибка сервера: ${response.status}`);
      }
      
      // Если регистрация успешна, помечаем код как использованный
      markCodeAsUsed(formData.secret_code);
      
      setSuccessMessage('Регистрация успешно завершена! Теперь вы можете войти в систему.');
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        address: '',
        email: '',
        passport_number: '',
        password: '',
        confirm_password: '',
        role_id: 1,
        secret_code: ''
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Произошла ошибка при регистрации. Попробуйте позже.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatPassport = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
    return cleaned;
  };

  const handlePassportChange = (e) => {
    const formatted = formatPassport(e.target.value);
    setFormData(prev => ({ ...prev, passport_number: formatted }));
    if (errors.passport_number) {
      setErrors(prev => ({ ...prev, passport_number: '' }));
    }
  };

  return (
    <div className="Registration">
      <div className="Registration-card">
        <div className="Registration-header">
          <h1 className="Registration-title">Регистрация читателя</h1>
          <p className="Registration-subtitle">Создайте аккаунт для доступа к библиотечной системе</p>
        </div>

        {successMessage && (
          <div className="Registration-successMessage">
            <span className="Registration-successIcon">✓</span>
            <span className="Registration-successText">{successMessage}</span>
          </div>
        )}

        {errors.submit && (
          <div className="Registration-errorBanner">
            <span className="Registration-errorIcon">⚠</span>
            <span className="Registration-errorText">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="Registration-form">
          {/* Секретный код от администратора */}
          <div className="Registration-formGroup Registration-formGroup--fullWidth">
            <label htmlFor="secret_code" className="Registration-label">
              Секретный код от библиотеки *
            </label>
            <input
              type="text"
              id="secret_code"
              name="secret_code"
              value={formData.secret_code}
              onChange={handleChange}
              placeholder="Введите код, полученный от администратора (например: LIB-XXXX-XXXX-XXXX)"
              className={`Registration-input ${errors.secret_code ? 'Registration-input--error' : ''}`}
            />
            {errors.secret_code && (
              <span className="Registration-errorText">{errors.secret_code}</span>
            )}
            <div className="Registration-codeInfo">
              <i className="fas fa-info-circle"></i>
              <span>
                Код можно получить у администратора библиотеки. 
                Каждый код можно использовать только один раз.
              </span>
            </div>
          </div>

          <div className="Registration-divider"></div>

          {/* Остальные поля формы без изменений */}
          <div className="Registration-formRow">
            <div className="Registration-formGroup">
              <label htmlFor="last_name" className="Registration-label">Фамилия *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Иванов"
                className={`Registration-input ${errors.last_name ? 'Registration-input--error' : ''}`}
              />
              {errors.last_name && <span className="Registration-errorText">{errors.last_name}</span>}
            </div>

            <div className="Registration-formGroup">
              <label htmlFor="first_name" className="Registration-label">Имя *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Иван"
                className={`Registration-input ${errors.first_name ? 'Registration-input--error' : ''}`}
              />
              {errors.first_name && <span className="Registration-errorText">{errors.first_name}</span>}
            </div>
          </div>

          <div className="Registration-formRow">
            <div className="Registration-formGroup">
              <label htmlFor="middle_name" className="Registration-label">Отчество</label>
              <input
                type="text"
                id="middle_name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                placeholder="Иванович"
                className="Registration-input"
              />
              <span className="Registration-hint">Необязательное поле</span>
            </div>

            <div className="Registration-formGroup">
              <label htmlFor="date_of_birth" className="Registration-label">Дата рождения *</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`Registration-input ${errors.date_of_birth ? 'Registration-input--error' : ''}`}
              />
              {errors.date_of_birth && <span className="Registration-errorText">{errors.date_of_birth}</span>}
            </div>
          </div>

          <div className="Registration-formGroup Registration-formGroup--fullWidth">
            <label htmlFor="address" className="Registration-label">Адрес</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
              className="Registration-input"
            />
            <span className="Registration-hint">Необязательное поле</span>
          </div>

          <div className="Registration-formGroup Registration-formGroup--fullWidth">
            <label htmlFor="email" className="Registration-label">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@university.ru"
              className={`Registration-input ${errors.email ? 'Registration-input--error' : ''}`}
            />
            {errors.email && <span className="Registration-errorText">{errors.email}</span>}
          </div>

          <div className="Registration-formGroup Registration-formGroup--fullWidth">
            <label htmlFor="passport_number" className="Registration-label">Номер паспорта *</label>
            <input
              type="text"
              id="passport_number"
              name="passport_number"
              value={formData.passport_number}
              onChange={handlePassportChange}
              placeholder="1234 567890"
              maxLength="11"
              className={`Registration-input ${errors.passport_number ? 'Registration-input--error' : ''}`}
            />
            {errors.passport_number && <span className="Registration-errorText">{errors.passport_number}</span>}
            <span className="Registration-hint">Введите 10 цифр серии и номера паспорта</span>
          </div>

          <div className="Registration-formRow">
            <div className="Registration-formGroup Registration-formGroup--password">
              <label htmlFor="password" className="Registration-label">Пароль *</label>
              <div className="Registration-passwordWrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 4 символа"
                  className={`Registration-input ${errors.password ? 'Registration-input--error' : ''}`}
                />
                <button 
                  type="button" 
                  className="Registration-togglePassword"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && Array.isArray(errors.password) ? (
                <ul className="Registration-errorList">
                  {errors.password.map((err, index) => (
                    <li key={index} className="Registration-errorText">{err}</li>
                  ))}
                </ul>
              ) : errors.password ? (
                <span className="Registration-errorText">{errors.password}</span>
              ) : null}
              <span className="Registration-hint">4-16 символов, заглавная буква, цифра, без * &amp; {'{ }'} | +</span>
            </div>

            <div className="Registration-formGroup Registration-formGroup--password">
              <label htmlFor="confirm_password" className="Registration-label">Подтверждение *</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Повторите пароль"
                className={`Registration-input ${errors.confirm_password ? 'Registration-input--error' : ''}`}
              />
              {errors.confirm_password && <span className="Registration-errorText">{errors.confirm_password}</span>}
            </div>
          </div>

          <div className="Registration-formFooter">
            <p className="Registration-requiredFields">* Обязательные поля</p>
            <button 
              type="submit" 
              className="Registration-submitBtn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="Registration-spinner"></span>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </div>
        </form>

        <div className="Registration-loginLink">
          Уже есть аккаунт? <a href="/login" className="Registration-link">Войти</a>
        </div>
      </div>
    </div>
  );
};

export default Registration;